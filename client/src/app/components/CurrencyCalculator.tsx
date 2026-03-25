import React, { useState } from 'react';
import { Calculator, ArrowLeftRight } from 'lucide-react';
import { useExchangeRates } from '../hooks/useExchangeRates';

interface CurrencyCalculatorProps {
  onAmountConverted: (nis: number) => void;
  onCurrencyChange: (curr: string) => void;
}

export function CurrencyCalculator({ 
  onAmountConverted, 
  onCurrencyChange 
}: CurrencyCalculatorProps) {
  const { rates, loading, error } = useExchangeRates();
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [foreignAmount, setForeignAmount] = useState<number | ''>('');

  const currentRate = rates.find(r => r.currency_code === selectedCurrency)?.rate || 0;

  const handleAmountChange = (val: string) => {
    const num = parseFloat(val) || 0;
    setForeignAmount(val === '' ? '' : num);
    onAmountConverted(Number((num * currentRate).toFixed(2)));
  };

  if (loading) {
    return (
      <div className="p-3 text-xs text-slate-400 animate-pulse italic">
        טוען שערי חליפין מעודכנים...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 text-xs text-red-500 bg-red-50 rounded-lg border border-red-100">
        שגיאה בטעינת שערים. נסה שוב מאוחר יותר.
      </div>
    );
  }

  return (
    <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 mb-6 animate-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-2 text-emerald-700 mb-3">
        <Calculator className="w-4 h-4" />
        <span className="text-sm font-bold">מחשבון המרת מט"ח</span>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-bold text-emerald-600 mb-1 uppercase tracking-wider">
            סוג מטבע
          </label>
          <select 
            value={selectedCurrency}
            onChange={(e) => {
              const newCurr = e.target.value;
              setSelectedCurrency(newCurr);
              onCurrencyChange(newCurr);
              if (foreignAmount) {
                const newRate = rates.find(r => r.currency_code === newCurr)?.rate || 0;
                onAmountConverted(Number((Number(foreignAmount) * newRate).toFixed(2)));
              }
            }}
            className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow shadow-sm"
          >
            {rates.map(r => (
              <option key={r.currency_code} value={r.currency_code}>
                {r.currency_code} {r.currency_code === 'USD' ? '🇺🇸' : r.currency_code === 'EUR' ? '🇪🇺' : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-emerald-600 mb-1 uppercase tracking-wider">
            סכום במט"ח
          </label>
          <input
            type="number"
            value={foreignAmount}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder="0.00"
            className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
          />
        </div>
      </div>

      {foreignAmount && (
        <div className="mt-3 pt-3 border-t border-emerald-100 flex justify-between items-center animate-in fade-in">
          <span className="text-[11px] text-emerald-600 font-medium italic underline decoration-emerald-200 underline-offset-4">
            לפי שער: {currentRate}
          </span>
          <div className="flex items-center gap-1.5 text-emerald-700 font-black">
            <span className="text-xs">סה"כ:</span>
            <ArrowLeftRight className="w-3 h-3" />
            <span className="text-sm">
              ₪{(Number(foreignAmount) * currentRate).toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}