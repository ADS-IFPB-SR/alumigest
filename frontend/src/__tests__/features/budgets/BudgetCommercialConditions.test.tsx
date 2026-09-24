import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BudgetCommercialConditions } from '../../../features/budgets/components/BudgetCommercialConditions';
import { renderWithProviders } from '../../../test/test-utils';

describe('BudgetCommercialConditions [Joseph Nichollas]', () => {
  const defaultProps = {
    laborCost: 150,
    onLaborCostChange: vi.fn(),
    discountPercent: 5,
    onDiscountChange: vi.fn(),
    discountType: 'PERCENTUAL' as const,
    onDiscountTypeChange: vi.fn(),
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

  it('deve disparar onValidUntilChange ao clicar nos botões de preset (+7d, +15d, +30d) e ao digitar na data', async () => {
    const user = userEvent.setup();
    const handleValidUntil = vi.fn();

    renderWithProviders(
      <BudgetCommercialConditions {...defaultProps} onValidUntilChange={handleValidUntil} />
    );

    const btn7d = screen.getByRole('button', { name: /7 dias/i });
    await user.click(btn7d);
    expect(handleValidUntil).toHaveBeenCalled();

    const btn15d = screen.getByRole('button', { name: /15 dias/i });
    await user.click(btn15d);
    expect(handleValidUntil).toHaveBeenCalled();

    const btn30d = screen.getByRole('button', { name: /30 dias/i });
    await user.click(btn30d);
    expect(handleValidUntil).toHaveBeenCalled();

    const dateInput = screen.getByDisplayValue('2026-10-01');
    fireEvent.change(dateInput, { target: { value: '2026-11-15' } });
    expect(handleValidUntil).toHaveBeenCalledWith('2026-11-15');
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

  it('deve alternar o tipo de desconto entre PERCENTUAL e VALOR_FIXO', async () => {
    const user = userEvent.setup();
    const handleDiscountType = vi.fn();
    const handleDiscount = vi.fn();

    renderWithProviders(
      <BudgetCommercialConditions
        {...defaultProps}
        onDiscountTypeChange={handleDiscountType}
        onDiscountChange={handleDiscount}
      />
    );

    const btnFixed = screen.getByRole('button', { name: 'R$' });
    await user.click(btnFixed);
    expect(handleDiscountType).toHaveBeenCalledWith('VALOR_FIXO');
    expect(handleDiscount).toHaveBeenCalledWith(0);

    const btnPercent = screen.getByRole('button', { name: '%' });
    await user.click(btnPercent);
    expect(handleDiscountType).toHaveBeenCalledWith('PERCENTUAL');
    expect(handleDiscount).toHaveBeenCalledWith(0);
  });

  it('deve disparar onNotesChange e onCommercialConditionsChange ao digitar nas textareas', async () => {
    const user = userEvent.setup();
    const handleNotes = vi.fn();
    const handleConditions = vi.fn();

    renderWithProviders(
      <BudgetCommercialConditions
        {...defaultProps}
        onNotesChange={handleNotes}
        onCommercialConditionsChange={handleConditions}
      />
    );

    const notesInput = screen.getByDisplayValue('Entregar na portaria');
    await user.type(notesInput, ' urgente');
    expect(handleNotes).toHaveBeenCalled();

    const conditionsInput = screen.getByDisplayValue('Pagamento 50% entrada e 50% na instalação');
    await user.type(conditionsInput, ' em dinheiro');
    expect(handleConditions).toHaveBeenCalled();
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
