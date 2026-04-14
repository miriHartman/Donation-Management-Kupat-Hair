import React, { useState, useEffect } from 'react';
import { X, Check, Loader2, CalendarClock, Info, PartyPopper, Heart } from 'lucide-react';
import { DonationData } from '../types';
import { useDonationForm } from '../hooks/useDonationForm';
import { CurrencyCalculator } from './CurrencyCalculator'; // ייבוא הקומפוננטה שפיצלנו

interface NewDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  editingDonation?: DonationData | null;
  branchId: number;
  branches?: { id: number; name: string; is_active?: number | boolean }[];
  showAdminFields?: boolean;
}

const SUCCESS_MESSAGES = [
  { title: "אשריכם ישראל!", subtitle: "שכרך שמור לך 💰💰💰💰💰💰" },
  { title: "יישר כוח גדול!", subtitle: "עבודתך המסורה מכניסה עוד חתן לחופה ברוגע..." },
  { title: "מצווה גדולה!", subtitle: "צדקה תציל ממות !!!" },
  { title: "שכוייח עצום!", subtitle: "זוכה לברכת גדולי הדור ..." },
  { title: "תודה רבה!", subtitle: "שמחת חג של יהודים- בזכותך :)" },
];

export function NewDonationModal({
  isOpen,
  onClose,
  onRefresh,
  editingDonation,
  branchId,
  branches,
  showAdminFields
}: NewDonationModalProps) {
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(SUCCESS_MESSAGES[0]);
  const [isForeignCurrency, setIsForeignCurrency] = useState(false);

  const { formData, setFormData, handleSave, loading } = useDonationForm(
    editingDonation,
    () => {
      const randomIndex = Math.floor(Math.random() * SUCCESS_MESSAGES.length);
      setCurrentMessage(SUCCESS_MESSAGES[randomIndex]);
      setShowSuccess(true);
      onRefresh();
    },
    branchId
  );


  const updateMonthlyAmount = (total: number, months: number) => {
    if (months > 0 && total >= 0) {
      const monthly = Number((total / months).toFixed(2));
      if (monthly !== formData.amount) {
        setFormData(prev => ({ ...prev, amount: monthly }));
      }
    }
  };

  const handleFinalClose = () => {
    setShowSuccess(false);
    onClose();
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {!showSuccess ? (
          <>
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-800">
                {editingDonation ? 'עריכת תרומה' : 'הוספת תרומה חדשה'}
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      שם העובדת <span className="text-blue-500 font-bold">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={formData.workerName || ''}
                        onChange={(e) => setFormData({ ...formData, workerName: e.target.value })}
                        placeholder="מי מבצעת?"
                        className="w-full px-4 py-2.5 bg-blue-50/30 border border-blue-100 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">יעד התרומה <span className="text-red-500">*</span></label>
                    <select
                      value={formData.targetId}
                      onChange={(e) => {
                        const newTargetId = Number(e.target.value);
                        setFormData({
                          ...formData,
                          targetId: newTargetId,
                          fundNumber: newTargetId === 2 ? formData.fundNumber : '',
                          targetOtherNote: newTargetId === 3 ? formData.targetOtherNote : ''
                        });
                      }}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value={1}>קופת העיר</option>
                      <option value={2}>קרנות</option>
                      <option value={3}>אחר</option>
                    </select>
                  </div>
                </div>

                {formData.targetId === 2 && (
                  <div className="mt-3 animate-in fade-in slide-in-from-top-2">
                    <label className="block text-sm font-medium text-blue-700 mb-1">מספר קרן <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={formData.fundNumber || ''}
                      onChange={(e) => setFormData({ ...formData, fundNumber: e.target.value })}
                      placeholder="הכנס מספר קרן..."
                      className="w-full px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                {formData.targetId === 3 && (
                  <div className="mt-3 animate-in fade-in slide-in-from-top-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">פירוט היעד <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={formData.targetOtherNote || ''}
                      onChange={(e) => setFormData({ ...formData, targetOtherNote: e.target.value })}
                      placeholder="עבור מה התרומה?"
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                {showAdminFields && (
                  <div className="grid grid-cols-2 gap-4 p-4 bg-amber-50/50 rounded-xl border border-amber-100 animate-in fade-in slide-in-from-top-2">
                    <div>
                      <label className="block text-sm font-medium text-amber-900 mb-1">תאריך התרומה</label>
                      <input
                        type="date"
                        value={formData.date ? formData.date.substring(0, 10) : ''}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-amber-900 mb-1">סניף</label>
                      <select
  value={formData.branchId || ""}
  onChange={(e) => {
    const val = e.target.value ? Number(e.target.value) : undefined;
    setFormData({ ...formData, branchId: val });
  }}
  className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-500"
>
  <option value="">בחר סניף...</option>
  {branches && branches.length > 0 ? (
    branches
      /* סינון: אם זו תרומה חדשה (אין editingDonation), הצג רק פעילים. 
         אם זו עריכה, הצג פעילים או את הסניף הנוכחי של התרומה (כדי שלא ייעלם) */
      .filter(b => 
        !editingDonation 
          ? Number(b.is_active) === 1 
          : (Number(b.is_active) === 1 || b.id === formData.branchId)
      )
      .map(b => (
        <option key={b.id} value={b.id}>
          {b.name} {!b.is_active && "(לא פעיל)"}
        </option>
      ))
  ) : (
    <option disabled>טוען סניפים או שאין סניפים פעילים...</option>
  )}
</select>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">אמצעי תשלום <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 1, label: 'מזומן' },
                      { id: 2, label: 'אשראי' },
                      { id: 3, label: "צ'ק" },
                      { id: 4, label: 'הו"ק' },
                    ].map((method) => (
                      <label
                        key={method.id}
                        className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${formData.methodId === method.id
                          ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                      >
                        <input
                          type="radio"
                          className="hidden"
                          name="methodId"
                          checked={formData.methodId === method.id}
                          onChange={() => {
                            const isMethodHOQ = method.id === 4;
                            const isMethodOneTimeOnly = method.id === 1 || method.id === 3;
                            setFormData({
                              ...formData,
                              methodId: method.id,
                              isRecurring: isMethodHOQ ? true : (isMethodOneTimeOnly ? false : formData.isRecurring),
                              installments: isMethodHOQ ? (formData.installments || 12) : (isMethodOneTimeOnly ? 1 : formData.installments)
                            });
                            if (isMethodOneTimeOnly) setTotalAmount(formData.amount);
                          }}
                        />
                        {method.label}
                      </label>
                    ))}
                  </div>
                </div>

                {(formData.methodId === 2 || formData.methodId === 4) && (
                  <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isRecurring}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setFormData({
                            ...formData,
                            isRecurring: checked,
                            installments: checked ? (formData.installments || 12) : 1
                          });
                        }}
                        className="w-5 h-5 text-blue-600 border-slate-300 rounded"
                      />
                      <div className="flex items-center gap-2">
                        <CalendarClock className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-bold text-slate-700">זוהי תרומה מחזורית / תשלומים</span>
                      </div>
                    </label>

                    {formData.isRecurring && (
                      <div className="grid grid-cols-2 gap-4 pt-3 border-t border-blue-100">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 mb-1">סה"כ לתרומה</label>
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={totalAmount || ''}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setTotalAmount(val);
                              updateMonthlyAmount(val, formData.installments || 1);
                            }}
                            className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-blue-700 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 mb-1">מס' חודשים <span className="text-red-500">*</span></label>
                          <input
                            type="number"
                            min="1"
                            value={formData.installments || ''}
                            onChange={(e) => {
                              const months = Math.max(1, parseInt(e.target.value) || 1);
                              setFormData({ ...formData, installments: months });
                              updateMonthlyAmount(totalAmount, months);
                            }}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* צ'קבוקס הפעלת מט"ח */}
                <div className="flex items-center gap-2 py-1">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={isForeignCurrency}
                      onChange={(e) => {
                        setIsForeignCurrency(e.target.checked);
                        if (!e.target.checked) setFormData(prev => ({ ...prev, currency: 'ILS' }));
                      }}
                      className="w-5 h-5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 transition-all"
                    />
                    <span className="text-sm font-bold text-slate-700 group-hover:text-emerald-600 transition-colors">תרומה במטבע חוץ?</span>
                  </label>
                </div>

                {/* הצגת המחשבון המפוצל */}
                {isForeignCurrency && (
                  <CurrencyCalculator
                    onCurrencyChange={(curr) => setFormData(prev => ({ ...prev, currency: curr }))}
                    onAmountConverted={(nis) => {
                      setFormData(prev => ({ ...prev, amount: nis }));
                      if (formData.isRecurring) {
                        setTotalAmount(Number((nis * (formData.installments || 1)).toFixed(2)));
                      }
                    }}
                  />
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {formData.isRecurring ? 'סכום לחיוב חודשי' : 'סכום התרומה'} (₪) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₪</span>
                    <input
                      type="number"
                      value={formData.amount || ''}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setFormData({ ...formData, amount: val });
                        if (formData.isRecurring) setTotalAmount(Number((val * (formData.installments || 1)).toFixed(2)));
                      }}
                      className="w-full pr-10 pl-4 py-3 text-2xl font-black text-blue-900 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 shadow-inner outline-none"
                      placeholder="0.00"
                      step="0.01"
                      required
                    />
                  </div>
                  {formData.isRecurring && totalAmount > 0 && (
                    <div className="mt-2 flex items-center gap-1.5 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 animate-pulse">
                      <Info className="w-4 h-4" />
                      <span className="text-xs font-bold">סה"כ יגבה מהתורם: ₪{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">הערות</label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    rows={2}
                    placeholder="שם התורם או פרטים נוספים..."
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={onClose} className="flex-1 px-4 py-3 text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 font-medium transition-colors">
                  ביטול
                </button>
                <button
                  type="submit"
                  disabled={
                    loading ||
                    !formData.amount ||
                    !formData.workerName ||
                    (formData.targetId === 2 && !formData.fundNumber) ||
                    (formData.targetId === 3 && !formData.targetOtherNote)
                  }
                  className="flex-[2] px-4 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-xl font-bold shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-95"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check className="w-5 h-5" /> {editingDonation ? 'עדכן תרומה' : 'אישור ושמירה'}</>}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="p-10 flex flex-col items-center text-center animate-in fade-in zoom-in-90 duration-300">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 relative">
              <PartyPopper className="w-12 h-12 text-green-500" />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white" />
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-3 leading-tight">{currentMessage.title}</h2>
            <p className="text-slate-500 text-lg font-medium mb-8 leading-relaxed max-w-[300px]">{currentMessage.subtitle}</p>
            <div className="w-full bg-blue-50/50 rounded-3xl p-5 border border-blue-100/50 mb-8 flex items-center justify-between">
              <div className="text-right">
                <p className="text-[11px] text-blue-400 font-bold uppercase tracking-widest mb-1">סכום שנקלט</p>
                <p className="text-2xl font-black text-blue-700">₪{formData.amount.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-white rounded-2xl shadow-sm">
                <Heart className="w-6 h-6 text-red-500 fill-red-500" />
              </div>
            </div>
            <button onClick={handleFinalClose} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-[0.98]">
              הפנמתי :)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}