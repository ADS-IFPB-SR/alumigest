import { describe, it, expect } from 'vitest';
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { api } from '@/lib/api';

describe('Axios api Instance and Interceptors', () => {
  it('deve possuir baseURL configurado para /api/v1', () => {
    expect(api.defaults.baseURL).toBe('/api/v1');
    expect(api.defaults.headers['Content-Type']).toBe('application/json');
  });

  describe('Response Interceptor - Desenvelopamento de ApiResponse', () => {
    // Busca a função do interceptor de resposta registrado
    // @ts-expect-error acessando handlers internos para validação unitária
    const responseInterceptor = api.interceptors.response.handlers[0];

    it('deve desenvelopar response.data quando contiver wrapper data', () => {
      const mockResponse = {
        data: {
          status: 'SUCCESS',
          message: 'OK',
          data: { id: 'item-1', name: 'Alumínio' },
        },
        config: {},
      } as AxiosResponse;

      const result = responseInterceptor.fulfilled(mockResponse);
      expect(result.data).toEqual({ id: 'item-1', name: 'Alumínio' });
    });

    it('não deve desenvelopar quando responseType for blob', () => {
      const mockBlob = new Blob(['pdf-content'], { type: 'application/pdf' });
      const mockResponse = {
        data: mockBlob,
        config: { responseType: 'blob' },
      } as AxiosResponse;

      const result = responseInterceptor.fulfilled(mockResponse);
      expect(result.data).toBe(mockBlob);
    });

    it('não deve alterar response quando data não possuir wrapper', () => {
      const mockResponse = {
        data: { count: 42 },
        config: {},
      } as AxiosResponse;

      const result = responseInterceptor.fulfilled(mockResponse);
      expect(result.data).toEqual({ count: 42 });
    });

    it('deve rejeitar promise quando o interceptor de erro for invocado', async () => {
      const mockError = new Error('Falha de rede');
      await expect(responseInterceptor.rejected(mockError)).rejects.toThrow('Falha de rede');
    });
  });

  describe('Request Interceptor', () => {
    // @ts-expect-error acessando handlers internos
    const requestInterceptor = api.interceptors.request.handlers[0];

    it('deve repassar o config inalterado', () => {
      const mockConfig = { headers: {} } as InternalAxiosRequestConfig;
      const result = requestInterceptor.fulfilled(mockConfig);
      expect(result).toBe(mockConfig);
    });
  });
});
