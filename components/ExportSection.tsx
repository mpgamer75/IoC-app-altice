// components/ExportSection.tsx
'use client';

import { useState } from 'react';
import { IoCService } from '@/lib/ioc';
import { ExportData } from '@/types';

interface ExportSectionProps {
  theme: 'light' | 'dark';
}

export default function ExportSection({ theme }: ExportSectionProps) {
  const [selectedFormat, setSelectedFormat] = useState<'txt' | 'json' | 'csv'>('json');
  const [loading, setLoading] = useState(false);
  const [exportedData, setExportedData] = useState<ExportData | null>(null);

  const handleExport = async () => {
    setLoading(true);
    try {
      const data = await IoCService.exportIoCs(selectedFormat);
      setExportedData(data);
    } catch (error) {
      console.error('Error en la exportación:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = () => {
    if (!exportedData) return;

    const content = IoCService.generateExportContent(exportedData);
    const blob = new Blob([content], { 
      type: selectedFormat === 'json' ? 'application/json' : 'text/plain' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fortigate_iocs_${new Date().toISOString().split('T')[0]}.${selectedFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const previewContent = exportedData ? IoCService.generateExportContent(exportedData) : '';

  return (
    <div className="space-y-6">
      <div className={`card animate-fade-in ${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
          Exportación de IoCs
        </h2>
        <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Exporte sus indicadores de compromiso para FortiGate en diferentes formatos.
        </p>

        {/* Selección de formato */}
        <div className="mb-6">
          <h3 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Formato de exportación
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div 
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                selectedFormat === 'txt' 
                ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                : theme === 'dark'
                  ? 'border-gray-600 hover:border-gray-500 bg-gray-700'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
              onClick={() => setSelectedFormat('txt')}
            >
              <div className="flex items-center mb-2">
                <input
                  type="radio"
                  checked={selectedFormat === 'txt'}
                  readOnly
                  className="text-red-600"
                />
                <span className={`ml-2 font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>TXT</span>
              </div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Lista simple de valores IoC, compatible con la mayoría de sistemas.
              </p>
              <div className={`mt-2 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Ejemplo: Una IP/dominio por línea
              </div>
            </div>

            <div 
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                selectedFormat === 'json' 
                ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                : theme === 'dark'
                  ? 'border-gray-600 hover:border-gray-500 bg-gray-700'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
              onClick={() => setSelectedFormat('json')}
            >
              <div className="flex items-center mb-2">
                <input
                  type="radio"
                  checked={selectedFormat === 'json'}
                  readOnly
                  className="text-red-600"
                />
                <span className={`ml-2 font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>JSON</span>
              </div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Formato estructurado con todos los metadatos, ideal para FortiGate.
              </p>
              <div className={`mt-2 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Incluye: severidad, etiquetas, reportador, etc.
              </div>
            </div>

            <div 
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                selectedFormat === 'csv' 
                ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                : theme === 'dark'
                  ? 'border-gray-600 hover:border-gray-500 bg-gray-700'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
              onClick={() => setSelectedFormat('csv')}
            >
              <div className="flex items-center mb-2">
                <input
                  type="radio"
                  checked={selectedFormat === 'csv'}
                  readOnly
                  className="text-red-600"
                />
                <span className={`ml-2 font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>CSV</span>
              </div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Formato tabular para análisis e importación en herramientas externas.
              </p>
              <div className={`mt-2 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Compatible con Excel, bases de datos, etc.
              </div>
            </div>
          </div>
        </div>

        {/* Acciones de exportación */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Acciones de exportación
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Genere y descargue el archivo de exportación
            </p>
          </div>
          <button
            onClick={handleExport}
            disabled={loading}
            className="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generando...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                </svg>
                Generar Exportación
              </>
            )}
          </button>
        </div>

        {/* Vista previa de la exportación */}
        {exportedData && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Vista previa de la exportación
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={downloadFile}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z"/>
                  </svg>
                  Descargar
                </button>
                <button
                  onClick={() => setExportedData(null)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-600 text-white hover:bg-gray-500'
                      : 'bg-gray-500 text-white hover:bg-gray-600'
                  }`}
                >
                  Cerrar
                </button>
              </div>
            </div>

            <div className={`border rounded-lg p-4 ${
              theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  {exportedData.iocs.length} IoCs exportados • Formato: {selectedFormat.toUpperCase()}
                </span>
                <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Generado el {exportedData.timestamp.toLocaleString('es-ES')}
                </span>
              </div>
              <pre className={`text-xs max-h-64 overflow-auto p-3 rounded border ${
                theme === 'dark' 
                  ? 'bg-gray-800 text-gray-300 border-gray-600' 
                  : 'bg-white text-gray-600 border-gray-300'
              }`}>
                {previewContent.length > 2000 
                  ? previewContent.substring(0, 2000) + '\n...\n[Contenido truncado - descargar para ver la totalidad]'
                  : previewContent
                }
              </pre>
            </div>
          </div>
        )}

        {/* Instrucciones de integración */}
        <div className={`mt-8 border rounded-lg p-6 ${
          theme === 'dark' 
            ? 'bg-blue-900/20 border-blue-800' 
            : 'bg-blue-50 border-blue-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-3 flex items-center ${
            theme === 'dark' ? 'text-blue-300' : 'text-blue-900'
          }`}>
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z"/>
            </svg>
            Instrucciones de integración FortiGate
          </h3>
          <div className={`space-y-3 text-sm ${theme === 'dark' ? 'text-blue-200' : 'text-blue-800'}`}>
            <div>
              <strong>Formato TXT:</strong>
              <p>Use directamente en FortiGate via Security Fabric → Threat Feeds → External Block List</p>
            </div>
            <div>
              <strong>Formato JSON:</strong>
              <p>Importe via API FortiGate o use FortiManager para despliegue automatizado</p>
            </div>
            <div>
              <strong>Formato CSV:</strong>
              <p>Convierta a formato FortiGate o use para análisis en herramientas externas</p>
            </div>
          </div>
        </div>

        {/* Estadísticas de exportación */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`border rounded-lg p-4 ${
            theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Total IoCs
                </p>
                <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {exportedData?.iocs.length || '-'}
                </p>
              </div>
            </div>
          </div>

          <div className={`border rounded-lg p-4 ${
            theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Aprobados
                </p>
                <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {exportedData?.iocs.filter(ioc => ioc.status === 'approved').length || '-'}
                </p>
              </div>
            </div>
          </div>

          <div className={`border rounded-lg p-4 ${
            theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Crítico/Alto
                </p>
                <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {exportedData?.iocs.filter(ioc => ioc.severity === 'critical' || ioc.severity === 'high').length || '-'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}