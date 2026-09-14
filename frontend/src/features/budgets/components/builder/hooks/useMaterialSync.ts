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
  requirementId?: string;
  label?: string;
  materialName?: string;
  categoryType?: CategoryType;
}): boolean {
  const req = (sel.requirementId || '').toLowerCase();
  const l = (sel.label || '').toLowerCase();
  const m = (sel.materialName || '').toLowerCase();
  return (
    req === 'req-handle' ||
    req.startsWith('handle-mat-') ||
    l.includes('puxador') ||
    m.includes('puxador') ||
    l.includes('fecho') ||
    m.includes('fecho') ||
    l.includes('concha') ||
    m.includes('concha') ||
    l.includes('maçaneta') ||
    m.includes('macaneta')
  );
}

/**
 * Obtém a quantidade de folhas móveis que levam puxador de acordo com a tipologia.
 * - Portas de 4 folhas (2 móveis de encontro no centro) ou giro duplo: 2 folhas móveis com puxador.
 * - Demais tipologias (1 móvel): 1 folha móvel com puxador.
 */
export function getMovingLeavesCount(templateType?: string | null): number {
  if (!templateType) return 1;
  const t = templateType.toUpperCase();
  if (t === 'SLIDING_DOOR_4F' || t === 'SWING_DOOR_2F') {
    return 2;
  }
  return 1;
}

/**
 * Sincroniza a quantidade física do insumo do puxador com a geometria selecionada:
 * - Se `NONE`: Zera o consumo e custo.
 * - Se medida em metros (M): Calcula o comprimento total ou do pedaço (levando em conta face única vs dupla e folhas móveis).
 * - Se pares (PAR): 1 par cobre 1 folha móvel frente e verso completa (se for 4 folhas com 2 móveis de encontro, são 2 pares).
 * - Se unidade (UN): 1 unidade por lado por folha móvel.
 */
