import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AluminumItemFields } from '../../../features/part-sales/components/AluminumItemFields';

describe('AluminumItemFields Component (US-46.2)', () => {
  it('deve renderizar o badge de identificação visual âmbar "Metro Linear (m)"', () => {
    render(
      <AluminumItemFields
        lengthMm={2500}
        quantity={2}
        unitPrice={45}
        onLengthChange={vi.fn()}
        onQuantityChange={vi.fn()}
      />
    );

    const badge = screen.getByTestId('badge-metro-linear');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('Metro Linear (m)');
  });

  it('deve renderizar os campos de comprimento e quantidade, e NÃO conter campo de largura', () => {
    render(
      <AluminumItemFields
        lengthMm={2000}
        quantity={1}
        unitPrice={30}
        onLengthChange={vi.fn()}
        onQuantityChange={vi.fn()}
      />
    );

    expect(screen.getByTestId('input-aluminum-length')).toBeInTheDocument();
    expect(screen.getByTestId('input-aluminum-quantity')).toBeInTheDocument();
    // Verifica que não existe input de largura
    expect(screen.queryByLabelText(/largura/i)).not.toBeInTheDocument();
  });

  it('deve chamar onLengthChange ao digitar novo comprimento em milímetros', () => {
    const handleLengthChange = vi.fn();
    render(
      <AluminumItemFields
        lengthMm={''}
        quantity={1}
        unitPrice={30}
        onLengthChange={handleLengthChange}
        onQuantityChange={vi.fn()}
      />
    );

    const inputLength = screen.getByTestId('input-aluminum-length');
    fireEvent.change(inputLength, { target: { value: '2500' } });

    expect(handleLengthChange).toHaveBeenCalledWith(2500);
  });

  it('deve chamar onQuantityChange ao alterar a quantidade de barras', () => {
    const handleQuantityChange = vi.fn();
    render(
      <AluminumItemFields
        lengthMm={2000}
        quantity={1}
        unitPrice={30}
        onLengthChange={vi.fn()}
        onQuantityChange={handleQuantityChange}
      />
    );

    const inputQuantity = screen.getByTestId('input-aluminum-quantity');
    fireEvent.change(inputQuantity, { target: { value: '4' } });

    expect(handleQuantityChange).toHaveBeenCalledWith(4);
  });

  it('deve exibir mensagem de validação quando o comprimento exceder 6000 mm (barra industrial)', () => {
    render(
      <AluminumItemFields
        lengthMm={6500}
        quantity={1}
        unitPrice={30}
        onLengthChange={vi.fn()}
        onQuantityChange={vi.fn()}
      />
    );

    const errorMsg = screen.getByTestId('error-aluminum-length');
    expect(errorMsg).toBeInTheDocument();
    expect(errorMsg).toHaveTextContent(/não pode exceder 6000 mm/i);
  });

  it('deve exibir mensagem de validação quando o comprimento for zero ou negativo', () => {
    render(
      <AluminumItemFields
        lengthMm={0}
        quantity={1}
        unitPrice={30}
        onLengthChange={vi.fn()}
        onQuantityChange={vi.fn()}
      />
    );

    const errorMsg = screen.getByTestId('error-aluminum-length');
    expect(errorMsg).toBeInTheDocument();
    expect(errorMsg).toHaveTextContent(/deve ser maior que zero/i);
  });

  it('deve renderizar o painel de metragem faturada calculada e subtotal em moeda BRL', () => {
    render(
      <AluminumItemFields
        lengthMm={2500}
        quantity={4}
        unitPrice={45}
        lossFactor={0.05}
        calculatedMeters={10.5}
        totalPrice={472.5}
        onLengthChange={vi.fn()}
        onQuantityChange={vi.fn()}
      />
    );

    const panel = screen.getByTestId('panel-calculated-meters');
    expect(panel).toBeInTheDocument();
    expect(panel).toHaveTextContent('10.5000 m');
    expect(panel).toHaveTextContent('R$ 472,50');
    expect(panel).toHaveTextContent('inclui 5% de perda');
  });

  it('deve desabilitar os inputs quando a prop disabled for true', () => {
    render(
      <AluminumItemFields
        lengthMm={2500}
        quantity={2}
        unitPrice={40}
        disabled={true}
        onLengthChange={vi.fn()}
        onQuantityChange={vi.fn()}
        onPriceChange={vi.fn()}
      />
    );

    expect(screen.getByTestId('input-aluminum-length')).toBeDisabled();
    expect(screen.getByTestId('input-aluminum-quantity')).toBeDisabled();
    expect(screen.getByTestId('input-aluminum-price')).toBeDisabled();
  });
});
