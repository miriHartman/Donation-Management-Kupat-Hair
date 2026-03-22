import React, { useEffect, useState } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { BranchSelector } from './components/BranchSelector';
import { BranchDashboard } from './components/BranchDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { BillCalculator } from './components/BillCalculator';
import { Layout } from './components/ui/Layout';

export type ViewState = 'login' | 'branchSelector' | 'branch' | 'admin' | 'billCalculator';




export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('login');
  const [selectedBranch, setSelectedBranch] = useState<{ id: number; name: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // אם יש טוקן, נעבור ישר לבחירת סניף
      setCurrentView('branchSelector');
    }
  }, []);

  const handleLogin = () => {
    setCurrentView('branchSelector');
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

  const handleBillCalculator = () => {
    setCurrentView('billCalculator');
  };

  const handleBackToBranch = () => {
    setCurrentView('branch');
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
          onBillCalculator={handleBillCalculator}
          branchName={selectedBranch.name}
          branchId={selectedBranch.id}
        />
      )}
      {currentView === 'admin' && <AdminDashboard onLogout={handleLogout} onBack={handleBackToSelector} />}
      {currentView === 'billCalculator' && selectedBranch && (
        <BillCalculator 
          onBack={handleBackToBranch}
          branchName={selectedBranch.name}
        />
      )}
    </Layout>
  );
}