import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type {
  DoorTemplateType,
  OpeningDirection,
  BuilderState,
  BudgetItem,
  HandleConfig,
  HandlePosition,
  HandleOrientation,
  DrillingConfig,
  HandleType,
  HandleSide,
  HandleCoverage,
  DivisionType,
  MaterialSelection,
  CategoryType,
  WindowTemplate,
  BudgetItemCalculationRequest,
  BudgetItemCalculationOptionResult,
} from '../../../types';
import type { Product, GlassDTO, ProfileDTO, HardwareDTO, FilmDTO } from '../../../../catalog/types';
import {
  useProducts,
  useGlasses,
  useProfiles,
  useHardwares,
  useFilms,
} from '../../../../catalog/hooks/useCatalog';
import { calcItemSubtotal } from '../../../utils/calculations';
import { budgetsApi } from '../../../services/budgetsApi';
import {
  getDefaultSvgTemplateForCatalogType,
  mapCatalogAluminumColor,
  mapCatalogGlassColor,
} from '../../../utils/mapCatalogTemplate';
import { TEMPLATE_TYPE_INFO } from '../../../types';
import toast from 'react-hot-toast';

import { syncHandleMaterialSelections, isHandleOrLockMaterial } from './useMaterialSync';

export const BASE_ALUMINUM_COLORS = [
  'Alumínio Fosco / Anodizado',
  'Preto Fosco',
  'Branco Brilhante',
  'Bronze / Champanhe',
  'Cromado / Polido',
  'Dourado / Gold',
];

export const BASE_GLASS_FINISHES = [
  'Incolor',
  'Fumê / Cinza',
  'Verde',
  'Canelado / Texturizado',
  'Reflecta Bronze',
];

export type BuilderStep = 1 | 2 | 3 | 4;

export const CATEGORY_ICONS: Record<CategoryType, string> = {
  GLASS: 'grid_view',
  PROFILE: 'view_stream',
  HARDWARE: 'hardware',
  FILM: 'layers',
};

export const CATEGORY_LABELS: Record<string, string> = {
  GLASS: 'Vidros',
  PROFILE: 'Perfis de Alumínio',
  HARDWARE: 'Ferragens / Componentes',
  FILM: 'Películas',
};

export const DEFAULT_WIDTH = 1600;
export const DEFAULT_HEIGHT = 2150;

interface CatalogMaterialLookup {
  name: string;
  unit: string;
  price: number;
  colorFinish?: string;
  categoryType: CategoryType;
}

function estimateProfileLinearMeters(templateType: string | undefined, w: number, h: number): number {
  const widthM = (w || 0) / 1000;
  const heightM = (h || 0) / 1000;
  const t = (templateType || '').toUpperCase();
  if (t === 'SWING_DOOR_2F' || t === 'SWING_2_LEAF' || t === 'SLIDING_DOOR_2F' || t === 'SLIDING_2_LEAF') {
    // 2 Folhas: 2 Larguras + 4 Alturas (Ex: 1600x2150 => 2*1.6 + 4*2.15 = 3.20 + 8.60 = 11.80m)
    return Number.parseFloat((2 * widthM + 4 * heightM).toFixed(2));
  }
  if (t === 'SLIDING_DOOR_3F' || t === 'SLIDING_3_LEAF') {
    return Number.parseFloat((2 * widthM + 6 * heightM).toFixed(2));
  }
  if (t === 'SLIDING_DOOR_4F' || t === 'SLIDING_4_LEAF') {
    return Number.parseFloat((2 * widthM + 8 * heightM).toFixed(2));
  }
  // 1 Folha ou padrão
  return Number.parseFloat(((2 * ((w || 0) + (h || 0))) / 1000).toFixed(2));
}

function computeRequirementMeasure(catType: CategoryType, areaM2: number, profileMeters: number): { qty: number; unit: string } {
  if (catType === 'GLASS' || catType === 'FILM') {
    return { qty: areaM2, unit: 'm²' };
  }
  if (catType === 'PROFILE') {
    return { qty: profileMeters, unit: 'm' };
  }
  return { qty: 1, unit: 'un' };
}

function buildDefaultSelectionsForTemplate(
  targetTemplate: WindowTemplate,
  w: number,
  h: number,
): MaterialSelection[] {
  const areaM2 = Number.parseFloat(((w / 1000) * (h / 1000)).toFixed(2));
  const tType = targetTemplate.templateType || targetTemplate.catalogTemplateType || undefined;
  const profileM = estimateProfileLinearMeters(tType, w, h);

  if (targetTemplate.categoryRequirements && targetTemplate.categoryRequirements.length > 0) {
    return targetTemplate.categoryRequirements.map((req, idx) => {
      const catType: CategoryType = typeof req === 'string' ? (req as CategoryType) : (req.categoryType as CategoryType);
      const { qty, unit } = computeRequirementMeasure(catType, areaM2, profileM);

      return {
        requirementId: `req-${targetTemplate.id}-${catType}-${idx}`,
        categoryType: catType,
        label: CATEGORY_LABELS[catType] ?? catType,
        isOptional: false,
        materialId: '',
        materialName: '',
        unitMeasure: unit,
        unitPrice: 0,
        quantity: qty,
        suggestedQuantity: qty,
        physicalMinimumQuantity: qty,
        totalPrice: 0,
      };
    });
  }

  return [
    {
      requirementId: 'fallback-glass',
      categoryType: 'GLASS',
      label: CATEGORY_LABELS.GLASS,
      isOptional: false,
      materialId: '',
      materialName: '',
      unitMeasure: 'm²',
      unitPrice: 0,
      quantity: areaM2,
      suggestedQuantity: areaM2,
      physicalMinimumQuantity: areaM2,
      totalPrice: 0,
    },
    {
      requirementId: 'fallback-profile',
      categoryType: 'PROFILE',
      label: CATEGORY_LABELS.PROFILE,
      isOptional: false,
      materialId: '',
      materialName: '',
      unitMeasure: 'm',
      unitPrice: 0,
      quantity: profileM,
      suggestedQuantity: profileM,
      physicalMinimumQuantity: profileM,
      totalPrice: 0,
    },
    {
      requirementId: 'fallback-hardware',
      categoryType: 'HARDWARE',
      label: CATEGORY_LABELS.HARDWARE,
      isOptional: false,
      materialId: '',
      materialName: '',
      unitMeasure: 'un',
      unitPrice: 0,
      quantity: 1,
      suggestedQuantity: 1,
      physicalMinimumQuantity: 1,
      totalPrice: 0,
    },
  ];
}

