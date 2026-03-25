export interface Rate {
  currency_code: string;
  rate: number;
}

export const exchangeRateService = {
  async getRates(): Promise<Rate[]> {
    const response = await fetch('/api/exchange-rates');
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }
    return response.json();
  }
};