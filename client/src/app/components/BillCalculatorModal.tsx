import React, { useEffect, useState } from 'react';
import { X, Printer, Plus, Minus, Loader2, CheckCircle2, Banknote } from 'lucide-react';
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
      {/* Header - עדין ומצומצם */}
      <header className="bg-white border-b border-slate-100 px-5 py-3 flex items-center justify-between shadow-sm shrink-0 z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            <X size={22} />
          </button>
          <div className="flex flex-col m-0">
            <h1 className="text-lg font-bold text-slate-950 leading-tight">מחשבון מזומן</h1>
            <p className="text-xs text-blue-600 font-medium">{branchName}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           <span className="text-xs text-slate-400 font-medium">יום עבודה: {new Date().toLocaleDateString('he-IL')}</span>
           <button 
            onClick={() => window.print()} 
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 print:hidden"
          >
            <Printer size={20} />
          </button>
        </div>
      </header>

      {/* Main Content - תצוגת רשת (Grid) של 2 בעמודה */}
      <main className="flex-1 overflow-y-auto p-5 pb-32 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-28 text-slate-400">
              <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-5" />
              <p className="text-lg font-medium">טוען נתונים קיים...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recordId && (
                <div className="sm:col-span-2 bg-amber-50 border border-amber-100 p-3 rounded-xl text-amber-800 text-sm font-bold text-center shadow-sm flex items-center justify-center gap-2 mb-2">
                  <span>🔔</span>
                  <span>שים לב: מערכת מציגה סיכום קיים להיום. ניתן לערוך ולשמור שוב.</span>
                </div>
              )}

              {[200, 100, 50, 20, 10, 5, 2, 1].map((denom) => (
                <div key={denom} className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-3 transition-all hover:shadow-md hover:border-slate-200">
                  <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-slate-950">₪{denom}</span>
                    </div>
                    <img src={billImages[denom]} alt="" className="h-10 object-contain rounded drop-shadow-sm" />
                  </div>

                  <div className="flex items-center justify-between gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                    <button 
                      onClick={() => adjustCount(denom, 1)} 
                      className="w-14 h-14 bg-emerald-500 text-white rounded-xl flex items-center justify-center active:scale-95 shadow-md shadow-emerald-100 transition-all hover:bg-emerald-600"
                    >
                      <Plus size={28} strokeWidth={3} />
                    </button>
                    
                    <div className="flex flex-col items-center">
                      <span className="text-4xl font-black text-slate-900 leading-none">{bills[denom]}</span>
                      <span className="text-[10px] text-slate-400 font-bold mt-1.5 uppercase tracking-wider">יחידות</span>
                    </div>

                    <button 
                      onClick={() => adjustCount(denom, -1)} 
                      disabled={bills[denom] === 0} 
                      className="w-14 h-14 bg-rose-500 text-white rounded-xl flex items-center justify-center active:scale-95 shadow-md shadow-rose-100 transition-all hover:bg-rose-600 disabled:opacity-20 disabled:shadow-none"
                    >
                      <Minus size={28} strokeWidth={3} />
                    </button>
                  </div>
                  
                  <div className="text-left text-xs text-slate-400 font-medium px-1">סה"כ לשורה: <span className="text-slate-900 font-bold text-base">₪{(bills[denom] * denom).toLocaleString()}</span></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer - עדין, דק ויוקרתי */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-sm border-t border-slate-100 p-4 shadow-[0_-6px_20px_rgba(0,0,0,0.03)] z-10 print:hidden">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-6">
          <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-full border border-slate-100 px-5 shadow-inner">
             <Banknote className="w-5 h-5 text-emerald-600" />
             <span className="text-slate-500 text-sm font-medium">סה"כ הפקדת מזומן:</span>
             <span className="text-3xl font-black text-slate-950 leading-none">₪{total.toLocaleString()}</span>
          </div>
          
          <button
            onClick={handleSave}
            disabled={total === 0 || isLoading}
            className="px-8 py-3.5 bg-blue-600 text-white rounded-full font-bold text-base active:scale-95 transition-all shadow-md shadow-blue-100 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none flex items-center gap-2"
          >
            {recordId ? 'עדכן סיכום קיים' : 'שמור סיכום יום'}
          </button>
        </div>
      </div>

      {/* Confirmation Modal - נשאר כפי שהיה */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white rounded-[32px] p-10 max-w-sm w-full text-center shadow-2xl border border-slate-100">
             <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <CheckCircle2 size={48} strokeWidth={2.5} />
             </div>
             <h3 className="text-2xl font-bold text-slate-900 mb-2">נשמר בהצלחה!</h3>
             <p className="text-slate-500 mb-8 font-medium leading-relaxed">
               הסכום <span className="text-slate-950 font-bold text-lg">₪{total.toLocaleString()}</span> עודכן בהצלחה במערכת<br/>עבור {branchName}
             </p>
             <button 
               onClick={() => { setShowConfirmModal(false); onClose(); }} 
               className="w-full py-3.5 bg-slate-950 text-white rounded-full font-bold text-lg shadow-lg hover:bg-slate-800 transition-colors"
             >
               חזרה לדשבורד
             </button>
           </div>
        </div>
      )}
    </div>
  );
}