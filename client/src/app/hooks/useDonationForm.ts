import { useState, useEffect } from 'react';
import { donationService } from '../services/donationService';
import { toast } from 'sonner';
import { DonationData } from '../components/NewDonationModal';

export function useDonationForm(
  editingDonation: DonationData | null | undefined,
  onSuccess: () => void,
  initialBranchId: number
) {
  const [loading, setLoading] = useState(false);
  
  // אתחול ה-State עם ערכי ברירת מחדל כולל תאריך וסניף
  const [formData, setFormData] = useState<DonationData>({
    amount: 0,
    targetId: 1,
    methodId: 1,
    isRecurring: false,
    installments: 1,
    currency: 'ILS',
    notes: '',
    branchId: initialBranchId || 0,
    date: new Date().toISOString().split('T')[0]
  });

  // עדכון הטופס כאשר נכנסים למצב עריכה
  useEffect(() => {
    if (editingDonation) {
      setFormData({
        ...editingDonation,
        branchId: editingDonation.branchId || initialBranchId || 0,
        date: editingDonation.date || new Date().toISOString().split('T')[0]
      });
    } else {
      setFormData({ 
        amount: 0, 
        targetId: 1, 
        methodId: 1, 
        isRecurring: false, 
        installments: 1, 
        currency: 'ILS', 
        notes: '',
        branchId: initialBranchId || 0,
        date: new Date().toISOString().split('T')[0]
      });
    }
  }, [editingDonation, initialBranchId]);

  const handleSave = async () => {
    // 1. בדיקות תקינות כרגיל...
    if (!formData.amount || formData.amount <= 0) {
      toast.error('סכום התרומה חייב להיות גדול מ-0');
      return;
    }

    const selectedBranchId = Number(formData.branchId);
    if (!selectedBranchId || selectedBranchId === 0) {
      toast.error('שגיאה: מזהה סניף חסר');
      return;
    }

    setLoading(true);
    try {
      const userString = localStorage.getItem('user');
      const user = userString ? JSON.parse(userString) : null;
      const userId = user?.id ? Number(user.id) : undefined;

      // 2. בניית ה-Payload עם התאמה לשמות השדות בשרת (Mapping)
      const payload = {
        ...formData,
        branchId: selectedBranchId,
        userId: userId,
        // כאן אנחנו עושים את התיקון הקריטי:
        is_recurring: formData.isRecurring ? 1 : 0,
        months_count: formData.isRecurring ? (formData.installments || 1) : 1,
        // שמות ה-ID של יעד ואמצעי תשלום כבר מטופלים בסרוויס בשרת (הוא עושה Mapping),
        // אבל ליתר ביטחון נוודא שהם שם:
        targetId: formData.targetId,
        methodId: formData.methodId
      };

      if (editingDonation?.id) {
        await donationService.updateDonation(editingDonation.id, payload);
        toast.success('התרומה עודכנה בהצלחה');
      } else {
        await donationService.createDonation(payload);
        toast.success('התרומה נשמרה בהצלחה');
      }
      
      onSuccess();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('שגיאה בשמירת הנתונים');
    } finally {
      setLoading(false);
    }
  };

  return { formData, setFormData, handleSave, loading };
}