function buildEditingItemSelections(
  editingItem: BudgetItem,
  findCatalogMaterial: (id: string) => CatalogMaterialLookup | null,
): MaterialSelection[] {
  return (editingItem.options ?? []).map((opt, idx) => {
    const mat = findCatalogMaterial(opt.materialId);
    const reqId = `edit-item-${opt.materialId}-${idx}`;
    const categoryType = opt.categoryType || (mat?.categoryType as CategoryType) || 'HARDWARE';
    const price = opt.unitPrice || mat?.price || 0;
    const qty = opt.quantity ?? 1;
    return {
      requirementId: reqId,
      categoryType,
      label: CATEGORY_LABELS[categoryType] ?? categoryType,
      isOptional: false,
      materialId: opt.materialId,
      materialName: opt.materialName || mat?.name || 'Material',
      unitMeasure: opt.unitMeasure || mat?.unit || 'un',
      unitPrice: price,
      quantity: qty,
      totalPrice: qty !== undefined ? Number.parseFloat((qty * price).toFixed(2)) : undefined,
    };
  });
}

function computeEditingDrillDistances(editingItem: BudgetItem): number[] {
  const editCount = editingItem.drillingConfig?.holeCount ?? 2;
  const editH = editingItem.heightMm ?? 2100;
  const step = Math.round(editH / (editCount + 1));
  const fallbackDists = Array.from({ length: editCount }, (_, i) => step * (i + 1));
  if (editingItem.drillingConfig?.customDistancesMm?.length === editCount) {
    return editingItem.drillingConfig.customDistancesMm;
  }
  return fallbackDists;
}

function buildEditingItemState(
  editingItem: BudgetItem,
  templates: WindowTemplate[],
  findCatalogMaterial: (id: string) => CatalogMaterialLookup | null,
): { state: BuilderState; holeInputs: string[] } {
  const template = templates.find((t) => t.id === editingItem.productId) ?? templates[0] ?? null;
  const selections = buildEditingItemSelections(editingItem, findCatalogMaterial);
  const dists = computeEditingDrillDistances(editingItem);

  return {
    state: {
      template,
      templateType: (editingItem.templateType as DoorTemplateType) || undefined,
      widthMm: editingItem.widthMm ?? editingItem.width ?? DEFAULT_WIDTH,
      heightMm: editingItem.heightMm ?? editingItem.height ?? DEFAULT_HEIGHT,
      quantity: editingItem.quantity,
      openingDirection: editingItem.templateConfig?.openingDirection ?? 'LEFT_TO_RIGHT',
      handleConfig: editingItem.handleConfig ?? {
        handleType: 'BAR_TUBULAR',
        side: 'ONE_SIDE',
        coverage: 'FULL',
        pieceLengthCm: 40,
      },
      drillingConfig: editingItem.drillingConfig ?? {
        holeCount: 2,
        divisionType: 'EQUAL',
        customDistancesMm: dists,
      },
      aluminumColor: editingItem.templateConfig?.aluminumColor ?? 'Alumínio Fosco / Anodizado',
      glassFinish: editingItem.templateConfig?.glassFinish ?? 'Fumê / Cinza',
      laborCost: editingItem.laborCost ?? 0,
      notes: editingItem.notes ?? '',
      materialSelections: selections,
    },
    holeInputs: dists.map(String),
  };
}

function computeDefaultOpeningDirection(
  rawDir: string | undefined,
  supportedDirections: string[],
): OpeningDirection {
  let normalized = rawDir;
  if (normalized === 'OUTSIDE') normalized = 'LEFT_TO_RIGHT';
  if (normalized === 'INSIDE') normalized = 'RIGHT_TO_LEFT';
  if (normalized && supportedDirections.includes(normalized)) {
    return normalized as OpeningDirection;
  }
  return (supportedDirections[0] ?? 'LEFT_TO_RIGHT') as OpeningDirection;
}

function computeDefaultHandleConfig(cfgHandle: any): HandleConfig {
  if (!cfgHandle) {
    return {
      handleType: 'BAR_TUBULAR',
      side: 'ONE_SIDE',
      coverage: 'FULL',
      pieceLengthCm: 40,
    };
  }
  return {
    handleType: cfgHandle.handleType ?? 'BAR_TUBULAR',
    side: cfgHandle.side ?? 'ONE_SIDE',
    coverage: cfgHandle.coverage ?? (cfgHandle.handleLengthMm && cfgHandle.handleLengthMm >= 1000 ? 'FULL' : 'PIECE'),
    pieceLengthCm: cfgHandle.pieceLengthCm ?? (cfgHandle.handleLengthMm ? Math.round(cfgHandle.handleLengthMm / 10) : 40),
  };
}

function resolveDefaultDrillPositions(cfgDrill: any): number[] {
  if (cfgDrill?.customPositionsMm && cfgDrill.customPositionsMm.length > 0) {
    return cfgDrill.customPositionsMm;
  }
  if (cfgDrill && 'customDistancesMm' in cfgDrill && cfgDrill.customDistancesMm && cfgDrill.customDistancesMm.length > 0) {
    return cfgDrill.customDistancesMm;
  }
  return [100, 500, 560, 100];
}

function computeDefaultDrillingConfig(cfgDrill: any): DrillingConfig {
  const drillPositions = resolveDefaultDrillPositions(cfgDrill);
  const isCustom = cfgDrill?.drillingMode
    ? cfgDrill.drillingMode === 'CUSTOM'
    : cfgDrill?.divisionType === 'CUSTOM_DISTANCE';

  return {
    holeCount: cfgDrill?.holeCount ?? 2,
    divisionType: isCustom ? 'CUSTOM_DISTANCE' : 'EQUAL',
    customDistancesMm: drillPositions,
  };
}

