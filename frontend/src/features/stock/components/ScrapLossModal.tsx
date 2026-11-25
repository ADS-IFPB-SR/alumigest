import React, { useEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, AlertOctagon, X, Package, Hash, FileText, CheckCircle2 } from 'lucide-react';
import { useRegisterStockMovement, useStockBalances } from '../hooks/useStock';
import { scrapLossSchema, type ScrapLossFormData } from '../schemas/stockSchema';
import type { StockItem, StockMovementRequest } from '../types';

export interface ScrapLossModalProps {
  isOpen: boolean;
  onClose: () => void;
  materialId?: string;
  materialSku?: string;
  materialName?: string;
  unitMeasure?: string;
  currentPhysical?: number;
  currentReserved?: number;
  onSuccess?: () => void;
  /** Callback opcional customizado para sobrescrever a mutação padrão (ideal para testes ou orquestrações externas) */
  onConfirm?: (payload: StockMovementRequest) => Promise<void> | void;
}

const COMMON_REASON_PRESETS = [
  'Erro de corte na bancada',
  'Quebra no transporte',
  'Retalho inutilizável',
  'Defeito de fabricação',
  'Dano por manuseio na usinagem',
] as const;

function resolveMaterialSnapshot(
  props: Pick<
    ScrapLossModalProps,
    | 'materialId'
    | 'materialSku'
    | 'materialName'
    | 'unitMeasure'
    | 'currentPhysical'
    | 'currentReserved'
  >,
  selectedStockItem?: StockItem
) {
  if (props.materialId) {
    return {
      hasMaterialSelected: true,
      effectiveMaterialId: props.materialId,
      effectiveSku: props.materialSku ?? 'N/A',
      effectiveName: props.materialName ?? 'Material não especificado',
      effectiveUnit: props.unitMeasure ?? 'UN',
      effectivePhysical: props.currentPhysical ?? 0,
      effectiveReserved: props.currentReserved ?? 0,
    };
  }

  return {
    hasMaterialSelected: Boolean(selectedStockItem),
    effectiveMaterialId: selectedStockItem?.materialId ?? '',
    effectiveSku: selectedStockItem?.materialSku ?? 'N/A',
    effectiveName: selectedStockItem?.materialName ?? 'Selecione um insumo abaixo',
    effectiveUnit: selectedStockItem?.unitMeasure ?? 'UN',
    effectivePhysical: selectedStockItem?.physicalQuantity ?? 0,
    effectiveReserved: selectedStockItem?.reservedQuantity ?? 0,
  };
}

function getSelectPlaceholder(isLoading: boolean, isError: boolean, totalItems: number): string {
  if (isLoading) return 'Carregando insumos em estoque...';
  if (isError) return 'Erro ao carregar insumos';
  if (totalItems === 0) return 'Nenhum insumo cadastrado em estoque';
  return 'Selecione um insumo em estoque...';
}

function getQuantityBorderClass(hasError: boolean, isExceedingStock: boolean): string {
  if (hasError) return 'border-rose-500 focus:ring-rose-500/20';
  if (isExceedingStock) return 'border-amber-500 focus:ring-amber-500/20';
  return 'border-outline-variant focus:ring-primary/20 focus:border-primary';
}

