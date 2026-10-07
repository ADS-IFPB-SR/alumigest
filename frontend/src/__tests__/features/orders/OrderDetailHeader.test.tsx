import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { OrderDetailHeader } from '../../../features/orders/components/OrderDetailHeader';
import type { Order } from '../../../features/orders/types';

const baseOrder: Order = {
  id: 'order-123',
  codigo: 'PED-2026-0001',
  orcamentoId: 'orc-123',
  clienteNome: 'Construtora Silva',
  status: 'WAITING_PRODUCTION',
  canalAprovacao: 'WHATSAPP',
  dataAprovacao: '2026-10-01',
  dataPrevisaoEntrega: '2026-10-16',
  valorBruto: 1500,
  valorDesconto: 0,
  taxaInstalacao: 0,
  taxaFrete: 0,
  valorLiquido: 1500,
  createdAt: '2026-10-01T10:00:00Z',
  updatedAt: '2026-10-01T10:00:00Z',
  ativo: true,
  items: [],
};

describe('OrderDetailHeader', () => {
  it('deve exibir botões "Avançar para Produção" e "Cancelar Pedido" quando status for WAITING_PRODUCTION', () => {
    const handleAdvance = vi.fn();
    const handleCancel = vi.fn();

    render(
      <MemoryRouter>
        <OrderDetailHeader
          order={baseOrder}
          onAdvanceProduction={handleAdvance}
          onOpenCancelModal={handleCancel}
        />
      </MemoryRouter>
    );

    const advanceBtn = screen.getByRole('button', { name: /avançar para produção/i });
    const cancelBtn = screen.getByRole('button', { name: /cancelar (pedido|ordem de serviço)/i });

    expect(advanceBtn).toBeInTheDocument();
    expect(cancelBtn).toBeInTheDocument();

    fireEvent.click(advanceBtn);
    expect(handleAdvance).toHaveBeenCalledTimes(1);

    fireEvent.click(cancelBtn);
    expect(handleCancel).toHaveBeenCalledTimes(1);
  });

  it('deve exibir "Concluir Produção", "Ficha de Fabricação" e desabilitar cancelamento quando status for IN_PRODUCTION', () => {
    const inProdOrder: Order = { ...baseOrder, status: 'IN_PRODUCTION' };
    const handleComplete = vi.fn();
    const handlePdf = vi.fn();

    render(
      <MemoryRouter>
        <OrderDetailHeader
          order={inProdOrder}
          onCompleteProduction={handleComplete}
          onPrintTechnicalPdf={handlePdf}
        />
      </MemoryRouter>
    );

    expect(screen.queryByRole('button', { name: /avançar para produção/i })).not.toBeInTheDocument();

    const completeBtn = screen.getByRole('button', { name: /concluir produção/i });
    const pdfBtn = screen.getByRole('button', { name: /ficha de fabricação/i });
    const restrictedCancelBtn = screen.getByRole('button', { name: /cancelamento restrito/i });

    expect(completeBtn).toBeInTheDocument();
    expect(pdfBtn).toBeInTheDocument();
    expect(restrictedCancelBtn).toBeDisabled();

    fireEvent.click(completeBtn);
    expect(handleComplete).toHaveBeenCalledTimes(1);

    fireEvent.click(pdfBtn);
    expect(handlePdf).toHaveBeenCalledTimes(1);
  });
});
