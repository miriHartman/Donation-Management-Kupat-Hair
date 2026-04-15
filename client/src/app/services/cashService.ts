// client/src/services/cashService.ts
import api from '../api/axiosInstance';

export const cashService = {
  // יצירת דוח חדש (POST)
  saveDailyReport: async (branchId: number, bills: Record<number, number>, total: number) => {
    const response = await api.post('/cash-reports', {
      branchId,
      bills,
      total_amount: total // שימוש בנחש (underscore) להתאמה ל-DB
    });
    return response.data;
  },

  // עדכון דוח קיים (PUT) - זה מה שקרא לשגיאה שלך
  updateSummary: async (recordId: number, branchId: number, bills: Record<number, number>, total: number) => {
    const response = await api.put(`/cash-reports/${recordId}`, {
      branchId,
      bills,
      total_amount: total
    });
    return response.data;
  }
};