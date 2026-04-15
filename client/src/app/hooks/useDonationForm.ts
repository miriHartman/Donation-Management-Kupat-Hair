import { useState, useEffect } from 'react';
import { donationService } from '../services/donationService';
import { toast } from 'sonner';
import { DonationData } from '../types';

// סוג משלח עבור form state (id אופציונלי בזמן יצירה)
type DonationFormData = Omit<DonationData, 'id'> & { id?: number };

export function useDonationForm(
  editingDonation: DonationData | null | undefined,
  onSuccess: () => void,
  initialBranchId: number
) {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<DonationFormData>({
    amount: 0,
    targetId: 1,
    methodId: 1,
    isRecurring: false,
    fundNumber: '', // אתחול
    targetOtherNote: '', // אתחול
    installments: 1,
    currency: 'ILS',
    notes: '',
    workerName: '',
    branchId: initialBranchId || 0,
    date: "" // אתחול
  });

  useEffect(() => {
  if (editingDonation) {
    // מצב עריכה
    setFormData({
      ...editingDonation,
      branchId: editingDonation.branchId || initialBranchId || 0,
      date: editingDonation.date 
        ? editingDonation.date.split('T')[0] 
        : new Date().toISOString().split('T')[0],
      fundNumber: editingDonation.fundNumber || '',
      targetOtherNote: editingDonation.targetOtherNote || ''
    });
  } else {
    // מצב תרומה חדשה - איפוס שדות תוך שמירה על מבנה האובייקט
    setFormData(prev => ({
      ...prev, // שומר על ערכי ברירת המחדל של targetId, methodId וכו'
      amount: 0,
      isRecurring: false,
      installments: 1,
      fundNumber: '',
      targetOtherNote: '',
      notes: '',
      workerName: '',
      currency: 'ILS',
      branchId: initialBranchId || 0, // התיקון הקריטי לממשק מנהל
      date: ""
    }));
  }
}, [editingDonation, initialBranchId]);

  const handleSave = async () => {
    if (!formData.amount || formData.amount <= 0) {
      
      toast.error('סכום התרומה חייב להיות גדול מ-0');
      return;
    }

    const selectedBranchId = Number(formData.branchId);
    if (!selectedBranchId || selectedBranchId === 0) {
      toast.error('שגיאה: מזהה סניף חסר');
      return;
    }

    // וולידציה לשדות חובה מותנים
    if (formData.targetId === 2 && !formData.fundNumber) {
      toast.error('חובה להזין מספר קרן');
      return;
    }
    if (formData.targetId === 3 && !formData.targetOtherNote) {
      toast.error('חובה לפרט את יעד התרומה');
      return;
    }

    setLoading(true);
    try {
      const userString = localStorage.getItem('user');
      const user = userString ? JSON.parse(userString) : null;
      const userId = user?.id ? Number(user.id) : undefined;

      const payload = {
        branchId: selectedBranchId,
        userId: userId,
        fundNumber: formData.targetId === 2 ? formData.fundNumber : undefined,
        targetOtherNote: formData.targetId === 3 ? formData.targetOtherNote : undefined,
        is_recurring: formData.isRecurring ? 1 : 0,
        months_count: formData.isRecurring ? (formData.installments || 1) : 1,
        targetId: formData.targetId,
        methodId: formData.methodId,
        amount: formData.amount,
        date: formData.date,
        currency: formData.currency,
        workerName: formData.workerName,
        notes: formData.notes,
        isRecurring: formData.isRecurring,
        installments: formData.installments
      } as const;

      if (editingDonation && editingDonation.id) {
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