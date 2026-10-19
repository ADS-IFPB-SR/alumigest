import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductionKanbanBoard } from '../../../features/production/components/ProductionKanbanBoard';
import { calculateTotalPieces } from '../../../features/production/utils/kanbanUtils';
import type { Order, OrderSummary } from '../../../features/orders/types';

describe('ProductionKanbanBoard Component (US-18.4)', () => {
  const mockOnMoveOrder = vi.fn();
  const mockOnClickDetails = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const orderWaiting1: Order = {
    id: 'ord-1',
    codigo: 'OS-2026-0001',
    orcamentoId: 'orc-1',
    orcamentoCodigo: 'ORC-001',
    clienteNome: 'Construtora Horizonte',
    clienteTelefone: '83999990001',
    status: 'WAITING_PRODUCTION',
    canalAprovacao: 'WHATSAPP',
    dataAprovacao: '2026-10-10',
    dataPrevisaoEntrega: '2026-10-25',
    valorBruto: 3000,
    valorDesconto: 0,
    taxaInstalacao: 0,
    taxaFrete: 0,
    valorLiquido: 3000,
    createdAt: '2026-10-10T10:00:00Z',
    updatedAt: '2026-10-10T10:00:00Z',
    ativo: true,
    items: [
      {
        id: 'item-1',
        descricao: 'Janela 2 Folhas Linha Suprema',
        quantidade: 3,
        valorUnitario: 1000,
        valorTotal: 3000,
        ordem: 0,
      },
    ],
  };

  const orderWaiting2: OrderSummary = {
    id: 'ord-2',
    codigo: 'OS-2026-0002',
    orcamentoId: 'orc-2',
    orcamentoCodigo: 'ORC-002',
    clienteNome: 'Edifício Solar',
    status: 'WAITING_PRODUCTION',
    canalAprovacao: 'PRESENCIAL',
    dataAprovacao: '2026-10-11',
    dataPrevisaoEntrega: '2026-10-26',
    valorLiquido: 1500,
    quantidadeItens: 2,
    createdAt: '2026-10-11T10:00:00Z',
  };

  const orderInProd: Order = {
    id: 'ord-3',
    codigo: 'OS-2026-0003',
    orcamentoId: 'orc-3',
    orcamentoCodigo: 'ORC-003',
    clienteNome: 'Residencial Bela Vista',
    clienteTelefone: '83999990003',
    status: 'IN_PRODUCTION',
    canalAprovacao: 'EMAIL',
    dataAprovacao: '2026-10-12',
    dataPrevisaoEntrega: '2026-10-20',
    valorBruto: 5000,
    valorDesconto: 0,
    taxaInstalacao: 0,
    taxaFrete: 0,
    valorLiquido: 5000,
    createdAt: '2026-10-12T10:00:00Z',
    updatedAt: '2026-10-12T10:00:00Z',
    ativo: true,
    items: [
      {
        id: 'item-2',
        descricao: 'Porta de Correr 4 Folhas',
        quantidade: 1,
        valorUnitario: 5000,
        valorTotal: 5000,
        ordem: 0,
      },
    ],
  };

  const orderCompleted: OrderSummary = {
    id: 'ord-4',
    codigo: 'OS-2026-0004',
    orcamentoId: 'orc-4',
    orcamentoCodigo: 'ORC-004',
    clienteNome: 'Clínica Vida',
    status: 'COMPLETED',
    canalAprovacao: 'TELEFONE',
    dataAprovacao: '2026-10-05',
    dataPrevisaoEntrega: '2026-10-15',
    valorLiquido: 8000,
    quantidadeItens: 5,
    createdAt: '2026-10-05T10:00:00Z',
  };

  describe('Renderização e Estrutura das Colunas', () => {
    it('deve renderizar o quadro com as três colunas principais e seus títulos', () => {
      render(
        <ProductionKanbanBoard
          orders={[orderWaiting1, orderInProd, orderCompleted]}
          onMoveOrder={mockOnMoveOrder}
          onClickDetails={mockOnClickDetails}
        />
      );

      expect(screen.getByTestId('production-kanban-board')).toBeInTheDocument();
      expect(screen.getByTestId('kanban-column-waiting_production')).toBeInTheDocument();
      expect(screen.getByTestId('kanban-column-in_production')).toBeInTheDocument();
      expect(screen.getByTestId('kanban-column-completed')).toBeInTheDocument();

      expect(screen.getByText('Aguardando Produção')).toBeInTheDocument();
      expect(screen.getByText('Em Produção')).toBeInTheDocument();
      expect(screen.getByText('Concluído')).toBeInTheDocument();

      expect(screen.getByText('Fila de corte e usinagem')).toBeInTheDocument();
      expect(screen.getByText('Em montagem na fábrica')).toBeInTheDocument();
      expect(screen.getByText('Pronto para expedição')).toBeInTheDocument();
    });

    it('deve distribuir pedidos planos corretamente nas colunas e exibir contadores em tempo real', () => {
      render(
        <ProductionKanbanBoard
          orders={[orderWaiting1, orderWaiting2, orderInProd, orderCompleted]}
        />
      );

      // Coluna Aguardando Produção: 2 ordens
      const countWaiting = screen.getByTestId('column-count-waiting_production');
      expect(countWaiting).toHaveTextContent('2');

      // Coluna Em Produção: 1 ordem
      const countInProd = screen.getByTestId('column-count-in_production');
      expect(countInProd).toHaveTextContent('1');

      // Coluna Concluído: 1 ordem
      const countCompleted = screen.getByTestId('column-count-completed');
      expect(countCompleted).toHaveTextContent('1');

      // Verifica presença dos códigos dos pedidos em tela
      expect(screen.getByText('OS-2026-0001')).toBeInTheDocument();
      expect(screen.getByText('OS-2026-0002')).toBeInTheDocument();
      expect(screen.getByText('OS-2026-0003')).toBeInTheDocument();
      expect(screen.getByText('OS-2026-0004')).toBeInTheDocument();
    });

    it('deve exibir somatório de peças físicas no cabeçalho das colunas', () => {
      render(
        <ProductionKanbanBoard
          orders={[orderWaiting1, orderWaiting2]} // 3 peças + 2 peças = 5 peças
        />
      );

      expect(screen.getByText('5 peças')).toBeInTheDocument();
    });

    it('deve exibir mensagem de estado vazio em colunas que não possuem pedidos', () => {
      render(
        <ProductionKanbanBoard
          orders={[orderWaiting1]} // apenas aguardando produção tem pedidos
        />
      );

      expect(screen.queryByTestId('column-empty-waiting_production')).not.toBeInTheDocument();
      expect(screen.getByTestId('column-empty-in_production')).toBeInTheDocument();
      expect(screen.getByTestId('column-empty-completed')).toBeInTheDocument();

      expect(screen.getByText('Nenhum pedido em processo de fabricação')).toBeInTheDocument();
      expect(screen.getByText('Nenhum pedido concluído recentemente')).toBeInTheDocument();
    });
  });

  describe('Suporte a Pedidos Pré-Agrupados (groupedOrders)', () => {
    it('deve renderizar a partir do objeto groupedOrders com chaves em formato enum técnico', () => {
      render(
        <ProductionKanbanBoard
          groupedOrders={{
            WAITING_PRODUCTION: [orderWaiting1],
            IN_PRODUCTION: [orderInProd],
            COMPLETED: [],
          }}
        />
      );

      expect(screen.getByTestId('column-count-waiting_production')).toHaveTextContent('1');
      expect(screen.getByTestId('column-count-in_production')).toHaveTextContent('1');
      expect(screen.getByTestId('column-count-completed')).toHaveTextContent('0');
      expect(screen.getByTestId('column-empty-completed')).toBeInTheDocument();
    });

    it('deve suportar aliases em português nas chaves de groupedOrders', () => {
      render(
        <ProductionKanbanBoard
          groupedOrders={{
            AGUARDANDO_PRODUCAO: [orderWaiting1],
            EM_PRODUCAO: [orderInProd],
            CONCLUIDO: [orderCompleted],
          }}
        />
      );

      expect(screen.getByTestId('column-count-waiting_production')).toHaveTextContent('1');
      expect(screen.getByTestId('column-count-in_production')).toHaveTextContent('1');
      expect(screen.getByTestId('column-count-completed')).toHaveTextContent('1');
    });
  });

  describe('Estado de Carregamento (isLoading)', () => {
    it('deve renderizar os esqueletos de loading quando isLoading for true', () => {
      render(
        <ProductionKanbanBoard
          isLoading={true}
          orders={[orderWaiting1]}
        />
      );

      const skeletons = screen.getAllByTestId('kanban-skeleton');
      expect(skeletons).toHaveLength(3); // 1 para cada coluna
      // Não deve exibir cartões nem estado vazio durante o carregamento
      expect(screen.queryByText('OS-2026-0001')).not.toBeInTheDocument();
      expect(screen.queryByTestId('column-empty-waiting_production')).not.toBeInTheDocument();
    });
  });

  describe('Eventos de Drag and Drop (Arrastar e Soltar)', () => {
    it('deve permitir dragover e acionar onMoveOrder com id do pedido e novo status ao soltar', () => {
      render(
        <ProductionKanbanBoard
          orders={[orderWaiting1]}
          onMoveOrder={mockOnMoveOrder}
        />
      );

      const inProductionColumn = screen.getByTestId('kanban-column-in_production');

      // 1. Simula arrastar sobre a coluna de Em Produção
      fireEvent.dragOver(inProductionColumn, {
        dataTransfer: { dropEffect: 'move' },
      });

      // 2. Simula o drop passando o orderId
      fireEvent.drop(inProductionColumn, {
        dataTransfer: {
          getData: (format: string) => (format === 'text/plain' ? 'ord-1' : ''),
        },
      });

      expect(mockOnMoveOrder).toHaveBeenCalledTimes(1);
      expect(mockOnMoveOrder).toHaveBeenCalledWith('ord-1', 'IN_PRODUCTION');
    });

    it('deve limpar classe de highlight visual no dragLeave', () => {
      render(
        <ProductionKanbanBoard
          orders={[orderWaiting1]}
          onMoveOrder={mockOnMoveOrder}
        />
      );

      const completedColumn = screen.getByTestId('kanban-column-completed');

      // Drag over
      fireEvent.dragOver(completedColumn, {
        dataTransfer: { dropEffect: 'move' },
      });

      // Drag leave
      fireEvent.dragLeave(completedColumn, {
        relatedTarget: document.body,
      });

      expect(mockOnMoveOrder).not.toHaveBeenCalled();
    });
  });

  describe('Ação de Visualizar Detalhes do Pedido', () => {
    it('deve chamar onClickDetails ao clicar no botão de visualizar detalhes do cartão', () => {
      render(
        <ProductionKanbanBoard
          orders={[orderWaiting1]}
          onClickDetails={mockOnClickDetails}
        />
      );

      const detailsButton = screen.getByRole('button', {
        name: /visualizar detalhes da ordem de serviço OS-2026-0001/i,
      });

      fireEvent.click(detailsButton);

      expect(mockOnClickDetails).toHaveBeenCalledTimes(1);
      expect(mockOnClickDetails).toHaveBeenCalledWith('ord-1');
    });
  });

  describe('Função utilitária calculateTotalPieces', () => {
    it('deve somar corretamente peças tanto de Order quanto de OrderSummary', () => {
      const total = calculateTotalPieces([orderWaiting1, orderWaiting2]);
      expect(total).toBe(5); // 3 (items) + 2 (quantidadeItens)
    });

    it('deve retornar 0 para listas vazias ou sem itens', () => {
      expect(calculateTotalPieces([])).toBe(0);
    });
  });
});
