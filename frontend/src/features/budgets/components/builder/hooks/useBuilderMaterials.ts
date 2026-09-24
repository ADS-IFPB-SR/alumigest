import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type {
  MaterialSelection,
  CategoryType,
  HandleConfig,
  HandleType,
  DoorTemplateType,
  BudgetItemCalculationRequest,
} from '../../../types';
import type { GlassDTO, ProfileDTO, HardwareDTO, FilmDTO } from '../../../../catalog/types';
import { budgetsApi } from '../../../services/budgetsApi';
import { CATEGORY_LABELS, DEFAULT_HEIGHT } from '../constants';
import {
  isHandleOrLockMaterial,
  syncHandleMaterialSelections,
} from './useMaterialSync';

function getDefaultUnitMeasure(catType: CategoryType): string {
  if (catType === 'GLASS' || catType === 'FILM') return 'm²';
  if (catType === 'PROFILE') return 'm';
  return 'un';
}

function calculateHandleUpdatedQty(
  newUnit: string,
  handleConfig: HandleConfig,
  heightMm?: number | ''
): number {
  const isBothSides = handleConfig.side === 'BOTH_SIDES';
  const sideMult = isBothSides ? 2 : 1;
  const newIsMeter = newUnit === 'M' || newUnit === 'METRO' || newUnit === 'METROS';
  const newIsPar = newUnit === 'PAR' || newUnit === 'PAIR' || newUnit === 'PARES';

  if (newIsMeter) {
    if (handleConfig.coverage === 'PIECE' && handleConfig.pieceLengthCm) {
      return Number.parseFloat(((handleConfig.pieceLengthCm / 100) * sideMult).toFixed(2));
    }
    const h = typeof heightMm === 'number' && heightMm > 0 ? heightMm : DEFAULT_HEIGHT;
    return Number.parseFloat(((h / 1000) * sideMult).toFixed(2));
  }
  if (newIsPar) {
    return isBothSides ? 1 : 0.5;
  }
  return isBothSides ? 2 : 1;
}

function calculateStandardUpdatedQty(
  oldUnit: string,
  newUnit: string,
  currentQty: number,
  heightMm?: number | ''
): number {
  const oldIsMeter = oldUnit === 'M' || oldUnit === 'METRO' || oldUnit === 'METROS';
  const newIsMeter = newUnit === 'M' || newUnit === 'METRO' || newUnit === 'METROS';

  if (oldIsMeter !== newIsMeter) {
    if (newIsMeter) {
      const h = typeof heightMm === 'number' && heightMm > 0 ? heightMm : DEFAULT_HEIGHT;
      return Number.parseFloat((h / 1000).toFixed(2));
    }
    return 1;
  }

  return currentQty;
}

function calculateUpdatedMaterialQty(
  isHandleMat: boolean,
  oldUnit: string,
  newUnit: string,
  currentQty: number,
  handleConfig: HandleConfig,
  heightMm?: number | ''
): number {
  if (isHandleMat) {
    return calculateHandleUpdatedQty(newUnit, handleConfig, heightMm);
  }
  return calculateStandardUpdatedQty(oldUnit, newUnit, currentQty, heightMm);
}

function validateMaterialQuantity(
  valStr: string | undefined,
  unitMeasure?: string,
  physicalMin?: number,
  categoryType?: CategoryType
): { qty?: number; isBelow: boolean; warning?: string } {
  const u = String(unitMeasure || '').toUpperCase().trim();
  const isIntegerUnit =
    u === 'UN' || u === 'UNIDADE' || u === 'PC' || u === 'PEÇA' || u === 'PECA' || u === 'CJ';
  let qty: number | undefined;

  if (valStr !== undefined && valStr !== '') {
    const num = Number.parseFloat(String(valStr).replace(',', '.'));
    if (!Number.isNaN(num) && num >= 0) {
      qty = isIntegerUnit ? Math.floor(num) : num;
    }
  }

  const isBelow =
    qty !== undefined &&
    physicalMin !== undefined &&
    physicalMin > 0 &&
    qty < physicalMin;

  let warning: string | undefined;
  if (isBelow) {
    if (categoryType === 'GLASS') {
      warning = `A quantidade (${qty} m²) é inferior à área física da esquadria (${physicalMin} m²). Risco de corte insuficiente!`;
    } else if (categoryType === 'PROFILE') {
      warning = `A metragem (${qty} m) é inferior ao perímetro mínimo (${physicalMin} m). Risco de barra insuficiente!`;
    } else {
      warning = `Quantidade informada (${qty}) é inferior ao mínimo físico (${physicalMin}).`;
    }
  }

  return { qty, isBelow, warning };
}

