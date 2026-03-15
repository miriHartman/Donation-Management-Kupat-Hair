import React from 'react';
import { Plus, Edit2, LogOut, FileText, Wallet, CreditCard, Banknote, Calendar, Calculator } from 'lucide-react';
import { NewDonationModal } from './NewDonationModal';
import { useBranchDashboard } from '../hooks/useBranchDashboard';

// עדכון ה-Interface שיתאים לשדות ב-DB
interface DonationData {
  id?: string;
  amount: number;
  target_id: number; // שונה מ-targetId
  method_id: number; // שונה מ-methodId
  is_recurring?: boolean; // בהתאם למה שקיים ב-DB (אם קיים)
  donation_date?: string;
  notes?: string;
  date: string; // הוספת שדה תאריך
}

interface BranchDashboardProps {
  onLogout: () => void;
  onBillCalculator: () => void;
  branchName: string;
  branchId: number;
}

export function BranchDashboard({ onLogout, onBillCalculator, branchName, branchId }: BranchDashboardProps) {
  const {
    donations = [],
    isModalOpen,
    setIsModalOpen,
    editingDonation,
    handleEditClick,
    handleCloseModal,
    fetchDonations 
  } = useBranchDashboard(branchId);

  // פונקציות עזר מעודכנות שמשתמשות בשמות השדות מה-DB
  const getPaymentIcon = (method_id: any) => {
    const id = Number(method_id);
    switch(id) {
      case 1: return <Wallet className="w-4 h-4 text-green-600" />;
      case 2: return <CreditCard className="w-4 h-4 text-blue-600" />;
      case 3: return <FileText className="w-4 h-4 text-amber-600" />;
      case 4: return <Banknote className="w-4 h-4 text-purple-600" />;
      default: return <Banknote className="w-4 h-4 text-slate-600" />;
    }
  };

  const getPaymentLabel = (method_id: any) => {
    const id = Number(method_id);
    const labels: Record<number, string> = { 1: 'מזומן', 2: 'אשראי', 3: "צ'ק", 4: 'הו"ק' };
    return labels[id] || 'לא ידוע';
  };

  const getTargetLabel = (target_id: any) => {
    const id = Number(target_id);
    const targets: Record<number, string> = { 1: 'קופת העיר', 2: 'קרנות', 3: 'אחר' };
    return targets[id] || 'כללי';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans" dir="rtl">
      {/* ... Header ... */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-600/20">
              <Banknote className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">דשבורד סניף</h1>
              <p className="text-xs text-slate-500">{branchName} (סניף {branchId})</p>
            </div>
          </div>
          <button onClick={onLogout} className="flex items-center gap-2 text-slate-500 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 text-sm font-medium transition-colors">
            <LogOut className="w-4 h-4" />
            <span>יציאה</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="space-y-6">
          {/* כפתורי פעולה */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-2xl font-medium shadow-lg transition-all hover:scale-[1.02] flex items-center justify-between group text-right">
              <div><h3 className="text-xl font-bold mb-1">תרומה חדשה</h3><p className="text-sm text-blue-100">הוסף תרומה למערכת</p></div>
              <Plus className="w-10 h-10 opacity-80" />
            </button>
            <button onClick={onBillCalculator} className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-2xl font-medium shadow-lg transition-all hover:scale-[1.02] flex items-center justify-between group text-right">
              <div><h3 className="text-xl font-bold mb-1">סיכום שטרות</h3><p className="text-sm text-green-100">סיכום יומי של המזומן</p></div>
              <Calculator className="w-10 h-10 opacity-80" />
            </button>
          </div>

          {/* טבלת תרומות */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100"><h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Calendar className="w-5 h-5 text-blue-600" />תרומות היום</h2></div>
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">סכום</th>
                    <th className="px-6 py-4">יעד</th>
                    <th className="px-6 py-4">אמצעי תשלום</th>
                    <th className="px-6 py-4">סטטוס</th>
                    <th className="px-6 py-4 text-left">פעולות</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {donations.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">לא נמצאו תרומות היום</td></tr>
                  ) : (
                    donations.map((donation: any) => (
                      <tr key={donation.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-4 font-bold text-slate-900">₪{Number(donation.amount).toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                            {getTargetLabel(donation.target_id)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-slate-700">
                            {getPaymentIcon(donation.method_id)}
                            <span className="text-sm">{getPaymentLabel(donation.method_id)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs px-2 py-1 rounded-md ${donation.status === 'completed' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                            {donation.status === 'completed' ? 'בוצע' : 'במתנה'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-left">
                          <button onClick={() => handleEditClick(donation)} className="p-2 text-slate-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all">
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {isModalOpen && (
        <NewDonationModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onRefresh={fetchDonations}
          editingDonation={editingDonation}
          branchId={branchId}
        />
      )}
    </div>
  );
}