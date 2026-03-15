import api from '../api/axiosInstance';

export const cashService = {
  saveDailyReport: async (branchName: string, bills: Record<number, number>, total: number) => {
    const response = await api.post('/cash-reports', {
      branchName,
      reportDate: new Date().toISOString(),
      bills,
      totalAmount: total
    });
    return response.data;
  }
};