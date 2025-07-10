// components/Dashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { DashboardStats } from '@/types';
import { IoCService } from '@/lib/ioc';

interface DashboardProps {
  onNavigate: (section: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const dashboardStats = await IoCService.getDashboardStats();
      setStats(dashboardStats);
      setAnimationKey(prev => prev + 1);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
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

  if (!stats) {
    return (
      <div className="text-center text-gray-500 mt-8 animate-fade-in">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <svg className="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-red-800 mb-2">Erreur de chargement</h3>
          <p className="text-red-600">Impossible de charger les statistiques du tableau de bord</p>
          <button 
            onClick={loadStats}
            className="mt-4 btn-primary"
          >
            Réessayer
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
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100 border-green-200';
      case 'pending': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'rejected': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
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

  const StatCard = ({ title, value, icon, gradient, delay }: {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    gradient: string;
    delay: number;
  }) => (
    <div 
      className="card hover:scale-105 transform transition-all duration-300 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center">
        <div className={`p-4 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
          <div className="text-white text-xl">
            {icon}
          </div>
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <div className="flex items-baseline">
            <p className="text-3xl font-bold text-gray-900 animate-scale-in" key={`${value}-${animationKey}`}>
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
        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 animate-slide-in-right"
        style={{ animationDelay: `${delay}ms` }}
      >
        <div className="flex items-center flex-1">
          <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${color} mr-3 shadow-sm`}></div>
          <span className="text-sm font-medium text-gray-700 capitalize min-w-0 flex-1">{label}</span>
        </div>
        <div className="flex items-center space-x-3 ml-4">
          <div className="w-24 bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${color} transition-all duration-1000 ease-out chart-bar`}
              style={{ 
                width: `${percentage}%`,
                animationDelay: `${delay + 200}ms`
              }}
            ></div>
          </div>
          <span className="text-sm font-bold text-gray-900 min-w-[2rem] text-right">{value}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header avec animation */}
      <div className="card animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
              Tableau de Bord
            </h1>
            <p className="text-gray-600">Vue d'ensemble des Indicateurs de Compromission</p>
          </div>
          <div className="animate-float">
            <div className="p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total IoCs"
          value={stats.totalIoCs}
          icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>}
          gradient="from-red-500 to-red-600"
          delay={0}
        />
        <StatCard
          title="En attente"
          value={stats.iocsByStatus.pending || 0}
          icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>}
          gradient="from-yellow-500 to-yellow-600"
          delay={100}
        />
        <StatCard
          title="Approuvés"
          value={stats.iocsByStatus.approved || 0}
          icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>}
          gradient="from-green-500 to-green-600"
          delay={200}
        />
        <StatCard
          title="Cette semaine"
          value={stats.weeklyTrend.reduce((sum, day) => sum + day.count, 0)}
          icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-1 16H9V7h9v14z"/></svg>}
          gradient="from-blue-500 to-blue-600"
          delay={300}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* IoCs by Type */}
        <div className="card animate-slide-in-left" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">IoCs par Type</h3>
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
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

        {/* IoCs by Severity */}
        <div className="card animate-slide-in-right" style={{ animationDelay: '500ms' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">IoCs par Sévérité</h3>
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L13.09 8.26L22 9L14.22 13.73L18.18 22L12 18L5.82 22L9.78 13.73L2 9L10.91 8.26L12 2Z"/>
              </svg>
            </div>
          </div>
          <div className="space-y-4">
            {Object.entries(stats.iocsBySeverity).map(([severity, count], index) => (
              <ChartBar
                key={severity}
                label={severity}
                value={count}
                maxValue={Math.max(...Object.values(stats.iocsBySeverity))}
                color={getSeverityColor(severity)}
                delay={index * 100}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Weekly Trend Chart */}
      <div className="card animate-fade-in" style={{ animationDelay: '600ms' }}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Tendance Hebdomadaire</h3>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3,13H4V19H6V11H7V19H9V7H10V19H12V9H13V19H15V6H16V19H18V14H19V19H21V4H3V13Z"/>
              </svg>
            </div>
            <span className="text-sm text-gray-500">7 derniers jours</span>
          </div>
        </div>
        <div className="flex items-end justify-between space-x-2 h-40 p-4 bg-gradient-to-t from-gray-50 to-white rounded-lg">
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
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-10">
                    {day.count} IoCs
                  </div>
                </div>
                <div className="text-center mt-2">
                  <span className="text-xs text-gray-600 transition-colors group-hover:text-gray-900 font-medium">
                    {new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'short' })}
                  </span>
                  <div className="text-xs font-bold text-gray-900 group-hover:text-red-600 transition-colors mt-1">
                    {day.count}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity and Top Reporters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="card animate-slide-in-left" style={{ animationDelay: '700ms' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Activité Récente</h3>
            <button 
              onClick={() => onNavigate('list')}
              className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center group transition-colors"
            >
              Voir tout
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"/>
              </svg>
            </button>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {stats.recentActivity.slice(0, 6).map((ioc, index) => (
              <div 
                key={ioc.id} 
                className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-gray-100 hover:to-gray-200 transition-all duration-200 animate-fade-in border border-gray-200"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getSeverityColor(ioc.severity)} shadow-sm`}></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate max-w-32" title={ioc.value}>
                      {ioc.value}
                    </p>
                    <p className="text-xs text-gray-600">{ioc.reporter}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(ioc.status)}`}>
                    {ioc.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {ioc.dateReported.toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Reporters */}
        <div className="card animate-slide-in-right" style={{ animationDelay: '800ms' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Top Rapporteurs</h3>
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M7.07,18.28C7.5,17.38 10.12,16.5 12,16.5C13.88,16.5 16.5,17.38 16.93,18.28C15.57,19.36 13.86,20 12,20C10.14,20 8.43,19.36 7.07,18.28M18.36,16.83C16.93,15.09 13.46,14.5 12,14.5C10.54,14.5 7.07,15.09 5.64,16.83C4.62,15.5 4,13.82 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,13.82 19.38,15.5 18.36,16.83M12,6C10.06,6 8.5,7.56 8.5,9.5C8.5,11.44 10.06,13 12,13C13.94,13 15.5,11.44 15.5,9.5C15.5,7.56 13.94,6 12,6M12,11A1.5,1.5 0 0,1 10.5,9.5A1.5,1.5 0 0,1 12,8A1.5,1.5 0 0,1 13.5,9.5A1.5,1.5 0 0,1 12,11Z"/>
              </svg>
            </div>
          </div>
          <div className="space-y-4">
            {stats.topReporters.map((reporter, index) => (
              <div 
                key={reporter.name} 
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200 animate-fade-in"
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
                    <span className="text-sm font-medium text-gray-900">{reporter.name}</span>
                    <div className="text-xs text-gray-500">Rapporteur actif</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-gray-900">{reporter.count}</span>
                  <div className="text-xs text-gray-500">IoCs</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card animate-fade-in" style={{ animationDelay: '900ms' }}>
        <h3 className="text-xl font-bold text-gray-900 mb-6">Actions Rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { id: 'add-ip', label: 'Ajouter IP', icon: '🌐', gradient: 'from-blue-500 to-blue-600' },
            { id: 'add-domain', label: 'Ajouter Domaine', icon: '🏷️', gradient: 'from-green-500 to-green-600' },
            { id: 'export', label: 'Exporter', icon: '📤', gradient: 'from-purple-500 to-purple-600' },
            { id: 'list', label: 'Voir Liste', icon: '📋', gradient: 'from-orange-500 to-orange-600' }
          ].map((action, index) => (
            <button
              key={action.id}
              onClick={() => onNavigate(action.id)}
              className="group relative overflow-hidden bg-white border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-red-500 hover:bg-red-50 transition-all duration-300 transform hover:scale-105 animate-scale-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-center">
                <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center text-white text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {action.icon}
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-red-600 transition-colors">
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