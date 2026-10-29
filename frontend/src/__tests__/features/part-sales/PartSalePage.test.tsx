import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { PartSalePage } from '@/pages/PartSalePage';
import { partSaleApi } from '@/features/part-sales/services/partSaleApi';

vi.mock('@/features/customers/hooks/useCustomers', () => ({
  useCustomers: () => ({
    data: {
      content: [
        { id: 'c1', nomeCompleto: 'João da Silva', documento: '123.456.789-00' },
      ],
    },
    isLoading: false,
  }),
}));

vi.mock('@/features/catalog/hooks/useCatalog', () => ({
  useHardwares: () => ({
    data: {
      content: [
        { id: 'h1', name: 'Roldana 112', skuCode: 'ROL-112', salePrice: 28.5, active: true },
      ],
    },
    isLoading: false,
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
};

describe('PartSalePage [US-46.1] - Integrated Flow Tests', () => {
  it('deve renderizar a tela de Venda Avulsa conforme o protótipo', () => {
    render(<PartSalePage />, { wrapper: createWrapper() });

    expect(screen.getByRole('heading', { level: 2, name: /venda avulsa/i })).toBeInTheDocument();
    expect(screen.getByText(/informações do material/i)).toBeInTheDocument();
    expect(screen.getByText(/resumo da venda/i)).toBeInTheDocument();
    expect(screen.getByText(/nenhum material adicionado ainda/i)).toBeInTheDocument();
  });

  it('deve permitir adicionar item de ferragem e atualizar resumo', async () => {
    render(<PartSalePage />, { wrapper: createWrapper() });

    const descInput = screen.getByPlaceholderText(/ex: roldana dupla suprema 112/i);
    const qtyInput = screen.getByLabelText(/^qtd \*/i);
    const priceInput = screen.getByPlaceholderText(/28\.50/i);
    const addBtn = screen.getByRole('button', { name: /inserir na venda/i });

    fireEvent.change(descInput, { target: { value: 'Roldana Dupla 112' } });
    fireEvent.change(qtyInput, { target: { value: '2' } });
    fireEvent.change(priceInput, { target: { value: '30.00' } });
    fireEvent.click(addBtn);

    await waitFor(() => {
      expect(screen.getByText('ROLDANA DUPLA 112')).toBeInTheDocument();
    });

    expect(screen.getByText('1 item')).toBeInTheDocument();

    const summaryTotalPieces = document.getElementById('summaryTotalPieces');
    expect(summaryTotalPieces).toHaveTextContent('2');

    const summaryTotalValue = document.getElementById('summaryTotalValue');
    expect(summaryTotalValue).toHaveTextContent('60,00');
  });

  it('deve chamar create API ao aprovar a venda com itens', async () => {
    const createSpy = vi.spyOn(partSaleApi, 'create').mockResolvedValue({
      id: 'sale-1',
      code: 'VP-2026-0001',
      clientId: 'c1',
      clientName: 'João da Silva',
      status: 'APPROVED',
      subtotalAmount: 60,
      discountAmount: 0,
      totalAmount: 60,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    render(<PartSalePage />, { wrapper: createWrapper() });

    const descInput = screen.getByPlaceholderText(/ex: roldana dupla suprema 112/i);
    const priceInput = screen.getByPlaceholderText(/28\.50/i);
    const addBtn = screen.getByRole('button', { name: /inserir na venda/i });

    fireEvent.change(descInput, { target: { value: 'Roldana' } });
    fireEvent.change(priceInput, { target: { value: '30.00' } });
    fireEvent.click(addBtn);

    await waitFor(() => {
      expect(screen.getByText('ROLDANA')).toBeInTheDocument();
    });

    const approveBtn = screen.getByRole('button', { name: /aprovar venda/i });
    fireEvent.click(approveBtn);

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalledTimes(1);
    });

    expect(createSpy.mock.calls[0][0].status).toBe('APPROVED');
    expect(createSpy.mock.calls[0][0].items.length).toBe(1);
    expect(createSpy.mock.calls[0][0].items[0].materialType).toBe('HARDWARE');
  });
});
