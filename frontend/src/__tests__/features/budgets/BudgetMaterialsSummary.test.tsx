import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { BudgetMaterialsSummary } from '../../../features/budgets/components/BudgetMaterialsSummary';
import { renderWithProviders } from '../../../test/test-utils';
import type { BudgetItemOption } from '../../../features/budgets/types';

describe('BudgetMaterialsSummary', () => {
  it('não deve renderizar nada se a lista de itens estiver vazia', () => {
    const { container } = renderWithProviders(
      <BudgetMaterialsSummary items={[]} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('não deve renderizar nada se nenhum item contiver insumos/opções válidas', () => {
    const { container } = renderWithProviders(
      <BudgetMaterialsSummary
        items={[
          { quantity: 2, options: [] },
          { quantity: 1, options: [{ materialId: '', materialName: '' } as unknown as BudgetItemOption] },
        ]}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('deve consolidar insumos idênticos agrupando quantidades e calculando custos', () => {
    const items = [
      {
        quantity: 2,
        options: [
          {
            materialId: 'mat-profile-1',
            materialName: 'Perfil Tubo 50x25 Preto',
            categoryType: 'PROFILE' as const,
            unitMeasure: 'm',
            quantity: 5, // 5m por esquadria * 2 = 10m
            unitPrice: 30, // 10m * 30 = 300
          },
          {
            materialId: 'mat-glass-1',
            materialName: 'Vidro Incolor 8mm',
            categoryType: 'GLASS' as const,
            unitMeasure: 'm²',
            quantity: 2, // 2m² * 2 = 4m²
            unitPrice: 150, // 4 * 150 = 600
          },
        ],
      },
      {
        quantity: 1,
        options: [
          {
            materialId: 'mat-profile-1',
            materialName: 'Perfil Tubo 50x25 Preto',
            categoryType: 'PROFILE' as const,
            unitMeasure: 'm',
            quantity: 4, // 4m * 1 = 4m
            unitPrice: 30, // 4 * 30 = 120
          },
          {
            materialId: 'mat-lock-1',
            materialName: 'Fecho Concha Preto',
            categoryType: 'HARDWARE' as const,
            unitMeasure: 'un',
            quantity: 1, // 1 * 1 = 1
            unitPrice: 45, // 45
          },
        ],
      },
    ];

    renderWithProviders(<BudgetMaterialsSummary items={items} />);

    // Total de materiais distintos: 3
    expect(screen.getByText(/3 materiais distintos/i)).toBeInTheDocument();

    // Categorias renderizadas
    expect(screen.getByText(/Perfis de Alumínio/i)).toBeInTheDocument();
    expect(screen.getByText(/Vidros/i)).toBeInTheDocument();
    expect(screen.getByText(/Ferragens & Acessórios/i)).toBeInTheDocument();

    // Quantidades consolidadas:
    // Perfil Tubo: 10 + 4 = 14 m
    expect(screen.getByText('14 m')).toBeInTheDocument();
    // Vidro: 4 m²
    expect(screen.getByText('4 m²')).toBeInTheDocument();
    // Fecho: 1 un
    expect(screen.getByText('1 un')).toBeInTheDocument();

    // Total de insumos: (14 * 30 = 420) + (4 * 150 = 600) + 45 = 1065
    expect(screen.getByText(/Total Insumos:/i)).toBeInTheDocument();
  });
});
