// supabase/functions/threat-enrichment/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface EnrichmentRequest {
  ioc_id: string
  sources?: string[] // ['virustotal', 'shodan', 'alienvault', 'abuseipdb']
  force_refresh?: boolean
}

interface EnrichmentResult {
  source: string
  success: boolean
  data?: any
  error?: string
  timestamp: string
}

// Rate limiting simple en memoria
const rateLimits = new Map<string, number[]>()

function checkRateLimit(userId: string, maxRequests = 10, windowMs = 60000): boolean {
  const now = Date.now()
  const userRequests = rateLimits.get(userId) || []
  
  // Limpiar requests antiguos
  const validRequests = userRequests.filter(time => now - time < windowMs)
  
  if (validRequests.length >= maxRequests) {
    return false
  }
  
  validRequests.push(now)
  rateLimits.set(userId, validRequests)
  return true
}

function validateIoCValue(value: string, type: string): boolean {
  switch (type) {
    case 'ip':
      return /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(value)
    case 'domain':
      return /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/.test(value)
    case 'url':
      try { new URL(value); return true } catch { return false }
    case 'hash':
      return /^[a-fA-F0-9]{32,128}$/.test(value)
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    default:
      return false
  }
}

serve(async (req) => {
  const startTime = Date.now()
  
  try {
    // Validar método HTTP
    if (req.method !== 'POST') {
      return new Response('Método no permitido', { status: 405 })
    }

    // Verificar autenticación
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response('Token de autorización requerido', { status: 401 })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Verificar usuario
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('Error de autenticación:', authError)
      return new Response('No autorizado', { status: 401 })
    }

    // Verificar rate limiting
    if (!checkRateLimit(user.id, 20, 60000)) { // 20 requests por minuto
      return new Response('Demasiadas solicitudes, intente más tarde', { status: 429 })
    }

    // Parsear y validar request body
    let requestData: EnrichmentRequest
    try {
      requestData = await req.json()
    } catch (error) {
      return new Response('JSON inválido en el cuerpo de la solicitud', { status: 400 })
    }

    const { ioc_id, sources = ['virustotal'], force_refresh = false } = requestData

    // Validar parámetros
    if (!ioc_id || typeof ioc_id !== 'string') {
      return new Response('ioc_id es requerido y debe ser una cadena', { status: 400 })
    }

    if (!Array.isArray(sources) || sources.length === 0) {
      return new Response('sources debe ser un array no vacío', { status: 400 })
    }

    // Validar fuentes soportadas
    const supportedSources = ['virustotal', 'shodan', 'abuseipdb', 'alienvault']
    const invalidSources = sources.filter(s => !supportedSources.includes(s))
    if (invalidSources.length > 0) {
      return new Response(
        `Fuentes no soportadas: ${invalidSources.join(', ')}. Soportadas: ${supportedSources.join(', ')}`,
        { status: 400 }
      )
    }

    // Obtener el IoC con verificación de permisos (RLS automático)
    const { data: ioc, error: iocError } = await supabase
      .from('iocs')
      .select('*')
      .eq('id', ioc_id)
      .single()

    if (iocError) {
      console.error('Error obteniendo IoC:', iocError)
      if (iocError.code === 'PGRST116') {
        return new Response('IoC no encontrado o sin permisos', { status: 404 })
      }
      return new Response('Error interno obteniendo IoC', { status: 500 })
    }

    if (!ioc) {
      return new Response('IoC no encontrado', { status: 404 })
    }

    // Validar formato del IoC
    if (!validateIoCValue(ioc.value, ioc.type)) {
      return new Response(`Valor de IoC inválido para el tipo ${ioc.type}`, { status: 400 })
    }

    console.log(`Enriqueciendo IoC ${ioc_id} (${ioc.type}: ${ioc.value}) con fuentes: ${sources.join(', ')}`)

    // Verificar si ya existe enriquecimiento reciente (últimas 24h)
    if (!force_refresh) {
      const { data: existingRefs } = await supabase
        .from('ioc_references')
        .select('reference_type, created_at')
        .eq('ioc_id', ioc_id)
        .in('reference_type', sources)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

      if (existingRefs && existingRefs.length > 0) {
        const recentSources = existingRefs.map(ref => ref.reference_type)
        return new Response(JSON.stringify({
          message: 'Enriquecimiento reciente encontrado',
          recent_sources: recentSources,
          suggestion: 'Use force_refresh=true para forzar actualización'
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      }
    }

    // Realizar enriquecimiento con múltiples fuentes
    const enrichmentPromises = sources.map(source => enrichWithSource(source, ioc.value, ioc.type))
    const enrichmentResults = await Promise.allSettled(enrichmentPromises)

    const results: EnrichmentResult[] = []
    let confidenceBoost = 0
    let totalDetections = 0
    let totalScanned = 0

    // Procesar resultados
    for (let i = 0; i < enrichmentResults.length; i++) {
      const source = sources[i]
      const result = enrichmentResults[i]

      if (result.status === 'fulfilled' && result.value) {
        const enrichmentData = result.value
        results.push({
          source,
          success: true,
          data: enrichmentData,
          timestamp: new Date().toISOString()
        })

        // Calcular boost de confianza
        if (enrichmentData.positives !== undefined && enrichmentData.total !== undefined) {
          totalDetections += enrichmentData.positives
          totalScanned += enrichmentData.total
        }

        // Agregar referencias automáticamente
        try {
          await addEnrichmentReference(supabase, ioc_id, source, enrichmentData, user.id)
        } catch (error) {
          console.error(`Error agregando referencia para ${source}:`, error)
        }
      } else {
        const errorMsg = result.status === 'rejected' ? result.reason : 'Error desconocido'
        results.push({
          source,
          success: false,
          error: errorMsg.toString(),
          timestamp: new Date().toISOString()
        })
        console.error(`Error enriqueciendo con ${source}:`, errorMsg)
      }
    }

    // Actualizar confianza del IoC basada en detecciones
    if (totalScanned > 0) {
      const detectionRatio = totalDetections / totalScanned
      confidenceBoost = Math.round(detectionRatio * 30) // Máximo 30% de boost
      
      const newConfidence = Math.min(100, Math.max(ioc.confidence, ioc.confidence + confidenceBoost))
      
      if (newConfidence !== ioc.confidence) {
        await supabase
          .from('iocs')
          .update({ 
            confidence: newConfidence,
            updated_at: new Date().toISOString()
          })
          .eq('id', ioc_id)
      }
    }

    // Log de auditoría
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'ENRICH',
      resource_type: 'ioc',
      resource_id: ioc_id,
      new_values: {
        sources,
        results: results.map(r => ({ source: r.source, success: r.success })),
        confidence_boost: confidenceBoost,
        detections: `${totalDetections}/${totalScanned}`,
        processing_time_ms: Date.now() - startTime
      }
    })

    const successfulSources = results.filter(r => r.success).length
    const response = {
      ioc_id,
      ioc_value: ioc.value,
      ioc_type: ioc.type,
      enrichment_results: results,
      summary: {
        total_sources: sources.length,
        successful_sources: successfulSources,
        failed_sources: sources.length - successfulSources,
        confidence_boost: confidenceBoost,
        new_confidence: totalScanned > 0 ? Math.min(100, Math.max(ioc.confidence, ioc.confidence + confidenceBoost)) : ioc.confidence,
        total_detections: totalDetections,
        total_scanned: totalScanned,
        processing_time_ms: Date.now() - startTime
      },
      updated_at: new Date().toISOString()
    }

    return new Response(JSON.stringify(response), {
      headers: { 
        'Content-Type': 'application/json',
        'X-Processing-Time': `${Date.now() - startTime}ms`
      }
    })

  } catch (error) {
    console.error('Error general en threat-enrichment:', error)
    
    return new Response(JSON.stringify({
      error: 'Error interno del servidor',
      message: 'Error procesando enriquecimiento',
      processing_time_ms: Date.now() - startTime
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})

// Función para enriquecer con diferentes fuentes
async function enrichWithSource(source: string, value: string, type: string) {
  switch (source) {
    case 'virustotal':
      return await enrichWithVirusTotal(value, type)
    case 'abuseipdb':
      return await enrichWithAbuseIPDB(value, type)
    case 'shodan':
      return await enrichWithShodan(value, type)
    case 'alienvault':
      return await enrichWithAlienVault(value, type)
    default:
      throw new Error(`Fuente no soportada: ${source}`)
  }
}

// VirusTotal API
async function enrichWithVirusTotal(value: string, type: string) {
  const apiKey = Deno.env.get('VIRUSTOTAL_API_KEY')
  if (!apiKey) {
    throw new Error('VIRUSTOTAL_API_KEY no configurada')
  }

  try {
    let endpoint = ''
    let params = new URLSearchParams({ apikey: apiKey })

    switch (type) {
      case 'ip':
        endpoint = 'https://www.virustotal.com/vtapi/v2/ip-address/report'
        params.append('ip', value)
        break
      case 'domain':
        endpoint = 'https://www.virustotal.com/vtapi/v2/domain/report'
        params.append('domain', value)
        break
      case 'url':
        endpoint = 'https://www.virustotal.com/vtapi/v2/url/report'
        params.append('resource', value)
        break
      case 'hash':
        endpoint = 'https://www.virustotal.com/vtapi/v2/file/report'
        params.append('resource', value)
        break
      default:
        throw new Error(`Tipo ${type} no soportado por VirusTotal`)
    }

    const response = await fetch(`${endpoint}?${params.toString()}`, {
      headers: { 'User-Agent': 'FortiGate IoC Manager' }
    })

    if (!response.ok) {
      throw new Error(`VirusTotal API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    if (data.response_code === 0) {
      throw new Error('Recurso no encontrado en VirusTotal')
    }

    return {
      positives: data.positives || 0,
      total: data.total || 0,
      scan_date: data.scan_date,
      permalink: data.permalink,
      detected_urls: data.detected_urls?.slice(0, 5), // Limitar para evitar respuestas grandes
      resolutions: data.resolutions?.slice(0, 5),
      response_code: data.response_code
    }
  } catch (error) {
    console.error('Error VirusTotal:', error)
    throw error
  }
}

// AbuseIPDB API
async function enrichWithAbuseIPDB(value: string, type: string) {
  if (type !== 'ip') {
    throw new Error('AbuseIPDB solo soporta direcciones IP')
  }

  const apiKey = Deno.env.get('ABUSEIPDB_API_KEY')
  if (!apiKey) {
    throw new Error('ABUSEIPDB_API_KEY no configurada')
  }

  try {
    const response = await fetch(`https://api.abuseipdb.com/api/v2/check?ipAddress=${value}&maxAgeInDays=90&verbose`, {
      headers: {
        'Key': apiKey,
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`AbuseIPDB API error: ${response.status}`)
    }

    const data = await response.json()
    
    return {
      abuse_confidence: data.data?.abuseConfidencePercentage || 0,
      is_whitelisted: data.data?.isWhitelisted || false,
      country_code: data.data?.countryCode,
      usage_type: data.data?.usageType,
      isp: data.data?.isp,
      total_reports: data.data?.totalReports || 0,
      last_reported: data.data?.lastReportedAt
    }
  } catch (error) {
    console.error('Error AbuseIPDB:', error)
    throw error
  }
}

// Shodan API (básico)
async function enrichWithShodan(value: string, type: string) {
  if (type !== 'ip') {
    throw new Error('Shodan solo soporta direcciones IP')
  }

  const apiKey = Deno.env.get('SHODAN_API_KEY')
  if (!apiKey) {
    throw new Error('SHODAN_API_KEY no configurada')
  }

  try {
    const response = await fetch(`https://api.shodan.io/shodan/host/${value}?key=${apiKey}`)

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('IP no encontrada en Shodan')
      }
      throw new Error(`Shodan API error: ${response.status}`)
    }

    const data = await response.json()
    
    return {
      country: data.country_name,
      city: data.city,
      org: data.org,
      isp: data.isp,
      ports: data.ports?.slice(0, 10), // Limitar puertos mostrados
      hostnames: data.hostnames?.slice(0, 5),
      vulnerabilities: data.vulns?.slice(0, 5),
      last_update: data.last_update
    }
  } catch (error) {
    console.error('Error Shodan:', error)
    throw error
  }
}

// AlienVault OTX (básico)
async function enrichWithAlienVault(value: string, type: string) {
  const apiKey = Deno.env.get('ALIENVAULT_API_KEY')
  
  try {
    let endpoint = ''
    switch (type) {
      case 'ip':
        endpoint = `https://otx.alienvault.com/api/v1/indicators/IPv4/${value}/general`
        break
      case 'domain':
        endpoint = `https://otx.alienvault.com/api/v1/indicators/domain/${value}/general`
        break
      case 'url':
        endpoint = `https://otx.alienvault.com/api/v1/indicators/url/${encodeURIComponent(value)}/general`
        break
      case 'hash':
        endpoint = `https://otx.alienvault.com/api/v1/indicators/file/${value}/general`
        break
      default:
        throw new Error(`Tipo ${type} no soportado por AlienVault`)
    }

    const headers: Record<string, string> = {}
    if (apiKey) {
      headers['X-OTX-API-KEY'] = apiKey
    }

    const response = await fetch(endpoint, { headers })

    if (!response.ok) {
      throw new Error(`AlienVault API error: ${response.status}`)
    }

    const data = await response.json()
    
    return {
      pulse_count: data.pulse_info?.count || 0,
      pulses: data.pulse_info?.pulses?.slice(0, 3).map((pulse: any) => ({
        name: pulse.name,
        created: pulse.created,
        author: pulse.author_name
      })) || [],
      reputation: data.reputation || 0,
      country: data.country,
      city: data.city
    }
  } catch (error) {
    console.error('Error AlienVault:', error)
    throw error
  }
}

// Función auxiliar para agregar referencias
async function addEnrichmentReference(supabase: any, iocId: string, source: string, data: any, userId: string) {
  let referenceUrl = ''
  let description = ''

  switch (source) {
    case 'virustotal':
      referenceUrl = data.permalink || `https://www.virustotal.com/gui/search/${data.resource || 'unknown'}`
      description = `VirusTotal: ${data.positives || 0}/${data.total || 0} detecciones`
      break
    case 'abuseipdb':
      referenceUrl = `https://www.abuseipdb.com/check/[IP]`
      description = `AbuseIPDB: ${data.abuse_confidence}% confianza de abuso, ${data.total_reports} reportes`
      break
    case 'shodan':
      referenceUrl = `https://www.shodan.io/host/[IP]`
      description = `Shodan: ${data.ports?.length || 0} puertos abiertos`
      break
    case 'alienvault':
      referenceUrl = `https://otx.alienvault.com/indicator/[TYPE]/[VALUE]`
      description = `AlienVault OTX: ${data.pulse_count} pulsos`
      break
  }

  if (referenceUrl && description) {
    await supabase
      .from('ioc_references')
      .upsert({
        ioc_id: iocId,
        reference_url: referenceUrl,
        reference_type: source,
        description,
        created_by: userId
      }, { 
        onConflict: 'ioc_id,reference_url',
        ignoreDuplicates: false 
      })
  }
}