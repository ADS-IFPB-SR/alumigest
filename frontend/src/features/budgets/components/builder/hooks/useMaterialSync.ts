import { useCallback } from 'react';
import type {
  HandleConfig,
  MaterialSelection,
  CategoryType,
  WindowTemplate,
} from '../../../types';
import type { GlassDTO, ProfileDTO, HardwareDTO, FilmDTO } from '../../../../catalog/types';
import { CATEGORY_LABELS, DEFAULT_HEIGHT } from '../constants';

/**
 * Verifica se um determinado insumo selecionado representa um puxador, fecho, concha ou maçaneta.
 */
export function isHandleOrLockMaterial(sel: {
  label?: string;
  materialName?: string;
  categoryType?: CategoryType;
}): boolean {
  const l = (sel.label || '').toLowerCase();
  const m = (sel.materialName || '').toLowerCase();
  return (
    l.includes('puxador') ||
    m.includes('puxador') ||
    l.includes('fecho') ||
    m.includes('fecho') ||
    l.includes('concha') ||
    m.includes('concha') ||
    l.includes('maçaneta') ||
    m.includes('macaneta') ||
    (sel.categoryType === 'HARDWARE' &&
      !l.includes('rold') &&
      !l.includes('escova') &&
      !l.includes('guia') &&
      !l.includes('parafuso'))
  );
}

/**
 * Sincroniza a quantidade física do insumo do puxador com a geometria selecionada:
 * - Se `NONE`: Zera o consumo e custo.
 * - Se medida em metros (M): Calcula o comprimento total ou do pedaço (levando em conta face única vs dupla).
 * - Se pares (PAR): 1 par para ambos os lados ou 0.5 para lado único.
 * - Se unidade (UN): 2 unidades para ambos os lados ou 1 para lado único.
 */
export function syncHandleMaterialSelections(
  selections: MaterialSelection[],
  newHandleConfig: HandleConfig,
  heightMm: number | '',
  targetRequirementId?: string,
): MaterialSelection[] {
  const isBothSides = newHandleConfig.side === 'BOTH_SIDES';
  const sideMult = isBothSides ? 2 : 1;
  const isNone = newHandleConfig.handleType === 'NONE';

  const activeHandleMat = selections.find(
    (s) =>
      (targetRequirementId && s.requirementId === targetRequirementId) ||
      s.requirementId.startsWith('handle-mat-') ||
      isHandleOrLockMaterial(s)
  );

  return selections.map((sel) => {
    const isTarget = targetRequirementId ? sel.requirementId === targetRequirementId : false;
    const isPuxador =
      isTarget ||
      (activeHandleMat && sel.requirementId === activeHandleMat.requirementId) ||
      isHandleOrLockMaterial(sel);

    if (!isPuxador) return sel;

    if (isNone) {
      return {
        ...sel,
        quantity: 0,
        totalPrice: 0,
        isManualOverride: true,
      };
    }

    const unitStr = String(sel.unitMeasure || '').toUpperCase().trim();
    const isMeter = unitStr === 'M' || unitStr === 'METRO' || unitStr === 'METROS';
    const isPar = unitStr === 'PAR' || unitStr === 'PAIR' || unitStr === 'PARES';

    let newQty: number;
    if (isMeter) {
      if (newHandleConfig.coverage === 'PIECE' && newHandleConfig.pieceLengthCm) {
        newQty = parseFloat(((newHandleConfig.pieceLengthCm / 100) * sideMult).toFixed(2));
      } else {
        const h = typeof heightMm === 'number' && heightMm > 0 ? heightMm : DEFAULT_HEIGHT;
        newQty = parseFloat(((h / 1000) * sideMult).toFixed(2));
      }
    } else if (isPar) {
      newQty = isBothSides ? 1 : 0.5;
    } else {
      newQty = isBothSides ? 2 : 1;
    }

    const unitPrice = sel.unitPrice ?? 0;
    return {
      ...sel,
      quantity: newQty,
      totalPrice: parseFloat((newQty * unitPrice).toFixed(2)),
      isManualOverride: true,
    };
  });
}