export function syncHandleMaterialSelections(
  selections: MaterialSelection[],
  newHandleConfig: HandleConfig,
  heightMm: number | '',
  targetRequirementId?: string,
  templateType?: string | null,
): MaterialSelection[] {
  const isBothSides = newHandleConfig.side === 'BOTH_SIDES';
  const sideMult = isBothSides ? 2 : 1;
  const isNone = newHandleConfig.handleType === 'NONE';
  const movingLeaves = getMovingLeavesCount(templateType);

  // Identifica o insumo de puxador principal ativo
  const activeHandleMat = selections.find(
    (s) =>
      (targetRequirementId && s.requirementId === targetRequirementId) ||
      s.requirementId === 'req-handle' ||
      s.requirementId.startsWith('handle-mat-') ||
      Boolean(s.materialName?.toLowerCase().includes('puxador')) ||
      Boolean(s.label?.toLowerCase().includes('puxador')) ||
      isHandleOrLockMaterial(s)
  );

  return selections.map((sel) => {
    const isTarget = targetRequirementId ? sel.requirementId === targetRequirementId : false;
    const isPuxador =
      isTarget ||
      sel.requirementId === activeHandleMat?.requirementId ||
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
        newQty = Number.parseFloat(((newHandleConfig.pieceLengthCm / 100) * sideMult * movingLeaves).toFixed(2));
      } else {
        const h = typeof heightMm === 'number' && heightMm > 0 ? heightMm : DEFAULT_HEIGHT;
        newQty = Number.parseFloat(((h / 1000) * sideMult * movingLeaves).toFixed(2));
      }
    } else if (isPar) {
      // 1 PAR já é composto pelas 2 pegadas (frente e verso) para 1 folha móvel.
      // Portanto, portas normais levam 1 par, e portas de 4 folhas (2 móveis de encontro) levam 2 pares!
      newQty = movingLeaves;
    } else {
      // Unidades avulsas: 1 por lado por folha móvel (ex: 2 lados = 2 UN para 1 folha, 4 UN para 4 folhas)
      newQty = sideMult * movingLeaves;
    }

    const unitPrice = sel.unitPrice ?? 0;
    return {
      ...sel,
      quantity: newQty,
      totalPrice: Number.parseFloat((newQty * unitPrice).toFixed(2)),
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

interface RequirementMaterialResult {
  mat?: { id: string; name: string; price: number; unit: string; familyCode?: string };
  qty: number;
}

function resolveGlassMaterial(glassColor: string | undefined, glasses: GlassDTO[], areaM2: number): RequirementMaterialResult | null {
  const matched = glassColor ? glasses.find((g) => g.colorFinish?.toLowerCase() === glassColor.toLowerCase()) : null;
  const chosen = matched ?? glasses[0];
  if (!chosen) return null;
  return {
    mat: { id: chosen.id, name: chosen.name, price: chosen.salePrice ?? chosen.pricePerSqm ?? 0, unit: 'm²', familyCode: chosen.familyCode },
    qty: areaM2,
  };
}

function resolveProfileMaterial(alumColor: string | undefined, profiles: ProfileDTO[]): RequirementMaterialResult | null {
  const matched = alumColor ? profiles.find((p) => p.colorFinish?.toLowerCase() === alumColor.toLowerCase()) : null;
  const chosen = matched ?? profiles[0];
  if (!chosen) return null;
  return {
    mat: { id: chosen.id, name: chosen.name, price: chosen.salePrice ?? 0, unit: chosen.unitMeasure ?? 'm', familyCode: chosen.familyCode },
    qty: 2,
  };
}

function resolveHardwareMaterial(hardwares: HardwareDTO[]): RequirementMaterialResult | null {
  const chosen = hardwares[0];
  if (!chosen) return null;
  return {
    mat: { id: chosen.id, name: chosen.name, price: chosen.salePrice ?? 0, unit: chosen.unitMeasure ?? 'un', familyCode: chosen.familyCode },
    qty: 1,
  };
}

function resolveFilmMaterial(films: FilmDTO[], areaM2: number): RequirementMaterialResult | null {
  const chosen = films[0];
  if (!chosen) return null;
  return {
    mat: { id: chosen.id, name: chosen.name, price: chosen.salePrice ?? 0, unit: 'm²', familyCode: chosen.familyCode },
    qty: areaM2,
  };
}

function resolveRequirementMaterial(
  catType: CategoryType,
  areaM2: number,
  glassColor?: string,
  alumColor?: string,
  catalog?: {
    glasses: GlassDTO[];
    profiles: ProfileDTO[];
    hardwares: HardwareDTO[];
    films: FilmDTO[];
  }
): RequirementMaterialResult {
  if (catType === 'GLASS') {
    const res = resolveGlassMaterial(glassColor, catalog?.glasses ?? [], areaM2);
    if (res) return res;
  } else if (catType === 'PROFILE') {
    const res = resolveProfileMaterial(alumColor, catalog?.profiles ?? []);
    if (res) return res;
  } else if (catType === 'HARDWARE') {
    const res = resolveHardwareMaterial(catalog?.hardwares ?? []);
    if (res) return res;
  } else if (catType === 'FILM') {
    const res = resolveFilmMaterial(catalog?.films ?? [], areaM2);
    if (res) return res;
  }

  return { qty: 1 };
}

function getDefaultUnitMeasure(catType: CategoryType): string {
  if (catType === 'GLASS' || catType === 'FILM') return 'm²';
  if (catType === 'PROFILE') return 'm';
  return 'un';
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
            totalPrice: qty !== undefined ? Number.parseFloat((qty * price).toFixed(2)) : undefined,
          };
        });
      }

      if (targetTemplate.categoryRequirements && targetTemplate.categoryRequirements.length > 0) {
        const areaM2 = Number.parseFloat(((w / 1000) * (h / 1000)).toFixed(2));
        const catalog = { glasses, profiles, hardwares, films };

        return targetTemplate.categoryRequirements.map((req, idx) => {
          const catType: CategoryType = typeof req === 'string' ? (req as CategoryType) : (req.categoryType as CategoryType);
          const { mat, qty } = resolveRequirementMaterial(catType, areaM2, glassColor, alumColor, catalog);

          return {
            requirementId: `req-${targetTemplate.id}-${catType}-${idx}`,
            categoryType: catType,
            label: CATEGORY_LABELS[catType] ?? catType,
            isOptional: false,
            materialId: mat?.id ?? '',
            materialName: mat?.name ?? '',
            unitMeasure: mat?.unit ?? getDefaultUnitMeasure(catType),
            unitPrice: mat?.price ?? 0,
            quantity: qty,
            totalPrice: mat ? Number.parseFloat((qty * mat.price).toFixed(2)) : 0,
            familyCode: mat?.familyCode,
          };
        });
      }

      const fallbackSelections: MaterialSelection[] = [];
      const areaM2 = Number.parseFloat(((w / 1000) * (h / 1000)).toFixed(2));
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
          totalPrice: Number.parseFloat((areaM2 * (glasses[0].salePrice ?? glasses[0].pricePerSqm ?? 0)).toFixed(2)),
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
          totalPrice: Number.parseFloat((2 * (profiles[0].salePrice ?? 0)).toFixed(2)),
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
          totalPrice: Number.parseFloat((1 * (hardwares[0].salePrice ?? 0)).toFixed(2)),
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
