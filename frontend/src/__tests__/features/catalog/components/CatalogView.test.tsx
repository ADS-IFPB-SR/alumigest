import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { CatalogView } from '@/features/catalog/components/CatalogView';
import { stockApi, useStockBalances } from '@/features/stock';

vi.mock('@/features/stock', async () => {
  const actual = await vi.importActual<typeof import('@/features/stock')>('@/features/stock');
  return {
    ...actual,
    useStockBalances: vi.fn(),
  };
});

vi.mock('@/features/catalog/components/GlassTab', () => ({
  GlassTab: ({
    searchQuery,
    filterStatus,
    onlyNeedsPurchase,
    hideStockAlert,
    onEdit,
    onViewDetails,
    onOpenKardex,
  }: any) => (
    <div data-testid="glass-tab">
      <span>
        GlassTab (search: {searchQuery}, status: {filterStatus}, need:{' '}
        {String(Boolean(onlyNeedsPurchase))}, hide: {String(Boolean(hideStockAlert))})
      </span>
      <button type="button" onClick={() => onEdit({ id: '1', name: 'Vidro Temperado' })}>
        Editar Vidro
      </button>
      <button type="button" onClick={() => onViewDetails({ id: '1', name: 'Vidro Temperado' })}>
        Detalhes Vidro
      </button>
      <button
        type="button"
        onClick={() =>
          onOpenKardex?.({
            id: 'mat-g1',
            name: 'Vidro Temperado 8mm',
            commercialReference: 'VID-008',
          })
        }
      >
        Extrato Kardex Vidro
      </button>
    </div>
  ),
}));

vi.mock('@/features/catalog/components/ProfileTab', () => ({
  ProfileTab: ({ onlyNeedsPurchase, hideStockAlert, onEdit, onViewDetails, onOpenKardex }: any) => (
    <div data-testid="profile-tab">
      <span>
        ProfileTab (need: {String(Boolean(onlyNeedsPurchase))}, hide:{' '}
        {String(Boolean(hideStockAlert))})
      </span>
      <button type="button" onClick={() => onEdit({ id: '2', name: 'Perfil Tubo' })}>
        Editar Perfil
      </button>
      <button type="button" onClick={() => onViewDetails({ id: '2', name: 'Perfil Tubo' })}>
        Detalhes Perfil
      </button>
      <button
        type="button"
        onClick={() =>
          onOpenKardex?.({
            id: 'mat-p1',
            name: 'Perfil Suprema',
            commercialReference: 'AL-SUP-01',
          })
        }
      >
        Extrato Kardex Perfil
      </button>
    </div>
  ),
}));

vi.mock('@/features/catalog/components/FilmTab', () => ({
  FilmTab: ({ onEdit, onViewDetails, onOpenKardex }: any) => (
    <div data-testid="film-tab">
      <span>FilmTab</span>
      <button type="button" onClick={() => onEdit({ id: '3', name: 'Película Fumê' })}>
        Editar Película
      </button>
      <button type="button" onClick={() => onViewDetails({ id: '3', name: 'Película Fumê' })}>
        Detalhes Película
      </button>
      <button
        type="button"
        onClick={() =>
          onOpenKardex?.({
            id: 'mat-f1',
            name: 'Película Jateada',
            skuCode: 'PEL-JAT-01',
          })
        }
      >
        Extrato Kardex Película
      </button>
    </div>
  ),
}));

vi.mock('@/features/catalog/components/HardwareTab', () => ({
  HardwareTab: ({ onEdit, onViewDetails, onOpenKardex }: any) => (
    <div data-testid="hardware-tab">
      <span>HardwareTab</span>
      <button type="button" onClick={() => onEdit({ id: '4', name: 'Fecho Concha' })}>
        Editar Ferragem
      </button>
      <button type="button" onClick={() => onViewDetails({ id: '4', name: 'Fecho Concha' })}>
        Detalhes Ferragem
      </button>
      <button
        type="button"
        onClick={() =>
          onOpenKardex?.({
            id: 'mat-h1',
            name: 'Fecho Concha',
            skuCode: 'FEC-01',
          })
        }
      >
        Extrato Kardex Ferragem
      </button>
    </div>
  ),
}));

