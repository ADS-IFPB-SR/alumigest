// frontend/src/__tests__/pages/PartSaleListPage.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PartSaleListPage } from '../../pages/PartSaleListPage';
import * as usePartSalesModule from '../../features/part-sales/hooks/usePartSales';
import { partSaleApi, type PartSaleResponse } from '../../features/part-sales';

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));
vi.mock('../../features/part-sales/hooks/usePartSales');

const mockPartSales: PartSaleResponse[] = [
  {
    id: 'sale-uuid-1',
    code: 'VP-2026-0001',
    clientId: 'client-1',
    clientName: 'Vidraçaria Esperança Ltda',
    status: 'APPROVED',
    subtotalAmount: 450,
    discountAmount: 50,
    totalAmount: 400,
    items: [
      {
        id: 'item-1',
        materialType: 'GLASS',
        materialId: 'mat-glass-1',
        description: 'Vidro Temperado Incolor 8mm',
        quantity: 2,
        widthMm: 1200,
        heightMm: 800,
        calculatedUnitMeasure: 1.92,
        unitPrice: 150,
        totalPrice: 300,
      },
      {
        id: 'item-2',
        materialType: 'PROFILE',
        materialId: 'mat-prof-1',
        description: 'Perfil Tubular 40x40 Alumínio Branco',
        quantity: 1,
        widthMm: null,
        heightMm: 3000,
        calculatedUnitMeasure: 3.0,
        unitPrice: 50,
        totalPrice: 150,
      },
    ],
    createdAt: '2026-10-15T14:30:00Z',
    updatedAt: '2026-10-15T14:30:00Z',
  },
  {
    id: 'sale-uuid-2',
    code: 'VP-2026-0002',
    clientId: 'client-2',
    clientName: 'Cliente Balcão - João Silva',
    status: 'DRAFT',
    subtotalAmount: 180,
    discountAmount: 0,
    totalAmount: 180,
    items: [
      {
        id: 'item-3',
        materialType: 'HARDWARE',
        materialId: 'mat-hard-1',
        description: 'Puxador H Inox 300mm',
        quantity: 2,
        widthMm: null,
        heightMm: null,
        calculatedUnitMeasure: 2,
        unitPrice: 90,
        totalPrice: 180,
      },
    ],
    createdAt: '2026-10-18T09:15:00Z',
    updatedAt: '2026-10-18T09:15:00Z',
  },
];

