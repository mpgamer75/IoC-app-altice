// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types';
import { AuthService } from '@/lib/auth';
import LoginForm from '@/components/LoginForm';
import Layout from '@/components/Layout';
import Dashboard from '@/components/Dashboard';
import IoCForm from '@/components/IoCForm';
import IoCList from '@/components/IoCList';
import ExportSection from '@/components/ExportSection';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si el usuario ya está autenticado
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }

    // Cargar tema guardado
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    setTheme(savedTheme);
    
    // Aplicar tema al documento
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    
    setLoading(false);
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    setCurrentSection('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentSection('dashboard');
  };

  const handleNavigate = (section: string) => {
    setCurrentSection(section);
    
    // Scroll hacia arriba para mejor UX
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    // Guardar tema en localStorage
    localStorage.setItem('theme', newTheme);
    
    // Aplicar tema al documento
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    
    // Mostrar notificación
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('show-toast', {
        detail: {
          type: 'info',
          message: `Tema cambiado a ${newTheme === 'dark' ? 'oscuro' : 'claro'}`
        }
      });
      window.dispatchEvent(event);
    }
  };

  const handleFormSuccess = () => {
    setCurrentSection('dashboard');
    
    // Mostrar notificación de éxito
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('show-toast', {
        detail: {
          type: 'success',
          message: 'IoC creado exitosamente!'
        }
      });
      window.dispatchEvent(event);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-600 border-t-transparent"></div>
          <div className="absolute inset-0 animate-pulse">
            <div className="rounded-full h-16 w-16 bg-red-100"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (currentSection) {
      case 'dashboard':
        return (
          <Dashboard 
            onNavigate={handleNavigate} 
            theme={theme}
            onThemeToggle={handleThemeToggle}
          />
        );
      
      case 'list':
        return <IoCList theme={theme} />;
      
      case 'add-ip':
        return (
          <IoCForm
            type="ip"
            theme={theme}
            onSuccess={handleFormSuccess}
            onCancel={() => setCurrentSection('dashboard')}
          />
        );
      
      case 'add-domain':
        return (
          <IoCForm
            type="domain"
            theme={theme}
            onSuccess={handleFormSuccess}
            onCancel={() => setCurrentSection('dashboard')}
          />
        );
      
      case 'add-url':
        return (
          <IoCForm
            type="url"
            theme={theme}
            onSuccess={handleFormSuccess}
            onCancel={() => setCurrentSection('dashboard')}
          />
        );
      
      case 'add-hash':
        return (
          <IoCForm
            type="hash"
            theme={theme}
            onSuccess={handleFormSuccess}
            onCancel={() => setCurrentSection('dashboard')}
          />
        );
      
      case 'export':
        return <ExportSection theme={theme} />;
      
      default:
        return (
          <Dashboard 
            onNavigate={handleNavigate} 
            theme={theme}
            onThemeToggle={handleThemeToggle}
          />
        );
    }
  };

  return (
    <Layout
      user={user}
      currentSection={currentSection}
      theme={theme}
      onNavigate={handleNavigate}
      onThemeToggle={handleThemeToggle}
      onLogout={handleLogout}
    >
      <div className="transition-all duration-300 ease-in-out">
        {renderContent()}
      </div>
    </Layout>
  );
}