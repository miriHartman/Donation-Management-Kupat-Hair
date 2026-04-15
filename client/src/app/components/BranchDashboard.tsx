import React, { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
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
  Trash2,
  ArrowRight,
  LucideIcon
} from 'lucide-react';
import { NewDonationModal } from './NewDonationModal';
import { BillCalculatorModal } from './BillCalculatorModal';
import { useBranchDashboard } from '../hooks/useBranchDashboard';
import { billService } from '../services/billService';
import { toast } from 'sonner';
import { BranchDashboardProps, TodayStats, DonationData } from '../types';

export function BranchDashboard({ onLogout, onBack, branchName, branchId }: BranchDashboardProps) {
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

  const [isBillCalcOpen, setIsBillCalcOpen] = useState(false);
  const [hasExistingSummary, setHasExistingSummary] = useState(false);
  const [existingTotal, setExistingTotal] = useState(0);

  // בדיקה האם קיים סיכום יומי לשם עדכון ויזואלי של הכפתור
 useEffect(() => {
    let isMounted = true;
    
    const checkSummary = async () => {
      try {
        // אנחנו קוראים לשרת לבדוק אם יש נתונים
        const data = await billService.getDailySummary(branchId);
        
        if (data && isMounted) {
          setHasExistingSummary(true);
          setExistingTotal(data.total_amount);
        }
      } catch (err: any) {
        
        if (err?.response?.status !== 404) {
          console.error("Error checking summary:", err);
        }
        
        if (isMounted) {
          setHasExistingSummary(false);
          setExistingTotal(0);
        }
      }
    };
    
    checkSummary();
    return () => { isMounted = false; };
  }, [branchId, isBillCalcOpen]);

  const [isF1Mode, setIsF1Mode] = useState(false);

useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'F5') {
      e.preventDefault(); // מונע את פתיחת עזרה של הדפדפן
      setIsF1Mode(true);
      setIsModalOpen(true);
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [setIsModalOpen]);
  const todayStats: TodayStats = donations.reduce((acc: TodayStats, curr: DonationData) => {
    const isRec = !!curr.isRecurring;
    const amount = Number(curr.amount) || 0;
    const months = isRec ? (Number(curr.installments) || 1) : 1;
    const total = isRec ? (amount * months) : amount;

    return {
      count: acc.count + 1,
      totalAmount: acc.totalAmount + total
    };
  }, { count: 0, totalAmount: 0 });

  const getPaymentIcon = (methodId: number | string): React.JSX.Element => {
    const id = Number(methodId);
    switch (id) {
      case 1: return <Wallet className="w-4 h-4 text-green-600" />;
      case 2: return <CreditCard className="w-4 h-4 text-blue-600" />;
      case 3: return <FileText className="w-4 h-4 text-amber-600" />;
      case 4: return <Banknote className="w-4 h-4 text-purple-600" />;
      default: return <Banknote className="w-4 h-4 text-slate-600" />;
    }
  };

  const getPaymentLabel = (methodId: number | string): string => {
    const labels: Record<number, string> = { 1: 'מזומן', 2: 'אשראי', 3: "צ'ק", 4: 'הו"ק' };
    return labels[Number(methodId)] || 'לא ידוע';
  };

  const getTargetLabel = (targetId: number | string): string => {
    const targets: Record<number, string> = { 1: 'קופת העיר', 2: 'קרנות', 3: 'אחר' };
    return targets[Number(targetId)] || 'כללי';
  };

  // מחיקה עם אישור Toast במקום window.confirm
  const confirmDelete = (id: number) => {
    toast.error('האם למחוק תרומה זו?', {
      action: {
        label: 'מחק עכשיו',
        onClick: () => handleDelete(id)
      },
      duration: 5000,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4" title='חזרה לבחירת סניף'>
            <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <ArrowRight className="w-6 h-6" />
            </button>
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md border border-slate-100 overflow-hidden hover:scale-105 transition-transform">
              <img
                src="/logo.png"
                alt="לוגו"
                className="w-10 h-10 object-contain"
              />
            </div>
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
          {/* כרטיסי סיכום מהיר להיום */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">סה"כ סכום (כולל פריסה)</p>
                <h3 className="text-2xl font-black text-blue-600">₪{todayStats.totalAmount.toLocaleString()}</h3>
              </div>
              <div className="bg-blue-50 p-3 rounded-xl">
                <Banknote className="w-6 h-6 text-blue-600" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">מספר תרומות היום</p>
                <h3 className="text-2xl font-black text-slate-800">{todayStats.count}</h3>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl">
                <Plus className="w-6 h-6 text-slate-600" />
              </div>
            </div>
          </div>

          {/* כפתורים מהירים */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button onClick={() => { setIsF1Mode(false); setIsModalOpen(true); }}  className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-2xl shadow-lg flex items-center justify-between group transition-all hover:scale-[1.01]">
              <div className="text-right">
                <h3 className="text-xl font-bold mb-1">תרומה חדשה</h3>
                <p className="text-blue-100 text-sm opacity-80">הוסף תרומה מסניף זה</p>
              </div>
              <Plus className="w-10 h-10 opacity-30" />
            </button>

            {/* כפתור מחשבון שטרות - דינמי */}
            <button 
              onClick={() => setIsBillCalcOpen(true)} 
              className={`relative overflow-hidden p-6 rounded-2xl shadow-lg flex items-center justify-between group transition-all hover:scale-[1.01] ${
                hasExistingSummary 
                  ? 'bg-white border-2 border-emerald-500 text-emerald-900 shadow-emerald-50' 
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              <div className="text-right z-10">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold">סיכום שטרות</h3>
                  {hasExistingSummary && (
                    <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse font-bold">
                      נשמר
                    </span>
                  )}
                </div>
                
                <p className={`text-sm font-medium ${hasExistingSummary ? 'text-emerald-600' : 'text-emerald-100 opacity-80'}`}>
                  {hasExistingSummary 
                    ? `נרשם סיכום: ₪${existingTotal?.toLocaleString()} (לחץ לעריכה)` 
                    : 'מחשבון מזומן לסגירת יום'}
                </p>
              </div>

              <div className="relative">
                <Calculator className={`w-10 h-10 transition-transform group-hover:rotate-12 ${
                  hasExistingSummary ? 'text-emerald-500 opacity-20' : 'text-white opacity-30'
                }`} />
              </div>

              {hasExistingSummary && (
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-50 rounded-full opacity-50" />
              )}
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
                    donations.map((donation: DonationData) => {
                      const isRec = !!donation.isRecurring;
                      const amount = Number(donation.amount) || 0;
                      const months = isRec ? (Number(donation.installments) || 1) : 1;
                      const total = isRec ? (amount * months) : amount;

                      return (
                        <tr key={donation.id} className="hover:bg-blue-50/30 transition-colors group">
                          <td className="px-4 py-4">
                            <div className="text-base font-black text-blue-900">
                              ₪{total.toLocaleString()}
                            </div>
                          </td>
                          <td className="px-4 py-4 font-bold text-slate-700">
                            ₪{amount.toLocaleString()}
                          </td>
                          <td className="px-4 py-4">
                            {isRec ? (
                              <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded font-bold text-xs">
                                {months} חודשים
                              </span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold ${isRec ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                              }`}>
                              {isRec && <Repeat className="w-3 h-3" />}
                              {isRec ? 'מחזורי' : 'חד פעמי'}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-700">
                            {getTargetLabel(donation.targetId)}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              {getPaymentIcon(donation.methodId)}
                              <span>{getPaymentLabel(donation.methodId)}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-left">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEditClick(donation)}
                                className="p-2 text-slate-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all rounded-full hover:bg-white shadow-sm"
                                title="עריכה"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => confirmDelete(donation.id)}
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

      {/* מודאלים */}
      {isModalOpen && (
<NewDonationModal
  isOpen={isModalOpen}
  onClose={() => { setIsF1Mode(false); handleCloseModal(); }}
  onRefresh={fetchDonations}
  editingDonation={editingDonation}
  branchId={branchId}
  keepOpenOnSuccess={isF1Mode}   // ← prop חדש
/>
      )}

      <BillCalculatorModal 
        isOpen={isBillCalcOpen}
        onClose={() => setIsBillCalcOpen(false)}
        branchName={branchName}
        branchId={branchId}
      />
    </div>
  );
}