vi.mock('@/features/catalog/components/MaterialTypeSelectionModal', () => ({
  MaterialTypeSelectionModal: ({ isOpen, onClose, onSelect }: any) =>
    isOpen ? (
      <div data-testid="selection-modal">
        <button type="button" onClick={() => onSelect('Glass')}>
          Selecionar Vidro
        </button>
        <button type="button" onClick={() => onSelect('Profile')}>
          Selecionar Perfil
        </button>
        <button type="button" onClick={() => onSelect('Hardware')}>
          Selecionar Ferragem
        </button>
        <button type="button" onClick={() => onSelect('Film')}>
          Selecionar Película
        </button>
        <button type="button" onClick={onClose}>
          Fechar Seleção
        </button>
      </div>
    ) : null,
}));

vi.mock('@/features/catalog/components/GlassFormModal', () => ({
  GlassFormModal: ({ isOpen, onClose, initialData }: any) =>
    isOpen ? (
      <div data-testid="glass-form-modal">
        <span>GlassModal {initialData?.name}</span>
        <button type="button" onClick={onClose}>
          Fechar GlassModal
        </button>
      </div>
    ) : null,
}));

vi.mock('@/features/catalog/components/ProfileFormModal', () => ({
  ProfileFormModal: ({ isOpen, onClose, initialData }: any) =>
    isOpen ? (
      <div data-testid="profile-form-modal">
        <span>ProfileModal {initialData?.name}</span>
        <button type="button" onClick={onClose}>
          Fechar ProfileModal
        </button>
      </div>
    ) : null,
}));

vi.mock('@/features/catalog/components/HardwareFormModal', () => ({
  HardwareFormModal: ({ isOpen, onClose, initialData }: any) =>
    isOpen ? (
      <div data-testid="hardware-form-modal">
        <span>HardwareModal {initialData?.name}</span>
        <button type="button" onClick={onClose}>
          Fechar HardwareModal
        </button>
      </div>
    ) : null,
}));

vi.mock('@/features/catalog/components/FilmFormModal', () => ({
  FilmFormModal: ({ isOpen, onClose, initialData }: any) =>
    isOpen ? (
      <div data-testid="film-form-modal">
        <span>FilmModal {initialData?.name}</span>
        <button type="button" onClick={onClose}>
          Fechar FilmModal
        </button>
      </div>
    ) : null,
}));

vi.mock('@/features/catalog/components/MaterialDetailsModal', () => ({
  MaterialDetailsModal: ({ isOpen, onClose, onEdit, item }: any) =>
    isOpen ? (
      <div data-testid="details-modal">
        <span>DetailsModal {item?.name}</span>
        <button type="button" onClick={onClose}>
          Fechar Detalhes
        </button>
        <button type="button" onClick={onEdit}>
          Editar nos Detalhes
        </button>
      </div>
    ) : null,
}));

