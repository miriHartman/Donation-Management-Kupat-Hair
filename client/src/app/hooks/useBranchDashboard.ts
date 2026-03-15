// src/hooks/useBranchDashboard.ts
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { DonationData } from '../components/NewDonationModal';
import { donationService } from '../services/donationService';

export function useBranchDashboard(branchId: number) {
  const [donations, setDonations] = useState<DonationData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDonation, setEditingDonation] = useState<DonationData | null>(null);
  const [loading, setLoading] = useState(false);

  // פונקציה לטעינת התרומות מהשרת
  // השתמשנו ב-useCallback כדי שנוכל להעביר אותה בבטחה כ-Prop למודאל
  const fetchDonations = useCallback(async () => {
    if (!branchId) return;
    
    setLoading(true);
    try {
      const data = await donationService.getTodayDonations(branchId);
      setDonations(data);
    } catch (error) {
      console.error('Error fetching donations:', error);
      toast.error('שגיאה בטעינת נתוני התרומות');
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  // טעינה ראשונית של הנתונים כשהקומפוננטה עולה או כשהסניף משתנה
  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  // פונקציה לפתיחת המודאל במצב עריכה
  const handleEditClick = (donation: DonationData) => {
    setEditingDonation(donation);
    setIsModalOpen(true);
  };

  // פונקציה לסגירת המודאל ואיפוס מצב עריכה
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDonation(null);
  };

  return {
    donations,
    isModalOpen,
    setIsModalOpen,
    editingDonation,
    loading,
    fetchDonations, // חשיפת הפונקציה לצורך רענון (onRefresh)
    handleEditClick,
    handleCloseModal
  };
}