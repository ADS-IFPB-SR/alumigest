import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CustomerHeroCard } from '../../../../features/customers/components/CustomerHeroCard';
import { formatWhatsAppLink } from '../../../../features/customers/utils/customerHubUtils';
import { ClientDashboardDTO } from '../../../../features/customers/services/customersApi';

describe('CustomerHeroCard', () => {
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

  it('deve gerar link do WhatsApp sanitizado corretamente', () => {
    const link = formatWhatsAppLink('(83) 98845-2100', 'Antônio');
    expect(link).toContain('https://wa.me/5583988452100');
    expect(link).toContain(encodeURIComponent('Olá Antônio, tudo bem?'));
  });

  it('deve renderizar dados do cliente e botões de ação', () => {
    const handleNewBudget = vi.fn();

    render(<CustomerHeroCard customer={mockCustomer} onNewBudget={handleNewBudget} />);

    expect(screen.getByText('Antônio Alfredo Figueiredo')).toBeInTheDocument();
    expect(screen.getByText('PF')).toBeInTheDocument();
    expect(screen.getByText('Torre • João Pessoa - PB')).toBeInTheDocument();
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

    render(<CustomerHeroCard customer={customerWithoutPhone} onNewBudget={vi.fn()} />);

    const whatsappLink = screen.getByLabelText(/Contatar cliente via WhatsApp/i);
    expect(whatsappLink).toHaveClass('cursor-not-allowed');
  });
});
