import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OrderApprovalModal } from '../../../features/orders/components/OrderApprovalModal';
import { ordersApi } from '../../../features/orders/services/ordersApi';
import type { Order } from '../../../features/orders/types';

vi.mock('../../../features/orders/services/ordersApi');
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const renderWithClient = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
};

describe('OrderApprovalModal — [US-13.3] Modal de Aprovação e Conversão', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    budgetId: 'b-100',
    budgetCode: 'ORC-2026-001',
    customerName: 'Vidraçaria Silva',
    onSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('não deve renderizar nada quando isOpen for false', () => {
    renderWithClient(<OrderApprovalModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByTestId('order-approval-modal')).not.toBeInTheDocument();
  });

  it('deve renderizar o modal com os elementos informativos e valores padrão', () => {
    renderWithClient(<OrderApprovalModal {...defaultProps} />);

    expect(screen.getByTestId('order-approval-modal')).toBeInTheDocument();
    expect(screen.getByText(/Aprovar Orçamento e Gerar (Pedido|Ordem de Serviço)/i)).toBeInTheDocument();
    expect(screen.getByText('ORC-2026-001')).toBeInTheDocument();
    expect(screen.getByText('Vidraçaria Silva')).toBeInTheDocument();

    // Canal padrão: WhatsApp
    const select = screen.getByTestId('input-canal-aprovacao') as HTMLSelectElement;
    expect(select.value).toBe('WHATSAPP');

    // Data padrão preenchida (+15 dias)
    const dateInput = screen.getByTestId('input-data-entrega') as HTMLInputElement;
    expect(dateInput.value).toBeTruthy();
    expect(dateInput.value).toHaveLength(10); // YYYY-MM-DD
  });

  it('deve permitir alterar o canal de aprovação pelos cartões', async () => {
    renderWithClient(<OrderApprovalModal {...defaultProps} />);

    const presencialBtn = screen.getByRole('button', { name: /Presencial/i });
    fireEvent.click(presencialBtn);

    await waitFor(() => {
      const select = screen.getByTestId('input-canal-aprovacao') as HTMLSelectElement;
      expect(select.value).toBe('PRESENCIAL');
    });
  });

  it('deve chamar onClose ao clicar no botão Cancelar', () => {
    const onClose = vi.fn();
    renderWithClient(<OrderApprovalModal {...defaultProps} onClose={onClose} />);

    const cancelBtn = screen.getByTestId('btn-cancel-approval');
    fireEvent.click(cancelBtn);

    expect(onClose).toHaveBeenCalled();
  });

  it('deve chamar onClose ao pressionar a tecla Escape', () => {
    const onClose = vi.fn();
    renderWithClient(<OrderApprovalModal {...defaultProps} onClose={onClose} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalled();
  });

  it('deve submeter o formulário chamando onConfirm quando fornecido', async () => {
    const onConfirm = vi.fn();
    renderWithClient(<OrderApprovalModal {...defaultProps} onConfirm={onConfirm} />);

    const obsInput = screen.getByTestId('input-observacoes');
    fireEvent.change(obsInput, { target: { value: 'Entregar com cuidado no galpão 2' } });

    const submitBtn = screen.getByTestId('btn-confirm-approval');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledWith(
        expect.objectContaining({
          canalAprovacao: 'WHATSAPP',
          observacoes: 'Entregar com cuidado no galpão 2',
        })
      );
    });
  });

  it('deve converter via ordersApi e disparar onSuccess', async () => {
    const mockCreatedOrder: Partial<Order> = {
      id: 'ord-888',
      codigo: 'PED-2026-0888',
      status: 'CREATED',
    };
    vi.mocked(ordersApi.convertBudget).mockResolvedValue(mockCreatedOrder as Order);

    const onSuccess = vi.fn();
    const onClose = vi.fn();

    renderWithClient(
      <OrderApprovalModal
        {...defaultProps}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    const submitBtn = screen.getByTestId('btn-confirm-approval');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(ordersApi.convertBudget).toHaveBeenCalledWith(
        'b-100',
        expect.objectContaining({
          canalAprovacao: 'WHATSAPP',
        })
      );
      expect(onSuccess).toHaveBeenCalledWith(mockCreatedOrder);
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('deve exibir mensagem de erro se a data de entrega for apagada', async () => {
    renderWithClient(<OrderApprovalModal {...defaultProps} />);

    const dateInput = screen.getByTestId('input-data-entrega');
    fireEvent.change(dateInput, { target: { value: '' } });

    const submitBtn = screen.getByTestId('btn-confirm-approval');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Informe a data prevista de entrega/i)).toBeInTheDocument();
    });
  });

  it('deve exibir estado de loading e desabilitar botões quando isSubmitting for true', () => {
    renderWithClient(<OrderApprovalModal {...defaultProps} isSubmitting={true} />);

    expect(screen.getByText(/Gerando (Pedido|Ordem de Serviço)\.\.\./i)).toBeInTheDocument();
    expect(screen.getByTestId('btn-confirm-approval')).toBeDisabled();
    expect(screen.getByTestId('btn-cancel-approval')).toBeDisabled();
  });
});
