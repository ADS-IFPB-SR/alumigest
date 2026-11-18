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
  useGlasses: () => ({
    data: {
      content: [
        { id: 'g1', name: 'Vidro Temperado 8mm', thicknessMm: 8, pricePerSqm: 120, salePrice: 150, active: true },
      ],
    },
    isLoading: false,
  }),
  useProfiles: () => ({
    data: {
      content: [
        { id: 'p1', name: 'Perfil U Supremo', commercialReference: 'PU-01', salePrice: 45, active: true },
      ],
    },
    isLoading: false,
  }),
  useFilms: () => ({
    data: {
      content: [
        { id: 'f1', name: 'Película Fumê', colorFinish: 'Fumê', salePrice: 35, active: true },
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

describe('PartSaleMaterialForm [US-46.1 / US-46.3] - UI & Interaction Tests', () => {
  it('deve iniciar com categoria Ferragem selecionada e campos de hardware visíveis', () => {
    const onAddItem = vi.fn();
    render(<PartSaleMaterialForm onAddItem={onAddItem} />, { wrapper: createWrapper() });

    const categorySelect = screen.getByLabelText(/categoria/i) as HTMLSelectElement;
    expect(categorySelect.value).toBe('HARDWARE');

    expect(screen.queryByTestId('badge-glass-category')).not.toBeInTheDocument();
    expect(screen.queryByTestId('badge-film-category')).not.toBeInTheDocument();
    expect(screen.queryByTestId('badge-metro-linear')).not.toBeInTheDocument();

    expect(screen.getByText(/preço unidade \(r\$\) \*/i)).toBeInTheDocument();
  });

  it('deve exibir campos especialistas de Vidro quando o usuário seleciona Vidro', () => {
    const onAddItem = vi.fn();
    render(<PartSaleMaterialForm onAddItem={onAddItem} />, { wrapper: createWrapper() });

    const categorySelect = screen.getByLabelText(/categoria/i);
    fireEvent.change(categorySelect, { target: { value: 'GLASS' } });

    expect(screen.getByTestId('badge-glass-category')).toBeInTheDocument();
    expect(screen.getByTestId('input-glass-height')).toBeInTheDocument();
    expect(screen.getByTestId('input-glass-width')).toBeInTheDocument();
    expect(screen.getByTestId('select-glass-catalog')).toBeInTheDocument();
  });

  it('deve exibir campos especialistas de Película quando o usuário seleciona Película', () => {
    const onAddItem = vi.fn();
    render(<PartSaleMaterialForm onAddItem={onAddItem} />, { wrapper: createWrapper() });

    const categorySelect = screen.getByLabelText(/categoria/i);
    fireEvent.change(categorySelect, { target: { value: 'FILM' } });

    expect(screen.getByTestId('badge-film-category')).toBeInTheDocument();
    expect(screen.getByTestId('input-film-height')).toBeInTheDocument();
    expect(screen.getByTestId('input-film-width')).toBeInTheDocument();
    expect(screen.getByTestId('select-film-catalog')).toBeInTheDocument();
  });

  it('deve exibir campos especialistas de Perfil de Alumínio quando selecionado', () => {
    const onAddItem = vi.fn();
    render(<PartSaleMaterialForm onAddItem={onAddItem} />, { wrapper: createWrapper() });

    const categorySelect = screen.getByLabelText(/categoria/i);
    fireEvent.change(categorySelect, { target: { value: 'PROFILE' } });

    expect(screen.getByTestId('badge-metro-linear')).toBeInTheDocument();
    expect(screen.getByTestId('input-aluminum-length')).toBeInTheDocument();
    expect(screen.getByTestId('select-profile-catalog')).toBeInTheDocument();
  });

  it('deve inserir item de ferragem por unidade ao preencher e submeter o formulário', () => {
    const onAddItem = vi.fn();
    render(<PartSaleMaterialForm onAddItem={onAddItem} />, { wrapper: createWrapper() });

    const descInput = screen.getByPlaceholderText(/ex: roldana dupla suprema 112/i);
    const qtyInput = screen.getByLabelText(/^qtd \*/i);
    const priceInput = screen.getByPlaceholderText(/28\.50/i);
    const submitBtn = screen.getByTestId('btn-insert-material');

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

  it('deve vincular ID do catálogo real ao selecionar Vidro do catálogo (evitando 404)', () => {
    const onAddItem = vi.fn();
    render(<PartSaleMaterialForm onAddItem={onAddItem} />, { wrapper: createWrapper() });

    const categorySelect = screen.getByLabelText(/categoria/i);
    fireEvent.change(categorySelect, { target: { value: 'GLASS' } });

    const glassSelect = screen.getByTestId('select-glass-catalog');
    fireEvent.change(glassSelect, { target: { value: 'g1' } });

    const descInput = screen.getByTestId('input-item-description') as HTMLInputElement;
    expect(descInput.value).toBe('Vidro Temperado 8mm');

    const submitBtn = screen.getByTestId('btn-insert-material');
    fireEvent.click(submitBtn);

    expect(onAddItem).toHaveBeenCalledTimes(1);
    const addedItem = onAddItem.mock.calls[0][0];
    expect(addedItem.materialType).toBe('GLASS');
    expect(addedItem.referenceId).toBe('g1');
    expect(addedItem.description).toBe('VIDRO TEMPERADO 8MM');
  });
});
