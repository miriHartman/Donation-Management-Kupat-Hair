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
    <div className="fixed inset-0 z-[100] bg-slate-100 flex flex-col animate-in fade-in duration-200 overflow-hidden" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 p-4 flex items-center justify-between shadow-sm shrink-0">
        <button onClick={onClose} className="p-3 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"><X /></button>
        <div className="text-center">
          <h1 className="text-lg font-bold text-slate-800">מחשבון מזומן</h1>
          <p className="text-xs text-blue-600 font-medium">{branchName}</p>
        </div>
        <button onClick={() => window.print()} className="p-3 bg-slate-100 rounded-full print:hidden"><Printer /></button>
      </header>

      {/* Main List */}
      <main className="flex-1 overflow-y-auto p-4 pb-40">
        <div className="max-w-md mx-auto space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
              <p className="font-bold">טוען נתונים...</p>
            </div>
          ) : (
            <>
              {recordId && (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-amber-800 text-sm font-bold text-center">
                  עריכת סיכום קיים להיום
                </div>
              )}

              {[200, 100, 50, 20, 10, 5, 2, 1].map((denom) => (
                <div key={denom} className="bg-white p-4 rounded-2xl shadow-md border border-slate-200 flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                    <span className="text-xl font-black text-slate-700">₪{denom}</span>
                    <img src={billImages[denom]} alt="" className="h-10 object-contain rounded shadow-sm" />
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <button onClick={() => adjustCount(denom, 1)} className="flex-1 h-20 bg-green-600 text-white rounded-2xl flex items-center justify-center active:scale-95 shadow-lg shadow-green-100">
                      <Plus size={40} strokeWidth={3} />
                    </button>
                    <div className="w-20 text-center font-black text-4xl text-slate-800">{bills[denom]}</div>
                    <button onClick={() => adjustCount(denom, -1)} disabled={bills[denom] === 0} className="flex-1 h-20 bg-red-500 text-white rounded-2xl flex items-center justify-center active:scale-95 shadow-lg shadow-red-100 disabled:opacity-20">
                      <Minus size={40} strokeWidth={3} />
                    </button>
                  </div>
                  <div className="text-left text-sm text-slate-400 font-medium">סה"כ: <span className="text-slate-900 font-bold font-mono">₪{(bills[denom] * denom).toLocaleString()}</span></div>
                </div>
              ))}
            </>
          )}
        </div>
      </main>

      {/* Footer Summary */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t-2 border-slate-200 p-6 shadow-2xl z-50">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-center mb-4 text-xl">
             <span className="text-slate-500 font-bold text-lg">סה"כ הפקדה:</span>
             <span className="text-4xl font-black text-green-700 font-mono">₪{total.toLocaleString()}</span>
          </div>
          <button
            onClick={handleSave}
            disabled={total === 0 || isLoading}
            className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-2xl active:scale-95 transition-all"
          >
            {recordId ? 'עדכן סיכום' : 'אישור ושמירה'}
          </button>
        </div>
      </div>

      {/* Confirmation Overlay */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-sm animate-in zoom-in duration-300">
           <div className="bg-white rounded-[40px] p-10 max-w-sm w-full text-center shadow-2xl border-4 border-green-50">
             <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <CheckCircle2 size={56} />
             </div>
             <h3 className="text-2xl font-black text-slate-800 mb-2">נשמר בהצלחה!</h3>
             <p className="text-slate-500 mb-8 font-medium italic">₪{total.toLocaleString()} נרשמו בסניף {branchName}</p>
             <button onClick={() => { setShowConfirmModal(false); onClose(); }} className="w-full py-4 bg-green-600 text-white rounded-2xl font-black text-xl shadow-lg">מעולה, תודה</button>
           </div>
        </div>
      )}
    </div>
  );
}