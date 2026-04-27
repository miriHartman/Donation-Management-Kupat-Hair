import { useState, useEffect, useCallback } from 'react';
import { donationService } from '../services/donationService';
import { Transaction, Pagination } from '../types';
import { toast } from 'sonner';

export function useFundsData(page: number) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchFunds = useCallback(async () => {
    try {
      setLoading(true);
      const result = await donationService.getFundsDonations(page);
      
      // אם השרת מחזיר את המערך ישירות או אובייקט עם transactions
      setTransactions(result.transactions || result); 
      setPagination(result.pagination || null);
    } catch (error) {
      toast.error('שגיאה בטעינת נתוני קרנות');
    } finally {
      setLoading(false);
    }
  }, [page]);

  const deleteDonation = async (id: number) => {
    if (!window.confirm('למחוק תרומה זו?')) return;
    try {
      await donationService.deleteDonation(id);
      toast.success('נמחק בהצלחה');
      fetchFunds();
    } catch (error) {
      toast.error('שגיאה במחיקה');
    }
  };

  useEffect(() => {
    fetchFunds();
  }, [fetchFunds]);

  return { transactions, loading, pagination, fetchFunds, deleteDonation };
}