function buildDefaultInitState(
  templates: WindowTemplate[],
  selectedProductId: string | null | undefined,
): { state: BuilderState; holeInputs: string[] } {
  const defaultTemplate = selectedProductId ? (templates.find(t => t.id === selectedProductId) ?? templates[0]) : templates[0];
  const targetSvg = (defaultTemplate.templateType as DoorTemplateType) || getDefaultSvgTemplateForCatalogType(defaultTemplate.catalogTemplateType, defaultTemplate.name, defaultTemplate.templateConfig);
  const validDirections = TEMPLATE_TYPE_INFO[targetSvg]?.supportedDirections ?? ['LEFT_TO_RIGHT', 'RIGHT_TO_LEFT'];
  const alumColor = defaultTemplate.templateConfig?.aluminumColor
    ? mapCatalogAluminumColor(defaultTemplate.templateConfig.aluminumColor)
    : 'Alumínio Fosco / Anodizado';
  const glassColor = defaultTemplate.templateConfig?.glassColor
    ? mapCatalogGlassColor(defaultTemplate.templateConfig.glassColor)
    : 'Fumê / Cinza';
  const dir = computeDefaultOpeningDirection(defaultTemplate.templateConfig?.openingDirection, validDirections);
  const initialHandleConfig = computeDefaultHandleConfig(defaultTemplate.templateConfig?.handleConfig);
  const initialDrillingConfig = computeDefaultDrillingConfig(defaultTemplate.templateConfig?.drillingConfig);
  const drillPositions = initialDrillingConfig.customDistancesMm ?? [100, 500, 560, 100];

  const w = DEFAULT_WIDTH;
  const h = DEFAULT_HEIGHT;
  const initialSelections = buildDefaultSelectionsForTemplate(defaultTemplate, w, h);

  return {
    state: {
      template: defaultTemplate,
      templateType: targetSvg,
      widthMm: w,
      heightMm: h,
      quantity: 1,
      openingDirection: dir,
      handleConfig: initialHandleConfig,
      drillingConfig: initialDrillingConfig,
      aluminumColor: alumColor,
      glassFinish: glassColor,
      laborCost: defaultTemplate.laborCost || 0,
      notes: '',
      materialSelections: initialSelections,
    },
    holeInputs: drillPositions.map(String),
  };
}

function deriveAluminumColorFromMaterial(mat: { name: string; colorFinish?: string }, currentColor?: string): string {
  if (mat.colorFinish) return mat.colorFinish;
  const name = mat.name.toLowerCase();
  if (name.includes('branco')) return 'Branco Brilhante';
  if (name.includes('preto')) return 'Preto Fosco';
  if (name.includes('bronze')) return 'Bronze / Champanhe';
  if (name.includes('anodizado') || name.includes('fosco')) return 'Alumínio Fosco / Anodizado';
  return currentColor ?? 'Alumínio Fosco / Anodizado';
}

function deriveGlassFinishFromMaterial(mat: { name: string; colorFinish?: string }, currentFinish?: string): string {
  if (mat.colorFinish) return mat.colorFinish;
  const name = mat.name.toLowerCase();
  if (name.includes('fumê') || name.includes('fume')) return 'Fumê / Cinza';
  if (name.includes('incolor')) return 'Incolor';
  if (name.includes('verde')) return 'Verde';
  if (name.includes('canelado')) return 'Canelado / Texturizado';
  if (name.includes('reflecta')) return 'Reflecta Bronze';
  return currentFinish ?? 'Fumê / Cinza';
}

function deriveHandleTypeFromMaterial(
  mat: { name: string; categoryType?: CategoryType; isHandle?: boolean },
  currentType: HandleType,
): HandleType {
  const n = mat.name.toLowerCase();
  if (mat.categoryType === 'PROFILE') return 'PROFILE_HANDLE';
  if (n.includes('concha') || n.includes('fecho')) return 'SHELL_LOCK';
  if (n.includes('maçaneta') || n.includes('macaneta') || n.includes('alavanca')) return 'LEVER_HANDLE';
  if (mat.categoryType === 'HARDWARE') return 'BAR_TUBULAR';
  if (n.includes('perfil') && n.includes('puxador')) return 'PROFILE_HANDLE';
  if (n.includes('tubular') || n.includes('barra') || n.includes('inox')) return 'BAR_TUBULAR';
  return currentType;
}

type DimensionInput = number | string | undefined;

function parseDimensionValue(val: DimensionInput): number {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') return Number.parseFloat(val) || 0;
  return 0;
}

function validateStep1Dimensions(
  widthMm: DimensionInput,
  heightMm: DimensionInput,
  quantity: DimensionInput,
): Record<string, string> {
  const errors: Record<string, string> = {};
  const w = parseDimensionValue(widthMm);
  const h = parseDimensionValue(heightMm);
  const qty = parseDimensionValue(quantity);

  if (w <= 0) errors.widthMm = 'Largura obrigatória';
  if (h <= 0) errors.heightMm = 'Altura obrigatória';
  if (qty < 1) errors.quantity = 'Quantidade inválida';

  return errors;
}

function getMissingRequiredMaterialLabels(selections: MaterialSelection[]): string[] {
  return selections
    .filter((sel) => !sel.isOptional && !sel.materialId)
    .map((r) => r.label);
}

function syncSelectionWithPreviewOption(
  sel: MaterialSelection,
  idx: number,
  options: BudgetItemCalculationOptionResult[],
): MaterialSelection {
  const optRes =
    (sel.materialId ? options.find((o) => o.materialId === sel.materialId) : null) ??
    options[idx];
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
  const unitPrice = sel.unitPrice ?? 0;
  const totalPrice =
    currentQty !== undefined ? Number.parseFloat((currentQty * unitPrice).toFixed(2)) : undefined;

  return {
    ...sel,
    suggestedQuantity: suggested,
    physicalMinimumQuantity: physMin,
    quantity: currentQty,
    totalPrice,
    isBelowPhysicalMinimum: isBelow,
    warningMessage: warning,
  };
}

function checkIsHandleMaterial(mat: CatalogMaterialLookup | null | undefined): boolean {
  if (!mat) return false;
  if ((mat as any).isHandle) return true;
  const name = mat.name.toLowerCase();
  return (
    name.includes('puxador') ||
    name.includes('concha') ||
    name.includes('fecho') ||
    name.includes('maçaneta') ||
    name.includes('macaneta')
  );
}

function deriveNextHandleConfig(
  mat: CatalogMaterialLookup | null,
  categoryType: CategoryType,
  isHandleMat: boolean,
  currentHandleConfig: HandleConfig,
): HandleConfig {
  if (!isHandleMat || !mat) {
    return currentHandleConfig;
  }
  const nextHandleType = deriveHandleTypeFromMaterial(
    { name: mat.name, categoryType, isHandle: (mat as any)?.isHandle },
    currentHandleConfig.handleType,
  );
  const isProfile = nextHandleType === 'PROFILE_HANDLE';
  const isProfileOrBar = isProfile || nextHandleType === 'BAR_TUBULAR';

  return {
    ...currentHandleConfig,
    handleType: nextHandleType,
    side: currentHandleConfig.side ?? 'ONE_SIDE',
    coverage: isProfile ? currentHandleConfig.coverage ?? 'FULL' : undefined,
    pieceLengthCm: isProfile ? currentHandleConfig.pieceLengthCm ?? 40 : undefined,
    orientation: currentHandleConfig.orientation ?? (isProfileOrBar ? 'VERTICAL' : undefined),
  };
}

