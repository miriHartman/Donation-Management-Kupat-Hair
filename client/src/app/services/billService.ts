import api from '../api/axiosInstance';

// הגדרת ממשק לנתונים שחוזרים מהשרת (לפי מבנה ה-SQL שלך)
interface CashReportResponse {
  id: number;
  branch_id: number;
  report_date: string;
  bills_20: number;
  bills_50: number;
  bills_100: number;
  bills_200: number;
  total_amount: string | number;
}

export const billService = {
  /**
   * שליפת סיכום קיים להיום עבור סניף ספציפי
   * GET /api/cash-reports/:branchId
   */
  getDailySummary: async (branchId: number) => {
    try {
      const response = await api.get<CashReportResponse>(`/cash-reports/${branchId}`);
      const data = response.data;

      // המרה מהמבנה של ה-DB (עמודות נפרדות) למבנה שהמחשבון ב-React מכיר (Object)
      return {
        id: data.id,
        total_amount: Number(data.total_amount),
        counts: {
          20: data.bills_20 || 0,
          50: data.bills_50 || 0,
          100: data.bills_100 || 0,
          200: data.bills_200 || 0
        }
      };
    } catch (error: any) {
      // אם לא נמצא דיווח להיום (404), מחזירים null כדי שהכפתור יישאר במצב "חדש"
      if (error.response && error.response.status === 404) {
        return null;
      }
      console.error("Error fetching daily summary:", error);
      throw error;
    }
  },

  /**
   * שמירה (POST) או עדכון (PUT) של סיכום שטרות
   */
  saveSummary: async (branchId: number, bills: Record<number, number>, total: number, recordId?: number | null) => {
    // הכנת האובייקט לשליחה לשרת
    const payload = { 
      branchId, 
      bills, // השרת יפרק את זה ל-bills_20, bills_50 וכו'
      total_amount: total 
    };

    try {
      if (recordId) {
        // עדכון רשומה קיימת: PUT /api/cash-reports/:recordId
        const response = await api.put(`/cash-reports/${recordId}`, payload);
        return response.data;
      } else {
        // יצירת רשומה חדשה: POST /api/cash-reports
        const response = await api.post('/cash-reports', payload);
        return response.data;
      }
    } catch (error) {
      console.error("Error saving cash report:", error);
      throw error;
    }
  },
  // --- פונקציה חדשה שנוספה ---
  getExpectedCash: async (branchId: number): Promise<number> => {
    try {
      const response = await api.get<{ totalCash: number }>(`/donations/cash/${branchId}`);
      return Number(response.data.totalCash) || 0;
    } catch (error) {
      console.error("Error fetching expected cash:", error);
      return 0;
    }
  },
};