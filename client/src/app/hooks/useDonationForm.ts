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

  const [formData, setFormData] = useState<DonationData>({
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
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (editingDonation) {
      setFormData({
        ...editingDonation,
        branchId: editingDonation.branchId || initialBranchId || 0,
        date: editingDonation.date
          ? editingDonation.date.split('T')[0]
          : new Date().toISOString().split('T')[0],
        // וודוא שהשדות קיימים גם בעריכה
        fundNumber: editingDonation.fundNumber || '',
        targetOtherNote: editingDonation.targetOtherNote || ''
      });
    } else {
      setFormData({
        amount: 0,
        targetId: 1,
        methodId: 1,
        isRecurring: false,
        fundNumber: '', // איפוס במעבר לתרומה חדשה
        targetOtherNote: '', // איפוס במעבר לתרומה חדשה
        installments: 1,
        currency: 'ILS',
        notes: '',
        workerName: '',
        branchId: initialBranchId || 0,
        date: new Date().toISOString().split('T')[0]
      });
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
        ...formData,
        branchId: selectedBranchId,
        userId: userId,
        fundNumber: formData.targetId === 2 ? formData.fundNumber : null ,
        targetOtherNote: formData.targetId === 3 ? formData.targetOtherNote : null,
        is_recurring: formData.isRecurring ? 1 : 0,
        months_count: formData.isRecurring ? (formData.installments || 1) : 1,
        targetId: formData.targetId,
        methodId: formData.methodId
      };

      if (editingDonation?.id) {
        await donationService.updateDonation(editingDonation.id, payload as any);
        toast.success('התרומה עודכנה בהצלחה');
      } else {
        await donationService.createDonation(payload as any);
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