function calculateTransitionQuantity(
  sel: MaterialSelection,
  nextUnit: string,
  widthMm: number | string | undefined,
  heightMm: number | string | undefined,
  svgTemplate: string | undefined,
): number | undefined {
  const isNewUnitPiece = nextUnit === 'un' || nextUnit === 'UN' || nextUnit === 'par' || nextUnit === 'PAR';
  const isOldUnitPiece = sel.unitMeasure === 'un' || sel.unitMeasure === 'UN' || sel.unitMeasure === 'par' || sel.unitMeasure === 'PAR';

  if (isNewUnitPiece && !isOldUnitPiece) {
    return 1;
  }
  if (!isNewUnitPiece && isOldUnitPiece) {
    const w = typeof widthMm === 'number' ? widthMm : DEFAULT_WIDTH;
    const h = typeof heightMm === 'number' ? heightMm : DEFAULT_HEIGHT;
    const areaM2 = Number.parseFloat(((w / 1000) * (h / 1000)).toFixed(2));
    const profileM = estimateProfileLinearMeters(svgTemplate, w, h);
    const computed = computeRequirementMeasure(sel.categoryType, areaM2, profileM);
    return computed.qty;
  }
  return sel.quantity;
}

function resolveSelectionLabel(isHandleMat: boolean, categoryType: CategoryType, currentLabel: string): string {
  if (!isHandleMat) return currentLabel;
  if (categoryType === 'PROFILE') return 'Perfil Puxador';
  return 'Puxador / Ferragem';
}

interface UseWindowBuilderStateProps {
  readonly isOpen: boolean;
  readonly selectedProductId?: string | null;
  readonly editingItem?: BudgetItem | null;
  readonly onAddItem: (item: BudgetItem) => void;
  readonly onClose: () => void;
}

