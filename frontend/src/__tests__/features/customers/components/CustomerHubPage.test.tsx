import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { CustomerHubPage } from '../../../../features/customers/components/CustomerHubPage';
import * as customerHooks from '../../../../features/customers/hooks/useCustomers';
import { ordersApi } from '../../../../features/orders/services/ordersApi';
import { api } from '../../../../lib/api';

const mockDownloadLabelsMutate = vi.fn();

vi.mock('../../../../features/customers/hooks/useCustomers');
vi.mock('../../../../features/orders/services/ordersApi', () => ({
  ordersApi: {
    getOrderById: vi.fn(),
  },
}));
vi.mock('../../../../features/orders/hooks/useOrders', () => ({
  useOrder: vi.fn().mockReturnValue({ data: null, isLoading: false }),
  useDownloadLabelsPdf: vi.fn(() => ({
    mutate: mockDownloadLabelsMutate,
    isPending: false,
  })),
}));
vi.mock('../../../../lib/api', () => ({
  api: {
    get: vi.fn(),
  },
}));
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('CustomerHubPage', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const mockCustomersList = [
    {
      id: 'c1',
      nomeCompleto: 'Antônio Alfredo Figueiredo',
      personType: 'FISICA' as const,
      documento: '042.891.444-09',
      telefone: '(83) 98845-2100',
      bairro: 'Torre',
      cidade: 'João Pessoa',
      uf: 'PB',
      ativo: true,
    },
  ];

  const mockDashboard = {
    id: 'c1',
    nomeCompleto: 'Antônio Alfredo Figueiredo',
    personType: 'FISICA' as const,
    documento: '042.891.444-09',
    telefone: '(83) 98845-2100',
    email: 'antonio@email.com',
    bairro: 'Torre',
    cidade: 'João Pessoa',
    uf: 'PB',
    totalContratado: 4133.9,
    quantidadeOrdensServico: 4,
    quantidadeOrcamentos: 2,
  };

  const mockBudgets = [
    {
      id: 'b1',
      codigo: 'AORC-1024',
      dataCriacao: '2026-10-15T12:00:00Z',
      dataValidade: '2026-10-30T12:00:00Z',
      valorTotal: 2067.88,
      status: 'APPROVED' as const,
      statusDescricao: 'Aprovado',
    },
  ];

  const mockOrders = [
    {
      id: 'o1',
      codigo: 'OS-2026-0042',
      data: '2026-10-01',
      status: 'IN_PRODUCTION' as const,
      statusDescricao: 'Em Produção',
      valorTotal: 1800.0,
      totalEsquadrias: 1,
      items: [
        {
          id: 'i1',
          descricao: 'Janela de Correr 2 Folhas',
          larguraMm: 1200,
          alturaMm: 1400,
          quantidade: 1,
          corAluminio: 'Natural',
          tipoVidro: 'Mini Boreal',
          valorTotal: 1800.0,
        },
      ],
    },
  ];

  const mockFullOrder = {
    id: 'o1',
    codigo: 'OS-2026-0042',
    clienteNome: 'Antônio Alfredo Figueiredo',
    orcamentoId: 'b1',
    status: 'IN_PRODUCTION' as const,
    statusDescricao: 'Em Produção',
    canalAprovacao: 'WHATSAPP' as const,
    canalAprovacaoDescricao: 'WhatsApp',
    dataAprovacao: '2026-10-01T10:00:00Z',
    dataPrevisaoEntrega: '2026-10-15',
    dataConclusao: null,
    valorLiquido: 1800.0,
    valorBruto: 1800.0,
    valorDesconto: 0,
    taxaInstalacao: 0,
    taxaFrete: 0,
    quantidadeItens: 1,
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: '2026-10-01T10:00:00Z',
    ativo: true,
    items: [
      {
        id: 'i1',
        orderId: 'o1',
        descricao: 'Janela de Correr 2 Folhas',
        larguraMm: 1200,
        alturaMm: 1400,
        quantidade: 1,
        valorUnitario: 1800.0,
        valorTotal: 1800.0,
        ordem: 1,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(customerHooks, 'useCustomers').mockReturnValue({
      data: {
        content: mockCustomersList,
        page: { size: 50, number: 0, totalElements: 1, totalPages: 1 },
      },
      isLoading: false,
    } as any);

    vi.spyOn(customerHooks, 'useCustomerDashboard').mockReturnValue({
      data: mockDashboard,
      isLoading: false,
      isError: false,
    } as any);

    vi.spyOn(customerHooks, 'useCustomerBudgets').mockReturnValue({
      data: {
        content: mockBudgets,
        page: { size: 10, number: 0, totalElements: 1, totalPages: 1 },
      },
      isLoading: false,
    } as any);

    vi.spyOn(customerHooks, 'useCustomerOrders').mockReturnValue({
      data: mockOrders,
      isLoading: false,
    } as any);

    vi.spyOn(customerHooks, 'useCustomer').mockReturnValue({
      data: mockDashboard,
      isLoading: false,
      isError: false,
    } as any);

    vi.spyOn(customerHooks, 'useUpdateCustomer').mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);
  });

  it('deve renderizar a tela Hub 360 integrada com sidebar, hero, KPIs e aba orçamentos', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/clientes?id=c1']}>
          <CustomerHubPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Header do módulo
    expect(screen.getByText('Central 360° do Cliente')).toBeInTheDocument();

    // Sidebar
    expect(screen.getByText('Clientes')).toBeInTheDocument();

    // Hero Card
    expect(screen.getByText('Antônio Alfredo Figueiredo', { selector: 'h1' })).toBeInTheDocument();

    // KPIs
    expect(screen.getByText('Total Contratado')).toBeInTheDocument();
    expect(screen.getByText('4 O.S.')).toBeInTheDocument();
    expect(screen.getByText('2 Propostas')).toBeInTheDocument();

    // Orçamentos
    expect(screen.getByText('AORC-1024')).toBeInTheDocument();
  });

  it('deve alternar para aba de Ordens de Serviço ao clicar na aba', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/clientes?id=c1']}>
          <CustomerHubPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    const osTabButton = screen.getByRole('button', { name: /Ordens de Serviço \(O\.S\.\)/i });
    fireEvent.click(osTabButton);

    expect(screen.getByText('OS-2026-0042')).toBeInTheDocument();
    expect(screen.getByText('Em Produção')).toBeInTheDocument();
  });

  it('deve abrir o ThermalLabelModal ao clicar em Etiquetas da O.S. e permitir fechar o modal [US-47.4]', async () => {
    vi.mocked(ordersApi.getOrderById).mockResolvedValue(mockFullOrder as any);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/clientes?id=c1']}>
          <CustomerHubPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Alterna para a aba de Ordens de Serviço
    const osTabButton = screen.getByRole('button', { name: /Ordens de Serviço \(O\.S\.\)/i });
    fireEvent.click(osTabButton);

    expect(screen.getByText('OS-2026-0042')).toBeInTheDocument();

    // Abre o drawer de esquadrias
    fireEvent.click(screen.getByRole('button', { name: /Ver peças da O\.S\. OS-2026-0042/i }));

    // Clica no botão de Etiquetas no cartão da O.S.
    const labelButton = screen.getByRole('button', { name: /Etiquetas da O\.S\. OS-2026-0042/i });
    fireEvent.click(labelButton);

    await waitFor(() => {
      expect(ordersApi.getOrderById).toHaveBeenCalledWith('o1');
    });

    // Deve abrir o ThermalLabelModal
    const modal = await screen.findByTestId('thermal-label-modal');
    expect(modal).toBeInTheDocument();
    expect(screen.getByText(/Conferência e Impressão de Etiquetas Térmicas/i)).toBeInTheDocument();

    // Clica para baixar etiquetas dentro do modal
    const downloadPdfBtn = screen.getByTestId('btn-modal-download-pdf');
    fireEvent.click(downloadPdfBtn);
    expect(mockDownloadLabelsMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'o1',
        codigo: 'OS-2026-0042',
      })
    );

    // Fecha o modal
    const closeBtn = screen.getByTestId('btn-close-thermal-modal');
    fireEvent.click(closeBtn);
    expect(screen.queryByTestId('thermal-label-modal')).not.toBeInTheDocument();
  });

  describe('Download de Ficha Técnica via Blob (US-47.3)', () => {
    beforeEach(() => {
      window.URL.createObjectURL = vi.fn(() => 'blob:http://localhost/mock-pdf');
      window.URL.revokeObjectURL = vi.fn();
    });

    it('deve baixar Ficha Técnica via api.get com responseType blob ao clicar no botão', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: new Blob(['pdf'], { type: 'application/pdf' }) });

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/clientes?id=c1']}>
            <CustomerHubPage />
          </MemoryRouter>
        </QueryClientProvider>
      );

      fireEvent.click(screen.getByRole('button', { name: /Ordens de Serviço \(O\.S\.\)/i }));
      fireEvent.click(screen.getByRole('button', { name: /Ver peças da O\.S\. OS-2026-0042/i }));
      fireEvent.click(screen.getByRole('button', { name: /Ficha técnica da O\.S\. OS-2026-0042/i }));

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/orders/o1/production-sheet/pdf', {
          responseType: 'blob',
        });
      });
      expect(toast.success).toHaveBeenCalledWith('Ficha Técnica baixada com sucesso!');
    });

    it('deve exibir toast de erro quando o download da Ficha Técnica falhar', async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error('Network error'));

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/clientes?id=c1']}>
            <CustomerHubPage />
          </MemoryRouter>
        </QueryClientProvider>
      );

      fireEvent.click(screen.getByRole('button', { name: /Ordens de Serviço \(O\.S\.\)/i }));
      fireEvent.click(screen.getByRole('button', { name: /Ver peças da O\.S\. OS-2026-0042/i }));
      fireEvent.click(screen.getByRole('button', { name: /Ficha técnica da O\.S\. OS-2026-0042/i }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Erro ao transferir a ficha técnica.');
      });
    });
  });
});
