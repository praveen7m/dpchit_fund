import { useState, useCallback } from 'react';
import { PaymentService } from '@/services/paymentService';
import { Payment } from '@/lib/database';

export const usePayments = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPayment = useCallback(async (paymentData: Omit<Payment, 'id' | 'createdAt'>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newPayment = await PaymentService.createPayment(paymentData);
      return newPayment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create payment';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAllPayments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const payments = await PaymentService.getAllPayments();
      return payments;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch payments';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getFilteredPayments = useCallback(async (filters: {
    search?: string;
    frequency?: string;
    dateRange?: { from: Date | null; to: Date | null };
  }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const payments = await PaymentService.getFilteredPayments(filters);
      return payments;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to filter payments';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    createPayment,
    getAllPayments,
    getFilteredPayments,
    isLoading,
    error,
    clearError: () => setError(null)
  };
};