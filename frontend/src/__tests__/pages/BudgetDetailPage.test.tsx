import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { BudgetDetailPage } from '../../pages/BudgetDetailPage';
import * as useBudgetsModule from '../../features/budgets/hooks/useBudgets';
import type { BudgetDetail } from '../../features/budgets/types';

vi.mock('../../features/budgets/hooks/useBudgets');

const mockBudgetDetail: BudgetDetail = {
  id: 'budget-123',
  code: 'ORC-2026-001',
  customerId: 'cli-1',
  customerName: 'Cliente Teste',
  customer: {
    id: 'cli-1',
    name: 'Cliente Teste',
    phone: '83999999999',
    email: 'cliente@teste.com',
  },
  status: 'DRAFT',
  createdAt: '2026-09-20T10:00:00Z',
  validUntil: '2026-10-20T23:59:59Z',
  subtotal: 1500,
  discountPercent: 0,
  discountValue: 0,
  total: 1500,
  itemCount: 1,
  items: [
    {
      id: 'item-1',
      productId: 'prod-1',
      productName: 'Janela 2F',
      templateType: 'SLIDING_WINDOW_2F',
      width: 1200,
      height: 1000,
      quantity: 1,
      laborCost: 100,
      subtotal: 1500,
      options: [],
    },
  ],
};

describe('BudgetDetailPage — [US-11.5] Botão Emitir Via Técnica (Oficina)', () => {
  const mockDownloadPdf = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(useBudgetsModule, 'useBudget').mockReturnValue({
      data: mockBudgetDetail,
      isLoading: false,
      isError: false,
    } as any);

    vi.spyOn(useBudgetsModule, 'useDeleteBudget').mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);

    vi.spyOn(useBudgetsModule, 'useUpdateBudgetStatus').mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);

    vi.spyOn(useBudgetsModule, 'useCreateBudget').mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);

    vi.spyOn(useBudgetsModule, 'useDownloadPdfTecnico').mockReturnValue({
      mutate: mockDownloadPdf,
      isPending: false,
    } as any);
  });

  function renderComponent() {
    return render(
      <MemoryRouter initialEntries={['/orcamentos/budget-123']}>
        <Routes>
          <Route path="/orcamentos/:id" element={<BudgetDetailPage />} />
        </Routes>
      </MemoryRouter>
    );
  }

  it('deve renderizar o botão "Via Técnica" na barra de ações', () => {
    renderComponent();

    const btn = screen.getByTestId('btn-download-pdf-tecnico');
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveTextContent('Via Técnica');
    expect(btn).not.toBeDisabled();
  });

  it('deve chamar downloadPdfTecnico ao clicar no botão', () => {
    renderComponent();

    const btn = screen.getByTestId('btn-download-pdf-tecnico');
    fireEvent.click(btn);

    expect(mockDownloadPdf).toHaveBeenCalledTimes(1);
    expect(mockDownloadPdf).toHaveBeenCalledWith({
      id: 'budget-123',
      code: 'ORC-2026-001',
    });
  });

  it('deve desabilitar o botão e exibir feedback quando o download estiver em andamento', () => {
    vi.spyOn(useBudgetsModule, 'useDownloadPdfTecnico').mockReturnValue({
      mutate: mockDownloadPdf,
      isPending: true,
    } as any);

    renderComponent();

    const btn = screen.getByTestId('btn-download-pdf-tecnico');
    expect(btn).toBeDisabled();
    expect(btn).toHaveTextContent('Gerando...');
  });

  it('deve desabilitar o botão quando o orçamento estiver com status CANCELLED', () => {
    vi.spyOn(useBudgetsModule, 'useBudget').mockReturnValue({
      data: { ...mockBudgetDetail, status: 'CANCELLED' },
      isLoading: false,
      isError: false,
    } as any);

    renderComponent();

    const btn = screen.getByTestId('btn-download-pdf-tecnico');
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute(
      'title',
      'Não é possível emitir ficha técnica de orçamento cancelado'
    );
  });
});
