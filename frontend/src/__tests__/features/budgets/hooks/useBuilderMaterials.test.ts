import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBuilderMaterials } from '@/features/budgets/components/builder/hooks/useBuilderMaterials';
import type { HandleConfig } from '@/features/budgets/types';
import type { GlassDTO, ProfileDTO, HardwareDTO, FilmDTO } from '@/features/catalog/types';

vi.mock('@/features/budgets/services/budgetsApi', () => ({
  budgetsApi: {
    calculateItem: vi.fn().mockResolvedValue({
      materials: [],
      subtotalMaterials: 0,
      totalPrice: 0,
    }),
  },
}));

describe('useBuilderMaterials Hook', () => {
  const mockGlasses: GlassDTO[] = [
    { id: 'g-1', name: 'Vidro Temperado Incolor 8mm', colorFinish: 'Incolor', salePrice: 160.0, thicknessMm: 8, active: true },
  ];
  const mockProfiles: ProfileDTO[] = [
    { id: 'p-1', name: 'Perfil Alumínio Branco', colorFinish: 'Branco', salePrice: 45.0, unitMeasure: 'm', active: true },
  ];
  const mockHardwares: HardwareDTO[] = [
    { id: 'h-1', name: 'Puxador Tubular Inox', salePrice: 90.0, unitMeasure: 'un', active: true },
  ];
  const mockFilms: FilmDTO[] = [];

  const findCatalogMaterial = (id: string) => {
    if (id === 'g-1') return { name: 'Vidro Temperado', unit: 'm²', price: 160, categoryType: 'GLASS' as const };
    if (id === 'p-1') return { name: 'Perfil Branco', unit: 'm', price: 45, categoryType: 'PROFILE' as const };
    if (id === 'h-1') return { name: 'Puxador Tubular', unit: 'un', price: 90, categoryType: 'HARDWARE' as const };
    return null;
  };

  const defaultHandleConfig: HandleConfig = {
    handleType: 'BAR_TUBULAR',
    side: 'ONE_SIDE',
    coverage: 'FULL',
  };

  describe('Técnica: Transição de Estados no Ciclo de Vida dos Insumos', () => {
    it('deve inicializar com lista vazia de insumos e handleMaterial nulo', () => {
      const { result } = renderHook(() =>
        useBuilderMaterials({
          isOpen: true,
          widthMm: 1200,
          heightMm: 2100,
          quantity: 1,
          handleConfig: defaultHandleConfig,
          glasses: mockGlasses,
          profiles: mockProfiles,
          hardwares: mockHardwares,
          films: mockFilms,
          findCatalogMaterial,
        })
      );

      expect(result.current.materialSelections).toEqual([]);
      expect(result.current.handleMaterial).toBeNull();
    });

    it('deve adicionar novo material avulso via handleAddMaterial', () => {
      const { result } = renderHook(() =>
        useBuilderMaterials({
          isOpen: true,
          widthMm: 1200,
          heightMm: 2100,
          quantity: 1,
          handleConfig: defaultHandleConfig,
          glasses: mockGlasses,
          profiles: mockProfiles,
          hardwares: mockHardwares,
          films: mockFilms,
          findCatalogMaterial,
        })
      );

      act(() => {
        result.current.handleAddMaterial('PROFILE');
      });

      expect(result.current.materialSelections.length).toBe(1);
      expect(result.current.materialSelections[0].materialId).toBe('p-1');
      expect(result.current.materialSelections[0].quantity).toBe(1);
      expect(result.current.materialSelections[0].unitPrice).toBe(45.0);
      expect(result.current.materialSelections[0].totalPrice).toBe(45.0);
    });

    it('deve atualizar a quantidade de um insumo existente recalculando o preço total', () => {
      const { result } = renderHook(() =>
        useBuilderMaterials({
          isOpen: true,
          widthMm: 1200,
          heightMm: 2100,
          quantity: 1,
          handleConfig: defaultHandleConfig,
          glasses: mockGlasses,
          profiles: mockProfiles,
          hardwares: mockHardwares,
          films: mockFilms,
          findCatalogMaterial,
        })
      );

      act(() => {
        result.current.handleAddMaterial('PROFILE');
      });

      const reqId = result.current.materialSelections[0].requirementId;

      act(() => {
        result.current.handleMaterialQtyChange(reqId, '5');
      });

      expect(result.current.materialSelections[0].quantity).toBe(5);
      expect(result.current.materialSelections[0].totalPrice).toBe(225.0);
    });

    it('deve remover material selecionado via handleRemoveMaterial', () => {
      const { result } = renderHook(() =>
        useBuilderMaterials({
          isOpen: true,
          widthMm: 1200,
          heightMm: 2100,
          quantity: 1,
          handleConfig: defaultHandleConfig,
          glasses: mockGlasses,
          profiles: mockProfiles,
          hardwares: mockHardwares,
          films: mockFilms,
          findCatalogMaterial,
        })
      );

      act(() => {
        result.current.handleAddMaterial('HARDWARE');
      });

      expect(result.current.materialSelections.length).toBe(1);
      const reqId = result.current.materialSelections[0].requirementId;

      act(() => {
        result.current.handleRemoveMaterial(reqId);
      });

      expect(result.current.materialSelections.length).toBe(0);
    });

    it('deve selecionar insumo de puxador via handleSelectHandleMaterial e sincronizar com handleConfig', () => {
      const onHandleConfigChange = vi.fn();
      const { result } = renderHook(() =>
        useBuilderMaterials({
          isOpen: true,
          widthMm: 1200,
          heightMm: 2100,
          quantity: 1,
          handleConfig: defaultHandleConfig,
          glasses: mockGlasses,
          profiles: mockProfiles,
          hardwares: mockHardwares,
          films: mockFilms,
          findCatalogMaterial,
          onHandleConfigChange,
        })
      );

      act(() => {
        result.current.handleSelectHandleMaterial('h-1');
      });

      expect(result.current.materialSelections.length).toBe(1);
      expect(result.current.materialSelections[0].materialId).toBe('h-1');
      expect(result.current.handleMaterial).not.toBeNull();
    });
  });
});
