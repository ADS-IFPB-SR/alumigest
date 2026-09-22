import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import {
  isHandleOrLockMaterial,
  getMovingLeavesCount,
  syncHandleMaterialSelections,
  useMaterialSync,
} from '@/features/budgets/components/builder/hooks/useMaterialSync';
import type { MaterialSelection, HandleConfig } from '@/features/budgets/types';
import type { GlassDTO, ProfileDTO, HardwareDTO, FilmDTO } from '@/features/catalog/types';

describe('useMaterialSync and Material Helpers', () => {
  describe('Técnica: Particionamento em Classes de Equivalência - isHandleOrLockMaterial', () => {
    it('deve identificar insumo como puxador ou fecho baseado em requirementId', () => {
      expect(isHandleOrLockMaterial({ requirementId: 'req-handle' })).toBe(true);
      expect(isHandleOrLockMaterial({ requirementId: 'handle-mat-1' })).toBe(true);
      expect(isHandleOrLockMaterial({ requirementId: 'req-glass' })).toBe(false);
    });

    it('deve identificar puxador por label ou nome (case insensitive)', () => {
      expect(isHandleOrLockMaterial({ label: 'Puxador Tubular Inox' })).toBe(true);
      expect(isHandleOrLockMaterial({ materialName: 'FECHO CONCHA LATERAL' })).toBe(true);
      expect(isHandleOrLockMaterial({ label: 'Maçaneta Cromada' })).toBe(true);
      expect(isHandleOrLockMaterial({ label: 'Vidro Temperado' })).toBe(false);
    });
  });

  describe('Técnica: Tabela de Decisão - getMovingLeavesCount', () => {
    it('deve retornar 2 folhas móveis para portas de 4 folhas de correr e giro duplo', () => {
      // Regra 1: SLIDING_DOOR_4F -> 2 móveis
      expect(getMovingLeavesCount('SLIDING_DOOR_4F')).toBe(2);
      // Regra 2: SWING_DOOR_2F -> 2 móveis
      expect(getMovingLeavesCount('SWING_DOOR_2F')).toBe(2);
    });

    it('deve retornar 1 folha móvel para tipologias padrão ou nulas', () => {
      // Regra 3: SLIDING_DOOR_2F -> 1 móvel
      expect(getMovingLeavesCount('SLIDING_DOOR_2F')).toBe(1);
      // Regra 4: null ou indefinido -> 1 móvel
      expect(getMovingLeavesCount(null)).toBe(1);
      expect(getMovingLeavesCount(undefined)).toBe(1);
    });
  });

  describe('Técnica: Tabela de Decisão e BVA - syncHandleMaterialSelections', () => {
    const baseSelection: MaterialSelection = {
      requirementId: 'req-handle',
      categoryType: 'HARDWARE',
      materialId: 'mat-1',
      materialName: 'Puxador Teste',
      quantity: 1,
      unitPrice: 50.0,
      unitMeasure: 'UN',
      totalPrice: 50.0,
    };

    it('Regra 1: Tipo NONE zera quantidade e preço do puxador', () => {
      const config: HandleConfig = { handleType: 'NONE' };
      const updated = syncHandleMaterialSelections([baseSelection], config, 2100);

      expect(updated[0].quantity).toBe(0);
      expect(updated[0].totalPrice).toBe(0);
      expect(updated[0].isManualOverride).toBe(true);
    });

    it('Regra 2: Medida em Metros (M) com cobertura FULL e face única (ONE_SIDE)', () => {
      // 2100mm = 2.1m * 1 lado * 1 folha = 2.10m
      const selMeter: MaterialSelection = { ...baseSelection, unitMeasure: 'M', unitPrice: 100.0 };
      const config: HandleConfig = { handleType: 'BAR_TUBULAR', side: 'ONE_SIDE', coverage: 'FULL' };
      const updated = syncHandleMaterialSelections([selMeter], config, 2100, undefined, 'SLIDING_DOOR_2F');

      expect(updated[0].quantity).toBe(2.1);
      expect(updated[0].totalPrice).toBe(210.0);
    });

    it('Regra 3: Medida em Metros (M) com cobertura FULL, dois lados (BOTH_SIDES) e 4 folhas (2 móveis)', () => {
      // 2.1m * 2 lados * 2 folhas = 8.40m
      const selMeter: MaterialSelection = { ...baseSelection, unitMeasure: 'M', unitPrice: 10.0 };
      const config: HandleConfig = { handleType: 'BAR_TUBULAR', side: 'BOTH_SIDES', coverage: 'FULL' };
      const updated = syncHandleMaterialSelections([selMeter], config, 2100, undefined, 'SLIDING_DOOR_4F');

      expect(updated[0].quantity).toBe(8.4);
      expect(updated[0].totalPrice).toBe(84.0);
    });

    it('Regra 4: Medida em Metros (M) com cobertura PIECE (pedaço especificado em cm)', () => {
      // 40 cm = 0.40m * 2 lados * 1 folha = 0.80m
      const selMeter: MaterialSelection = { ...baseSelection, unitMeasure: 'M', unitPrice: 50.0 };
      const config: HandleConfig = {
        handleType: 'PROFILE_HANDLE',
        side: 'BOTH_SIDES',
        coverage: 'PIECE',
        pieceLengthCm: 40,
      };
      const updated = syncHandleMaterialSelections([selMeter], config, 2100);

      expect(updated[0].quantity).toBe(0.8);
      expect(updated[0].totalPrice).toBe(40.0);
    });

    it('Regra 5: Medida em PAR com 1 folha móvel vs 2 folhas móveis', () => {
      const selPar: MaterialSelection = { ...baseSelection, unitMeasure: 'PAR', unitPrice: 80.0 };
      const config: HandleConfig = { handleType: 'BAR_TUBULAR', side: 'BOTH_SIDES' };

      // 1 folha móvel -> 1 par
      const updated1 = syncHandleMaterialSelections([selPar], config, 2100, undefined, 'SLIDING_DOOR_2F');
      expect(updated1[0].quantity).toBe(1);
      expect(updated1[0].totalPrice).toBe(80.0);

      // 2 folhas móveis -> 2 pares
      const updated2 = syncHandleMaterialSelections([selPar], config, 2100, undefined, 'SLIDING_DOOR_4F');
      expect(updated2[0].quantity).toBe(2);
      expect(updated2[0].totalPrice).toBe(160.0);
    });

    it('Regra 6: Medida em UNIDADE (UN) avulsa (ONE_SIDE = 1, BOTH_SIDES = 2)', () => {
      const configOneSide: HandleConfig = { handleType: 'BAR_TUBULAR', side: 'ONE_SIDE' };
      const updated1 = syncHandleMaterialSelections([baseSelection], configOneSide, 2100);
      expect(updated1[0].quantity).toBe(1);

      const configBothSides: HandleConfig = { handleType: 'BAR_TUBULAR', side: 'BOTH_SIDES' };
      const updated2 = syncHandleMaterialSelections([baseSelection], configBothSides, 2100);
      expect(updated2[0].quantity).toBe(2);
    });
  });

  describe('Hook useMaterialSync', () => {
    const mockGlasses: GlassDTO[] = [
      { id: 'g-1', name: 'Vidro Incolor 8mm', colorFinish: 'Incolor', salePrice: 150.0, familyCode: 'TEMPERADO', thicknessMm: 8, active: true },
    ];
    const mockProfiles: ProfileDTO[] = [
      { id: 'p-1', name: 'Perfil Alumínio Branco', colorFinish: 'Branco', salePrice: 40.0, unitMeasure: 'm', familyCode: 'LINHA_25', active: true },
    ];
    const mockHardwares: HardwareDTO[] = [
      { id: 'h-1', name: 'Roldana 1125', salePrice: 15.0, unitMeasure: 'un', familyCode: 'ROLDANA', active: true },
    ];
    const mockFilms: FilmDTO[] = [
      { id: 'f-1', name: 'Película Fumê', salePrice: 60.0, familyCode: 'SOLAR', active: true },
    ];

    it('deve localizar materiais no catálogo por ID', () => {
      const { result } = renderHook(() =>
        useMaterialSync({
          glasses: mockGlasses,
          profiles: mockProfiles,
          hardwares: mockHardwares,
          films: mockFilms,
        })
      );

      const foundGlass = result.current.findCatalogMaterial('g-1');
      expect(foundGlass).not.toBeNull();
      expect(foundGlass?.name).toBe('Vidro Incolor 8mm');
      expect(foundGlass?.price).toBe(150.0);

      const foundProfile = result.current.findCatalogMaterial('p-1');
      expect(foundProfile?.unit).toBe('m');

      const notFound = result.current.findCatalogMaterial('unknown-id');
      expect(notFound).toBeNull();
    });
  });
});