export const ScrapLossModal: React.FC<ScrapLossModalProps> = ({
  isOpen,
  onClose,
  materialId = '',
  materialSku = 'N/A',
  materialName = 'Material não especificado',
  unitMeasure = 'UN',
  currentPhysical = 0,
  currentReserved = 0,
  onSuccess,
  onConfirm,
}) => {
  const registerMovementMutation = useRegisterStockMovement();

  const isSelectionMode = !materialId;
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('');
  const [materialError, setMaterialError] = useState<string | null>(null);

  const {
    data: stockBalances = [],
    isLoading: isLoadingBalances,
    isError: isErrorBalances,
    refetch: refetchBalances,
  } = useStockBalances(undefined, {
    enabled: isOpen && isSelectionMode,
  });

  const selectedStockItem = isSelectionMode
    ? stockBalances.find((item) => item.materialId === selectedMaterialId)
    : undefined;

  const {
    hasMaterialSelected,
    effectiveMaterialId,
    effectiveSku,
    effectiveName,
    effectiveUnit,
    effectivePhysical,
    effectiveReserved,
  } = resolveMaterialSnapshot(
    { materialId, materialSku, materialName, unitMeasure, currentPhysical, currentReserved },
    selectedStockItem
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm({
    resolver: zodResolver(scrapLossSchema),
    defaultValues: {
      quantity: undefined,
      reason: '',
      referenceDocument: '',
      registeredBy: 'Oficina / Fábrica',
    },
  });

  const isSubmitting = registerMovementMutation.isPending || isFormSubmitting;
  const watchedQuantity = watch('quantity');
  const watchedReason = watch('reason');

  const numQuantity = Number(watchedQuantity);
  const isExceedingStock =
    hasMaterialSelected &&
    !Number.isNaN(numQuantity) &&
    numQuantity > 0 &&
    numQuantity > effectivePhysical;

  const quantityBorderClass = getQuantityBorderClass(Boolean(errors.quantity), isExceedingStock);
  const selectPlaceholder = getSelectPlaceholder(
    isLoadingBalances,
    isErrorBalances,
    stockBalances.length
  );

  const handleClose = useCallback(() => {
    if (isSubmitting) return;
    reset();
    setSelectedMaterialId('');
    setMaterialError(null);
    onClose();
  }, [isSubmitting, reset, onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const handlePresetClick = (preset: string) => {
    setValue('reason', preset, { shouldValidate: true, shouldDirty: true });
  };

  const onSubmit = async (data: ScrapLossFormData) => {
    if (!effectiveMaterialId) {
      setMaterialError('Selecione o insumo para registrar a perda.');
      return;
    }

    const payload: StockMovementRequest = {
      materialId: effectiveMaterialId,
      type: 'SCRAP_LOSS',
      quantity: data.quantity,
      reason: data.reason,
      referenceDocument: data.referenceDocument || undefined,
      registeredBy: data.registeredBy || 'Oficina / Fábrica',
    };

    try {
      if (onConfirm) {
        await onConfirm(payload);
      } else {
        await registerMovementMutation.mutateAsync(payload);
      }
      reset();
      setSelectedMaterialId('');
      setMaterialError(null);
      onSuccess?.();
      onClose();
    } catch {
      // O erro já é tratado pelo hook react-query / toast ou pelo caller
    }
  };

  return createPortal(
    <dialog
      open
      className="fixed inset-0 z-[9999] m-0 w-full h-full max-w-none max-h-none border-0 bg-transparent flex items-center justify-center p-4 animate-fadeIn"
      data-testid="modal-scrap-loss"
      aria-modal="true"
      aria-labelledby="scrap-loss-title"
    >
      {/* Backdrop */}
      <button
        type="button"
        className="fixed inset-0 w-full h-full bg-black/70 backdrop-blur-xs transition-opacity cursor-default border-0 disabled:cursor-not-allowed"
        onClick={handleClose}
        disabled={isSubmitting}
        tabIndex={-1}
        aria-label="Fechar fundo do modal de perdas"
      />

      {/* Modal Container */}
      <div className="relative bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant bg-surface-container-high/30">
          <div className="flex items-center gap-2.5 text-rose-600 font-semibold text-lg" id="scrap-loss-title">
            <div className="p-2 bg-rose-500/10 rounded-lg text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-on-surface">Registrar Perda / Sucata</h2>
              <p className="text-xs font-normal text-on-surface-variant">Baixa física manual com justificativa formal</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-on-surface-variant hover:text-on-surface p-1.5 rounded-lg hover:bg-surface-container-high transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Fechar modal"
            data-testid="btn-scrap-close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Seleção ou Card Informativo do Material */}
        <div className="px-6 pt-5 pb-1 space-y-3">
          {isSelectionMode && (
            <div>
              <label
                htmlFor="scrap-material-select"
                className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1"
              >
                Insumo / Material *
              </label>
              <select
                id="scrap-material-select"
                value={selectedMaterialId}
                disabled={isSubmitting || isLoadingBalances}
                data-testid="select-scrap-material"
                onChange={(e) => {
                  setSelectedMaterialId(e.target.value);
                  if (e.target.value) setMaterialError(null);
                }}
                className={`w-full px-3 py-2 text-sm rounded-lg border bg-surface-container-lowest text-on-surface focus:outline-hidden focus:ring-2 transition-all disabled:opacity-60 ${
                  materialError || isErrorBalances
                    ? 'border-rose-500 focus:ring-rose-500/20'
                    : 'border-outline-variant focus:ring-primary/20 focus:border-primary'
                }`}
              >
                <option value="">{selectPlaceholder}</option>
                {stockBalances.map((item) => (
                  <option key={item.materialId} value={item.materialId}>
                    {item.materialSku} — {item.materialName} (Saldo: {item.physicalQuantity} {item.unitMeasure})
                  </option>
                ))}
              </select>
              {isErrorBalances && (
                <div
                  className="mt-1.5 flex items-center justify-between gap-2 text-xs text-rose-600 font-medium"
                  data-testid="select-scrap-error"
                >
                  <span className="flex items-center gap-1">
                    <AlertOctagon className="w-3.5 h-3.5 shrink-0" />
                    Não foi possível carregar os insumos em estoque.
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      void refetchBalances();
                    }}
                    data-testid="btn-retry-balances"
                    className="underline hover:text-rose-700 font-semibold shrink-0"
                  >
                    Tentar novamente
                  </button>
                </div>
              )}
              {materialError && (
                <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                  <AlertOctagon className="w-3.5 h-3.5" />
                  {materialError}
                </p>
              )}
            </div>
          )}

          <div className="p-3.5 bg-surface-container rounded-xl border border-outline-variant/60 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-primary shrink-0" />
                <span className="font-semibold text-sm text-on-surface line-clamp-1">
                  {effectiveName}
                </span>
              </div>
              <span className="px-2 py-0.5 text-xs font-mono font-medium rounded-md bg-surface-container-highest text-on-surface-variant border border-outline-variant">
                SKU: {effectiveSku}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-on-surface-variant pt-1 border-t border-outline-variant/40">
              <div>
                Saldo Físico Atual:{' '}
                <strong className="text-on-surface font-semibold">
                  {effectivePhysical} {effectiveUnit}
                </strong>
              </div>
              {effectiveReserved > 0 && (
                <div>
                  Reservado:{' '}
                  <strong className="text-amber-600 font-semibold">
                    {effectiveReserved} {effectiveUnit}
                  </strong>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Formulário */}
        <form noValidate onSubmit={handleSubmit(onSubmit)} className="px-6 py-4 space-y-4">
          {/* Campo Quantidade */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="scrap-quantity"
                className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant"
              >
                Quantidade da Perda ({effectiveUnit}) *
              </label>
              <span className="text-xs text-on-surface-variant/80">
                {hasMaterialSelected
                  ? `Máximo sugerido: ${effectivePhysical} ${effectiveUnit}`
                  : 'Aguardando seleção de insumo'}
              </span>
            </div>
            <div className="relative">
              <input
                id="scrap-quantity"
                type="number"
                step="any"
                min="0.001"
                placeholder="Ex: 1.5"
                disabled={isSubmitting}
                data-testid="input-scrap-quantity"
                className={`w-full px-3.5 py-2 text-sm rounded-lg border bg-surface-container-lowest text-on-surface focus:outline-hidden focus:ring-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${quantityBorderClass}`}
                {...register('quantity')}
              />
            </div>
            {errors.quantity && (
              <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                <AlertOctagon className="w-3.5 h-3.5" />
                {errors.quantity.message}
              </p>
            )}
            {isExceedingStock && !errors.quantity && (
              <p className="text-xs text-amber-600 mt-1 font-medium flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                Atenção: A quantidade informada ({numQuantity}) é maior que o saldo físico em estoque ({effectivePhysical}). A operação será rejeitada pelo servidor (RN-03).
              </p>
            )}
          </div>

          {/* Presets Rápidos de Justificativa */}
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
              Motivos Frequentes de Oficina (Clique para preencher)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_REASON_PRESETS.map((preset, index) => {
                const isSelected = watchedReason === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handlePresetClick(preset)}
                    data-testid={`preset-chip-${index}`}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors flex items-center gap-1 disabled:opacity-50 ${
                      isSelected
                        ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                        : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant border-outline-variant/60'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-3 h-3 text-rose-600" />}
                    {preset}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Campo Justificativa */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="scrap-reason"
                className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant"
              >
                Justificativa Obrigatória *
              </label>
              <span className="text-xs text-on-surface-variant/80">
                Mínimo 5 caracteres
              </span>
            </div>
            <textarea
              id="scrap-reason"
              rows={3}
              placeholder="Descreva a causa detalhada da perda ou avaria do material..."
              disabled={isSubmitting}
              data-testid="textarea-scrap-reason"
              className={`w-full px-3 py-2 text-sm rounded-lg border bg-surface-container-lowest text-on-surface focus:outline-hidden focus:ring-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                errors.reason
                  ? 'border-rose-500 focus:ring-rose-500/20'
                  : 'border-outline-variant focus:ring-primary/20 focus:border-primary'
              }`}
              {...register('reason')}
            />
            {errors.reason && (
              <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                <AlertOctagon className="w-3.5 h-3.5" />
                {errors.reason.message}
              </p>
            )}
          </div>

          {/* Grid de Campos Secundários (Doc de Referência & Responsável) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label
                htmlFor="scrap-reference-doc"
                className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1 flex items-center gap-1"
              >
                <FileText className="w-3 h-3 text-on-surface-variant" />
                Doc. Referência (Opcional)
              </label>
              <input
                id="scrap-reference-doc"
                type="text"
                autoComplete="off"
                placeholder="Ex: OS-2026-0042 ou LAUDO"
                disabled={isSubmitting}
                data-testid="input-scrap-doc"
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                {...register('referenceDocument')}
              />
            </div>

            <div>
              <label
                htmlFor="scrap-registered-by"
                className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1 flex items-center gap-1"
              >
                <Hash className="w-3 h-3 text-on-surface-variant" />
                Operador / Setor
              </label>
              <input
                id="scrap-registered-by"
                type="text"
                autoComplete="off"
                placeholder="Oficina / Fábrica"
                disabled={isSubmitting}
                data-testid="input-scrap-operator"
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                {...register('registeredBy')}
              />
            </div>
          </div>

          {/* Rodapé / Botões de Ação */}
          <div className="flex justify-end items-center gap-3 pt-4 border-t border-outline-variant">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              data-testid="btn-scrap-cancel"
              className="px-4 py-2 text-sm font-medium text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              data-testid="btn-scrap-submit"
              className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-lg shadow-xs transition-colors flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Registrando...</span>
                </>
              ) : (
                <span>Confirmar Perda</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </dialog>,
    document.body
  );
};