export interface UseMaterialSyncProps {
  glasses: GlassDTO[];
  profiles: ProfileDTO[];
  hardwares: HardwareDTO[];
  films: FilmDTO[];
}

export function useMaterialSync({
  glasses,
  profiles,
  hardwares,
  films,
}: UseMaterialSyncProps) {
  const findCatalogMaterial = useCallback(
    (materialId: string) => {
      if (!materialId) return null;
      const g = glasses.find((item) => item.id === materialId);
      if (g)
        return {
          name: g.name,
          unit: 'm²',
          price: g.salePrice ?? g.pricePerSqm ?? 0,
          colorFinish: g.colorFinish,
          categoryType: 'GLASS' as CategoryType,
          familyCode: g.familyCode,
        };
      const p = profiles.find((item) => item.id === materialId);
      if (p)
        return {
          name: p.name,
          unit: p.unitMeasure ?? 'm',
          price: p.salePrice ?? 0,
          colorFinish: p.colorFinish,
          categoryType: 'PROFILE' as CategoryType,
          familyCode: p.familyCode,
        };
      const h = hardwares.find((item) => item.id === materialId);
      if (h)
        return {
          name: h.name,
          unit: h.unitMeasure ?? 'un',
          price: h.salePrice ?? 0,
          colorFinish: undefined,
          categoryType: 'HARDWARE' as CategoryType,
          familyCode: h.familyCode,
        };
      const f = films.find((item) => item.id === materialId);
      if (f)
        return {
          name: f.name,
          unit: 'm²',
          price: f.salePrice ?? 0,
          colorFinish: f.colorFinish,
          categoryType: 'FILM' as CategoryType,
          familyCode: f.familyCode,
        };
      return null;
    },
    [glasses, profiles, hardwares, films]
  );

  const buildSelectionsForTemplate = useCallback(
    (
      targetTemplate: WindowTemplate,
      w: number,
      h: number,
      alumColor?: string,
      glassColor?: string
    ): MaterialSelection[] => {
      if (targetTemplate.items && targetTemplate.items.length > 0) {
        return targetTemplate.items.map((item) => {
          const mat = findCatalogMaterial(item.materialId);
          const reqId = item.id || `item-${item.materialId}`;
          const categoryType = (mat?.categoryType as CategoryType) || 'HARDWARE';
          const price = mat?.price ?? 0;
          const qty = item.quantity ?? 1;
          return {
            requirementId: reqId,
            categoryType,
            label: mat?.name ?? item.materialName ?? (CATEGORY_LABELS[categoryType] ?? categoryType),
            isOptional: false,
            materialId: item.materialId,
            materialName: mat?.name ?? item.materialName,
            unitMeasure: mat?.unit ?? 'un',
            unitPrice: price,
            quantity: qty,
            totalPrice: qty !== undefined ? parseFloat((qty * price).toFixed(2)) : undefined,
          };
        });
      }

      if (targetTemplate.categoryRequirements && targetTemplate.categoryRequirements.length > 0) {
        const areaM2 = parseFloat(((w / 1000) * (h / 1000)).toFixed(2));
        const selections: MaterialSelection[] = [];

        targetTemplate.categoryRequirements.forEach((req, idx) => {
          const catType: CategoryType = typeof req === 'string' ? (req as CategoryType) : (req.categoryType as CategoryType);
          let mat: { id: string; name: string; price: number; unit: string; familyCode?: string } | undefined;
          let qty = 1;

          if (catType === 'GLASS') {
            const matched = glassColor ? glasses.find((g) => g.colorFinish?.toLowerCase() === glassColor.toLowerCase()) : null;
            const chosen = matched ?? glasses[0];
            if (chosen) {
              mat = { id: chosen.id, name: chosen.name, price: chosen.salePrice ?? chosen.pricePerSqm ?? 0, unit: 'm²', familyCode: chosen.familyCode };
              qty = areaM2;
            }
          } else if (catType === 'PROFILE') {
            const matched = alumColor ? profiles.find((p) => p.colorFinish?.toLowerCase() === alumColor.toLowerCase()) : null;
            const chosen = matched ?? profiles[0];
            if (chosen) {
              mat = { id: chosen.id, name: chosen.name, price: chosen.salePrice ?? 0, unit: chosen.unitMeasure ?? 'm', familyCode: chosen.familyCode };
              qty = 2;
            }

          } else if (catType === 'HARDWARE') {
            const chosen = hardwares[0];
            if (chosen) {
              mat = { id: chosen.id, name: chosen.name, price: chosen.salePrice ?? 0, unit: chosen.unitMeasure ?? 'un', familyCode: chosen.familyCode };
              qty = 1;
            }
          } else if (catType === 'FILM') {
            const chosen = films[0];
            if (chosen) {
              mat = { id: chosen.id, name: chosen.name, price: chosen.salePrice ?? 0, unit: 'm²', familyCode: chosen.familyCode };
              qty = areaM2;
            }
          }

          selections.push({
            requirementId: `req-${targetTemplate.id}-${catType}-${idx}`,
            categoryType: catType,
            label: CATEGORY_LABELS[catType] ?? catType,
            isOptional: false,
            materialId: mat?.id ?? '',
            materialName: mat?.name ?? '',
            unitMeasure: mat?.unit ?? (catType === 'GLASS' || catType === 'FILM' ? 'm²' : catType === 'PROFILE' ? 'm' : 'un'),
            unitPrice: mat?.price ?? 0,
            quantity: qty,
            totalPrice: mat ? parseFloat((qty * mat.price).toFixed(2)) : 0,
            familyCode: mat?.familyCode,
          });
        });

        return selections;
      }

      const fallbackSelections: MaterialSelection[] = [];
      const areaM2 = parseFloat(((w / 1000) * (h / 1000)).toFixed(2));
      if (glasses.length > 0) {
        fallbackSelections.push({
          requirementId: 'default-glass-1',
          categoryType: 'GLASS',
          label: 'Vidro Principal',
          isOptional: false,
          materialId: glasses[0].id,
          materialName: glasses[0].name,
          unitMeasure: 'm²',
          unitPrice: glasses[0].salePrice ?? glasses[0].pricePerSqm ?? 0,
          quantity: areaM2,
          totalPrice: parseFloat((areaM2 * (glasses[0].salePrice ?? glasses[0].pricePerSqm ?? 0)).toFixed(2)),
          familyCode: glasses[0].familyCode,
        });
      }
      if (profiles.length > 0) {
        fallbackSelections.push({
          requirementId: 'default-profile-1',
          categoryType: 'PROFILE',
          label: 'Perfil de Alumínio',
          isOptional: false,
          materialId: profiles[0].id,
          materialName: profiles[0].name,
          unitMeasure: profiles[0].unitMeasure ?? 'm',
          unitPrice: profiles[0].salePrice ?? 0,
          quantity: 2,
          totalPrice: parseFloat((2 * (profiles[0].salePrice ?? 0)).toFixed(2)),
          familyCode: profiles[0].familyCode,
        });
      }
      if (hardwares.length > 0) {
        fallbackSelections.push({
          requirementId: 'default-hardware-1',
          categoryType: 'HARDWARE',
          label: 'Puxador / Ferragem',
          isOptional: false,
          materialId: hardwares[0].id,
          materialName: hardwares[0].name,
          unitMeasure: hardwares[0].unitMeasure ?? 'un',
          unitPrice: hardwares[0].salePrice ?? 0,
          quantity: 1,
          totalPrice: parseFloat((1 * (hardwares[0].salePrice ?? 0)).toFixed(2)),
          familyCode: hardwares[0].familyCode,
        });
      }
      return fallbackSelections;
    },
    [glasses, profiles, hardwares, films, findCatalogMaterial]
  );

  return {
    findCatalogMaterial,
    buildSelectionsForTemplate,
  };
}
