import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type {
  DoorTemplateType,
  BudgetItem,
  HandleConfig,
  HandlePosition,
  HandleType,
  HandleSide,
  HandleCoverage,
  CategoryType,
  WindowTemplate,
} from '../../../types';
import { getTypologyMetadata } from '../../../domain/typologyRegistry';
import { calcItemSubtotal } from '../../../utils/calculations';
import {
  getDefaultSvgTemplateForCatalogType,
  mapCatalogAluminumColor,
  mapCatalogGlassColor,
} from '../../../utils/mapCatalogTemplate';
import { TEMPLATE_TYPE_INFO } from '../../../types';

import {
  BASE_ALUMINUM_COLORS,
  BASE_GLASS_FINISHES,
  CATEGORY_ICONS,
  CATEGORY_LABELS,
  DEFAULT_WIDTH,
  DEFAULT_HEIGHT,
} from '../constants';

import { useBuilderCatalog } from './useBuilderCatalog';
import { useBuilderNavigation } from './useBuilderNavigation';
import { useBuilderMaterials } from './useBuilderMaterials';
import { useDrillingBuilder } from './useDrillingBuilder';
import { useHandleBuilder } from './useHandleBuilder';
import { useMaterialSync, syncHandleMaterialSelections } from './useMaterialSync';

export {
  BASE_ALUMINUM_COLORS,
  BASE_GLASS_FINISHES,
  CATEGORY_ICONS,
  CATEGORY_LABELS,
  DEFAULT_WIDTH,
  DEFAULT_HEIGHT,
};

/**
 * Hook orquestrador principal do Modal de Construção de Esquadrias (WindowBuilderModal).
 * 
 * Arquitetura de Decomposição:
 * - `useBuilderCatalog`: Carregamento do catálogo de materiais e cálculo de cores dinâmicas.
 * - `useBuilderMaterials`: Gestão da lista de materiais (`materialSelections`), cálculo de consumo e trocas de unidades.
 * - `useBuilderNavigation`: Controle dos passos do Wizard (1 a 4) e validações antes de avançar.
 * - `useHandleBuilder`: Estado do puxador, compatibilidade de posições e auto-orientação vertical/horizontal.
 * - `useDrillingBuilder`: Configuração de furação mecânica (furos equidistantes ou cotas personalizadas).
 * - `useMaterialSync`: Funções puras de sincronização entre catálogo, dimensões e geometria CAD.
 */
export interface UseWindowBuilderStateProps {
  /** Indica se o modal está aberto */
  isOpen: boolean;
  /** ID do produto/template pré-selecionado (opcional) */
  selectedProductId?: string | null;
  /** Item em edição (caso seja edição de esquadria já adicionada ao orçamento) */
  editingItem?: BudgetItem | null;
  /** Callback disparado ao salvar/adicionar o item configurado ao orçamento */
  onAddItem: (item: BudgetItem) => void;
  /** Callback para fechar o modal */
  onClose: () => void;
}

/**
 * Hook central que integra todos os submódulos do construtor de esquadrias,
 * expondo uma API consolidada para a interface do usuário.
 */
