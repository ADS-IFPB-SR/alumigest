import React, { useEffect, useCallback, useMemo, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  TEMPLATE_TYPE_INFO,
  type DoorTemplateType,
  type BuilderState,
  type BudgetItem,
  type HandleConfig,
  type DrillingConfig,
  type HandleType,
  type HandleSide,
  type HandleCoverage,
  type DivisionType,
  type MaterialSelection,
  type CategoryType,
  type WindowTemplate,
} from '../../types';
import type { Product } from '../../../catalog/types';
import {
  useProducts,
  useGlasses,
  useProfiles,
  useHardwares,
  useFilms,
} from '../../../catalog/hooks/useCatalog';
import { calcItemSubtotal, formatBRL } from '../../utils/calculations';
import { WindowSvgPreview } from './WindowSvgPreview';
import {
  getDefaultSvgTemplateForCatalogType,
  mapCatalogAluminumColor,
  mapCatalogGlassColor,
} from '../../utils/mapCatalogTemplate';
import { Button } from '../../../../components/ui/Button';
import toast from 'react-hot-toast';

// ─── Constantes e Opções Visuais ──────────────────────────────────────────────
const BASE_ALUMINUM_COLORS = [
  'Alumínio Fosco / Anodizado',
  'Preto Fosco',
  'Branco Brilhante',
  'Bronze / Champanhe',
  'Cromado / Polido',
  'Dourado / Gold',
];

const BASE_GLASS_FINISHES = [
  'Incolor',
  'Fumê / Cinza',
  'Verde',
  'Canelado / Texturizado',
  'Reflecta Bronze',
];

const CATEGORY_ICONS: Record<CategoryType, string> = {
  GLASS: 'grid_view',
  PROFILE: 'view_stream',
  HARDWARE: 'hardware',
  FILM: 'layers',
  ROLLERS: 'tune',
};

const CATEGORY_LABELS: Record<string, string> = {
  GLASS: 'Vidros',
  PROFILE: 'Perfis de Alumínio',
  HARDWARE: 'Ferragens / Componentes',
  FILM: 'Películas',
  ROLLERS: 'Roldanas / Deslizamento',
};

const DEFAULT_WIDTH = 1600;
const DEFAULT_HEIGHT = 2150;

interface WindowBuilderModalProps {
  isOpen: boolean;
  selectedProductId?: string | null;
  onClose: () => void;
  onAddItem: (item: BudgetItem) => void;
  editingItem?: BudgetItem | null;
}

