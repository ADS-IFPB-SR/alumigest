import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { CatalogOperationGuideBanner } from '@/features/catalog/components/CatalogOperationGuideBanner';

const STORAGE_KEY = 'alumigest.catalog.hideOperationGuide';

describe('CatalogOperationGuideBanner Component (US-22.4)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('deve renderizar o guia expandido por padrão com a regra Make-to-Order e os 3 pontos operacionais', () => {
    render(<CatalogOperationGuideBanner pendingPurchaseCount={3} />);

    const banner = screen.getByTestId('catalog-operation-guide-banner');
    expect(banner).toBeInTheDocument();
    expect(banner).toHaveTextContent('Guia de Operação: Controle de Estoque Make-to-Order');
    expect(banner).toHaveTextContent('Regra Make-to-Order');
    expect(screen.getByTestId('operation-guide-pending-count')).toHaveTextContent(
      '3 insumos pendentes'
    );

    expect(banner).toHaveTextContent('Central 360° do Cliente (Aba O.S.)');
    expect(banner).toHaveTextContent('Painel Kanban Fabril');
    expect(banner).toHaveTextContent('Ficha Técnica e Etiquetas');
  });

  it('deve formatar o contador no singular e ocultá-lo quando pendingPurchaseCount for 0', () => {
    const { rerender } = render(<CatalogOperationGuideBanner pendingPurchaseCount={1} />);
    expect(screen.getByTestId('operation-guide-pending-count')).toHaveTextContent(
      '1 insumo pendente'
    );

    rerender(<CatalogOperationGuideBanner pendingPurchaseCount={0} />);
    expect(screen.queryByTestId('operation-guide-pending-count')).not.toBeInTheDocument();
  });

  it('deve recolher, persistir preferência no localStorage e permitir expandir novamente', () => {
    const { unmount } = render(<CatalogOperationGuideBanner pendingPurchaseCount={2} />);

    fireEvent.click(screen.getByTestId('btn-toggle-operation-guide'));

    expect(localStorage.getItem(STORAGE_KEY)).toBe('true');
    expect(screen.queryByTestId('catalog-operation-guide-banner')).not.toBeInTheDocument();
    expect(screen.getByTestId('catalog-operation-guide-collapsed')).toHaveTextContent(
      'Guia de Operação Make-to-Order'
    );
    expect(screen.getByTestId('operation-guide-pending-count')).toHaveTextContent(
      '2 insumos pendentes'
    );

    unmount();
    render(<CatalogOperationGuideBanner pendingPurchaseCount={2} />);
    expect(screen.getByTestId('catalog-operation-guide-collapsed')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('btn-toggle-operation-guide'));
    expect(localStorage.getItem(STORAGE_KEY)).toBe('false');
    expect(screen.getByTestId('catalog-operation-guide-banner')).toBeInTheDocument();
  });

  it('deve manter o funcionamento mesmo quando localStorage falhar', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Blocked');
    });

    render(<CatalogOperationGuideBanner pendingPurchaseCount={1} />);
    expect(screen.getByTestId('catalog-operation-guide-banner')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('btn-toggle-operation-guide'));
    expect(screen.getByTestId('catalog-operation-guide-collapsed')).toBeInTheDocument();
  });
});
