import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MaterialPickerModal } from '@/features/catalog/components/builder/MaterialPickerModal';
import type { MaterialSummary } from '@/features/catalog/types';

describe('MaterialPickerModal Component', () => {
  const mockMaterials: MaterialSummary[] = [
    {
      id: 'mat-1',
      name: 'Perfil Alumínio Branco',
      categoryType: 'PROFILE',
      skuCode: 'PRF-01',
      unitMeasure: 'm',
      salePrice: 45.0,
      active: true,
    },
    {
      id: 'mat-2',
      name: 'Vidro Temperado Incolor',
      categoryType: 'GLASS',
      skuCode: 'VID-01',
      unitMeasure: 'm²',
      salePrice: 160.0,
      active: true,
    },
  ];

  it('não deve renderizar quando isOpen for false', () => {
    const { container } = render(
      <MaterialPickerModal
        isOpen={false}
        onClose={vi.fn()}
        onSelect={vi.fn()}
        materials={mockMaterials}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('deve listar materiais disponíveis', () => {
    render(
      <MaterialPickerModal
        isOpen={true}
        onClose={vi.fn()}
        onSelect={vi.fn()}
        materials={mockMaterials}
      />
    );

    expect(screen.getByText('Perfil Alumínio Branco')).toBeInTheDocument();
    expect(screen.getByText('Vidro Temperado Incolor')).toBeInTheDocument();
  });

  it('Técnica: Transição e Filtro - deve filtrar lista com base no termo de busca', () => {
    render(
      <MaterialPickerModal
        isOpen={true}
        onClose={vi.fn()}
        onSelect={vi.fn()}
        materials={mockMaterials}
      />
    );

    const searchInput = screen.getByPlaceholderText('Buscar por nome ou código...');
    fireEvent.change(searchInput, { target: { value: 'vidro' } });

    expect(screen.getByText('Vidro Temperado Incolor')).toBeInTheDocument();
    expect(screen.queryByText('Perfil Alumínio Branco')).not.toBeInTheDocument();
  });

  it('deve disparar onSelect ao clicar em um material disponível', () => {
    const onSelect = vi.fn();

    render(
      <MaterialPickerModal
        isOpen={true}
        onClose={vi.fn()}
        onSelect={onSelect}
        materials={mockMaterials}
      />
    );

    const itemBtn = screen.getByText('Perfil Alumínio Branco').closest('button');
    fireEvent.click(itemBtn!);

    expect(onSelect).toHaveBeenCalledWith(mockMaterials[0]);
  });

  it('não deve permitir selecionar material já adicionado', () => {
    const onSelect = vi.fn();

    render(
      <MaterialPickerModal
        isOpen={true}
        onClose={vi.fn()}
        onSelect={onSelect}
        materials={mockMaterials}
        addedMaterialIds={['mat-1']}
      />
    );

    expect(screen.getByText('Item já adicionado na ficha')).toBeInTheDocument();
    const itemBtn = screen.getByText('Perfil Alumínio Branco').closest('button');
    expect(itemBtn).toBeDisabled();

    fireEvent.click(itemBtn!);
    expect(onSelect).not.toHaveBeenCalled();
  });
});
