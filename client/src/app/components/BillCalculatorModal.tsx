import React, { useEffect, useState } from 'react';
import { X, Printer, Plus, Minus, Loader2, CheckCircle2 } from 'lucide-react';
import { billService } from '../services/billService'; // ייבוא הסרוויס

interface BillCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  branchName: string;
  branchId: number;
}

const billImages: Record<number, string> = {
  200: "/200.png", 
  100: "/100.png",
  50: "/50.png",
  20: "/20.png",
  10: "/10.png",
  5: "/5.png",
  2: "/2.png",
  1: "/1.png"
};

export function BillCalculatorModal({ isOpen, onClose, branchName, branchId }: BillCalculatorModalProps) {
  const [bills, setBills] = useState<Record<number, number>>({
    200: 0, 100: 0, 50: 0, 20: 0, 10: 0, 5: 0, 2: 0, 1: 0
  });
  const [recordId, setRecordId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const total = Object.entries(bills).reduce((sum, [d, c]) => sum + (Number(d) * c), 0);

  useEffect(() => {
    if (isOpen) loadData();
    else resetForm();
  }, [isOpen, branchId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await billService.getDailySummary(branchId);
      if (data) {
        setBills(data.counts);
        setRecordId(data.id);
      }
    } catch (err) {
      console.error("Error loading daily summary", err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setBills({ 200: 0, 100: 0, 50: 0, 20: 0, 10: 0, 5: 0, 2: 0, 1: 0 });
    setRecordId(null);
  };

  const handleSave = async () => {
    try {
      await billService.saveSummary(branchId, bills, total, recordId);
      setShowConfirmModal(true);
    } catch (err) {
      alert("שגיאה בשמירת הנתונים");
    }
  };

  const adjustCount = (denom: number, delta: number) => {
    setBills(prev => ({ ...prev, [denom]: Math.max(0, (prev[denom] || 0) + delta) }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 flex flex-col animate-in fade-in duration-200 overflow-hidden font-sans" dir="rtl">
      {/* Header - בעיצוב נקי שתואם לאפליקציה */}
      <header className="bg-white border-b border-slate-100 p-4 flex items-center justify-between shadow-sm shrink-0">
        <button 
          onClick={onClose} 
          className="p-2.5 bg-slate-50 text-slate-500 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X size={24} />
        </button>
        <div className="text-center">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">מחשבון מזומן</h1>
          <p className="text-[13px] text-blue-600 font-semibold">{branchName}</p>
        </div>
        <button 
          onClick={() => window.print()} 
          className="p-2.5 bg-slate-50 text-slate-500 rounded-full hover:bg-slate-100 transition-colors print:hidden"
        >
          <Printer size={24} />
        </button>
      </header>

      {/* Main List */}
      <main className="flex-1 overflow-y-auto p-4 pb-44">
        <div className="max-w-md mx-auto space-y-5">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
              <p className="text-lg font-medium">טוען נתונים מהמערכת...</p>
            </div>
          ) : (
            <>
              {recordId && (
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl text-blue-800 text-sm font-bold text-center shadow-sm">
                  🔔 עריכת סיכום קיים להיום
                </div>
              )}

              {[200, 100, 50, 20, 10, 5, 2, 1].map((denom) => (
                <div key={denom} className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-100 flex flex-col gap-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                    <div className="flex flex-col">
                      <span className="text-2xl font-black text-slate-800">₪{denom}</span>
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">ערך שטר/מטבע</span>
                    </div>
                    <img src={billImages[denom]} alt="" className="h-12 w-24 object-contain rounded-lg drop-shadow-md" />
                  </div>

                  <div className="flex items-center justify-between gap-6">
                    <button 
                      onClick={() => adjustCount(denom, 1)} 
                      className="flex-1 h-20 bg-emerald-500 text-white rounded-2xl flex items-center justify-center active:scale-95 shadow-lg shadow-emerald-100 transition-all hover:bg-emerald-600"
                    >
                      <Plus size={36} strokeWidth={3} />
                    </button>
                    
                    <div className="flex flex-col items-center min-w-[60px]">
                      <span className="text-5xl font-black text-slate-900 leading-none">{bills[denom]}</span>
                      <span className="text-[10px] text-slate-400 font-bold mt-2">כמות</span>
                    </div>

                    <button 
                      onClick={() => adjustCount(denom, -1)} 
                      disabled={bills[denom] === 0} 
                      className="flex-1 h-20 bg-rose-500 text-white rounded-2xl flex items-center justify-center active:scale-95 shadow-lg shadow-rose-100 transition-all hover:bg-rose-600 disabled:opacity-20 disabled:grayscale disabled:shadow-none"
                    >
                      <Minus size={36} strokeWidth={3} />
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-sm text-slate-500 font-bold">סיכום ביניים:</span>
                    <span className="text-xl font-black text-slate-900">₪{(bills[denom] * denom).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </main>

      {/* Footer Summary - הפונט הוחלף לפונט האפליקציה */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-100 p-6 shadow-[0_-8px_24px_rgba(0,0,0,0.05)] z-50">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-end mb-5">
             <div className="flex flex-col">
               <span className="text-slate-400 text-sm font-bold">סה"כ הפקדה לתאריך היום</span>
               <span className="text-4xl font-black text-slate-900 leading-none mt-1">₪{total.toLocaleString()}</span>
             </div>
          </div>
          <button
            onClick={handleSave}
            disabled={total === 0 || isLoading}
            className="w-full py-5 bg-blue-600 text-white rounded-[20px] font-bold text-xl active:scale-95 transition-all shadow-xl shadow-blue-100 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
          >
            {recordId ? 'עדכן סיכום ושמור' : 'שמור סיכום והמשך'}
          </button>
        </div>
      </div>

      {/* Confirmation Overlay */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white rounded-[40px] p-10 max-w-sm w-full text-center shadow-2xl border border-slate-100">
             <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <CheckCircle2 size={56} strokeWidth={2.5} />
             </div>
             <h3 className="text-2xl font-bold text-slate-900 mb-2">נשמר בהצלחה!</h3>
             <p className="text-slate-500 mb-8 font-medium leading-relaxed">
               הסכום <span className="text-slate-900 font-bold">₪{total.toLocaleString()}</span> עודכן בהצלחה<br/>עבור {branchName}
             </p>
             <button 
               onClick={() => { setShowConfirmModal(false); onClose(); }} 
               className="w-full py-4.5 bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-slate-800 transition-colors"
             >
               חזרה לדשבורד
             </button>
           </div>
        </div>
      )}
    </div>
  );
}