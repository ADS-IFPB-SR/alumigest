import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { AppRoutes } from '../../App';
import { renderWithProviders } from '../../test/test-utils';

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
  Toaster: () => null,
}));

const { mockGlasses, mockStockItems } = vi.hoisted(() => ({
  mockGlasses: [
    {
      id: 'mat-g1',
      skuCode: 'VID-008',
      commercialReference: 'VID-008',
      name: 'Vidro Temperado 8mm',
      colorFinish: 'Incolor',
      thicknessMm: 8,
      unitMeasure: 'M2',
      salePrice: 220,
      costPrice: 120,
      active: true,
    },
    {
      id: 'mat-g2',
      skuCode: 'VID-010',
      commercialReference: 'VID-010',
      name: 'Vidro Fumê 10mm',
      colorFinish: 'Fumê',
      thicknessMm: 10,
      unitMeasure: 'M2',
      salePrice: 280,
      costPrice: 160,
      active: true,
    },
  ],
  mockStockItems: [
    {
      id: 'st-1',
      materialId: 'mat-g1',
      materialSku: 'VID-008',
      materialName: 'Vidro Temperado 8mm',
      category: 'GLASS',
      unitMeasure: 'M2',
      physicalQuantity: 2,
      reservedQuantity: 6,
      availableQuantity: -4,
      minimumStock: 3,
      alertStatus: 'NEED_PURCHASE',
    },
    {
      id: 'st-2',
      materialId: 'mat-g2',
      materialSku: 'VID-010',
      materialName: 'Vidro Fumê 10mm',
      category: 'GLASS',
      unitMeasure: 'M2',
      physicalQuantity: 15,
      reservedQuantity: 2,
      availableQuantity: 13,
      minimumStock: 3,
      alertStatus: 'IN_STOCK',
    },
  ],
}));

vi.mock('../../features/catalog/services/catalogApi', () => ({
  catalogApi: {
    getGlasses: vi.fn().mockResolvedValue({
      content: mockGlasses,
      totalElements: 2,
      totalPages: 1,
    }),
    getProfiles: vi.fn().mockResolvedValue({ content: [], totalElements: 0, totalPages: 1 }),
    getFilms: vi.fn().mockResolvedValue({ content: [], totalElements: 0, totalPages: 1 }),
    getHardwares: vi.fn().mockResolvedValue({ content: [], totalElements: 0, totalPages: 1 }),
    getProducts: vi.fn().mockResolvedValue({ content: [], totalElements: 0, totalPages: 1 }),
  },
}));

vi.mock('../../features/stock/api/stockApi', () => ({
  stockApi: {
    listBalances: vi.fn().mockResolvedValue(mockStockItems),
    getBalance: vi.fn(),
    listMovements: vi.fn().mockResolvedValue([]),
    registerMovement: vi.fn(),
    reserveForOrder: vi.fn(),
    consumeForOrder: vi.fn(),
    cancelReservationsForOrder: vi.fn(),
  },
}));

vi.mock('../../features/production/services/productionApi', () => ({
  productionApi: {
    getProductionOrders: vi.fn().mockResolvedValue([]),
    updateProductionStatus: vi.fn(),
  },
}));

vi.mock('../../features/orders/services/ordersApi', () => ({
  ordersApi: {
    getOrders: vi.fn().mockResolvedValue({ content: [], totalElements: 0, totalPages: 1 }),
    getOrderById: vi.fn().mockRejectedValue(new Error('Not found')),
  },
  orderApi: {
    getOrders: vi.fn().mockResolvedValue({ content: [], totalElements: 0, totalPages: 1 }),
    getOrderById: vi.fn().mockRejectedValue(new Error('Not found')),
  },
}));

vi.mock('../../features/budgets/services/budgetsApi', () => ({
  budgetsApi: {
    getBudgets: vi.fn().mockResolvedValue({ content: [], totalElements: 0, totalPages: 1 }),
    getStatusCounts: vi.fn().mockResolvedValue({}),
    getBudget: vi.fn().mockRejectedValue(new Error('Not found')),
    getWindowTemplates: vi.fn().mockResolvedValue([]),
  },
  extractFilenameFromContentDisposition: vi.fn((_, fallback: string) => fallback),
}));

vi.mock('../../features/customers/services/customersApi', () => ({
  customersApi: {
    getCustomers: vi.fn().mockResolvedValue({ content: [], totalElements: 0, totalPages: 0 }),
    createCustomer: vi.fn(),
  },
}));

