import api from '../api/axiosInstance';
import { DonationData } from '../components/NewDonationModal';

// הגדרת טיפוס לפרמטרים של סינון ועימוד
interface QueryParams {
  branch?: string;
  search?: string;
  page?: number;
  limit?: number;
  startDate?: string; // הוספת פרמטר תאריך התחלה
  endDate?: string;   // הוספת פרמטר תאריך סיום
}

export const donationService = {
  // 1. שליפת רשימת עסקאות עם פילטרים ועימוד (עבור דף הדו"חות)
  getTransactions: async (filters: QueryParams) => {
    // הוספת תמיכה ב-params כדי שה-Lazy Loading יעבוד גם כאן
    const response = await api.get('/donations/transactions', { params: filters });
    return response.data;
  },

  // 2. שליפת סטטיסטיקות דשבורד (עבור דף הבית של המנהל)
  getDashboardStats: async (params?: QueryParams) => {
    try {
      // שים לב: הורדתי את ה-/api/ מההתחלה כי הוא בדרך כלל כבר נמצא ב-axiosInstance
      // אם זה עדיין לא עובד, בדקי אם הנתיב ב-Backend הוא /donations/stats
      const response = await api.get('/donations/stats', { params });
      return response.data;
    } catch (error) {
      console.error("API Error (getDashboardStats):", error);
      throw error;
    }
  },
  
  // 3. קבלת תרומות ספציפיות לסניף להיום
  getTodayDonations: async (branchId: number) => {
    const response = await api.get(`/donations/today/${branchId}`);
    return response.data;
  },

  // 4. שמירת תרומה חדשה
  createDonation: async (donation: DonationData & { branchId: number; userId?: number }) => {
    const response = await api.post('/donations', donation);
    return response.data;
  },

  // 5. עדכון תרומה קיימת
  updateDonation: async (id: string, donation: DonationData) => {
    const response = await api.put(`/donations/${id}`, donation);
    return response.data;
  },
  getBranches: async () => {
    try {
      const response = await api.get('/donations/branches');
      return response.data;
    } catch (error) {
      console.error("Error in getBranches service:", error);
      return []; // מחזירים מערך ריק במקרה של שגיאה כדי לא לשבור את ה-UI
    }
  }
};