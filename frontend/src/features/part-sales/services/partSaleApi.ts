import { api } from '../../../lib/api';
import type { CalculatePartItemPayload, CalculatePartItemResult } from '../types/partSaleTypes';

export const partSaleApi = {
  async calculateItem(payload: CalculatePartItemPayload): Promise<CalculatePartItemResult> {
    const response = await api.post<CalculatePartItemResult>(
      '/part-sales/calculate-item',
      payload
    );
    return response.data;
  },
};
