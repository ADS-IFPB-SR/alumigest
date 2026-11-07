import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { CustomerHubPage } from '../../../../features/customers/components/CustomerHubPage';
import * as customerHooks from '../../../../features/customers/hooks/useCustomers';
import { api } from '../../../../lib/api';

vi.mock('../../../../features/customers/hooks/useCustomers');
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

  describe('Download de PDF via Blob (Ficha Técnica e Etiquetas)', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      window.URL.createObjectURL = vi.fn(() => 'blob:http://localhost/mock-pdf');
      window.URL.revokeObjectURL = vi.fn();

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
      fireEvent.click(screen.getByRole('button', { name: /Ficha técnica da O\.S\. OS-2026-0042/i }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Erro ao transferir a ficha técnica.');
      });
    });

    it('deve baixar Etiquetas via api.get com responseType blob ao clicar no botão', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: new Blob(['pdf'], { type: 'application/pdf' }) });

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/clientes?id=c1']}>
            <CustomerHubPage />
          </MemoryRouter>
        </QueryClientProvider>
      );

      fireEvent.click(screen.getByRole('button', { name: /Ordens de Serviço \(O\.S\.\)/i }));
      fireEvent.click(screen.getByRole('button', { name: /Etiquetas da O\.S\. OS-2026-0042/i }));

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/orders/o1/labels-pdf', {
          responseType: 'blob',
        });
      });
      expect(toast.success).toHaveBeenCalledWith('Etiquetas baixadas com sucesso!');
    });

    it('deve exibir toast de erro quando o download de Etiquetas falhar', async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error('Network error'));

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/clientes?id=c1']}>
            <CustomerHubPage />
          </MemoryRouter>
        </QueryClientProvider>
      );

      fireEvent.click(screen.getByRole('button', { name: /Ordens de Serviço \(O\.S\.\)/i }));
      fireEvent.click(screen.getByRole('button', { name: /Etiquetas da O\.S\. OS-2026-0042/i }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Erro ao transferir as etiquetas.');
      });
    });
  });
});
