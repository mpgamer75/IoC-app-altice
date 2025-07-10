// components/IoCForm.tsx
'use client';

import { useState } from 'react';
import { IoC } from '@/types';
import { IoCService } from '@/lib/ioc';

interface IoCFormProps {
  type: 'ip' | 'domain' | 'url' | 'hash';
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: Partial<IoC>;
}

export default function IoCForm({ type, onSuccess, onCancel, initialData }: IoCFormProps) {
  const [formData, setFormData] = useState({
    value: initialData?.value || '',
    description: initialData?.description || '',
    severity: initialData?.severity || 'medium' as const,
    source: initialData?.source || '',
    reporter: initialData?.reporter || '',
    reporterEmail: initialData?.reporterEmail || '',
    tags: initialData?.tags?.join(', ') || '',
    tlp: initialData?.tlp || 'green' as const,
    confidence: initialData?.confidence || 50,
    notes: initialData?.notes || '',
    references: initialData?.references?.join('\n') || '',
    firstSeen: initialData?.firstSeen?.toISOString().split('T')[0] || '',
    lastSeen: initialData?.lastSeen?.toISOString().split('T')[0] || ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validation de la valeur selon le type
    if (!formData.value.trim()) {
      newErrors.value = 'Ce champ est requis';
    } else {
      switch (type) {
        case 'ip':
          const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
          if (!ipRegex.test(formData.value)) {
            newErrors.value = 'Format IP invalide (ex: 192.168.1.1)';
          }
          break;
        case 'domain':
          const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;
          if (!domainRegex.test(formData.value)) {
            newErrors.value = 'Format de domaine invalide (ex: example.com)';
          }
          break;
        case 'url':
          try {
            new URL(formData.value);
          } catch {
            newErrors.value = 'Format URL invalide (ex: https://example.com)';
          }
          break;
        case 'hash':
          const hashRegex = /^[a-fA-F0-9]{32,128}$/;
          if (!hashRegex.test(formData.value)) {
            newErrors.value = 'Format de hash invalide (MD5, SHA1, SHA256, etc.)';
          }
          break;
      }
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise';
    }

    if (!formData.source.trim()) {
      newErrors.source = 'La source est requise';
    }

    if (!formData.reporter.trim()) {
      newErrors.reporter = 'Le nom du rapporteur est requis';
    }

    if (!formData.reporterEmail.trim()) {
      newErrors.reporterEmail = 'L\'email du rapporteur est requis';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.reporterEmail)) {
        newErrors.reporterEmail = 'Format email invalide';
      }
    }

    if (formData.confidence < 0 || formData.confidence > 100) {
      newErrors.confidence = 'La confiance doit être entre 0 et 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const iocData: Omit<IoC, 'id' | 'dateReported'> = {
        type,
        value: formData.value.trim(),
        description: formData.description.trim(),
        severity: formData.severity,
        source: formData.source.trim(),
        reporter: formData.reporter.trim(),
        reporterEmail: formData.reporterEmail.trim(),
        status: 'pending',
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        tlp: formData.tlp,
        confidence: formData.confidence,
        notes: formData.notes.trim() || undefined,
        references: formData.references ? formData.references.split('\n').map(ref => ref.trim()).filter(Boolean) : undefined,
        firstSeen: formData.firstSeen ? new Date(formData.firstSeen) : undefined,
        lastSeen: formData.lastSeen ? new Date(formData.lastSeen) : undefined
      };

      await IoCService.createIoC(iocData);
      
      // Afficher une notification de succès
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('show-toast', {
          detail: {
            type: 'success',
            message: `IoC ${getTypeLabel()} créé avec succès !`
          }
        });
        window.dispatchEvent(event);
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error creating IoC:', error);
      setErrors({ submit: 'Erreur lors de la création de l\'IoC' });
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'ip': return 'Adresse IP';
      case 'domain': return 'Nom de Domaine';
      case 'url': return 'URL';
      case 'hash': return 'Hash/Empreinte';
      default: return 'IoC';
    }
  };

  const getTypePlaceholder = () => {
    switch (type) {
      case 'ip': return '192.168.1.100';
      case 'domain': return 'malicious-site.com';
      case 'url': return 'https://malicious-site.com/path';
      case 'hash': return 'a1b2c3d4e5f6789012345678901234567890abcd';
      default: return '';
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'ip': return '🌐';
      case 'domain': return '🏷️';
      case 'url': return '🔗';
      case 'hash': return '#️⃣';
      default: return '📄';
    }
  };

  const getTypeGradient = () => {
    switch (type) {
      case 'ip': return 'from-blue-500 to-blue-600';
      case 'domain': return 'from-green-500 to-green-600';
      case 'url': return 'from-purple-500 to-purple-600';
      case 'hash': return 'from-orange-500 to-orange-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="card animate-fade-in max-w-6xl mx-auto">
      <div className="mb-8 border-b border-gray-200 pb-6">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${getTypeGradient()} shadow-lg animate-scale-in`}>
            <span className="text-2xl text-white">
              {getTypeIcon()}
            </span>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
              Ajouter un {getTypeLabel()}
            </h2>
            <p className="text-gray-600 mt-1">Remplissez les informations ci-dessous pour ajouter un nouvel indicateur de compromission.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Colonne gauche */}
          <div className="space-y-6 animate-slide-in-left">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                <span className="mr-2">🎯</span>
                {getTypeLabel()} *
              </label>
              <input
                type="text"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                className={`form-input ${errors.value ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-red-500'}`}
                placeholder={getTypePlaceholder()}
              />
              {errors.value && (
                <p className="text-sm text-red-600 mt-1 flex items-center animate-fade-in">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  {errors.value}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                <span className="mr-2">📝</span>
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className={`form-input resize-none ${errors.description ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-red-500'}`}
                placeholder="Description détaillée de la menace, contexte de découverte, impact potentiel..."
              />
              {errors.description && (
                <p className="text-sm text-red-600 mt-1 flex items-center animate-fade-in">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  {errors.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                  <span className="mr-2">⚡</span>
                  Sévérité *
                </label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                  className="form-input"
                >
                  <option value="low">🟢 Faible</option>
                  <option value="medium">🟡 Moyenne</option>
                  <option value="high">🟠 Élevée</option>
                  <option value="critical">🔴 Critique</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                  <span className="mr-2">🔒</span>
                  Classification TLP
                </label>
                <select
                  value={formData.tlp}
                  onChange={(e) => setFormData({ ...formData, tlp: e.target.value as any })}
                  className="form-input"
                >
                  <option value="white">⚪ TLP:WHITE - Diffusion libre</option>
                  <option value="green">🟢 TLP:GREEN - Communauté</option>
                  <option value="amber">🟡 TLP:AMBER - Organisation limitée</option>
                  <option value="red">🔴 TLP:RED - Personnel seulement</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                <span className="mr-2">📊</span>
                Source *
              </label>
              <input
                type="text"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className={`form-input ${errors.source ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-red-500'}`}
                placeholder="Ex: SIEM, EDR, Threat Intelligence, Security Team..."
              />
              {errors.source && (
                <p className="text-sm text-red-600 mt-1 flex items-center animate-fade-in">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  {errors.source}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                <span className="mr-2">🏷️</span>
                Tags
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="form-input"
                placeholder="malware, phishing, botnet, apt, ransomware (séparés par des virgules)"
              />
              <p className="text-xs text-gray-500">Utilisez des tags pour catégoriser et rechercher plus facilement</p>
            </div>
          </div>

          {/* Colonne droite */}
          <div className="space-y-6 animate-slide-in-right" style={{ animationDelay: '200ms' }}>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                <span className="mr-2">👤</span>
                Rapporteur *
              </label>
              <input
                type="text"
                value={formData.reporter}
                onChange={(e) => setFormData({ ...formData, reporter: e.target.value })}
                className={`form-input ${errors.reporter ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-red-500'}`}
                placeholder="Nom complet du rapporteur"
              />
              {errors.reporter && (
                <p className="text-sm text-red-600 mt-1 flex items-center animate-fade-in">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  {errors.reporter}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                <span className="mr-2">📧</span>
                Email du rapporteur *
              </label>
              <input
                type="email"
                value={formData.reporterEmail}
                onChange={(e) => setFormData({ ...formData, reporterEmail: e.target.value })}
                className={`form-input ${errors.reporterEmail ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-red-500'}`}
                placeholder="email@company.com"
              />
              {errors.reporterEmail && (
                <p className="text-sm text-red-600 mt-1 flex items-center animate-fade-in">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  {errors.reporterEmail}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                <span className="mr-2">🎯</span>
                Niveau de confiance: {formData.confidence}%
              </label>
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.confidence}
                  onChange={(e) => setFormData({ ...formData, confidence: parseInt(e.target.value) })}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #ef4444 0%, #f59e0b 25%, #eab308 50%, #22c55e 75%, #10b981 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>0% - Très faible</span>
                  <span>50% - Modéré</span>
                  <span>100% - Très élevé</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                  <span className="mr-2">📅</span>
                  Première observation
                </label>
                <input
                  type="date"
                  value={formData.firstSeen}
                  onChange={(e) => setFormData({ ...formData, firstSeen: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                  <span className="mr-2">📅</span>
                  Dernière observation
                </label>
                <input
                  type="date"
                  value={formData.lastSeen}
                  onChange={(e) => setFormData({ ...formData, lastSeen: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                <span className="mr-2">📝</span>
                Notes additionnelles
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                className="form-input resize-none"
                placeholder="Informations complémentaires, contexte de découverte, actions recommandées, impact observé..."
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                <span className="mr-2">🔗</span>
                Références externes
              </label>
              <textarea
                value={formData.references}
                onChange={(e) => setFormData({ ...formData, references: e.target.value })}
                rows={4}
                className="form-input resize-none"
                placeholder="URLs de référence (une par ligne)&#10;https://virustotal.com/...&#10;https://threatintel.com/...&#10;https://mitre.org/..."
              />
              <p className="text-xs text-gray-500">Ajoutez des liens vers des analyses, rapports ou sources externes</p>
            </div>
          </div>
        </div>

        {errors.submit && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 animate-fade-in">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{errors.submit}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Création en cours...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
                </svg>
                Créer l'IoC
              </>
            )}
          </button>
        </div>
      </form>

      {/* Style pour le slider */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #dc2626;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: all 0.2s ease;
        }
        
        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }
        
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #dc2626;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: all 0.2s ease;
        }
        
        .slider::-moz-range-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
}