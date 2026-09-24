import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MaterialDetailsModal } from '../../../../features/catalog/components/MaterialDetailsModal';

describe('MaterialDetailsModal Component [Joseph Nichollas]', () => {
  const defaultItem = {
    id: 1,
    name: 'Perfil Linha Suprema',
    skuCode: 'PRF-SUP-01',
    active: true,
    commercialLine: 'Suprema 25',
    thicknessMm: 1.5,
    colorFinish: 'Branco',
    maxWidthMm: 2000,
    maxHeightMm: 3000,
    weightPerMeterKg: 0.85,
    standardLengthM: 6.0,
    pricePerMeter: 45.5,
  };

  it('não deve renderizar nada se o item for nulo', () => {
    const { container } = render(
      <MaterialDetailsModal isOpen={true} onClose={vi.fn()} onEdit={vi.fn()} item={null} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('deve renderizar todas as informações técnicas e valores do item', () => {
    render(
      <MaterialDetailsModal isOpen={true} onClose={vi.fn()} onEdit={vi.fn()} item={defaultItem} />
    );

    expect(screen.getByText('Especificações Técnicas e Detalhes')).toBeInTheDocument();
    expect(screen.getByText('PRF-SUP-01')).toBeInTheDocument();
    expect(screen.getByText('Ativo no Catálogo')).toBeInTheDocument();
    expect(screen.getByText('Perfil Linha Suprema')).toBeInTheDocument();
    expect(screen.getByText('Suprema 25')).toBeInTheDocument();
    expect(screen.getByText('1.5mm Branco')).toBeInTheDocument();
    expect(screen.getByText('2000 L x 3000 A')).toBeInTheDocument();
    expect(screen.getByText('0.850 Kg/m')).toBeInTheDocument();
    expect(screen.getByText('6,0 m')).toBeInTheDocument();
    expect(screen.getByText('R$ 45,50')).toBeInTheDocument();
  });

  it('deve renderizar badge de inativo e campos alternativos (weight/length/salePrice)', () => {
    const inactiveItem = {
      description: 'Vidro Fumê',
      commercialReference: 'VID-FUM-4',
      active: false,
      weight: 12.3456,
      length: 2.5,
      salePrice: 120,
    };

    render(
      <MaterialDetailsModal isOpen={true} onClose={vi.fn()} onEdit={vi.fn()} item={inactiveItem} />
    );

    expect(screen.getByText('Inativo no Catálogo')).toBeInTheDocument();
    expect(screen.getByText('VID-FUM-4')).toBeInTheDocument();
    expect(screen.getByText('Vidro Fumê')).toBeInTheDocument();
    expect(screen.getByText('12.346 Kg/m')).toBeInTheDocument();
    expect(screen.getByText('2,5 m')).toBeInTheDocument();
    expect(screen.getByText('R$ 120,00')).toBeInTheDocument();
  });

  it('deve acionar onClose ao clicar em Fechar', () => {
    const onClose = vi.fn();
    render(
      <MaterialDetailsModal isOpen={true} onClose={onClose} onEdit={vi.fn()} item={defaultItem} />
    );

    const closeBtns = screen.getAllByRole('button', { name: /Fechar/i });
    fireEvent.click(closeBtns[1]);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('deve acionar onClose e onEdit ao clicar em Editar Cadastro', () => {
    const onClose = vi.fn();
    const onEdit = vi.fn();
    render(
      <MaterialDetailsModal isOpen={true} onClose={onClose} onEdit={onEdit} item={defaultItem} />
    );

    const editBtn = screen.getByRole('button', { name: /Editar Cadastro/i });
    fireEvent.click(editBtn);

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onEdit).toHaveBeenCalledTimes(1);
  });
});
