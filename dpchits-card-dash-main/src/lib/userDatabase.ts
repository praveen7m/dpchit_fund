export interface User {
  id?: number;
  username: string;
  name: string;
  phone: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  createdAt?: string;
}

class UserDatabase {
  private storageKey = 'dp_chit_users';

  private getUsers(): User[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveUsers(users: User[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(users));
    window.dispatchEvent(new CustomEvent('userUpdated', { detail: { users } }));
  }

  private getNextId(): number {
    const users = this.getUsers();
    return users.length > 0 ? Math.max(...users.map(u => u.id || 0)) + 1 : 1;
  }

  async registerUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const users = this.getUsers();
    
    // Check if username already exists
    const existingUser = users.find(u => u.username === userData.username);
    if (existingUser) {
      throw new Error('Username already exists');
    }

    const newUser: User = {
      ...userData,
      id: this.getNextId(),
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    this.saveUsers(users);
    return newUser;
  }

  async loginUser(username: string, password: string): Promise<User | null> {
    const users = this.getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    return user || null;
  }

  async getAllUsers(): Promise<User[]> {
    return this.getUsers();
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const users = this.getUsers();
    return users.find(u => u.username === username) || null;
  }
}

export const userDB = new UserDatabase();