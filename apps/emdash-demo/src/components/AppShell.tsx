import React, { useState } from 'react';
import Auth from './Auth';
import AdminApp from './AdminApp';
import ClientApp from './ClientApp';

export default function AppShell() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<'admin' | 'client' | null>(null);

  const handleLogin = (selectedRole: 'admin' | 'client', userData: any) => {
    setRole(selectedRole);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setRole(null);
  };

  if (!isAuthenticated) {
    return <Auth onLogin={handleLogin} />;
  }

  if (role === 'admin') {
    return <AdminApp user={user} onLogout={handleLogout} />;
  }

  if (role === 'client') {
    return <ClientApp user={user} onLogout={handleLogout} />;
  }

  return null;
}