describe('Roteamento Unificado /catalogo, Menu Lateral e Fluxo Kanban → Catálogo (US-22.4)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('deve renderizar a tela unificada de Catálogo & Almoxarifado na rota /catalogo com destaque no menu lateral', async () => {
    renderWithProviders(<AppRoutes />, { route: '/catalogo' });

    expect(
      await screen.findByRole('heading', { name: 'Catálogo de Materiais', level: 2 })
    ).toBeInTheDocument();
    expect(screen.getByTestId('catalog-unified-badge')).toHaveTextContent(
      'Almoxarifado & Kardex Integrados'
    );
    expect(screen.getByTestId('catalog-operation-guide-banner')).toBeInTheDocument();

    const sidebarLink = screen.getByRole('link', { name: /catálogo & estoque/i });
    expect(sidebarLink).toHaveAttribute('href', '/catalogo');
    expect(sidebarLink.className).toContain('bg-primary');
  });

  it('deve manter a rota raiz / funcional por retrocompatibilidade destacando Catálogo & Estoque', async () => {
    renderWithProviders(<AppRoutes />, { route: '/' });

    expect(
      await screen.findByRole('heading', { name: 'Catálogo de Materiais', level: 2 })
    ).toBeInTheDocument();

    const sidebarLink = screen.getByRole('link', { name: /catálogo & estoque/i });
    expect(sidebarLink.className).toContain('bg-primary');
  });

  it('deve redirecionar a rota legada /estoque para /catalogo preservando ?needsPurchase=true', async () => {
    renderWithProviders(<AppRoutes />, { route: '/estoque?needsPurchase=true' });

    expect(
      await screen.findByRole('heading', { name: 'Catálogo de Materiais', level: 2 })
    ).toBeInTheDocument();
    expect(screen.queryByText('Gestão de Estoque')).not.toBeInTheDocument();

    const needsPurchaseCheckbox = screen.getByLabelText(/Apenas com necessidade de compra/i);
    expect(needsPurchaseCheckbox).toBeChecked();

    await waitFor(() => {
      expect(screen.getAllByText('Vidro Temperado 8mm').length).toBeGreaterThan(0);
      expect(screen.queryByText('Vidro Fumê 10mm')).not.toBeInTheDocument();
    });
  });

  it('deve pré-ativar o filtro de compra quando acessado diretamente em /catalogo?needsPurchase=true', async () => {
    renderWithProviders(<AppRoutes />, { route: '/catalogo?needsPurchase=true' });

    expect(
      await screen.findByRole('heading', { name: 'Catálogo de Materiais', level: 2 })
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/Apenas com necessidade de compra/i)).toBeChecked();

    await waitFor(() => {
      expect(screen.getAllByText('Vidro Temperado 8mm').length).toBeGreaterThan(0);
      expect(screen.queryByText('Vidro Fumê 10mm')).not.toBeInTheDocument();
    });
  });

  it('deve navegar de /producao para /catalogo pelo atalho Catálogo & Estoque da Sidebar', async () => {
    renderWithProviders(<AppRoutes />, { route: '/producao' });

    expect(await screen.findByTestId('production-kanban-page')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('link', { name: /catálogo & estoque/i }));

    expect(
      await screen.findByRole('heading', { name: 'Catálogo de Materiais', level: 2 })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Apenas com necessidade de compra/i)).not.toBeChecked();
  });

  it('deve exibir faixa de avisos fabris no topo do Kanban e navegar para /catalogo?needsPurchase=true ao clicar no CTA', async () => {
    renderWithProviders(<AppRoutes />, { route: '/producao' });

    const alertBanner = await screen.findByTestId('kanban-stock-alert-banner');
    expect(alertBanner).toHaveTextContent('Alerta Fabril: 1 insumo em falta para produção');
    expect(alertBanner).toHaveTextContent('VID-008');

    fireEvent.click(screen.getByTestId('kanban-stock-alert-cta'));

    expect(
      await screen.findByRole('heading', { name: 'Catálogo de Materiais', level: 2 })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Apenas com necessidade de compra/i)).toBeChecked();
  });

  it('deve direcionar o botão de retorno da PlaceholderPage para /catalogo', async () => {
    renderWithProviders(<AppRoutes />, { route: '/dashboard' });

    const backLink = await screen.findByRole('link', { name: /Ir para Catálogo & Estoque/i });
    expect(backLink).toHaveAttribute('href', '/catalogo');

    fireEvent.click(backLink);

    expect(
      await screen.findByRole('heading', { name: 'Catálogo de Materiais', level: 2 })
    ).toBeInTheDocument();
  });
});
