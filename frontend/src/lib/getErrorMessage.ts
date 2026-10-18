import axios from 'axios';

export function getErrorMessage(error: unknown): string {
  // isAxiosError confirma que o erro veio de uma requisição HTTP
  if (axios.isAxiosError(error)) {
    // Sem response = a requisição nem chegou ao servidor (backend desligado, por exemplo)
    if (!error.response) return 'Não foi possível conectar ao servidor.';

    const data = error.response.data;

    // Formato 1: { error: "Credenciais inválidas." }
    if (data?.error) return data.error;

    // Formato 2 (Zod): { errors: [{ message: "..." }] } -> pegamos a primeira
    if (Array.isArray(data?.errors) && data.errors[0]?.message) {
      return data.errors[0].message;
    }
  }

  return 'Ocorreu um erro inesperado.';
}