import React, { useEffect, useCallback, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import type {
  BuilderState,
  BudgetItem,
  HandleType,
  HandleSide,
  HandleCoverage,
  DivisionType,
  MaterialSelection,
  CategoryType,
} from '../../types';
import { useWindowTemplates } from '../../hooks/useBudgets';
import {
  useGlasses,
  useProfiles,
  useHardwares,
  useFilms,
} from '../../../catalog/hooks/useCatalog';
import { calcItemSubtotal, formatBRL } from '../../utils/calculations';
import { WindowSvgPreview } from './WindowSvgPreview';
import { Button } from '../../../../components/ui/Button';
import toast from 'react-hot-toast';

// ─── Constantes e Opções Visuais ──────────────────────────────────────────────
const BASE_ALUMINUM_COLORS = [
  'Alumínio Fosco / Anodizado',
  'Preto Fosco',
  'Branco Brilhante',
  'Bronze / Champanhe',
  'Cromado / Polido',
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
  // Queries do Catálogo
  const { data: templates = [], isLoading: isLoadingTemplates } = useWindowTemplates();
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
    laborCost: 200.0,
    notes: '',
    materialSelections: [],
  });

  const [customDistanceInput, setCustomDistanceInput] = useState<string>('100, 500, 560, 100');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ─── Utilitário: busca material pelo ID no catálogo ────────────────────────
  const findCatalogMaterial = useCallback(
    (materialId: string) => {
      if (!materialId) return null;
      const g = glasses.find((item) => item.id === materialId);
      if (g) return { name: g.name, unit: 'm²', price: g.salePrice ?? g.pricePerSqm ?? 0, colorFinish: g.colorFinish };
      const p = profiles.find((item) => item.id === materialId);
      if (p) return { name: p.name, unit: p.unitMeasure ?? 'm', price: p.salePrice ?? 0, colorFinish: p.colorFinish };
      const h = hardwares.find((item) => item.id === materialId);
      if (h) return { name: h.name, unit: h.unitMeasure ?? 'un', price: h.salePrice ?? 0, colorFinish: undefined };
      const f = films.find((item) => item.id === materialId);
      if (f) return { name: f.name, unit: 'm²', price: f.salePrice ?? 0, colorFinish: f.colorFinish };
      return null;
    },
    [glasses, profiles, hardwares, films],
  );

  // ─── Inicialização de Estado ───────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    if (editingItem) {
      const template = templates.find((t) => t.id === editingItem.productId) ?? templates[0] ?? null;
      const reqs = template?.categoryRequirements ?? [];

      const selections: MaterialSelection[] = (reqs.length > 0 ? reqs : []).map((req) => {
        const existingOpt = editingItem.options.find((o) => o.categoryType === req.categoryType);
        const mat = existingOpt ? findCatalogMaterial(existingOpt.materialId) : null;
        const qty = existingOpt?.quantity;
        const price = existingOpt?.unitPrice ?? mat?.price ?? 0;
        return {
          requirementId: req.id,
          categoryType: req.categoryType,
          label: req.label,
          isOptional: req.isOptional,
          materialId: existingOpt?.materialId ?? '',
          materialName: existingOpt?.materialName ?? mat?.name ?? '',
          unitMeasure: existingOpt?.unitMeasure ?? mat?.unit ?? 'un',
          unitPrice: price,
          quantity: qty,
          totalPrice: qty !== undefined ? parseFloat((qty * price).toFixed(2)) : undefined,
        };
      });

      const dists = editingItem.drillingConfig.customDistancesMm ?? [100, 500, 560, 100];
      setCustomDistanceInput(dists.join(', '));

      setState({
        template,
        widthMm: editingItem.widthMm,
        heightMm: editingItem.heightMm,
        quantity: editingItem.quantity,
        openingDirection: editingItem.templateConfig.openingDirection ?? 'LEFT_TO_RIGHT',
        handleConfig: editingItem.handleConfig ?? {
          handleType: 'BAR_TUBULAR',
          side: 'ONE_SIDE',
          coverage: 'FULL',
        },
        drillingConfig: editingItem.drillingConfig ?? {
          holeCount: 2,
          divisionType: 'EQUAL',
        },
        aluminumColor: editingItem.templateConfig.aluminumColor ?? 'Alumínio Fosco / Anodizado',
        glassFinish: editingItem.templateConfig.glassFinish ?? 'Fumê / Cinza',
        laborCost: editingItem.laborCost ?? template?.laborCost ?? 200.0,
        notes: editingItem.notes ?? '',
        materialSelections: selections,
      });
    } else {
      // Novo item: seleciona o primeiro template disponível e pré-popula seleções padrão
      const defaultTemplate = templates[0] ?? null;
      const w = DEFAULT_WIDTH;
      const h = DEFAULT_HEIGHT;
      const qty = 1;

      let detectedAlumColor = 'Alumínio Fosco / Anodizado';
      let detectedGlassFinish = 'Fumê / Cinza';

      const initialSelections: MaterialSelection[] = (defaultTemplate?.categoryRequirements ?? []).map((req) => {
        let defaultMatId = '';
        let defaultMatName = '';
        let unit = 'un';
        let price = 0;

        if (req.categoryType === 'GLASS' && glasses.length > 0) {
          defaultMatId = glasses[0].id;
          defaultMatName = glasses[0].name;
          unit = 'm²';
          price = glasses[0].salePrice ?? glasses[0].pricePerSqm ?? 0;
          if (glasses[0].colorFinish) detectedGlassFinish = glasses[0].colorFinish;
        } else if (req.categoryType === 'PROFILE' && profiles.length > 0) {
          defaultMatId = profiles[0].id;
          defaultMatName = profiles[0].name;
          unit = profiles[0].unitMeasure ?? 'm';
          price = profiles[0].salePrice ?? 0;
          if (profiles[0].colorFinish) detectedAlumColor = profiles[0].colorFinish;
        } else if (req.categoryType === 'HARDWARE' && hardwares.length > 0) {
          defaultMatId = hardwares[0].id;
          defaultMatName = hardwares[0].name;
          unit = hardwares[0].unitMeasure ?? 'un';
          price = hardwares[0].salePrice ?? 0;
        } else if (req.categoryType === 'FILM' && films.length > 0) {
          if (!req.isOptional) {
            defaultMatId = films[0].id;
            defaultMatName = films[0].name;
            unit = 'm²';
            price = films[0].salePrice ?? 0;
          }
        }

        return {
          requirementId: req.id,
          categoryType: req.categoryType,
          label: req.label,
          isOptional: req.isOptional,
          materialId: defaultMatId,
          materialName: defaultMatName,
          unitMeasure: unit,
          unitPrice: price,
        };
      });

      setState({
        template: defaultTemplate,
        widthMm: w,
        heightMm: h,
        quantity: qty,
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
        aluminumColor: detectedAlumColor,
        glassFinish: detectedGlassFinish,
        laborCost: defaultTemplate?.laborCost ?? 200.0,
        notes: '',
        materialSelections: initialSelections,
      });
      setCustomDistanceInput('100, 500, 560, 100');
    }

    setErrors({});
  }, [isOpen, editingItem, templates, glasses, profiles, hardwares, films, findCatalogMaterial]);

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

    const newSelections: MaterialSelection[] = (template.categoryRequirements ?? []).map((req) => {
      const existing = state.materialSelections.find((s) => s.categoryType === req.categoryType);
      let matId = existing?.materialId ?? '';
      let matName = existing?.materialName ?? '';
      let unit = existing?.unitMeasure ?? 'un';
      let price = existing?.unitPrice ?? 0;

      if (!matId) {
        if (req.categoryType === 'GLASS' && glasses.length > 0) {
          matId = glasses[0].id;
          matName = glasses[0].name;
          unit = 'm²';
          price = glasses[0].salePrice ?? glasses[0].pricePerSqm ?? 0;
        } else if (req.categoryType === 'PROFILE' && profiles.length > 0) {
          matId = profiles[0].id;
          matName = profiles[0].name;
          unit = profiles[0].unitMeasure ?? 'm';
          price = profiles[0].salePrice ?? 0;
        } else if (req.categoryType === 'HARDWARE' && hardwares.length > 0) {
          matId = hardwares[0].id;
          matName = hardwares[0].name;
          unit = hardwares[0].unitMeasure ?? 'un';
          price = hardwares[0].salePrice ?? 0;
        }
      }

      return {
        requirementId: req.id,
        categoryType: req.categoryType,
        label: req.label,
        isOptional: req.isOptional,
        materialId: matId,
        materialName: matName,
        unitMeasure: unit,
        unitPrice: price,
        quantity: existing?.quantity,
        totalPrice: existing?.totalPrice,
      };
    });

    setState((prev) => ({
      ...prev,
      template,
      laborCost: template.laborCost ?? prev.laborCost,
      materialSelections: newSelections,
    }));
  };

  // ─── Handler: Alterar Seleção de Material por Categoria ───────────────────
  // Inclui sincronização automática de Acabamento e Puxador baseado no material
  const handleMaterialChange = (requirementId: string, materialId: string) => {
    const req = (state.template?.categoryRequirements ?? []).find((r) => r.id === requirementId);
    if (!req) return;

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

      // 4. Sincroniza acabamento de alumínio se for perfil
      if (req.categoryType === 'PROFILE' && mat) {
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

      // 4. Sincroniza acabamento de vidro se for vidro
      if (req.categoryType === 'GLASS' && mat) {
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

      // 5. Interação entre tipo de puxador e ferragem selecionada
      if (req.categoryType === 'HARDWARE' && mat) {
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
                totalPrice: s.quantity !== undefined ? parseFloat((s.quantity * unitPrice).toFixed(2)) : undefined,
              }
            : s,
        ),
      };
    });
  };

  // ─── Handler: Alterar Quantidade Manual de Material ──────────────────────
  // 6. Permite adicionar/ajustar a quantidade de cada material individualmente
  const handleMaterialQtyChange = (requirementId: string, valStr: string) => {
    const num = parseFloat(valStr.replace(',', '.'));
    const qty = !isNaN(num) && num >= 0 ? num : undefined;

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

  // ─── Handler: Puxador ─────────────────────────────────────────────────────
  // 5. Troca de puxador interage pré-selecionando ferragem correspondente
  const handleHandleTypeChange = (type: HandleType) => {
    setState((prev) => {
      // Tenta sugerir ferragem no catálogo correspondente ao tipo de puxador
      let updatedSelections = prev.materialSelections;
      if (type !== 'NONE' && hardwares.length > 0) {
        const hwReq = prev.template?.categoryRequirements?.find((r) => r.categoryType === 'HARDWARE');
        if (hwReq) {
          let matchedHw = hardwares[0];
          if (type === 'BAR_TUBULAR') {
            matchedHw = hardwares.find((h) => h.name.toLowerCase().includes('tubular') || h.name.toLowerCase().includes('barra')) ?? hardwares[0];
          } else if (type === 'SHELL_LOCK') {
            matchedHw = hardwares.find((h) => h.name.toLowerCase().includes('concha') || h.name.toLowerCase().includes('fecho')) ?? hardwares[0];
          } else if (type === 'LEVER_HANDLE') {
            matchedHw = hardwares.find((h) => h.name.toLowerCase().includes('maçaneta') || h.name.toLowerCase().includes('macaneta')) ?? hardwares[0];
          }

          if (matchedHw) {
            updatedSelections = prev.materialSelections.map((s) =>
              s.requirementId === hwReq.id
                ? {
                    ...s,
                    materialId: matchedHw.id,
                    materialName: matchedHw.name,
                    unitMeasure: matchedHw.unitMeasure ?? 'un',
                    unitPrice: matchedHw.salePrice ?? 0,
                    totalPrice: s.quantity !== undefined ? parseFloat((s.quantity * (matchedHw.salePrice ?? 0)).toFixed(2)) : undefined,
                  }
                : s,
            );
          }
        }
      }

      return {
        ...prev,
        materialSelections: updatedSelections,
        handleConfig: {
          ...prev.handleConfig,
          handleType: type,
          side: prev.handleConfig.side ?? 'ONE_SIDE',
          coverage: type === 'BAR_TUBULAR' ? prev.handleConfig.coverage ?? 'FULL' : undefined,
        },
      };
    });
  };

  // 3. Opção de colocar ambos os lados
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

  // ─── Handler: Furação ─────────────────────────────────────────────────────
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
  // Baseado na quantidade de cada material + mão de obra × quantidade de esquadrias
  const itemSubtotalEstimate = useMemo(() => {
    const w = typeof state.widthMm === 'number' ? state.widthMm : 0;
    const h = typeof state.heightMm === 'number' ? state.heightMm : 0;
    const qty = typeof state.quantity === 'number' && state.quantity >= 1 ? state.quantity : 1;
    if (!w || !h) return 0;
    const labor = state.laborCost ?? state.template?.laborCost ?? 0;
    return calcItemSubtotal(
      state.materialSelections.map((s) => ({ quantity: s.quantity, unitPrice: s.unitPrice })),
      labor,
      qty,
    );
  }, [state.materialSelections, state.laborCost, state.template, state.quantity, state.widthMm, state.heightMm]);

  // ─── Validação e Submissão ────────────────────────────────────────────────
  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};

    if (!state.template) {
      toast.error('Selecione um template de esquadria.');
      return;
    }

    if (!state.template.templateType) {
      toast.error(
        `O produto "${state.template.name}" não possui um tipo de esquadria configurado no backend. Contate o administrador.`,
      );
      return;
    }

    const w = typeof state.widthMm === 'number' ? state.widthMm : 0;
    const h = typeof state.heightMm === 'number' ? state.heightMm : 0;
    const qty = typeof state.quantity === 'number' ? state.quantity : 0;

    if (!w || w <= 0) newErrors.widthMm = 'Largura obrigatória';
    if (!h || h <= 0) newErrors.heightMm = 'Altura obrigatória';
    if (!qty || qty < 1) newErrors.quantity = 'Quantidade inválida';

    // Validação de materiais obrigatórios
    const missingReqs = (state.template.categoryRequirements ?? []).filter(
      (req) => !req.isOptional && !state.materialSelections.find((s) => s.requirementId === req.id && s.materialId),
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

    const item: BudgetItem = {
      tempId: editingItem?.tempId ?? `item-${Date.now()}`,
      productId: state.template.id,
      productName: state.template.name,
      templateType: state.template.templateType,
      templateConfig: {
        templateType: state.template.templateType,
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
      laborCost: state.laborCost ?? state.template.laborCost ?? 200.0,
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

  const svgTemplate = state.template?.templateType ?? 'SLIDING_DOOR_2F';
  const svgW = typeof state.widthMm === 'number' && state.widthMm > 0 ? state.widthMm : DEFAULT_WIDTH;
  const svgH = typeof state.heightMm === 'number' && state.heightMm > 0 ? state.heightMm : DEFAULT_HEIGHT;
  const unitAreaM2 = ((svgW / 1000) * (svgH / 1000)).toFixed(2);
  const totalQty = typeof state.quantity === 'number' && state.quantity >= 1 ? state.quantity : 1;

  // ─── Render do Modal Unificado ─────────────────────────────────────────────
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-xs sm:p-md bg-black/75 backdrop-blur-sm animate-fadeIn">
      {/* Background backdrop click to close */}
      <button
        type="button"
        className="fixed inset-0 w-full h-full bg-transparent border-0 cursor-default"
        onClick={onClose}
        tabIndex={-1}
        aria-label="Fechar fundo do modal"
      />

      <div
        className="relative bg-surface border border-outline-variant rounded-xl w-full max-h-[95vh] shadow-2xl flex flex-col overflow-hidden z-10"
        style={{ maxWidth: '1180px' }}
        aria-modal="true"
      >
        {/* ── Header Unificado: Seleção de Template ──────────────────────── */}
        <div className="flex items-center justify-between px-md py-sm border-b border-outline-variant bg-surface-container-low flex-shrink-0">
          <div className="flex items-center gap-sm flex-1 min-w-0">
            <span className="material-symbols-outlined text-[24px] text-primary shrink-0">tune</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-xs flex-wrap">
                <select
                  value={state.template?.id ?? ''}
                  onChange={(e) => handleTemplateSelect(e.target.value)}
                  disabled={isLoadingTemplates}
                  aria-label="Selecionar Template de Esquadria"
                  className="font-headline text-headline-md font-bold text-on-surface bg-transparent border-0 cursor-pointer hover:text-primary focus:outline-none pr-md truncate max-w-full"
                >
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <p className="font-body text-xs text-on-surface-variant truncate">
                Template selecionado. Configure os insumos de cada categoria, medidas e parâmetros técnicos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-sm shrink-0 ml-sm">
            {/* Chip de Subtotal no topo para nunca ficar oculto (Item 1) */}
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
        </div>

        {/* ── Corpo do Modal: Layout em 2 Colunas ────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-md lg:p-lg min-h-0 bg-surface">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-md">

            {/* ════════════════════════════════════════════════════════════════
                COLUNA DA ESQUERDA: GABARITO VISUAL, SENTIDO, PUXADOR, FURAÇÃO & ACABAMENTOS
               ════════════════════════════════════════════════════════════════ */}
            <div className="lg:col-span-5 flex flex-col gap-md">
              <h3 className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-xs">
                <span>📐</span> GABARITO VISUAL & DETALHES TÉCNICOS
              </h3>

              {/* 1. Preview SVG e Cotas Técnicas (Item 1: altura controlada para não esconder subtotal) */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-sm shadow-sm flex flex-col items-center justify-center h-[260px] max-h-[260px] overflow-hidden">
                <WindowSvgPreview
                  templateType={svgTemplate}
                  widthMm={svgW}
                  heightMm={svgH}
                  openingDirection={state.openingDirection}
                  handleConfig={state.handleConfig}
                  drillingConfig={state.drillingConfig}
                  templateName={state.template?.name}
                  aluminumColor={state.aluminumColor}
                />
              </div>

              {/* 2. Sentido de Abertura */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-sm shadow-sm flex flex-col gap-xs">
                <p className="text-xs font-label font-semibold text-on-surface flex items-center gap-xs">
                  <span>↔</span> Sentido de Abertura da Folha
                </p>
                <div className="flex gap-xs mt-xs">
                  <button
                    type="button"
                    onClick={() => setState((p) => ({ ...p, openingDirection: 'LEFT_TO_RIGHT' }))}
                    className={`flex-1 py-xs px-sm rounded border text-xs font-label font-semibold flex items-center justify-center gap-xs transition-all ${
                      state.openingDirection === 'LEFT_TO_RIGHT'
                        ? 'bg-primary text-on-primary border-primary shadow-sm'
                        : 'bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    <span>→</span> Abrir p/ Direita
                  </button>
                  <button
                    type="button"
                    onClick={() => setState((p) => ({ ...p, openingDirection: 'RIGHT_TO_LEFT' }))}
                    className={`flex-1 py-xs px-sm rounded border text-xs font-label font-semibold flex items-center justify-center gap-xs transition-all ${
                      state.openingDirection === 'RIGHT_TO_LEFT'
                        ? 'bg-primary text-on-primary border-primary shadow-sm'
                        : 'bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    <span>←</span> Abrir p/ Esquerda
                  </button>
                </div>
              </div>

              {/* 3 e 5. Configuração de Puxador (Interage com material e permite ambos os lados) */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-sm shadow-sm flex flex-col gap-sm">
                <p className="text-xs font-label font-semibold text-on-surface flex items-center gap-xs">
                  <span>≡</span> Configuração de Puxador
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

                  {/* 3. Opção de colocar ambos os lados */}
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
                      <option value="BOTH_SIDES">2 Lados (Ambos os Lados / Frente e Verso)</option>
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
                        <option value="PIECE">Pedaço / Tamanho Fixo (cm)</option>
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
              <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-sm shadow-sm flex flex-col gap-sm">
                <p className="text-xs font-label font-semibold text-on-surface flex items-center gap-xs">
                  <span>⚙</span> Parâmetros de Furação
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

              {/* 4. Acabamentos do Template (Baseados nos materiais selecionados) */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-sm shadow-sm flex flex-col gap-sm">
                <p className="text-xs font-label font-semibold text-on-surface">Acabamentos do Template</p>
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
                COLUNA DA DIREITA:
                2. MATERIAIS LOGO APÓS O TEMPLATE
                3. MEDIDAS E QUANTIDADE
                4. MÃO DE OBRA E OBSERVAÇÕES
               ════════════════════════════════════════════════════════════════ */}
            <div className="lg:col-span-7 flex flex-col gap-md">

              {/* 2. SELEÇÃO DE INSUMOS POR CATEGORIA (Primeira seção após seleção de template) */}
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-xs">
                  <span>🗃</span> 1. SELEÇÃO DE INSUMOS DO TEMPLATE
                </h3>
                <span className="text-[11px] font-body text-on-surface-variant">
                  Selecione os materiais e informe a quantidade
                </span>
              </div>

              {/* Cards de Insumos por Categoria (Item 6: Permite adicionar quantidade) */}
              <div className="flex flex-col gap-sm">
                {(state.template?.categoryRequirements ?? []).map((req) => {
                  const sel = state.materialSelections.find((s) => s.requirementId === req.id);
                  const iconName = CATEGORY_ICONS[req.categoryType] ?? 'category';

                  let optionsList: { id: string; name: string; price: number; unit: string }[] = [];
                  if (req.categoryType === 'GLASS') {
                    optionsList = glasses.map((g) => ({
                      id: g.id,
                      name: g.name,
                      price: g.salePrice ?? g.pricePerSqm ?? 0,
                      unit: 'm²',
                    }));
                  } else if (req.categoryType === 'PROFILE') {
                    optionsList = profiles.map((p) => ({
                      id: p.id,
                      name: p.name,
                      price: p.salePrice ?? 0,
                      unit: p.unitMeasure ?? 'm',
                    }));
                  } else if (req.categoryType === 'HARDWARE') {
                    optionsList = hardwares.map((h) => ({
                      id: h.id,
                      name: h.name,
                      price: h.salePrice ?? 0,
                      unit: h.unitMeasure ?? 'un',
                    }));
                  } else if (req.categoryType === 'FILM') {
                    optionsList = films.map((f) => ({
                      id: f.id,
                      name: f.name,
                      price: f.salePrice ?? 0,
                      unit: 'm²',
                    }));
                  }

                  const categoryPrice = sel?.totalPrice;
                  const unitMeasure = sel?.unitMeasure ?? (req.categoryType === 'GLASS' || req.categoryType === 'FILM' ? 'm²' : req.categoryType === 'PROFILE' ? 'm' : 'un');

                  return (
                    <div
                      key={req.id}
                      className="bg-surface-container-lowest border border-outline-variant rounded-lg p-sm shadow-sm flex flex-col gap-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-xs">
                          <span className="material-symbols-outlined text-[18px] text-primary">{iconName}</span>
                          <span className="text-xs font-label font-bold text-on-surface">{req.label}</span>
                          {req.isOptional && (
                            <span className="text-[10px] bg-surface-container px-xs py-[1px] rounded text-on-surface-variant">
                              Opcional
                            </span>
                          )}
                        </div>
                        <span className="font-data-mono font-bold text-primary text-sm">
                          {categoryPrice !== undefined
                            ? formatBRL(categoryPrice)
                            : sel?.materialId
                            ? `${formatBRL(sel.unitPrice)} / ${unitMeasure}`
                            : '—'}
                        </span>
                      </div>

                      <div className="flex items-center gap-xs mt-xs">
                        {/* Seletor de Material */}
                        <select
                          value={sel?.materialId ?? ''}
                          onChange={(e) => handleMaterialChange(req.id, e.target.value)}
                          aria-label={`Selecionar material para ${req.label}`}
                          className="flex-1 text-xs p-xs bg-surface border border-outline-variant rounded font-body text-on-surface focus:border-primary focus:outline-none min-w-0"
                        >
                          {req.isOptional && <option value="">-- Sem {req.label} / Nenhuma --</option>}
                          {!req.isOptional && !sel?.materialId && (
                            <option value="">-- Selecione o material --</option>
                          )}
                          {optionsList.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.name} · {formatBRL(opt.price)} / {opt.unit}
                            </option>
                          ))}
                        </select>

                        {/* 6. Input de Quantidade do Material */}
                        <div className="flex items-center gap-[2px]">
                          <input
                            type="number"
                            step="0.01"
                            min={0}
                            value={sel?.quantity ?? ''}
                            onChange={(e) => handleMaterialQtyChange(req.id, e.target.value)}
                            disabled={!sel?.materialId}
                            placeholder="Qtd"
                            aria-label={`Quantidade de ${req.label}`}
                            className="w-20 p-xs bg-surface border border-outline-variant rounded text-xs font-data-mono text-on-surface text-center focus:border-primary focus:outline-none disabled:opacity-40"
                          />
                          <span className="text-xs font-data-mono text-on-surface-variant bg-surface-container px-xs py-[6px] rounded border border-outline-variant min-w-[36px] text-center">
                            {unitMeasure}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 2. MEDIDAS E QUANTIDADE DE PEÇAS */}
              <h3 className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-xs mt-xs">
                <span>🪟</span> 2. MEDIDAS E QUANTIDADE DE ESQUADRIAS
              </h3>

              {/* Grid de Medidas (Largura, Altura, Quantidade) */}
              <div className="grid grid-cols-3 gap-sm">
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
                    className={`w-full p-xs bg-surface-container-lowest border rounded text-sm font-data-mono text-on-surface focus:border-primary focus:outline-none ${
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
                    className={`w-full p-xs bg-surface-container-lowest border rounded text-sm font-data-mono text-on-surface focus:border-primary focus:outline-none ${
                      errors.heightMm ? 'border-error' : 'border-outline-variant'
                    }`}
                  />
                </div>

                <div>
                  <label htmlFor="modal-quantity-input" className="text-xs font-label text-on-surface-variant block mb-xs">
                    Qtd de Esquadrias
                  </label>
                  <input
                    id="modal-quantity-input"
                    type="number"
                    min={1}
                    max={999}
                    value={state.quantity}
                    onChange={(e) =>
                      setState((p) => ({
                        ...p,
                        quantity: parseInt(e.target.value, 10) || 1,
                      }))
                    }
                    aria-label="Quantidade de Esquadrias"
                    className={`w-full p-xs bg-surface-container-lowest border rounded text-sm font-data-mono text-on-surface focus:border-primary focus:outline-none ${
                      errors.quantity ? 'border-error' : 'border-outline-variant'
                    }`}
                  />
                </div>
              </div>

              {/* Cota da Área Retangular */}
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

              {/* 3. MÃO DE OBRA E OBSERVAÇÕES */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm mt-xs">
                <div>
                  <label htmlFor="modal-labor-cost-input" className="text-xs font-label text-on-surface-variant block mb-xs">
                    Mão de Obra deste Item (R$)
                  </label>
                  <input
                    id="modal-labor-cost-input"
                    type="number"
                    step="0.01"
                    min={0}
                    value={state.laborCost ?? 200.0}
                    onChange={(e) =>
                      setState((p) => ({
                        ...p,
                        laborCost: parseFloat(e.target.value) || 0,
                      }))
                    }
                    aria-label="Mão de Obra deste Item em Reais"
                    className="w-full p-xs bg-surface-container-lowest border border-outline-variant rounded text-sm font-data-mono text-on-surface focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="modal-notes-input" className="text-xs font-label text-on-surface-variant block mb-xs">
                    Observações do Item
                  </label>
                  <input
                    id="modal-notes-input"
                    type="text"
                    value={state.notes ?? ''}
                    onChange={(e) => setState((p) => ({ ...p, notes: e.target.value }))}
                    placeholder="Ex: Vidro temperado jateado..."
                    aria-label="Observações do Item"
                    className="w-full p-xs bg-surface-container-lowest border border-outline-variant rounded text-sm font-body text-on-surface focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer Actions: Subtotal sempre visível e fixado na base (Item 1) ── */}
        <div className="sticky bottom-0 z-20 flex items-center justify-between gap-sm px-md py-sm border-t border-outline-variant bg-surface-container-low flex-shrink-0 shadow-lg">
          <div className="flex items-center gap-xs">
            <span className="text-xs font-label text-on-surface-variant">Subtotal Estimado:</span>
            <span className="font-data-mono font-bold text-primary text-xl">
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
        </div>
      </div>
    </div>,
    document.body,
  );
};
