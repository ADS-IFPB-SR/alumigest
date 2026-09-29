import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BudgetFinancialSummary } from '../../../features/budgets/components/BudgetFinancialSummary';
import { BudgetSummaryCard } from '../../../features/budgets/components/BudgetSummaryCard';
import { renderWithProviders } from '../../../test/test-utils';

describe('BudgetFinancialSummary (US-09.37)', () => {
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

    expect(screen.getAllByText(/2 itens/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Mão de Obra/i)).toBeInTheDocument();
    expect(screen.getByText(/Subtotal Bruto/i)).toBeInTheDocument();
    expect(screen.getByText(/Desconto \(10%\)/i)).toBeInTheDocument();
    expect(screen.getByText('Total Líquido')).toBeInTheDocument();
    expect(screen.getByText('Valor Total da Proposta')).toBeInTheDocument();
  });

  it('deve destacar a economia do cliente e exibir desconto com sinal negativo e percentual', () => {
    renderWithProviders(<BudgetFinancialSummary {...defaultProps} />);

    // Desconto com sinal negativo e percentual
    expect(screen.getByText(/− R\$\s*350,00 \(10%\)/)).toBeInTheDocument();

    // Destaque do valor economizado pelo cliente
    expect(screen.getByText(/Economia de R\$\s*350,00/i)).toBeInTheDocument();
  });

  it('deve exibir linha de desconto neutra quando desconto for 0%', () => {
    renderWithProviders(
      <BudgetFinancialSummary
        {...defaultProps}
        discountPercent={0}
        discountValue={0}
        total={3500}
      />
    );

    expect(screen.getByText('Desconto Comercial')).toBeInTheDocument();
    expect(screen.getByText('R$ 0,00 (0%)')).toBeInTheDocument();
    expect(screen.queryByText(/Economia de/i)).not.toBeInTheDocument();
  });

  it('deve renderizar Subtotal Bruto mesmo quando laborCost for 0', () => {
    renderWithProviders(
      <BudgetFinancialSummary
        {...defaultProps}
        laborCost={0}
        subtotal={3000}
        discountPercent={0}
        discountValue={0}
        total={3000}
      />
    );

    expect(screen.getByText('Subtotal Bruto')).toBeInTheDocument();
    expect(screen.getAllByText(/3\.000,00/).length).toBeGreaterThanOrEqual(2);
    expect(screen.queryByText(/Mão de Obra \/ Serviços/i)).not.toBeInTheDocument();
  });

  it('deve exibir a condição de pagamento mapeada a partir de PaymentCondition enum', () => {
    renderWithProviders(
      <BudgetFinancialSummary
        {...defaultProps}
        paymentCondition="A_VISTA_PIX"
      />
    );

    expect(screen.getByText('Condição de Pagamento')).toBeInTheDocument();
    expect(screen.getByText('À Vista (PIX / Dinheiro)')).toBeInTheDocument();
  });

  it('deve priorizar paymentConditionLabel customizado quando fornecido', () => {
    renderWithProviders(
      <BudgetFinancialSummary
        {...defaultProps}
        paymentCondition="CARTAO_12X"
        paymentConditionLabel="Cartão de Crédito 10x sem juros"
      />
    );

    expect(screen.getByText('Cartão de Crédito 10x sem juros')).toBeInTheDocument();
  });

  it('deve exibir commercialConditions como fallback para condição de pagamento', () => {
    renderWithProviders(
      <BudgetFinancialSummary
        {...defaultProps}
        commercialConditions="50% sinal e 50% na instalação"
      />
    );

    expect(screen.getByText('50% sinal e 50% na instalação')).toBeInTheDocument();
  });

  it('deve exibir rótulo amigável padrão quando nenhuma condição de pagamento for informada', () => {
    renderWithProviders(<BudgetFinancialSummary {...defaultProps} />);

    expect(screen.getByText('A combinar no fechamento')).toBeInTheDocument();
  });

  it('deve refletir o recálculo do desconto imediatamente quando as props mudarem', () => {
    const { rerender } = renderWithProviders(
      <BudgetFinancialSummary
        {...defaultProps}
        discountPercent={5}
        discountValue={175}
        total={3325}
      />
    );

    expect(screen.getByText(/Economia de R\$\s*175,00/i)).toBeInTheDocument();
    expect(screen.getByText('R$ 3.325,00')).toBeInTheDocument();

    // Simula alteração imediata de desconto pelo usuário
    rerender(
      <BudgetFinancialSummary
        {...defaultProps}
        discountPercent={20}
        discountValue={700}
        total={2800}
      />
    );

    expect(screen.getByText(/Economia de R\$\s*700,00/i)).toBeInTheDocument();
    expect(screen.getByText('R$ 2.800,00')).toBeInTheDocument();
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

  it('não deve renderizar botão de salvar quando onSave não for passado', () => {
    renderWithProviders(
      <BudgetFinancialSummary
        {...defaultProps}
        onSave={undefined}
      />
    );

    expect(screen.queryByRole('button', { name: /salvar e gerar proposta/i })).not.toBeInTheDocument();
  });

  it('deve funcionar com o alias BudgetSummaryCard de forma equivalente', () => {
    renderWithProviders(<BudgetSummaryCard {...defaultProps} />);

    expect(screen.getByTestId('budget-financial-summary')).toBeInTheDocument();
    expect(screen.getByText('Total Líquido')).toBeInTheDocument();
  });
});
