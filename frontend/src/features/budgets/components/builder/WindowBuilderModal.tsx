import React, { useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import type {
  BuilderState,
  BudgetItem,
  OpeningDirection,
  HandleConfig,
  DrillingConfig,
  MaterialSelection,
} from '../../types';
import { TEMPLATE_TYPE_INFO } from '../../types';
import { useWindowTemplates } from '../../hooks/useBudgets';
import {
  useGlasses,
  useProfiles,
  useHardwares,
  useFilms,
} from '../../../catalog/hooks/useCatalog';
import { calcQuantityForCategory, calcItemSubtotal } from '../../utils/calculations';

import { TemplateSelector } from './TemplateSelector';
import { DimensionsForm } from './DimensionsForm';
import { OpeningDirectionSelector } from './OpeningDirectionSelector';
import { MaterialConfiguration } from './MaterialConfiguration';
import { HandleConfiguration } from './HandleConfiguration';
import { DrillingConfiguration } from './DrillingConfiguration';
import { WindowSvgPreview } from './WindowSvgPreview';
import { ItemPriceSummary } from './ItemPriceSummary';
import { Button } from '../../../../components/ui/Button';
import toast from 'react-hot-toast';

// ─── Tabs do formulário ────────────────────────────────────────────────────
type BuilderTab = 'template' | 'dimensions' | 'materials' | 'handle' | 'drilling';

const TABS: { id: BuilderTab; label: string; icon: string }[] = [
  { id: 'template', label: 'Template', icon: 'grid_view' },
  { id: 'dimensions', label: 'Dimensões', icon: 'straighten' },
  { id: 'materials', label: 'Materiais', icon: 'inventory_2' },
  { id: 'handle', label: 'Puxador', icon: 'linear_scale' },
  { id: 'drilling', label: 'Furação', icon: 'radio_button_unchecked' },
];

// ─── Estado inicial ────────────────────────────────────────────────────────
const DEFAULT_HANDLE: HandleConfig = {
  handleType: 'BAR_TUBULAR',
  side: 'ONE_SIDE',
  coverage: 'FULL',
};

const DEFAULT_DRILLING: DrillingConfig = {
  holeCount: 0,
  divisionType: 'EQUAL',
};

const createInitialState = (): BuilderState => ({
  template: null,
  widthMm: '',
  heightMm: '',
  quantity: 1,
  openingDirection: 'LEFT_TO_RIGHT',
  handleConfig: DEFAULT_HANDLE,
  drillingConfig: DEFAULT_DRILLING,
  materialSelections: [],
});

// ─── Props ─────────────────────────────────────────────────────────────────
interface WindowBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: BudgetItem) => void;
  editingItem?: BudgetItem | null;
}

