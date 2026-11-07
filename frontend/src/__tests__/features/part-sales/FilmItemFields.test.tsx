import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilmItemFields } from '../../../features/part-sales/components/FilmItemFields';

describe('FilmItemFields Component (US-46.3 - Películas)', () => {
  it('deve renderizar o badge de identificação visual esmeralda "Película (m²)"', () => {
    render(
      <FilmItemFields
        widthMm={1000}
        heightMm={1500}
        quantity={1}
        unitPrice={50}
        lossFactor={0.15}
        onWidthChange={vi.fn()}
        onHeightChange={vi.fn()}
        onQuantityChange={vi.fn()}
        onPriceChange={vi.fn()}
        onLossFactorChange={vi.fn()}
      />
    );

    const badge = screen.getByTestId('badge-film-category');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('Película (m²)');
  });

  it('deve renderizar os campos de largura, altura, quantidade, perda e preço', () => {
    render(
      <FilmItemFields
        widthMm={1000}
        heightMm={2000}
        quantity={1}
        unitPrice={50}
        lossFactor={0.15}
        onWidthChange={vi.fn()}
        onHeightChange={vi.fn()}
        onQuantityChange={vi.fn()}
        onPriceChange={vi.fn()}
        onLossFactorChange={vi.fn()}
      />
    );

    expect(screen.getByTestId('input-film-width')).toBeInTheDocument();
    expect(screen.getByTestId('input-film-height')).toBeInTheDocument();
    expect(screen.getByTestId('input-film-quantity')).toBeInTheDocument();
    expect(screen.getByTestId('input-film-loss')).toBeInTheDocument();
    expect(screen.getByTestId('input-film-price')).toBeInTheDocument();
  });

  it('deve chamar onLossFactorChange ao alterar a porcentagem de perda da bobina', () => {
    const handleLossChange = vi.fn();

    render(
      <FilmItemFields
        widthMm={1000}
        heightMm={1000}
        quantity={1}
        unitPrice={50}
        lossFactor={0.15}
        onWidthChange={vi.fn()}
        onHeightChange={vi.fn()}
        onQuantityChange={vi.fn()}
        onPriceChange={vi.fn()}
        onLossFactorChange={handleLossChange}
      />
    );

    const inputLoss = screen.getByTestId('input-film-loss');
    fireEvent.change(inputLoss, { target: { value: '20' } });

    expect(handleLossChange).toHaveBeenCalledWith(0.20);
  });

  it('deve exibir aviso visual quando a largura exceder o limite padrão da bobina (1520 mm)', () => {
    render(
      <FilmItemFields
        widthMm={1600} // Acima de 1520mm
        heightMm={2000}
        quantity={1}
        unitPrice={50}
        lossFactor={0.15}
        onWidthChange={vi.fn()}
        onHeightChange={vi.fn()}
        onQuantityChange={vi.fn()}
        onPriceChange={vi.fn()}
        onLossFactorChange={vi.fn()}
      />
    );

    const errorMsg = screen.getByTestId('warning-film-oversized');
    expect(errorMsg).toBeInTheDocument();
    expect(errorMsg).toHaveTextContent(/largura excedeu 1520mm/i);
  });

  it('deve renderizar o painel de área cobrada com fator de perda e subtotal em BRL', () => {
    render(
      <FilmItemFields
        widthMm={1000}
        heightMm={1000}
        quantity={1}
        unitPrice={50}
        lossFactor={0.15}
        calculatedArea={1.15}
        totalPrice={57.50}
        onWidthChange={vi.fn()}
        onHeightChange={vi.fn()}
        onQuantityChange={vi.fn()}
        onPriceChange={vi.fn()}
        onLossFactorChange={vi.fn()}
      />
    );

    const panel = screen.getByTestId('panel-calculated-film-area');
    expect(panel).toBeInTheDocument();
    expect(panel).toHaveTextContent('1.1500 m²');
    expect(panel).toHaveTextContent('R$ 57,50');
  });

  it('deve desabilitar os inputs quando a prop disabled for true', () => {
    render(
      <FilmItemFields
        widthMm={1000}
        heightMm={1000}
        quantity={1}
        unitPrice={50}
        lossFactor={0.15}
        disabled={true}
        onWidthChange={vi.fn()}
        onHeightChange={vi.fn()}
        onQuantityChange={vi.fn()}
        onPriceChange={vi.fn()}
        onLossFactorChange={vi.fn()}
      />
    );

    expect(screen.getByTestId('input-film-width')).toBeDisabled();
    expect(screen.getByTestId('input-film-height')).toBeDisabled();
    expect(screen.getByTestId('input-film-quantity')).toBeDisabled();
    expect(screen.getByTestId('input-film-loss')).toBeDisabled();
    expect(screen.getByTestId('input-film-price')).toBeDisabled();
  });
});