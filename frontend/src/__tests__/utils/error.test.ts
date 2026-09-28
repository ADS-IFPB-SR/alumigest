import { describe, it, expect } from 'vitest';
import { AxiosError, AxiosResponse } from 'axios';
import { parseApiError } from '@/utils/error';

describe('parseApiError Utility', () => {
  describe('Técnica: Tabela de Decisão - Tratamento de Tipos de Erro e Payloads', () => {
    it('Regra 1: AxiosError com mapa de erros de validação (data.errors) deve retornar o primeiro erro', () => {
      const axiosError = new AxiosError('Bad Request');
      axiosError.response = {
        status: 400,
        data: {
          errors: {
            name: 'Nome é obrigatório',
            email: 'Email inválido',
          },
        },
      } as AxiosResponse;

      const result = parseApiError(axiosError);
      expect(result).toBe('Nome é obrigatório');
    });

    it('Regra 2: AxiosError com mensagem explícita no payload (data.message)', () => {
      const axiosError = new AxiosError('Conflict');
      axiosError.response = {
        status: 409,
        data: {
          message: 'CPF já cadastrado no sistema',
        },
      } as AxiosResponse;

      const result = parseApiError(axiosError);
      expect(result).toBe('CPF já cadastrado no sistema');
    });

    it('Regra 3: AxiosError com campo error no payload (data.error)', () => {
      const axiosError = new AxiosError('Unauthorized');
      axiosError.response = {
        status: 401,
        data: {
          error: 'Credenciais inválidas',
        },
      } as AxiosResponse;

      const result = parseApiError(axiosError);
      expect(result).toBe('Credenciais inválidas');
    });

    it('Regra 4: AxiosError sem data com status 404 deve retornar mensagem padrão amigável', () => {
      const axiosError = new AxiosError('Not Found');
      axiosError.response = {
        status: 404,
      } as AxiosResponse;

      const result = parseApiError(axiosError);
      expect(result).toBe('Recurso não encontrado.');
    });

    it('Regra 5: AxiosError sem data com status 500 deve retornar mensagem de erro interno', () => {
      const axiosError = new AxiosError('Internal Server Error');
      axiosError.response = {
        status: 500,
      } as AxiosResponse;

      const result = parseApiError(axiosError);
      expect(result).toBe('Erro interno no servidor.');
    });

    it('Regra 6: AxiosError sem resposta ou status não mapeado usa defaultMessage', () => {
      const axiosError = new AxiosError('Network Error');

      const result = parseApiError(axiosError, 'Falha na conexão com o servidor');
      expect(result).toBe('Falha na conexão com o servidor');
    });

    it('Regra 7: Instância padrão de Error do JS retorna a mensagem do erro', () => {
      const standardError = new Error('Erro de sintaxe local');
      expect(parseApiError(standardError)).toBe('Erro de sintaxe local');
    });

    it('Regra 8: Valor desconhecido (string, objeto aleatório, null) retorna defaultMessage', () => {
      expect(parseApiError('string error')).toBe('Ocorreu um erro na requisição');
      expect(parseApiError(null, 'Erro customizado')).toBe('Erro customizado');
      expect(parseApiError(undefined)).toBe('Ocorreu um erro na requisição');
    });
  });
});
