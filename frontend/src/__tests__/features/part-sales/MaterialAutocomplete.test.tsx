import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MaterialAutocomplete } from '@/features/part-sales/components/MaterialAutocomplete';
import { partSaleApi } from '@/features/part-sales/services/partSaleApi';
import type { MaterialOption } from '@/features/part-sales/types';

vi.mock('@/features/part-sales/services/partSaleApi', () => ({
  partSaleApi: {
    getMaterialsByCategory: vi.fn(),
  },
}));

const mockMaterials: MaterialOption[] = [
  {
    id: 'mat-uuid-1',
    name: 'Vidro Temperado',
    category: 'GLASS',
    unitPrice: 180.0,
    unitOfMeasure: 'M2',
    color: 'Fumê',
    thicknessMm: 8,
    familyCode: 'FAM-VIDRO-8',
  },
  {
    id: 'mat-uuid-2',
    name: 'Vidro Laminado',
    category: 'GLASS',
    unitPrice: 220.0,
    unitOfMeasure: 'M2',
    color: 'Incolor',
    thicknessMm: 6,
    familyCode: 'FAM-VIDRO-6',
  },
  {
    id: 'mat-uuid-3',
    name: 'Vidro Float Comum',
    category: 'GLASS',
    unitPrice: 95.0,
    unitOfMeasure: 'M2',
    color: 'Verde',
    thicknessMm: 4,
    familyCode: 'FAM-VIDRO-4',
  },
];

function createTestWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('MaterialAutocomplete Component [US-46.5 - Issue #551]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(partSaleApi.getMaterialsByCategory).mockResolvedValue(mockMaterials);
  });

  it('[Partição de Equivalência] deve renderizar o input de busca e carregar materiais do catálogo', async () => {
    render(
      <MaterialAutocomplete
        category="GLASS"
        onChange={vi.fn()}
      />,
      { wrapper: createTestWrapper() }
    );

    const input = screen.getByTestId('input-material-autocomplete');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', expect.stringContaining('buscar vidro'));

    await waitFor(() => {
      expect(partSaleApi.getMaterialsByCategory).toHaveBeenCalledWith('GLASS');
    });
  });

  it('[Partição de Equivalência] deve abrir dropdown e exibir variações e preço formatado em BRL', async () => {
    render(
      <MaterialAutocomplete
        category="GLASS"
        onChange={vi.fn()}
      />,
      { wrapper: createTestWrapper() }
    );

    const input = screen.getByTestId('input-material-autocomplete');
    fireEvent.focus(input);

    await waitFor(() => {
      expect(screen.getByText(/Vidro Temperado/i)).toBeInTheDocument();
      expect(screen.getByText(/R\$\s*180,00\s*\/\s*m²/i)).toBeInTheDocument();
    });
  });

  it('[Análise de Valor Limite] deve filtrar opções dinamicamente ao digitar cor ou espessura', async () => {
    render(
      <MaterialAutocomplete
        category="GLASS"
        onChange={vi.fn()}
      />,
      { wrapper: createTestWrapper() }
    );

    const input = screen.getByTestId('input-material-autocomplete');
    fireEvent.focus(input);

    // Filtra por espessura "8mm"
    fireEvent.change(input, { target: { value: '8mm' } });

    await waitFor(() => {
      expect(screen.getByText(/Vidro Temperado - 8mm - Fumê/i)).toBeInTheDocument();
      expect(screen.queryByText(/Vidro Laminado/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Vidro Float Comum/i)).not.toBeInTheDocument();
    });
  });

  it('[Transição de Estados] deve disparar onChange com o objeto do material ao clicar em uma opção', async () => {
    const handleChange = vi.fn();

    render(
      <MaterialAutocomplete
        category="GLASS"
        onChange={handleChange}
      />,
      { wrapper: createTestWrapper() }
    );

    const input = screen.getByTestId('input-material-autocomplete');
    fireEvent.focus(input);

    await waitFor(() => {
      expect(screen.getByTestId('material-option-mat-uuid-1')).toBeInTheDocument();
    });

    const optionBtn = screen.getByTestId('material-option-mat-uuid-1');
    fireEvent.click(optionBtn);

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(mockMaterials[0]);
    expect(input).toHaveValue('Vidro Temperado - 8mm - Fumê');
  });

  it('[Transição de Estados] deve permitir limpar o material selecionado ao clicar no botão X', async () => {
    const handleChange = vi.fn();

    render(
      <MaterialAutocomplete
        category="GLASS"
        value="mat-uuid-1"
        onChange={handleChange}
      />,
      { wrapper: createTestWrapper() }
    );

    const clearBtn = await screen.findByTestId('btn-clear-material');
    fireEvent.click(clearBtn);

    expect(handleChange).toHaveBeenCalledWith(null);
  });

  it('[Tabela de Decisão] deve exibir alerta visual e mensagem de erro quando a prop error for fornecida', () => {
    render(
      <MaterialAutocomplete
        category="GLASS"
        onChange={vi.fn()}
        error="Selecione um material válido do catálogo."
      />,
      { wrapper: createTestWrapper() }
    );

    const input = screen.getByTestId('input-material-autocomplete');
    expect(input).toHaveClass('border-red-500');
    expect(screen.getByTestId('material-autocomplete-error')).toHaveTextContent(
      'Selecione um material válido do catálogo.'
    );
  });

  it('[Análise de Valor Limite] deve exibir mensagem de nenhum material quando busca for inexistente', async () => {
    render(
      <MaterialAutocomplete
        category="GLASS"
        onChange={vi.fn()}
      />,
      { wrapper: createTestWrapper() }
    );

    const input = screen.getByTestId('input-material-autocomplete');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'InexistenteXYZ123' } });

    await waitFor(() => {
      expect(screen.getByText(/Nenhum material encontrado/i)).toBeInTheDocument();
    });
  });
});

