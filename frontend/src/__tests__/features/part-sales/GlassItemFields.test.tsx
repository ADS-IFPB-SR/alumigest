import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GlassItemFields } from '../../../features/part-sales/components/GlassItemFields';

describe('GlassItemFields Component (US-46.3 - Vidros)', () => {
  it('deve renderizar o badge de identificação visual ciano "Vidro (m²)"', () => {
    render(
      <GlassItemFields
        widthMm={1000}
        heightMm={1500}
        quantity={1}
        unitPrice={120}
        onWidthChange={vi.fn()}
        onHeightChange={vi.fn()}
        onQuantityChange={vi.fn()}
        onPriceChange={vi.fn()}
      />
    );

    const badge = screen.getByTestId('badge-glass-category');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('Vidro (m²)');
  });

  it('deve renderizar os campos de largura, altura, quantidade e preço', () => {
    render(
      <GlassItemFields
        widthMm={1000}
        heightMm={2000}
        quantity={1}
        unitPrice={150}
        onWidthChange={vi.fn()}
        onHeightChange={vi.fn()}
        onQuantityChange={vi.fn()}
        onPriceChange={vi.fn()}
      />
    );

    expect(screen.getByTestId('input-glass-width')).toBeInTheDocument();
    expect(screen.getByTestId('input-glass-height')).toBeInTheDocument();
    expect(screen.getByTestId('input-glass-quantity')).toBeInTheDocument();
    expect(screen.getByTestId('input-glass-price')).toBeInTheDocument();
  });

  it('deve chamar onWidthChange e onHeightChange ao alterar as dimensões em milímetros', () => {
    const handleWidthChange = vi.fn();
    const handleHeightChange = vi.fn();

    render(
      <GlassItemFields
        widthMm={''}
        heightMm={''}
        quantity={1}
        unitPrice={120}
        onWidthChange={handleWidthChange}
        onHeightChange={handleHeightChange}
        onQuantityChange={vi.fn()}
        onPriceChange={vi.fn()}
      />
    );

    const inputWidth = screen.getByTestId('input-glass-width');
    const inputHeight = screen.getByTestId('input-glass-height');

    fireEvent.change(inputWidth, { target: { value: '800' } });
    fireEvent.change(inputHeight, { target: { value: '1200' } });

    expect(handleWidthChange).toHaveBeenCalledWith(800);
    expect(handleHeightChange).toHaveBeenCalledWith(1200);
  });

  it('deve exibir mensagem de aviso quando o piso mínimo de 0.25 m² estiver atuando para peças pequenas', () => {
    render(
      <GlassItemFields
        widthMm={300}
        heightMm={400} // 300x400mm = 0.12m² (abaixo de 0.25m²)
        quantity={1}
        unitPrice={100}
        calculatedArea={0.25}
        totalPrice={25.0}
        onWidthChange={vi.fn()}
        onHeightChange={vi.fn()}
        onQuantityChange={vi.fn()}
        onPriceChange={vi.fn()}
      />
    );

    const warningNotice = screen.getByTestId('warning-minimum-area');
    expect(warningNotice).toBeInTheDocument();
    expect(warningNotice).toHaveTextContent(/piso mínimo aplicado.*0,25 m²/i);
  });

  it('deve renderizar o painel de área faturável calculada e subtotal em moeda BRL', () => {
    render(
      <GlassItemFields
        widthMm={1000}
        heightMm={2000}
        quantity={2}
        unitPrice={120}
        calculatedArea={4.0}
        totalPrice={480.0}
        onWidthChange={vi.fn()}
        onHeightChange={vi.fn()}
        onQuantityChange={vi.fn()}
        onPriceChange={vi.fn()}
      />
    );

    const panel = screen.getByTestId('panel-calculated-glass-area');
    expect(panel).toBeInTheDocument();
    expect(panel).toHaveTextContent('4.0000 m²');
    expect(panel).toHaveTextContent('R$ 480,00');
  });

  it('deve desabilitar os inputs quando a prop disabled for true', () => {
    render(
      <GlassItemFields
        widthMm={1000}
        heightMm={1000}
        quantity={1}
        unitPrice={120}
        disabled={true}
        onWidthChange={vi.fn()}
        onHeightChange={vi.fn()}
        onQuantityChange={vi.fn()}
        onPriceChange={vi.fn()}
      />
    );

    expect(screen.getByTestId('input-glass-width')).toBeDisabled();
    expect(screen.getByTestId('input-glass-height')).toBeDisabled();
    expect(screen.getByTestId('input-glass-quantity')).toBeDisabled();
    expect(screen.getByTestId('input-glass-price')).toBeDisabled();
  });
});