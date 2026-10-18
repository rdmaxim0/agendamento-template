import { createContext } from 'react';
import type { User } from '../types';

export interface AuthContextData {
  user: User | null; // null = ninguém logado
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextData | null>(null);