import { AxiosError } from 'axios';

export interface ApiErrorResponse {
  message?: string;
  error?: string;
  errors?: Record<string, string>;
  status?: number;
}

function getStatusFallbackMessage(status?: number): string | undefined {
  if (status === 404) return 'Recurso não encontrado.';
  if (status === 500) return 'Erro interno no servidor.';
  return undefined;
}

function extractErrorMessageFromData(data: ApiErrorResponse): string | undefined {
  if (data.errors && Object.keys(data.errors).length > 0) {
    const firstField = Object.keys(data.errors)[0];
    return data.errors[firstField];
  }
  return data.message || data.error;
}

function handleAxiosError(error: AxiosError, defaultMessage: string): string {
  const data = error.response?.data as ApiErrorResponse | undefined;
  if (!data) {
    return getStatusFallbackMessage(error.response?.status) ?? defaultMessage;
  }
  return extractErrorMessageFromData(data) ?? defaultMessage;
}

export function parseApiError(error: unknown, defaultMessage = 'Ocorreu um erro na requisição'): string {
  if (error instanceof AxiosError) {
    return handleAxiosError(error, defaultMessage);
  }

  if (error instanceof Error) {
    return error.message;
  }

  return defaultMessage;
}