function resolveHandleNextType(
  catType: CategoryType,
  currentType: HandleType,
  matName: string
): HandleType {
  if (catType === 'PROFILE') {
    return currentType !== 'PROFILE_HANDLE' && currentType !== 'NONE'
      ? 'PROFILE_HANDLE'
      : currentType;
  }
  if (currentType === 'PROFILE_HANDLE') {
    const lower = matName.toLowerCase();
    if (lower.includes('fecho') || lower.includes('concha')) {
      return 'SHELL_LOCK';
    }
    if (lower.includes('maçaneta') || lower.includes('macaneta')) {
      return 'LEVER_HANDLE';
    }
    return 'BAR_TUBULAR';
  }
  return currentType;
}

/**
 * Propriedades para o hook useBuilderMaterials.
 */
export interface UseBuilderMaterialsProps {
  isOpen: boolean;
  widthMm: number | '';
  heightMm: number | '';
  quantity: number | '';
  templateType?: DoorTemplateType;
  handleConfig: HandleConfig;
  glasses: GlassDTO[];
  profiles: ProfileDTO[];
  hardwares: HardwareDTO[];
  films: FilmDTO[];
  findCatalogMaterial: (id: string) => {
    name: string;
    unit: string;
    price: number;
    colorFinish?: string;
    categoryType: CategoryType;
    familyCode?: string;
  } | null;
  onColorChange?: (alumColor?: string, glassColor?: string) => void;
  onHandleConfigChange?: (config: HandleConfig) => void;
}

/**
 * Subhook especializado na gestão da lista de insumos (`materialSelections`):
 * - Seleção e substituição de materiais vinculados aos requisitos da esquadria.
 * - Troca inteligente de unidades de medida (M / UN / PAR) e recálculo proporcional.
 * - Debounce assíncrono para validação de limites físicos e consumo sugerido pelo backend.
 * - Detecção e validação de quantidade inferior ao mínimo físico (alerta de corte insuficiente).
 */
