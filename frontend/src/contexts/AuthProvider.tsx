import { useState, type ReactNode } from 'react';
import { api } from '../lib/api';
import { AuthContext } from './auth-context';
import type { AuthResponse, User } from '../types';

export function AuthProvider({ children }: { children: ReactNode }) {
  // Ao abrir o site, tenta recuperar o usuário salvo (assim o login
  // sobrevive ao F5). A função dentro do useState roda só na primeira vez.
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? (JSON.parse(saved) as User) : null;
  });

  async function signIn(email: string, password: string) {
    // Chama a API. Se as credenciais estiverem erradas, o axios lança um
    // erro aqui, e quem chamou (a página de Login) trata no catch.
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password });

    // Salva o token (o interceptor do api.ts vai usá-lo nas próximas
    // requisições) e o usuário (para mostrar o nome na tela)
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  }

  function signOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}