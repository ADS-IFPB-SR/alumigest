import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { api } from '../../lib/api';

describe('Axios api Instance and Interceptors', () => {
  let mock: MockAdapter;

  beforeAll(() => {
    mock = new MockAdapter(api);
  });

  afterEach(() => {
    mock.reset();
  });

  afterAll(() => {
    mock.restore();
  });

  it('deve possuir baseURL configurado para /api/v1', () => {
    expect(api.defaults.baseURL).toBe('/api/v1');
    expect(api.defaults.headers['Content-Type']).toBe('application/json');
  });

  describe('Response Interceptor - Desenvelopamento de ApiResponse', () => {
    it('deve desenvelopar response.data quando contiver wrapper data', async () => {
      const responsePayload = {
        status: 'SUCCESS',
        message: 'OK',
        data: { id: 'item-1', name: 'Alumínio' },
      };

      mock.onGet('/items').reply(200, responsePayload);

      const response = await api.get('/items');
      expect(response.data).toEqual({ id: 'item-1', name: 'Alumínio' });
    });

    it('não deve desenvelopar quando responseType for blob', async () => {
      const mockBlob = new Blob(['pdf-content'], { type: 'application/pdf' });
      mock.onGet('/pdf').reply(200, mockBlob);

      const response = await api.get('/pdf', { responseType: 'blob' });
      expect(response.data).toBe(mockBlob);
    });

    it('não deve alterar response quando data não possuir wrapper', async () => {
      const plainPayload = { count: 42 };
      mock.onGet('/count').reply(200, plainPayload);

      const response = await api.get('/count');
      expect(response.data).toEqual({ count: 42 });
    });

    it('deve extrair a mensagem JSON de um erro retornado encapsulado como Blob', async () => {
      const errorPayload = { message: 'Orçamento cancelado. Operação não permitida.' };
      const blob = new Blob([JSON.stringify(errorPayload)], { type: 'application/json' });
      
      mock.onGet('/pdf/tecnico').reply(422, blob);

      const request = api.get('/pdf/tecnico', { responseType: 'blob' });

      await expect(request).rejects.toMatchObject({
        response: {
          data: { message: 'Orçamento cancelado. Operação não permitida.' },
        },
      });
    });

    it('deve manter o Blob intacto se o tipo não for application/json', async () => {
      const blob = new Blob(['%PDF-1.4... arquivo corrompido'], { type: 'application/pdf' });
      mock.onGet('/pdf/tecnico').reply(500, blob);

      const request = api.get('/pdf/tecnico', { responseType: 'blob' });

      await expect(request).rejects.toMatchObject({
        response: {
          data: expect.any(Blob),
        },
      });
    });
  });

  describe('Request Interceptor', () => {
    it('deve repassar o config inalterado', async () => {
      mock.onGet('/test').reply((config) => {
        expect(config).toBeDefined();
        return [200, { success: true }];
      });

      const response = await api.get('/test');
      expect(response.data).toEqual({ success: true });
    });
  });
});