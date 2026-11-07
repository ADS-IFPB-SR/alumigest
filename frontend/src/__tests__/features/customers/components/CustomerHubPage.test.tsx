import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CustomerHubPage } from '../../../../features/customers/components/CustomerHubPage';
import * as customerHooks from '../../../../features/customers/hooks/useCustomers';

vi.mock('../../../../features/customers/hooks/useCustomers');

describe('CustomerHubPage', () => {
  const queryClient = new QueryClient();

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

    // Mocks adicionados para o EditCustomerModal não quebrar o render do Hub
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

    expect(screen.getByText(/Módulo de Ordens de Serviço \(O\.S\.\)/i)).toBeInTheDocument();
    expect(screen.getByText(/US-47\.2/i)).toBeInTheDocument();
  });
});