export function useWindowBuilderState({
  isOpen,
  selectedProductId,
  editingItem,
  onAddItem,
  onClose,
}: UseWindowBuilderStateProps) {
  // 1. Catálogo & Cores
  const {
    templates,
    glasses,
    profiles,
    hardwares,
    films,
    dynamicAluminumColors,
    dynamicGlassFinishes,
    availableHandleProfiles,
    availableHandleHardwares,
  } = useBuilderCatalog();

  // 2. Estado Base da Esquadria
  const [template, setTemplate] = useState<WindowTemplate | null>(null);
  const [templateType, setTemplateType] = useState<DoorTemplateType | undefined>(undefined);
  const [widthMm, setWidthMm] = useState<number | ''>(DEFAULT_WIDTH);
  const [heightMm, setHeightMm] = useState<number | ''>(DEFAULT_HEIGHT);
  const [quantity, setQuantity] = useState<number | ''>(1);
  const [openingDirection, setOpeningDirection] = useState<'LEFT_TO_RIGHT' | 'RIGHT_TO_LEFT' | 'OUTSIDE' | 'INSIDE' | 'CENTER_TO_SIDES'>('LEFT_TO_RIGHT');
  const [aluminumColor, setAluminumColor] = useState('Alumínio Fosco / Anodizado');
  const [glassFinish, setGlassFinish] = useState('Fumê / Cinza');
  const [laborCost, setLaborCost] = useState(0);
  const [notes, setNotes] = useState('');

  const hasInitializedRef = useRef(false);

  const svgTemplate: DoorTemplateType = (templateType || template?.templateType || 'SLIDING_DOOR_2F') as DoorTemplateType;

  const typologyMeta = useMemo(() => {
    const schemaPositions = template?.templateConfig?.optionSchema?.allowedHandlePositions;
    return getTypologyMetadata(svgTemplate, schemaPositions);
  }, [svgTemplate, template]);

  const supportedDirections = useMemo(() => {
    const schemaDirs = template?.templateConfig?.optionSchema?.allowedOpeningDirections;
    if (schemaDirs && schemaDirs.length > 0) return schemaDirs;
    return TEMPLATE_TYPE_INFO[svgTemplate]?.supportedDirections ?? typologyMeta.supportedOpeningDirections;
  }, [svgTemplate, typologyMeta, template]);

  const allowedHandlePositions = typologyMeta.allowedHandlePositions;

  // 3. Subhook de Puxador
  const {
    handleConfig,
    setHandleConfig,
    handleHandleTypeChange: baseHandleTypeChange,
    handleHandlePositionChange,
    handleHandleOrientationChange,
    handleHandleSideChange: baseHandleSideChange,
    handleHandleCoverageChange: baseHandleCoverageChange,
    handleHandlePieceLengthChange: baseHandlePieceLengthChange,
  } = useHandleBuilder({
    allowedHandlePositions,
    defaultHandlePosition: typologyMeta.defaultHandlePosition,
  });

  // 4. Subhook de Furação
  const {
    drillingConfig,
    setDrillingConfig,
    holeDistanceInputs,
    setHoleDistanceInputs,
    handleHoleCountChange,
    handleDivisionTypeChange,
    handleSingleHoleDistanceChange,
    initDrilling,
  } = useDrillingBuilder({ heightMm });

  // 5. Utilitários de Sincronização de Materiais
  const { findCatalogMaterial, buildSelectionsForTemplate } = useMaterialSync({
    glasses,
    profiles,
    hardwares,
    films,
  });

  const handleColorChange = useCallback((alum?: string, glass?: string) => {
    if (alum) setAluminumColor(mapCatalogAluminumColor(alum));
    if (glass) setGlassFinish(mapCatalogGlassColor(glass));
  }, []);

  // 6. Subhook de Materiais
  const {
    materialSelections,
    setMaterialSelections,
    handleMaterial,
    handleMaterialChange,
    handleMaterialQtyChange,
    handleAddMaterial,
    handleRemoveMaterial,
    handleSelectHandleMaterial,
  } = useBuilderMaterials({
    isOpen,
    widthMm,
    heightMm,
    quantity,
    templateType: svgTemplate,
    handleConfig,
    glasses,
    profiles,
    hardwares,
    films,
    findCatalogMaterial,
    onColorChange: handleColorChange,
    onHandleConfigChange: setHandleConfig,
  });

  // 7. Subhook de Navegação do Wizard
  const {
    currentStep,
    setCurrentStep,
    errors,
    setErrors,
    isMobileCadExpanded,
    setIsMobileCadExpanded,
    handleNextStep,
    handlePrevStep,
    handleGoToStep,
    validateAllBeforeSubmit,
    resetNavigation,
  } = useBuilderNavigation({
    template,
    widthMm,
    heightMm,
    quantity,
    materialSelections,
  });

  // Sincronizar alterações de puxador com os materiais
  const handleHandleTypeChange = useCallback(
    (type: HandleType) => {
      baseHandleTypeChange(type);
      setMaterialSelections((prev) => {
        let updated = prev;
        if (type === 'PROFILE_HANDLE' && handleMaterial?.categoryType === 'HARDWARE') {
          const profileMatch = profiles.find((p) => p.name.toLowerCase().includes('puxador')) ?? profiles[0];
          if (profileMatch) {
            updated = prev.map((sel) =>
              sel.requirementId === handleMaterial.requirementId
                ? {
                    ...sel,
                    categoryType: 'PROFILE' as CategoryType,
                    label: 'Perfil Puxador',
                    materialId: profileMatch.id,
                    materialName: profileMatch.name,
                    unitMeasure: profileMatch.unitMeasure ?? 'm',
                    unitPrice: profileMatch.salePrice ?? 0,
                    familyCode: profileMatch.familyCode,
                  }
                : sel
            );
          }
        } else if (type !== 'PROFILE_HANDLE' && type !== 'NONE' && handleMaterial?.categoryType === 'PROFILE') {
          const hwMatch = hardwares[0];
          if (hwMatch) {
            updated = prev.map((sel) =>
              sel.requirementId === handleMaterial.requirementId
                ? {
                    ...sel,
                    categoryType: 'HARDWARE' as CategoryType,
                    label: 'Puxador / Ferragem',
                    materialId: hwMatch.id,
                    materialName: hwMatch.name,
                    unitMeasure: hwMatch.unitMeasure ?? 'un',
                    unitPrice: hwMatch.salePrice ?? 0,
                    familyCode: hwMatch.familyCode,
                  }
                : sel
            );
          }
        }

        const isProfile = type === 'PROFILE_HANDLE';
        const newCfg: HandleConfig = {
          ...handleConfig,
          handleType: type,
          coverage: isProfile ? handleConfig.coverage ?? 'FULL' : undefined,
          pieceLengthCm: isProfile && handleConfig.coverage === 'PIECE' ? handleConfig.pieceLengthCm ?? 40 : undefined,
        };
        return syncHandleMaterialSelections(updated, newCfg, heightMm);
      });
    },
    [baseHandleTypeChange, handleMaterial, profiles, hardwares, handleConfig, heightMm, setMaterialSelections]
  );

  const handleHandleSideChange = useCallback(
    (side: HandleSide) => {
      baseHandleSideChange(side);
      const newConfig: HandleConfig = { ...handleConfig, side };
      setMaterialSelections((prev) => syncHandleMaterialSelections(prev, newConfig, heightMm));
    },
    [baseHandleSideChange, handleConfig, heightMm, setMaterialSelections]
  );

  const handleHandleCoverageChange = useCallback(
    (coverage: HandleCoverage) => {
      baseHandleCoverageChange(coverage);
      const newConfig: HandleConfig = {
        ...handleConfig,
        coverage,
        pieceLengthCm: coverage === 'PIECE' ? handleConfig.pieceLengthCm ?? 40 : undefined,
      };
      setMaterialSelections((prev) => syncHandleMaterialSelections(prev, newConfig, heightMm));
    },
    [baseHandleCoverageChange, handleConfig, heightMm, setMaterialSelections]
  );

  const handleHandlePieceLengthChange = useCallback(
    (pieceLengthCm: number) => {
      baseHandlePieceLengthChange(pieceLengthCm);
      const newConfig: HandleConfig = { ...handleConfig, pieceLengthCm };
      setMaterialSelections((prev) => syncHandleMaterialSelections(prev, newConfig, heightMm));
    },
    [baseHandlePieceLengthChange, handleConfig, heightMm, setMaterialSelections]
  );

  const handleHeightChange = useCallback(
    (h: number | '') => {
      setHeightMm(h);
      if (handleConfig.coverage === 'FULL' && handleConfig.handleType !== 'NONE') {
        setMaterialSelections((prev) => syncHandleMaterialSelections(prev, handleConfig, h));
      }
    },
    [handleConfig, setMaterialSelections]
  );

  // Inicialização (Edição ou Criação)
  useEffect(() => {
    if (!isOpen) {
      hasInitializedRef.current = false;
      resetNavigation();
      return;
    }

    if (editingItem) {
      if (!hasInitializedRef.current) {
        hasInitializedRef.current = true;
        const matchedTemplate = templates.find((t) => t.id === editingItem.productId) ?? templates[0] ?? null;
        const selections = (editingItem.options ?? []).map((opt, idx) => {
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
            totalPrice: qty !== undefined ? parseFloat((qty * price).toFixed(2)) : undefined,
          };
        });

        setTemplate(matchedTemplate);
        setTemplateType((editingItem.templateType as DoorTemplateType) || undefined);
        setWidthMm(editingItem.widthMm);
        setHeightMm(editingItem.heightMm);
        setQuantity(editingItem.quantity);
        setOpeningDirection(editingItem.templateConfig?.openingDirection ?? 'LEFT_TO_RIGHT');
        setAluminumColor(editingItem.templateConfig?.aluminumColor ?? 'Alumínio Fosco / Anodizado');
        setGlassFinish(editingItem.templateConfig?.glassFinish ?? 'Fumê / Cinza');
        setLaborCost(editingItem.laborCost ?? 0);
        setNotes(editingItem.notes ?? '');
        setMaterialSelections(selections);

        setHandleConfig(
          editingItem.handleConfig ?? {
            handleType: 'BAR_TUBULAR',
            side: 'ONE_SIDE',
            coverage: 'FULL',
            pieceLengthCm: 40,
          }
        );

        if (editingItem.drillingConfig) {
          initDrilling(editingItem.drillingConfig);
        }

        resetNavigation();
      }
    } else {
      if (!hasInitializedRef.current && templates.length > 0) {
        hasInitializedRef.current = true;
        const defaultTemplate = selectedProductId
          ? templates.find((t) => t.id === selectedProductId) ?? templates[0]
          : templates[0];

        const targetSvg =
          (defaultTemplate.templateType as DoorTemplateType) ||
          getDefaultSvgTemplateForCatalogType(
            defaultTemplate.catalogTemplateType,
            defaultTemplate.name,
            defaultTemplate.templateConfig
          );

        const validDirections = TEMPLATE_TYPE_INFO[targetSvg]?.supportedDirections ?? ['LEFT_TO_RIGHT', 'RIGHT_TO_LEFT'];
        const alumColor = defaultTemplate.templateConfig?.aluminumColor
          ? mapCatalogAluminumColor(defaultTemplate.templateConfig.aluminumColor)
          : 'Alumínio Fosco / Anodizado';
        const glassColor = defaultTemplate.templateConfig?.glassColor
          ? mapCatalogGlassColor(defaultTemplate.templateConfig.glassColor)
          : 'Fumê / Cinza';

        const rawDir = defaultTemplate.templateConfig?.openingDirection;
        const dir = rawDir && validDirections.includes(rawDir) ? rawDir : validDirections[0] ?? 'LEFT_TO_RIGHT';

        const cfgHandle = defaultTemplate.templateConfig?.handleConfig;
        const metaForTarget = getTypologyMetadata(targetSvg, defaultTemplate.templateConfig?.optionSchema?.allowedHandlePositions);
        const initialPos: HandlePosition = cfgHandle?.handlePosition ?? cfgHandle?.position ?? metaForTarget.defaultHandlePosition;

        const initialHandleConfig: HandleConfig = cfgHandle
          ? {
              handleType: cfgHandle.handleType ?? 'BAR_TUBULAR',
              position: initialPos,
              side: cfgHandle.side ?? 'ONE_SIDE',
              coverage: cfgHandle.coverage ?? (cfgHandle.handleLengthMm && cfgHandle.handleLengthMm >= 1000 ? 'FULL' : 'PIECE'),
              pieceLengthCm: cfgHandle.pieceLengthCm ?? (cfgHandle.handleLengthMm ? Math.round(cfgHandle.handleLengthMm / 10) : 40),
            }
          : {
              handleType: 'BAR_TUBULAR',
              position: initialPos,
              side: 'ONE_SIDE',
              coverage: 'FULL',
              pieceLengthCm: 40,
            };

        const w = DEFAULT_WIDTH;
        const h = DEFAULT_HEIGHT;
        const initialSelections = buildSelectionsForTemplate(defaultTemplate, w, h, alumColor, glassColor);
        const syncedSelections = syncHandleMaterialSelections(initialSelections, initialHandleConfig, h);

        setTemplate(defaultTemplate);
        setTemplateType(targetSvg);
        setWidthMm(w);
        setHeightMm(h);
        setQuantity(1);
        setOpeningDirection(dir);
        setAluminumColor(alumColor);
        setGlassFinish(glassColor);
        setLaborCost(defaultTemplate.laborCost || 0);
        setNotes('');
        setHandleConfig(initialHandleConfig);
        setMaterialSelections(syncedSelections);

        const cfgDrill = defaultTemplate.templateConfig?.drillingConfig;
        if (cfgDrill) {
          initDrilling({
            holeCount: cfgDrill.holeCount ?? 2,
            divisionType: cfgDrill.drillingMode === 'CUSTOM' ? 'CUSTOM_DISTANCE' : 'EQUAL',
            customDistancesMm: cfgDrill.customPositionsMm ?? [100, 500, 560, 100],
          });
        }

        resetNavigation();
      }
    }
  }, [
    isOpen,
    editingItem,
    templates,
    selectedProductId,
    buildSelectionsForTemplate,
    findCatalogMaterial,
    initDrilling,
    resetNavigation,
    setHandleConfig,
    setMaterialSelections,
  ]);

  const itemSubtotalEstimate = useMemo(() => {
    const qty = typeof quantity === 'number' && quantity > 0 ? quantity : 1;
    return calcItemSubtotal(materialSelections, laborCost ?? 0, qty);
  }, [materialSelections, quantity, laborCost]);

  const handleSubmit = useCallback(() => {
    if (!validateAllBeforeSubmit() || !template) return;

    const w = typeof widthMm === 'number' ? widthMm : 0;
    const h = typeof heightMm === 'number' ? heightMm : 0;
    const qty = typeof quantity === 'number' ? quantity : 0;
    const svgTemplateToSave = (templateType || template.templateType || 'SLIDING_DOOR_2F') as DoorTemplateType;

    const item: BudgetItem = {
      tempId: editingItem?.tempId ?? `item-${Date.now()}`,
      productId: template.id,
      productName: template.name,
      templateType: svgTemplateToSave,
      templateConfig: {
        templateType: svgTemplateToSave,
        aluminumColor,
        glassFinish,
        openingDirection,
        handleType: handleConfig.handleType,
        handleConfig,
        drillingConfig,
      },
      handleConfig,
      drillingConfig,
      widthMm: w,
      heightMm: h,
      quantity: qty,
      laborCost,
      options: materialSelections
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
      notes,
    };

    onAddItem(item);
    onClose();
  }, [
    validateAllBeforeSubmit,
    template,
    widthMm,
    heightMm,
    quantity,
    templateType,
    editingItem,
    aluminumColor,
    glassFinish,
    openingDirection,
    handleConfig,
    drillingConfig,
    laborCost,
    materialSelections,
    itemSubtotalEstimate,
    notes,
    onAddItem,
    onClose,
  ]);

  const svgW = typeof widthMm === 'number' && widthMm > 0 ? widthMm : DEFAULT_WIDTH;
  const svgH = typeof heightMm === 'number' && heightMm > 0 ? heightMm : DEFAULT_HEIGHT;
  const unitAreaM2 = ((svgW / 1000) * (svgH / 1000)).toFixed(2);
  const totalQty = typeof quantity === 'number' && quantity >= 1 ? quantity : 1;

  // Estado consolidado para compatibilidade com os steps existentes
  const state = useMemo(
    () => ({
      template,
      templateType,
      widthMm,
      heightMm,
      quantity,
      openingDirection,
      handleConfig,
      drillingConfig,
      aluminumColor,
      glassFinish,
      laborCost,
      notes,
      materialSelections,
    }),
    [
      template,
      templateType,
      widthMm,
      heightMm,
      quantity,
      openingDirection,
      handleConfig,
      drillingConfig,
      aluminumColor,
      glassFinish,
      laborCost,
      notes,
      materialSelections,
    ]
  );

  const setState = useCallback(
    (updater: React.SetStateAction<typeof state>) => {
      const next = typeof updater === 'function' ? updater(state) : updater;
      if (next.template !== undefined) setTemplate(next.template);
      if (next.templateType !== undefined) setTemplateType(next.templateType);
      if (next.widthMm !== undefined) setWidthMm(next.widthMm);
      if (next.heightMm !== undefined) setHeightMm(next.heightMm);
      if (next.quantity !== undefined) setQuantity(next.quantity);
      if (next.openingDirection !== undefined) setOpeningDirection(next.openingDirection);
      if (next.aluminumColor !== undefined) setAluminumColor(next.aluminumColor);
      if (next.glassFinish !== undefined) setGlassFinish(next.glassFinish);
      if (next.laborCost !== undefined) setLaborCost(next.laborCost);
      if (next.notes !== undefined) setNotes(next.notes);
      if (next.handleConfig !== undefined) setHandleConfig(next.handleConfig);
      if (next.drillingConfig !== undefined) setDrillingConfig(next.drillingConfig);
      if (next.materialSelections !== undefined) setMaterialSelections(next.materialSelections);
    },
    [state, setHandleConfig, setDrillingConfig, setMaterialSelections]
  );

  return {
    state,
    setState,
    errors,
    setErrors,
    currentStep,
    setCurrentStep,
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
    setHoleDistanceInputs,
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
