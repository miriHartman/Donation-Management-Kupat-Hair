import React, { useState, useEffect } from 'react';
import { X, Check, Loader2, CalendarClock, Info, PartyPopper, Heart } from 'lucide-react';
import { useDonationForm } from '../hooks/useDonationForm';

export interface DonationData {
  date: string;
  id?: string;
  amount: number;
  targetId: number;
  methodId: number;
  isRecurring: boolean;
  workerName: string;
  installments?: number;
  fundNumber?: string;
  targetOtherNote?: string;
  currency: string;
  notes?: string;
  branchId?: number;
  userId?: number;
}

interface NewDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  editingDonation?: DonationData | null;
  branchId: number;
  branches?: { id: number; name: string }[];
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


  // אפקט לעדכון הטופס בנתוני התרומה הנערכת בעת פתיחת המודאל
  useEffect(() => {
    if (editingDonation) {
      setFormData({
        ...editingDonation, branchId: editingDonation.branchId || branchId,
        // וידוא שהתאריך נשמר בפורמט נקי
        date: editingDonation.date ? editingDonation.date.substring(0, 10) : new Date().toISOString().substring(0, 10),
        targetOtherNote: editingDonation.targetId === 3 ? editingDonation.targetOtherNote : '',
        fundNumber: editingDonation.targetId === 2 ? editingDonation.fundNumber : '',
        workerName: editingDonation.workerName || '',
      });
      if (editingDonation.isRecurring && editingDonation.amount && editingDonation.installments) {
        setTotalAmount(editingDonation.amount * editingDonation.installments);
      } else {
        setTotalAmount(editingDonation.amount || 0);
      }
    }
  }, [editingDonation, setFormData, branchId]);

  // פונקציה לעדכון הסכום החודשי ב-formData כשמשנים את הסה"כ
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

            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">              <div className="space-y-4">

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
              {/* שדה מותנה לקרנות */}
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

              {/* שדה מותנה ליעד אחר */}
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

              {/* שדות מנהל */}
              {showAdminFields && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-amber-50/50 rounded-xl border border-amber-100 animate-in fade-in slide-in-from-top-2">
                  <div>
                    <label className="block text-sm font-medium text-amber-900 mb-1">תאריך התרומה</label>
                    <input
                      type="date"
                      // הוספת substring כאן מבטיחה שהדפדפן יציג את התאריך גם אם ה-Hook התעכב
                      value={formData.date ? formData.date.substring(0, 10) : ''}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-amber-900 mb-1">סניף</label>
                    <select
                      // אם אין branchId ב-formData, נציג ערך ריק (שיציג את "בחר סניף")
                      value={formData.branchId || ''}
                      onChange={(e) => setFormData({ ...formData, branchId: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      {/* אופציה ריקה שמופיעה כברירת מחדל */}
                      <option value="" disabled>בחר סניף...</option>

                      {branches?.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* אמצעי תשלום */}
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
                          const isMethodOneTimeOnly = method.id === 1 || method.id === 3; // מזומן או צ'ק

                          setFormData({
                            ...formData,
                            methodId: method.id,
                            // אם זה הו"ק - תמיד מחזורי. אם זה מזומן/צ'ק - תמיד חד פעמי. אחרת - השאר כמו שהיה.
                            isRecurring: isMethodHOQ ? true : (isMethodOneTimeOnly ? false : formData.isRecurring),
                            // אם זה הפך לחד פעמי - מספר תשלומים חייב להיות 1
                            installments: isMethodHOQ
                              ? (formData.installments || 12)
                              : (isMethodOneTimeOnly ? 1 : formData.installments)
                          });

                          // אם עברנו למזומן/צ'ק, נאפס גם את ה-totalAmount בתצוגה כדי שלא יבלבל
                          if (isMethodOneTimeOnly) {
                            setTotalAmount(formData.amount);
                          }
                        }}
                      />
                      {method.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* איזור תרומה מחזורית */}
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

              {/* סכום חודשי / יחיד */}
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

              {/* הערות */}
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

              {/* כפתורי פעולה */}
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
          /* מסך הצלחה */
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