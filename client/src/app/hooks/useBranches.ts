import { useState, useEffect, useCallback } from 'react';
import { branchService, Branch } from '../services/branchService';
import { CreateBranchData } from '../types';
import { toast } from 'sonner';

export function useBranches() {
  const [activeBranches, setBranches] = useState<Branch[]>([]);
  const [allBranches, setAllBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // פונקציות השליפה עטופות ב-useCallback כדי לאפשר קריאה חוזרת אחרי עדכונים
  // const fetchActiveBranches = useCallback(async () => {
  //   try {
  //     setIsLoading(true);
  //     const data = await branchService.getActiveBranches();
  //     setBranches(data);
  //   } catch (error) {
  //     console.error('Error fetching branches:', error);
  //     toast.error('שגיאה בטעינת רשימת הסניפים');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }, []);

  const fetchAllBranches = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await branchService.getBranches();
      setAllBranches(data);
    } catch (error) {
      console.error('Error fetching all branches:', error);
      toast.error('שגיאה בטעינת רשימת כל הסניפים');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // פונקציה מאוחדת לרענון כל הנתונים
  const refreshBranches = useCallback(async () => {
    await Promise.all([
      // fetchActiveBranches(), 
        fetchAllBranches()]);
  },
   [
    // fetchActiveBranches,
     fetchAllBranches]);

  // טעינה ראשונית של הנתונים
  useEffect(() => {
    refreshBranches();
  }, [refreshBranches]);

  /** * פונקציות ניהול הסניפים החדשות (התוספת הנדרשת):
   */

  // שמירת סניף - תומך בהוספה (ללא ID) ובעריכה (עם ID)
  const saveBranch = async (branchData: Partial<Branch>, id?: number): Promise<Branch | null> => {
    try {
        if (id) {
            await branchService.updateBranch(id, branchData);
            await refreshBranches();
            return null;
        } else {
            const created = await branchService.createBranch(branchData as CreateBranchData);
            await refreshBranches();
            return created; // ← מחזיר את הסניף החדש עם ה-id
        }
    } catch (error) {
        console.error('Error saving branch:', error);
        throw error;
    }
};
// מחיקת סניף -מחזיר האם נמחק או רק הפך ל"לא פעיל"
const deleteBranch = async (id: number) => {
  try {
    // 1. שומרים את התוצאה שחוזרת מהסרוויס (action, message וכו')
    const result = await branchService.deleteBranch(id);
    
    // 2. רענון הרשימה כדי שהשינוי ייראה מיד במסך
    await refreshBranches();
    
    // 3. חשוב מאוד: מחזירים את ה-result כדי שהקומפוננטה תוכל להשתמש בו ל-Toast
    return result; 
  } catch (error) {
    console.error('Error deleting branch:', error);
    throw error;
  }
};

  return { 
    activeBranches, 
    allBranches, 
    isLoading, 
    refreshBranches, 
    saveBranch, 
    deleteBranch 
  };
}