// ─── Componente ────────────────────────────────────────────────────────────
export const WindowBuilderModal: React.FC<WindowBuilderModalProps> = ({
  isOpen,
  onClose,
  onAddItem,
  editingItem,
}) => {
  const [state, setState] = React.useState<BuilderState>(createInitialState());
  const [activeTab, setActiveTab] = React.useState<BuilderTab>('template');
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Queries de catálogo — reaproveitados do catalog existente
  const { data: templates = [], isLoading: isLoadingTemplates } = useWindowTemplates();
  const { data: glassesData } = useGlasses();
  const { data: profilesData } = useProfiles();
  const { data: hardwaresData } = useHardwares();
  const { data: filmsData } = useFilms();

  const glasses = useMemo(() => glassesData?.content ?? [], [glassesData]);
  const profiles = useMemo(() => profilesData?.content ?? [], [profilesData]);
  const hardwares = useMemo(() => hardwaresData?.content ?? [], [hardwaresData]);
  const films = useMemo(() => filmsData?.content ?? [], [filmsData]);

  const isLoadingMaterials = !glassesData || !profilesData || !hardwaresData || !filmsData;

  // ─── Inicializar com item de edição ──────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    if (editingItem) {
      const template = templates.find((t) => t.id === editingItem.productId) ?? null;
      const reqs = template?.categoryRequirements ?? [];
      const selections: MaterialSelection[] = editingItem.options.map((opt) => {
        const req = reqs.find((r) => r.categoryType === opt.categoryType);
        return {
          requirementId: req?.id ?? opt.categoryType,
          categoryType: opt.categoryType,
          label: opt.materialName,
          isOptional: req?.isOptional ?? false,
          materialId: opt.materialId,
          materialName: opt.materialName,
          unitMeasure: opt.unitMeasure,
          unitPrice: opt.unitPrice,
          calculatedQty: opt.quantity,
          totalPrice: opt.totalPrice,
        };
      });

      setState({
        template,
        widthMm: editingItem.widthMm,
        heightMm: editingItem.heightMm,
        quantity: editingItem.quantity,
        openingDirection: editingItem.templateConfig.openingDirection ?? 'LEFT_TO_RIGHT',
        handleConfig: editingItem.handleConfig,
        drillingConfig: editingItem.drillingConfig,
        materialSelections: selections,
      });
      setActiveTab('template');
    } else {
      setState(createInitialState());
      setActiveTab('template');
    }
    setErrors({});
  }, [isOpen, editingItem, templates]);

  // ─── Fechar com ESC ──────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // ─── Bloqueio de scroll ──────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // ─── Material selection handler ──────────────────────────────────────────
  const handleMaterialSelect = useCallback((requirementId: string, materialId: string) => {
    const requirements = state.template?.categoryRequirements ?? [];
    const req = requirements.find((r) => r.id === requirementId);
    if (!req) return;

    // Busca o material nas listas
    const allMaterials = [
      ...glasses.map((g) => ({ id: g.id, name: g.name, unit: 'm²', price: g.salePrice ?? g.pricePerSqm ?? 0 })),
      ...profiles.map((p) => ({ id: p.id, name: p.name, unit: p.unitMeasure, price: p.salePrice ?? 0 })),
      ...hardwares.map((h) => ({ id: h.id, name: h.name, unit: h.unitMeasure, price: h.salePrice ?? 0 })),
      ...films.map((f) => ({ id: f.id, name: f.name, unit: 'm²', price: f.salePrice ?? 0 })),
    ];

    const material = allMaterials.find((m) => m.id === materialId);

    const w = typeof state.widthMm === 'number' ? state.widthMm : 0;
    const h = typeof state.heightMm === 'number' ? state.heightMm : 0;
    const qty = typeof state.quantity === 'number' && state.quantity >= 1 ? state.quantity : 1;
    const calcResult = (w > 0 && h > 0 && state.template)
      ? calcQuantityForCategory(req.categoryType, w, h, qty, state.template.templateType!)
      : { value: 0, unit: 'un' };

    const sel: MaterialSelection = {
      requirementId,
      categoryType: req.categoryType,
      label: req.label,
      isOptional: req.isOptional,
      materialId: materialId,
      materialName: material?.name ?? '',
      unitMeasure: material?.unit ?? calcResult.unit,
      unitPrice: material?.price ?? 0,
      calculatedQty: calcResult.value,
      totalPrice: calcResult.value * (material?.price ?? 0),
    };

    setState((prev) => ({
      ...prev,
      materialSelections: [
        ...prev.materialSelections.filter((s) => s.requirementId !== requirementId),
        ...(materialId ? [sel] : []),
      ],
    }));

    // Limpa erro deste campo
    setErrors((prev) => {
      const next = { ...prev };
      delete next[requirementId];
      return next;
    });
  }, [state, glasses, profiles, hardwares, films]);

  // ─── Recalcular quantidades quando dimensões ou qty mudam ────────────────
  useEffect(() => {
    if (!state.template) return;
    const w = typeof state.widthMm === 'number' ? state.widthMm : 0;
    const h = typeof state.heightMm === 'number' ? state.heightMm : 0;
    const qty = typeof state.quantity === 'number' && state.quantity >= 1 ? state.quantity : 1;
    if (w <= 0 || h <= 0) return;

    setState((prev) => ({
      ...prev,
      materialSelections: prev.materialSelections.map((sel) => {
        const calc = calcQuantityForCategory(sel.categoryType, w, h, qty, prev.template!.templateType!);
        return {
          ...sel,
          calculatedQty: calc.value,
          totalPrice: calc.value * sel.unitPrice,
        };
      }),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.widthMm, state.heightMm, state.quantity, state.template?.id]);

  // ─── Subtotal do item ────────────────────────────────────────────────────
  const itemSubtotal = useMemo(() => {
    const w = typeof state.widthMm === 'number' ? state.widthMm : 0;
    const h = typeof state.heightMm === 'number' ? state.heightMm : 0;
    const qty = typeof state.quantity === 'number' && state.quantity >= 1 ? state.quantity : 1;
    if (!w || !h) return 0;
    return calcItemSubtotal(
      state.materialSelections.map((s) => ({ quantity: s.calculatedQty, unitPrice: s.unitPrice })),
      state.template?.laborCost ?? 0,
      qty,
    );
  }, [state.materialSelections, state.template, state.quantity, state.widthMm, state.heightMm]);

  // ─── Validação ──────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!state.template) {
      newErrors.template = 'Selecione um template de esquadria.';
      toast.error('Selecione um template de esquadria.');
      setActiveTab('template');
      setErrors(newErrors);
      return false;
    }

    const w = typeof state.widthMm === 'number' ? state.widthMm : 0;
    const h = typeof state.heightMm === 'number' ? state.heightMm : 0;
    const qty = typeof state.quantity === 'number' ? state.quantity : 0;

    if (!w || w <= 0) {
      newErrors.widthMm = 'Largura deve ser maior que zero.';
    }
    if (!h || h <= 0) {
      newErrors.heightMm = 'Altura deve ser maior que zero.';
    }
    if (!qty || qty < 1 || !Number.isInteger(qty)) {
      newErrors.quantity = 'Quantidade deve ser um número inteiro maior ou igual a 1.';
    }

    if (Object.keys(newErrors).length > 0) {
      toast.error('Verifique as dimensões da esquadria.');
      setActiveTab('dimensions');
      setErrors(newErrors);
      return false;
    }

    // Materiais obrigatórios
    const requirements = state.template.categoryRequirements ?? [];
    const missingRequired = requirements.filter(
      (req) => !req.isOptional && !state.materialSelections.find((s) => s.requirementId === req.id && s.materialId),
    );

    if (missingRequired.length > 0) {
      missingRequired.forEach((req) => {
        newErrors[req.id] = 'Seleção obrigatória.';
      });
      toast.error(`Selecione os materiais obrigatórios: ${missingRequired.map((r) => r.label).join(', ')}`);
      setActiveTab('materials');
      setErrors(newErrors);
      return false;
    }

    // Puxador — tamanho obrigatório se PIECE
    if (state.handleConfig.handleType === 'BAR_TUBULAR' && state.handleConfig.coverage === 'PIECE') {
      if (!state.handleConfig.pieceLengthCm || state.handleConfig.pieceLengthCm <= 0) {
        newErrors.pieceLengthCm = 'Informe o tamanho do puxador em cm.';
        toast.error('Informe o tamanho do puxador em cm.');
        setActiveTab('handle');
        setErrors(newErrors);
        return false;
      }
    }

    // Furação — distâncias customizadas
    if (state.drillingConfig.holeCount > 0 && state.drillingConfig.divisionType === 'CUSTOM_DISTANCE') {
      const dists = state.drillingConfig.customDistancesMm ?? [];
      if (dists.length !== state.drillingConfig.holeCount || dists.length === 0) {
        newErrors.customDistancesMm = `Configure as ${state.drillingConfig.holeCount} posições dos furos.`;
      } else if (dists.some((d) => !d || d <= 0)) {
        newErrors.customDistancesMm = 'Todas as distâncias devem ser maiores que zero.';
      } else if (h > 0 && dists.some((d) => d > h)) {
        newErrors.customDistancesMm = `Nenhum furo pode ultrapassar a altura da esquadria (${h}mm).`;
      }

      if (newErrors.customDistancesMm) {
        toast.error(newErrors.customDistancesMm);
        setActiveTab('drilling');
        setErrors(newErrors);
        return false;
      }
    }

    setErrors({});
    return true;
  };

  // ─── Submit ──────────────────────────────────────────────────────────────
  const handleAddItem = () => {
    if (!validate()) return;

    const w = typeof state.widthMm === 'number' ? state.widthMm : 0;
    const h = typeof state.heightMm === 'number' ? state.heightMm : 0;
    const qty = typeof state.quantity === 'number' ? state.quantity : 1;

    const item: BudgetItem = {
      tempId: editingItem?.tempId ?? Math.random().toString(36).slice(2),
      productId: state.template!.id,
      productName: state.template!.name,
      templateType: state.template!.templateType!,
      templateConfig: {
        templateType: state.template!.templateType!,
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
      laborCost: state.template!.laborCost,
      options: state.materialSelections
        .filter((s) => s.materialId)
        .map((s) => ({
          materialId: s.materialId,
          materialName: s.materialName,
          categoryType: s.categoryType,
          unitMeasure: s.unitMeasure,
          quantity: s.calculatedQty,
          unitPrice: s.unitPrice,
          totalPrice: s.totalPrice,
        })),
      subtotal: itemSubtotal,
    };

    onAddItem(item);
    onClose();
  };

  if (!isOpen) return null;

  // ─── SVG Preview props ────────────────────────────────────────────────────
  const svgTemplate = state.template?.templateType ?? 'SLIDING_DOOR_2F';
  const svgW = typeof state.widthMm === 'number' && state.widthMm > 0 ? state.widthMm : 2000;
  const svgH = typeof state.heightMm === 'number' && state.heightMm > 0 ? state.heightMm : 2100;

  const templateInfo = state.template?.templateType ? TEMPLATE_TYPE_INFO[state.template.templateType] : null;

  // ─── Portal content ─────────────────────────────────────────────────────
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-xs sm:p-md bg-black/70 backdrop-blur-sm">
      <button
        type="button"
        className="fixed inset-0 w-full h-full bg-transparent border-0 cursor-default"
        onClick={onClose}
        tabIndex={-1}
        aria-label="Fechar fundo do modal"
      />
      <div
        className="relative bg-surface border border-outline-variant rounded-xl w-full max-h-[95vh] shadow-2xl flex flex-col overflow-hidden z-10"
        style={{ maxWidth: '1100px' }}
        aria-modal="true"
        aria-labelledby="builder-modal-title"
      >
        {/* ─── Modal Header ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-md py-sm border-b border-outline-variant bg-surface-container-low flex-shrink-0">
          <div>
            <h2 id="builder-modal-title" className="font-headline text-headline-md font-bold text-on-surface">
              {editingItem ? 'Editar Esquadria' : 'Configurar Esquadria'}
            </h2>
            {state.template && (
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
                {state.template.name}
                {templateInfo && <span className="ml-sm text-secondary">— {templateInfo.description}</span>}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-xs text-on-surface-variant hover:bg-surface-container-highest rounded-full transition-colors"
            aria-label="Fechar"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* ─── Tabs ────────────────────────────────────────────────────── */}
        <div className="flex gap-0 border-b border-outline-variant bg-surface-container-low flex-shrink-0 overflow-x-auto">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const isDisabled = tab.id !== 'template' && !state.template;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => !isDisabled && setActiveTab(tab.id)}
                disabled={isDisabled}
                className={`
                  flex items-center gap-xs px-md py-sm text-xs font-label whitespace-nowrap transition-all border-b-2
                  ${isActive ? 'border-primary text-primary font-semibold bg-surface' : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container'}
                  ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ─── Main Content ──────────────────────────────────────────────── */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row min-h-0">
          {/* Left: Form area */}
          <div className="flex-1 overflow-y-auto p-md lg:p-lg min-w-0">
            {activeTab === 'template' && (
              <TemplateSelector
                templates={templates}
                selectedTemplateId={state.template?.id ?? null}
                isLoading={isLoadingTemplates}
                onSelect={(template) => {
                  const info = TEMPLATE_TYPE_INFO[template.templateType!];
                  const firstDir = info?.supportedDirections[0] ?? 'LEFT_TO_RIGHT';
                  // Inicializa as seleções de materiais para os requisitos do template
                  const newSelections: MaterialSelection[] = (template.categoryRequirements ?? []).map((req) => ({
                    requirementId: req.id,
                    categoryType: req.categoryType,
                    label: req.label,
                    isOptional: req.isOptional,
                    materialId: '',
                    materialName: '',
                    unitMeasure: '',
                    unitPrice: 0,
                    calculatedQty: 0,
                    totalPrice: 0,
                  }));
                  setState((prev) => ({
                    ...prev,
                    template,
                    openingDirection: firstDir,
                    materialSelections: newSelections,
                  }));
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.template;
                    return next;
                  });
                  setActiveTab('dimensions');
                }}
              />
            )}

            {activeTab === 'dimensions' && (
              <div className="flex flex-col gap-lg">
                <DimensionsForm
                  widthMm={state.widthMm}
                  heightMm={state.heightMm}
                  quantity={state.quantity}
                  onWidthChange={(v) => setState((p) => ({ ...p, widthMm: v }))}
                  onHeightChange={(v) => setState((p) => ({ ...p, heightMm: v }))}
                  onQuantityChange={(v) => setState((p) => ({ ...p, quantity: v }))}
                  errors={errors}
                />
                {state.template && (
                  <OpeningDirectionSelector
                    templateType={state.template.templateType!}
                    value={state.openingDirection}
                    onChange={(dir: OpeningDirection) => setState((p) => ({ ...p, openingDirection: dir }))}
                  />
                )}
              </div>
            )}

            {activeTab === 'materials' && state.template && (
              <MaterialConfiguration
                requirements={state.template.categoryRequirements ?? []}
                selections={state.materialSelections}
                onSelectionChange={handleMaterialSelect}
                glasses={glasses}
                profiles={profiles}
                hardwares={hardwares}
                films={films}
                widthMm={typeof state.widthMm === 'number' ? state.widthMm : 0}
                heightMm={typeof state.heightMm === 'number' ? state.heightMm : 0}
                quantity={typeof state.quantity === 'number' && state.quantity >= 1 ? state.quantity : 1}
                templateType={state.template.templateType!}
                errors={errors}
                isLoadingMaterials={isLoadingMaterials}
              />
            )}

            {activeTab === 'handle' && (
              <HandleConfiguration
                value={state.handleConfig}
                onChange={(config) => setState((p) => ({ ...p, handleConfig: config }))}
                errors={errors}
              />
            )}

            {activeTab === 'drilling' && (
              <DrillingConfiguration
                value={state.drillingConfig}
                onChange={(config) => setState((p) => ({ ...p, drillingConfig: config }))}
                heightMm={typeof state.heightMm === 'number' && state.heightMm > 0 ? state.heightMm : undefined}
                errors={errors}
              />
            )}
          </div>

          {/* Right: Preview + Summary (desktop) */}
          <div className="hidden lg:flex flex-col w-72 xl:w-80 flex-shrink-0 border-l border-outline-variant bg-surface-container-low p-md gap-md overflow-y-auto">
            <div>
              <h4 className="text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wider mb-sm">
                Preview em Tempo Real
              </h4>
              <div className="bg-surface-container-lowest rounded-lg p-sm border border-outline-variant flex items-center justify-center min-h-[180px]">
                <WindowSvgPreview
                  templateType={svgTemplate}
                  widthMm={svgW}
                  heightMm={svgH}
                  openingDirection={state.openingDirection}
                  handleConfig={state.handleConfig}
                  drillingConfig={state.drillingConfig}
                />
              </div>
            </div>

            <ItemPriceSummary
              selections={state.materialSelections}
              laborCost={state.template?.laborCost ?? 0}
              quantity={state.quantity}
              widthMm={state.widthMm}
              heightMm={state.heightMm}
            />
          </div>
        </div>

        {/* ─── Mobile Preview (collapsible) ──────────────────────────────── */}
        <div className="lg:hidden border-t border-outline-variant bg-surface-container-low px-md py-sm">
          <div className="flex items-center gap-sm justify-between">
            <div className="flex items-center gap-sm min-w-0">
              <div className="shrink-0">
                <WindowSvgPreview
                  templateType={svgTemplate}
                  widthMm={svgW}
                  heightMm={svgH}
                  openingDirection={state.openingDirection}
                  handleConfig={state.handleConfig}
                  drillingConfig={state.drillingConfig}
                />
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-on-surface-variant font-label">Subtotal</p>
              <p className="font-data-mono font-bold text-primary text-base">
                {itemSubtotal > 0 ? `R$ ${itemSubtotal.toFixed(2).replace('.', ',')}` : '—'}
              </p>
            </div>
          </div>
        </div>

        {/* ─── Footer Actions ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-sm px-md py-sm border-t border-outline-variant bg-surface-container-low flex-shrink-0">
          {/* Navigation arrows */}
          <div className="flex gap-xs">
            <button
              type="button"
              onClick={() => {
                const idx = TABS.findIndex((t) => t.id === activeTab);
                if (idx > 0) setActiveTab(TABS[idx - 1].id);
              }}
              disabled={activeTab === TABS[0].id}
              className="flex items-center gap-xs px-sm py-xs border border-outline-variant rounded-md text-on-surface-variant text-xs font-label hover:bg-surface-container transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Anterior
            </button>
            <button
              type="button"
              onClick={() => {
                const idx = TABS.findIndex((t) => t.id === activeTab);
                if (idx < TABS.length - 1 && state.template) setActiveTab(TABS[idx + 1].id);
              }}
              disabled={activeTab === TABS[TABS.length - 1].id || !state.template}
              className="flex items-center gap-xs px-sm py-xs border border-outline-variant rounded-md text-on-surface-variant text-xs font-label hover:bg-surface-container transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Próximo
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>

          <div className="flex gap-sm">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              icon={editingItem ? 'save' : 'add'}
              onClick={handleAddItem}
            >
              {editingItem ? 'Salvar Alterações' : 'Adicionar Esquadria'}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};
