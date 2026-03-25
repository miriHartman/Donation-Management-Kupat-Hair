import React, { useState } from 'react';
import { Calculator, ArrowLeftRight } from 'lucide-react';
import { useExchangeRates } from '../hooks/useExchangeRates';

// 1. אובייקט עזר לסימני מטבע ודגלים
const CURRENCY_INFO: Record<string, { symbol: string; flag: string }> = {
  USD: { symbol: '$', flag: '🇺🇸' },
  EUR: { symbol: '€', flag: '🇪🇺' },
  GBP: { symbol: '£', flag: '🇬🇧' },
  CAD: { symbol: 'C$', flag: '🇨🇦' }
};

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
  
  // חילוץ המידע על המטבע הנבחר (או ברירת מחדל אם לא נמצא)
  const currencyMeta = CURRENCY_INFO[selectedCurrency] || { symbol: '', flag: '🌐' };

  const handleAmountChange = (val: string) => {
    const num = parseFloat(val) || 0;
    setForeignAmount(val === '' ? '' : num);
    onAmountConverted(Number((num * currentRate).toFixed(2)));
  };

  if (loading) return <div className="p-3 text-xs text-slate-400 animate-pulse italic">טוען שערי חליפין...</div>;
  if (error) return <div className="p-3 text-xs text-red-500 bg-red-50 rounded-lg border border-red-100">שגיאה בטעינת שערים.</div>;

  return (
    <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 mb-6 animate-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-2 text-emerald-700 mb-3">
        <Calculator className="w-4 h-4" />
        <span className="text-sm font-bold">מחשבון המרת מט"ח</span>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {/* בחירת מטבע */}
        <div>
          <label className="block text-[10px] font-bold text-emerald-600 mb-1 uppercase tracking-wider">סוג מטבע</label>
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
                {r.currency_code} {CURRENCY_INFO[r.currency_code]?.flag || ''}
              </option>
            ))}
          </select>
        </div>

        {/* סכום במט"ח עם סמל דינמי */}
        <div>
          <label className="block text-[10px] font-bold text-emerald-600 mb-1 uppercase tracking-wider">סכום במט"ח</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400 font-bold text-xs pointer-events-none">
              {currencyMeta.symbol}
            </span>
            <input
              type="number"
              value={foreignAmount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0.00"
              className="w-full pl-7 pr-3 py-2 bg-white border border-emerald-200 rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            />
          </div>
        </div>
      </div>

      {foreignAmount && (
        <div className="mt-3 pt-3 border-t border-emerald-100 flex justify-between items-center animate-in fade-in">
          <span className="text-[11px] text-emerald-600 font-medium italic">
            לפי שער: {currencyMeta.symbol}1 = ₪{currentRate}
          </span>
          <div className="flex items-center gap-1.5 text-emerald-700 font-black">
            <span className="text-xs">סה"כ בשקלים:</span>
            <span className="text-sm bg-emerald-100 px-2 py-0.5 rounded text-emerald-800">
              ₪{(Number(foreignAmount) * currentRate).toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}