import api from '@/lib/api';
import { ApiResponse, User } from '@/types';

export const authService = {
  register: async (data: {
    fullName: string;
    email: string;
    password: string;
    phoneNumber: string;
  }): Promise<ApiResponse<{ token: string; user: User }>> => {
    const res = await api.post('/auth/register', data);
    return res.data;
  },

  login: async (data: {
    email: string;
    password: string;
  }): Promise<ApiResponse<{ token: string; user: User }>> => {
    const res = await api.post('/auth/login', data);
    return res.data;
  },

  getMe: async (): Promise<ApiResponse<User>> => {
    const res = await api.get('/auth/me');
    return res.data;
  },

  logout: async (): Promise<ApiResponse> => {
    const res = await api.post('/auth/logout');
    return res.data;
  },
};
