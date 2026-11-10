import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CustomerHeroCard } from '../../../../features/customers/components/CustomerHeroCard';
import { formatWhatsAppLink } from '../../../../features/customers/utils/customerHubUtils';
import type { ClientDashboardDTO } from '../../../../features/customers/services/customersApi';
import * as customerHooks from '../../../../features/customers/hooks/useCustomers';

vi.mock('../../../../features/customers/hooks/useCustomers');

describe('CustomerHeroCard', () => {
  const queryClient = new QueryClient();

  const mockCustomer: ClientDashboardDTO = {
    id: 'c1',
    nomeCompleto: 'Antônio Alfredo Figueiredo',
    personType: 'FISICA',
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

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(customerHooks, 'useCustomer').mockReturnValue({
      data: mockCustomer,
      isLoading: false,
      isError: false,
    } as any);

    vi.spyOn(customerHooks, 'useUpdateCustomer').mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);
  });

  it('deve gerar link do WhatsApp sanitizado corretamente', () => {
    const link = formatWhatsAppLink('(83) 98845-2100', 'Antônio');
    expect(link).toContain('https://wa.me/5583988452100');
    expect(link).toContain(encodeURIComponent('Olá Antônio, tudo bem?'));
  });

  it('deve renderizar dados do cliente e botões de ação', () => {
    const handleNewBudget = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <CustomerHeroCard customer={mockCustomer} onNewBudget={handleNewBudget} />
      </QueryClientProvider>
    );

    expect(screen.getByText('Antônio Alfredo Figueiredo')).toBeInTheDocument();
    expect(screen.getByText('PF')).toBeInTheDocument();
    expect(screen.getByText(/Torre, João Pessoa - PB/i)).toBeInTheDocument();
    expect(screen.getByText('(83) 98845-2100')).toBeInTheDocument();
    expect(screen.getByText('042.891.444-09')).toBeInTheDocument();

    const newBudgetBtn = screen.getByRole('button', { name: /Novo Orçamento/i });
    expect(newBudgetBtn).toBeInTheDocument();
    fireEvent.click(newBudgetBtn);

    expect(handleNewBudget).toHaveBeenCalledWith('c1');
  });

  it('deve desabilitar link do WhatsApp caso cliente não possua telefone válido', () => {
    const customerWithoutPhone: ClientDashboardDTO = {
      ...mockCustomer,
      telefone: undefined,
    };

    render(
      <QueryClientProvider client={queryClient}>
        <CustomerHeroCard customer={customerWithoutPhone} onNewBudget={vi.fn()} />
      </QueryClientProvider>
    );

    const whatsappLink = screen.getByLabelText(/Contatar cliente via WhatsApp/i);
    expect(whatsappLink).toHaveClass('cursor-not-allowed');
  });

  it('deve abrir o modal de edição ao clicar no botão Editar', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <CustomerHeroCard customer={mockCustomer} onNewBudget={vi.fn()} />
      </QueryClientProvider>
    );

    const editButton = screen.getByRole('button', { name: /Editar/i });
    expect(editButton).toBeInTheDocument();
    fireEvent.click(editButton);

    expect(screen.getByText('Editar Cliente')).toBeInTheDocument();
  });
});
