import api from '../api/axiosInstance';

export interface Branch {
  id: number;
  name: string;
  color?: string;
  address?: string;
  isActive?: boolean; // הוספתי אופציונלי למקרה שתשתמשי בסטטוס פעיל/לא פעיל
}

export const branchService = {
  // שליפת כל הסניפים מהשרת
  getAllBranches: async (): Promise<Branch[]> => {
    const response = await api.get('/branches');
    return response.data;
  },

  // שליפת סניפים פעילים בלבד
  getActiveBranches: async (): Promise<Branch[]> => {
    try {
      const response = await api.get('/branches/active');
      return response.data;
    } catch (error) {
      console.error('Error fetching active branches:', error);
      throw error;
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