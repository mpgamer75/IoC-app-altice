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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
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
  };

  const handleFormSuccess = () => {
    setCurrentSection('dashboard');
    // You could also show a success message here
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (currentSection) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      
      case 'list':
        return <IoCList />;
      
      case 'add-ip':
        return (
          <IoCForm
            type="ip"
            onSuccess={handleFormSuccess}
            onCancel={() => setCurrentSection('dashboard')}
          />
        );
      
      case 'add-domain':
        return (
          <IoCForm
            type="domain"
            onSuccess={handleFormSuccess}
            onCancel={() => setCurrentSection('dashboard')}
          />
        );
      
      case 'add-url':
        return (
          <IoCForm
            type="url"
            onSuccess={handleFormSuccess}
            onCancel={() => setCurrentSection('dashboard')}
          />
        );
      
      case 'add-hash':
        return (
          <IoCForm
            type="hash"
            onSuccess={handleFormSuccess}
            onCancel={() => setCurrentSection('dashboard')}
          />
        );
      
      case 'export':
        return <ExportSection />;
      
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <Layout
      user={user}
      currentSection={currentSection}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
}