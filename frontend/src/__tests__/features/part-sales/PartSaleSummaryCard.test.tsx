import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PartSaleSummaryCard } from '@/features/part-sales/components/PartSaleSummaryCard';
import type { PartSaleItemDraft } from '@/features/part-sales/types';

describe('PartSaleSummaryCard [US-46.1] - Calculations & Action Handlers', () => {
  const sampleItems: PartSaleItemDraft[] = [
    {
      tempId: '1',
      materialType: 'HARDWARE',
      referenceId: 'ref-1',
      description: 'ROLDANA',
      quantity: 2,
      unitPrice: 25.0,
      totalPrice: 50.0,
    },
    {
      tempId: '2',
      materialType: 'HARDWARE',
      referenceId: 'ref-2',
      description: 'FECHADURA',
      quantity: 1,
      unitPrice: 100.0,
      totalPrice: 100.0,
    },
  ];

  it('deve calcular corretamente total de peças, subtotal bruto e valor total', () => {
    const onDiscountChange = vi.fn();
    const onSaveDraft = vi.fn();
    const onApproveSale = vi.fn();
    const onExportPdf = vi.fn();
    const onPrintLabels = vi.fn();

    render(
      <PartSaleSummaryCard
        items={sampleItems}
        discount={20}
        onDiscountChange={onDiscountChange}
        onSaveDraft={onSaveDraft}
        onApproveSale={onApproveSale}
        onExportPdf={onExportPdf}
        onPrintLabels={onPrintLabels}
      />
    );

    // Total de peças: 2 + 1 = 3
    const totalPiecesEl = document.getElementById('summaryTotalPieces');
    expect(totalPiecesEl).toHaveTextContent('3');

    // Subtotal: 50 + 100 = 150
    const subtotalEl = document.getElementById('summarySubtotal');
    expect(subtotalEl).toHaveTextContent('150,00');

    // Total final com desconto de 20: 150 - 20 = 130
    const totalValueEl = document.getElementById('summaryTotalValue');
    expect(totalValueEl).toHaveTextContent('130,00');
  });

  it('deve disparar onApproveSale e onSaveDraft ao clicar nos botões', () => {
    const onDiscountChange = vi.fn();
    const onSaveDraft = vi.fn();
    const onApproveSale = vi.fn();
    const onExportPdf = vi.fn();
    const onPrintLabels = vi.fn();

    render(
      <PartSaleSummaryCard
        items={sampleItems}
        discount={0}
        onDiscountChange={onDiscountChange}
        onSaveDraft={onSaveDraft}
        onApproveSale={onApproveSale}
        onExportPdf={onExportPdf}
        onPrintLabels={onPrintLabels}
      />
    );

    const approveBtn = screen.getByRole('button', { name: /aprovar venda/i });
    fireEvent.click(approveBtn);
    expect(onApproveSale).toHaveBeenCalledTimes(1);

    const draftBtn = screen.getByRole('button', { name: /salvar rascunho/i });
    fireEvent.click(draftBtn);
    expect(onSaveDraft).toHaveBeenCalledTimes(1);
  });
});

