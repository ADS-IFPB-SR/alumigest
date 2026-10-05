import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BudgetDetailActions } from '../../../features/budgets/components/BudgetDetailActions';
import { budgetsApi } from '../../../features/budgets/services/budgetsApi';
import toast from 'react-hot-toast';

vi.mock('../../../features/budgets/services/budgetsApi', () => ({
  budgetsApi: {
    downloadCommercialPdf: vi.fn(),
    getWhatsAppSummary: vi.fn(),
    downloadPdfTecnico: vi.fn(),
    getBudget: vi.fn(),
    createBudget: vi.fn(),
  },
}));

vi.mock('react-hot-toast', () => {
  const mockToast = vi.fn() as any;
  mockToast.success = vi.fn();
  mockToast.error = vi.fn();
  return { default: mockToast };
});

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

describe('BudgetDetailActions Component [Joseph Nichollas]', () => {
  const defaultProps = {
    budgetId: 'budget-123',
    budgetCode: 'ORC-2026-001',
    budgetStatus: 'SENT',
    onDeleteClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
      writable: true,
      configurable: true,
    });
    window.print = vi.fn();
  });

  const renderComponent = (props = {}) => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <BudgetDetailActions {...defaultProps} {...props} />
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  it('deve renderizar todos os botões de ação e links corretamente', () => {
    renderComponent();

    expect(screen.getByRole('button', { name: /PDF Comercial/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /WhatsApp/i })).toBeInTheDocument();
    expect(screen.getByTestId('btn-download-pdf-tecnico')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Duplicar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Excluir/i })).toBeInTheDocument();
    expect(screen.getByTestId('btn-approve-budget')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Editar/i })).toHaveAttribute(
      'href',
      '/orcamentos/budget-123/editar'
    );
    expect(screen.getByRole('link', { name: /Novo/i })).toHaveAttribute('href', '/orcamentos/novo');
  });

  describe('Download PDF Comercial', () => {
    it('deve chamar downloadCommercialPdf e disparar toast de sucesso', async () => {
      vi.mocked(budgetsApi.downloadCommercialPdf).mockResolvedValueOnce(undefined);
      renderComponent();

      const btn = screen.getByRole('button', { name: /PDF Comercial/i });
      fireEvent.click(btn);

      await waitFor(() => {
        expect(budgetsApi.downloadCommercialPdf).toHaveBeenCalledWith('budget-123', 'ORC-2026-001');
        expect(toast.success).toHaveBeenCalledWith(
          'PDF Comercial do orçamento ORC-2026-001 gerado com sucesso!'
        );
      });
    });

    it('deve exibir toast de erro se downloadCommercialPdf falhar', async () => {
      vi.mocked(budgetsApi.downloadCommercialPdf).mockRejectedValueOnce(new Error('Network error'));
      renderComponent();

      const btn = screen.getByRole('button', { name: /PDF Comercial/i });
      fireEvent.click(btn);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Erro ao gerar o PDF Comercial.');
      });
    });
  });

  describe('WhatsApp Dropdown & Ações', () => {
    it('deve abrir menu do WhatsApp e exibir opções de envio de texto e link do PDF', () => {
      renderComponent();

      const btn = screen.getByRole('button', { name: /WhatsApp/i });
      fireEvent.click(btn);

      expect(screen.getByText('Enviar Resumo de Texto')).toBeInTheDocument();
      expect(screen.getByText('Enviar PDF Comercial')).toBeInTheDocument();
    });

    it('deve desabilitar o botão do WhatsApp quando o orçamento for CANCELLED', () => {
      renderComponent({ status: 'CANCELLED', budgetStatus: 'CANCELLED' });

      const btn = screen.getByRole('button', { name: /WhatsApp/i });
      expect(btn).toBeDisabled();
    });
  });

  describe('Download Via Técnica', () => {
    it('deve acionar callback onDownloadPdfTecnico quando fornecido nas props', () => {
      const onDownload = vi.fn();
      renderComponent({ onDownloadPdfTecnico: onDownload });

      const btn = screen.getByTestId('btn-download-pdf-tecnico');
      fireEvent.click(btn);

      expect(onDownload).toHaveBeenCalledTimes(1);
      expect(budgetsApi.downloadPdfTecnico).not.toHaveBeenCalled();
    });

    it('deve chamar budgetsApi.downloadPdfTecnico internamente quando não houver callback', async () => {
      vi.mocked(budgetsApi.downloadPdfTecnico).mockResolvedValueOnce(undefined);
      renderComponent();

      const btn = screen.getByTestId('btn-download-pdf-tecnico');
      fireEvent.click(btn);

      await waitFor(() => {
        expect(budgetsApi.downloadPdfTecnico).toHaveBeenCalledWith('budget-123', 'ORC-2026-001');
        expect(toast.success).toHaveBeenCalledWith('PDF da Ficha Técnica baixado com sucesso!');
      });
    });

    it('deve exibir toast de erro se downloadPdfTecnico falhar', async () => {
      vi.mocked(budgetsApi.downloadPdfTecnico).mockRejectedValueOnce(new Error('PDF error'));
      renderComponent();

      const btn = screen.getByTestId('btn-download-pdf-tecnico');
      fireEvent.click(btn);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Erro ao gerar o PDF técnico.');
      });
    });

    it('deve desabilitar o botão Via Técnica quando o orçamento for CANCELLED', () => {
      renderComponent({ budgetStatus: 'CANCELLED' });

      const btn = screen.getByTestId('btn-download-pdf-tecnico');
      expect(btn).toBeDisabled();
      expect(btn).toHaveAttribute(
        'title',
        'Não é possível emitir ficha técnica de orçamento cancelado'
      );
    });

    it('deve exibir estado de carregamento quando isDownloadingPdfTecnico for true', () => {
      renderComponent({ isDownloadingPdfTecnico: true });

      const btn = screen.getByTestId('btn-download-pdf-tecnico');
      expect(btn).toBeDisabled();
      expect(screen.getByText('Gerando...')).toBeInTheDocument();
    });
  });

  describe('Duplicação de Orçamento', () => {
    const mockBudgetDetail = {
      id: 'budget-123',
      customerId: 'cust-1',
      discountPercent: 5,
      notes: 'Observação existente',
      commercialConditions: 'A_VISTA_PIX',
      validUntil: '2026-10-30',
      items: [
        {
          productId: 'prod-1',
          templateType: 'SLIDING_DOOR',
          templateConfig: {},
          handleConfig: {},
          drillingConfig: {},
          width: 1200,
          height: 2100,
          quantity: 1,
          laborCost: 200,
          notes: 'Item 1',
          options: [{ materialId: 'mat-1', quantity: 2, categoryType: 'PROFILE' }],
        },
      ],
    };

    it('deve duplicar orçamento com sucesso e navegar para o novo id', async () => {
      vi.mocked(budgetsApi.getBudget).mockResolvedValueOnce(mockBudgetDetail as any);
      vi.mocked(budgetsApi.createBudget).mockResolvedValueOnce({ id: 'budget-new-456' } as any);

      renderComponent();

      const btn = screen.getByRole('button', { name: /Duplicar/i });
      fireEvent.click(btn);

      await waitFor(() => {
        expect(budgetsApi.getBudget).toHaveBeenCalledWith('budget-123');
        expect(budgetsApi.createBudget).toHaveBeenCalledWith(
          expect.objectContaining({
            customerId: 'cust-1',
            discountPercent: 5,
            notes: 'Observação existente (Cópia do orçamento ORC-2026-001)',
          })
        );
        expect(toast.success).toHaveBeenCalledWith('Orçamento duplicado com sucesso!');
        expect(mockNavigate).toHaveBeenCalledWith('/orcamentos/budget-new-456', {
          state: { justCreated: true },
        });
      });
    });

    it('deve duplicar orçamento sem id retornado e navegar para a lista geral', async () => {
      vi.mocked(budgetsApi.getBudget).mockResolvedValueOnce({
        ...mockBudgetDetail,
        notes: undefined,
        items: undefined,
      } as any);
      vi.mocked(budgetsApi.createBudget).mockResolvedValueOnce(undefined as any);

      renderComponent();

      const btn = screen.getByRole('button', { name: /Duplicar/i });
      fireEvent.click(btn);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/orcamentos');
      });
    });

    it('deve exibir toast de erro se a duplicação falhar', async () => {
      vi.mocked(budgetsApi.getBudget).mockRejectedValueOnce(new Error('Duplication failed'));

      renderComponent();

      const btn = screen.getByRole('button', { name: /Duplicar/i });
      fireEvent.click(btn);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Erro ao duplicar o orçamento.');
      });
    });
  });

  describe('Outras Ações (Excluir)', () => {
    it('deve disparar onDeleteClick ao clicar no botão Excluir', () => {
      const onDelete = vi.fn();
      renderComponent({ onDeleteClick: onDelete });

      const btn = screen.getByRole('button', { name: /Excluir/i });
      fireEvent.click(btn);

      expect(onDelete).toHaveBeenCalledTimes(1);
    });
  });

  describe('Botão Aprovar e Gerar Pedido (US-13.3)', () => {
    it('deve disparar onApproveClick ao clicar quando habilitado em status SENT ou DRAFT', () => {
      const onApprove = vi.fn();
      renderComponent({
        budgetStatus: 'SENT',
        onApproveClick: onApprove,
      });

      const btn = screen.getByTestId('btn-approve-budget');
      expect(btn).not.toBeDisabled();
      fireEvent.click(btn);

      expect(onApprove).toHaveBeenCalledTimes(1);
    });

    it('deve exibir botão Ver Ordem de Serviço habilitado quando status for APPROVED', () => {
      const onApprove = vi.fn();
      renderComponent({
        budgetStatus: 'APPROVED',
        onApproveClick: onApprove,
      });

      const btn = screen.getByTestId('btn-view-work-order');
      expect(btn).toBeInTheDocument();
      expect(btn).toHaveTextContent('Ver Ordem de Serviço');
      expect(btn).not.toBeDisabled();
    });

    it('deve estar desabilitado quando status for CANCELLED', () => {
      const onApprove = vi.fn();
      renderComponent({
        budgetStatus: 'CANCELLED',
        onApproveClick: onApprove,
      });

      const btn = screen.getByTestId('btn-approve-budget');
      expect(btn).toBeDisabled();
      expect(btn).toHaveAttribute(
        'title',
        expect.stringContaining('cancelados ou rejeitados')
      );
    });

    it('deve estar desabilitado quando status for REJECTED', () => {
      const onApprove = vi.fn();
      renderComponent({
        budgetStatus: 'REJECTED',
        onApproveClick: onApprove,
      });

      const btn = screen.getByTestId('btn-approve-budget');
      expect(btn).toBeDisabled();
    });
  });
});

