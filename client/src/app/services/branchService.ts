import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export interface Branch {
  id: number;
  name: string;
  employees?: number;
  color?: string;
  address?: string;
}

export const branchService = {
  // שליפת כל הסניפים מהשרת
  getAllBranches: async (): Promise<Branch[]> => {
    const response = await axios.get(`${API_URL}/branches`);
    return response.data;
  }
};