describe('CatalogView Component [Joseph Nichollas + US-22.1]', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(useStockBalances).mockReturnValue({
      data: [
        {
          id: 'st-1',
          materialId: 'm1',
          materialSku: 'VID-010',
          materialName: 'Vidro Fumê 10mm',
          category: 'GLASS',
          unitMeasure: 'M2',
          physicalQuantity: 4,
          reservedQuantity: 10,
          availableQuantity: -6,
          minimumStock: 5,
          alertStatus: 'NEED_PURCHASE',
        },
        {
          id: 'st-2',
          materialId: 'm2',
          materialSku: 'PER-001',
          materialName: 'Perfil Suprema',
          category: 'PROFILE',
          unitMeasure: 'BARRA_6M',
          physicalQuantity: 5,
          reservedQuantity: 0,
          availableQuantity: 5,
          minimumStock: 5,
          alertStatus: 'ORDER_POINT',
        },
        {
          id: 'st-3',
          materialId: 'm3',
          materialSku: 'FER-001',
          materialName: 'Fechadura Concha',
          category: 'HARDWARE',
          unitMeasure: 'UN',
          physicalQuantity: 20,
          reservedQuantity: 2,
          availableQuantity: 18,
          minimumStock: 5,
          alertStatus: 'IN_STOCK',
        },
      ],
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useStockBalances>);
  });

  it('deve renderizar a tela com cabeçalho, campo de busca, filtro de status, checkboxes de estoque e botão Novo Material', () => {
    render(<CatalogView />);

    expect(screen.getByText('Catálogo de Materiais')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Buscar código ou insumo...')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByLabelText(/Apenas com necessidade de compra/i)).toBeInTheDocument();
    expect(screen.getByTestId('needs-purchase-count')).toHaveTextContent('2');
    expect(screen.getByLabelText(/Ocultar Alerta de Estoque/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Novo Material/i })).toBeInTheDocument();
  });

  it('deve propagar os checkboxes entre as abas e persistir Ocultar Alerta de Estoque em localStorage', () => {
    const { unmount } = render(<CatalogView />);

    const needCheckbox = screen.getByLabelText(/Apenas com necessidade de compra/i);
    const hideCheckbox = screen.getByLabelText(/Ocultar Alerta de Estoque/i);

    fireEvent.click(needCheckbox);
    fireEvent.click(hideCheckbox);

    expect(localStorage.getItem('alumigest.catalog.hideStockAlert')).toBe('true');
    expect(screen.getByTestId('glass-tab')).toHaveTextContent('need: true, hide: true');

    fireEvent.click(screen.getByText('Perfis de Alumínio'));
    expect(screen.getByTestId('profile-tab')).toHaveTextContent('need: true, hide: true');

    unmount();
    render(<CatalogView />);
    expect(screen.getByLabelText(/Ocultar Alerta de Estoque/i)).toBeChecked();
  });

  it('deve renderizar as abas do catálogo e permitir alternar entre elas', () => {
    render(<CatalogView />);

    expect(screen.getByText('Vidros')).toBeInTheDocument();
    expect(screen.getByTestId('glass-tab')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Perfis de Alumínio'));
    expect(screen.getByTestId('profile-tab')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Películas'));
    expect(screen.getByTestId('film-tab')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Ferragens'));
    expect(screen.getByTestId('hardware-tab')).toBeInTheDocument();
  });

  it('deve abrir modal de tipo e fechar ao clicar em Fechar', () => {
    render(<CatalogView />);

    fireEvent.click(screen.getByRole('button', { name: /Novo Material/i }));
    expect(screen.getByTestId('selection-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Fechar Seleção'));
    expect(screen.queryByTestId('selection-modal')).not.toBeInTheDocument();
  });

  it('deve abrir o modal de formulário de Perfil ao selecionar Perfil', () => {
    render(<CatalogView />);

    fireEvent.click(screen.getByRole('button', { name: /Novo Material/i }));
    fireEvent.click(screen.getByText('Selecionar Perfil'));

    expect(screen.getByTestId('profile-form-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Fechar ProfileModal'));
    expect(screen.queryByTestId('profile-form-modal')).not.toBeInTheDocument();
  });

  it('deve abrir o modal de formulário de Ferragem ao selecionar Ferragem', () => {
    render(<CatalogView />);

    fireEvent.click(screen.getByRole('button', { name: /Novo Material/i }));
    fireEvent.click(screen.getByText('Selecionar Ferragem'));

    expect(screen.getByTestId('hardware-form-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Fechar HardwareModal'));
    expect(screen.queryByTestId('hardware-form-modal')).not.toBeInTheDocument();
  });

  it('deve abrir o modal de formulário de Película ao selecionar Película', () => {
    render(<CatalogView />);

    fireEvent.click(screen.getByRole('button', { name: /Novo Material/i }));
    fireEvent.click(screen.getByText('Selecionar Película'));

    expect(screen.getByTestId('film-form-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Fechar FilmModal'));
    expect(screen.queryByTestId('film-form-modal')).not.toBeInTheDocument();
  });

  it('deve abrir o modal de edição diretamente pela ação da aba', () => {
    render(<CatalogView />);

    fireEvent.click(screen.getByText('Editar Vidro'));

    expect(screen.getByTestId('glass-form-modal')).toBeInTheDocument();
    expect(screen.getByText('GlassModal Vidro Temperado')).toBeInTheDocument();
  });

  it('deve abrir modal de detalhes e permitir fechar', () => {
    render(<CatalogView />);

    fireEvent.click(screen.getByText('Detalhes Vidro'));

    expect(screen.getByTestId('details-modal')).toBeInTheDocument();
    expect(screen.getByText('DetailsModal Vidro Temperado')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Fechar Detalhes'));
    expect(screen.queryByTestId('details-modal')).not.toBeInTheDocument();
  });

  it('deve abrir modal de edição ao clicar em Editar dentro do modal de detalhes', () => {
    render(<CatalogView />);

    fireEvent.click(screen.getByText('Detalhes Vidro'));
    expect(screen.getByTestId('details-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Editar nos Detalhes'));
    expect(screen.queryByTestId('details-modal')).not.toBeInTheDocument();
    expect(screen.getByTestId('glass-form-modal')).toBeInTheDocument();
  });

  it('deve repassar searchQuery e filterStatus para as abas', () => {
    render(<CatalogView />);

    fireEvent.change(screen.getByPlaceholderText('Buscar código ou insumo...'), {
      target: { value: 'Incolor' },
    });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'ACTIVE' } });

    expect(screen.getByTestId('glass-tab')).toHaveTextContent(
      'GlassTab (search: Incolor, status: ACTIVE'
    );
  });

  it('deve exibir alerta não bloqueante e acionar refetch quando a consulta de estoque falhar', () => {
    const refetchMock = vi.fn();
    vi.mocked(useStockBalances).mockReturnValue({
      data: undefined,
      isError: true,
      refetch: refetchMock,
    } as unknown as ReturnType<typeof useStockBalances>);

    render(<CatalogView />);

    expect(screen.getByTestId('stock-balance-error-banner')).toHaveTextContent(
      'Não foi possível carregar os saldos de estoque'
    );
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(refetchMock).toHaveBeenCalledTimes(1);
  });

  it('deve abrir a KardexDrawer pelo catálogo preservando filtros ativos e fechar ao clicar em X ou Esc', async () => {
    const listMovementsSpy = vi.spyOn(stockApi, 'listMovements').mockResolvedValueOnce([
      {
        id: 'mov-1',
        stockItemId: 'st-1',
        materialId: 'mat-g1',
        materialSku: 'VID-008',
        materialName: 'Vidro Temperado 8mm',
        unitMeasure: 'M2',
        type: 'PURCHASE_ENTRY',
        quantity: 12,
        previousPhysicalQuantity: 0,
        newPhysicalQuantity: 12,
        previousReservedQuantity: 0,
        newReservedQuantity: 0,
        referenceDocument: 'NF-500',
        createdAt: '2026-11-18T08:00:00Z',
      },
    ]);

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <CatalogView />
      </QueryClientProvider>
    );

    fireEvent.change(screen.getByPlaceholderText('Buscar código ou insumo...'), {
      target: { value: 'Temperado' },
    });

    fireEvent.click(screen.getByText('Extrato Kardex Vidro'));

    expect(screen.getByTestId('kardex-drawer')).toBeInTheDocument();
    expect(screen.getByTestId('kardex-material-sku')).toHaveTextContent('#VID-008');
    await waitFor(() => {
      expect(screen.getByTestId('kardex-timeline')).toHaveTextContent('NF-500');
    });
    expect(listMovementsSpy).toHaveBeenCalledWith('mat-g1');
    expect(screen.getByTestId('glass-tab')).toHaveTextContent('search: Temperado');

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByTestId('kardex-drawer')).not.toBeInTheDocument();
    expect(screen.getByTestId('glass-tab')).toHaveTextContent('search: Temperado');
  });
});
