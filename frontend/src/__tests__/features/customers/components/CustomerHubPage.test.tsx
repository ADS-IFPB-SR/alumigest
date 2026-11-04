import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CustomerHubPage } from '../../../../features/customers/components/CustomerHubPage';
import * as customerHooks from '../../../../features/customers/hooks/useCustomers';
import { ordersApi } from '../../../../features/orders/services/ordersApi';

vi.mock('../../../../features/customers/hooks/useCustomers');
vi.mock('../../../../features/orders/services/ordersApi', () => ({
  ordersApi: {
    getOrderById: vi.fn(),
  },
}));

vi.mock('../../../../features/orders/hooks/useOrders', () => ({
  useOrder: vi.fn().mockReturnValue({ data: null, isLoading: false }),
  useDownloadLabelsPdf: vi.fn().mockReturnValue({ mutate: vi.fn(), isPending: false }),
}));

describe('CustomerHubPage', () => {
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
      id: 'ord-1',
      codigo: 'OS-2026-0001',
      orcamentoId: 'b1',
      status: 'WAITING_PRODUCTION' as const,
      statusDescricao: 'Aguardando Produção',
      canalAprovacao: 'WHATSAPP' as const,
      canalAprovacaoDescricao: 'WhatsApp',
      dataAprovacao: '2026-11-01',
      dataPrevisaoEntrega: '2026-11-15',
      dataConclusao: null,
      valorLiquido: 4133.9,
      quantidadeItens: 4,
      createdAt: '2026-11-01T10:00:00Z',
    },
  ];

  const mockFullOrder = {
    ...mockOrders[0],
    clienteNome: 'Antônio Alfredo Figueiredo',
    valorBruto: 4133.9,
    valorDesconto: 0,
    taxaInstalacao: 0,
    taxaFrete: 0,
    updatedAt: '2026-11-01T10:00:00Z',
    ativo: true,
    items: [
      {
        id: 'item-1',
        orderId: 'ord-1',
        descricao: 'Porta de Giro 1 Folha',
        larguraMm: 350,
        alturaMm: 1470,
        quantidade: 1,
        valorUnitario: 100,
        valorTotal: 100,
        ordem: 1,
      },
    ],
  };

  it('deve renderizar a tela Hub 360 integrada com sidebar, hero, KPIs e aba orçamentos', () => {
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
      data: {
        content: mockOrders,
        page: { size: 10, number: 0, totalElements: 1, totalPages: 1 },
      },
      isLoading: false,
    } as any);

    render(
      <MemoryRouter initialEntries={['/clientes?id=c1']}>
        <CustomerHubPage />
      </MemoryRouter>
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

  it('deve alternar para aba de Ordens de Serviço ao clicar na aba e abrir o ThermalLabelModal ao clicar em Etiquetas [US-47.4]', async () => {
    vi.mocked(ordersApi.getOrderById).mockResolvedValue(mockFullOrder as any);

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
      data: {
        content: mockOrders,
        page: { size: 10, number: 0, totalElements: 1, totalPages: 1 },
      },
      isLoading: false,
    } as any);

    render(
      <MemoryRouter initialEntries={['/clientes?id=c1']}>
        <CustomerHubPage />
      </MemoryRouter>
    );

    const osTabButton = screen.getByRole('button', { name: /Ordens de Serviço \(O\.S\.\)/i });
    fireEvent.click(osTabButton);

    // Tabela de O.S. renderizada
    expect(screen.getAllByText('#OS-2026-0001').length).toBeGreaterThan(0);
    expect(screen.getByText('Aguardando Produção')).toBeInTheDocument();

    // Clica no botão de Etiquetas
    const labelButton = screen.getByTestId('btn-open-labels-modal');
    fireEvent.click(labelButton);

    // Deve abrir o modal de etiquetas térmicas homologado
    const modal = await screen.findByTestId('thermal-label-modal');
    expect(modal).toBeInTheDocument();

    // Fecha o modal e confirma que o cliente continua ativo
    const closeBtn = screen.getByTestId('btn-close-thermal-modal');
    fireEvent.click(closeBtn);
    expect(screen.queryByTestId('thermal-label-modal')).not.toBeInTheDocument();
    expect(screen.getByText('Antônio Alfredo Figueiredo', { selector: 'h1' })).toBeInTheDocument();
  });
});
