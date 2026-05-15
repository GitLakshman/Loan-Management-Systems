import { AxiosError } from 'axios';
import toast from 'react-hot-toast';

/**
 * Standardized error handler for API requests
 * Extracts the most meaningful error message to show to the user.
 */
export const handleError = (error: unknown, fallbackMessage: string = 'An unexpected error occurred') => {
  // Check if it's an Axios error
  if (error && typeof error === 'object' && 'isAxiosError' in error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    
    // Server responded with an error payload
    if (axiosError.response?.data?.message) {
      toast.error(axiosError.response.data.message);
      return;
    }
    
    // Network error (no response)
    if (axiosError.request && !axiosError.response) {
      toast.error('Network error. Please check your connection and try again.');
      return;
    }
  }

  // Native JS Error
  if (error instanceof Error) {
    toast.error(error.message);
    return;
  }

  // String error
  if (typeof error === 'string') {
    toast.error(error);
    return;
  }

  // Fallback
  toast.error(fallbackMessage);
};
