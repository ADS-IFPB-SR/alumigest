import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BudgetFinancialSummary } from '../../../features/budgets/components/BudgetFinancialSummary';
import { renderWithProviders } from '../../../test/test-utils';

describe('BudgetFinancialSummary', () => {
  const defaultProps = {
    itemCount: 2,
    itemsSubtotal: 3000,
    laborCost: 500,
    subtotal: 3500,
    discountPercent: 10,
    discountValue: 350,
    total: 3150,
    onSave: vi.fn(),
    isSaving: false,
    canSave: true,
  };

  it('deve renderizar os valores financeiros e quantidades corretamente', () => {
    renderWithProviders(<BudgetFinancialSummary {...defaultProps} />);

    expect(screen.getByText(/2 itens/i)).toBeInTheDocument();
    expect(screen.getByText(/Mão de Obra/i)).toBeInTheDocument();
    expect(screen.getByText(/Desconto \(10%\)/i)).toBeInTheDocument();
    expect(screen.getByText('Valor Total da Proposta')).toBeInTheDocument();
  });

  it('deve permitir submissão quando canSave for true e isSaving for false', async () => {
    const user = userEvent.setup();
    const handleSave = vi.fn();

    renderWithProviders(
      <BudgetFinancialSummary {...defaultProps} onSave={handleSave} canSave={true} isSaving={false} />
    );

    const saveButton = screen.getByRole('button', { name: /salvar e gerar proposta/i });
    expect(saveButton).toBeEnabled();

    await user.click(saveButton);
    expect(handleSave).toHaveBeenCalledTimes(1);
  });

  it('deve desabilitar o botão de salvar quando canSave for false', () => {
    renderWithProviders(
      <BudgetFinancialSummary {...defaultProps} canSave={false} />
    );

    const saveButton = screen.getByRole('button', { name: /salvar e gerar proposta/i });
    expect(saveButton).toBeDisabled();
  });

  it('deve exibir feedback de salvamento quando isSaving for true', () => {
    renderWithProviders(
      <BudgetFinancialSummary {...defaultProps} isSaving={true} />
    );

    expect(screen.getByText(/salvando/i)).toBeInTheDocument();
  });
});
