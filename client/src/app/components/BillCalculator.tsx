import React, { useState } from 'react';
import { Banknote, ArrowRight, Save, Printer, CheckCircle2, X } from 'lucide-react';
import { useBillCalculator } from '../hooks/useBillCalculator';

interface BillCalculatorProps {
  onBack: () => void;
  branchName: string;
}

export function BillCalculator({ onBack, branchName }: BillCalculatorProps) {
  const { bills, total, handleSave, handlePrint, updateBillCount } = useBillCalculator(branchName);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleDepositClick = () => {
    if (total === 0) {
      alert("נא להזין סכום להפקדה");
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmAndExit = async () => {
    await handleSave(); // שמירת הנתונים
    setShowConfirmModal(false);
    onBack(); // חזרה לדשבורד
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-right" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 print:hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors px-3 py-2 rounded-lg hover:bg-blue-50 text-sm font-medium"
          >
            <ArrowRight className="w-4 h-4" />
            <span>חזרה לדשבורד</span>
          </button>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-green-600/20">
              <Banknote className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">סיכום שטרות יומי</h1>
              <p className="text-xs text-slate-500">{branchName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 text-slate-600 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50">
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">הדפס</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          {/* Info Section */}
          <div className="mb-8 pb-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-1">סיכום מזומן יומי</h2>
                <p className="text-slate-500">תאריך: {new Date().toLocaleDateString('he-IL')}</p>
              </div>
              <div className="text-left">
                <p className="text-sm text-slate-500">סניף:</p>
                <p className="text-lg font-bold text-slate-800">{branchName}</p>
              </div>
            </div>
          </div>

          {/* Input Section */}
          <div className="space-y-6 mb-8">
            {[200, 100, 50, 20].map((denom) => (
              <div key={denom} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-12 bg-white border-2 border-slate-300 rounded-lg flex items-center justify-center font-bold text-slate-700">
                    ₪{denom}
                  </div>
                  <span className="text-2xl text-slate-400 font-light">×</span>
                </div>

                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    min="0"
                    value={bills[denom as keyof typeof bills] || ''}
                    onChange={(e) => updateBillCount(denom, e.target.value)}
                    className="w-32 px-4 py-3 bg-white border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-center font-bold text-lg"
                    placeholder="0"
                  />
                  <div className="w-40 text-left">
                    <p className="text-sm text-slate-500 mb-1">סה"כ:</p>
                    <p className="text-2xl font-bold text-slate-900 text-left">
                      ₪{((bills[denom as keyof typeof bills] || 0) * denom).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Final Summary Card */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Banknote className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm text-green-700 font-medium">סה"כ מזומן בקופה</p>
              </div>
              <p className="text-5xl font-bold text-green-700">₪{total.toLocaleString()}</p>
            </div>
          </div>

          {/* Deposit Button */}
          <div className="mt-8 flex gap-4 print:hidden">
            <button
              onClick={handleDepositClick}
              className="flex-1 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
            >
              <Save className="w-5 h-5" />
              <span>הפקד סכום יומי</span>
            </button>
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">אישור הפקדה</h2>
              <p className="text-slate-500 mb-1 text-lg">הופקד:</p>
              <p className="text-3xl font-black text-indigo-600 mb-8">₪{total.toLocaleString()}</p>

              <button
                onClick={confirmAndExit}
                className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95"
              >
                אישור
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}