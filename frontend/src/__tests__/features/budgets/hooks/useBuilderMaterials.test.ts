import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBuilderMaterials } from '@/features/budgets/components/builder/hooks/useBuilderMaterials';
import { budgetsApi } from '@/features/budgets/services/budgetsApi';
import type { HandleConfig } from '@/features/budgets/types';
import type { GlassDTO, ProfileDTO, HardwareDTO, FilmDTO } from '@/features/catalog/types';

vi.mock('@/features/budgets/services/budgetsApi', () => ({
  budgetsApi: {
    previewItemCalculation: vi.fn(),
  },
}));

describe('useBuilderMaterials Hook [Joseph Nichollas]', () => {
  const mockGlasses: GlassDTO[] = [
    {
      id: 'g-1',
      name: 'Vidro Temperado Incolor 8mm',
      colorFinish: 'Incolor',
      salePrice: 160.0,
      thicknessMm: 8,
      active: true,
    },
  ];
  const mockProfiles: ProfileDTO[] = [
    {
      id: 'p-1',
      name: 'Perfil Alumínio Branco',
      colorFinish: 'Branco',
      salePrice: 45.0,
      unitMeasure: 'm',
      active: true,
    },
    {
      id: 'p-puxador',
      name: 'Perfil Puxador Integrado',
      salePrice: 70.0,
      unitMeasure: 'm',
      active: true,
    },
  ];
  const mockHardwares: HardwareDTO[] = [
    {
      id: 'h-1',
      name: 'Puxador Tubular Inox',
      salePrice: 90.0,
      unitMeasure: 'un',
      active: true,
    },
    {
      id: 'h-fecho',
      name: 'Fecho Concha Lateral',
      salePrice: 35.0,
      unitMeasure: 'un',
      active: true,
    },
    {
      id: 'h-macaneta',
      name: 'Maçaneta Alavanca',
      salePrice: 55.0,
      unitMeasure: 'un',
      active: true,
    },
  ];
  const mockFilms: FilmDTO[] = [
    {
      id: 'f-1',
      name: 'Película Fumê',
      salePrice: 80.0,
      active: true,
    },
  ];

  const findCatalogMaterial = (id: string) => {
    if (id === 'g-1')
      return {
        name: 'Vidro Temperado Incolor',
        unit: 'm²',
        price: 160,
        colorFinish: 'Incolor',
        categoryType: 'GLASS' as const,
      };
    if (id === 'p-1')
      return {
        name: 'Perfil Branco',
        unit: 'm',
        price: 45,
        colorFinish: 'Branco',
        categoryType: 'PROFILE' as const,
      };
    if (id === 'h-1')
      return {
        name: 'Puxador Tubular',
        unit: 'un',
        price: 90,
        categoryType: 'HARDWARE' as const,
      };
    return null;
  };

  const defaultHandleConfig: HandleConfig = {
    handleType: 'BAR_TUBULAR',
    side: 'ONE_SIDE',
    coverage: 'FULL',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

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

  describe('Adição e Remoção de Materiais (handleAddMaterial & handleRemoveMaterial)', () => {
    it('deve adicionar materiais padrões para todas as categorias', () => {
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
        result.current.handleAddMaterial('GLASS');
        result.current.handleAddMaterial('PROFILE');
        result.current.handleAddMaterial('HARDWARE');
        result.current.handleAddMaterial('FILM');
      });

      expect(result.current.materialSelections).toHaveLength(4);
      expect(result.current.materialSelections[0].categoryType).toBe('GLASS');
      expect(result.current.materialSelections[1].categoryType).toBe('PROFILE');
      expect(result.current.materialSelections[2].categoryType).toBe('HARDWARE');
      expect(result.current.materialSelections[3].categoryType).toBe('FILM');
    });

    it('deve remover material selecionado pelo requirementId', () => {
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
        result.current.handleRemoveMaterial(reqId);
      });

      expect(result.current.materialSelections).toHaveLength(0);
    });
  });

  describe('Alteração de Material (handleMaterialChange)', () => {
    it('deve limpar dados do material quando materialId for vazio', () => {
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
        result.current.handleMaterialChange(reqId, '');
      });

      expect(result.current.materialSelections[0].materialId).toBe('');
      expect(result.current.materialSelections[0].unitPrice).toBe(0);
    });

    it('deve atualizar material, preço e disparar onColorChange para PROFILE e GLASS', () => {
      const onColorChange = vi.fn();
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
          onColorChange,
        })
      );

      act(() => {
        result.current.handleAddMaterial('PROFILE');
      });

      const reqProfile = result.current.materialSelections[0].requirementId;
      act(() => {
        result.current.handleMaterialChange(reqProfile, 'p-1');
      });

      expect(onColorChange).toHaveBeenCalledWith('Branco', undefined);

      act(() => {
        result.current.handleAddMaterial('GLASS');
      });

      const reqGlass = result.current.materialSelections[1].requirementId;
      act(() => {
        result.current.handleMaterialChange(reqGlass, 'g-1');
      });

      expect(onColorChange).toHaveBeenCalledWith(undefined, 'Incolor');
    });
  });

  describe('Validação de Quantidades e Mínimos Físicos (handleMaterialQtyChange)', () => {
    it('deve validar quantidade e emitir warning para GLASS abaixo da área física', () => {
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
        result.current.handleAddMaterial('GLASS');
      });

      const reqId = result.current.materialSelections[0].requirementId;
      act(() => {
        result.current.setMaterialSelections((prev) =>
          prev.map((s) => ({ ...s, physicalMinimumQuantity: 2.5 }))
        );
      });

      act(() => {
        result.current.handleMaterialQtyChange(reqId, '1.2');
      });

      expect(result.current.materialSelections[0].quantity).toBe(1.2);
      expect(result.current.materialSelections[0].isBelowPhysicalMinimum).toBe(true);
      expect(result.current.materialSelections[0].warningMessage).toContain(
        'inferior à área física da esquadria'
      );
    });

    it('deve validar quantidade e emitir warning para PROFILE abaixo do perímetro mínimo', () => {
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
        result.current.setMaterialSelections((prev) =>
          prev.map((s) => ({ ...s, physicalMinimumQuantity: 6.0 }))
        );
      });

      act(() => {
        result.current.handleMaterialQtyChange(reqId, '3.5');
      });

      expect(result.current.materialSelections[0].quantity).toBe(3.5);
      expect(result.current.materialSelections[0].isBelowPhysicalMinimum).toBe(true);
      expect(result.current.materialSelections[0].warningMessage).toContain(
        'inferior ao perímetro mínimo'
      );
    });

    it('deve emitir warning genérico para HARDWARE abaixo do mínimo', () => {
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

      const reqId = result.current.materialSelections[0].requirementId;
      act(() => {
        result.current.setMaterialSelections((prev) =>
          prev.map((s) => ({ ...s, physicalMinimumQuantity: 4 }))
        );
      });

      act(() => {
        result.current.handleMaterialQtyChange(reqId, '2');
      });

      expect(result.current.materialSelections[0].isBelowPhysicalMinimum).toBe(true);
      expect(result.current.materialSelections[0].warningMessage).toContain(
        'inferior ao mínimo físico'
      );
    });
  });

  describe('Seleção de Puxador e Resolução de Tipos (handleSelectHandleMaterial)', () => {
    it('deve limpar insumo de puxador quando materialId for vazio', () => {
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
        result.current.handleSelectHandleMaterial('h-1');
      });

      expect(result.current.materialSelections).toHaveLength(1);

      act(() => {
        result.current.handleSelectHandleMaterial('');
      });

      expect(result.current.materialSelections[0].materialId).toBe('');
      expect(result.current.materialSelections[0].quantity).toBe(0);
    });

    it('deve resolver para PROFILE_HANDLE quando o material selecionado for perfil', () => {
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
        result.current.handleSelectHandleMaterial('p-puxador');
      });

      expect(onHandleConfigChange).toHaveBeenCalledWith(
        expect.objectContaining({
          handleType: 'PROFILE_HANDLE',
          coverage: 'FULL',
        })
      );
    });

    it('deve resolver para SHELL_LOCK quando ferragem contiver "fecho concha"', () => {
      const onHandleConfigChange = vi.fn();
      const { result } = renderHook(() =>
        useBuilderMaterials({
          isOpen: true,
          widthMm: 1200,
          heightMm: 2100,
          quantity: 1,
          handleConfig: { ...defaultHandleConfig, handleType: 'PROFILE_HANDLE' },
          glasses: mockGlasses,
          profiles: mockProfiles,
          hardwares: mockHardwares,
          films: mockFilms,
          findCatalogMaterial,
          onHandleConfigChange,
        })
      );

      act(() => {
        result.current.handleSelectHandleMaterial('h-fecho');
      });

      expect(onHandleConfigChange).toHaveBeenCalledWith(
        expect.objectContaining({
          handleType: 'SHELL_LOCK',
        })
      );
    });

    it('deve resolver para LEVER_HANDLE quando ferragem contiver "maçaneta"', () => {
      const onHandleConfigChange = vi.fn();
      const { result } = renderHook(() =>
        useBuilderMaterials({
          isOpen: true,
          widthMm: 1200,
          heightMm: 2100,
          quantity: 1,
          handleConfig: { ...defaultHandleConfig, handleType: 'PROFILE_HANDLE' },
          glasses: mockGlasses,
          profiles: mockProfiles,
          hardwares: mockHardwares,
          films: mockFilms,
          findCatalogMaterial,
          onHandleConfigChange,
        })
      );

      act(() => {
        result.current.handleSelectHandleMaterial('h-macaneta');
      });

      expect(onHandleConfigChange).toHaveBeenCalledWith(
        expect.objectContaining({
          handleType: 'LEVER_HANDLE',
        })
      );
    });

    it('deve disparar previewItemCalculation no debounce e atualizar opções', async () => {
      vi.useFakeTimers();
      vi.mocked(budgetsApi.previewItemCalculation).mockResolvedValueOnce({
        options: [
          {
            suggestedQuantity: 3.2,
            physicalMinimumQuantity: 2.0,
            isBelowPhysicalMinimum: false,
            warningMessage: undefined,
          },
        ],
      } as any);

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
        result.current.handleAddMaterial('GLASS');
      });

      await act(async () => {
        vi.advanceTimersByTime(400);
      });

      expect(budgetsApi.previewItemCalculation).toHaveBeenCalled();
      vi.useRealTimers();
    });
  });
});
