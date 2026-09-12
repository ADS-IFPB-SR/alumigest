import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BudgetCommercialConditions } from '../../../features/budgets/components/BudgetCommercialConditions';
import { renderWithProviders } from '../../../test/test-utils';

describe('BudgetCommercialConditions', () => {
  const defaultProps = {
    laborCost: 150,
    onLaborCostChange: vi.fn(),
    discountPercent: 5,
    onDiscountChange: vi.fn(),
    notes: 'Entregar na portaria',
    onNotesChange: vi.fn(),
    commercialConditions: 'Pagamento 50% entrada e 50% na instalação',
    onCommercialConditionsChange: vi.fn(),
    validUntil: '2026-10-01',
    onValidUntilChange: vi.fn(),
    subtotal: 2000,
    errors: {},
  };

  it('deve renderizar todos os campos com os valores iniciais', () => {
    renderWithProviders(<BudgetCommercialConditions {...defaultProps} />);

    expect(screen.getByDisplayValue('150')).toBeInTheDocument();
    expect(screen.getByDisplayValue('5')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2026-10-01')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Entregar na portaria')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Pagamento 50% entrada e 50% na instalação')).toBeInTheDocument();
  });

  it('deve disparar onValidUntilChange ao clicar nos botões de preset (+7d, +15d, +30d)', async () => {
    const user = userEvent.setup();
    const handleValidUntil = vi.fn();

    renderWithProviders(
      <BudgetCommercialConditions {...defaultProps} onValidUntilChange={handleValidUntil} />
    );

    const btn15d = screen.getByRole('button', { name: /15 dias/i });
    await user.click(btn15d);

    expect(handleValidUntil).toHaveBeenCalledWith(expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/));
  });

  it('deve disparar onLaborCostChange ao alterar o valor da mão de obra', async () => {
    const user = userEvent.setup();
    const handleLaborCost = vi.fn();

    renderWithProviders(
      <BudgetCommercialConditions {...defaultProps} onLaborCostChange={handleLaborCost} />
    );

    const laborInput = screen.getByLabelText(/mão de obra/i);
    await user.clear(laborInput);
    await user.type(laborInput, '200');

    expect(handleLaborCost).toHaveBeenCalled();
  });

  it('deve disparar onDiscountChange ao alterar o percentual de desconto', async () => {
    const user = userEvent.setup();
    const handleDiscount = vi.fn();

    renderWithProviders(
      <BudgetCommercialConditions {...defaultProps} onDiscountChange={handleDiscount} />
    );

    const discountInput = screen.getByLabelText(/desconto/i);
    await user.clear(discountInput);
    await user.type(discountInput, '10');

    expect(handleDiscount).toHaveBeenCalled();
  });

  it('deve exibir mensagens de erro quando fornecidas em errors', () => {
    renderWithProviders(
      <BudgetCommercialConditions
        {...defaultProps}
        errors={{
          discountPercent: 'Desconto não pode exceder 100%',
          validUntil: 'Data de validade deve ser futura',
        }}
      />
    );

    expect(screen.getByText('Desconto não pode exceder 100%')).toBeInTheDocument();
    expect(screen.getByText('Data de validade deve ser futura')).toBeInTheDocument();
  });
});
