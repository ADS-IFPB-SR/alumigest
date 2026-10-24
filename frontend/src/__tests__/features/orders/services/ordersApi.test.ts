import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { api } from '../../../../lib/api';
import { ordersApi } from '../../../../features/orders/services/ordersApi';

describe('ordersApi - PDF downloads & Blob error handling (BUG-485)', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(api);
    vi.spyOn(window.URL, 'createObjectURL').mockReturnValue('blob:http://localhost/mock-blob-url');
    vi.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => {});
    vi.spyOn(window, 'open').mockImplementation(() => null);
  });

  afterEach(() => {
    mock.reset();
    vi.restoreAllMocks();
  });

  describe('downloadLabelsPdf', () => {
    it('deve baixar as etiquetas térmicas em PDF com sucesso', async () => {
      const mockPdfBlob = new Blob(['%PDF-1.4 mock labels'], { type: 'application/pdf' });
      mock.onGet('/orders/order-1/labels-pdf').reply(200, mockPdfBlob, {
        'content-disposition': 'attachment; filename="etiquetas-OS-2026-0001.pdf"',
      });

      const appendChildSpy = vi.spyOn(document.body, 'appendChild');

      await ordersApi.downloadLabelsPdf('order-1', 'OS-2026-0001');

      expect(appendChildSpy).toHaveBeenCalled();
      expect(window.URL.createObjectURL).toHaveBeenCalled();
    });

    it('deve desserializar erro HTTP 422 encapsulado em Blob com a mensagem de negócio do backend', async () => {
      const errorJson = {
        status: 422,
        error: 'Unprocessable Entity',
        message: 'A ordem de serviço não possui itens válidos para emissão de etiquetas.',
        path: '/api/v1/orders/order-sem-itens/labels-pdf',
      };
      // Simula o comportamento real do Axios com responseType: 'blob'
      const errorBlob = new Blob([JSON.stringify(errorJson)], { type: 'application/json' });

      mock.onGet('/orders/order-sem-itens/labels-pdf').reply(422, errorBlob);

      try {
        await ordersApi.downloadLabelsPdf('order-sem-itens');
        expect.unreachable('Deveria ter lançado erro');
      } catch (error: any) {
        expect(error.response?.status).toBe(422);
        expect(error.response?.data).toEqual(errorJson);
        expect(error.response?.data?.message).toBe(
          'A ordem de serviço não possui itens válidos para emissão de etiquetas.'
        );
      }
    });

    it('deve desserializar erro HTTP 422 mesmo se o Blob tiver MIME type vazio (BUG-485)', async () => {
      const errorJson = {
        status: 422,
        message: 'A ordem de serviço não possui itens válidos para emissão de etiquetas.',
      };
      // Simula o caso em que o browser/proxy omite o type no Blob
      const errorBlob = new Blob([JSON.stringify(errorJson)], { type: '' });

      mock.onGet('/orders/order-sem-itens/labels-pdf').reply(422, errorBlob);

      try {
        await ordersApi.downloadLabelsPdf('order-sem-itens');
        expect.unreachable('Deveria ter lançado erro');
      } catch (error: any) {
        expect(error.response?.data?.message).toBe(
          'A ordem de serviço não possui itens válidos para emissão de etiquetas.'
        );
      }
    });

    it('deve baixar as etiquetas térmicas em PDF enviando customLeaves via POST', async () => {
      const mockPdfBlob = new Blob(['%PDF-1.4 mock labels'], { type: 'application/pdf' });
      const customLeaves = { 'item-1': 3 };
      mock.onPost('/orders/order-1/labels-pdf', customLeaves).reply(200, mockPdfBlob, {
        'content-disposition': 'attachment; filename="etiquetas-OS-2026-0001.pdf"',
      });

      const appendChildSpy = vi.spyOn(document.body, 'appendChild');

      await ordersApi.downloadLabelsPdf('order-1', 'OS-2026-0001', undefined, customLeaves);

      expect(appendChildSpy).toHaveBeenCalled();
      expect(window.URL.createObjectURL).toHaveBeenCalled();
    });
  });

  describe('getLabelsBplb', () => {
    it('deve obter bytes BPLB via GET quando não houver customLeaves', async () => {
      const mockBuffer = new ArrayBuffer(8);
      mock.onGet('/orders/order-1/labels-bplb').reply(200, mockBuffer);

      const result = await ordersApi.getLabelsBplb('order-1');
      expect(result).toBeDefined();
    });

    it('deve obter bytes BPLB via POST quando houver customLeaves', async () => {
      const mockBuffer = new ArrayBuffer(8);
      const customLeaves = { 'item-1': 2 };
      mock.onPost('/orders/order-1/labels-bplb', customLeaves).reply(200, mockBuffer);

      const result = await ordersApi.getLabelsBplb('order-1', undefined, customLeaves);
      expect(result).toBeDefined();
    });
  });

  describe('downloadComprovantePdf', () => {
    it('deve baixar o comprovante do pedido com sucesso', async () => {
      const mockPdfBlob = new Blob(['%PDF-1.4 mock comprovante'], { type: 'application/pdf' });
      mock.onGet('/orders/order-2/pdf/comprovante').reply(200, mockPdfBlob, {
        'content-disposition': 'attachment; filename="comprovante-OS-2026-0002.pdf"',
      });

      const appendChildSpy = vi.spyOn(document.body, 'appendChild');

      await ordersApi.downloadComprovantePdf('order-2', 'OS-2026-0002');

      expect(appendChildSpy).toHaveBeenCalled();
    });

    it('deve desserializar erro HTTP 404 encapsulado em Blob com a mensagem do backend', async () => {
      const errorJson = {
        status: 404,
        error: 'Not Found',
        message: 'Pedido não encontrado.',
      };
      const errorBlob = new Blob([JSON.stringify(errorJson)], { type: 'application/json' });

      mock.onGet('/orders/order-inexistente/pdf/comprovante').reply(404, errorBlob);

      try {
        await ordersApi.downloadComprovantePdf('order-inexistente');
        expect.unreachable('Deveria ter lançado erro');
      } catch (error: any) {
        expect(error.response?.status).toBe(404);
        expect(error.response?.data?.message).toBe('Pedido não encontrado.');
      }
    });
  });
});
