import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PurchaseEntryModal } from '../../../features/stock/components/PurchaseEntryModal';
import * as stockHooks from '../../../features/stock/hooks/useStock';
import type { StockItem } from '../../../features/stock/types';

vi.mock('../../../features/stock/hooks/useStock');

const mockStockItems: StockItem[] = [
  {
    id: 'st-1',
    materialId: 'mat-uuid-1',
    materialSku: 'ALU-SUP-01',
    materialName: 'PERFIL MONTANTE SUPREMA 6M',
    category: 'PROFILE',
    unitMeasure: 'barras',
    physicalQuantity: 2,
    reservedQuantity: 8,
    availableQuantity: -6,
    minimumStock: 4,
    alertStatus: 'NEED_PURCHASE',
  },
];

describe('PurchaseEntryModal (US-22.3)', () => {
  const mockMutate = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(stockHooks, 'useRegisterStockMovement').mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as unknown as ReturnType<typeof stockHooks.useRegisterStockMovement>);
  });

  it('deve validar campos obrigatórios e bloquear submissão sem unitCost (RN-06)', async () => {
    render(
      <PurchaseEntryModal
        isOpen={true}
        onClose={mockOnClose}
        stockItems={mockStockItems}
        defaultMaterialId="mat-uuid-1"
      />
    );

    fireEvent.change(screen.getByLabelText(/Quantidade Recebida/i), { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: /Confirmar Entrada no Kardex/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/preço de compra unitário é obrigatório/i)
      ).toBeInTheDocument();
      expect(mockMutate).not.toHaveBeenCalled();
    });
  });

  it('deve aceitar documento livre sem chave SEFAZ (RN-05) e disparar PURCHASE_ENTRY', async () => {
    mockMutate.mockImplementation((_payload, options) => {
      options?.onSuccess?.();
    });

    render(
      <PurchaseEntryModal
        isOpen={true}
        onClose={mockOnClose}
        stockItems={mockStockItems}
        defaultMaterialId="mat-uuid-1"
      />
    );

    fireEvent.change(screen.getByLabelText(/Quantidade Recebida/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/Preço de Compra Unitário/i), {
      target: { value: '145.50' },
    });
    fireEvent.change(screen.getByLabelText(/Nº do Pedido \/ Recibo \/ NF/i), {
      target: { value: 'Pedido 1088' },
    });
    fireEvent.change(screen.getByLabelText(/Fornecedor/i), {
      target: { value: 'Distribuidora Asa' },
    });
    fireEvent.change(screen.getByLabelText(/Justificativa/i), {
      target: { value: 'Chegada de reposição semanal' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Confirmar Entrada no Kardex/i }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        {
          materialId: 'mat-uuid-1',
          type: 'PURCHASE_ENTRY',
          quantity: 10,
          unitCost: 145.5,
          referenceDocument: 'Pedido 1088',
          supplier: 'Distribuidora Asa',
          reason: 'Chegada de reposição semanal',
        },
        expect.any(Object)
      );
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});