import { useState } from 'react';
import { toast } from 'sonner';
import { cashService } from '../services/cashService';

export function useBillCalculator(branchId: number) {
  const [bills, setBills] = useState({
    200: 0,
    100: 0,
    50: 0,
    20: 0,
  });

  const calculateBillTotal = () => {
    return (bills[200] * 200) + (bills[100] * 100) + (bills[50] * 50) + (bills[20] * 20);
  };

  const handleSave = async () => {
    try {
      const total = calculateBillTotal();
      await cashService.saveDailyReport(branchId, bills, total);
      toast.success('הסיכום נשמר בהצלחה במערכת');
    } catch (error) {
      toast.error('שגיאה בשמירת הנתונים');
    }
  };

  const handlePrint = () => {
    window.print();
    toast.success('הדו"ח נשלח להדפסה');
  };

  const updateBillCount = (denom: number, count: string) => {
    setBills(prev => ({ ...prev, [denom]: parseInt(count) || 0 }));
  };

  return {
    bills,
    total: calculateBillTotal(),
    handleSave,
    handlePrint,
    updateBillCount
  };
}