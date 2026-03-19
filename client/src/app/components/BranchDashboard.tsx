import React from 'react';
import {
  Plus,
  Edit2,
  LogOut,
  FileText,
  Wallet,
  CreditCard,
  Banknote,
  Calendar,
  Calculator,
  Repeat,
  Trash2
} from 'lucide-react';
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
    fetchDonations,
    handleDelete
  } = useBranchDashboard(branchId);

  // פונקציות עזר לתוויות
  const getPaymentIcon = (methodId: any) => {
    const id = Number(methodId);
    switch (id) {
      case 1: return <Wallet className="w-4 h-4 text-green-600" />;
      case 2: return <CreditCard className="w-4 h-4 text-blue-600" />;
      case 3: return <FileText className="w-4 h-4 text-amber-600" />;
      case 4: return <Banknote className="w-4 h-4 text-purple-600" />;
      default: return <Banknote className="w-4 h-4 text-slate-600" />;
    }
  };

  const getPaymentLabel = (methodId: any) => {
    const labels: Record<number, string> = { 1: 'מזומן', 2: 'אשראי', 3: "צ'ק", 4: 'הו"ק' };
    return labels[Number(methodId)] || 'לא ידוע';
  };

  const getTargetLabel = (targetId: any) => {
    const targets: Record<number, string> = { 1: 'קופת העיר', 2: 'קרנות', 3: 'אחר' };
    return targets[Number(targetId)] || 'כללי';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg font-bold text-lg">ק"ע</div>
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
          {/* כפתורים מהירים */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-2xl shadow-lg flex items-center justify-between group transition-all hover:scale-[1.01]">
              <div className="text-right">
                <h3 className="text-xl font-bold mb-1">תרומה חדשה</h3>
                <p className="text-blue-100 text-sm opacity-80">קליטה מהירה של תרומה</p>
              </div>
              <Plus className="w-10 h-10 opacity-30" />
            </button>
            <button onClick={onBillCalculator} className="bg-emerald-600 hover:bg-emerald-700 text-white p-6 rounded-2xl shadow-lg flex items-center justify-between group transition-all hover:scale-[1.01]">
              <div className="text-right">
                <h3 className="text-xl font-bold mb-1">סיכום שטרות</h3>
                <p className="text-emerald-100 text-sm opacity-80">מחשבון מזומן לסגירת משמרת</p>
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
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 text-xs sm:text-sm">
                    {/* שינוי סדר: סה"כ תרומה ראשון מימין */}
                    <th className="px-4 py-4 font-bold text-blue-900">סה"כ לתרומה</th>
                    <th className="px-4 py-4 font-bold">סכום (לחודש)</th>
                    <th className="px-4 py-4 font-bold">חודשים</th>
                    <th className="px-4 py-4 font-bold">סוג</th>
                    <th className="px-4 py-4 font-bold">יעד</th>
                    <th className="px-4 py-4 font-bold">אמצעי תשלום</th>
                    <th className="px-4 py-4 font-bold text-left">פעולות</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {donations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-400 italic">אין תרומות להצגה</td>
                    </tr>
                  ) : (
                    donations.map((donation: any) => {
                      const isRec = !!donation.isRecurring;
                      const amount = Number(donation.amount) || 0;
                      const months = isRec ? (Number(donation.installments) || 1) : 1;
                      const total = isRec ? (amount * months) : amount;

                      return (
                        <tr key={donation.id} className="hover:bg-blue-50/30 transition-colors group">
                          {/* 1. סה"כ (הכי ימני) */}
                          <td className="px-4 py-4">
                            <div className="text-base font-black text-blue-900">
                              ₪{total.toLocaleString()}
                            </div>
                          </td>

                          {/* 2. סכום לחודש */}
                          <td className="px-4 py-4 font-bold text-slate-700">
                            ₪{amount.toLocaleString()}
                          </td>

                          {/* 3. חודשים */}
                          <td className="px-4 py-4">
                            {isRec ? (
                              <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded font-bold text-xs">
                                {months} חודשים
                              </span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>

                          {/* 4. סוג */}
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold ${isRec ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                              }`}>
                              {isRec && <Repeat className="w-3 h-3" />}
                              {isRec ? 'מחזורי' : 'חד פעמי'}
                            </span>
                          </td>

                          {/* 5. יעד */}
                          <td className="px-4 py-4 text-sm text-slate-700">
                            {getTargetLabel(donation.targetId)}
                          </td>

                          {/* 6. אמצעי תשלום */}
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              {getPaymentIcon(donation.methodId)}
                              <span>{getPaymentLabel(donation.methodId)}</span>
                            </div>
                          </td>

                          {/* 7. פעולות (הכי שמאלי) */}
                          <td className="px-4 py-4 text-left">
  <div className="flex items-center justify-end gap-2">
    {/* כפתור עריכה */}
    <button
      onClick={() => handleEditClick(donation)}
      className="p-2 text-slate-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all rounded-full hover:bg-white shadow-sm"
      title="עריכה"
    >
      <Edit2 className="w-4 h-4" />
    </button>

    {/* כפתור מחיקה */}
    <button
      onClick={() => {
        if (window.confirm('האם אתה בטוח שברצונך למחוק תרומה זו?')) {
          handleDelete(donation.id);
        }
      }}
      className="p-2 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all rounded-full hover:bg-white shadow-sm"
      title="מחיקה"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  </div>
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