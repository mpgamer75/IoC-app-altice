// components/IoCList.tsx
'use client';

import { useState, useEffect } from 'react';
import { IoC } from '@/types';
import { IoCService } from '@/lib/ioc';

interface IoCListProps {
  theme: 'light' | 'dark';
  onEdit?: (ioc: IoC) => void;
}

export default function IoCList({ theme, onEdit }: IoCListProps) {
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
      console.error('Error cargando IoCs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Está seguro de que desea eliminar este IoC?')) {
      try {
        await IoCService.deleteIoC(id);
        setIoCs(iocs.filter(ioc => ioc.id !== id));
        
        // Mostrar notificación
        if (typeof window !== 'undefined') {
          const event = new CustomEvent('show-toast', {
            detail: {
              type: 'success',
              message: 'IoC eliminado exitosamente'
            }
          });
          window.dispatchEvent(event);
        }
      } catch (error) {
        console.error('Error eliminando IoC:', error);
        
        // Mostrar error
        if (typeof window !== 'undefined') {
          const event = new CustomEvent('show-toast', {
            detail: {
              type: 'error',
              message: 'Error al eliminar el IoC'
            }
          });
          window.dispatchEvent(event);
        }
      }
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: IoC['status']) => {
    try {
      const updatedIoC = await IoCService.updateIoC(id, { status: newStatus });
      if (updatedIoC) {
        setIoCs(iocs.map(ioc => ioc.id === id ? updatedIoC : ioc));
        
        // Mostrar notificación
        if (typeof window !== 'undefined') {
          const event = new CustomEvent('show-toast', {
            detail: {
              type: 'success',
              message: `Estado actualizado a ${getStatusLabel(newStatus)}`
            }
          });
          window.dispatchEvent(event);
        }
      }
    } catch (error) {
      console.error('Error actualizando estado del IoC:', error);
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

      // Proporcionar valores por defecto si están indefinidos
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
    const baseClass = theme === 'dark' ? 'dark:' : '';
    switch (severity) {
      case 'critical': return `bg-red-100 text-red-800 ${baseClass}bg-red-900/30 ${baseClass}text-red-400`;
      case 'high': return `bg-orange-100 text-orange-800 ${baseClass}bg-orange-900/30 ${baseClass}text-orange-400`;
      case 'medium': return `bg-yellow-100 text-yellow-800 ${baseClass}bg-yellow-900/30 ${baseClass}text-yellow-400`;
      case 'low': return `bg-green-100 text-green-800 ${baseClass}bg-green-900/30 ${baseClass}text-green-400`;
      default: return `bg-gray-100 text-gray-800 ${baseClass}bg-gray-900/30 ${baseClass}text-gray-400`;
    }
  };

  const getStatusColor = (status: string) => {
    const baseClass = theme === 'dark' ? 'dark:' : '';
    switch (status) {
      case 'approved': return `bg-green-100 text-green-800 ${baseClass}bg-green-900/30 ${baseClass}text-green-400`;
      case 'pending': return `bg-yellow-100 text-yellow-800 ${baseClass}bg-yellow-900/30 ${baseClass}text-yellow-400`;
      case 'rejected': return `bg-red-100 text-red-800 ${baseClass}bg-red-900/30 ${baseClass}text-red-400`;
      default: return `bg-gray-100 text-gray-800 ${baseClass}bg-gray-900/30 ${baseClass}text-gray-400`;
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

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'ip': return 'IP';
      case 'domain': return 'Dominio';
      case 'url': return 'URL';
      case 'hash': return 'Hash';
      default: return type;
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'critical': return 'Crítica';
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return severity;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved': return 'Aprobado';
      case 'pending': return 'Pendiente';
      case 'rejected': return 'Rechazado';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-600 border-t-transparent"></div>
          <div className="absolute inset-0 animate-pulse">
            <div className="rounded-full h-16 w-16 bg-red-100"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={`card animate-fade-in ${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
          Lista de IoCs
        </h2>
        <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Gestione sus indicadores de compromiso
        </p>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Búsqueda
            </label>
            <input
              type="text"
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              placeholder="Buscar..."
              className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-red-500'
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-red-500'
              } focus:ring-2 focus:ring-red-500 focus:ring-opacity-20`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Tipo
            </label>
            <select
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'border-gray-600 bg-gray-700 text-white focus:border-red-500'
                  : 'border-gray-300 bg-white text-gray-900 focus:border-red-500'
              } focus:ring-2 focus:ring-red-500 focus:ring-opacity-20`}
            >
              <option value="">Todos los tipos</option>
              <option value="ip">IP</option>
              <option value="domain">Dominio</option>
              <option value="url">URL</option>
              <option value="hash">Hash</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Severidad
            </label>
            <select
              value={filter.severity}
              onChange={(e) => setFilter({ ...filter, severity: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'border-gray-600 bg-gray-700 text-white focus:border-red-500'
                  : 'border-gray-300 bg-white text-gray-900 focus:border-red-500'
              } focus:ring-2 focus:ring-red-500 focus:ring-opacity-20`}
            >
              <option value="">Todas las severidades</option>
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
              <option value="critical">Crítica</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Estado
            </label>
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'border-gray-600 bg-gray-700 text-white focus:border-red-500'
                  : 'border-gray-300 bg-white text-gray-900 focus:border-red-500'
              } focus:ring-2 focus:ring-red-500 focus:ring-opacity-20`}
            >
              <option value="">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="approved">Aprobado</option>
              <option value="rejected">Rechazado</option>
            </select>
          </div>
        </div>

        {/* Contador de resultados */}
        <div className="flex justify-between items-center mb-4">
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {filteredAndSortedIoCs.length} IoC(s) encontrado(s) de {iocs.length} total
          </p>
          <button
            onClick={loadIoCs}
            className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"/>
            </svg>
            Actualizar
          </button>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className={`min-w-full ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <thead className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th 
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors ${
                    theme === 'dark' 
                      ? 'text-gray-300 hover:bg-gray-600' 
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                  onClick={() => handleSort('type')}
                >
                  <div className="flex items-center">
                    Tipo
                    {sortBy === 'type' && (
                      <span className="ml-1">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors ${
                    theme === 'dark' 
                      ? 'text-gray-300 hover:bg-gray-600' 
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                  onClick={() => handleSort('value')}
                >
                  <div className="flex items-center">
                    Valor
                    {sortBy === 'value' && (
                      <span className="ml-1">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors ${
                    theme === 'dark' 
                      ? 'text-gray-300 hover:bg-gray-600' 
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                  onClick={() => handleSort('severity')}
                >
                  <div className="flex items-center">
                    Severidad
                    {sortBy === 'severity' && (
                      <span className="ml-1">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors ${
                    theme === 'dark' 
                      ? 'text-gray-300 hover:bg-gray-600' 
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center">
                    Estado
                    {sortBy === 'status' && (
                      <span className="ml-1">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors ${
                    theme === 'dark' 
                      ? 'text-gray-300 hover:bg-gray-600' 
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                  onClick={() => handleSort('reporter')}
                >
                  <div className="flex items-center">
                    Reportador
                    {sortBy === 'reporter' && (
                      <span className="ml-1">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors ${
                    theme === 'dark' 
                      ? 'text-gray-300 hover:bg-gray-600' 
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                  onClick={() => handleSort('dateReported')}
                >
                  <div className="flex items-center">
                    Fecha
                    {sortBy === 'dateReported' && (
                      <span className="ml-1">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${
              theme === 'dark' 
                ? 'bg-gray-800 divide-gray-700' 
                : 'bg-white divide-gray-200'
            }`}>
              {filteredAndSortedIoCs.map((ioc) => (
                <tr key={ioc.id} className={`transition-colors ${
                  theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                }`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{getTypeIcon(ioc.type)}</span>
                      <span className={`text-sm font-medium capitalize ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {getTypeLabel(ioc.type)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <div className={`text-sm font-medium truncate ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`} title={ioc.value}>
                        {ioc.value}
                      </div>
                      <div className={`text-sm truncate ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`} title={ioc.description}>
                        {ioc.description}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(ioc.severity)}`}>
                      {getSeverityLabel(ioc.severity)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={ioc.status}
                      onChange={(e) => handleStatusUpdate(ioc.id, e.target.value as IoC['status'])}
                      className={`text-xs font-semibold rounded-full px-2 py-1 border-0 cursor-pointer ${getStatusColor(ioc.status)}`}
                    >
                      <option value="pending">Pendiente</option>
                      <option value="approved">Aprobado</option>
                      <option value="rejected">Rechazado</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {ioc.reporter}
                    </div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {ioc.source}
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {ioc.dateReported.toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onEdit?.(ioc)}
                        className="text-indigo-600 hover:text-indigo-900 transition-colors"
                        title="Editar"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(ioc.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Eliminar"
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
              <svg className={`mx-auto h-12 w-12 ${
                theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
              }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6M7 8h10M7 12h4" />
              </svg>
              <h3 className={`mt-2 text-sm font-medium ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                No se encontraron IoCs
              </h3>
              <p className={`mt-1 text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {filter.search || filter.type || filter.severity || filter.status
                  ? 'Intente modificar sus filtros'
                  : 'Comience agregando su primer IoC'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}