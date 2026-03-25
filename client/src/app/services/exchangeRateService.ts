import api from '../api/axiosInstance';

export interface Rate {
  currency_code: string;
  rate: number;
  last_update?: string; // הוספתי אופציונלי כי זה קיים במסד
}

export const exchangeRateService = {
  async getRates(): Promise<Rate[]> {
    try {
     
      const response = await api.get('/exchange-rates');
      
      return response.data;
    } catch (error) {
      console.error('Error in exchangeRateService.getRates:', error);
      throw new Error('Failed to fetch exchange rates');
    }
  }
};