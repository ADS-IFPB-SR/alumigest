import { api } from '@/lib/api';
import { extractFilenameFromContentDisposition } from '@/features/budgets/services/budgetsApi';
import type {
  CalculatePartItemPayload,
  CalculatePartItemResult,
  CreatePartSaleRequest,
  MaterialOption,
  PartSaleFilterParams,
  PartSalePageResponse,
  PartSaleResponse,
  PartSaleStatus,
} from '../types/partSaleTypes';

export const partSaleApi = {
  async getMaterialsByCategory(category?: string): Promise<MaterialOption[]> {
    const params = category ? `?category=${encodeURIComponent(category)}` : '';
    const response = await api.get<MaterialOption[]>(`/materials${params}`);
    return response.data;
  },

  async calculateItem(payload: CalculatePartItemPayload): Promise<CalculatePartItemResult> {
    const response = await api.post<CalculatePartItemResult>(
      '/part-sales/calculate-item',
      payload
    );
    return response.data;
  },

  async create(request: CreatePartSaleRequest): Promise<PartSaleResponse> {
    const response = await api.post<PartSaleResponse>('/part-sales', request);
    return response.data;
  },

  async getById(id: string): Promise<PartSaleResponse> {
    const response = await api.get<PartSaleResponse>(`/part-sales/${id}`);
    return response.data;
  },

  async list(params?: PartSaleFilterParams): Promise<PartSalePageResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page !== undefined) searchParams.append('page', String(params.page));
    if (params?.size !== undefined) searchParams.append('size', String(params.size));
    if (params?.search) searchParams.append('search', params.search);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.sort) searchParams.append('sort', params.sort);

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    const response = await api.get<PartSalePageResponse>(`/part-sales${query}`);
    return response.data;
  },

  async updateStatus(id: string, status: PartSaleStatus): Promise<PartSaleResponse> {
    const response = await api.patch<PartSaleResponse>(`/part-sales/${id}/status`, { status });
    return response.data;
  },

  /**
   * Baixa o documento oficial em PDF A4 de uma venda de partes persistida (US-46.4).
   */
  async downloadPdf(id: string, code?: string): Promise<void> {
    const response = await api.get(`/part-sales/${id}/pdf`, {
      responseType: 'blob',
    });

    const fallback = `orcamento-partes-${(code || id).replace(/\//g, '-')}.pdf`;
    const disposition = (
      response.headers?.['content-disposition'] ||
      response.headers?.['Content-Disposition']
    ) as string | undefined;
    const filename = extractFilenameFromContentDisposition(disposition, fallback);

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  /**
   * Gera e baixa em tempo real (< 1.5s) o documento PDF A4 a partir de uma proposta em rascunho (US-46.4).
   */
  async downloadPdfPreview(request: CreatePartSaleRequest): Promise<void> {
    const response = await api.post('/part-sales/export-pdf', request, {
      responseType: 'blob',
    });

    const fallback = 'orcamento-partes-rascunho.pdf';
    const disposition = (
      response.headers?.['content-disposition'] ||
      response.headers?.['Content-Disposition']
    ) as string | undefined;
    const filename = extractFilenameFromContentDisposition(disposition, fallback);

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export const partSalesApi = partSaleApi;
