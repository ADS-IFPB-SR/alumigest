import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PartSaleMaterialForm } from '@/features/part-sales/components/PartSaleMaterialForm';

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
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('PartSaleMaterialForm [US-46.1] - UI & Interaction Tests', () => {
  it('deve iniciar com categoria Ferragem selecionada e campos de Altura/Largura ocultos', () => {
    const onAddItem = vi.fn();
    render(<PartSaleMaterialForm onAddItem={onAddItem} />, { wrapper: createWrapper() });

    const categorySelect = screen.getByLabelText(/categoria/i) as HTMLSelectElement;
    expect(categorySelect.value).toBe('HARDWARE');

    const containerHeight = document.getElementById('containerHeight');
    const containerWidth = document.getElementById('containerWidth');

    expect(containerHeight).toHaveClass('hidden');
    expect(containerWidth).toHaveClass('hidden');

    expect(screen.getByText(/preço unidade \(r\$\) \*/i)).toBeInTheDocument();
  });

  it('deve exibir campos de Altura e Largura quando o usuário seleciona Vidro', () => {
    const onAddItem = vi.fn();
    render(<PartSaleMaterialForm onAddItem={onAddItem} />, { wrapper: createWrapper() });

    const categorySelect = screen.getByLabelText(/categoria/i);
    fireEvent.change(categorySelect, { target: { value: 'GLASS' } });

    const containerHeight = document.getElementById('containerHeight');
    const containerWidth = document.getElementById('containerWidth');

    expect(containerHeight).not.toHaveClass('hidden');
    expect(containerWidth).not.toHaveClass('hidden');
    expect(screen.getByText(/preço venda \(r\$\) \*/i)).toBeInTheDocument();
  });

  it('deve inserir item de ferragem por unidade ao preencher e submeter o formulário', () => {
    const onAddItem = vi.fn();
    render(<PartSaleMaterialForm onAddItem={onAddItem} />, { wrapper: createWrapper() });

    const descInput = screen.getByPlaceholderText(/ex: roldana dupla suprema 112/i);
    const qtyInput = screen.getByLabelText(/^qtd \*/i);
    const priceInput = screen.getByPlaceholderText(/28\.50/i);
    const submitBtn = screen.getByRole('button', { name: /inserir na venda/i });

    fireEvent.change(descInput, { target: { value: 'Fechadura Bico Papagaio' } });
    fireEvent.change(qtyInput, { target: { value: '4' } });
    fireEvent.change(priceInput, { target: { value: '50.00' } });

    fireEvent.click(submitBtn);

    expect(onAddItem).toHaveBeenCalledTimes(1);
    const addedItem = onAddItem.mock.calls[0][0];
    expect(addedItem.materialType).toBe('HARDWARE');
    expect(addedItem.description).toBe('FECHADURA BICO PAPAGAIO');
    expect(addedItem.quantity).toBe(4);
    expect(addedItem.unitPrice).toBe(50);
    expect(addedItem.totalPrice).toBe(200);
  });
});
