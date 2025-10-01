import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (!this.socket) {
      this.socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000');
      
      this.socket.on('connect', () => {
        console.log('Connected to server');
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from server');
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  onPaymentCreated(callback: (payment: any) => void) {
    if (this.socket) {
      this.socket.on('paymentCreated', callback);
    }
  }

  onPaymentDeleted(callback: (data: { id: string }) => void) {
    if (this.socket) {
      this.socket.on('paymentDeleted', callback);
    }
  }

  offPaymentCreated() {
    if (this.socket) {
      this.socket.off('paymentCreated');
    }
  }

  offPaymentDeleted() {
    if (this.socket) {
      this.socket.off('paymentDeleted');
    }
  }
}

export const socketService = new SocketService();