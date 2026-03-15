import React from 'react';
import { Banknote, ArrowRight, Save, Printer } from 'lucide-react';
import { useBillCalculator } from '../hooks/useBillCalculator';

interface BillCalculatorProps {
  onBack: () => void;
  branchName: string;
}

export function BillCalculator({ onBack, branchName }: BillCalculatorProps) {
  const { bills, total, handleSave, handlePrint, updateBillCount } = useBillCalculator(branchName);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
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
            <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium shadow-lg">
              <Save className="w-4 h-4" />
              <span>שמור</span>
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
                    <p className="text-2xl font-bold text-slate-900">
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
            <button onClick={handleSave} className="flex-1 py-4 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-lg">
              <Save className="w-5 h-5" />
              <span>הפקד סכום יומי</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}