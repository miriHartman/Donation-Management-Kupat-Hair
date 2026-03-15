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
    // 1. בדיקת תקינות סכום
    if (!formData.amount || formData.amount <= 0) {
      toast.error('סכום התרומה חייב להיות גדול מ-0');
      return;
    }

    // 2. בדיקת קיום סניף (המרה למספר לוודא שזה לא undefined או סטרינג ריק)
    const selectedBranchId = Number(formData.branchId);
    if (!selectedBranchId || selectedBranchId === 0) {
      toast.error('שגיאה: מזהה סניף חסר');
      return;
    }

    setLoading(true);
    try {
      // שליפת ה-ID של המשתמש המחובר מה-localStorage
      const userString = localStorage.getItem('user');
      const user = userString ? JSON.parse(userString) : null;
      const userId = user?.id ? Number(user.id) : undefined;

      // בניית האובייקט לשליחה לשרת
      const payload = {
        ...formData,
        branchId: selectedBranchId,
        userId: userId
      } as any;

      if (editingDonation?.id) {
        // עדכון תרומה קיימת
        await donationService.updateDonation(editingDonation.id, payload);
        toast.success('התרומה עודכנה בהצלחה');
      } else {
        // יצירת תרומה חדשה
        await donationService.createDonation(payload);
        toast.success('התרומה נשמרה בהצלחה');
      }
      
      // קריאה לפונקציית ההצלחה (סגירת המודאל וריענון נתונים מקומי)
      // חשוב: לוודא שב-AdminDashboard ה-onSuccess לא קורא ל-window.location.reload()
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