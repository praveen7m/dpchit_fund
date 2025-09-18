export interface Payment {
  id?: number;
  invoiceNo: string;
  name: string;
  phone: string;
  location: string;
  amount: string;
  frequency: string;
  date: string;
  status: string;
  createdAt?: string;
}

class PaymentDatabase {
  private storageKey = 'dp_chit_payments';
  private metaKey = 'dp_chit_meta';

  private getPayments(): Payment[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private savePayments(payments: Payment[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(payments));
    localStorage.setItem(this.metaKey, JSON.stringify({ lastUpdated: new Date().toISOString() }));
    
    // Dispatch custom event for real-time updates
    window.dispatchEvent(new CustomEvent('paymentUpdated', { detail: { payments } }));
  }

  private getNextId(): number {
    const payments = this.getPayments();
    return payments.length > 0 ? Math.max(...payments.map(p => p.id || 0)) + 1 : 1;
  }

  // Insert new payment
  async insertPayment(payment: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment> {
    const payments = this.getPayments();
    const newPayment: Payment = {
      ...payment,
      id: this.getNextId(),
      createdAt: new Date().toISOString()
    };
    payments.push(newPayment);
    this.savePayments(payments);
    console.log('Payment saved permanently:', newPayment.invoiceNo);
    return newPayment;
  }

  // Get all payments
  async getAllPayments(): Promise<Payment[]> {
    const payments = this.getPayments();
    return payments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // Get payment by ID
  async getPaymentById(id: number): Promise<Payment | undefined> {
    const payments = this.getPayments();
    return payments.find(p => p.id === id);
  }

  // Get payment by invoice number
  async getPaymentByInvoice(invoiceNo: string): Promise<Payment | undefined> {
    const payments = this.getPayments();
    return payments.find(p => p.invoiceNo === invoiceNo);
  }

  // Search payments
  async searchPayments(searchTerm: string): Promise<Payment[]> {
    const payments = this.getPayments();
    const term = searchTerm.toLowerCase();
    return payments
      .filter(payment => 
        payment.name.toLowerCase().includes(term) ||
        payment.phone.includes(term) ||
        payment.invoiceNo.toLowerCase().includes(term)
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // Update payment
  async updatePayment(id: number, updateData: Partial<Payment>): Promise<boolean> {
    const payments = this.getPayments();
    const index = payments.findIndex(p => p.id === id);
    if (index === -1) return false;
    
    payments[index] = { ...payments[index], ...updateData };
    this.savePayments(payments);
    return true;
  }

  // Delete payment
  async deletePayment(id: number): Promise<boolean> {
    const payments = this.getPayments();
    const filtered = payments.filter(p => p.id !== id);
    if (filtered.length === payments.length) return false;
    
    this.savePayments(filtered);
    return true;
  }
}

// Export singleton instance
export const paymentDB = new PaymentDatabase();