export function useWindowBuilderState({
  isOpen,
  selectedProductId,
  editingItem,
  onAddItem,
  onClose,
}: UseWindowBuilderStateProps) {
  const { data: productsData } = useProducts();

  const templates = useMemo(() => {
    if (!productsData?.content) return [];
    return (productsData.content as unknown as Product[])
      .filter((p) => p.isActive)
      .map((p): WindowTemplate => {
        const defaultSvg = getDefaultSvgTemplateForCatalogType(p.templateType, p.name, p.templateConfig);
        return {
          id: p.id,
          name: p.name,
          categoryId: '',
          categoryName: p.categoryName ?? '',
          isActive: p.isActive,
          laborCost: 0,
          catalogTemplateType: p.templateType ?? null,
          templateType: defaultSvg,
          templateConfig: p.templateConfig ?? undefined,
          categoryRequirements: p.categoryRequirements ?? [],
          items: [],
        };
      });
  }, [productsData]);

  const { data: glassesData } = useGlasses();
  const { data: profilesData } = useProfiles();
  const { data: hardwaresData } = useHardwares();
  const { data: filmsData } = useFilms();

  const glasses: GlassDTO[] = useMemo(() => (glassesData?.content ?? []) as GlassDTO[], [glassesData]);
  const profiles: ProfileDTO[] = useMemo(() => (profilesData?.content ?? []) as ProfileDTO[], [profilesData]);
  const hardwares: HardwareDTO[] = useMemo(() => (hardwaresData?.content ?? []) as HardwareDTO[], [hardwaresData]);
  const films: FilmDTO[] = useMemo(() => (filmsData?.content ?? []) as FilmDTO[], [filmsData]);

  const dynamicAluminumColors = useMemo(() => {
    const fromCatalog = profiles
      .map((p) => p.colorFinish)
      .filter((c): c is string => Boolean(c?.trim()));
    return Array.from(new Set([...BASE_ALUMINUM_COLORS, ...fromCatalog]));
  }, [profiles]);

  const dynamicGlassFinishes = useMemo(() => {
    const fromCatalog = glasses
      .map((g) => g.colorFinish)
      .filter((c): c is string => Boolean(c?.trim()));
    return Array.from(new Set([...BASE_GLASS_FINISHES, ...fromCatalog]));
  }, [glasses]);

  const [state, setState] = useState<BuilderState>({
    template: null,
    widthMm: DEFAULT_WIDTH,
    heightMm: DEFAULT_HEIGHT,
    quantity: 1,
    openingDirection: 'LEFT_TO_RIGHT',
    handleConfig: {
      handleType: 'BAR_TUBULAR',
      side: 'ONE_SIDE',
      coverage: 'FULL',
      pieceLengthCm: 40,
    },
    drillingConfig: {
      holeCount: 2,
      divisionType: 'EQUAL',
      customDistancesMm: [700, 1400],
    },
    aluminumColor: 'Alumínio Fosco / Anodizado',
    glassFinish: 'Fumê / Cinza',
    laborCost: 0,
    notes: '',
    materialSelections: [],
  });

  const [holeDistanceInputs, setHoleDistanceInputs] = useState<string[]>(['700', '1400']);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState<BuilderStep>(1);
  const [isMobileCadExpanded, setIsMobileCadExpanded] = useState(false);
  const hasInitializedRef = useRef(false);

  const svgTemplate: DoorTemplateType = (state.templateType || state.template?.templateType || 'SLIDING_DOOR_2F') as DoorTemplateType;

  const supportedDirections = useMemo(() => {
    return TEMPLATE_TYPE_INFO[svgTemplate]?.supportedDirections ?? ['LEFT_TO_RIGHT', 'RIGHT_TO_LEFT'];
  }, [svgTemplate]);

  const findCatalogMaterial = useCallback(
    (materialId: string) => {
      if (!materialId) return null;
      const g = glasses.find((item) => item.id === materialId);
      if (g) return { name: g.name, unit: 'm²', price: g.salePrice ?? g.pricePerSqm ?? 0, colorFinish: g.colorFinish, categoryType: 'GLASS' as CategoryType };
      const p = profiles.find((item) => item.id === materialId);
      if (p) return { name: p.name, unit: p.unitMeasure ?? 'm', price: p.salePrice ?? 0, colorFinish: p.colorFinish, categoryType: 'PROFILE' as CategoryType };
      const h = hardwares.find((item) => item.id === materialId);
      if (h) return { name: h.name, unit: h.unitMeasure ?? 'un', price: h.salePrice ?? 0, colorFinish: undefined, categoryType: 'HARDWARE' as CategoryType };
      const f = films.find((item) => item.id === materialId);
      if (f) return { name: f.name, unit: 'm²', price: f.salePrice ?? 0, colorFinish: f.colorFinish, categoryType: 'FILM' as CategoryType };
      return null;
    },
    [glasses, profiles, hardwares, films],
  );

  useEffect(() => {
    if (!isOpen) {
      hasInitializedRef.current = false;
      return;
    }

    if (!hasInitializedRef.current && templates.length > 0) {
      hasInitializedRef.current = true;
      if (editingItem) {
        const { state: editState, holeInputs } = buildEditingItemState(editingItem, templates, findCatalogMaterial);
        setHoleDistanceInputs(holeInputs);
        setState(editState);
      } else {
        const { state: initState, holeInputs } = buildDefaultInitState(templates, selectedProductId);
        setHoleDistanceInputs(holeInputs);
        setState(initState);
      }
    }

    setErrors({});
  }, [isOpen, editingItem, templates, findCatalogMaterial, selectedProductId]);

  const materialSelectionsRef = useRef(state.materialSelections);
  materialSelectionsRef.current = state.materialSelections;

  const selectionsKey = useMemo(() => {
    return state.materialSelections
      .map((s) => `${s.requirementId}:${s.materialId}:${s.quantity}:${s.isManualOverride}`)
      .join('|');
  }, [state.materialSelections]);

  // Sincronização reativa com o motor de cálculo backend (/api/orcamentos/items/preview-calculation)
  useEffect(() => {
    if (!isOpen) return;
    const w = typeof state.widthMm === 'number' ? state.widthMm : 0;
    const h = typeof state.heightMm === 'number' ? state.heightMm : 0;
    const qty = typeof state.quantity === 'number' && state.quantity > 0 ? state.quantity : 1;
    if (w <= 0 || h <= 0) return;

    const selections = materialSelectionsRef.current;
    if (!selections || selections.length === 0) return;

    const timer = setTimeout(async () => {
      try {
        const payload: BudgetItemCalculationRequest = {
          templateType: svgTemplate || 'SLIDING_DOOR_2F',
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

        setState((prev) => ({
          ...prev,
          materialSelections: prev.materialSelections.map((sel, idx) =>
            syncSelectionWithPreviewOption(sel, idx, res.options)
          ),
        }));
      } catch (err) {
        console.error('Erro ao sincronizar cálculo de materiais com o backend:', err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [isOpen, state.widthMm, state.heightMm, state.quantity, svgTemplate, selectionsKey]);

  const handleMaterialChange = (requirementId: string, materialId: string) => {
    const selIndex = state.materialSelections.findIndex((s) => s.requirementId === requirementId);
    if (selIndex === -1) return;
    const sel = state.materialSelections[selIndex];

    if (!materialId) {
      setState((prev) => ({
        ...prev,
        materialSelections: prev.materialSelections.map((s) =>
          s.requirementId === requirementId
            ? {
                ...s,
                materialId: '',
                materialName: '',
                unitPrice: 0,
                quantity: undefined,
                totalPrice: undefined,
              }
            : s,
        ),
      }));
      return;
    }

    const mat = findCatalogMaterial(materialId);
    const unitPrice = mat?.price ?? 0;

    setState((prev) => {
      const nextAlum = sel.categoryType === 'PROFILE' && mat
        ? deriveAluminumColorFromMaterial(mat, prev.aluminumColor)
        : prev.aluminumColor;
      const nextGlass = sel.categoryType === 'GLASS' && mat
        ? deriveGlassFinishFromMaterial(mat, prev.glassFinish)
        : prev.glassFinish;
      const isHandleMat = checkIsHandleMaterial(mat);
      const nextHandleConfig = deriveNextHandleConfig(mat, sel.categoryType, isHandleMat, prev.handleConfig);

      const nextUnit = mat?.unit ?? sel.unitMeasure;
      const nextQuantity = calculateTransitionQuantity(sel, nextUnit, prev.widthMm, prev.heightMm, svgTemplate);

      const updated = prev.materialSelections.map((s) =>
        s.requirementId === requirementId
          ? {
              ...s,
              materialId,
              materialName: mat?.name ?? '',
              label: resolveSelectionLabel(isHandleMat, sel.categoryType, s.label),
              unitMeasure: nextUnit,
              unitPrice,
              quantity: nextQuantity,
              totalPrice: (nextQuantity ?? 1) * unitPrice,
            }
          : s,
      );

      const nextSelections = isHandleMat
        ? syncHandleMaterialSelections(updated, nextHandleConfig, prev.heightMm, requirementId, svgTemplate)
        : updated;

      return {
        ...prev,
        aluminumColor: nextAlum,
        glassFinish: nextGlass,
        handleConfig: nextHandleConfig,
        materialSelections: nextSelections,
      };
    });
  };

  const handleMaterialQtyChange = (requirementId: string, valStr: string | undefined) => {
    setState((prev) => ({
      ...prev,
      materialSelections: prev.materialSelections.map((s) => {
        if (s.requirementId !== requirementId) return s;

        const isIntegerUnit = s.unitMeasure === 'UN' || s.unitMeasure === 'PAR' || s.unitMeasure === 'PAIR' || s.unitMeasure === 'un';
        let qty: number | undefined = undefined;

        if (valStr !== undefined) {
          const num = Number.parseFloat(String(valStr).replace(',', '.'));
          if (!Number.isNaN(num) && num >= 0) {
            qty = isIntegerUnit ? Math.floor(num) : num;
          }
        }

        return {
          ...s,
          quantity: qty,
          isManualOverride: true,
          totalPrice: qty !== undefined ? Number.parseFloat((qty * s.unitPrice).toFixed(2)) : undefined,
        };
      }),
    }));
  };

  const handleAddMaterial = (catType: CategoryType) => {
    let defaultMat: { id: string; name: string; price: number; unit: string } | undefined;
    if (catType === 'GLASS' && glasses.length > 0) defaultMat = { id: glasses[0].id, name: glasses[0].name, price: glasses[0].salePrice ?? glasses[0].pricePerSqm ?? 0, unit: 'm²' };
    else if (catType === 'PROFILE' && profiles.length > 0) defaultMat = { id: profiles[0].id, name: profiles[0].name, price: profiles[0].salePrice ?? 0, unit: profiles[0].unitMeasure ?? 'm' };
    else if (catType === 'HARDWARE' && hardwares.length > 0) defaultMat = { id: hardwares[0].id, name: hardwares[0].name, price: hardwares[0].salePrice ?? 0, unit: hardwares[0].unitMeasure ?? 'un' };
    else if (catType === 'FILM' && films.length > 0) defaultMat = { id: films[0].id, name: films[0].name, price: films[0].salePrice ?? 0, unit: 'm²' };

    const resolveUnitMeasure = () => {
      if (defaultMat?.unit) return defaultMat.unit;
      if (catType === 'GLASS' || catType === 'FILM') return 'm²';
      if (catType === 'PROFILE') return 'm';
      return 'un';
    };

    const newSel: MaterialSelection = {
      requirementId: `custom-mat-${Date.now()}`,
      categoryType: catType,
      label: `${CATEGORY_LABELS[catType]} (Adicional)`,
      isOptional: true,
      materialId: defaultMat?.id ?? '',
      materialName: defaultMat?.name ?? '',
      unitMeasure: resolveUnitMeasure(),
      unitPrice: defaultMat?.price ?? 0,
      quantity: 1,
      totalPrice: defaultMat?.price ?? 0,
    };

    setState((prev) => ({
      ...prev,
      materialSelections: [...prev.materialSelections, newSel],
    }));
  };

  const handleRemoveMaterial = (requirementId: string) => {
    setState((prev) => ({
      ...prev,
      materialSelections: prev.materialSelections.filter((s) => s.requirementId !== requirementId),
    }));
  };

  const handleHandleTypeChange = (type: HandleType) => {
    setState((prev) => {
      const isProfile = type === 'PROFILE_HANDLE';
      const isProfileOrBar = isProfile || type === 'BAR_TUBULAR';
      const nextHandleConfig: HandleConfig = {
        ...prev.handleConfig,
        handleType: type,
        side: prev.handleConfig.side ?? 'ONE_SIDE',
        coverage: isProfile ? prev.handleConfig.coverage ?? 'FULL' : undefined,
        pieceLengthCm: isProfile ? prev.handleConfig.pieceLengthCm ?? 40 : undefined,
        orientation: prev.handleConfig.orientation ?? (isProfileOrBar ? 'VERTICAL' : undefined),
      };

      const nextSelections = syncHandleMaterialSelections(
        prev.materialSelections,
        nextHandleConfig,
        prev.heightMm,
        undefined,
        svgTemplate,
      );

      return {
        ...prev,
        handleConfig: nextHandleConfig,
        materialSelections: nextSelections,
      };
    });
  };

  const handleHandleSideChange = (side: HandleSide) => {
    setState((prev) => {
      const nextHandleConfig = { ...prev.handleConfig, side };
      const nextSelections = syncHandleMaterialSelections(
        prev.materialSelections,
        nextHandleConfig,
        prev.heightMm,
        undefined,
        svgTemplate,
      );
      return {
        ...prev,
        handleConfig: nextHandleConfig,
        materialSelections: nextSelections,
      };
    });
  };

  const handleHandleCoverageChange = (coverage: HandleCoverage) => {
    setState((prev) => {
      const nextHandleConfig: HandleConfig = {
        ...prev.handleConfig,
        coverage,
        pieceLengthCm: coverage === 'PIECE' ? prev.handleConfig.pieceLengthCm ?? 40 : undefined,
      };
      const nextSelections = syncHandleMaterialSelections(
        prev.materialSelections,
        nextHandleConfig,
        prev.heightMm,
        undefined,
        svgTemplate,
      );
      return {
        ...prev,
        handleConfig: nextHandleConfig,
        materialSelections: nextSelections,
      };
    });
  };

  const handleHandlePieceLengthChange = (pieceLengthCm: number) => {
    setState((prev) => {
      const nextHandleConfig = {
        ...prev.handleConfig,
        pieceLengthCm,
      };
      const nextSelections = syncHandleMaterialSelections(
        prev.materialSelections,
        nextHandleConfig,
        prev.heightMm,
        undefined,
        svgTemplate,
      );
      return {
        ...prev,
        handleConfig: nextHandleConfig,
        materialSelections: nextSelections,
      };
    });
  };

  const allowedHandlePositions = useMemo(() => {
    return ['LEFT', 'RIGHT', 'CENTER', 'TOP', 'BOTTOM'] as HandlePosition[];
  }, []);

  const handleHandlePositionChange = (position: HandlePosition) => {
    setState((prev) => {
      const isProfileOrBar =
        prev.handleConfig.handleType === 'PROFILE_HANDLE' ||
        prev.handleConfig.handleType === 'BAR_TUBULAR';

      let nextOrientation: HandleOrientation = prev.handleConfig.orientation ?? 'VERTICAL';
      if (isProfileOrBar) {
        // Quando é perfil puxador ou tubular inox, preservar a orientação definida
        nextOrientation = prev.handleConfig.orientation ?? (position === 'TOP' || position === 'BOTTOM' ? 'HORIZONTAL' : 'VERTICAL');
      } else if (position === 'TOP' || position === 'BOTTOM') {
        nextOrientation = 'HORIZONTAL';
      } else if (position === 'LEFT' || position === 'RIGHT') {
        nextOrientation = 'VERTICAL';
      }

      return {
        ...prev,
        handleConfig: {
          ...prev.handleConfig,
          handlePosition: position,
          position,
          orientation: nextOrientation,
        },
      };
    });
  };

  const handleHandleOrientationChange = (orientation: HandleOrientation) => {
    setState((prev) => ({
      ...prev,
      handleConfig: {
        ...prev.handleConfig,
        orientation,
      },
    }));
  };

  const handleHeightChange = (heightMm: number | '') => {
    setState((prev) => {
      const nextSelections = syncHandleMaterialSelections(
        prev.materialSelections,
        prev.handleConfig,
        heightMm,
        undefined,
        svgTemplate,
      );
      return {
        ...prev,
        heightMm,
        materialSelections: nextSelections,
      };
    });
  };

  const availableHandleProfiles = useMemo(() => {
    return profiles
      .filter((p) => p.isHandle || p.name.toLowerCase().includes('puxador'))
      .map((p) => ({
        id: p.id,
        name: p.name,
        price: p.salePrice ?? 0,
        unit: p.unitMeasure ?? 'm',
        colorFinish: p.colorFinish,
        isHandle: p.isHandle,
      }));
  }, [profiles]);

  const availableHandleHardwares = useMemo(() => {
    return hardwares
      .filter(
        (h) =>
          h.isHandle ||
          h.name.toLowerCase().includes('puxador') ||
          h.name.toLowerCase().includes('concha') ||
          h.name.toLowerCase().includes('fecho') ||
          h.name.toLowerCase().includes('maçaneta') ||
          h.name.toLowerCase().includes('macaneta'),
      )
      .map((h) => ({
        id: h.id,
        name: h.name,
        price: h.salePrice ?? 0,
        unit: h.unitMeasure ?? 'un',
        isHandle: h.isHandle,
      }));
  }, [hardwares]);

  const handleMaterial = useMemo(() => {
    return state.materialSelections.find(isHandleOrLockMaterial) ?? null;
  }, [state.materialSelections]);

  const handleSelectHandleMaterial = (materialId: string, category?: 'PROFILE' | 'HARDWARE') => {
    if (!materialId) {
      setState((prev) => {
        const existingIdx = prev.materialSelections.findIndex(isHandleOrLockMaterial);
        if (existingIdx === -1) return prev;

        const nextSelections = [...prev.materialSelections];
        if (nextSelections[existingIdx].requirementId === 'req-handle') {
          nextSelections.splice(existingIdx, 1);
        } else {
          nextSelections[existingIdx] = {
            ...nextSelections[existingIdx],
            materialId: '',
            materialName: '',
            unitPrice: 0,
            quantity: 0,
            totalPrice: 0,
          };
        }
        return {
          ...prev,
          materialSelections: nextSelections,
        };
      });
      return;
    }

    const isProfile = category ? category === 'PROFILE' : profiles.some((p) => p.id === materialId);
    const resolvedCategory: CategoryType = isProfile ? 'PROFILE' : 'HARDWARE';
    const list = isProfile ? profiles : hardwares;
    const mat = list.find((m) => m.id === materialId);
    if (!mat) return;

    setState((prev) => {
      const existingIdx = prev.materialSelections.findIndex(isHandleOrLockMaterial);
      const reqId = existingIdx >= 0 ? prev.materialSelections[existingIdx].requirementId : 'req-handle';

      const nextHandleType = deriveHandleTypeFromMaterial(
        { name: mat.name, categoryType: resolvedCategory },
        prev.handleConfig.handleType,
      );
      const isProfileHandle = nextHandleType === 'PROFILE_HANDLE';
      const isProfileOrBar = isProfileHandle || nextHandleType === 'BAR_TUBULAR';
      const nextHandleConfig: HandleConfig = {
        ...prev.handleConfig,
        handleType: nextHandleType,
        side: prev.handleConfig.side ?? 'ONE_SIDE',
        coverage: isProfileHandle ? prev.handleConfig.coverage ?? 'FULL' : undefined,
        pieceLengthCm: isProfileHandle ? prev.handleConfig.pieceLengthCm ?? 40 : undefined,
        orientation: prev.handleConfig.orientation ?? (isProfileOrBar ? 'VERTICAL' : undefined),
      };

      const selItem: MaterialSelection = {
        ...(existingIdx >= 0 ? prev.materialSelections[existingIdx] : {}),
        requirementId: reqId,
        categoryType: resolvedCategory,
        label: resolvedCategory === 'PROFILE' ? 'Perfil Puxador' : 'Puxador / Ferragem',
        materialId: mat.id,
        materialName: mat.name,
        unitMeasure: mat.unitMeasure ?? (isProfile ? 'm' : 'un'),
        unitPrice: mat.salePrice ?? 0,
        quantity: 1,
        totalPrice: mat.salePrice ?? 0,
        isOptional: existingIdx >= 0 ? prev.materialSelections[existingIdx].isOptional : true,
      };

      const nextSelections = [...prev.materialSelections];
      if (existingIdx >= 0) {
        nextSelections[existingIdx] = selItem;
      } else {
        nextSelections.push(selItem);
      }

      const syncedSelections = syncHandleMaterialSelections(
        nextSelections,
        nextHandleConfig,
        prev.heightMm,
        reqId,
        svgTemplate,
      );

      return {
        ...prev,
        handleConfig: nextHandleConfig,
        materialSelections: syncedSelections,
      };
    });
  };

  const getDefaultHoleDistances = (count: number, height: number): number[] => {
    if (count <= 0) return [];
    const step = Math.round(height / (count + 1));
    const dists: number[] = [];
    for (let i = 1; i <= count; i++) {
      dists.push(step * i);
    }
    return dists;
  };

  const handleHoleCountChange = (count: number) => {
    const currentH = typeof state.heightMm === 'number' && state.heightMm > 0 ? state.heightMm : DEFAULT_HEIGHT;
    const defaults = getDefaultHoleDistances(count, currentH);

    setHoleDistanceInputs((prev) =>
      Array.from({ length: count }, (_, i) =>
        prev[i] !== undefined && prev[i] !== '' && prev[i] !== '0' ? prev[i] : String(defaults[i])
      )
    );

    setState((prev) => {
      const currentDists = prev.drillingConfig.customDistancesMm ?? [];
      const nextDists = Array.from({ length: count }, (_, i) =>
        currentDists[i] !== undefined && currentDists[i] > 0 ? currentDists[i] : defaults[i]
      );

      return {
        ...prev,
        drillingConfig: {
          ...prev.drillingConfig,
          holeCount: count,
          customDistancesMm: nextDists,
        },
      };
    });
  };

  const handleDivisionTypeChange = (type: DivisionType) => {
    setState((prev) => {
      const currentH = typeof prev.heightMm === 'number' && prev.heightMm > 0 ? prev.heightMm : DEFAULT_HEIGHT;
      const count = prev.drillingConfig.holeCount;
      const defaults = getDefaultHoleDistances(count, currentH);
      const nextDists = prev.drillingConfig.customDistancesMm?.length === count ? prev.drillingConfig.customDistancesMm : defaults;

      if (type === 'CUSTOM_DISTANCE') {
        setHoleDistanceInputs(nextDists.map(String));
      }

      return {
        ...prev,
        drillingConfig: {
          ...prev.drillingConfig,
          divisionType: type,
          customDistancesMm: nextDists,
        },
      };
    });
  };

  const handleSingleHoleDistanceChange = (index: number, val: string) => {
    setHoleDistanceInputs((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });

    const parsedNum = Number.parseInt(val, 10);
    setState((prev) => {
      const dists = [...(prev.drillingConfig.customDistancesMm ?? [])];
      while (dists.length < prev.drillingConfig.holeCount) {
        dists.push(0);
      }
      dists[index] = !Number.isNaN(parsedNum) && parsedNum > 0 ? parsedNum : 0;
      return {
        ...prev,
        drillingConfig: {
          ...prev.drillingConfig,
          customDistancesMm: dists,
        },
      };
    });
  };

  const itemSubtotalEstimate = useMemo(() => {
    const w = typeof state.widthMm === 'number' ? state.widthMm : 0;
    const h = typeof state.heightMm === 'number' ? state.heightMm : 0;
    const qty = typeof state.quantity === 'number' && state.quantity >= 1 ? state.quantity : 1;
    if (!w || !h) return 0;
    return calcItemSubtotal(
      state.materialSelections.map((s) => ({ quantity: s.quantity, unitPrice: s.unitPrice })),
      state.laborCost ?? 0,
      qty,
    );
  }, [state.materialSelections, state.quantity, state.widthMm, state.heightMm, state.laborCost]);

  const validateStep = (step: BuilderStep): boolean => {
    if (step === 1) {
      const newErrors = validateStep1Dimensions(state.widthMm, state.heightMm, state.quantity);
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        toast.error('Informe as medidas e quantidade da esquadria.');
        return false;
      }
    }

    if (step === 2) {
      const missingReqs = getMissingRequiredMaterialLabels(state.materialSelections);
      if (missingReqs.length > 0) {
        toast.error(`Selecione os materiais obrigatórios: ${missingReqs.map((r) => r).join(', ')}`);
        return false;
      }
    }

    setErrors({});
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep((prev) => (prev + 1) as BuilderStep);
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as BuilderStep);
    }
  };

  const handleGoToStep = (targetStep: BuilderStep) => {
    if (targetStep > currentStep) {
      for (let s = currentStep; s < targetStep; s++) {
        if (!validateStep(s as BuilderStep)) return;
      }
    }
    setCurrentStep(targetStep);
  };

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};

    if (!state.template) {
      toast.error('Selecione um template de esquadria.');
      return;
    }

    const w = typeof state.widthMm === 'number' ? state.widthMm : 0;
    const h = typeof state.heightMm === 'number' ? state.heightMm : 0;
    const qty = typeof state.quantity === 'number' ? state.quantity : 0;

    if (!w || w <= 0) newErrors.widthMm = 'Largura obrigatória';
    if (!h || h <= 0) newErrors.heightMm = 'Altura obrigatória';
    if (!qty || qty < 1) newErrors.quantity = 'Quantidade inválida';

    const missingReqs = state.materialSelections.filter(
      (sel) => !sel.isOptional && !sel.materialId,
    );

    if (missingReqs.length > 0) {
      toast.error(`Selecione os materiais obrigatórios: ${missingReqs.map((r) => r.label).join(', ')}`);
      setCurrentStep(2);
      return;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Verifique as medidas informadas.');
      setCurrentStep(1);
      return;
    }

    const svgTemplateToSave = (state.templateType || state.template?.templateType || 'SLIDING_DOOR_2F') as DoorTemplateType;

    const item: BudgetItem = {
      tempId: editingItem?.tempId ?? `item-${Date.now()}`,
      productId: state.template.id,
      productName: state.template.name,
      templateType: svgTemplateToSave,
      templateConfig: {
        templateType: svgTemplateToSave,
        aluminumColor: state.aluminumColor,
        glassFinish: state.glassFinish,
        openingDirection: state.openingDirection,
        handleType: state.handleConfig.handleType,
        handleConfig: state.handleConfig,
        drillingConfig: state.drillingConfig,
      },
      handleConfig: state.handleConfig,
      drillingConfig: state.drillingConfig,
      widthMm: w,
      heightMm: h,
      width: w,
      height: h,
      quantity: qty,
      laborCost: state.laborCost ?? 0,
      options: state.materialSelections
        .filter((s) => s.materialId)
        .map((s) => ({
          materialId: s.materialId,
          materialName: s.materialName,
          categoryType: s.categoryType,
          unitMeasure: s.unitMeasure,
          quantity: s.quantity,
          unitPrice: s.unitPrice,
          totalPrice: s.totalPrice,
        })),
      subtotal: itemSubtotalEstimate,
      unitPrice: qty > 0 ? Number.parseFloat((itemSubtotalEstimate / qty).toFixed(2)) : itemSubtotalEstimate,
      notes: state.notes,
    };

    onAddItem(item);
    onClose();
  };

  const svgW = typeof state.widthMm === 'number' && state.widthMm > 0 ? state.widthMm : DEFAULT_WIDTH;
  const svgH = typeof state.heightMm === 'number' && state.heightMm > 0 ? state.heightMm : DEFAULT_HEIGHT;
  const unitAreaM2 = ((svgW / 1000) * (svgH / 1000)).toFixed(2);
  const totalQty = typeof state.quantity === 'number' && state.quantity >= 1 ? state.quantity : 1;

  return {
    state,
    setState,
    errors,
    currentStep,
    isMobileCadExpanded,
    setIsMobileCadExpanded,
    svgTemplate,
    supportedDirections,
    allowedHandlePositions,
    dynamicAluminumColors,
    dynamicGlassFinishes,
    glasses,
    profiles,
    hardwares,
    films,
    holeDistanceInputs,
    itemSubtotalEstimate,
    svgW,
    svgH,
    unitAreaM2,
    totalQty,
    handleMaterial,
    availableHandleProfiles,
    availableHandleHardwares,
    handleSelectHandleMaterial,
    handleMaterialChange,
    handleMaterialQtyChange,
    handleAddMaterial,
    handleRemoveMaterial,
    handleHandleTypeChange,
    handleHandlePositionChange,
    handleHandleOrientationChange,
    handleHandleSideChange,
    handleHandleCoverageChange,
    handleHandlePieceLengthChange,
    handleHeightChange,
    handleHoleCountChange,
    handleDivisionTypeChange,
    handleSingleHoleDistanceChange,
    handleNextStep,
    handlePrevStep,
    handleGoToStep,
    handleSubmit,
  };
}
