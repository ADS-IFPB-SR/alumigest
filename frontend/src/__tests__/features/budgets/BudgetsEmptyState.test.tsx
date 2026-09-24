import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import {
  BudgetsEmptyState,
  BudgetsLoadingSkeleton,
} from '../../../features/budgets/components/BudgetsEmptyState';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('BudgetsEmptyState Component [Joseph Nichollas]', () => {
  it('deve renderizar estado de erro e acionar onRetry quando fornecido', () => {
    const onRetry = vi.fn();
    render(
      <MemoryRouter>
        <BudgetsEmptyState type="error" onRetry={onRetry} />
      </MemoryRouter>
    );

    expect(screen.getByText('Erro ao carregar orçamentos')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Ocorreu um erro ao buscar os dados. Verifique sua conexão e tente novamente.'
      )
    ).toBeInTheDocument();

    const retryBtn = screen.getByRole('button', { name: /Tentar novamente/i });
    expect(retryBtn).toBeInTheDocument();
    fireEvent.click(retryBtn);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('deve renderizar estado de erro sem botão de retry quando onRetry não for fornecido', () => {
    render(
      <MemoryRouter>
        <BudgetsEmptyState type="error" />
      </MemoryRouter>
    );

    expect(screen.getByText('Erro ao carregar orçamentos')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Tentar novamente/i })).not.toBeInTheDocument();
  });

  it('deve renderizar estado de nenhum resultado encontrado (no-results)', () => {
    render(
      <MemoryRouter>
        <BudgetsEmptyState type="no-results" />
      </MemoryRouter>
    );

    expect(screen.getByText('Nenhum orçamento encontrado')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Nenhum orçamento corresponde aos filtros ou termos de busca aplicados. Tente alterar os filtros.'
      )
    ).toBeInTheDocument();
  });

  it('deve renderizar estado de nenhum orçamento cadastrado (no-data) e navegar ao clicar no botão', () => {
    render(
      <MemoryRouter>
        <BudgetsEmptyState type="no-data" />
      </MemoryRouter>
    );

    expect(screen.getByText('Nenhum orçamento cadastrado')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Comece criando seu primeiro orçamento para gerenciar propostas e acompanhar aprovações.'
      )
    ).toBeInTheDocument();

    const newBtn = screen.getByRole('button', { name: /Criar Primeiro Orçamento/i });
    expect(newBtn).toBeInTheDocument();
    fireEvent.click(newBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/orcamentos/novo');
  });

  it('deve renderizar o componente BudgetsLoadingSkeleton com as colunas e linhas pulsantes', () => {
    const { container } = render(<BudgetsLoadingSkeleton />);
    const pulseDivs = container.querySelectorAll('.animate-pulse');
    expect(pulseDivs.length).toBeGreaterThan(0);
  });
});
