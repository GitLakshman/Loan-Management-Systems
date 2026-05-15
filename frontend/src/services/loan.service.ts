import api from '@/lib/api';
import { ApiResponse, Loan } from '@/types';

export const loanService = {
  savePersonalDetails: async (data: {
    fullName: string;
    pan: string;
    dob: string;
    monthlySalary: number;
    employmentMode: string;
  }): Promise<ApiResponse<{ loan: Loan }>> => {
    const res = await api.post('/loans/personal-details', data);
    return res.data;
  },

  uploadSalarySlip: async (loanId: string, file: File): Promise<ApiResponse> => {
    const formData = new FormData();
    formData.append('salarySlip', file);
    formData.append('loanId', loanId);
    const res = await api.post('/uploads/salary-slip', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  applyLoan: async (data: {
    loanId: string;
    loanAmount: number;
    tenureDays: number;
  }): Promise<ApiResponse<{ loan: Loan }>> => {
    const res = await api.post('/loans/apply', data);
    return res.data;
  },

  getMyLoans: async (): Promise<ApiResponse<{ loans: Loan[] }>> => {
    const res = await api.get('/loans/my-loans');
    return res.data;
  },

  getLoanById: async (id: string): Promise<ApiResponse<{ loan: Loan }>> => {
    const res = await api.get(`/loans/${id}`);
    return res.data;
  },

  // Sanction APIs
  getSanctionLoans: async (): Promise<ApiResponse<{ loans: Loan[] }>> => {
    const res = await api.get('/loans/sanction/list');
    return res.data;
  },

  approveLoan: async (loanId: string, remarks?: string): Promise<ApiResponse<{ loan: Loan }>> => {
    const res = await api.patch(`/loans/sanction/${loanId}/approve`, { remarks });
    return res.data;
  },

  rejectLoan: async (loanId: string, reason: string): Promise<ApiResponse<{ loan: Loan }>> => {
    const res = await api.patch(`/loans/sanction/${loanId}/reject`, { reason });
    return res.data;
  },

  // Disbursement APIs
  getDisbursementLoans: async (): Promise<ApiResponse<{ loans: Loan[] }>> => {
    const res = await api.get('/loans/disbursement/list');
    return res.data;
  },

  disburseLoan: async (loanId: string): Promise<ApiResponse<{ loan: Loan }>> => {
    const res = await api.patch(`/loans/disbursement/${loanId}/disburse`);
    return res.data;
  },

  // Collection APIs
  getCollectionLoans: async (): Promise<ApiResponse<{ loans: Loan[] }>> => {
    const res = await api.get('/loans/collection/list');
    return res.data;
  },
};
