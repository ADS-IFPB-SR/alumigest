import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BudgetItemsTable } from '../../../features/budgets/components/BudgetItemsTable';
import { renderWithProviders } from '../../../test/test-utils';
import type { BudgetItem } from '../../../features/budgets/types';

describe('BudgetItemsTable', () => {
  const sampleItems: BudgetItem[] = [
    {
      tempId: 'temp-1',
      templateType: 'SLIDING_DOOR_2F',
      productName: 'Porta de Correr 2F Linha Suprema',
      width: 1600,
      height: 2100,
      widthMm: 1600,
      heightMm: 2100,
      quantity: 2,
      subtotal: 1800,
      laborCost: 150,
      templateConfig: {
        openingDirection: 'LEFT_TO_RIGHT',
      },
      options: [
        {
          id: 'opt-1',
          budgetItemId: 'item-1',
          materialId: 'mat-1',
          materialName: 'Perfil Tubo 50x25',
          categoryType: 'PROFILE',
          unitMeasure: 'm',
          unitPrice: 40,
          quantity: 10,
          totalPrice: 400,
        },
      ],
    },
  ];

  it('deve exibir mensagem de estado vazio quando não houver itens', () => {
    renderWithProviders(
      <BudgetItemsTable
        items={[]}
        onEdit={vi.fn()}
        onDuplicate={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText('Nenhuma esquadria adicionada')).toBeInTheDocument();
  });

  it('deve renderizar a tabela com os itens cadastrados, medidas e todas as colunas da especificação US-09.35', () => {
    renderWithProviders(
      <BudgetItemsTable
        items={sampleItems}
        onEdit={vi.fn()}
        onDuplicate={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText('Itens do Orçamento')).toBeInTheDocument();
    expect(screen.getByText('1 item')).toBeInTheDocument();
    expect(screen.getByText('1600×2100')).toBeInTheDocument();

    // Colunas especificadas na US-09.35
    expect(screen.getByText('Descrição / Template')).toBeInTheDocument();
    expect(screen.getByText('Medidas (L × A mm)')).toBeInTheDocument();
    expect(screen.getByText('Qtd')).toBeInTheDocument();
    expect(screen.getByText('Valor Unitário')).toBeInTheDocument();
    expect(screen.getByText('Subtotal')).toBeInTheDocument();
    expect(screen.getByText('Ações')).toBeInTheDocument();

    // Formatação em Real (R$)
    // Valor unitário calculado: 1800 / 2 = 900,00
    expect(screen.getByText(/R\$\s*900,00/)).toBeInTheDocument();
    // Subtotal: 1800,00
    expect(screen.getByText(/R\$\s*1\.800,00/)).toBeInTheDocument();
  });

  it('deve exibir o valor unitário customizado quando unitPrice for informado explicitamente', () => {
    const itemWithCustomUnitPrice: BudgetItem[] = [
      {
        ...sampleItems[0],
        unitPrice: 850,
        subtotal: 1700,
      },
    ];

    renderWithProviders(
      <BudgetItemsTable
        items={itemWithCustomUnitPrice}
        onEdit={vi.fn()}
        onDuplicate={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText(/R\$\s*850,00/)).toBeInTheDocument();
    expect(screen.getByText(/R\$\s*1\.700,00/)).toBeInTheDocument();
  });

  it('deve disparar onEdit ao clicar no botão de editar', async () => {
    const user = userEvent.setup();
    const handleEdit = vi.fn();

    renderWithProviders(
      <BudgetItemsTable
        items={sampleItems}
        onEdit={handleEdit}
        onDuplicate={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    const editBtn = screen.getByTitle('Editar item');
    await user.click(editBtn);

    expect(handleEdit).toHaveBeenCalledWith(sampleItems[0]);
  });

  it('deve disparar onDuplicate ao clicar no botão de duplicar', async () => {
    const user = userEvent.setup();
    const handleDuplicate = vi.fn();

    renderWithProviders(
      <BudgetItemsTable
        items={sampleItems}
        onEdit={vi.fn()}
        onDuplicate={handleDuplicate}
        onDelete={vi.fn()}
      />
    );

    const dupBtn = screen.getByTitle('Duplicar esquadria');
    await user.click(dupBtn);

    expect(handleDuplicate).toHaveBeenCalledWith(sampleItems[0]);
  });

  it('deve abrir modal de confirmação ao clicar em excluir e disparar onDelete ao confirmar', async () => {
    const user = userEvent.setup();
    const handleDelete = vi.fn();

    renderWithProviders(
      <BudgetItemsTable
        items={sampleItems}
        onEdit={vi.fn()}
        onDuplicate={vi.fn()}
        onDelete={handleDelete}
      />
    );

    const deleteBtn = screen.getByTitle('Remover item');
    await user.click(deleteBtn);

    // Modal de confirmação é exibido
    expect(screen.getByText('Excluir esquadria?')).toBeInTheDocument();
    const confirmBtn = screen.getByRole('button', { name: /excluir/i });
    await user.click(confirmBtn);

    expect(handleDelete).toHaveBeenCalledWith('temp-1');
  });
});
