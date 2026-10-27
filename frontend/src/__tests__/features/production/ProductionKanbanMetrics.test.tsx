import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductionKanbanMetrics } from '../../../features/production/components/ProductionKanbanMetrics';
import type { OrderSummary } from '../../../features/orders/types';

describe('ProductionKanbanMetrics Component (US-18.5 / Correção BUG-01)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 23, 12, 0, 0)); // 23/10/2026
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('deve renderizar os 4 cards de métricas executivas', () => {
    const orders: OrderSummary[] = [
      {
        id: 'ord-1',
        codigo: 'OS-2026-0001',
        orcamentoId: 'orc-1',
        clienteNome: 'Cliente A',
        status: 'IN_PRODUCTION',
        canalAprovacao: 'WHATSAPP',
        dataAprovacao: '2026-10-10',
        dataPrevisaoEntrega: '2026-10-30', // NORMAL
        valorLiquido: 5000,
        quantidadeItens: 4,
        createdAt: '2026-10-10T10:00:00Z',
      },
    ];

    render(<ProductionKanbanMetrics orders={orders} />);

    expect(screen.getByTestId('production-kanban-metrics')).toBeInTheDocument();
    expect(screen.getByTestId('metric-in-production')).toHaveTextContent('1');
    expect(screen.getByTestId('metric-total-pieces')).toHaveTextContent('4 peças');
    expect(screen.getByTestId('metric-urgent')).toHaveTextContent('0');
    expect(screen.getByTestId('metric-ontime-rate')).toHaveTextContent('100.0%');
  });

  it('deve ignorar pedidos COMPLETED no cálculo de ordens urgentes e atrasadas (BUG-01)', () => {
    const orders: OrderSummary[] = [
      // 1 ativo no prazo
      {
        id: 'ord-1',
        codigo: 'OS-2026-0001',
        orcamentoId: 'orc-1',
        clienteNome: 'Cliente Ativo',
        status: 'IN_PRODUCTION',
        canalAprovacao: 'WHATSAPP',
        dataAprovacao: '2026-10-10',
        dataPrevisaoEntrega: '2026-10-30', // Futuro (NORMAL)
        valorLiquido: 3000,
        quantidadeItens: 2,
        createdAt: '2026-10-10T10:00:00Z',
      },
      // 1 concluído com data de entrega que já passou no histórico
      {
        id: 'ord-2',
        codigo: 'OS-2026-0002',
        orcamentoId: 'orc-2',
        clienteNome: 'Cliente Concluído Antigo',
        status: 'COMPLETED',
        canalAprovacao: 'PRESENCIAL',
        dataAprovacao: '2026-09-01',
        dataPrevisaoEntrega: '2026-09-15', // Passado (seria LATE se não ignorasse)
        valorLiquido: 7000,
        quantidadeItens: 5,
        createdAt: '2026-09-01T10:00:00Z',
      },
    ];

    render(<ProductionKanbanMetrics orders={orders} />);

    // ord-2 já está COMPLETED, logo NÃO deve contar como urgente nem como atrasado
    expect(screen.getByTestId('metric-urgent')).toHaveTextContent('0');
    // Em produção deve ser 1 (apenas ord-1)
    expect(screen.getByTestId('metric-in-production')).toHaveTextContent('1');
    // Total de peças deve incluir todas as ordens
    expect(screen.getByTestId('metric-total-pieces')).toHaveTextContent('7 peças');
    // Pontualidade deve ser 100.0% pois a única ordem ativa está no prazo
    expect(screen.getByTestId('metric-ontime-rate')).toHaveTextContent('100.0%');
  });

  it('deve calcular corretamente a taxa de pontualidade quando houver ordem ativa atrasada', () => {
    const orders: OrderSummary[] = [
      // 1 ativo atrasado
      {
        id: 'ord-1',
        codigo: 'OS-2026-0001',
        orcamentoId: 'orc-1',
        clienteNome: 'Cliente Atrasado',
        status: 'WAITING_PRODUCTION',
        canalAprovacao: 'WHATSAPP',
        dataAprovacao: '2026-10-01',
        dataPrevisaoEntrega: '2026-10-15', // Passado -> LATE
        valorLiquido: 3000,
        quantidadeItens: 2,
        createdAt: '2026-10-01T10:00:00Z',
      },
      // 1 ativo no prazo
      {
        id: 'ord-2',
        codigo: 'OS-2026-0002',
        orcamentoId: 'orc-2',
        clienteNome: 'Cliente No Prazo',
        status: 'IN_PRODUCTION',
        canalAprovacao: 'PRESENCIAL',
        dataAprovacao: '2026-10-10',
        dataPrevisaoEntrega: '2026-10-30', // Futuro -> NORMAL
        valorLiquido: 5000,
        quantidadeItens: 3,
        createdAt: '2026-10-10T10:00:00Z',
      },
    ];

    render(<ProductionKanbanMetrics orders={orders} />);

    expect(screen.getByTestId('metric-urgent')).toHaveTextContent('1');
    expect(screen.getByTestId('metric-ontime-rate')).toHaveTextContent('50.0%');
  });

  it('deve retornar 100.0% de pontualidade para lista vazia', () => {
    render(<ProductionKanbanMetrics orders={[]} />);

    expect(screen.getByTestId('metric-in-production')).toHaveTextContent('0');
    expect(screen.getByTestId('metric-total-pieces')).toHaveTextContent('0 peças');
    expect(screen.getByTestId('metric-urgent')).toHaveTextContent('0');
    expect(screen.getByTestId('metric-ontime-rate')).toHaveTextContent('100.0%');
  });
});
