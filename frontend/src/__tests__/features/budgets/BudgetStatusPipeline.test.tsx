import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BudgetStatusPipeline } from '../../../features/budgets/components/BudgetStatusPipeline';
import { renderWithProviders } from '../../../test/test-utils';

describe('BudgetStatusPipeline', () => {
  it('deve renderizar o pipeline com as 3 fases lineares (Rascunho, Enviado, Aprovado)', () => {
    renderWithProviders(
      <BudgetStatusPipeline status="DRAFT" onChange={vi.fn()} />
    );

    expect(screen.getByText('Rascunho')).toBeInTheDocument();
    expect(screen.getByText('Enviado')).toBeInTheDocument();
    expect(screen.getByText('Aprovado')).toBeInTheDocument();
  });

  it('deve disparar onChange ao clicar em uma etapa diferente', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    renderWithProviders(
      <BudgetStatusPipeline status="DRAFT" onChange={handleChange} />
    );

    const sentButton = screen.getByTitle('Alterar para Enviado');
    await user.click(sentButton);

    expect(handleChange).toHaveBeenCalledWith('SENT');
  });

  it('não deve disparar onChange ao clicar na etapa que já está ativa', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    renderWithProviders(
      <BudgetStatusPipeline status="DRAFT" onChange={handleChange} />
    );

    const draftButton = screen.getByTitle('Alterar para Rascunho');
    await user.click(draftButton);

    expect(handleChange).not.toHaveBeenCalled();
  });

  it('não deve disparar onChange quando o componente estiver desabilitado', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    renderWithProviders(
      <BudgetStatusPipeline status="DRAFT" onChange={handleChange} disabled={true} />
    );

    const approvedButton = screen.getByTitle('Alterar para Aprovado');
    await user.click(approvedButton);

    expect(handleChange).not.toHaveBeenCalled();
  });

  it('deve exibir badge e botão "Reabrir" quando o status for REJECTED', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    renderWithProviders(
      <BudgetStatusPipeline status="REJECTED" onChange={handleChange} />
    );

    expect(screen.getByText('Rejeitado')).toBeInTheDocument();
    const reopenBtn = screen.getByRole('button', { name: /reabrir/i });
    expect(reopenBtn).toBeInTheDocument();

    await user.click(reopenBtn);
    expect(handleChange).toHaveBeenCalledWith('DRAFT');
  });

  it('deve exibir badge e botão "Reabrir" quando o status for CANCELLED', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    renderWithProviders(
      <BudgetStatusPipeline status="CANCELLED" onChange={handleChange} />
    );

    expect(screen.getByText('Cancelado')).toBeInTheDocument();
    const reopenBtn = screen.getByRole('button', { name: /reabrir/i });
    expect(reopenBtn).toBeInTheDocument();

    await user.click(reopenBtn);
    expect(handleChange).toHaveBeenCalledWith('DRAFT');
  });

  it('deve abrir menu de opções secundárias e permitir selecionar Rejeitado ou Cancelado', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    renderWithProviders(
      <BudgetStatusPipeline status="DRAFT" onChange={handleChange} />
    );

    const menuButton = screen.getByRole('button', { name: /opções adicionais de status/i });
    await user.click(menuButton);

    expect(screen.getByText('Ações de Fechamento')).toBeInTheDocument();

    const rejectBtn = screen.getByRole('button', { name: /marcar como rejeitado/i });
    await user.click(rejectBtn);

    expect(handleChange).toHaveBeenCalledWith('REJECTED');
  });
});
