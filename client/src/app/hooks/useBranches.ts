import { useState, useEffect, useCallback } from 'react';
import { branchService, Branch } from '../services/branchService';
import { toast } from 'sonner';

export function useBranches() {
  const [activeBranches, setBranches] = useState<Branch[]>([]);
  const [allBranches, setAllBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // פונקציות השליפה עטופות ב-useCallback כדי לאפשר קריאה חוזרת אחרי עדכונים
  const fetchActiveBranches = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await branchService.getActiveBranches();
      setBranches(data);
    } catch (error) {
      console.error('Error fetching branches:', error);
      toast.error('שגיאה בטעינת רשימת הסניפים');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAllBranches = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await branchService.getAllBranches();
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
    await Promise.all([fetchActiveBranches(), fetchAllBranches()]);
  }, [fetchActiveBranches, fetchAllBranches]);

  // טעינה ראשונית של הנתונים
  useEffect(() => {
    refreshBranches();
  }, [refreshBranches]);

  /** * פונקציות ניהול הסניפים החדשות (התוספת הנדרשת):
   */

  // שמירת סניף - תומך בהוספה (ללא ID) ובעריכה (עם ID)
  const saveBranch = async (branchData: Partial<Branch>, id?: number) => {
    try {
      if (id) {
        // עדכון סניף קיים
        await branchService.updateBranch(id, branchData);
      } else {
        // יצירת סניף חדש
        await branchService.createBranch(branchData as any);
      }
      // רענון הרשימות לאחר שינוי מוצלח
      await refreshBranches();
    } catch (error) {
      console.error('Error saving branch:', error);
      throw error; // זריקת השגיאה כדי שה-UI (ה-Toast בקומפוננטה) יטפל בה
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