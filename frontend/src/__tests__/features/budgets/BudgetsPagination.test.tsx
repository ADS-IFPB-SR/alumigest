import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BudgetsPagination } from '../../../features/budgets/components/BudgetsPagination';

describe('BudgetsPagination Component [Joseph Nichollas]', () => {
  it('deve renderizar rodapé simplificado quando totalPages <= 1 e totalElements <= pageSize', () => {
    render(
      <BudgetsPagination
        currentPage={0}
        totalPages={1}
        totalElements={1}
        pageSize={10}
        onPageChange={vi.fn()}
      />
    );

    expect(screen.getByText(/Mostrando/i)).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText(/orçamento$/i)).toBeInTheDocument();
    expect(screen.queryByText('Anterior')).not.toBeInTheDocument();
  });

  it('deve renderizar paginação completa com botão Anterior desabilitado na primeira página', async () => {
    const user = userEvent.setup();
    const handlePageChange = vi.fn();

    render(
      <BudgetsPagination
        currentPage={0}
        totalPages={5}
        totalElements={50}
        pageSize={10}
        onPageChange={handlePageChange}
      />
    );

    expect(screen.getByText(/Mostrando/i)).toHaveTextContent('1');
    expect(screen.getByText(/Mostrando/i)).toHaveTextContent('10');
    expect(screen.getByText(/Mostrando/i)).toHaveTextContent('50');

    const btnAnterior = screen.getByRole('button', { name: /anterior/i });
    expect(btnAnterior).toBeDisabled();

    const btnProxima = screen.getByRole('button', { name: /próxima/i });
    expect(btnProxima).toBeEnabled();

    await user.click(btnProxima);
    expect(handlePageChange).toHaveBeenCalledWith(1);
  });

  it('deve desabilitar botão Próxima na última página e permitir clicar em Anterior', async () => {
    const user = userEvent.setup();
    const handlePageChange = vi.fn();

    render(
      <BudgetsPagination
        currentPage={4}
        totalPages={5}
        totalElements={45}
        pageSize={10}
        onPageChange={handlePageChange}
      />
    );

    const btnProxima = screen.getByRole('button', { name: /próxima/i });
    expect(btnProxima).toBeDisabled();

    const btnAnterior = screen.getByRole('button', { name: /anterior/i });
    expect(btnAnterior).toBeEnabled();

    await user.click(btnAnterior);
    expect(handlePageChange).toHaveBeenCalledWith(3);
  });

  it('deve renderizar reticências quando houver mais de 7 páginas e página atual estiver no meio', async () => {
    const user = userEvent.setup();
    const handlePageChange = vi.fn();

    render(
      <BudgetsPagination
        currentPage={5}
        totalPages={12}
        totalElements={120}
        pageSize={10}
        onPageChange={handlePageChange}
      />
    );

    const reticencias = screen.getAllByText('…');
    expect(reticencias.length).toBeGreaterThanOrEqual(1);

    const btnPagina7 = screen.getByRole('button', { name: '7' });
    await user.click(btnPagina7);
    expect(handlePageChange).toHaveBeenCalledWith(6);
  });

  it('deve renderizar texto no plural quando houver múltiplos orçamentos em página única', () => {
    render(
      <BudgetsPagination
        currentPage={0}
        totalPages={1}
        totalElements={2}
        pageSize={10}
        onPageChange={vi.fn()}
      />
    );

    expect(screen.getByText(/orçamentos$/i)).toBeInTheDocument();
  });

  it('deve lidar corretamente com 0 elementos', () => {
    render(
      <BudgetsPagination
        currentPage={0}
        totalPages={0}
        totalElements={0}
        pageSize={10}
        onPageChange={vi.fn()}
      />
    );

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('deve renderizar ellipsis apenas no fim quando na página 1 de 10 páginas', () => {
    render(
      <BudgetsPagination
        currentPage={1}
        totalPages={10}
        totalElements={100}
        pageSize={10}
        onPageChange={vi.fn()}
      />
    );

    expect(screen.getAllByText('…')).toHaveLength(1);
  });

  it('deve renderizar ellipsis apenas no início quando na página 8 de 10 páginas', () => {
    render(
      <BudgetsPagination
        currentPage={8}
        totalPages={10}
        totalElements={100}
        pageSize={10}
        onPageChange={vi.fn()}
      />
    );

    expect(screen.getAllByText('…')).toHaveLength(1);
  });
});
