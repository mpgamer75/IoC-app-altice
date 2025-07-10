// lib/auth.ts
import { User } from '@/types';

// Mock users pour la démo
const MOCK_USERS: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@fortinet.com',
    role: 'admin',
    createdAt: new Date('2024-01-01')
  },
  {
    id: '2',
    username: 'analyst',
    email: 'analyst@fortinet.com',
    role: 'user',
    createdAt: new Date('2024-01-15')
  },
  {
    id: '3',
    username: 'security',
    email: 'security@fortinet.com',
    role: 'user',
    createdAt: new Date('2024-02-01')
  }
];

export class AuthService {
  private static readonly TOKEN_KEY = 'fortigate_ioc_token';
  
  static async login(username: string, password: string): Promise<User | null> {
    // Mock authentication - en production, remplacer par un vrai service d'auth
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    
    const validCredentials = [
      { username: 'admin', password: 'admin123' },
      { username: 'analyst', password: 'analyst123' },
      { username: 'security', password: 'security123' }
    ];
    
    const credential = validCredentials.find(
      cred => cred.username === username && cred.password === password
    );
    
    if (credential) {
      const user = MOCK_USERS.find(u => u.username === username);
      if (user) {
        const token = this.generateToken(user);
        if (typeof window !== 'undefined') {
          localStorage.setItem(this.TOKEN_KEY, token);
        }
        return user;
      }
    }
    
    return null;
  }
  
  static logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
    }
  }
  
  static getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return MOCK_USERS.find(u => u.id === payload.userId) || null;
    } catch {
      return null;
    }
  }
  
  static isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }
  
  private static generateToken(user: User): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload = { 
      userId: user.id, 
      username: user.username,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24h
    };
    
    return `${btoa(JSON.stringify(header))}.${btoa(JSON.stringify(payload))}.mock_signature`;
  }
}