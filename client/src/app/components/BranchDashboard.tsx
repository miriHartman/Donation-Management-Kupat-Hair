import React from 'react';
import { Plus, Edit2, LogOut, FileText, Wallet, CreditCard, Banknote, Calendar, Calculator, Repeat } from 'lucide-react';
import { NewDonationModal } from './NewDonationModal';
import { useBranchDashboard } from '../hooks/useBranchDashboard';

interface DonationData {
  id?: string;
  amount: number;
  target_id: number;
  method_id: number;
  is_recurring: boolean;
  months_count: number;
  donation_date?: string;
  notes?: string;
  status: 'completed' | 'pending' | 'cancelled';
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
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg font-bold">
               ק"ע
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 leading-tight">דשבורד סניף</h1>
              <p className="text-xs text-blue-600 font-medium">{branchName} (סניף {branchId})</p>
            </div>
          </div>
          <button onClick={onLogout} className="flex items-center gap-2 text-slate-500 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors text-sm font-bold">
            <LogOut className="w-4 h-4" />
            <span>יציאה</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="space-y-6">
          {/* כפתורי פעולה */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-2xl shadow-lg transition-all hover:scale-[1.01] flex items-center justify-between group">
              <div className="text-right">
                <h3 className="text-xl font-bold mb-1 text-white">תרומה חדשה</h3>
                <p className="text-blue-100 text-sm italic">קליטה מהירה של תרומה</p>
              </div>
              <Plus className="w-12 h-12 opacity-20" />
            </button>
            <button onClick={onBillCalculator} className="bg-emerald-600 hover:bg-emerald-700 text-white p-6 rounded-2xl shadow-lg transition-all hover:scale-[1.01] flex items-center justify-between group">
              <div className="text-right">
                <h3 className="text-xl font-bold mb-1 text-white">סיכום שטרות</h3>
                <p className="text-emerald-100 text-sm italic">מחשבון מזומן לסגירת משמרת</p>
              </div>
              <Calculator className="w-12 h-12 opacity-20" />
            </button>
          </div>

          {/* טבלת תרומות */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden text-right">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                תרומות שהתקבלו היום
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-600">
                    <th className="px-6 py-4 text-sm font-bold text-right">סה"כ לתרומה</th>
                    <th className="px-6 py-4 text-sm font-bold text-right">סוג</th>
                    <th className="px-6 py-4 text-sm font-bold text-right">פירוט תקופה</th>
                    <th className="px-6 py-4 text-sm font-bold text-right">יעד</th>
                    <th className="px-6 py-4 text-sm font-bold text-right">אמצעי תשלום</th>
                    <th className="px-6 py-4 text-sm font-bold text-left">פעולות</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {donations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">לא נמצאו תרומות ביום זה</td>
                    </tr>
                  ) : (
                    donations.map((donation: any) => {
                      // חישוב סכום כולל
                      const totalAmount = donation.is_recurring 
                        ? Number(donation.amount) * (donation.months_count || 1)
                        : Number(donation.amount);

                      return (
                        <tr key={donation.id} className="hover:bg-blue-50/30 transition-colors group">
                          {/* סכום כולל */}
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900 text-lg">₪{totalAmount.toLocaleString()}</div>
                            {donation.is_recurring && (
                              <div className="text-[10px] text-slate-500 font-medium">
                                (₪{Number(donation.amount).toLocaleString()} × {donation.months_count} חודשים)
                              </div>
                            )}
                          </td>

                          {/* סוג תרומה */}
                          <td className="px-6 py-4">
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                              donation.is_recurring 
                                ? 'bg-purple-50 text-purple-700 border border-purple-100' 
                                : 'bg-slate-50 text-slate-600 border border-slate-100'
                            }`}>
                              {donation.is_recurring && <Repeat className="w-3 h-3" />}
                              {donation.is_recurring ? 'מחזורי' : 'חד פעמי'}
                            </div>
                          </td>

                          {/* חודשים */}
                          <td className="px-6 py-4">
                            {donation.is_recurring ? (
                              <span className="text-sm font-bold text-slate-700 bg-blue-50 px-2 py-1 rounded">
                                {donation.months_count} חודשים
                              </span>
                            ) : (
                              <span className="text-slate-300 text-xs italic text-right block w-full">ללא פריסה</span>
                            )}
                          </td>

                          {/* יעד */}
                          <td className="px-6 py-4 text-sm font-medium text-slate-700">
                            {getTargetLabel(donation.target_id)}
                          </td>

                          {/* אמצעי תשלום */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                              {getPaymentIcon(donation.method_id)}
                              <span>{getPaymentLabel(donation.method_id)}</span>
                            </div>
                          </td>

                          {/* פעולות */}
                          <td className="px-6 py-4 text-left">
                            <button 
                              onClick={() => handleEditClick(donation)} 
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-slate-100 transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
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