export function useBuilderMaterials({
  isOpen,
  widthMm,
  heightMm,
  quantity,
  templateType,
  handleConfig,
  glasses,
  profiles,
  hardwares,
  films,
  findCatalogMaterial,
  onColorChange,
  onHandleConfigChange,
}: UseBuilderMaterialsProps) {
  const [materialSelections, setMaterialSelections] = useState<MaterialSelection[]>([]);

  const handleMaterial = useMemo(() => {
    return materialSelections.find(isHandleOrLockMaterial) ?? null;
  }, [materialSelections]);

  const materialSelectionsRef = useRef(materialSelections);
  materialSelectionsRef.current = materialSelections;

  // Recalcular consumo sugerido e limites físicos com o motor backend
  useEffect(() => {
    if (!isOpen) return;
    const w = typeof widthMm === 'number' ? widthMm : 0;
    const h = typeof heightMm === 'number' ? heightMm : 0;
    const qty = typeof quantity === 'number' && quantity > 0 ? quantity : 1;
    if (w <= 0 || h <= 0) return;

    const selections = materialSelectionsRef.current;
    if (!selections || selections.length === 0) return;

    const timer = setTimeout(async () => {
      try {
        const payload: BudgetItemCalculationRequest = {
          templateType: templateType || 'SLIDING_DOOR_2F',
          widthMm: w,
          heightMm: h,
          quantity: qty,
          options: selections.map((s) => ({
            materialId: s.materialId,
            categoryType: s.categoryType,
            manualQuantity: s.isManualOverride ? s.quantity : undefined,
          })),
        };

        const res = await budgetsApi.previewItemCalculation(payload);
        if (!res?.options) return;

        setMaterialSelections((prev) => {
          return prev.map((sel, idx) => {
            const optRes = res.options[idx];
            if (!optRes) return sel;

            const suggested = optRes.suggestedQuantity;
            const physMin = optRes.physicalMinimumQuantity;
            const isBelow = optRes.isBelowPhysicalMinimum;
            const warning = optRes.warningMessage;

            const isPuxadorOrHardware = isHandleOrLockMaterial(sel);

            const currentQty =
              (sel.isManualOverride || isPuxadorOrHardware) && sel.quantity !== undefined
                ? sel.quantity
                : suggested;
            const totalPrice =
              currentQty !== undefined ? Number.parseFloat((currentQty * sel.unitPrice).toFixed(2)) : undefined;

            return {
              ...sel,
              suggestedQuantity: suggested,
              physicalMinimumQuantity: physMin,
              quantity: currentQty,
              totalPrice,
              isBelowPhysicalMinimum: isBelow,
              warningMessage: warning,
            };
          });
        });
      } catch (err) {
        console.error('Erro ao calcular consumo de materiais no backend:', err);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [isOpen, widthMm, heightMm, quantity, templateType, materialSelections.length]);

  const handleMaterialChange = useCallback(
    (requirementId: string, materialId: string) => {
      const selIndex = materialSelections.findIndex((s) => s.requirementId === requirementId);
      if (selIndex === -1) return;
      const sel = materialSelections[selIndex];

      if (!materialId) {
        setMaterialSelections((prev) =>
          prev.map((s) =>
            s.requirementId === requirementId
              ? {
                  ...s,
                  materialId: '',
                  materialName: '',
                  unitPrice: 0,
                  quantity: undefined,
                  totalPrice: undefined,
                }
              : s
          )
        );
        return;
      }

      const mat = findCatalogMaterial(materialId);
      const unitPrice = mat?.price ?? 0;

      if (sel.categoryType === 'PROFILE' && mat) {
        onColorChange?.(mat.colorFinish || mat.name, undefined);
      }

      if (sel.categoryType === 'GLASS' && mat) {
        onColorChange?.(undefined, mat.colorFinish || mat.name);
      }

      const isHandleMat = handleMaterial?.requirementId === requirementId;

      setMaterialSelections((prev) => {
        return prev.map((s) => {
          if (s.requirementId !== requirementId) return s;

          const oldUnit = String(s.unitMeasure || '').toUpperCase().trim();
          const newUnit = String(mat?.unit ?? s.unitMeasure ?? '').toUpperCase().trim();
          const newQty = calculateUpdatedMaterialQty(
            isHandleMat,
            oldUnit,
            newUnit,
            s.quantity ?? 1,
            handleConfig,
            heightMm
          );

          return {
            ...s,
            categoryType: (mat?.categoryType as CategoryType) || s.categoryType,
            materialId,
            materialName: mat?.name ?? '',
            unitMeasure: mat?.unit ?? s.unitMeasure,
            unitPrice,
            quantity: newQty,
            familyCode: mat?.familyCode,
            totalPrice: Number.parseFloat((newQty * unitPrice).toFixed(2)),
            isManualOverride: true,
          };
        });
      });
    },
    [materialSelections, findCatalogMaterial, handleMaterial, handleConfig, heightMm, onColorChange]
  );

  const handleMaterialQtyChange = useCallback(
    (requirementId: string, valStr: string | undefined) => {
      setMaterialSelections((prev) =>
        prev.map((s) => {
          if (s.requirementId !== requirementId) return s;

          const { qty, isBelow, warning } = validateMaterialQuantity(
            valStr,
            s.unitMeasure,
            s.physicalMinimumQuantity,
            s.categoryType
          );

          return {
            ...s,
            quantity: qty,
            totalPrice: qty !== undefined ? Number.parseFloat((qty * s.unitPrice).toFixed(2)) : undefined,
            isManualOverride: true,
            isBelowPhysicalMinimum: isBelow,
            warningMessage: warning,
          };
        })
      );
    },
    []
  );

  const handleAddMaterial = useCallback(
    (catType: CategoryType) => {
      let defaultMat: { id: string; name: string; price: number; unit: string } | undefined;
      if (catType === 'GLASS' && glasses.length > 0)
        defaultMat = { id: glasses[0].id, name: glasses[0].name, price: glasses[0].salePrice ?? glasses[0].pricePerSqm ?? 0, unit: 'm²' };
      else if (catType === 'PROFILE' && profiles.length > 0)
        defaultMat = { id: profiles[0].id, name: profiles[0].name, price: profiles[0].salePrice ?? 0, unit: profiles[0].unitMeasure ?? 'm' };
      else if (catType === 'HARDWARE' && hardwares.length > 0)
        defaultMat = { id: hardwares[0].id, name: hardwares[0].name, price: hardwares[0].salePrice ?? 0, unit: hardwares[0].unitMeasure ?? 'un' };
      else if (catType === 'FILM' && films.length > 0)
        defaultMat = { id: films[0].id, name: films[0].name, price: films[0].salePrice ?? 0, unit: 'm²' };

      const newSel: MaterialSelection = {
        requirementId: `custom-mat-${Date.now()}`,
        categoryType: catType,
        label: `${CATEGORY_LABELS[catType]} (Adicional)`,
        isOptional: true,
        materialId: defaultMat?.id ?? '',
        materialName: defaultMat?.name ?? '',
        unitMeasure: defaultMat?.unit ?? getDefaultUnitMeasure(catType),
        unitPrice: defaultMat?.price ?? 0,
        quantity: 1,
        totalPrice: defaultMat?.price ?? 0,
      };

      setMaterialSelections((prev) => [...prev, newSel]);
    },
    [glasses, profiles, hardwares, films]
  );

  const handleRemoveMaterial = useCallback((requirementId: string) => {
    setMaterialSelections((prev) => prev.filter((s) => s.requirementId !== requirementId));
  }, []);

  const handleSelectHandleMaterial = useCallback(
    (materialId: string) => {
      if (!materialId) {
        setMaterialSelections((prev) =>
          prev.map((sel) => {
            const isH = handleMaterial?.requirementId === sel.requirementId;
            if (!isH) return sel;
            return {
              ...sel,
              materialId: '',
              materialName: '',
              unitPrice: 0,
              quantity: 0,
              totalPrice: 0,
              isManualOverride: true,
            };
          })
        );
        return;
      }

      const hw = hardwares.find((h) => h.id === materialId);
      const prof = !hw ? profiles.find((p) => p.id === materialId) : null;
      const catType: CategoryType = hw ? 'HARDWARE' : 'PROFILE';
      const matName = hw?.name ?? prof?.name ?? 'Material Puxador';
      const unitPrice = hw?.salePrice ?? prof?.salePrice ?? 0;
      const unitMeasure = hw ? hw.unitMeasure ?? 'un' : prof?.unitMeasure ?? 'm';
      const familyCode = hw?.familyCode ?? prof?.familyCode;

      const nextType = resolveHandleNextType(catType, handleConfig.handleType, matName);

      const isProfile = nextType === 'PROFILE_HANDLE';
      const newHandleConfig: HandleConfig = {
        ...handleConfig,
        handleType: nextType,
        coverage: isProfile ? handleConfig.coverage ?? 'FULL' : undefined,
        pieceLengthCm:
          isProfile && handleConfig.coverage === 'PIECE'
            ? handleConfig.pieceLengthCm ?? 40
            : undefined,
      };

      onHandleConfigChange?.(newHandleConfig);

      setMaterialSelections((prev) => {
        let targetReqId = handleMaterial?.requirementId;
        let found = false;
        const updated = prev.map((sel) => {
          const isH = sel.requirementId === handleMaterial?.requirementId;
          if (isH) {
            found = true;
            return {
              ...sel,
              categoryType: catType,
              label: catType === 'PROFILE' ? 'Perfil Puxador' : 'Puxador / Ferragem',
              materialId,
              materialName: matName,
              unitMeasure,
              unitPrice,
              familyCode,
            };
          }
          return sel;
        });

        if (!found) {
          targetReqId = `handle-mat-${Date.now()}`;
          updated.push({
            requirementId: targetReqId,
            categoryType: catType,
            label: catType === 'PROFILE' ? 'Perfil Puxador' : 'Puxador / Ferragem',
            isOptional: false,
            materialId,
            materialName: matName,
            unitMeasure,
            unitPrice,
            familyCode,
          });
        }

        return syncHandleMaterialSelections(updated, newHandleConfig, heightMm, targetReqId);
      });
    },
    [hardwares, profiles, handleMaterial, handleConfig, heightMm, onHandleConfigChange]
  );

  return {
    materialSelections,
    setMaterialSelections,
    handleMaterial,
    handleMaterialChange,
    handleMaterialQtyChange,
    handleAddMaterial,
    handleRemoveMaterial,
    handleSelectHandleMaterial,
  };
}
