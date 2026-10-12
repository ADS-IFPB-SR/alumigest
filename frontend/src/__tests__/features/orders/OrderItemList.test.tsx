import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OrderItemList } from '../../../features/orders/components/OrderItemList';
import type { OrderItem } from '../../../features/orders/types';

describe('OrderItemList', () => {
  it('deve exibir mensagem de lista vazia quando não houver itens', () => {
    render(<OrderItemList items={[]} />);
    expect(screen.getByTestId('order-items-empty')).toBeInTheDocument();
    expect(screen.getByText(/nenhum item registrado para este pedido/i)).toBeInTheDocument();
  });

  it('deve renderizar a tabela com os detalhes contratuais e dimensões dos itens', () => {
    const mockItems: OrderItem[] = [
      {
        id: 'item-1',
        orderId: 'order-1',
        descricao: 'Janela de Correr 2 Folhas',
        larguraMm: 1200,
        alturaMm: 1000,
        quantidade: 2,
        corAluminio: 'Preto Fosco',
        tipoVidro: 'Incolor 6mm',
        orientacaoAbertura: 'Esquerda/Direita',
        ferragens: 'Fecho Concha Alcoa',
        valorUnitario: 450,
        valorTotal: 900,
        ordem: 1,
        options: [
          {
            id: 'opt-1',
            orderItemId: 'item-1',
            materialName: 'Perfil Linha Suprema',
            unitMeasure: 'M',
            categoryType: 'ALUMINIO',
            quantity: 5,
            unitPrice: 30,
            totalPrice: 150,
          },
        ],
      },
    ];

    render(<OrderItemList items={mockItems} />);

    expect(screen.getByTestId('order-items-container')).toBeInTheDocument();
    expect(screen.getByText('Janela de Correr 2 Folhas')).toBeInTheDocument();
    expect(screen.getByText('1200 × 1000 mm')).toBeInTheDocument();
    expect(screen.getByText(/preto fosco/i)).toBeInTheDocument();
    expect(screen.getByText(/incolor 6mm/i)).toBeInTheDocument();
    expect(screen.getByText(/perfil linha suprema/i)).toBeInTheDocument();
  });
});
