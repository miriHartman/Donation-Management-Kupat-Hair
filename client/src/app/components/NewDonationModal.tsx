import React, { useState, useEffect } from 'react';
import { X, Check, Loader2, CalendarClock, Info, PartyPopper, Heart } from 'lucide-react';
import { useDonationForm } from '../hooks/useDonationForm';

// 1. הגדרת מבנה הנתונים של תרומה
export interface DonationData {
  date: string;
  id?: string;
  amount: number;
  targetId: number;
  methodId: number;
  isRecurring: boolean;
  installments?: number;
  currency: string;
  notes?: string;
  branchId?: number;
  userId?: number;
}

// 2. הגדרת ה-Props (מה שהקומפוננטה מקבלת מבחוץ) - זה מה שהיה חסר!
interface NewDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  editingDonation?: DonationData | null;
  branchId: number;
}

// 3. הודעות ההצלחה להגרלה
const SUCCESS_MESSAGES = [
  { title: "אשריכם ישראל!", subtitle: "בזכות התרומות עוד ילד יהודי ילך לישון שבע..." },
  { title: "יישר כוח גדול!", subtitle: "עבודתך המסורה מכניסה עוד חתן לחופה ברוגע..." },
  { title: "מצווה גדולה!", subtitle: "צדקה תציל ממות !!!" },
  { title: "שכוייח עצום!", subtitle: "זוכה לברכת גדולי הדור ..." },
  { title: "", subtitle: "בזכותך עוד נפש יהודית זוכה לעזרה..." },];

// 4. הקומפוננטה עצמה

export function NewDonationModal({ isOpen, onClose, onRefresh, editingDonation, branchId }: NewDonationModalProps) {
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // סטייט שיחזיק את ההודעה שנבחרה רנדומלית
  const [currentMessage, setCurrentMessage] = useState(SUCCESS_MESSAGES[0]);

  const { formData, setFormData, handleSave, loading } = useDonationForm(
    editingDonation,
    () => {
      // הגרלת הודעה לפני שמציגים את מסך ההצלחה
      const randomIndex = Math.floor(Math.random() * SUCCESS_MESSAGES.length);
      setCurrentMessage(SUCCESS_MESSAGES[randomIndex]);
      
      setShowSuccess(true);
      onRefresh();
    },
    branchId
  );

  // ... (שאר הלוגיקה של ה-useEffect וה-updateMonthlyAmount נשארת אותו דבר)

  const handleFinalClose = () => {
    setShowSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        
        {!showSuccess ? (
          /* --- כאן הטופס (הקוד הקודם שלך) --- */
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="p-6 space-y-6">
             {/* ... תוכן הטופס כפי שהיה ... */}
             <button type="submit" className="...">
                {loading ? <Loader2 className="..." /> : <Check className="..." />} אישור ושמירה
             </button>
          </form>
        ) : (
          /* --- פופ-אפ ההצלחה עם הכיתוב המוגרל --- */
          <div className="p-10 flex flex-col items-center text-center animate-in fade-in zoom-in-90 duration-300">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 relative">
              <PartyPopper className="w-12 h-12 text-green-500" />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white" />
            </div>
            
            <h2 className="text-3xl font-black text-slate-800 mb-3">
              {currentMessage.title}
            </h2>
            
            <p className="text-slate-500 text-lg font-medium mb-8 leading-relaxed max-w-[280px]">
              {currentMessage.subtitle}
            </p>

            <div className="w-full bg-blue-50/50 rounded-3xl p-5 border border-blue-100/50 mb-8 flex items-center justify-between">
              <div className="text-right">
                <p className="text-[11px] text-blue-400 font-bold uppercase tracking-widest mb-1">סכום התרומה</p>
                <p className="text-2xl font-black text-blue-700">₪{formData.amount.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-white rounded-2xl shadow-sm">
                <Heart className="w-6 h-6 text-red-500 fill-red-500" />
              </div>
            </div>

            <button
              onClick={handleFinalClose}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-[0.98]"
            >
              הפנמתי :)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}