describe('PartSaleListPage — [US-46] Listagem Canônica de Vendas Avulsas de Partes', () => {
  const mockMutateAsync = vi.fn().mockResolvedValue({ id: 'sale-uuid-2', status: 'CANCELLED' });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(usePartSalesModule, 'useUpdatePartSaleStatus').mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as any);
  });

  it('deve exibir indicador de carregamento quando isLoading for true', () => {
    vi.spyOn(usePartSalesModule, 'usePartSalesList').mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      isFetching: false,
    } as any);

    render(
      <MemoryRouter>
        <PartSaleListPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Carregando vendas avulsas\.\.\./i)).toBeInTheDocument();
  });

  it('deve exibir mensagem de erro quando isError for true', () => {
    vi.spyOn(usePartSalesModule, 'usePartSalesList').mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      isFetching: false,
    } as any);

    render(
      <MemoryRouter>
        <PartSaleListPage />
      </MemoryRouter>
    );

    expect(
      screen.getByText(/Erro ao carregar a lista de vendas avulsas/i)
    ).toBeInTheDocument();
  });

  it('deve exibir estado vazio e botão de Nova Venda quando não houver dados', () => {
    vi.spyOn(usePartSalesModule, 'usePartSalesList').mockReturnValue({
      data: {
        content: [],
        totalElements: 0,
        totalPages: 0,
      },
      isLoading: false,
      isError: false,
      isFetching: false,
    } as any);

    render(
      <MemoryRouter>
        <PartSaleListPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Nenhuma venda avulsa encontrada/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Nova Venda Avulsa/i).length).toBeGreaterThan(0);
  });

  it('deve renderizar tabela de vendas com colunas, valores e badges corretos', () => {
    vi.spyOn(usePartSalesModule, 'usePartSalesList').mockReturnValue({
      data: {
        content: mockPartSales,
        totalElements: 2,
        totalPages: 1,
      },
      isLoading: false,
      isError: false,
      isFetching: false,
    } as any);

    render(
      <MemoryRouter>
        <PartSaleListPage />
      </MemoryRouter>
    );

    // Códigos das vendas
    expect(screen.getByText('VP-2026-0001')).toBeInTheDocument();
    expect(screen.getByText('VP-2026-0002')).toBeInTheDocument();

    // Nomes dos clientes
    expect(screen.getByText('Vidraçaria Esperança Ltda')).toBeInTheDocument();
    expect(screen.getByText('Cliente Balcão - João Silva')).toBeInTheDocument();

    // Chips de resumo de categoria
    expect(screen.getByText(/2x Vidro/i)).toBeInTheDocument();
    expect(screen.getByText(/1x Alumínio/i)).toBeInTheDocument();
    expect(screen.getByText(/2x Ferragem/i)).toBeInTheDocument();

    // Badges de status
    expect(screen.getByText('Concluída')).toBeInTheDocument();
    expect(screen.getByText('Rascunho / Orçamento')).toBeInTheDocument();

    // Contador no topo
    expect(screen.getByText((_, el) => el?.textContent === 'Total: 2 vendas avulsas')).toBeInTheDocument();
  });

  it('deve exibir destaque (highlight) e aviso quando recentId estiver presente na URL', () => {
    vi.spyOn(usePartSalesModule, 'usePartSalesList').mockReturnValue({
      data: {
        content: mockPartSales,
        totalElements: 2,
        totalPages: 1,
      },
      isLoading: false,
      isError: false,
      isFetching: false,
    } as any);

    render(
      <MemoryRouter initialEntries={['/vendas/avulsa?recentId=sale-uuid-1']}>
        <PartSaleListPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Venda registrada com sucesso!/i)).toBeInTheDocument();
    expect(screen.getByText('Novo')).toBeInTheDocument();
  });

  it('deve abrir modal de detalhes da venda ao clicar no código ou no botão Ver', async () => {
    vi.spyOn(usePartSalesModule, 'usePartSalesList').mockReturnValue({
      data: {
        content: mockPartSales,
        totalElements: 2,
        totalPages: 1,
      },
      isLoading: false,
      isError: false,
      isFetching: false,
    } as any);

    render(
      <MemoryRouter>
        <PartSaleListPage />
      </MemoryRouter>
    );

    const viewButtons = screen.getAllByRole('button', { name: /ver/i });
    fireEvent.click(viewButtons[0]);

    expect(screen.getByTestId('modal-details-part-sale')).toBeInTheDocument();
    expect(screen.getByText('Detalhes da Venda VP-2026-0001')).toBeInTheDocument();
    expect(screen.getByText('Vidro Temperado Incolor 8mm')).toBeInTheDocument();
    expect(screen.getByText('Perfil Tubular 40x40 Alumínio Branco')).toBeInTheDocument();

    // Fechar modal
    fireEvent.click(screen.getByTestId('btn-close-details-modal'));
    await waitFor(() => {
      expect(screen.queryByTestId('modal-details-part-sale')).not.toBeInTheDocument();
    });
  });

  it('deve abrir e fechar modal de PDF ao clicar no botão de documento', async () => {
    vi.spyOn(usePartSalesModule, 'usePartSalesList').mockReturnValue({
      data: {
        content: mockPartSales,
        totalElements: 2,
        totalPages: 1,
      },
      isLoading: false,
      isError: false,
      isFetching: false,
    } as any);

    render(
      <MemoryRouter>
        <PartSaleListPage />
      </MemoryRouter>
    );

    const pdfBtn = screen.getByRole('button', { name: /imprimir pdf da venda vp-2026-0001/i });
    fireEvent.click(pdfBtn);

    expect(screen.getByTestId('modal-pdf-part-sale')).toBeInTheDocument();
    expect(screen.getByText('Espelho de Venda Avulsa / Impressão PDF')).toBeInTheDocument();
    expect(screen.getByTestId('btn-download-pdf-official')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('btn-close-pdf-modal'));
    await waitFor(() => {
      expect(screen.queryByTestId('modal-pdf-part-sale')).not.toBeInTheDocument();
    });
  });

  it('deve abrir e fechar modal de etiquetas térmicas Elgin L42', async () => {
    vi.spyOn(usePartSalesModule, 'usePartSalesList').mockReturnValue({
      data: {
        content: mockPartSales,
        totalElements: 2,
        totalPages: 1,
      },
      isLoading: false,
      isError: false,
      isFetching: false,
    } as any);

    render(
      <MemoryRouter>
        <PartSaleListPage />
      </MemoryRouter>
    );

    const labelBtn = screen.getByRole('button', { name: /emitir etiquetas elgin da venda vp-2026-0001/i });
    fireEvent.click(labelBtn);

    expect(screen.getByTestId('modal-thermal-labels')).toBeInTheDocument();
    expect(screen.getByText(/Etiquetas Térmicas Elgin L42 \(100×60mm\)/i)).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('btn-close-labels-modal'));
    await waitFor(() => {
      expect(screen.queryByTestId('modal-thermal-labels')).not.toBeInTheDocument();
    });
  });

  it('deve abrir diálogo de confirmação de cancelamento e disparar mutação com sucesso', async () => {
    vi.spyOn(usePartSalesModule, 'usePartSalesList').mockReturnValue({
      data: {
        content: mockPartSales,
        totalElements: 2,
        totalPages: 1,
      },
      isLoading: false,
      isError: false,
      isFetching: false,
    } as any);

    render(
      <MemoryRouter>
        <PartSaleListPage />
      </MemoryRouter>
    );

    const cancelBtn = screen.getByRole('button', { name: /cancelar venda vp-2026-0001/i });
    fireEvent.click(cancelBtn);

    expect(screen.getByTestId('modal-cancel-sale')).toBeInTheDocument();
    expect(screen.getByText(/Tem certeza de que deseja cancelar a venda/i)).toBeInTheDocument();

    const confirmBtn = screen.getByTestId('btn-confirm-cancel-sale');
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        id: 'sale-uuid-1',
        status: 'CANCELLED',
      });
    });
  });

  it('deve filtrar por status ao selecionar opção no dropdown', () => {
    const listSpy = vi.spyOn(usePartSalesModule, 'usePartSalesList').mockReturnValue({
      data: { content: [], totalElements: 0, totalPages: 0 },
      isLoading: false,
      isError: false,
      isFetching: false,
    } as any);

    render(
      <MemoryRouter>
        <PartSaleListPage />
      </MemoryRouter>
    );

    const select = screen.getByTestId('select-status-filter');
    fireEvent.change(select, { target: { value: 'APPROVED' } });

    expect(listSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'APPROVED',
      })
    );
  });

  it('deve aplicar debounce de 500ms na busca textual', async () => {
    const listSpy = vi.spyOn(usePartSalesModule, 'usePartSalesList').mockReturnValue({
      data: { content: [], totalElements: 0, totalPages: 0 },
      isLoading: false,
      isError: false,
      isFetching: false,
    } as any);

    render(
      <MemoryRouter>
        <PartSaleListPage />
      </MemoryRouter>
    );

    const input = screen.getByTestId('input-search-part-sales');
    fireEvent.change(input, { target: { value: 'VP-2026-0005' } });

    await waitFor(
      () => {
        expect(listSpy).toHaveBeenLastCalledWith(
          expect.objectContaining({
            search: 'VP-2026-0005',
            page: 0,
          })
        );
      },
      { timeout: 1000 }
    );
  });

  it('deve baixar o PDF A4 oficial pelo modal da listagem e exibir feedback de sucesso', async () => {
    vi.spyOn(usePartSalesModule, 'usePartSalesList').mockReturnValue({
      data: {
        content: mockPartSales,
        totalElements: 2,
        totalPages: 1,
      },
      isLoading: false,
      isError: false,
      isFetching: false,
    } as any);
    const downloadSpy = vi.spyOn(partSaleApi, 'downloadPdf').mockResolvedValueOnce(undefined);

    render(
      <MemoryRouter>
        <PartSaleListPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /imprimir pdf da venda vp-2026-0001/i }));
    fireEvent.click(screen.getByTestId('btn-download-pdf-official'));

    await waitFor(() => {
      expect(downloadSpy).toHaveBeenCalledWith('sale-uuid-1', 'VP-2026-0001');
      expect(toast.success).toHaveBeenCalledWith('Download do PDF A4 iniciado com sucesso!');
    });

    downloadSpy.mockRestore();
  });

  it('deve exibir toast de erro quando o download do PDF oficial falhar', async () => {
    vi.spyOn(usePartSalesModule, 'usePartSalesList').mockReturnValue({
      data: {
        content: mockPartSales,
        totalElements: 2,
        totalPages: 1,
      },
      isLoading: false,
      isError: false,
      isFetching: false,
    } as any);
    const downloadSpy = vi
      .spyOn(partSaleApi, 'downloadPdf')
      .mockRejectedValueOnce(new Error('Erro 500'));

    render(
      <MemoryRouter>
        <PartSaleListPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /imprimir pdf da venda vp-2026-0001/i }));
    fireEvent.click(screen.getByTestId('btn-download-pdf-official'));

    await waitFor(() => {
      expect(downloadSpy).toHaveBeenCalledWith('sale-uuid-1', 'VP-2026-0001');
      expect(toast.error).toHaveBeenCalledWith('Erro ao gerar/baixar PDF da venda avulsa.');
    });

    expect(screen.getByTestId('btn-download-pdf-official')).not.toBeDisabled();
    downloadSpy.mockRestore();
  });
});
