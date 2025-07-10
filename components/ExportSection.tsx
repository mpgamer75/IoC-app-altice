// components/ExportSection.tsx
'use client';

import { useState } from 'react';
import { IoCService } from '@/lib/ioc';
import { ExportData } from '@/types';

export default function ExportSection() {
  const [selectedFormat, setSelectedFormat] = useState<'txt' | 'json' | 'csv'>('json');
  const [loading, setLoading] = useState(false);
  const [exportedData, setExportedData] = useState<ExportData | null>(null);

  const handleExport = async () => {
    setLoading(true);
    try {
      const data = await IoCService.exportIoCs(selectedFormat);
      setExportedData(data);
    } catch (error) {
      console.error('Export failed:', error);
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
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Export des IoCs</h2>
        <p className="text-gray-600 mb-6">
          Exportez vos indicateurs de compromission vers FortiGate dans différents formats.
        </p>

        {/* Format Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Format d'export</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div 
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                selectedFormat === 'txt' 
                ? 'border-red-500 bg-red-50' 
                : 'border-gray-200 hover:border-gray-300'
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
                <span className="ml-2 font-semibold">TXT</span>
              </div>
              <p className="text-sm text-gray-600">
                Liste simple des valeurs IoC, compatible avec la plupart des systèmes.
              </p>
              <div className="mt-2 text-xs text-gray-500">
                Exemple: Une IP/domaine par ligne
              </div>
            </div>

            <div 
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                selectedFormat === 'json' 
                ? 'border-red-500 bg-red-50' 
                : 'border-gray-200 hover:border-gray-300'
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
                <span className="ml-2 font-semibold">JSON</span>
              </div>
              <p className="text-sm text-gray-600">
                Format structuré avec toutes les métadonnées, idéal pour FortiGate.
              </p>
              <div className="mt-2 text-xs text-gray-500">
                Inclut: sévérité, tags, rapporteur, etc.
              </div>
            </div>

            <div 
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                selectedFormat === 'csv' 
                ? 'border-red-500 bg-red-50' 
                : 'border-gray-200 hover:border-gray-300'
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
                <span className="ml-2 font-semibold">CSV</span>
              </div>
              <p className="text-sm text-gray-600">
                Format tabulaire pour analyse et import dans des outils externes.
              </p>
              <div className="mt-2 text-xs text-gray-500">
                Compatible Excel, databases, etc.
              </div>
            </div>
          </div>
        </div>

        {/* Export Actions */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Actions d'export</h3>
            <p className="text-sm text-gray-600">Générez et téléchargez le fichier d'export</p>
          </div>
          <button
            onClick={handleExport}
            disabled={loading}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Génération...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                </svg>
                Générer Export
              </>
            )}
          </button>
        </div>

        {/* Export Preview */}
        {exportedData && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Aperçu de l'export</h3>
              <div className="flex space-x-2">
                <button
                  onClick={downloadFile}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z"/>
                  </svg>
                  Télécharger
                </button>
                <button
                  onClick={() => setExportedData(null)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>

            <div className="bg-gray-50 border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {exportedData.iocs.length} IoCs exportés • Format: {selectedFormat.toUpperCase()}
                </span>
                <span className="text-xs text-gray-500">
                  Généré le {exportedData.timestamp.toLocaleString('fr-FR')}
                </span>
              </div>
              <pre className="text-xs text-gray-600 max-h-64 overflow-auto bg-white p-3 rounded border">
                {previewContent.length > 2000 
                  ? previewContent.substring(0, 2000) + '\n...\n[Contenu tronqué - télécharger pour voir l\'intégralité]'
                  : previewContent
                }
              </pre>
            </div>
          </div>
        )}

        {/* Integration Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z"/>
            </svg>
            Instructions d'intégration FortiGate
          </h3>
          <div className="space-y-3 text-sm text-blue-800">
            <div>
              <strong>Format TXT :</strong>
              <p>Utilisez directement dans FortiGate via Security Fabric → Threat Feeds → External Block List</p>
            </div>
            <div>
              <strong>Format JSON :</strong>
              <p>Importez via l'API FortiGate ou utilisez FortiManager pour un déploiement automatisé</p>
            </div>
            <div>
              <strong>Format CSV :</strong>
              <p>Convertissez en format FortiGate ou utilisez pour l'analyse dans des outils tiers</p>
            </div>
          </div>
        </div>

        {/* Export Statistics */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total IoCs</p>
                <p className="text-lg font-bold text-gray-900">{exportedData?.iocs.length || '-'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Approuvés</p>
                <p className="text-lg font-bold text-gray-900">
                  {exportedData?.iocs.filter(ioc => ioc.status === 'approved').length || '-'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Critique/Élevé</p>
                <p className="text-lg font-bold text-gray-900">
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