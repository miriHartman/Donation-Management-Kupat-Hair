import axios from 'axios';
import api from '../api/axiosInstance';


export interface Branch {
  id: number;
  name: string;
  color?: string;
  address?: string;
}

export const branchService = {
  // שליפת כל הסניפים מהשרת
  getAllBranches: async (): Promise<Branch[]> => {
    const response = await api.get('/branches');
    return response.data;
  }
};