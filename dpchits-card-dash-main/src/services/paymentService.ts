import { apiService } from './apiService';
import { Payment } from '@/lib/database';

export class PaymentService {
  // Create new payment
  static async createPayment(paymentData: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment> {
    try {
      return await apiService.createPayment(paymentData);
    } catch (error) {
      console.error('Error creating payment:', error);
      throw new Error('Failed to create payment');
    }
  }

  // Get all payments
  static async getAllPayments(): Promise<Payment[]> {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role === 'admin') {
      return await apiService.getAllPayments();
    } else {
      return await apiService.getMyPayments();
    }
  }

  // Search and filter payments
  static async getFilteredPayments(filters: {
    search?: string;
    frequency?: string;
    dateRange?: { from: Date | null; to: Date | null };
  }): Promise<Payment[]> {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role === 'admin') {
      return await apiService.getAllPayments({
        search: filters.search,
        frequency: filters.frequency,
        dateFrom: filters.dateRange?.from?.toISOString(),
        dateTo: filters.dateRange?.to?.toISOString()
      });
    } else {
      const payments = await apiService.getMyPayments();
      return this.filterPaymentsLocally(payments, filters);
    }
  }

  private static filterPaymentsLocally(payments: Payment[], filters: any): Payment[] {
    let filtered = [...payments];

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(payment =>
        payment.name.toLowerCase().includes(searchTerm) ||
        payment.phone.includes(searchTerm) ||
        payment.invoiceNo.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.frequency && filters.frequency !== 'all') {
      filtered = filtered.filter(payment => payment.frequency === filters.frequency);
    }

    if (filters.dateRange?.from || filters.dateRange?.to) {
      filtered = filtered.filter(payment => {
        const paymentDate = new Date(payment.date);
        const fromDate = filters.dateRange?.from;
        const toDate = filters.dateRange?.to;
        
        if (fromDate && paymentDate < fromDate) return false;
        if (toDate && paymentDate > toDate) return false;
        return true;
      });
    }

    return filtered;
  }

  // Get payment by invoice number
  static async getPaymentByInvoice(invoiceNo: string): Promise<Payment | null> {
    try {
      const payment = await paymentDB.getPaymentByInvoice(invoiceNo);
      return payment || null;
    } catch (error) {
      console.error('Error fetching payment by invoice:', error);
      return null;
    }
  }

  // Update payment
  static async updatePayment(id: number, paymentData: Partial<Payment>): Promise<boolean> {
    try {
      return await paymentDB.updatePayment(id, paymentData);
    } catch (error) {
      console.error('Error updating payment:', error);
      return false;
    }
  }

  // Delete payment
  static async deletePayment(id: string): Promise<boolean> {
    try {
      await apiService.deletePayment(id);
      return true;
    } catch (error) {
      console.error('Error deleting payment:', error);
      return false;
    }
  }

  static async getStats() {
    try {
      return await apiService.getStats();
    } catch (error) {
      console.error('Error fetching stats:', error);
      return { totalPayments: 0, totalAmount: 0, monthlyPayments: 0 };
    }
  }

  // Migrate localStorage data to database (one-time migration)
  static async migrateFromLocalStorage(): Promise<void> {
    console.log('Migration not needed with API backend');
  }
}