// components/Layout.tsx
'use client';

import { User } from '@/types';
import { AuthService } from '@/lib/auth';
import ToastContainer from './ToastContainer';

interface LayoutProps {
  user: User;
  currentSection: string;
  onNavigate: (section: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export default function Layout({ user, currentSection, onNavigate, onLogout, children }: LayoutProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: '📊', gradient: 'from-blue-500 to-blue-600' },
    { id: 'list', label: 'Liste des IoCs', icon: '📋', gradient: 'from-gray-500 to-gray-600' },
    { id: 'add-ip', label: 'Ajouter IP', icon: '🌐', gradient: 'from-blue-500 to-blue-600' },
    { id: 'add-domain', label: 'Ajouter Domaine', icon: '🏷️', gradient: 'from-green-500 to-green-600' },
    { id: 'add-url', label: 'Ajouter URL', icon: '🔗', gradient: 'from-purple-500 to-purple-600' },
    { id: 'add-hash', label: 'Ajouter Hash', icon: '#️⃣', gradient: 'from-orange-500 to-orange-600' },
    { id: 'export', label: 'Export', icon: '📤', gradient: 'from-indigo-500 to-indigo-600' },
  ];

  const handleLogout = () => {
    AuthService.logout();
    
    // Afficher notification de déconnexion
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('show-toast', {
        detail: {
          type: 'info',
          message: 'Déconnexion réussie'
        }
      });
      window.dispatchEvent(event);
    }
    
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center">
                  <div className="bg-gradient-to-br from-red-600 to-red-700 w-10 h-10 rounded-xl flex items-center justify-center mr-3 shadow-lg animate-glow">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                      FortiGate IoC Manager
                    </h1>
                    <p className="text-xs text-gray-500">Sécurité & Threat Intelligence</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-sm font-bold text-red-600">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-medium text-gray-900">{user.username}</div>
                  <div className="text-xs text-gray-500 capitalize">
                    {user.role === 'admin' ? '👑 Administrateur' : '👤 ' + user.role}
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="btn-primary px-4 py-2 text-sm font-medium flex items-center hover:scale-105 transition-transform duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                </svg>
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-sm min-h-screen border-r border-gray-200">
          <div className="p-4">
            <div className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center space-x-3 group ${
                    currentSection === item.id
                      ? 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border-2 border-red-200 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-2 border-transparent hover:border-gray-200'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                    <span className="text-sm">{item.icon}</span>
                  </div>
                  <span className="flex-1">{item.label}</span>
                  {currentSection === item.id && (
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Stats in Sidebar */}
          <div className="p-4 border-t border-gray-200 mt-8">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3,3V21H21V19H5V3H3M9,17H7V10H9V17M13,17H11V7H13V17M17,17H15V13H17V17Z"/>
              </svg>
              Stats Rapides
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3 animate-pulse"></div>
                  <span className="text-sm text-blue-700 font-medium">Total IoCs</span>
                </div>
                <span className="font-bold text-blue-900">-</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3 animate-pulse"></div>
                  <span className="text-sm text-yellow-700 font-medium">En attente</span>
                </div>
                <span className="font-bold text-yellow-900">-</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></div>
                  <span className="text-sm text-green-700 font-medium">Approuvés</span>
                </div>
                <span className="font-bold text-green-900">-</span>
              </div>
            </div>

            {/* User Info Card */}
            <div className="mt-6 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-red-500 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-xs font-bold text-white">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.username}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user.role === 'admin' ? 'Administrateur' : user.role}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center text-xs text-gray-500">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                Connecté depuis {user.createdAt.toLocaleDateString('fr-FR')}
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="transition-all duration-300 ease-in-out">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
}