const API_BASE_URL = '/api/bills';

export const billService = {
  // שליפת סיכום קיים להיום
  async getDailySummary(branchId: number) {
    const response = await fetch(`${API_BASE_URL}/daily/${branchId}`);
    if (!response.ok) {
      if (response.status === 404) return null; // אין עדיין סיכום להיום
      throw new Error('Failed to fetch summary');
    }
    return response.json();
  },

  // שמירה או עדכון
  async saveSummary(branchId: number, bills: Record<number, number>, total: number, recordId?: number | null) {
    const method = recordId ? 'PUT' : 'POST';
    const url = recordId ? `${API_BASE_URL}/${recordId}` : API_BASE_URL;

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ branchId, counts: bills, total_amount: total })
    });

    if (!response.ok) throw new Error('Failed to save summary');
    return response.json();
  }
};