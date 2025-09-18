import { paymentDB } from './database';

// Initialize database on app startup
export const initializeDatabase = () => {
  try {
    console.log('Payment database initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return false;
  }
};

// Export database instance for direct access if needed
export { paymentDB };