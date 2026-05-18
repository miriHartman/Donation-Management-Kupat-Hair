import React, { useEffect, useState } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { BranchSelector } from './components/BranchSelector';
import { BranchDashboard } from './components/BranchDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { Layout } from './components/ui/Layout';
import { useTokenExpiry } from './hooks/useAuth';

export type ViewState = 'login' | 'branchSelector' | 'branch' | 'admin';



export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('login');
  const [selectedBranch, setSelectedBranch] = useState<{ id: number; name: string } | null>(null);

  useTokenExpiry(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('loginTime');
    setCurrentView('login');
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    if (user?.role === 'admin') {
      setCurrentView('branchSelector');
    } else if (user?.branchId && user?.branchName) {
      setSelectedBranch({ id: user.branchId, name: user.branchName });
      setCurrentView('branch');
    } else {
      setCurrentView('branchSelector');
    }
  }, []);
  //כניסה ישירה לסניף
  const handleLogin = (
    view: 'branch' | 'branchSelector',
    branch?: { id: number; name: string }
  ) => {
    if (branch) setSelectedBranch(branch);
    setCurrentView(view);
  };

  const handleLogout = () => {
    // חשוב: במחיקת לוגאוט, ננקה גם את הטוקן
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setSelectedBranch(null);
    setCurrentView('login');
  };
  const handleBranchSelect = (branchId: number, branchName: string) => {
    setSelectedBranch({ id: branchId, name: branchName });
    setCurrentView('branch');
  };

  const handleAdminAccess = () => {
    setCurrentView('admin');
  };


  // פונקציה חדשה: חזרה לבחירת סניף
  const handleBackToSelector = () => {
    setCurrentView('branchSelector');
  };




  return (
    <Layout>
      {currentView === 'login' && <LoginScreen onLogin={handleLogin} />}
      {currentView === 'branchSelector' && (
        <BranchSelector
          onSelectBranch={handleBranchSelect}
          onAdminAccess={handleAdminAccess}
        />
      )}
      {currentView === 'branch' && selectedBranch && (
        <BranchDashboard
          onLogout={handleLogout}
          onBack={handleBackToSelector}
          branchName={selectedBranch.name}
          branchId={selectedBranch.id}
        />
      )}
      {currentView === 'admin' && <AdminDashboard onLogout={handleLogout} onBack={handleBackToSelector} />}
    </Layout>
  );
}