import { useState } from 'react';
import { Building2, ArrowRight, Banknote, WalletCards } from 'lucide-react';
import { DonationsManagement } from './DonationsManagement';
import { BranchesManagement } from './BranchesManagement';
import { FundsManagement } from './FundsManagement';

interface AdminDashboardProps {
  onLogout: () => void;
  onBack: () => void;
}

export function AdminDashboard({ onLogout, onBack }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'donations' | 'funds' | 'branches'>('donations');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-right" dir="rtl">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <ArrowRight className="w-6 h-6" />
            </button>
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">ניהול מערכת</h1>
              <p className="text-xs text-slate-500">ממשק מנהל כללי</p>
            </div>
          </div>

          <nav className="hidden md:flex bg-slate-100 p-1 rounded-xl gap-1">
            <button onClick={() => setActiveTab('donations')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'donations' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <Banknote className="w-4 h-4" /> תרומות כללי
            </button>
            <button onClick={() => setActiveTab('funds')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'funds' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <WalletCards className="w-4 h-4" /> תרומות - קרנות
            </button>
            <button onClick={() => setActiveTab('branches')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'branches' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <Building2 className="w-4 h-4" /> סניפים
            </button>
          </nav>

          <div className="flex items-center gap-4">
            <button onClick={onLogout} className="text-slate-400 hover:text-red-600 text-sm font-medium">יציאה</button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full">
        {activeTab === 'donations' && <DonationsManagement />}
         {activeTab === 'funds' && <FundsManagement />}
        {activeTab === 'branches' && <BranchesManagement />}
      </main>
    </div>
  );
}