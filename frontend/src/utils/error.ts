import { AxiosError } from 'axios';

export interface ApiErrorResponse {
  message?: string;
  error?: string;
  errors?: Record<string, string>;
  status?: number;
}

export function parseApiError(error: unknown, defaultMessage = 'Ocorreu um erro na requisição'): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse;
    if (!data) {
      if (error.response?.status === 404) return 'Recurso não encontrado.';
      if (error.response?.status === 500) return 'Erro interno no servidor.';
      return defaultMessage;
    }

    if (data.message) {
      // Caso 400 Bad Request com validações de campo específicas
      if (data.errors && Object.keys(data.errors).length > 0) {
        const firstField = Object.keys(data.errors)[0];
        return data.errors[firstField];
      }
      return data.message;
    }

    if (data.error) {
      return data.error;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return defaultMessage;
}
