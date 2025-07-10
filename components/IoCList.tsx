// components/IoCList.tsx
'use client';

import { useState, useEffect } from 'react';
import { IoC } from '@/types';
import { IoCService } from '@/lib/ioc';

interface IoCListProps {
  onEdit?: (ioc: IoC) => void;
}

export default function IoCList({ onEdit }: IoCListProps) {
  const [iocs, setIoCs] = useState<IoC[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    type: '',
    severity: '',
    status: '',
    search: ''
  });
  const [sortBy, setSortBy] = useState<keyof IoC>('dateReported');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadIoCs();
  }, []);

  const loadIoCs = async () => {
    try {
      setLoading(true);
      const data = await IoCService.getAllIoCs();
      setIoCs(data);
    } catch (error) {
      console.error('Error loading IoCs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet IoC ?')) {
      try {
        await IoCService.deleteIoC(id);
        setIoCs(iocs.filter(ioc => ioc.id !== id));
      } catch (error) {
        console.error('Error deleting IoC:', error);
      }
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: IoC['status']) => {
    try {
      const updatedIoC = await IoCService.updateIoC(id, { status: newStatus });
      if (updatedIoC) {
        setIoCs(iocs.map(ioc => ioc.id === id ? updatedIoC : ioc));
      }
    } catch (error) {
      console.error('Error updating IoC status:', error);
    }
  };

  const filteredAndSortedIoCs = iocs
    .filter(ioc => {
      if (filter.type && ioc.type !== filter.type) return false;
      if (filter.severity && ioc.severity !== filter.severity) return false;
      if (filter.status && ioc.status !== filter.status) return false;
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        return (
          ioc.value.toLowerCase().includes(searchLower) ||
          ioc.description.toLowerCase().includes(searchLower) ||
          ioc.reporter.toLowerCase().includes(searchLower)
        );
      }
      return true;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Provide default values if undefined
      if (aValue === undefined || aValue === null) aValue = '';
      if (bValue === undefined || bValue === null) bValue = '';

      if (aValue instanceof Date) aValue = aValue.getTime();
      if (bValue instanceof Date) bValue = bValue.getTime();

      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const handleSort = (column: keyof IoC) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ip': return '🌐';
      case 'domain': return '🏷️';
      case 'url': return '🔗';
      case 'hash': return '#️⃣';
      default: return '📄';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Liste des IoCs</h2>
        <p className="text-gray-600 mb-6">Gérez vos indicateurs de compromission</p>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
            <input
              type="text"
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              placeholder="Rechercher..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">Tous les types</option>
              <option value="ip">IP</option>
              <option value="domain">Domaine</option>
              <option value="url">URL</option>
              <option value="hash">Hash</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sévérité</label>
            <select
              value={filter.severity}
              onChange={(e) => setFilter({ ...filter, severity: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">Toutes les sévérités</option>
              <option value="low">Faible</option>
              <option value="medium">Moyenne</option>
              <option value="high">Élevée</option>
              <option value="critical">Critique</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="approved">Approuvé</option>
              <option value="rejected">Rejeté</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-600">
            {filteredAndSortedIoCs.length} IoC(s) trouvé(s) sur {iocs.length} total
          </p>
          <button
            onClick={loadIoCs}
            className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"/>
            </svg>
            Actualiser
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('type')}
                >
                  <div className="flex items-center">
                    Type
                    {sortBy === 'type' && (
                      <span className="ml-1">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('value')}
                >
                  <div className="flex items-center">
                    Valeur
                    {sortBy === 'value' && (
                      <span className="ml-1">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('severity')}
                >
                  <div className="flex items-center">
                    Sévérité
                    {sortBy === 'severity' && (
                      <span className="ml-1">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center">
                    Statut
                    {sortBy === 'status' && (
                      <span className="ml-1">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('reporter')}
                >
                  <div className="flex items-center">
                    Rapporteur
                    {sortBy === 'reporter' && (
                      <span className="ml-1">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('dateReported')}
                >
                  <div className="flex items-center">
                    Date
                    {sortBy === 'dateReported' && (
                      <span className="ml-1">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedIoCs.map((ioc) => (
                <tr key={ioc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{getTypeIcon(ioc.type)}</span>
                      <span className="text-sm font-medium text-gray-900 capitalize">{ioc.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <div className="text-sm font-medium text-gray-900 truncate" title={ioc.value}>
                        {ioc.value}
                      </div>
                      <div className="text-sm text-gray-500 truncate" title={ioc.description}>
                        {ioc.description}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(ioc.severity)}`}>
                      {ioc.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={ioc.status}
                      onChange={(e) => handleStatusUpdate(ioc.id, e.target.value as IoC['status'])}
                      className={`text-xs font-semibold rounded-full px-2 py-1 border-0 ${getStatusColor(ioc.status)}`}
                    >
                      <option value="pending">En attente</option>
                      <option value="approved">Approuvé</option>
                      <option value="rejected">Rejeté</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{ioc.reporter}</div>
                    <div className="text-sm text-gray-500">{ioc.source}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {ioc.dateReported.toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onEdit?.(ioc)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Modifier"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(ioc.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Supprimer"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredAndSortedIoCs.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6M7 8h10M7 12h4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun IoC trouvé</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filter.search || filter.type || filter.severity || filter.status
                  ? 'Essayez de modifier vos filtres'
                  : 'Commencez par ajouter votre premier IoC'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}