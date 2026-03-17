import React from 'react';
import { Plus, Edit2, LogOut, FileText, Wallet, CreditCard, Banknote, Calendar, Calculator, Repeat } from 'lucide-react';
import { NewDonationModal } from './NewDonationModal';
import { useBranchDashboard } from '../hooks/useBranchDashboard';

export function BranchDashboard({ onLogout, onBillCalculator, branchName, branchId }: any) {
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
    const labels: Record<number, string> = { 1: 'מזומן', 2: 'אשראי', 3: "צ'ק", 4: 'הו"ק' };
    return labels[Number(method_id)] || 'לא ידוע';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg font-bold">ק"ע</div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 leading-tight">דשבורד סניף</h1>
              <p className="text-xs text-blue-600 font-medium">{branchName} (סניף {branchId})</p>
            </div>
          </div>
          <button onClick={onLogout} className="flex items-center gap-2 text-slate-500 hover:text-red-600 px-3 py-2 rounded-lg transition-colors text-sm font-bold">
            <LogOut className="w-4 h-4" />
            <span>יציאה</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="space-y-6">
          {/* כפתורי פעולה מהירים */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-2xl shadow-lg flex items-center justify-between group transition-transform hover:scale-[1.01]">
              <div className="text-right">
                <h3 className="text-xl font-bold mb-1">תרומה חדשה</h3>
                <p className="text-blue-100 text-sm">קליטה מהירה של תרומה</p>
              </div>
              <Plus className="w-10 h-10 opacity-30" />
            </button>
            <button onClick={onBillCalculator} className="bg-emerald-600 hover:bg-emerald-700 text-white p-6 rounded-2xl shadow-lg flex items-center justify-between group transition-transform hover:scale-[1.01]">
              <div className="text-right">
                <h3 className="text-xl font-bold mb-1">סיכום שטרות</h3>
                <p className="text-emerald-100 text-sm">מחשבון מזומן לסגירת משמרת</p>
              </div>
              <Calculator className="w-10 h-10 opacity-30" />
            </button>
          </div>

          {/* טבלת תרומות */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                תרומות שהתקבלו היום
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-600">
                    <th className="px-6 py-4 text-sm font-bold">סכום לתרומה</th>
                    <th className="px-6 py-4 text-sm font-bold">סוג</th>
                    <th className="px-6 py-4 text-sm font-bold">יעד</th>
                    <th className="px-6 py-4 text-sm font-bold">אמצעי תשלום</th>
                    <th className="px-6 py-4 text-sm font-bold text-left">פעולות</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {donations.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">לא נמצאו תרומות היום</td>
                    </tr>
                  ) : (
                    donations.map((donation: any) => {
                      const isRecurring = !!donation.is_recurring; // הפיכה לבוליאני וודאי
                      const amount = Number(donation.amount) || 0;
                      const months = Number(donation.months_count) || 1;
                      const totalAmount = isRecurring ? amount * months : amount;

                      return (
                        <tr key={donation.id} className="hover:bg-slate-50 transition-colors group">
                          {/* סכום */}
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900 text-lg">
                              ₪{totalAmount.toLocaleString()}
                            </div>
                            {isRecurring && (
                              <div className="text-[11px] text-blue-600 font-medium">
                                {months} חודשים × ₪{amount.toLocaleString()}
                              </div>
                            )}
                          </td>

                          {/* סוג */}
                          <td className="px-6 py-4">
                            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                              isRecurring ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {isRecurring ? <Repeat className="w-3 h-3" /> : null}
                              {isRecurring ? 'מחזורי' : 'חד פעמי'}
                            </div>
                          </td>

                          {/* יעד */}
                          <td className="px-6 py-4 text-sm text-slate-700">
                            {donation.target_id === 1 ? 'קופת העיר' : donation.target_id === 2 ? 'קרנות' : 'אחר'}
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
                            <button onClick={() => handleEditClick(donation)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
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