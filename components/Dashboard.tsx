// components/Dashboard.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardStats } from '@/types';
import { IoCService } from '@/lib/ioc';

interface DashboardProps {
  onNavigate: (section: string) => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

export default function Dashboard({ onNavigate, theme, onThemeToggle }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [animationKey, setAnimationKey] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());


  // Función para cargar estadísticas
  const loadStats = useCallback(async (forceUpdate = false) => {
    try {
      if (forceUpdate) {
        setLoading(true);
      }
      const dashboardStats = await IoCService.getDashboardStats();
      setStats(dashboardStats);
      if (forceUpdate) {
        setAnimationKey(prev => prev + 1);
      }
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      if (forceUpdate) {
        setLoading(false);
      }
    }
  }, []);

  // Efecto para carga inicial y actualización automática
  useEffect(() => {
    loadStats(true);

    // Actualización automática cada 5 minutos (300 segundos)
    const interval = setInterval(() => {
      loadStats(false); // Sin animaciones para actualizaciones automáticas
    }, 300000);

    return () => clearInterval(interval);
  }, [loadStats]);

  if (loading && !stats) {
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

  if (!stats) {
    return (
      <div className={`text-center mt-8 animate-fade-in ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
        <div className={`border rounded-lg p-6 ${theme === 'dark' ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'}`}>
          <svg className={`mx-auto h-12 w-12 mb-4 ${theme === 'dark' ? 'text-red-400' : 'text-red-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-red-300' : 'text-red-800'}`}>Error de carga</h3>
          <p className={theme === 'dark' ? 'text-red-400' : 'text-red-600'}>No se pudieron cargar las estadísticas del dashboard</p>
          <button 
            onClick={() => loadStats()}
            className="mt-4 btn-primary"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'from-red-500 to-red-600';
      case 'high': return 'from-orange-500 to-orange-600';
      case 'medium': return 'from-yellow-500 to-yellow-600';
      case 'low': return 'from-green-500 to-green-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    const baseClasses = theme === 'dark' ? 'border-opacity-30' : 'border-opacity-100';
    switch (status) {
      case 'approved': return `text-green-600 bg-green-100 border-green-200 ${baseClasses} ${theme === 'dark' ? 'dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' : ''}`;
      case 'pending': return `text-yellow-600 bg-yellow-100 border-yellow-200 ${baseClasses} ${theme === 'dark' ? 'dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800' : ''}`;
      case 'rejected': return `text-red-600 bg-red-100 border-red-200 ${baseClasses} ${theme === 'dark' ? 'dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' : ''}`;
      default: return `text-gray-600 bg-gray-100 border-gray-200 ${baseClasses}`;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ip': return 'from-blue-500 to-blue-600';
      case 'domain': return 'from-green-500 to-green-600';
      case 'url': return 'from-purple-500 to-purple-600';
      case 'hash': return 'from-orange-500 to-orange-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'ip': return 'Direcciones IP';
      case 'domain': return 'Dominios';
      case 'url': return 'URLs';
      case 'hash': return 'Hashes';
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

  const StatCard = ({ title, value, icon, gradient, delay }: {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    gradient: string;
    delay: number;
  }) => (
    <div 
      className={`card hover:scale-105 transform transition-all duration-300 animate-fade-in ${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center">
        <div className={`p-4 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
          <div className="text-white text-xl">
            {icon}
          </div>
        </div>
        <div className="ml-4 flex-1">
          <p className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{title}</p>
          <div className="flex items-baseline">
            <p className={`text-3xl font-bold animate-scale-in ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} key={`${value}-${animationKey}`}>
              {value}
            </p>
            <div className="ml-2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );

  const ChartBar = ({ label, value, maxValue, color, delay }: {
    label: string;
    value: number;
    maxValue: number;
    color: string;
    delay: number;
  }) => {
    const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
    
    return (
      <div 
        className={`flex items-center justify-between p-3 rounded-lg transition-colors duration-200 animate-slide-in-right ${
          theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
        }`}
        style={{ animationDelay: `${delay}ms` }}
      >
        <div className="flex items-center flex-1">
          <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${color} mr-3 shadow-sm`}></div>
          <span className={`text-sm font-medium capitalize min-w-0 flex-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            {getTypeLabel(label) || getSeverityLabel(label) || label}
          </span>
        </div>
        <div className="flex items-center space-x-3 ml-4">
          <div className={`w-24 rounded-full h-2 overflow-hidden ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <div 
              className={`h-full bg-gradient-to-r ${color} transition-all duration-1000 ease-out chart-bar`}
              style={{ 
                width: `${percentage}%`,
                animationDelay: `${delay + 200}ms`
              }}
            ></div>
          </div>
          <span className={`text-sm font-bold min-w-[2rem] text-right ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{value}</span>
        </div>
      </div>
    );
  };

  // Datos para el gráfico de pastel mejorado
  const pieData = Object.entries(stats.iocsBySeverity).map(([severity, count]) => ({
    name: getSeverityLabel(severity),
    value: count,
    severity,
    color: severity === 'critical' ? '#ef4444' : 
           severity === 'high' ? '#f97316' :
           severity === 'medium' ? '#eab308' : '#22c55e',
    percentage: stats.totalIoCs > 0 ? ((count / stats.totalIoCs) * 100).toFixed(1) : '0'
  }));

  // Gráfico de pastel mejorado sin interactividad
  const PieChart = () => {
    const total = pieData.reduce((sum, item) => sum + item.value, 0);
    let cumulativePercentage = 0;
    const radius = 80; // Radio más grande
    const centerX = 120;
    const centerY = 120;

    return (
      <div className="flex flex-col lg:flex-row items-center justify-center space-y-6 lg:space-y-0 lg:space-x-8">
        <div className="relative flex-shrink-0">
          <svg width="240" height="240" className="transform -rotate-90">
            {pieData.map((item, index) => {
              const percentage = total > 0 ? (item.value / total) * 100 : 0;
              const strokeDasharray = `${percentage * 5.03} 503`; // Circunferencia = 2πr = 2π*80 ≈ 503
              const strokeDashoffset = -(cumulativePercentage * 5.03);
              cumulativePercentage += percentage;

              return (
                <circle
                  key={`pie-${item.severity}-${index}`}
                  cx={centerX}
                  cy={centerY}
                  r={radius}
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth="24"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="drop-shadow-lg"
                  style={{ 
                    animationDelay: `${index * 200}ms`
                  }}
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{total}</div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Total IoCs</div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-3 min-w-[200px] flex-shrink-0">
          {pieData.map((item, index) => (
            <div 
              key={`legend-${item.severity}-${index}`}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full shadow-sm flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                ></div>
                <div>
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    {item.name}
                  </span>
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {item.percentage}% del total
                  </div>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {item.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header mejorado sin estrella */}
      <div className={`card animate-fade-in ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
          <button
            onClick={() => loadStats(true)}
            className={`p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 transition-transform duration-200'
            }`}
            disabled={loading}
            title="Actualizar estadísticas"
          >
            <svg className={`w-8 h-8 text-white ${loading ? 'animate-spin' : ''}`} fill="currentColor" viewBox="0 0 24 24">
              {loading ? (
                <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"/>
              ) : (
                <path d="M3,3V21H21V19H5V3H3M9,17H7V10H9V17M13,17H11V7H13V17M17,17H15V13H17V17Z"/>
              )}
            </svg>
          </button>
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                Resumen de Indicadores de Compromiso
              </p>
              <div className="flex items-center mt-2 space-x-4">
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Última actualización: {lastUpdate.toLocaleTimeString('es-ES')}
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-1"></div>
                  <span className={`text-xs ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                    Actualizando cada 5 min
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => loadStats()}
              disabled={loading}
              className={`p-3 rounded-xl transition-all duration-200 ${
                loading
                  ? 'opacity-50 cursor-not-allowed'
                  : theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              title="Actualizar estadísticas"
            >
              <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"/>
              </svg>
            </button>
            <button
              onClick={onThemeToggle}
              className={`p-3 rounded-xl transition-all duration-200 ${
                theme === 'dark' 
                  ? 'bg-yellow-500 hover:bg-yellow-400' 
                  : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              {theme === 'dark' ? (
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>
                </svg>
              ) : (
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tarjetas de estadísticas con actualización en tiempo real */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total IoCs"
          value={stats.totalIoCs}
          icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>}
          gradient="from-red-500 to-red-600"
          delay={0}
        />
        <StatCard
          title="Pendientes"
          value={stats.iocsByStatus.pending || 0}
          icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>}
          gradient="from-yellow-500 to-yellow-600"
          delay={100}
        />
        <StatCard
          title="Aprobados"
          value={stats.iocsByStatus.approved || 0}
          icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>}
          gradient="from-green-500 to-green-600"
          delay={200}
        />
        <StatCard
          title="Esta semana"
          value={stats.weeklyTrend.reduce((sum, day) => sum + day.count, 0)}
          icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-1 16H9V7h9v14z"/></svg>}
          gradient="from-blue-500 to-blue-600"
          delay={300}
        />
      </div>

      {/* Fila de gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* IoCs por Tipo */}
        <div className={`card animate-slide-in-left ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} style={{ animationDelay: '400ms' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>IoCs por Tipo</h3>
            <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
              <svg className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} fill="currentColor" viewBox="0 0 24 24">
                <path d="M3,3V21H21V19H5V3H3M9,17H7V10H9V17M13,17H11V7H13V17M17,17H15V13H17V17Z"/>
              </svg>
            </div>
          </div>
          <div className="space-y-4">
            {Object.entries(stats.iocsByType).map(([type, count], index) => (
              <ChartBar
                key={type}
                label={type}
                value={count}
                maxValue={Math.max(...Object.values(stats.iocsByType))}
                color={getTypeColor(type)}
                delay={index * 100}
              />
            ))}
          </div>
        </div>

        {/* Gráfico de pastel mejorado e interactivo */}
        <div className={`card animate-slide-in-right ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} style={{ animationDelay: '500ms' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>IoCs por Severidad</h3>
            <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-red-900/30' : 'bg-red-100'}`}>
              <svg className={`w-5 h-5 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L13.09 8.26L22 9L14.22 13.73L18.18 22L12 18L5.82 22L9.78 13.73L2 9L10.91 8.26L12 2Z"/>
              </svg>
            </div>
          </div>
          <PieChart />
        </div>
      </div>

      {/* Tendencia semanal */}
      <div className={`card animate-fade-in ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} style={{ animationDelay: '600ms' }}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Tendencia Semanal</h3>
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-green-900/30' : 'bg-green-100'}`}>
              <svg className={`w-5 h-5 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} fill="currentColor" viewBox="0 0 24 24">
                <path d="M3,13H4V19H6V11H7V19H9V7H10V19H12V9H13V19H15V6H16V19H18V14H19V19H21V4H3V13Z"/>
              </svg>
            </div>
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Últimos 7 días</span>
          </div>
        </div>
        <div className={`flex items-end justify-between space-x-2 h-40 p-4 rounded-lg ${
          theme === 'dark' ? 'bg-gradient-to-t from-gray-700 to-gray-800' : 'bg-gradient-to-t from-gray-50 to-white'
        }`}>
          {stats.weeklyTrend.map((day, index) => {
            const maxCount = Math.max(...stats.weeklyTrend.map(d => d.count), 1);
            const heightPercent = Math.max((day.count / maxCount) * 100, 8);
            
            return (
              <div key={day.date} className="flex flex-col items-center flex-1 group">
                <div 
                  className="bg-gradient-to-t from-red-600 to-red-400 rounded-t-lg w-full transition-all duration-700 hover:from-red-500 hover:to-red-300 relative overflow-hidden shadow-sm chart-bar"
                  style={{ 
                    height: `${heightPercent}%`,
                    minHeight: '12px',
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className={`absolute -top-8 left-1/2 transform -translate-x-1/2 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-10 ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-900'
                  }`}>
                    {day.count} IoCs
                  </div>
                </div>
                <div className="text-center mt-2">
                  <span className={`text-xs transition-colors group-hover:text-red-600 font-medium ${
                    theme === 'dark' ? 'text-gray-400 group-hover:text-red-400' : 'text-gray-600'
                  }`}>
                    {new Date(day.date).toLocaleDateString('es-ES', { weekday: 'short' })}
                  </span>
                  <div className={`text-xs font-bold transition-colors mt-1 ${
                    theme === 'dark' ? 'text-white group-hover:text-red-400' : 'text-gray-900 group-hover:text-red-600'
                  }`}>
                    {day.count}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actividad reciente y top reportadores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Actividad reciente */}
        <div className={`card animate-slide-in-left ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} style={{ animationDelay: '700ms' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Actividad Reciente</h3>
            <button 
              onClick={() => onNavigate('list')}
              className={`text-red-600 hover:text-red-700 text-sm font-medium flex items-center group transition-colors ${
                theme === 'dark' ? 'text-red-400 hover:text-red-300' : ''
              }`}
            >
              Ver todo
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"/>
              </svg>
            </button>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {stats.recentActivity.slice(0, 6).map((ioc, index) => (
              <div 
                key={ioc.id} 
                className={`flex items-center justify-between p-4 rounded-lg transition-all duration-200 animate-fade-in border ${
                  theme === 'dark' 
                    ? 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 border-gray-600' 
                    : 'bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border-gray-200'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getSeverityColor(ioc.severity)} shadow-sm`}></div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium truncate max-w-32 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} title={ioc.value}>
                      {ioc.value}
                    </p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{ioc.reporter}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(ioc.status)}`}>
                    {getStatusLabel(ioc.status)}
                  </span>
                  <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {ioc.dateReported.toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top reportadores */}
        <div className={`card animate-slide-in-right ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} style={{ animationDelay: '800ms' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Top Reportadores</h3>
            <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
              <svg className={`w-5 h-5 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M7.07,18.28C7.5,17.38 10.12,16.5 12,16.5C13.88,16.5 16.5,17.38 16.93,18.28C15.57,19.36 13.86,20 12,20C10.14,20 8.43,19.36 7.07,18.28M18.36,16.83C16.93,15.09 13.46,14.5 12,14.5C10.54,14.5 7.07,15.09 5.64,16.83C4.62,15.5 4,13.82 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,13.82 19.38,15.5 18.36,16.83M12,6C10.06,6 8.5,7.56 8.5,9.5C8.5,11.44 10.06,13 12,13C13.94,13 15.5,11.44 15.5,9.5C15.5,7.56 13.94,6 12,6M12,11A1.5,1.5 0 0,1 10.5,9.5A1.5,1.5 0 0,1 12,8A1.5,1.5 0 0,1 13.5,9.5A1.5,1.5 0 0,1 12,11Z"/>
              </svg>
            </div>
          </div>
          <div className="space-y-4">
            {stats.topReporters.map((reporter, index) => (
              <div 
                key={reporter.name} 
                className={`flex items-center justify-between p-3 rounded-lg transition-colors duration-200 animate-fade-in ${
                  theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg ${
                    index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500' :
                    index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500' :
                    index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700' :
                    'bg-gradient-to-br from-red-500 to-red-600'
                  }`}>
                    {index < 3 ? ['🥇', '🥈', '🥉'][index] : index + 1}
                  </div>
                  <div>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{reporter.name}</span>
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Reportador activo</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{reporter.count}</span>
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>IoCs</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className={`card animate-fade-in ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} style={{ animationDelay: '900ms' }}>
        <h3 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { id: 'add-ip', label: 'Agregar IP', icon: '🌐', gradient: 'from-blue-500 to-blue-600' },
            { id: 'add-domain', label: 'Agregar Dominio', icon: '🏷️', gradient: 'from-green-500 to-green-600' },
            { id: 'export', label: 'Exportar', icon: '📤', gradient: 'from-purple-500 to-purple-600' },
            { id: 'list', label: 'Ver Lista', icon: '📋', gradient: 'from-orange-500 to-orange-600' }
          ].map((action, index) => (
            <button
              key={action.id}
              onClick={() => onNavigate(action.id)}
              className={`group relative overflow-hidden border-2 border-dashed rounded-xl p-6 transition-all duration-300 transform hover:scale-105 animate-scale-in ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 hover:border-red-400 hover:bg-red-900/20' 
                  : 'bg-white border-gray-300 hover:border-red-500 hover:bg-red-50'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-center">
                <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center text-white text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {action.icon}
                </div>
                <span className={`text-sm font-medium transition-colors ${
                  theme === 'dark' 
                    ? 'text-gray-200 group-hover:text-red-400' 
                    : 'text-gray-700 group-hover:text-red-600'
                }`}>
                  {action.label}
                </span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}