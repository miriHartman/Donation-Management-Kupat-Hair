import { AxiosError } from 'axios';
import api from '../api/axiosInstance';

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

  getDailySummary: async (branchId: number): Promise<any> => {
    try {
      const response = await api.get<CashReportResponse>(`/cash-reports/${branchId}`);
      const data = response.data;

      if (!data) return null; //  הגנה נוספת

      return {
        id: data.id ?? null,
        date: data.report_date,
        total_amount: Number(data.total_amount),
        counts: {
          200: data.bills_200 || 0,
          100: data.bills_100 || 0,
          50: data.bills_50 || 0,
          20: data.bills_20 || 0
        }
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        return null; //  תקין, אין דיווח להיום
      }
      console.error("Error fetching daily summary:", error);
      return null; //  במקום throw — מחזיר null ולא קורס
    }
  },

  saveSummary: async (branchId: number, bills: Record<number, number>, total: number, recordId?: number | null) => {
    const payload = {
      branchId,
      bills,
      total_amount: total
    };

    try {
      if (recordId) {
        const response = await api.put(`/cash-reports/${recordId}`, payload);
        return response.data;
      } else {
        const response = await api.post('/cash-reports', payload);
        return response.data;
      }
    } catch (error) {
      console.error("Error saving cash report:", error);
      throw error;
    }
  },

  // מזומן + צ'ק ביחד
  getAmountCheckAndCash: async (branchId: number): Promise<{ totalCash: number; totalCheck: number }> => {
    try {
        const response = await api.get<{ totalCash: number; totalCheck: number }>(
            `/donations/cashAndCheck/${branchId}`
        );
        return {
            totalCash: Number(response.data.totalCash) || 0,
            totalCheck: Number(response.data.totalCheck) || 0
        };
    } catch (error) {
        console.error("Error fetching by method:", error);
        return { totalCash: 0, totalCheck: 0 };
    }
},
};