export const WindowBuilderModal: React.FC<WindowBuilderModalProps> = ({
  isOpen,
  selectedProductId,
  onClose,
  onAddItem,
  editingItem,
}) => {
  // Queries do Catálogo (read-only)
  const { data: productsData } = useProducts();
  
  // Transformamos todos os produtos ativos do catálogo no formato WindowTemplate
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

  const glasses = useMemo(() => glassesData?.content ?? [], [glassesData]);
  const profiles = useMemo(() => profilesData?.content ?? [], [profilesData]);
  const hardwares = useMemo(() => hardwaresData?.content ?? [], [hardwaresData]);
  const films = useMemo(() => filmsData?.content ?? [], [filmsData]);

  // Lista dinâmica de acabamentos baseada nos materiais do catálogo
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

  // Estado do Builder
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

  // ─── Utilitário: busca material pelo ID no catálogo ────────────────────────
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

  // ─── Constrói Seleção de Materiais baseada nos Requisitos do Template ────────
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
          let mat: { id: string; name: string; price: number; unit: string } | undefined;
          let qty = 1;

          if (catType === 'GLASS') {
            const matched = glassColor ? glasses.find((g) => g.colorFinish?.toLowerCase() === glassColor.toLowerCase()) : null;
            const chosen = matched ?? glasses[0];
            if (chosen) {
              mat = { id: chosen.id, name: chosen.name, price: chosen.salePrice ?? chosen.pricePerSqm ?? 0, unit: 'm²' };
              qty = areaM2;
            }
          } else if (catType === 'PROFILE') {
            const matched = alumColor ? profiles.find((p) => p.colorFinish?.toLowerCase() === alumColor.toLowerCase()) : null;
            const chosen = matched ?? profiles[0];
            if (chosen) {
              mat = { id: chosen.id, name: chosen.name, price: chosen.salePrice ?? 0, unit: chosen.unitMeasure ?? 'm' };
              qty = 2;
            }
          } else if (catType === 'ROLLERS') {
            const chosen = hardwares.find((hw) => hw.name.toLowerCase().includes('rold')) ?? hardwares[0];
            if (chosen) {
              mat = { id: chosen.id, name: chosen.name, price: chosen.salePrice ?? 0, unit: chosen.unitMeasure ?? 'un' };
              qty = 2;
            }
          } else if (catType === 'HARDWARE') {
            const chosen = hardwares[0];
            if (chosen) {
              mat = { id: chosen.id, name: chosen.name, price: chosen.salePrice ?? 0, unit: chosen.unitMeasure ?? 'un' };
              qty = 1;
            }
          } else if (catType === 'FILM') {
            const chosen = films[0];
            if (chosen) {
              mat = { id: chosen.id, name: chosen.name, price: chosen.salePrice ?? 0, unit: 'm²' };
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
          });
        });

        return selections;
      }

      // Fallback padrão se o produto não tiver requisitos nem itens configurados
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
        });
      }
      return fallbackSelections;
    },
    [glasses, profiles, hardwares, films, findCatalogMaterial]
  );

  // ─── Inicialização de Estado ───────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) {
      hasInitializedRef.current = false;
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

    setErrors({});
  }, [isOpen, editingItem, templates, buildSelectionsForTemplate, findCatalogMaterial]);

  // ─── Bloqueio de scroll e fechar com ESC ────────────────────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

    // Handler removido: a troca de template ocorre externamente no ProductPickerModal.

  // ─── Handler: Alterar Seleção de Material por Categoria ───────────────────
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
        if (mat.colorFinish) {
          nextAlum = mat.colorFinish;
        } else if (mat.name.toLowerCase().includes('branco')) {
          nextAlum = 'Branco Brilhante';
        } else if (mat.name.toLowerCase().includes('preto')) {
          nextAlum = 'Preto Fosco';
        } else if (mat.name.toLowerCase().includes('bronze')) {
          nextAlum = 'Bronze / Champanhe';
        } else if (mat.name.toLowerCase().includes('anodizado') || mat.name.toLowerCase().includes('fosco')) {
          nextAlum = 'Alumínio Fosco / Anodizado';
        }
      }

      if (sel.categoryType === 'GLASS' && mat) {
        if (mat.colorFinish) {
          nextGlass = mat.colorFinish;
        } else if (mat.name.toLowerCase().includes('fumê') || mat.name.toLowerCase().includes('fume')) {
          nextGlass = 'Fumê / Cinza';
        } else if (mat.name.toLowerCase().includes('incolor')) {
          nextGlass = 'Incolor';
        } else if (mat.name.toLowerCase().includes('verde')) {
          nextGlass = 'Verde';
        } else if (mat.name.toLowerCase().includes('canelado')) {
          nextGlass = 'Canelado / Texturizado';
        } else if (mat.name.toLowerCase().includes('reflecta')) {
          nextGlass = 'Reflecta Bronze';
        }
      }

      if (sel.categoryType === 'HARDWARE' && mat) {
        const n = mat.name.toLowerCase();
        if (n.includes('tubular') || n.includes('inox') || n.includes('barra')) {
          nextHandleType = 'BAR_TUBULAR';
        } else if (n.includes('concha') || n.includes('fecho')) {
          nextHandleType = 'SHELL_LOCK';
        } else if (n.includes('maçaneta') || n.includes('macaneta') || n.includes('alavanca')) {
          nextHandleType = 'LEVER_HANDLE';
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
                totalPrice: (s.quantity ?? 1) * unitPrice,
              }
            : s,
        ),
      };
    });
  };

  // ─── Handler: Alterar Quantidade Manual de Material ──────────────────────
  const handleMaterialQtyChange = (requirementId: string, valStr: string | undefined) => {
    setState((prev) => ({
      ...prev,
      materialSelections: prev.materialSelections.map((s) => {
        if (s.requirementId !== requirementId) return s;

        const isIntegerUnit = s.unitMeasure === 'UN' || s.unitMeasure === 'PAR' || s.unitMeasure === 'PAIR' || s.unitMeasure === 'un';
        let qty: number | undefined = undefined;

        if (valStr !== undefined) {
          // Mantém a vírgula/ponto inicial para não bugar o input de texto,
          // mas proíbe que o resultado final seja não-inteiro se for UN/PAR
          const num = parseFloat(String(valStr).replace(',', '.'));
          
          if (!isNaN(num) && num >= 0) {
            qty = isIntegerUnit ? Math.floor(num) : num;
          }
        }

        return {
          ...s,
          quantity: qty,
          totalPrice: qty !== undefined ? parseFloat((qty * s.unitPrice).toFixed(2)) : undefined,
        };
      }),
    }));
  };

  // ─── Handlers para Adicionar/Remover Insumos Extras ────────────────────────
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

  // ─── Handlers de Puxador ──────────────────────────────────────────────────
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

  // ─── Handlers de Furação ──────────────────────────────────────────────────
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

  // ─── Cálculo do Subtotal Estimado do Item ──────────────────────────────────
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

  // ─── Validação e Submissão ────────────────────────────────────────────────
  // ─── Validação por Etapa do Wizard ─────────────────────────────────────────
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
    // Só valida se estiver avançando
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

  if (!isOpen) return null;

  const svgW = typeof state.widthMm === 'number' && state.widthMm > 0 ? state.widthMm : DEFAULT_WIDTH;
  const svgH = typeof state.heightMm === 'number' && state.heightMm > 0 ? state.heightMm : DEFAULT_HEIGHT;
  const unitAreaM2 = ((svgW / 1000) * (svgH / 1000)).toFixed(2);
  const totalQty = typeof state.quantity === 'number' && state.quantity >= 1 ? state.quantity : 1;

  // ─── Render do Modal ──────────────────────────────────────────────────────
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-xs sm:p-md bg-black/75 backdrop-blur-sm animate-fadeIn">
      <button
        type="button"
        className="fixed inset-0 w-full h-full bg-transparent border-0 cursor-default"
        onClick={onClose}
        tabIndex={-1}
        aria-label="Fechar fundo do modal"
      />

      <div
        className="relative bg-surface border border-outline-variant rounded-xl w-full h-[96vh] sm:h-auto sm:max-h-[92vh] shadow-2xl flex flex-col overflow-hidden z-10"
        style={{ maxWidth: '1380px' }}
        aria-modal="true"
      >
        {/* ── Header do Modal ────────────────────────────────────────────── */}
        <header className="flex items-center justify-between px-sm sm:px-lg py-sm border-b border-outline-variant bg-surface-container-low flex-shrink-0">
          <div className="flex items-center gap-xs sm:gap-sm flex-1 min-w-0">
            <span className="material-symbols-outlined text-[20px] sm:text-[24px] text-primary shrink-0">tune</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-xs flex-wrap">
                <h2 className="font-headline text-base sm:text-title-md font-bold text-on-surface truncate">
                  {state.template?.name ?? 'Configurar Esquadria'}
                </h2>
              </div>
              <p className="font-body text-[11px] sm:text-xs text-on-surface-variant truncate">
                Configure os insumos, medidas e parâmetros técnicos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-xs shrink-0 ml-xs sm:ml-sm">
            <button
              type="button"
              onClick={onClose}
              className="p-1 sm:p-2 text-on-surface-variant hover:bg-surface-container-highest rounded-full transition-colors"
              aria-label="Fechar"
            >
              <span className="material-symbols-outlined text-[22px] sm:text-[24px]">close</span>
            </button>
          </div>
        </header>

        {/* ── Stepper do Wizard (Totalmente Responsivo) ────────────────────── */}
        <div className="bg-surface-container-low border-b border-outline-variant px-sm sm:px-lg py-2 sm:py-sm flex-shrink-0">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[
              { num: 1, title: 'Medidas', fullTitle: 'Medidas & Vão', icon: 'aspect_ratio' },
              { num: 2, title: 'Insumos', fullTitle: 'Insumos & Cores', icon: 'palette' },
              { num: 3, title: 'Mecânica', fullTitle: 'Mecânica & Furação', icon: 'tune' },
              { num: 4, title: 'Resumo', fullTitle: 'Resumo & Confirmação', icon: 'task_alt' },
            ].map((step, idx, arr) => {
              const isActive = currentStep === step.num;
              const isCompleted = currentStep > step.num;

              return (
                <React.Fragment key={step.num}>
                  <button
                    type="button"
                    onClick={() => handleGoToStep(step.num as 1 | 2 | 3 | 4)}
                    className="flex items-center gap-1 sm:gap-2 group focus:outline-none"
                    aria-current={isActive ? 'step' : undefined}
                    title={step.fullTitle}
                  >
                    <div
                      className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-label font-bold transition-all ${
                        isActive
                          ? 'bg-primary text-on-primary shadow-xs ring-2 ring-primary/30'
                          : isCompleted
                          ? 'bg-primary/20 text-primary hover:bg-primary/30'
                          : 'bg-surface-container-highest text-on-surface-variant'
                      }`}
                    >
                      {isCompleted ? (
                        <span className="material-symbols-outlined text-[14px] sm:text-[18px]">check</span>
                      ) : (
                        step.num
                      )}
                    </div>
                    <div className="flex flex-col text-left">
                      <span
                        className={`text-[11px] sm:text-xs font-label font-bold leading-tight ${
                          isActive ? 'text-primary' : isCompleted ? 'text-on-surface' : 'text-on-surface-variant'
                        }`}
                      >
                        <span className="sm:hidden">{step.title}</span>
                        <span className="hidden sm:inline">{step.fullTitle}</span>
                      </span>
                      <span className="hidden md:inline text-[10px] text-secondary font-body leading-none">
                        Passo {step.num} de 4
                      </span>
                    </div>
                  </button>

                  {idx < arr.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-1 sm:mx-3 transition-colors ${
                        currentStep > step.num ? 'bg-primary' : 'bg-outline-variant'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* ── Corpo do Modal: Desktop (50/50 lado a lado) / Mobile (Stack Vertical inteligente) ── */}
        <main className="flex-1 overflow-y-auto p-sm sm:p-md lg:p-lg min-h-0 bg-surface">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-md sm:gap-lg items-stretch">

            {/* ════════════════════════════════════════════════════════════════
                METADE ESQUERDA: GABARITO CAD (FIXO 50% NO DESKTOP / ACORDEÃO COLLAPSIBLE NO MOBILE)
               ════════════════════════════════════════════════════════════════ */}
            <div className="lg:col-span-6 flex flex-col gap-sm">

              {/* Botão de Toggle do CAD em Telas Pequenas */}
              <div className="lg:hidden bg-surface-container-low border border-outline-variant rounded-lg p-2 flex items-center justify-between shadow-2xs">
                <button
                  type="button"
                  onClick={() => setIsMobileCadExpanded((prev) => !prev)}
                  className="flex items-center gap-2 text-xs font-label font-bold text-on-surface hover:text-primary transition-colors focus:outline-none w-full justify-between"
                  aria-expanded={isMobileCadExpanded}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-primary">architecture</span>
                    <span>Gabarito CAD ({svgW} × {svgH} mm)</span>
                  </div>
                  <div className="flex items-center gap-1 text-secondary font-data-mono">
                    <span>{unitAreaM2} m²</span>
                    <span className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${isMobileCadExpanded ? 'rotate-180' : ''}`}>
                      expand_more
                    </span>
                  </div>
                </button>
              </div>

              {/* Card do CAD (Sempre visível no Desktop; no Mobile só aparece se expandido) */}
              <div
                className={`${
                  isMobileCadExpanded ? 'flex' : 'hidden lg:flex'
                } bg-surface-container-lowest border border-outline-variant rounded-xl p-sm sm:p-md lg:p-lg shadow-sm flex-col gap-sm flex-1 min-h-[280px] sm:min-h-[380px] lg:min-h-[500px] transition-all`}
              >
                <div className="hidden lg:flex items-center justify-between pb-xs border-b border-outline-variant/50">
                  <h3 className="text-sm font-label font-bold text-on-surface flex items-center gap-xs uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[20px] text-primary">architecture</span>
                    Gabarito Técnico CAD
                  </h3>
                  <div className="flex items-center gap-xs">
                    <span className="text-xs font-data-mono font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded border border-primary/30">
                      {svgW} × {svgH} mm
                    </span>
                    <span className="text-xs font-data-mono text-secondary bg-surface-container-low px-2 py-0.5 rounded border border-outline-variant/60">
                      {unitAreaM2} m²
                    </span>
                  </div>
                </div>

                {/* Container Principal do SVG com altura elástica */}
                <div className="flex-1 flex flex-col items-center justify-center w-full min-h-[220px] sm:min-h-[300px] lg:min-h-[340px] p-xs sm:p-sm overflow-hidden bg-surface-container-lowest/50 rounded-lg">
                  <WindowSvgPreview
                    templateType={svgTemplate}
                    widthMm={svgW}
                    heightMm={svgH}
                    openingDirection={state.openingDirection}
                    handleConfig={state.handleConfig}
                    drillingConfig={state.drillingConfig}
                    templateName={state.template?.name}
                    aluminumColor={state.aluminumColor}
                    glassFinish={state.glassFinish}
                    baseWidth="100%"
                    maxHeight={420}
                  />
                </div>

                {/* Badge de Resumo Inferior */}
                <div className="flex items-center justify-between text-xs font-data-mono text-on-surface-variant bg-surface-container-low px-sm sm:px-md py-1.5 sm:py-2 rounded-lg border border-outline-variant/60">
                  <span className="truncate max-w-[180px] sm:max-w-none">Modelo: <strong className="text-on-surface">{state.template?.name ?? 'Base'}</strong></span>
                  <span>Qtd: <strong className="text-primary font-bold">{totalQty} {totalQty > 1 ? 'unidades' : 'un'}</strong></span>
                </div>
              </div>

              {/* Dica da Etapa Atual (Desktop) */}
              <div className="hidden lg:flex bg-surface-container-low border border-outline-variant/60 rounded-lg p-sm items-start gap-xs text-xs font-body text-on-surface-variant shrink-0">
                <span className="material-symbols-outlined text-[18px] text-primary shrink-0 mt-0.5">info</span>
                <div>
                  {currentStep === 1 && <p>Defina as dimensões e quantidade para calcularmos os insumos exatos do vão.</p>}
                  {currentStep === 2 && <p>Confirme os materiais (vidro, perfis, ferragens) e seus acabamentos estéticos.</p>}
                  {currentStep === 3 && <p>Configure os sentidos de abertura, modelo do puxador e parâmetros de furação.</p>}
                  {currentStep === 4 && <p>Revise a ficha técnica completa antes de adicionar ao orçamento.</p>}
                </div>
              </div>

            </div>

            {/* ════════════════════════════════════════════════════════════════
                METADE DIREITA (50% no Desktop / 100% no Mobile): CONTEÚDO WIZARD
               ════════════════════════════════════════════════════════════════ */}
            <div className="lg:col-span-6 flex flex-col gap-md">

              {/* ─────────────────────────────────────────────────────────────
                  PASSO 1: MEDIDAS & QUANTIDADE DO VÃO
                 ───────────────────────────────────────────────────────────── */}
              {currentStep === 1 && (
                <div className="flex flex-col gap-md animate-fadeIn">
                  <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md sm:p-lg shadow-xs flex flex-col gap-md">
                    <div className="flex items-center justify-between pb-xs border-b border-outline-variant">
                      <h3 className="text-base font-label font-bold text-on-surface uppercase tracking-wider flex items-center gap-xs">
                        <span className="material-symbols-outlined text-[20px] text-primary">aspect_ratio</span>
                        1. Medidas e Quantidade
                      </h3>
                      <span className="text-xs font-label text-secondary font-medium">
                        Dimensões físicas
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
                      <div>
                        <label
                          htmlFor="modal-width-input"
                          className="text-sm font-label font-semibold text-on-surface flex items-center gap-0.5 mb-1.5 whitespace-nowrap"
                        >
                          Largura (mm)<span className="text-error font-bold leading-none">*</span>
                        </label>
                        <input
                          id="modal-width-input"
                          type="number"
                          min={100}
                          max={9999}
                          value={state.widthMm}
                          onChange={(e) =>
                            setState((p) => ({
                              ...p,
                              widthMm: parseInt(e.target.value, 10) || '',
                            }))
                          }
                          aria-label="Largura em milímetros"
                          className={`w-full py-2.5 px-3 bg-surface border rounded-lg text-base font-data-mono text-on-surface focus:border-primary focus:outline-none transition-colors ${
                            errors.widthMm ? 'border-error' : 'border-outline-variant'
                          }`}
                        />
                        {errors.widthMm && <span className="text-xs text-error mt-1 block">{errors.widthMm}</span>}
                      </div>

                      <div>
                        <label
                          htmlFor="modal-height-input"
                          className="text-sm font-label font-semibold text-on-surface flex items-center gap-0.5 mb-1.5 whitespace-nowrap"
                        >
                          Altura (mm)<span className="text-error font-bold leading-none">*</span>
                        </label>
                        <input
                          id="modal-height-input"
                          type="number"
                          min={100}
                          max={9999}
                          value={state.heightMm}
                          onChange={(e) =>
                            setState((p) => ({
                              ...p,
                              heightMm: parseInt(e.target.value, 10) || '',
                            }))
                          }
                          aria-label="Altura em milímetros"
                          className={`w-full py-2.5 px-3 bg-surface border rounded-lg text-base font-data-mono text-on-surface focus:border-primary focus:outline-none transition-colors ${
                            errors.heightMm ? 'border-error' : 'border-outline-variant'
                          }`}
                        />
                        {errors.heightMm && <span className="text-xs text-error mt-1 block">{errors.heightMm}</span>}
                      </div>

                      <div>
                        <label
                          htmlFor="modal-quantity-input"
                          className="text-sm font-label font-semibold text-on-surface flex items-center gap-0.5 mb-1.5 whitespace-nowrap"
                        >
                          Quantidade<span className="text-error font-bold leading-none">*</span>
                        </label>
                        <input
                          id="modal-quantity-input"
                          type="number"
                          min={1}
                          max={999}
                          value={state.quantity}
                          onChange={(e) => {
                            const val = e.target.value;
                            setState((p) => ({
                              ...p,
                              quantity: val === '' ? ('' as unknown as number) : Math.max(1, parseInt(val, 10) || 1),
                            }));
                          }}
                          aria-label="Quantidade de Esquadrias"
                          className={`w-full py-2.5 px-3 bg-surface border rounded-lg text-base font-data-mono text-on-surface focus:border-primary focus:outline-none transition-colors ${
                            errors.quantity ? 'border-error' : 'border-outline-variant'
                          }`}
                        />
                        {errors.quantity && <span className="text-xs text-error mt-1 block">{errors.quantity}</span>}
                      </div>
                    </div>

                    {/* Resumo da Área Calculada */}
                    <div className="bg-surface-container-low border border-outline-variant/60 rounded-lg p-md flex items-center gap-sm">
                      <span className="material-symbols-outlined text-[24px] text-primary">straighten</span>
                      <div>
                        <div className="text-sm font-body text-on-surface">
                          Área unitária do vão: <strong className="font-data-mono font-bold text-base">{unitAreaM2} m²</strong>
                        </div>
                        {totalQty > 1 && (
                          <div className="text-xs font-data-mono text-secondary">
                            Área total acumulada ({totalQty} unidades): <strong className="text-primary font-bold">{((+unitAreaM2) * totalQty).toFixed(2)} m²</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  PASSO 2: INSUMOS, MATERIAIS & CORES
                 ───────────────────────────────────────────────────────────── */}
              {currentStep === 2 && (
                <div className="flex flex-col gap-md animate-fadeIn">
                  {/* Cores e Acabamentos Globais */}
                  <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md shadow-xs flex flex-col gap-sm">
                    <div className="flex items-center justify-between pb-xs border-b border-outline-variant/50">
                      <h3 className="text-sm font-label font-bold text-on-surface flex items-center gap-xs uppercase tracking-wider">
                        <span className="material-symbols-outlined text-[18px] text-primary">palette</span>
                        Acabamentos do Modelo
                      </h3>
                      <span className="text-xs font-label text-on-surface-variant">Cores Gerais</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
                      <div>
                        <label htmlFor="aluminum-color-select" className="text-xs sm:text-sm font-label font-medium text-on-surface block mb-1">
                          Cor do Alumínio
                        </label>
                        <select
                          id="aluminum-color-select"
                          value={state.aluminumColor}
                          onChange={(e) => setState((p) => ({ ...p, aluminumColor: e.target.value }))}
                          aria-label="Cor do Alumínio"
                          className="w-full text-sm py-2 px-2.5 bg-surface border border-outline-variant rounded font-body text-on-surface focus:border-primary focus:outline-none transition-colors"
                        >
                          {dynamicAluminumColors.map((col) => (
                            <option key={col} value={col}>{col}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="glass-finish-select" className="text-xs sm:text-sm font-label font-medium text-on-surface block mb-1">
                          Acabamento do Vidro
                        </label>
                        <select
                          id="glass-finish-select"
                          value={state.glassFinish}
                          onChange={(e) => setState((p) => ({ ...p, glassFinish: e.target.value }))}
                          aria-label="Acabamento do Vidro"
                          className="w-full text-sm py-2 px-2.5 bg-surface border border-outline-variant rounded font-body text-on-surface focus:border-primary focus:outline-none transition-colors"
                        >
                          {dynamicGlassFinishes.map((fin) => (
                            <option key={fin} value={fin}>{fin}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Lista de Insumos da Esquadria */}
                  <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md shadow-xs flex flex-col gap-sm">
                    <div className="flex items-center justify-between pb-xs border-b border-outline-variant flex-wrap gap-xs">
                      <div className="flex items-center gap-xs">
                        <span className="material-symbols-outlined text-[18px] text-primary">inventory_2</span>
                        <h3 className="text-sm font-label font-bold text-on-surface uppercase tracking-wider">
                          Composição de Insumos
                        </h3>
                      </div>

                      {/* Botões rápidos para adicionar insumos */}
                      <div className="flex items-center gap-xs flex-wrap">
                        <button
                          type="button"
                          onClick={() => handleAddMaterial('GLASS')}
                          className="px-2.5 py-1 rounded text-xs font-label font-semibold text-primary hover:bg-primary/10 transition-colors border border-primary/40"
                        >
                          + Vidro
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddMaterial('PROFILE')}
                          className="px-2.5 py-1 rounded text-xs font-label font-semibold text-primary hover:bg-primary/10 transition-colors border border-primary/40"
                        >
                          + Perfil
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddMaterial('HARDWARE')}
                          className="px-2.5 py-1 rounded text-xs font-label font-semibold text-primary hover:bg-primary/10 transition-colors border border-primary/40"
                        >
                          + Ferragem
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddMaterial('ROLLERS')}
                          className="px-2.5 py-1 rounded text-xs font-label font-semibold text-primary hover:bg-primary/10 transition-colors border border-primary/40"
                        >
                          + Roldana
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddMaterial('FILM')}
                          className="px-2.5 py-1 rounded text-xs font-label font-semibold text-primary hover:bg-primary/10 transition-colors border border-primary/40"
                        >
                          + Película
                        </button>
                      </div>
                    </div>

                    {state.materialSelections.length === 0 ? (
                      <div className="text-center py-md text-sm text-on-surface-variant font-body bg-surface-container-low rounded border border-outline-variant/60">
                        <p>Nenhum insumo configurado para este produto.</p>
                        <p className="mt-xs text-secondary text-xs">Utilize os botões acima para adicionar insumos ao item.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-xs max-h-[380px] overflow-y-auto pr-1">
                        {state.materialSelections.map((sel) => {
                          const reqId = sel.requirementId;
                          const categoryType = sel.categoryType;
                          const iconName = CATEGORY_ICONS[categoryType] ?? 'category';

                          let optionsList: { id: string; name: string; price: number; unit: string }[] = [];
                          if (categoryType === 'GLASS') {
                            optionsList = glasses.map((g) => ({
                              id: g.id,
                              name: g.name,
                              price: g.salePrice ?? g.pricePerSqm ?? 0,
                              unit: 'm²',
                            }));
                          } else if (categoryType === 'PROFILE') {
                            optionsList = profiles.map((p) => ({
                              id: p.id,
                              name: p.name,
                              price: p.salePrice ?? 0,
                              unit: p.unitMeasure ?? 'm',
                            }));
                          } else if (categoryType === 'HARDWARE' || categoryType === 'ROLLERS') {
                            optionsList = hardwares.map((h) => ({
                              id: h.id,
                              name: h.name,
                              price: h.salePrice ?? 0,
                              unit: h.unitMeasure ?? 'un',
                            }));
                          } else if (categoryType === 'FILM') {
                            optionsList = films.map((f) => ({
                              id: f.id,
                              name: f.name,
                              price: f.salePrice ?? 0,
                              unit: 'm²',
                            }));
                          }

                          const categoryPrice = sel.totalPrice;
                          const unitMeasure = sel.unitMeasure ?? (categoryType === 'GLASS' || categoryType === 'FILM' ? 'm²' : categoryType === 'PROFILE' ? 'm' : 'un');

                          return (
                            <div
                              key={reqId}
                              className="bg-surface-container-low border border-outline-variant/60 rounded-md p-sm sm:p-md flex flex-col gap-xs hover:border-primary/40 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-xs min-w-0">
                                  <span className="material-symbols-outlined text-[18px] text-primary">{iconName}</span>
                                  <span className="text-sm font-label font-semibold text-on-surface truncate">
                                    {sel.label} {sel.isOptional && <span className="text-on-surface-variant font-normal text-xs">(Opcional)</span>}
                                  </span>
                                </div>
                                <div className="flex items-center gap-xs shrink-0">
                                  <span className="font-data-mono font-bold text-primary text-sm sm:text-base">
                                    {categoryPrice !== undefined
                                      ? formatBRL(categoryPrice)
                                      : sel.materialId
                                      ? `${formatBRL(sel.unitPrice)} / ${unitMeasure}`
                                      : '—'}
                                  </span>
                                  {sel.isOptional && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveMaterial(reqId)}
                                      className="p-1 text-on-surface-variant hover:text-error hover:bg-error/10 rounded transition-colors"
                                      title="Remover este insumo"
                                    >
                                      <span className="material-symbols-outlined text-[16px]">close</span>
                                    </button>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-xs mt-xs">
                                <select
                                  value={sel.materialId ?? ''}
                                  onChange={(e) => handleMaterialChange(reqId, e.target.value)}
                                  aria-label={`Selecionar material para ${sel.label}`}
                                  className="flex-1 text-sm py-2 px-2.5 bg-surface border border-outline-variant rounded font-body text-on-surface focus:border-primary focus:outline-none min-w-0 transition-colors"
                                >
                                  {sel.isOptional && <option value="">-- Sem {sel.label} / Nenhuma --</option>}
                                  {!sel.isOptional && !sel.materialId && (
                                    <option value="">-- Selecione o material --</option>
                                  )}
                                  {optionsList.map((opt) => (
                                    <option key={opt.id} value={opt.id}>
                                      {opt.name} · {formatBRL(opt.price)} / {opt.unit}
                                    </option>
                                  ))}
                                </select>

                                <div className="flex items-center gap-[2px] shrink-0">
                                  <input
                                    type="number"
                                    step={unitMeasure === 'UN' || unitMeasure === 'PAR' || unitMeasure === 'PAIR' || unitMeasure === 'un' ? "1" : "0.01"}
                                    min={0}
                                    value={sel.quantity ?? ''}
                                    onChange={(e) => handleMaterialQtyChange(reqId, e.target.value)}
                                    disabled={!sel.materialId}
                                    placeholder="Qtd"
                                    aria-label={`Quantidade de ${sel.label}`}
                                    className="w-20 py-2 px-2 bg-surface border border-outline-variant rounded text-sm font-data-mono text-on-surface text-center focus:border-primary focus:outline-none disabled:opacity-40 transition-colors"
                                  />
                                  <span className="text-xs font-data-mono text-on-surface bg-surface-container px-2.5 py-2 rounded border border-outline-variant min-w-[36px] text-center font-medium">
                                    {unitMeasure}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  PASSO 3: MECÂNICA, PUXADOR, FURAÇÃO & OBSERVAÇÕES
                 ───────────────────────────────────────────────────────────── */}
              {currentStep === 3 && (
                <div className="flex flex-col gap-md animate-fadeIn">
                  {/* Sentido de Abertura & Puxador */}
                  <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md shadow-xs flex flex-col gap-sm">
                    <div className="flex items-center justify-between pb-xs border-b border-outline-variant">
                      <h3 className="text-sm font-label font-bold text-on-surface uppercase tracking-wider flex items-center gap-xs">
                        <span className="material-symbols-outlined text-[18px] text-primary">tune</span>
                        Mecânica da Folha & Puxador
                      </h3>
                    </div>

                    {/* Sentido de Abertura */}
                    <div className="flex flex-col gap-xs">
                      <label className="text-xs sm:text-sm font-label font-semibold text-on-surface flex items-center gap-xs mb-1">
                        <span className="material-symbols-outlined text-[16px] text-primary">swap_horiz</span>
                        Sentido de Abertura da Folha
                      </label>
                      <div className={`grid ${supportedDirections.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-xs`}>
                        {supportedDirections.map((dir) => {
                          const isSelected = state.openingDirection === dir;
                          let label = 'Abrir';
                          let icon = 'swap_horiz';
                          if (dir === 'LEFT_TO_RIGHT') { label = 'Abrir p/ Direita'; icon = 'arrow_forward'; }
                          else if (dir === 'RIGHT_TO_LEFT') { label = 'Abrir p/ Esquerda'; icon = 'arrow_back'; }
                          else if (dir === 'OUTSIDE') { label = 'Para Fora'; icon = 'open_in_new'; }
                          else if (dir === 'INSIDE') { label = 'Para Dentro'; icon = 'login'; }
                          else if (dir === 'CENTER_TO_SIDES') { label = 'Centro p/ Lados'; icon = 'unfold_more'; }

                          return (
                            <button
                              key={dir}
                              type="button"
                              onClick={() => setState((p) => ({ ...p, openingDirection: dir }))}
                              aria-pressed={isSelected}
                              className={`py-2 px-3 rounded border text-xs sm:text-sm font-label font-semibold flex items-center justify-center gap-1.5 transition-all ${
                                isSelected
                                  ? 'bg-primary text-on-primary border-primary shadow-xs'
                                  : 'bg-surface border-outline-variant text-on-surface hover:bg-surface-container'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[18px]">{icon}</span>
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Puxador */}
                    <div className="pt-xs border-t border-outline-variant/50 flex flex-col gap-xs">
                      <label className="text-xs sm:text-sm font-label font-semibold text-on-surface flex items-center gap-xs mb-1">
                        <span className="material-symbols-outlined text-[16px] text-primary">hardware</span>
                        Puxador & Ferragens de Manuseio
                      </label>
                      <div className="grid grid-cols-2 gap-sm">
                        <div>
                          <label htmlFor="handle-type-select" className="text-xs sm:text-sm font-label font-medium text-on-surface block mb-1">
                            Tipo de Puxador
                          </label>
                          <select
                            id="handle-type-select"
                            value={state.handleConfig.handleType}
                            onChange={(e) => handleHandleTypeChange(e.target.value as HandleType)}
                            aria-label="Tipo de Puxador"
                            className="w-full text-sm py-2 px-2.5 bg-surface border border-outline-variant rounded font-body text-on-surface focus:border-primary focus:outline-none transition-colors"
                          >
                            <option value="BAR_TUBULAR">Tubular Inox</option>
                            <option value="SHELL_LOCK">Fecho Concha</option>
                            <option value="LEVER_HANDLE">Maçaneta</option>
                            <option value="NONE">Sem Puxador</option>
                          </select>
                        </div>

                        <div>
                          <label htmlFor="handle-side-select" className="text-xs sm:text-sm font-label font-medium text-on-surface block mb-1">
                            Lados do Puxador
                          </label>
                          <select
                            id="handle-side-select"
                            value={state.handleConfig.side ?? 'ONE_SIDE'}
                            onChange={(e) => handleHandleSideChange(e.target.value as HandleSide)}
                            disabled={state.handleConfig.handleType === 'NONE'}
                            aria-label="Lados do Puxador"
                            className="w-full text-sm py-2 px-2.5 bg-surface border border-outline-variant rounded font-body text-on-surface focus:border-primary focus:outline-none disabled:opacity-50 transition-colors"
                          >
                            <option value="ONE_SIDE">1 Lado (Face Única)</option>
                            <option value="BOTH_SIDES">2 Lados (Frente e Verso)</option>
                          </select>
                        </div>
                      </div>

                      {state.handleConfig.handleType === 'BAR_TUBULAR' && (
                        <div className="grid grid-cols-2 gap-sm pt-xs border-t border-outline-variant/40">
                          <div>
                            <label htmlFor="handle-coverage-select" className="text-xs sm:text-sm font-label font-medium text-on-surface block mb-1">
                              Extensão do Puxador
                            </label>
                            <select
                              id="handle-coverage-select"
                              value={state.handleConfig.coverage ?? 'FULL'}
                              onChange={(e) => handleHandleCoverageChange(e.target.value as HandleCoverage)}
                              aria-label="Extensão do Puxador"
                              className="w-full text-sm py-2 px-2.5 bg-surface border border-outline-variant rounded font-body text-on-surface focus:border-primary focus:outline-none transition-colors"
                            >
                              <option value="FULL">Extensão Total da Folha</option>
                              <option value="PIECE">Pedaço / Tamanho Fixo</option>
                            </select>
                          </div>

                          {state.handleConfig.coverage === 'PIECE' && (
                            <div>
                              <label htmlFor="handle-length-input" className="text-xs sm:text-sm font-label font-medium text-on-surface block mb-1">
                                Comprimento (cm)
                              </label>
                              <input
                                id="handle-length-input"
                                type="number"
                                min={10}
                                max={300}
                                value={state.handleConfig.pieceLengthCm ?? 40}
                                onChange={(e) =>
                                  setState((p) => ({
                                    ...p,
                                    handleConfig: {
                                      ...p.handleConfig,
                                      pieceLengthCm: parseInt(e.target.value, 10) || 40,
                                    },
                                  }))
                                }
                                aria-label="Comprimento do Puxador em centímetros"
                                className="w-full text-sm py-2 px-2.5 bg-surface border border-outline-variant rounded font-data-mono text-on-surface focus:border-primary focus:outline-none transition-colors"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Furação da Esquadria */}
                  <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md shadow-xs flex flex-col gap-sm">
                    <div className="flex items-center justify-between pb-xs border-b border-outline-variant">
                      <h3 className="text-sm font-label font-bold text-on-surface uppercase tracking-wider flex items-center gap-xs">
                        <span className="material-symbols-outlined text-[18px] text-primary">adjust</span>
                        Furação do Vidro
                      </h3>
                      <span className="text-xs font-data-mono text-on-surface-variant bg-surface-container px-2 py-0.5 rounded border border-outline-variant/50">
                        {state.drillingConfig.holeCount === 0
                          ? 'Sem furação'
                          : `${state.drillingConfig.holeCount} ${state.drillingConfig.holeCount === 1 ? 'furo' : 'furos'}`}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-sm">
                      <div>
                        <label htmlFor="hole-count-select" className="text-xs sm:text-sm font-label font-medium text-on-surface block mb-1">
                          Qtd de Furos
                        </label>
                        <select
                          id="hole-count-select"
                          value={state.drillingConfig.holeCount}
                          onChange={(e) => handleHoleCountChange(parseInt(e.target.value, 10))}
                          aria-label="Quantidade de Furos"
                          className="w-full text-sm py-2 px-2.5 bg-surface border border-outline-variant rounded font-body text-on-surface focus:border-primary focus:outline-none"
                        >
                          <option value={0}>Sem Furação</option>
                          <option value={1}>1 Furo</option>
                          <option value={2}>2 Furos (Padrão)</option>
                          <option value={3}>3 Furos</option>
                          <option value={4}>4 Furos</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="hole-division-select" className="text-xs sm:text-sm font-label font-medium text-on-surface block mb-1">
                          Distribuição dos Furos
                        </label>
                        <select
                          id="hole-division-select"
                          value={state.drillingConfig.divisionType}
                          onChange={(e) => handleDivisionTypeChange(e.target.value as DivisionType)}
                          disabled={state.drillingConfig.holeCount === 0}
                          aria-label="Divisão dos Furos"
                          className="w-full text-sm py-2 px-2.5 bg-surface border border-outline-variant rounded font-body text-on-surface focus:border-primary focus:outline-none disabled:opacity-50"
                        >
                          <option value="EQUAL">Por igual (Automático)</option>
                          <option value="CUSTOM_DISTANCE">Com medida (Distâncias)</option>
                        </select>
                      </div>
                    </div>

                    {state.drillingConfig.holeCount > 0 && state.drillingConfig.divisionType === 'CUSTOM_DISTANCE' && (
                      <div className="pt-xs border-t border-outline-variant/50 flex flex-col gap-xs">
                        <div className="flex items-center justify-between">
                          <label className="text-xs sm:text-sm font-label font-medium text-on-surface">
                            Distâncias dos Furos (mm)
                          </label>
                          <span className="text-[11px] font-data-mono text-secondary">
                            Topo até base (máx {typeof state.heightMm === 'number' ? state.heightMm : DEFAULT_HEIGHT} mm)
                          </span>
                        </div>
                        <div
                          className={`grid ${
                            state.drillingConfig.holeCount === 1
                              ? 'grid-cols-1'
                              : state.drillingConfig.holeCount === 3
                              ? 'grid-cols-3'
                              : 'grid-cols-2'
                          } gap-sm mt-xs`}
                        >
                          {Array.from({ length: state.drillingConfig.holeCount }, (_, i) => {
                            const holeNum = i + 1;
                            const val = holeDistanceInputs[i] ?? '';
                            return (
                              <div key={`hole-input-${holeNum}`}>
                                <label
                                  htmlFor={`hole-distance-input-${holeNum}`}
                                  className="text-xs font-label font-medium text-on-surface-variant block mb-1"
                                >
                                  Furo {holeNum} (mm)
                                </label>
                                <input
                                  id={`hole-distance-input-${holeNum}`}
                                  type="number"
                                  min={10}
                                  max={typeof state.heightMm === 'number' ? state.heightMm : 9999}
                                  step={10}
                                  value={val}
                                  onChange={(e) => handleSingleHoleDistanceChange(i, e.target.value)}
                                  placeholder={`Ex: ${Math.round(
                                    ((typeof state.heightMm === 'number' ? state.heightMm : DEFAULT_HEIGHT) /
                                      (state.drillingConfig.holeCount + 1)) *
                                      holeNum,
                                  )}`}
                                  aria-label={`Distância do Furo ${holeNum} em milímetros`}
                                  className="w-full text-sm py-2 px-2.5 bg-surface border border-outline-variant rounded font-data-mono text-on-surface focus:border-primary focus:outline-none transition-colors"
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {state.drillingConfig.holeCount > 0 && state.drillingConfig.divisionType === 'EQUAL' && (
                      <div className="pt-xs border-t border-outline-variant/40 flex items-center gap-xs text-xs font-data-mono text-on-surface-variant bg-surface-container-low px-sm py-2 rounded border border-outline-variant/60">
                        <span className="material-symbols-outlined text-[16px] text-primary">info</span>
                        <span>
                          {state.drillingConfig.holeCount} {state.drillingConfig.holeCount === 1 ? 'furo centralizado' : 'furos distribuídos por igual'} (~{Math.round((typeof state.heightMm === 'number' ? state.heightMm : DEFAULT_HEIGHT) / (state.drillingConfig.holeCount + 1))} mm entre furos).
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Observações da Esquadria */}
                  <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md shadow-xs flex flex-col gap-xs">
                    <div className="flex items-center gap-xs pb-xs border-b border-outline-variant/50">
                      <span className="material-symbols-outlined text-[18px] text-primary">edit_note</span>
                      <h3 className="text-sm font-label font-bold text-on-surface uppercase tracking-wider">
                        Observações da Esquadria
                      </h3>
                      <span className="text-xs font-label text-secondary lowercase ml-auto">(opcional)</span>
                    </div>
                    <div>
                      <input
                        id="modal-notes-input"
                        type="text"
                        value={state.notes ?? ''}
                        onChange={(e) => setState((p) => ({ ...p, notes: e.target.value }))}
                        placeholder="Ex: Vidro temperado jateado, puxador especial, instalação urgente..."
                        aria-label="Observações do Item"
                        className="w-full text-sm py-2 px-2.5 bg-surface border border-outline-variant rounded font-body text-on-surface focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  PASSO 4: RESUMO TÉCNICO & CONFIRMAÇÃO
                 ───────────────────────────────────────────────────────────── */}
              {currentStep === 4 && (
                <div className="flex flex-col gap-md animate-fadeIn">
                  <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md sm:p-lg shadow-xs flex flex-col gap-md">
                    <div className="flex items-center justify-between pb-xs border-b border-outline-variant">
                      <h3 className="text-base font-label font-bold text-on-surface uppercase tracking-wider flex items-center gap-xs">
                        <span className="material-symbols-outlined text-[20px] text-primary">task_alt</span>
                        Ficha Técnica & Resumo
                      </h3>
                      <span className="text-xs font-label text-primary font-bold uppercase tracking-wider">
                        Pronto para salvar
                      </span>
                    </div>

                    {/* Grid de Resumo das Características */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-sm text-sm">
                      <div className="bg-surface-container-low p-sm rounded border border-outline-variant/50">
                        <span className="text-xs text-secondary block font-label">Dimensões do Vão</span>
                        <strong className="text-on-surface font-data-mono">{svgW} × {svgH} mm</strong>
                      </div>
                      <div className="bg-surface-container-low p-sm rounded border border-outline-variant/50">
                        <span className="text-xs text-secondary block font-label">Quantidade</span>
                        <strong className="text-on-surface font-data-mono">{totalQty} {totalQty > 1 ? 'unidades' : 'unidade'}</strong>
                      </div>
                      <div className="bg-surface-container-low p-sm rounded border border-outline-variant/50">
                        <span className="text-xs text-secondary block font-label">Área Total</span>
                        <strong className="text-on-surface font-data-mono">{((+unitAreaM2) * totalQty).toFixed(2)} m²</strong>
                      </div>
                      <div className="bg-surface-container-low p-sm rounded border border-outline-variant/50">
                        <span className="text-xs text-secondary block font-label">Cor do Alumínio</span>
                        <strong className="text-on-surface font-body truncate block">{state.aluminumColor}</strong>
                      </div>
                      <div className="bg-surface-container-low p-sm rounded border border-outline-variant/50">
                        <span className="text-xs text-secondary block font-label">Vidro</span>
                        <strong className="text-on-surface font-body truncate block">{state.glassFinish}</strong>
                      </div>
                      <div className="bg-surface-container-low p-sm rounded border border-outline-variant/50">
                        <span className="text-xs text-secondary block font-label">Puxador / Furação</span>
                        <strong className="text-on-surface font-body truncate block">
                          {state.handleConfig.handleType === 'NONE' ? 'Sem Puxador' : state.handleConfig.handleType} • {state.drillingConfig.holeCount} furos
                        </strong>
                      </div>
                    </div>

                    {/* Resumo dos Insumos Selecionados */}
                    <div className="flex flex-col gap-xs pt-xs border-t border-outline-variant/50">
                      <span className="text-xs font-label font-bold text-on-surface uppercase tracking-wider">
                        Insumos Configurados ({state.materialSelections.filter((s) => s.materialId).length})
                      </span>
                      <div className="max-h-[160px] overflow-y-auto pr-1 flex flex-col gap-1 text-xs font-data-mono">
                        {state.materialSelections.filter((s) => s.materialId).map((s) => (
                          <div key={s.requirementId} className="flex items-center justify-between py-1 border-b border-outline-variant/30">
                            <span className="text-on-surface truncate max-w-[240px] sm:max-w-xs">{s.label}: {s.materialName} ({s.quantity} {s.unitMeasure})</span>
                            <span className="font-bold text-primary shrink-0">{s.totalPrice !== undefined ? formatBRL(s.totalPrice) : '—'}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Observações se houver */}
                    {state.notes && (
                      <div className="bg-surface-container-low p-sm rounded border border-outline-variant/50 text-xs">
                        <span className="text-secondary font-label block font-semibold">Observações:</span>
                        <p className="text-on-surface font-body mt-0.5">{state.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>

          </div>
        </main>

        {/* ── Footer Actions: Navegação do Wizard & Subtotal Único ──────────── */}
        <footer className="sticky bottom-0 z-20 flex items-center justify-between gap-xs sm:gap-sm px-sm sm:px-lg py-2.5 sm:py-md border-t border-outline-variant bg-surface-container-low flex-shrink-0 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-xs min-w-0">
            <span className="text-[11px] sm:text-sm font-label text-on-surface-variant font-medium leading-tight">Subtotal:</span>
            <div className="flex items-baseline gap-1">
              <span className="font-data-mono font-bold text-primary text-lg sm:text-2xl leading-none">
                {formatBRL(itemSubtotalEstimate)}
              </span>
              {totalQty > 1 && (
                <span className="text-[10px] sm:text-xs font-data-mono text-on-surface-variant">
                  ({totalQty}×)
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-sm shrink-0">
            {currentStep > 1 ? (
              <Button variant="outline" icon="arrow_back" onClick={handlePrevStep} className="px-2.5 sm:px-4 py-1.5 text-xs sm:text-sm">
                Voltar
              </Button>
            ) : (
              <Button variant="outline" onClick={onClose} className="px-2.5 sm:px-4 py-1.5 text-xs sm:text-sm">
                Cancelar
              </Button>
            )}

            {currentStep < 4 ? (
              <Button variant="primary" icon="arrow_forward" onClick={handleNextStep} className="px-3 sm:px-4 py-1.5 text-xs sm:text-sm">
                Próximo
              </Button>
            ) : (
              <Button variant="primary" icon="check" onClick={handleSubmit} className="px-3 sm:px-4 py-1.5 text-xs sm:text-sm">
                {editingItem ? 'Salvar' : 'Adicionar'}
              </Button>
            )}
          </div>
        </footer>
      </div>
    </div>,
    document.body,
  );
};
