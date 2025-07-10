// components/Layout.tsx
'use client';

import { User } from '@/types';
import { AuthService } from '@/lib/auth';
import ToastContainer from './ToastContainer';

interface LayoutProps {
  user: User;
  currentSection: string;
  theme: 'light' | 'dark';
  onNavigate: (section: string) => void;
  onThemeToggle: () => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export default function Layout({ user, currentSection, theme, onNavigate, onThemeToggle, onLogout, children }: LayoutProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', gradient: 'from-blue-500 to-blue-600' },
    { id: 'list', label: 'Lista de IoCs', icon: '📋', gradient: 'from-gray-500 to-gray-600' },
    { id: 'add-ip', label: 'Agregar IP', icon: '🌐', gradient: 'from-blue-500 to-blue-600' },
    { id: 'add-domain', label: 'Agregar Dominio', icon: '🏷️', gradient: 'from-green-500 to-green-600' },
    { id: 'add-url', label: 'Agregar URL', icon: '🔗', gradient: 'from-purple-500 to-purple-600' },
    { id: 'add-hash', label: 'Agregar Hash', icon: '#️⃣', gradient: 'from-orange-500 to-orange-600' },
    { id: 'export', label: 'Exportar', icon: '📤', gradient: 'from-indigo-500 to-indigo-600' },
  ];

  const handleLogout = () => {
    AuthService.logout();
    
    // Mostrar notificación de desconexión
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('show-toast', {
        detail: {
          type: 'info',
          message: 'Sesión cerrada correctamente'
        }
      });
      window.dispatchEvent(event);
    }
    
    onLogout();
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return '👑 Administrador';
      case 'user': return '👤 Usuario';
      default: return '👤 ' + role;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Header */}
      <header className={`shadow-sm border-b transition-colors duration-300 ${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
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
                    <h1 className="text-xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                      FortiGate IoC Manager
                    </h1>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Seguridad & Inteligencia de Amenazas
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={onThemeToggle}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  theme === 'dark' 
                    ? 'bg-yellow-500 hover:bg-yellow-400 text-white' 
                    : 'bg-gray-800 hover:bg-gray-700 text-white'
                }`}
                title={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
              >
                {theme === 'dark' ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd"/>
                  </svg>
                )}
              </button>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-sm font-bold text-red-600">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {user.username}
                  </div>
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {getRoleLabel(user.role)}
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
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className={`w-64 shadow-sm min-h-screen border-r transition-colors duration-300 ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="p-4">
            <div className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center space-x-3 group ${
                    currentSection === item.id
                      ? theme === 'dark'
                        ? 'bg-gradient-to-r from-red-900/50 to-red-800/50 text-red-300 border-2 border-red-700 shadow-sm'
                        : 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border-2 border-red-200 shadow-sm'
                      : theme === 'dark'
                        ? 'text-gray-300 hover:bg-gray-700 hover:text-white border-2 border-transparent hover:border-gray-600'
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

          {/* Stats rápidas en sidebar */}
          <div className={`p-4 border-t mt-8 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`text-xs font-bold uppercase tracking-wide mb-4 flex items-center ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3,3V21H21V19H5V3H3M9,17H7V10H9V17M13,17H11V7H13V17M17,17H15V13H17V17Z"/>
              </svg>
              Estadísticas Rápidas
            </h3>
            <div className="space-y-3">
              <div className={`flex justify-between items-center p-3 rounded-lg border ${
                theme === 'dark' 
                  ? 'bg-gradient-to-r from-blue-900/30 to-blue-800/30 border-blue-700' 
                  : 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200'
              }`}>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3 animate-pulse"></div>
                  <span className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-blue-300' : 'text-blue-700'
                  }`}>Total IoCs</span>
                </div>
                <span className={`font-bold ${
                  theme === 'dark' ? 'text-blue-200' : 'text-blue-900'
                }`}>-</span>
              </div>
              
              <div className={`flex justify-between items-center p-3 rounded-lg border ${
                theme === 'dark' 
                  ? 'bg-gradient-to-r from-yellow-900/30 to-yellow-800/30 border-yellow-700' 
                  : 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200'
              }`}>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3 animate-pulse"></div>
                  <span className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-yellow-300' : 'text-yellow-700'
                  }`}>Pendientes</span>
                </div>
                <span className={`font-bold ${
                  theme === 'dark' ? 'text-yellow-200' : 'text-yellow-900'
                }`}>-</span>
              </div>
              
              <div className={`flex justify-between items-center p-3 rounded-lg border ${
                theme === 'dark' 
                  ? 'bg-gradient-to-r from-green-900/30 to-green-800/30 border-green-700' 
                  : 'bg-gradient-to-r from-green-50 to-green-100 border-green-200'
              }`}>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></div>
                  <span className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-green-300' : 'text-green-700'
                  }`}>Aprobados</span>
                </div>
                <span className={`font-bold ${
                  theme === 'dark' ? 'text-green-200' : 'text-green-900'
                }`}>-</span>
              </div>
            </div>

            {/* Tarjeta de info del usuario */}
            <div className={`mt-6 p-4 rounded-xl border ${
              theme === 'dark' 
                ? 'bg-gradient-to-br from-gray-700 to-gray-800 border-gray-600' 
                : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'
            }`}>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-red-500 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-xs font-bold text-white">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {user.username}
                  </p>
                  <p className={`text-xs ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                  </p>
                </div>
              </div>
              <div className={`mt-3 flex items-center text-xs ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                Conectado desde {user.createdAt.toLocaleDateString('es-ES')}
              </div>
            </div>
          </div>
        </nav>

        {/* Contenido principal */}
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="transition-all duration-300 ease-in-out">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Notificaciones Toast */}
      <ToastContainer />
    </div>
  );
}