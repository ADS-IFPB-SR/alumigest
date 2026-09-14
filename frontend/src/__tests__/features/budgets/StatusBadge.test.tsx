import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { StatusBadge } from '../../../features/budgets/components/StatusBadge';
import { renderWithProviders } from '../../../test/test-utils';

describe('StatusBadge', () => {
  it('deve renderizar o badge de EXPIRED com texto e ícone warning', () => {
    renderWithProviders(<StatusBadge status="EXPIRED" />);

    expect(screen.getByText('Expirado')).toBeInTheDocument();
    expect(screen.getByText('warning')).toBeInTheDocument();
  });

  it('deve ocultar o ícone quando showIcon for false', () => {
    renderWithProviders(<StatusBadge status="EXPIRED" showIcon={false} />);

    expect(screen.getByText('Expirado')).toBeInTheDocument();
    expect(screen.queryByText('warning')).not.toBeInTheDocument();
  });

  it('deve renderizar status padrão DRAFT e classes customizadas', () => {
    const { container } = renderWithProviders(<StatusBadge status="DRAFT" className="custom-class" />);

    expect(screen.getByText('Rascunho')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('custom-class');
    expect(container.firstChild).toHaveClass('whitespace-nowrap');
  });

  it('deve renderizar com fallback para DRAFT quando receber status desconhecido', () => {
    renderWithProviders(<StatusBadge status="UNKNOWN_STATUS" />);

    expect(screen.getByText('Rascunho')).toBeInTheDocument();
  });
});
