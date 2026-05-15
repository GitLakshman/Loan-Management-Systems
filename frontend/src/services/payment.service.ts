import api from '@/lib/api';
import { ApiResponse, Payment, DashboardStats } from '@/types';

export const paymentService = {
  recordPayment: async (
    loanId: string,
    data: { utrNumber: string; amount: number; paymentDate: string }
  ): Promise<ApiResponse> => {
    const res = await api.post(`/collection/${loanId}/payment`, data);
    return res.data;
  },

  getLoanPayments: async (loanId: string): Promise<ApiResponse<{ payments: Payment[] }>> => {
    const res = await api.get(`/collection/${loanId}/payments`);
    return res.data;
  },

  getDashboardStats: async (): Promise<ApiResponse<DashboardStats>> => {
    const res = await api.get('/dashboard/stats');
    return res.data;
  },
};
