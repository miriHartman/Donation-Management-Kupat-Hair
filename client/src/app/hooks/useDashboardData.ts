// Frontend Hook: useDashboardData.ts

import { useEffect, useState, useCallback } from "react";
import { donationService } from "../services/donationService";

// הגדרת ה-Interface
interface DashboardData {
  transactions: any[];
  stats: any[];
  todaySummary: any;
  branchSummary: any[]; // כאן יוחזרו האחוזים לכל סניף
  branches: { id: number; name: string }[];
  pagination: any;
  loading: boolean;
  fetchData: () => Promise<void>;
}

export function useDashboardData(
  selectedBranch: string, 
  searchTerm: string, 
  page: number = 1,
  dateRange: { start: string, end: string }
): DashboardData {
  
  const [dataState, setDataState] = useState<Omit<DashboardData, 'fetchData'>>({
    transactions: [],
    stats: [],
    todaySummary: { total: 0, donations: 0, branches: [] },
    branchSummary: [],
    branches: [],
    pagination: null,
    loading: true
  });

  // שליפת רשימת הסניפים (ל-Select)
  const fetchBranches = useCallback(async () => {
    try {
      const branchList = await donationService.getBranches();
      setDataState(prev => ({ 
        ...prev, 
        branches: branchList || [] 
      }));
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  }, []);

  // שליפת הנתונים הסטטיסטיים, העסקאות ופילוח הרווחיות
  const fetchData = useCallback(async () => {
    try {
      setDataState(prev => ({ ...prev, loading: true }));

      const result = await donationService.getDashboardStats({
        branch: selectedBranch,
        search: searchTerm,
        page: page,
        limit: 10,
        startDate: dateRange.start,
        endDate: dateRange.end
      });

      // --- חישוב אחוזי רווחיות ---
      const summary = result.branchSummary || [];
      // חישוב הסכום הכולל בטווח התאריכים שנבחר
      const totalAmount = summary.reduce((sum: number, b: any) => sum + b.amount, 0) || 1;

      // הוספת שדה percentage לכל סניף
      const branchSummaryWithPercentages = summary.map((b: any) => ({
        ...b,
        percentage: Number(((b.amount / totalAmount) * 100).toFixed(1))
      }));
      // --------------------------
      
      setDataState(prev => ({
        ...prev,
        stats: result.stats || [],
        transactions: result.transactions || [],
        todaySummary: result.todaySummary || { total: 0, donations: 0, branches: [] },
        branchSummary: branchSummaryWithPercentages, // הנתונים המעודכנים עם האחוזים
        pagination: result.pagination || null,
        loading: false
      }));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setDataState(prev => ({ ...prev, loading: false }));
    }
  }, [selectedBranch, searchTerm, page, dateRange.start, dateRange.end]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...dataState,
    fetchData
  };
}