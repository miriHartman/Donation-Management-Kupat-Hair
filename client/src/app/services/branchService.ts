import api from '../api/axiosInstance';

export interface Branch {
  id: number;
  name: string;
  color?: string;
  address?: string;
  is_active?: boolean | number; // הוספתי אופציונלי למקרה שתשתמשי בסטטוס פעיל/לא פעיל
}

export const branchService = {
  // שליפת כל הסניפים מהשרת

  getBranches: async () => {
    try {
      const response = await api.get('/branches');
      return response.data;
    } catch (error) {
      console.error("Error in getBranches service:", error);
      return []; // מחזירים מערך ריק במקרה של שגיאה כדי לא לשבור את ה-UI
    }
  },
 
  // יצירת סניף חדש
  createBranch: async (branchData: Omit<Branch, 'id'>): Promise<Branch> => {
    try {
      const response = await api.post('/branches', branchData);
      return response.data;
    } catch (error) {
      console.error('Error creating branch:', error);
      throw error;
    }
  },

  // עדכון סניף קיים
  updateBranch: async (id: number, branchData: Partial<Branch>): Promise<Branch> => {
    try {
      const response = await api.put(`/branches/${id}`, branchData);
      return response.data;
    } catch (error) {
      console.error('Error updating branch:', error);
      throw error;
    }
  },

  // מחיקת סניף
 async deleteBranch(id: number) {
  try {
    const response = await api.delete(`/branches/${id}`);
    // חשוב להחזיר את ה-data כדי שנוכל להשתמש ב-action וב-message
    return response.data; 
  } catch (error) {
    console.error('Error deleting branch:', error);
    throw error;
  }
}
};