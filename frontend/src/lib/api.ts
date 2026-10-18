import axios from 'axios';

// Instancia do Axios apontando para a API 
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Interceptor: roda ANTES de toda requisição.
// Se existir um token salvo (após o login), ele é anexado automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Interceptor de RESPOSTA: roda quando a API responde (antes do código que chamou)
api.interceptors.response.use(
  (response) => response, // respostas de sucesso passam direto
  (error) => {
    // O login errado também devolve 401 ("Credenciais inválidas"),
    // e nesse caso NÃO queremos deslogar, só mostrar o aviso.
    const isLoginRequest = error.config?.url?.includes('/auth/login');

    if (error.response?.status === 401 && !isLoginRequest) {
      // Token vencido ou inválido: limpa tudo e manda para o login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(error); // o erro continua chegando a quem chamou
  }
);