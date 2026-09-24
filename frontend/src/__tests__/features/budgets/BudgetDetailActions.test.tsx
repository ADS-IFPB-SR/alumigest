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
    return render(
      <MemoryRouter>
        <BudgetDetailActions {...defaultProps} {...props} />
      </MemoryRouter>
    );
  };

  it('deve renderizar todos os botões de ação e links corretamente', () => {
    renderComponent();

    expect(screen.getByRole('button', { name: /PDF Comercial/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Copiar para WhatsApp/i })).toBeInTheDocument();
    expect(screen.getByTestId('btn-download-pdf-tecnico')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Imprimir/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Duplicar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Excluir/i })).toBeInTheDocument();
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

  describe('WhatsApp Summary', () => {
    it('deve buscar resumo do WhatsApp, copiar para o clipboard e disparar toast', async () => {
      vi.mocked(budgetsApi.getWhatsAppSummary).mockResolvedValueOnce('Texto do WhatsApp');
      renderComponent();

      const btn = screen.getByRole('button', { name: /Copiar para WhatsApp/i });
      fireEvent.click(btn);

      await waitFor(() => {
        expect(budgetsApi.getWhatsAppSummary).toHaveBeenCalledWith('budget-123');
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Texto do WhatsApp');
        expect(toast.success).toHaveBeenCalledWith('Resumo para WhatsApp copiado com sucesso!');
      });
    });

    it('deve exibir toast de erro se a cópia para WhatsApp falhar', async () => {
      vi.mocked(budgetsApi.getWhatsAppSummary).mockRejectedValueOnce(new Error('API error'));
      renderComponent();

      const btn = screen.getByRole('button', { name: /Copiar para WhatsApp/i });
      fireEvent.click(btn);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Erro ao gerar ou copiar o resumo para o WhatsApp.');
      });
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

  describe('Outras Ações (Imprimir e Excluir)', () => {
    it('deve disparar window.print ao clicar no botão Imprimir', () => {
      renderComponent();

      const btn = screen.getByRole('button', { name: /Imprimir/i });
      fireEvent.click(btn);

      expect(window.print).toHaveBeenCalledTimes(1);
    });

    it('deve disparar onDeleteClick ao clicar no botão Excluir', () => {
      const onDelete = vi.fn();
      renderComponent({ onDeleteClick: onDelete });

      const btn = screen.getByRole('button', { name: /Excluir/i });
      fireEvent.click(btn);

      expect(onDelete).toHaveBeenCalledTimes(1);
    });
  });
});
