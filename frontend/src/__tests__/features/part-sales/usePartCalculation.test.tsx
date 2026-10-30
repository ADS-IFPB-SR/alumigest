import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePartCalculation } from '../../../features/part-sales/hooks/usePartCalculation';
import { partSaleApi } from '../../../features/part-sales/services/partSaleApi';
import type { CalculatePartItemPayload } from '../../../features/part-sales/types/partSaleTypes';

vi.mock('../../../features/part-sales/services/partSaleApi', () => ({
  partSaleApi: {
    calculateItem: vi.fn(),
  },
}));

describe('usePartCalculation Hook (US-46)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve chamar a API e retornar cálculo quando payload for fornecido', async () => {
    const mockResult = {
      calculatedUnitMeasure: 10.5,
      unitPrice: 45.0,
      totalPrice: 472.5,
    };
    vi.mocked(partSaleApi.calculateItem).mockResolvedValueOnce(mockResult);

    const payload: CalculatePartItemPayload = {
      category: 'PROFILE',
      heightMm: 2500,
      quantity: 4,
      unitPrice: 45,
      lossFactor: 0.05,
    };

    const { result } = renderHook(() =>
      usePartCalculation({ payload, debounceMs: 10 })
    );

    await waitFor(() => {
      expect(result.current.calculation).toEqual(mockResult);
    });

    expect(partSaleApi.calculateItem).toHaveBeenCalledWith(payload);
  });

  it('deve calcular localmente via fallback para PROFILE se a API falhar', async () => {
    vi.mocked(partSaleApi.calculateItem).mockRejectedValueOnce(new Error('Network error'));

    const payload: CalculatePartItemPayload = {
      category: 'PROFILE',
      heightMm: 2000,
      quantity: 2,
      unitPrice: 50,
      lossFactor: 0,
    };

    const { result } = renderHook(() =>
      usePartCalculation({ payload, debounceMs: 10 })
    );

    await waitFor(() => {
      expect(result.current.calculation).not.toBeNull();
    });

    // 2m * 2 = 4m faturáveis * R$ 50 = R$ 200
    expect(result.current.calculation?.calculatedUnitMeasure).toBe(4);
    expect(result.current.calculation?.totalPrice).toBe(200);
  });

  it('deve calcular localmente via fallback para HARDWARE (contagem por unidade inteira)', async () => {
    vi.mocked(partSaleApi.calculateItem).mockRejectedValueOnce(new Error('Network error'));

    const payload: CalculatePartItemPayload = {
      category: 'HARDWARE',
      quantity: 10,
      unitPrice: 28.5,
      heightMm: 0,
    };

    const { result } = renderHook(() =>
      usePartCalculation({ payload, debounceMs: 10 })
    );

    await waitFor(() => {
      expect(result.current.calculation).not.toBeNull();
    });

    // 10 unidades * R$ 28,50 = R$ 285,00
    expect(result.current.calculation?.calculatedUnitMeasure).toBe(10);
    expect(result.current.calculation?.totalPrice).toBe(285);
  });

  it('deve calcular localmente via fallback para GLASS com piso mínimo de 0.25 m²', async () => {
    vi.mocked(partSaleApi.calculateItem).mockRejectedValueOnce(new Error('Network error'));

    // Peça pequena de 300 x 400 mm = 0.12 m² -> deve aplicar piso de 0.25 m²
    const payload: CalculatePartItemPayload = {
      category: 'GLASS',
      heightMm: 300,
      widthMm: 400,
      quantity: 1,
      unitPrice: 200,
    };

    const { result } = renderHook(() =>
      usePartCalculation({ payload, debounceMs: 10 })
    );

    await waitFor(() => {
      expect(result.current.calculation).not.toBeNull();
    });

    // 0.25 m² * R$ 200 = R$ 50,00
    expect(result.current.calculation?.calculatedUnitMeasure).toBe(0.25);
    expect(result.current.calculation?.totalPrice).toBe(50);
  });

  it('deve retornar null se dimensões ou quantidades forem inválidas', async () => {
    const payload: CalculatePartItemPayload = {
      category: 'PROFILE',
      heightMm: 0, // inválido para perfil
      quantity: 1,
      unitPrice: 45,
    };

    const { result } = renderHook(() =>
      usePartCalculation({ payload, debounceMs: 10 })
    );

    expect(result.current.calculation).toBeNull();
    expect(partSaleApi.calculateItem).not.toHaveBeenCalled();
  });
});
