import { create } from 'zustand';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: 'patient' | 'doctor' | 'admin') => Promise<boolean>;
  logout: () => void;
  signup: (name: string, email: string, password: string, role: 'patient' | 'doctor' | 'admin') => Promise<boolean>;
}

// Mock user data for demonstration
const mockUsers = [
  { id: '1', name: 'nandini', email: 'nandini@gmail.com', role: 'patient' as const },
  { id: '2', name: 'Dr. Sarah Johnson', email: 'sarah@healthmate.com', role: 'doctor' as const },
  { id: '3', name: 'Admin User', email: 'admin@healthmate.com', role: 'admin' as const },
];

export const useAuth = create<AuthState>((set) => ({
  user: mockUsers[0], // Default to patient for demo
  isAuthenticated: true,
  
  login: async (email: string, password: string, role: 'patient' | 'doctor' | 'admin') => {
    // Mock authentication - in real app, this would call your auth API
    const user = mockUsers.find(u => u.email === email && u.role === role);
    if (user) {
      set({ user, isAuthenticated: true });
      localStorage.setItem('healthmate-user', JSON.stringify(user));
      return true;
    }
    return false;
  },
  
  logout: () => {
    set({ user: null, isAuthenticated: false });
    localStorage.removeItem('healthmate-user');
    window.location.href = '/';
  },
  
  signup: async (name: string, email: string, password: string, role: 'patient' | 'doctor' | 'admin') => {
    // Mock signup - in real app, this would call your signup API
    const newUser = {
      id: Math.random().toString(36),
      name,
      email,
      role,
    };
    set({ user: newUser, isAuthenticated: true });
    localStorage.setItem('healthmate-user', JSON.stringify(newUser));
    return true;
  },
}));