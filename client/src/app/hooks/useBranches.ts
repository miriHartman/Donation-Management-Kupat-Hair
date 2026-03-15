import { useState, useEffect } from 'react';
import { branchService, Branch } from '../services/branchService';
import { toast } from 'sonner';

export function useBranches() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setIsLoading(true);
        const data = await branchService.getAllBranches();
        setBranches(data);
      } catch (error) {
        console.error('Error fetching branches:', error);
        toast.error('שגיאה בטעינת רשימת הסניפים');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBranches();
  }, []);

  return { branches, isLoading };
}