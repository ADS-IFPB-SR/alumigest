import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  InitialStockSection,
  useInitialStockSection,
} from '../../../features/stock/components/InitialStockSection';
import type { InitialStockEntryRequest } from '../../../features/stock/types';

interface HarnessProps {
  readonly isOpen?: boolean;
  readonly syncedCostPrice?: number;
  readonly unitLabel?: string;
  readonly onValidate: (result: {
    valid: boolean;
    payload: InitialStockEntryRequest | null;
  }) => void;
}

function InitialStockHarness({
  isOpen = true,
  syncedCostPrice,
  unitLabel = 'barras',
  onValidate,
}: Readonly<HarnessProps>) {
  const initialStock = useInitialStockSection(isOpen, syncedCostPrice);

  return (
    <div>
      <InitialStockSection
        enabled={initialStock.enabled}
        draft={initialStock.draft}
        errors={initialStock.errors}
        unitLabel={unitLabel}
        onToggle={initialStock.toggleEnabled}
        onChangeField={initialStock.updateField}
      />
      <button
        type="button"
        onClick={() => onValidate(initialStock.validateAndBuildPayload())}
      >
        Validar
      </button>
    </div>
  );
}

describe('InitialStockSection & useInitialStockSection (US-22.3)', () => {
  it('deve iniciar desmarcado e retornar payload null para auto-provisionamento zerado', () => {
    const handleValidate = vi.fn();
    render(<InitialStockHarness onValidate={handleValidate} />);

    expect(
      screen.getByLabelText(/Dar entrada inicial no estoque/i)
    ).not.toBeChecked();
    expect(screen.queryByLabelText(/Quantidade Recebida/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Validar' }));

    expect(handleValidate).toHaveBeenCalledWith({
      valid: true,
      payload: null,
    });
  });

  it('deve expandir os campos e sincronizar o preço de custo do material ao marcar o checkbox', () => {
    render(
      <InitialStockHarness
        syncedCostPrice={145}
        unitLabel="barras"
        onValidate={vi.fn()}
      />
    );

    fireEvent.click(screen.getByLabelText(/Dar entrada inicial no estoque/i));

    expect(screen.getByLabelText(/Quantidade Recebida \(barras\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Preço de Compra Unit\./i)).toHaveValue(145);
  });

  it('deve bloquear validação quando quantidade ou preço unitário forem inválidos (RN-06)', () => {
    const handleValidate = vi.fn();
    render(<InitialStockHarness onValidate={handleValidate} />);

    fireEvent.click(screen.getByLabelText(/Dar entrada inicial no estoque/i));
    fireEvent.click(screen.getByRole('button', { name: 'Validar' }));

    expect(handleValidate).toHaveBeenCalledWith({
      valid: false,
      payload: null,
    });
    expect(
      screen.getByText(/quantidade recebida é obrigatória/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/preço de compra unitário é obrigatório/i)
    ).toBeInTheDocument();
  });

  it('deve aceitar documento livre sem chave SEFAZ (RN-05) e montar o payload completo', () => {
    const handleValidate = vi.fn();
    render(<InitialStockHarness syncedCostPrice={145} onValidate={handleValidate} />);

    fireEvent.click(screen.getByLabelText(/Dar entrada inicial no estoque/i));

    fireEvent.change(screen.getByLabelText(/Quantidade Recebida/i), {
      target: { value: '10' },
    });
    fireEvent.change(screen.getByLabelText(/Ponto de Pedido/i), {
      target: { value: '4' },
    });
    fireEvent.change(screen.getByLabelText(/Fornecedor/i), {
      target: { value: 'Distribuidora Asa' },
    });
    fireEvent.change(screen.getByLabelText(/Nº do Pedido \/ Recibo \/ NF/i), {
      target: { value: 'Pedido 1088' },
    });
    fireEvent.change(screen.getByLabelText(/Observações da Entrada/i), {
      target: { value: 'Chegada inicial do fornecedor' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Validar' }));

    expect(handleValidate).toHaveBeenCalledWith({
      valid: true,
      payload: {
        quantity: 10,
        unitCost: 145,
        minimumStock: 4,
        supplier: 'Distribuidora Asa',
        referenceDocument: 'Pedido 1088',
        reason: 'Chegada inicial do fornecedor',
      },
    });
  });

  it('deve limpar o estado ao fechar e reabrir o modal', () => {
    const { rerender } = render(
      <InitialStockHarness isOpen={true} onValidate={vi.fn()} />
    );

    const toggle = screen.getByLabelText(/Dar entrada inicial no estoque/i);
    fireEvent.click(toggle);
    expect(toggle).toBeChecked();

    rerender(<InitialStockHarness isOpen={false} onValidate={vi.fn()} />);
    rerender(<InitialStockHarness isOpen={true} onValidate={vi.fn()} />);

    expect(
      screen.getByLabelText(/Dar entrada inicial no estoque/i)
    ).not.toBeChecked();
  });
});