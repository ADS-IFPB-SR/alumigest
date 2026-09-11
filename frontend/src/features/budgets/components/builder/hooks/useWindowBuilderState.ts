import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type {
  DoorTemplateType,
  BuilderState,
  BudgetItem,
  HandleConfig,
  DrillingConfig,
  HandleType,
  HandleSide,
  HandleCoverage,
  DivisionType,
  MaterialSelection,
  CategoryType,
  WindowTemplate,
  BudgetItemCalculationRequest,
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

export const CATEGORY_ICONS: Record<CategoryType, string> = {
  GLASS: 'grid_view',
  PROFILE: 'view_stream',
  HARDWARE: 'hardware',
  FILM: 'layers',
  ROLLERS: 'tune',
};

export const CATEGORY_LABELS: Record<string, string> = {
  GLASS: 'Vidros',
  PROFILE: 'Perfis de Alumínio',
  HARDWARE: 'Ferragens / Componentes',
  FILM: 'Películas',
  ROLLERS: 'Roldanas / Deslizamento',
};

export const DEFAULT_WIDTH = 1600;
export const DEFAULT_HEIGHT = 2150;

interface UseWindowBuilderStateProps {
  isOpen: boolean;
  selectedProductId?: string | null;
  editingItem?: BudgetItem | null;
  onAddItem: (item: BudgetItem) => void;
  onClose: () => void;
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
          categoryId: p.categoryId,
          categoryName: p.categoryName,
          isActive: p.isActive,
          laborCost: 0,
          catalogTemplateType: p.templateType ?? null,
          templateType: defaultSvg,
          templateConfig: p.templateConfig ?? undefined,
          categoryRequirements: p.categoryRequirements ?? [],
          items: p.items,
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
      .filter((c): c is string => Boolean(c && c.trim()));
    return Array.from(new Set([...BASE_ALUMINUM_COLORS, ...fromCatalog]));
  }, [profiles]);

  const dynamicGlassFinishes = useMemo(() => {
    const fromCatalog = glasses
      .map((g) => g.colorFinish)
      .filter((c): c is string => Boolean(c && c.trim()));
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
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
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
      if (g) return { name: g.name, unit: 'm²', price: g.salePrice ?? g.pricePerSqm ?? 0, colorFinish: g.colorFinish, categoryType: 'GLASS' as CategoryType, familyCode: g.familyCode };
      const p = profiles.find((item) => item.id === materialId);
      if (p) return { name: p.name, unit: p.unitMeasure ?? 'm', price: p.salePrice ?? 0, colorFinish: p.colorFinish, categoryType: 'PROFILE' as CategoryType, familyCode: p.familyCode };
      const h = hardwares.find((item) => item.id === materialId);
      if (h) return { name: h.name, unit: h.unitMeasure ?? 'un', price: h.salePrice ?? 0, colorFinish: undefined, categoryType: 'HARDWARE' as CategoryType, familyCode: h.familyCode };
      const f = films.find((item) => item.id === materialId);
      if (f) return { name: f.name, unit: 'm²', price: f.salePrice ?? 0, colorFinish: f.colorFinish, categoryType: 'FILM' as CategoryType, familyCode: f.familyCode };
      return null;
    },
    [glasses, profiles, hardwares, films],
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
          } else if (catType === 'ROLLERS') {
            const chosen = hardwares.find((hw) => hw.name.toLowerCase().includes('rold')) ?? hardwares[0];
            if (chosen) {
              mat = { id: chosen.id, name: chosen.name, price: chosen.salePrice ?? 0, unit: chosen.unitMeasure ?? 'un', familyCode: chosen.familyCode };
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

  useEffect(() => {
    if (!isOpen) {
      hasInitializedRef.current = false;
      setCurrentStep(1);
      setIsMobileCadExpanded(false);
      return;
    }

    if (editingItem) {
      const template = templates.find((t) => t.id === editingItem.productId) ?? templates[0] ?? null;
      const selections: MaterialSelection[] = (editingItem.options ?? []).map((opt, idx) => {
        const mat = findCatalogMaterial(opt.materialId);
        const reqId = `edit-item-${opt.materialId}-${idx}`;
        const categoryType = opt.categoryType || (mat?.categoryType as CategoryType) || 'HARDWARE';
        const price = opt.unitPrice || mat?.price || 0;
        const qty = opt.quantity ?? 1;
        return {
          requirementId: reqId,
          categoryType: categoryType,
          label: CATEGORY_LABELS[categoryType] ?? categoryType,
          isOptional: false,
          materialId: opt.materialId,
          materialName: opt.materialName || mat?.name || 'Material',
          unitMeasure: opt.unitMeasure || mat?.unit || 'un',
          unitPrice: price,
          quantity: qty,
          totalPrice: qty !== undefined ? parseFloat((qty * price).toFixed(2)) : undefined,
        };
      });

      const editCount = editingItem.drillingConfig?.holeCount ?? 2;
      const editH = editingItem.heightMm ?? 2100;
      const step = Math.round(editH / (editCount + 1));
      const fallbackDists = Array.from({ length: editCount }, (_, i) => step * (i + 1));
      const dists = editingItem.drillingConfig?.customDistancesMm && editingItem.drillingConfig.customDistancesMm.length === editCount
        ? editingItem.drillingConfig.customDistancesMm
        : fallbackDists;
      setHoleDistanceInputs(dists.map(String));

      setState({
        template,
        templateType: (editingItem.templateType as DoorTemplateType) || undefined,
        widthMm: editingItem.widthMm,
        heightMm: editingItem.heightMm,
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
      });
    } else {
      if (!hasInitializedRef.current && templates.length > 0) {
        hasInitializedRef.current = true;
        const defaultTemplate = selectedProductId ? (templates.find(t => t.id === selectedProductId) ?? templates[0]) : templates[0];
        const targetSvg = (defaultTemplate.templateType as DoorTemplateType) || getDefaultSvgTemplateForCatalogType(defaultTemplate.catalogTemplateType, defaultTemplate.name, defaultTemplate.templateConfig);
        const validDirections = TEMPLATE_TYPE_INFO[targetSvg]?.supportedDirections ?? ['LEFT_TO_RIGHT', 'RIGHT_TO_LEFT'];
        const alumColor = defaultTemplate.templateConfig?.aluminumColor
          ? mapCatalogAluminumColor(defaultTemplate.templateConfig.aluminumColor)
          : 'Alumínio Fosco / Anodizado';
        const glassColor = defaultTemplate.templateConfig?.glassColor
          ? mapCatalogGlassColor(defaultTemplate.templateConfig.glassColor)
          : 'Fumê / Cinza';
        let rawDir = defaultTemplate.templateConfig?.openingDirection;
        if (rawDir === 'OUTSIDE') rawDir = 'LEFT_TO_RIGHT';
        if (rawDir === 'INSIDE') rawDir = 'RIGHT_TO_LEFT';
        const dir = rawDir && validDirections.includes(rawDir)
          ? rawDir
          : (validDirections[0] ?? 'LEFT_TO_RIGHT');

        const cfgHandle = defaultTemplate.templateConfig?.handleConfig;
        const initialHandleConfig: HandleConfig = cfgHandle ? {
          handleType: cfgHandle.handleType ?? 'BAR_TUBULAR',
          side: cfgHandle.side ?? 'ONE_SIDE',
          coverage: cfgHandle.coverage ?? (cfgHandle.handleLengthMm && cfgHandle.handleLengthMm >= 1000 ? 'FULL' : 'PIECE'),
          pieceLengthCm: cfgHandle.pieceLengthCm ?? (cfgHandle.handleLengthMm ? Math.round(cfgHandle.handleLengthMm / 10) : 40),
        } : {
          handleType: 'BAR_TUBULAR',
          side: 'ONE_SIDE',
          coverage: 'FULL',
          pieceLengthCm: 40,
        };

        const cfgDrill = defaultTemplate.templateConfig?.drillingConfig;
        const drillPositions = cfgDrill?.customPositionsMm && cfgDrill.customPositionsMm.length > 0
          ? cfgDrill.customPositionsMm
          : [100, 500, 560, 100];
        const initialDrillingConfig: DrillingConfig = cfgDrill ? {
          holeCount: cfgDrill.holeCount ?? 2,
          divisionType: cfgDrill.drillingMode === 'CUSTOM' ? 'CUSTOM_DISTANCE' : 'EQUAL',
          customDistancesMm: drillPositions,
        } : {
          holeCount: 2,
          divisionType: 'EQUAL',
          customDistancesMm: drillPositions,
        };
        setHoleDistanceInputs(drillPositions.map(String));

        const w = DEFAULT_WIDTH;
        const h = DEFAULT_HEIGHT;
        const initialSelections = buildSelectionsForTemplate(defaultTemplate, w, h, alumColor, glassColor);

        setState({
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
        });
      }
    }

    setCurrentStep(1);
    setErrors({});
  }, [isOpen, editingItem, templates, buildSelectionsForTemplate, findCatalogMaterial, selectedProductId]);

  const materialSelectionsRef = useRef(state.materialSelections);
  materialSelectionsRef.current = state.materialSelections;

  // Recalcular consumo sugerido e limites físicos com o motor inteligente no backend
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
          templateType: state.templateType || state.template?.templateType || 'SLIDING_DOOR_2F',
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
        if (!res || !res.options) return;

        setState((prev) => {
          const updatedSelections = prev.materialSelections.map((sel, idx) => {
            const optRes = res.options[idx];
            if (!optRes) return sel;

            const suggested = optRes.suggestedQuantity;
            const physMin = optRes.physicalMinimumQuantity;
            const isBelow = optRes.isBelowPhysicalMinimum;
            const warning = optRes.warningMessage;

            // Se o usuário não sobrescreveu manualmente, aplica a sugestão da calculadora
            const currentQty = sel.isManualOverride && sel.quantity !== undefined ? sel.quantity : suggested;
            const totalPrice = currentQty !== undefined ? parseFloat((currentQty * sel.unitPrice).toFixed(2)) : undefined;

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

          return {
            ...prev,
            materialSelections: updatedSelections,
          };
        });
      } catch (err) {
        console.error('Erro ao calcular consumo de materiais no backend:', err);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [
    isOpen,
    state.widthMm,
    state.heightMm,
    state.quantity,
    state.templateType,
    state.template?.templateType,
    state.materialSelections.length,
  ]);

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
      let nextAlum = prev.aluminumColor;
      let nextGlass = prev.glassFinish;
      let nextHandleType = prev.handleConfig.handleType;

      if (sel.categoryType === 'PROFILE' && mat) {
        nextAlum = mapCatalogAluminumColor(mat.colorFinish || mat.name);
      }

      if (sel.categoryType === 'GLASS' && mat) {
        nextGlass = mapCatalogGlassColor(mat.colorFinish || mat.name);
      }

      if (sel.categoryType === 'HARDWARE' && mat) {
        const n = mat.name.toLowerCase();
        if (n.includes('concha') || n.includes('fecho')) {
          nextHandleType = 'SHELL_LOCK';
        } else if (n.includes('maçaneta') || n.includes('macaneta') || n.includes('alavanca')) {
          nextHandleType = 'LEVER_HANDLE';
        } else {
          nextHandleType = 'BAR_TUBULAR';
        }
      }

      return {
        ...prev,
        aluminumColor: nextAlum,
        glassFinish: nextGlass,
        handleConfig: {
          ...prev.handleConfig,
          handleType: nextHandleType,
        },
        materialSelections: prev.materialSelections.map((s) =>
          s.requirementId === requirementId
            ? {
                ...s,
                materialId,
                materialName: mat?.name ?? '',
                unitMeasure: mat?.unit ?? s.unitMeasure,
                unitPrice,
                familyCode: mat?.familyCode,
                totalPrice: (s.quantity ?? 1) * unitPrice,
              }
            : s,
        ),
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

        if (valStr !== undefined && valStr !== '') {
          const num = parseFloat(String(valStr).replace(',', '.'));
          if (!isNaN(num) && num >= 0) {
            qty = isIntegerUnit ? Math.floor(num) : num;
          }
        }

        const isBelow =
          qty !== undefined &&
          s.physicalMinimumQuantity !== undefined &&
          s.physicalMinimumQuantity > 0 &&
          qty < s.physicalMinimumQuantity;

        let warning = s.warningMessage;
        if (isBelow) {
          if (s.categoryType === 'GLASS') {
            warning = `A quantidade (${qty} m²) é inferior à área física da esquadria (${s.physicalMinimumQuantity} m²). Risco de corte insuficiente!`;
          } else if (s.categoryType === 'PROFILE') {
            warning = `A metragem (${qty} m) é inferior ao perímetro mínimo (${s.physicalMinimumQuantity} m). Risco de barra insuficiente!`;
          } else {
            warning = `Quantidade informada (${qty}) é inferior ao mínimo físico (${s.physicalMinimumQuantity}).`;
          }
        } else {
          warning = undefined;
        }

        return {
          ...s,
          quantity: qty,
          totalPrice: qty !== undefined ? parseFloat((qty * s.unitPrice).toFixed(2)) : undefined,
          isManualOverride: true,
          isBelowPhysicalMinimum: isBelow,
          warningMessage: warning,
        };
      }),
    }));
  };

  const handleAddMaterial = (catType: CategoryType) => {
    let defaultMat: { id: string; name: string; price: number; unit: string } | undefined;
    if (catType === 'GLASS' && glasses.length > 0) defaultMat = { id: glasses[0].id, name: glasses[0].name, price: glasses[0].salePrice ?? glasses[0].pricePerSqm ?? 0, unit: 'm²' };
    else if (catType === 'PROFILE' && profiles.length > 0) defaultMat = { id: profiles[0].id, name: profiles[0].name, price: profiles[0].salePrice ?? 0, unit: profiles[0].unitMeasure ?? 'm' };
    else if (catType === 'HARDWARE' && hardwares.length > 0) defaultMat = { id: hardwares[0].id, name: hardwares[0].name, price: hardwares[0].salePrice ?? 0, unit: hardwares[0].unitMeasure ?? 'un' };
    else if (catType === 'ROLLERS' && hardwares.length > 0) {
      const chosen = hardwares.find((h) => h.name.toLowerCase().includes('rold')) ?? hardwares[0];
      defaultMat = { id: chosen.id, name: chosen.name, price: chosen.salePrice ?? 0, unit: chosen.unitMeasure ?? 'un' };
    }
    else if (catType === 'FILM' && films.length > 0) defaultMat = { id: films[0].id, name: films[0].name, price: films[0].salePrice ?? 0, unit: 'm²' };

    const newSel: MaterialSelection = {
      requirementId: `custom-mat-${Date.now()}`,
      categoryType: catType,
      label: `${CATEGORY_LABELS[catType]} (Adicional)`,
      isOptional: true,
      materialId: defaultMat?.id ?? '',
      materialName: defaultMat?.name ?? '',
      unitMeasure: defaultMat?.unit ?? (catType === 'GLASS' || catType === 'FILM' ? 'm²' : catType === 'PROFILE' ? 'm' : 'un'),
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
    setState((prev) => ({
      ...prev,
      handleConfig: {
        ...prev.handleConfig,
        handleType: type,
        side: prev.handleConfig.side ?? 'ONE_SIDE',
        coverage: type === 'BAR_TUBULAR' ? prev.handleConfig.coverage ?? 'FULL' : undefined,
      },
    }));
  };

  const handleHandleSideChange = (side: HandleSide) => {
    setState((prev) => ({
      ...prev,
      handleConfig: { ...prev.handleConfig, side },
    }));
  };

  const handleHandleCoverageChange = (coverage: HandleCoverage) => {
    setState((prev) => ({
      ...prev,
      handleConfig: {
        ...prev.handleConfig,
        coverage,
        pieceLengthCm: coverage === 'PIECE' ? prev.handleConfig.pieceLengthCm ?? 40 : undefined,
      },
    }));
  };

  const handleHandlePieceLengthChange = (pieceLengthCm: number) => {
    setState((prev) => ({
      ...prev,
      handleConfig: {
        ...prev.handleConfig,
        pieceLengthCm,
      },
    }));
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

    setHoleDistanceInputs((prev) => {
      const next: string[] = [];
      for (let i = 0; i < count; i++) {
        if (prev[i] !== undefined && prev[i] !== '' && prev[i] !== '0') {
          next.push(prev[i]);
        } else {
          next.push(String(defaults[i]));
        }
      }
      return next;
    });

    setState((prev) => {
      const currentDists = prev.drillingConfig.customDistancesMm ?? [];
      const nextDists: number[] = [];
      for (let i = 0; i < count; i++) {
        if (currentDists[i] !== undefined && currentDists[i] > 0) {
          nextDists.push(currentDists[i]);
        } else {
          nextDists.push(defaults[i]);
        }
      }

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

    const parsedNum = parseInt(val, 10);
    setState((prev) => {
      const dists = [...(prev.drillingConfig.customDistancesMm ?? [])];
      while (dists.length < prev.drillingConfig.holeCount) {
        dists.push(0);
      }
      dists[index] = !isNaN(parsedNum) && parsedNum > 0 ? parsedNum : 0;
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
      0,
      qty,
    );
  }, [state.materialSelections, state.quantity, state.widthMm, state.heightMm]);

  const validateStep = (step: 1 | 2 | 3 | 4): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      const w = typeof state.widthMm === 'number' ? state.widthMm : 0;
      const h = typeof state.heightMm === 'number' ? state.heightMm : 0;
      const qty = typeof state.quantity === 'number' ? state.quantity : 0;

      if (!w || w <= 0) newErrors.widthMm = 'Largura obrigatória';
      if (!h || h <= 0) newErrors.heightMm = 'Altura obrigatória';
      if (!qty || qty < 1) newErrors.quantity = 'Quantidade inválida';

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        toast.error('Informe as medidas e quantidade da esquadria.');
        return false;
      }
    }

    if (step === 2) {
      const missingReqs = state.materialSelections.filter(
        (sel) => !sel.isOptional && !sel.materialId,
      );

      if (missingReqs.length > 0) {
        toast.error(`Selecione os materiais obrigatórios: ${missingReqs.map((r) => r.label).join(', ')}`);
        return false;
      }
    }

    setErrors({});
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3 | 4);
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
    }
  };

  const handleGoToStep = (targetStep: 1 | 2 | 3 | 4) => {
    if (targetStep > currentStep) {
      for (let s = currentStep; s < targetStep; s++) {
        if (!validateStep(s as 1 | 2 | 3 | 4)) return;
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
    handleMaterialChange,
    handleMaterialQtyChange,
    handleAddMaterial,
    handleRemoveMaterial,
    handleHandleTypeChange,
    handleHandleSideChange,
    handleHandleCoverageChange,
    handleHandlePieceLengthChange,
    handleHoleCountChange,
    handleDivisionTypeChange,
    handleSingleHoleDistanceChange,
    handleNextStep,
    handlePrevStep,
    handleGoToStep,
    handleSubmit,
  };
}
