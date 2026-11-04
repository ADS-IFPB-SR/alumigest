import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CustomerKpiGrid } from '../../../../features/customers/components/CustomerKpiGrid';
import { formatCurrency } from '../../../../features/customers/utils/customerHubUtils';

describe('CustomerKpiGrid', () => {
  it('deve formatar valor monetário em Real', () => {
    const formatted = formatCurrency(4133.9);
    expect(formatted).toContain('4.133,90');
  });

  it('deve renderizar os 3 cartões de indicadores corretamente', () => {
    render(
      <CustomerKpiGrid
        totalContratado={4133.9}
        quantidadeOrdensServico={4}
        quantidadeOrcamentos={2}
      />
    );

    expect(screen.getByText('Total Contratado')).toBeInTheDocument();
    expect(screen.getByText('Ordens de Serviço')).toBeInTheDocument();
    expect(screen.getByText('Orçamentos Vinculados')).toBeInTheDocument();

    expect(screen.getByText(/4\.133,90/)).toBeInTheDocument();
    expect(screen.getByText('4 O.S.')).toBeInTheDocument();
    expect(screen.getByText('2 Propostas')).toBeInTheDocument();
  });

  it('deve exibir singular quando houver 1 proposta', () => {
    render(
      <CustomerKpiGrid
        totalContratado={0}
        quantidadeOrdensServico={1}
        quantidadeOrcamentos={1}
      />
    );

    expect(screen.getByText('1 Proposta')).toBeInTheDocument();
    expect(screen.getByText('1 O.S.')).toBeInTheDocument();
  });
});
