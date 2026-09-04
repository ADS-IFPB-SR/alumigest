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
  getAvailableSvgTemplatesForCatalogType,
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
  onClose: () => void;
  onAddItem: (item: BudgetItem) => void;
  editingItem?: BudgetItem | null;
}

export const WindowBuilderModal: React.FC<WindowBuilderModalProps> = ({
  isOpen,
  onClose,
  onAddItem,
  editingItem,
}) => {
  // Queries do Catálogo (read-only)
  const { data: productsData, isLoading: isLoadingTemplates } = useProducts();
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
      customDistancesMm: [100, 500, 560, 100],
    },
    aluminumColor: 'Alumínio Fosco / Anodizado',
    glassFinish: 'Fumê / Cinza',
    laborCost: 0,
    notes: '',
    materialSelections: [],
  });

  const [customDistanceInput, setCustomDistanceInput] = useState<string>('100, 500, 560, 100');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const hasInitializedRef = useRef(false);

  const svgTemplate: DoorTemplateType = (state.templateType || state.template?.templateType || 'SLIDING_DOOR_2F') as DoorTemplateType;

  const availableSvgTemplates = useMemo(() => {
    return getAvailableSvgTemplatesForCatalogType(state.template?.catalogTemplateType, state.template?.name);
  }, [state.template?.catalogTemplateType, state.template?.name]);

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

      const dists = editingItem.drillingConfig?.customDistancesMm ?? [100, 500, 560, 100];
      setCustomDistanceInput(dists.join(', '));

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
        const defaultTemplate = templates[0];
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
        setCustomDistanceInput(drillPositions.join(', '));

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

  // ─── Handler: Troca de Template ───────────────────────────────────────────
  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;

    const targetSvg = (template.templateType as DoorTemplateType) || getDefaultSvgTemplateForCatalogType(template.catalogTemplateType, template.name, template.templateConfig);
    const validDirections = TEMPLATE_TYPE_INFO[targetSvg]?.supportedDirections ?? ['LEFT_TO_RIGHT', 'RIGHT_TO_LEFT'];

    // Mapeia acabamentos configurados no produto
    const alumColor = template.templateConfig?.aluminumColor
      ? mapCatalogAluminumColor(template.templateConfig.aluminumColor)
      : state.aluminumColor;
    const glassColor = template.templateConfig?.glassColor
      ? mapCatalogGlassColor(template.templateConfig.glassColor)
      : state.glassFinish;

    // Sentido de abertura
    let rawDir = template.templateConfig?.openingDirection;
    if (rawDir === 'OUTSIDE') rawDir = 'LEFT_TO_RIGHT';
    if (rawDir === 'INSIDE') rawDir = 'RIGHT_TO_LEFT';
    const dir = rawDir && validDirections.includes(rawDir) ? rawDir : (validDirections[0] ?? 'LEFT_TO_RIGHT');

    // Puxador
    const cfgHandle = template.templateConfig?.handleConfig;
    const nextHandleConfig: HandleConfig = cfgHandle ? {
      handleType: cfgHandle.handleType ?? 'BAR_TUBULAR',
      side: cfgHandle.side ?? 'ONE_SIDE',
      coverage: cfgHandle.coverage ?? (cfgHandle.handleLengthMm && cfgHandle.handleLengthMm >= 1000 ? 'FULL' : 'PIECE'),
      pieceLengthCm: cfgHandle.pieceLengthCm ?? (cfgHandle.handleLengthMm ? Math.round(cfgHandle.handleLengthMm / 10) : 40),
    } : state.handleConfig;

    // Furação
    const cfgDrill = template.templateConfig?.drillingConfig;
    const drillPositions = cfgDrill?.customPositionsMm && cfgDrill.customPositionsMm.length > 0
      ? cfgDrill.customPositionsMm
      : (state.drillingConfig.customDistancesMm ?? [100, 500, 560, 100]);
    const nextDrillingConfig: DrillingConfig = cfgDrill ? {
      holeCount: cfgDrill.holeCount ?? 2,
      divisionType: cfgDrill.drillingMode === 'CUSTOM' ? 'CUSTOM_DISTANCE' : 'EQUAL',
      customDistancesMm: drillPositions,
    } : state.drillingConfig;

    if (cfgDrill?.customPositionsMm && cfgDrill.customPositionsMm.length > 0) {
      setCustomDistanceInput(drillPositions.join(', '));
    }

    const currentW = typeof state.widthMm === 'number' && state.widthMm > 0 ? state.widthMm : DEFAULT_WIDTH;
    const currentH = typeof state.heightMm === 'number' && state.heightMm > 0 ? state.heightMm : DEFAULT_HEIGHT;
    const newSelections = buildSelectionsForTemplate(template, currentW, currentH, alumColor, glassColor);

    setState((prev) => ({
      ...prev,
      template,
      templateType: targetSvg,
      aluminumColor: alumColor,
      glassFinish: glassColor,
      openingDirection: dir!,
      handleConfig: nextHandleConfig,
      drillingConfig: nextDrillingConfig,
      laborCost: template.laborCost || prev.laborCost || 200.0,
      materialSelections: newSelections,
    }));
  };

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
    let qty: number | undefined = undefined;
    if (valStr !== undefined) {
      const num = parseFloat(String(valStr).replace(',', '.'));
      qty = !isNaN(num) && num >= 0 ? num : undefined;
    }

    setState((prev) => ({
      ...prev,
      materialSelections: prev.materialSelections.map((s) =>
        s.requirementId === requirementId
          ? {
              ...s,
              quantity: qty,
              totalPrice: qty !== undefined ? parseFloat((qty * s.unitPrice).toFixed(2)) : undefined,
            }
          : s,
      ),
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
  const handleHoleCountChange = (count: number) => {
    setState((prev) => ({
      ...prev,
      drillingConfig: { ...prev.drillingConfig, holeCount: count },
    }));
  };

  const handleDivisionTypeChange = (type: DivisionType) => {
    setState((prev) => ({
      ...prev,
      drillingConfig: { ...prev.drillingConfig, divisionType: type },
    }));
  };

  const handleCustomDistancesInput = (val: string) => {
    setCustomDistanceInput(val);
    const parsed = val
      .split(/[,;\s]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n) && n > 0);

    setState((prev) => ({
      ...prev,
      drillingConfig: {
        ...prev.drillingConfig,
        customDistancesMm: parsed.length > 0 ? parsed : undefined,
      },
    }));
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

  // Subtotal apenas de materiais
  const materialsTotal = useMemo(() => {
    return state.materialSelections.reduce((sum, s) => {
      const q = typeof s.quantity === 'number' && s.quantity > 0 ? s.quantity : 0;
      return sum + q * s.unitPrice;
    }, 0);
  }, [state.materialSelections]);

  // ─── Validação e Submissão ────────────────────────────────────────────────
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
      return;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Verifique as medidas informadas.');
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
        className="relative bg-surface border border-outline-variant rounded-xl w-full max-h-[92vh] shadow-2xl flex flex-col overflow-hidden z-10"
        style={{ maxWidth: '1240px' }}
        aria-modal="true"
      >
        {/* ── Header do Modal ────────────────────────────────────────────── */}
        <header className="flex items-center justify-between px-md sm:px-lg py-sm border-b border-outline-variant bg-surface-container-low flex-shrink-0">
          <div className="flex items-center gap-sm flex-1 min-w-0">
            <span className="material-symbols-outlined text-[24px] text-primary shrink-0">tune</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-xs flex-wrap">
                <select
                  value={state.template?.id ?? ''}
                  onChange={(e) => handleTemplateSelect(e.target.value)}
                  disabled={isLoadingTemplates}
                  aria-label="Selecionar Template de Esquadria"
                  className="font-headline text-title-md sm:text-headline-sm font-bold text-on-surface bg-transparent border-0 cursor-pointer hover:text-primary focus:outline-none pr-md truncate max-w-full"
                >
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <p className="font-body text-xs text-on-surface-variant truncate">
                Configure os insumos de cada categoria, medidas e parâmetros técnicos da esquadria.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-sm shrink-0 ml-sm">
            <div className="hidden sm:flex items-center gap-xs bg-primary/10 border border-primary/30 px-sm py-[4px] rounded-lg">
              <span className="text-xs font-label text-primary font-medium">Subtotal:</span>
              <span className="text-sm font-data-mono font-bold text-primary">
                {formatBRL(itemSubtotalEstimate)}
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-xs text-on-surface-variant hover:bg-surface-container-highest rounded-full transition-colors"
              aria-label="Fechar"
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>
          </div>
        </header>

        {/* ── Corpo do Modal: Layout em 2 Colunas Perfeitamente Balanceadas ── */}
        <main className="flex-1 overflow-y-auto p-md sm:p-lg min-h-0 bg-surface">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg items-start">

            {/* ════════════════════════════════════════════════════════════════
                COLUNA DA ESQUERDA (5 cols): GABARITO VISUAL & CONTROLES FÍSICOS
               ════════════════════════════════════════════════════════════════ */}
            <div className="lg:col-span-5 flex flex-col gap-md">

              {/* 1. Gabarito Visual CAD */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-sm shadow-xs flex flex-col gap-xs">
                <div className="flex items-center justify-between pb-xs border-b border-outline-variant/50">
                  <h3 className="text-xs font-label font-bold text-on-surface flex items-center gap-xs uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[16px] text-primary">architecture</span>
                    Gabarito Visual
                  </h3>
                  <span className="text-[11px] font-data-mono text-secondary">
                    {svgW}×{svgH} mm
                  </span>
                </div>

                {/* Seletor de Modelo Visual SVG (se o template permitir múltiplas variantes visuais) */}
                {availableSvgTemplates.length > 1 && (
                  <div className="flex items-center justify-between gap-xs px-xs py-1 bg-surface-container-low rounded border border-outline-variant/60">
                    <label htmlFor="svg-subtype-select" className="text-[11px] font-label text-on-surface-variant whitespace-nowrap">
                      Variante Visual:
                    </label>
                    <select
                      id="svg-subtype-select"
                      value={svgTemplate}
                      onChange={(e) => {
                        const nextSvg = e.target.value as DoorTemplateType;
                        const validDirs = TEMPLATE_TYPE_INFO[nextSvg]?.supportedDirections ?? ['LEFT_TO_RIGHT'];
                        const nextDir = validDirs.includes(state.openingDirection)
                          ? state.openingDirection
                          : validDirs[0];
                        setState((p) => ({
                          ...p,
                          templateType: nextSvg,
                          openingDirection: nextDir,
                        }));
                      }}
                      className="text-xs p-1 bg-surface border border-outline-variant rounded font-body text-on-surface focus:border-primary focus:outline-none flex-1 max-w-[210px] truncate"
                    >
                      {availableSvgTemplates.map((type) => (
                        <option key={type} value={type}>
                          {TEMPLATE_TYPE_INFO[type]?.label ?? type}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex flex-col items-center justify-center min-h-[240px] max-h-[260px] py-xs overflow-hidden">
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
                  />
                </div>
              </div>

              {/* 2. Sentido de Abertura */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-sm shadow-xs flex flex-col gap-xs">
                <p className="text-xs font-label font-semibold text-on-surface flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[16px] text-primary">swap_horiz</span>
                  Sentido de Abertura da Folha
                </p>
                <div className={`grid ${supportedDirections.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-xs mt-xs`}>
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
                        className={`py-xs px-sm rounded border text-xs font-label font-semibold flex items-center justify-center gap-xs transition-all ${
                          isSelected
                            ? 'bg-primary text-on-primary border-primary shadow-xs'
                            : 'bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-container'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">{icon}</span>
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Configuração de Puxador */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-sm shadow-xs flex flex-col gap-sm">
                <p className="text-xs font-label font-semibold text-on-surface flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[16px] text-primary">hardware</span>
                  Configuração de Puxador
                </p>
                <div className="grid grid-cols-2 gap-sm">
                  <div>
                    <label htmlFor="handle-type-select" className="text-[11px] font-label text-on-surface-variant block mb-xs">
                      Tipo de Puxador
                    </label>
                    <select
                      id="handle-type-select"
                      value={state.handleConfig.handleType}
                      onChange={(e) => handleHandleTypeChange(e.target.value as HandleType)}
                      aria-label="Tipo de Puxador"
                      className="w-full text-xs p-xs bg-surface border border-outline-variant rounded font-body text-on-surface focus:border-primary focus:outline-none"
                    >
                      <option value="BAR_TUBULAR">Tubular Inox</option>
                      <option value="SHELL_LOCK">Fecho Concha</option>
                      <option value="LEVER_HANDLE">Maçaneta</option>
                      <option value="NONE">Sem Puxador</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="handle-side-select" className="text-[11px] font-label text-on-surface-variant block mb-xs">
                      Lados do Puxador
                    </label>
                    <select
                      id="handle-side-select"
                      value={state.handleConfig.side ?? 'ONE_SIDE'}
                      onChange={(e) => handleHandleSideChange(e.target.value as HandleSide)}
                      disabled={state.handleConfig.handleType === 'NONE'}
                      aria-label="Lados do Puxador"
                      className="w-full text-xs p-xs bg-surface border border-outline-variant rounded font-body text-on-surface focus:border-primary focus:outline-none disabled:opacity-50"
                    >
                      <option value="ONE_SIDE">1 Lado (Face Única)</option>
                      <option value="BOTH_SIDES">2 Lados (Frente e Verso)</option>
                    </select>
                  </div>
                </div>

                {state.handleConfig.handleType === 'BAR_TUBULAR' && (
                  <div className="grid grid-cols-2 gap-sm pt-xs border-t border-outline-variant/50">
                    <div>
                      <label htmlFor="handle-coverage-select" className="text-[11px] font-label text-on-surface-variant block mb-xs">
                        Extensão do Puxador
                      </label>
                      <select
                        id="handle-coverage-select"
                        value={state.handleConfig.coverage ?? 'FULL'}
                        onChange={(e) => handleHandleCoverageChange(e.target.value as HandleCoverage)}
                        aria-label="Extensão do Puxador"
                        className="w-full text-xs p-xs bg-surface border border-outline-variant rounded font-body text-on-surface focus:border-primary focus:outline-none"
                      >
                        <option value="FULL">Extensão Total da Folha</option>
                        <option value="PIECE">Pedaço / Tamanho Fixo</option>
                      </select>
                    </div>

                    {state.handleConfig.coverage === 'PIECE' && (
                      <div>
                        <label htmlFor="handle-length-input" className="text-[11px] font-label text-on-surface-variant block mb-xs">
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
                          className="w-full text-xs p-xs bg-surface border border-outline-variant rounded font-data-mono text-on-surface focus:border-primary focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 4. Furação */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-sm shadow-xs flex flex-col gap-sm">
                <p className="text-xs font-label font-semibold text-on-surface flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[16px] text-primary">adjust</span>
                  Parâmetros de Furação
                </p>
                <div className="grid grid-cols-2 gap-sm">
                  <div>
                    <label htmlFor="hole-count-select" className="text-[11px] font-label text-on-surface-variant block mb-xs">
                      Qtd de Furos
                    </label>
                    <select
                      id="hole-count-select"
                      value={state.drillingConfig.holeCount}
                      onChange={(e) => handleHoleCountChange(parseInt(e.target.value, 10))}
                      aria-label="Quantidade de Furos"
                      className="w-full text-xs p-xs bg-surface border border-outline-variant rounded font-body text-on-surface focus:border-primary focus:outline-none"
                    >
                      <option value={0}>Sem Furação</option>
                      <option value={1}>1 Furo</option>
                      <option value={2}>2 Furos (Padrão)</option>
                      <option value={3}>3 Furos</option>
                      <option value={4}>4 Furos</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="hole-division-select" className="text-[11px] font-label text-on-surface-variant block mb-xs">
                      Distribuição dos Furos
                    </label>
                    <select
                      id="hole-division-select"
                      value={state.drillingConfig.divisionType}
                      onChange={(e) => handleDivisionTypeChange(e.target.value as DivisionType)}
                      disabled={state.drillingConfig.holeCount === 0}
                      aria-label="Divisão dos Furos"
                      className="w-full text-xs p-xs bg-surface border border-outline-variant rounded font-body text-on-surface focus:border-primary focus:outline-none disabled:opacity-50"
                    >
                      <option value="EQUAL">Por igual (Automático)</option>
                      <option value="CUSTOM_DISTANCE">Com medida (Distâncias)</option>
                    </select>
                  </div>
                </div>

                {state.drillingConfig.holeCount > 0 && (
                  <div className="pt-xs border-t border-outline-variant/50">
                    <label htmlFor="drilling-distances-input" className="text-[11px] font-label text-on-surface-variant block mb-xs">
                      Distâncias entre furos e bordas (mm)
                    </label>
                    <input
                      id="drilling-distances-input"
                      type="text"
                      value={customDistanceInput}
                      onChange={(e) => handleCustomDistancesInput(e.target.value)}
                      placeholder="Ex: 100, 500, 560, 100"
                      aria-label="Distâncias entre furos e bordas em milímetros"
                      className="w-full text-xs p-xs bg-surface border border-outline-variant rounded font-data-mono text-on-surface focus:border-primary focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* 5. Acabamentos */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-sm shadow-xs flex flex-col gap-sm">
                <p className="text-xs font-label font-semibold text-on-surface flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[16px] text-primary">palette</span>
                  Acabamentos do Template
                </p>
                <div className="grid grid-cols-2 gap-sm">
                  <div>
                    <label htmlFor="aluminum-color-select" className="text-[11px] font-label text-on-surface-variant block mb-xs">
                      Cor do Alumínio
                    </label>
                    <select
                      id="aluminum-color-select"
                      value={state.aluminumColor}
                      onChange={(e) => setState((p) => ({ ...p, aluminumColor: e.target.value }))}
                      aria-label="Cor do Alumínio"
                      className="w-full text-xs p-xs bg-surface border border-outline-variant rounded font-body text-on-surface focus:border-primary focus:outline-none"
                    >
                      {dynamicAluminumColors.map((col) => (
                        <option key={col} value={col}>
                          {col}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="glass-finish-select" className="text-[11px] font-label text-on-surface-variant block mb-xs">
                      Acabamento do Vidro
                    </label>
                    <select
                      id="glass-finish-select"
                      value={state.glassFinish}
                      onChange={(e) => setState((p) => ({ ...p, glassFinish: e.target.value }))}
                      aria-label="Acabamento do Vidro"
                      className="w-full text-xs p-xs bg-surface border border-outline-variant rounded font-body text-on-surface focus:border-primary focus:outline-none"
                    >
                      {dynamicGlassFinishes.map((fin) => (
                        <option key={fin} value={fin}>
                          {fin}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

            </div>

            {/* ════════════════════════════════════════════════════════════════
                COLUNA DA DIREITA (7 cols): MEDIDAS, INSUMOS & VALORES
               ════════════════════════════════════════════════════════════════ */}
            <div className="lg:col-span-7 flex flex-col gap-md">

              {/* 1. Medidas e Quantidade de Esquadrias */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md shadow-xs flex flex-col gap-sm">
                <div className="flex items-center justify-between pb-xs border-b border-outline-variant">
                  <h3 className="text-xs font-label font-bold text-on-surface uppercase tracking-wider flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[16px] text-primary">aspect_ratio</span>
                    1. Medidas e Quantidade
                  </h3>
                  <span className="text-xs font-data-mono font-medium text-secondary">
                    Total: {totalQty} un
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-sm mt-xs">
                  <div>
                    <label htmlFor="modal-width-input" className="text-xs font-label text-on-surface-variant block mb-xs">
                      Largura (mm) *
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
                      className={`w-full p-xs bg-surface border rounded text-sm font-data-mono text-on-surface focus:border-primary focus:outline-none ${
                        errors.widthMm ? 'border-error' : 'border-outline-variant'
                      }`}
                    />
                  </div>

                  <div>
                    <label htmlFor="modal-height-input" className="text-xs font-label text-on-surface-variant block mb-xs">
                      Altura (mm) *
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
                      className={`w-full p-xs bg-surface border rounded text-sm font-data-mono text-on-surface focus:border-primary focus:outline-none ${
                        errors.heightMm ? 'border-error' : 'border-outline-variant'
                      }`}
                    />
                  </div>

                  <div>
                    <label htmlFor="modal-quantity-input" className="text-xs font-label text-on-surface-variant block mb-xs">
                      Qtd de Esquadrias *
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
                      className={`w-full p-xs bg-surface border rounded text-sm font-data-mono text-on-surface focus:border-primary focus:outline-none ${
                        errors.quantity ? 'border-error' : 'border-outline-variant'
                      }`}
                    />
                  </div>
                </div>

                {/* Badge da Área do Vão */}
                <div className="flex items-center gap-xs text-xs font-data-mono text-on-surface-variant bg-surface-container-low px-sm py-xs rounded border border-outline-variant/60">
                  <span className="material-symbols-outlined text-[16px] text-secondary">straighten</span>
                  <span>
                    Área do Vão: <strong className="text-on-surface font-bold">{unitAreaM2} m²</strong> por unidade
                    {totalQty > 1 && (
                      <span className="text-primary ml-xs">
                        · Total ({totalQty}×): {((+unitAreaM2) * totalQty).toFixed(2)} m²
                      </span>
                    )}
                  </span>
                </div>
              </div>

              {/* 2. Seleção de Insumos do Template */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md shadow-xs flex flex-col gap-sm">
                <div className="flex items-center justify-between pb-xs border-b border-outline-variant flex-wrap gap-xs">
                  <div className="flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[16px] text-primary">inventory_2</span>
                    <h3 className="text-xs font-label font-bold text-on-surface uppercase tracking-wider">
                      2. Composição de Insumos
                    </h3>
                  </div>

                  {/* Ações rápidas para adicionar insumos extras */}
                  <div className="flex items-center gap-xs">
                    <button
                      type="button"
                      onClick={() => handleAddMaterial('GLASS')}
                      className="px-xs py-[2px] rounded text-[11px] font-label text-primary hover:bg-primary/10 transition-colors border border-primary/30"
                      title="Adicionar Vidro"
                    >
                      + Vidro
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddMaterial('PROFILE')}
                      className="px-xs py-[2px] rounded text-[11px] font-label text-primary hover:bg-primary/10 transition-colors border border-primary/30"
                      title="Adicionar Perfil"
                    >
                      + Perfil
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddMaterial('HARDWARE')}
                      className="px-xs py-[2px] rounded text-[11px] font-label text-primary hover:bg-primary/10 transition-colors border border-primary/30"
                      title="Adicionar Ferragem"
                    >
                      + Ferragem
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddMaterial('ROLLERS')}
                      className="px-xs py-[2px] rounded text-[11px] font-label text-primary hover:bg-primary/10 transition-colors border border-primary/30"
                      title="Adicionar Roldana"
                    >
                      + Roldana
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddMaterial('FILM')}
                      className="px-xs py-[2px] rounded text-[11px] font-label text-primary hover:bg-primary/10 transition-colors border border-primary/30"
                      title="Adicionar Película"
                    >
                      + Película
                    </button>
                  </div>
                </div>

                {/* Lista de Insumos */}
                {state.materialSelections.length === 0 ? (
                  <div className="text-center py-md text-xs text-on-surface-variant font-body bg-surface-container-low rounded border border-outline-variant/60">
                    <p>Nenhum insumo configurado para este produto.</p>
                    <p className="mt-xs text-secondary">Utilize os botões acima para adicionar insumos ao item.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-xs">
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
                          className="bg-surface-container-low border border-outline-variant/60 rounded-md p-xs sm:p-sm flex flex-col gap-xs hover:border-primary/40 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-xs min-w-0">
                              <span className="material-symbols-outlined text-[16px] text-primary">{iconName}</span>
                              <span className="text-xs font-label font-semibold text-on-surface truncate">
                                {sel.label} {sel.isOptional && <span className="text-on-surface-variant font-normal text-[11px]">(Opcional)</span>}
                              </span>
                            </div>
                            <div className="flex items-center gap-xs shrink-0">
                              <span className="font-data-mono font-bold text-primary text-xs">
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
                                  className="p-[2px] text-on-surface-variant hover:text-error hover:bg-error/10 rounded transition-colors"
                                  title="Remover este insumo"
                                >
                                  <span className="material-symbols-outlined text-[14px]">close</span>
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-xs mt-xs">
                            {/* Seletor de Material */}
                            <select
                              value={sel.materialId ?? ''}
                              onChange={(e) => handleMaterialChange(reqId, e.target.value)}
                              aria-label={`Selecionar material para ${sel.label}`}
                              className="flex-1 text-xs p-xs bg-surface border border-outline-variant rounded font-body text-on-surface focus:border-primary focus:outline-none min-w-0"
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

                            {/* Input de Quantidade */}
                            <div className="flex items-center gap-[2px] shrink-0">
                              <input
                                type="number"
                                step="0.01"
                                min={0}
                                value={sel.quantity ?? ''}
                                onChange={(e) => handleMaterialQtyChange(reqId, e.target.value)}
                                disabled={!sel.materialId}
                                placeholder="Qtd"
                                aria-label={`Quantidade de ${sel.label}`}
                                className="w-16 p-xs bg-surface border border-outline-variant rounded text-xs font-data-mono text-on-surface text-center focus:border-primary focus:outline-none disabled:opacity-40"
                              />
                              <span className="text-[11px] font-data-mono text-on-surface-variant bg-surface-container px-xs py-[4px] rounded border border-outline-variant min-w-[32px] text-center">
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

              {/* 3. Observações da Esquadria */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md shadow-xs flex flex-col gap-sm">
                <div className="flex items-center gap-xs pb-xs border-b border-outline-variant">
                  <span className="material-symbols-outlined text-[16px] text-primary">edit_note</span>
                  <h3 className="text-xs font-label font-bold text-on-surface uppercase tracking-wider">
                    3. Observações da Esquadria
                  </h3>
                </div>

                <div>
                  <label htmlFor="modal-notes-input" className="text-xs font-label text-on-surface-variant block mb-xs">
                    Observações do Item <span className="text-[11px] font-normal text-secondary lowercase">(opcional)</span>
                  </label>
                  <input
                    id="modal-notes-input"
                    type="text"
                    value={state.notes ?? ''}
                    onChange={(e) => setState((p) => ({ ...p, notes: e.target.value }))}
                    placeholder="Ex: Vidro temperado jateado, puxador especial..."
                    aria-label="Observações do Item"
                    className="w-full p-xs bg-surface border border-outline-variant rounded text-sm font-body text-on-surface focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* 4. Card de Resumo da Esquadria */}
              <div className="bg-surface-container-low border border-outline-variant rounded-lg p-md shadow-xs flex flex-col gap-xs">
                <div className="flex justify-between items-center text-xs text-on-surface-variant font-body">
                  <span>Custo Unitário dos Insumos:</span>
                  <span className="font-data-mono font-semibold text-on-surface">
                    {formatBRL(materialsTotal)}
                  </span>
                </div>
                {totalQty > 1 && (
                  <div className="flex justify-between items-center text-xs text-on-surface-variant font-body">
                    <span>Quantidade ({totalQty}× unidades):</span>
                    <span className="font-data-mono font-semibold text-on-surface">
                      × {totalQty}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-xs border-t border-outline-variant/60 text-sm mt-xs">
                  <span className="font-label font-bold text-on-surface">Subtotal da Esquadria:</span>
                  <span className="font-data-mono font-bold text-primary text-base">
                    {formatBRL(itemSubtotalEstimate)}
                  </span>
                </div>
              </div>

            </div>

          </div>
        </main>

        {/* ── Footer Actions: Subtotal fixado na base ────────────────────── */}
        <footer className="sticky bottom-0 z-20 flex items-center justify-between gap-sm px-md sm:px-lg py-sm border-t border-outline-variant bg-surface-container-low flex-shrink-0 shadow-md">
          <div className="flex items-center gap-xs">
            <span className="text-xs font-label text-on-surface-variant">Subtotal Estimado:</span>
            <span className="font-data-mono font-bold text-primary text-lg sm:text-xl">
              {formatBRL(itemSubtotalEstimate)}
            </span>
          </div>

          <div className="flex items-center gap-sm">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="primary" icon="check" onClick={handleSubmit}>
              {editingItem ? 'Salvar Alterações' : 'Adicionar ao Orçamento'}
            </Button>
          </div>
        </footer>
      </div>
    </div>,
    document.body,
  );
};
