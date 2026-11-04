import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CustomerBudgetsTab } from '../../../../features/customers/components/CustomerBudgetsTab';
import {
  formatDate,
  buildBudgetWhatsAppLink,
} from '../../../../features/customers/utils/customerHubUtils';
import { ClientBudgetSummaryDTO } from '../../../../features/customers/services/customersApi';

describe('CustomerBudgetsTab', () => {
  const mockBudgets: ClientBudgetSummaryDTO[] = [
    {
      id: 'b1',
      codigo: 'AORC-1024',
      dataCriacao: '2026-10-15T12:00:00Z',
      dataValidade: '2026-10-30T12:00:00Z',
      valorTotal: 2067.88,
      status: 'APPROVED',
      statusDescricao: 'Aprovado',
    },
    {
      id: 'b2',
      codigo: 'AORC-1030',
      dataCriacao: '2026-10-20T12:00:00Z',
      dataValidade: '2026-11-05T12:00:00Z',
      valorTotal: 3450.0,
      status: 'SENT',
      statusDescricao: 'Enviado',
    },
  ];

  it('deve formatar data no padrão pt-BR', () => {
    expect(formatDate('2026-10-15T12:00:00Z')).toBe('15/10/2026');
    expect(formatDate(undefined)).toBe('-');
  });

  it('deve gerar link do WhatsApp para envio do orçamento', () => {
    const link = buildBudgetWhatsAppLink('(83) 98845-2100', 'Antônio', 'AORC-1024', 2067.88);
    expect(link).toContain('https://wa.me/5583988452100');
    expect(link).toContain(encodeURIComponent('AORC-1024'));
  });

  it('deve renderizar a tabela com os orçamentos e badges de status', () => {
    const handleViewPdf = vi.fn();

    render(
      <CustomerBudgetsTab
        budgets={mockBudgets}
        clientPhone="(83) 98845-2100"
        clientName="Antônio"
        onViewPdf={handleViewPdf}
      />
    );

    expect(screen.getByText('AORC-1024')).toBeInTheDocument();
    expect(screen.getByText('AORC-1030')).toBeInTheDocument();
    expect(screen.getByText('Aprovado')).toBeInTheDocument();
    expect(screen.getByText('Enviado')).toBeInTheDocument();
    expect(screen.getByText(/2\.067,88/)).toBeInTheDocument();
    expect(screen.getByText(/3\.450,00/)).toBeInTheDocument();

    const pdfButtons = screen.getAllByRole('button', { name: /proposta em pdf/i });
    expect(pdfButtons).toHaveLength(2);
    fireEvent.click(pdfButtons[0]);

    expect(handleViewPdf).toHaveBeenCalledWith('b1');
  });

  it('deve renderizar estado vazio quando não houver orçamentos', () => {
    render(<CustomerBudgetsTab budgets={[]} />);

    expect(
      screen.getByText('Nenhum orçamento vinculado a este cliente')
    ).toBeInTheDocument();
  });
});
