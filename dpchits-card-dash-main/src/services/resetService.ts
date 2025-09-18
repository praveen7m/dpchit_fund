export class ResetService {
  static async clearAllData(): Promise<void> {
    try {
      // Clear all localStorage data
      localStorage.removeItem('dp_chit_payments');
      localStorage.removeItem('dp_chit_users');
      localStorage.removeItem('dp_chit_meta');
      localStorage.removeItem('payments'); // Legacy key
      localStorage.removeItem('user'); // Current user session
      
      // Dispatch events to update UI
      window.dispatchEvent(new CustomEvent('paymentUpdated', { detail: { payments: [] } }));
      window.dispatchEvent(new CustomEvent('userUpdated', { detail: { users: [] } }));
      
      console.log('All data cleared successfully');
    } catch (error) {
      console.error('Error clearing data:', error);
      throw new Error('Failed to clear data');
    }
  }
}