import { apiService } from './apiService';

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
}

export class UserService {
  static async registerUser(userData: { username: string; password: string; role: 'admin' | 'user' }): Promise<User> {
    try {
      const response = await apiService.register(userData.username, userData.password, userData.role);
      return response.user;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }

  static async loginUser(username: string, password: string): Promise<User | null> {
    try {
      const response = await apiService.login(username, password);
      return response.user;
    } catch (error) {
      console.error('Error logging in user:', error);
      return null;
    }
  }

  static getCurrentUser(): User | null {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  static logout(): void {
    try {
      apiService.logout();
    } catch (error) {
      console.error('Error logging out user:', error);
    }
  }

  static isAdmin(user: User | null): boolean {
    return user?.role === 'admin';
  }

  static async getTotalUserCount(): Promise<number> {
    try {
      const response = await fetch('http://localhost:5000/api/auth/users/count');
      const data = await response.json();
      return data.count;
    } catch (error) {
      console.error('Error getting user count:', error);
      return 0;
    }
  }
}