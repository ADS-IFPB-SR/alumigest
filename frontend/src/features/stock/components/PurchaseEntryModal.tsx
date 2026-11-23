import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, PackagePlus, X } from 'lucide-react';
import { useRegisterStockMovement } from '../hooks/useStock';
import { purchaseEntrySchema, type PurchaseEntryFormValues } from '../schemas/stockSchemas';
import type { StockItem } from '../types';

interface PurchaseEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  stockItems: StockItem[];
  defaultMaterialId?: string;
  onRequestNewMaterial?: () => void;
}

export function PurchaseEntryModal({
  isOpen,
  onClose,
  stockItems,
  defaultMaterialId,
  onRequestNewMaterial,
}: Readonly<PurchaseEntryModalProps>) {
  const { mutate: registerMovement, isPending } = useRegisterStockMovement();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PurchaseEntryFormValues>({
    resolver: zodResolver(purchaseEntrySchema),
    defaultValues: {
      materialId: defaultMaterialId ?? '',
      quantity: undefined,
      unitCost: undefined,
      referenceDocument: '',
      supplier: '',
      reason: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        materialId: defaultMaterialId ?? '',
        quantity: undefined,
        unitCost: undefined,
        referenceDocument: '',
        supplier: '',
        reason: '',
      });
    }
  }, [isOpen, defaultMaterialId, reset]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const onSubmit = (values: PurchaseEntryFormValues) => {
    registerMovement(
      {
        materialId: values.materialId,
        type: 'PURCHASE_ENTRY',
        quantity: values.quantity,
        unitCost: values.unitCost,
        referenceDocument: values.referenceDocument?.trim() || undefined,
        supplier: values.supplier?.trim() || undefined,
        reason: values.reason?.trim() || undefined,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <dialog
      open
      aria-modal="true"
      aria-labelledby="purchase-entry-modal-title"
      className="fixed inset-0 z-50 m-0 flex h-full w-full max-h-none max-w-none items-center justify-center border-0 bg-transparent p-4"
    >
      <button
        type="button"
        className="fixed inset-0 h-full w-full bg-black/50 backdrop-blur-sm border-0 cursor-default"
        onClick={onClose}
        tabIndex={-1}
        aria-label="Fechar fundo do modal"
      />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low p-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              <PackagePlus className="h-5 w-5" />
            </div>
            <div>
              <h3 id="purchase-entry-modal-title" className="text-base font-bold text-on-surface">
                Registrar Entrada / Compra
              </h3>
              <p className="text-xs text-on-surface-variant">
                Alimente o saldo físico com o recibo, pedido ou NF da loja
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal de entrada de compras"
            className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-5" noValidate>
          {/* Seleção do Insumo */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label
                htmlFor="purchase-materialId"
                className="text-xs font-bold uppercase text-on-surface-variant"
              >
                Insumo que Chegou *
              </label>
              {onRequestNewMaterial && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onRequestNewMaterial();
                  }}
                  className="text-[11px] font-bold text-blue-600 hover:underline dark:text-blue-400"
                >
                  + Não encontrou? Cadastrar Novo
                </button>
              )}
            </div>
            <select
              id="purchase-materialId"
              {...register('materialId')}
              className="w-full rounded-xl border border-outline bg-surface px-3 py-2 text-xs font-medium text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Selecione um material do catálogo...</option>
              {stockItems.map((item) => {
                const balanceLabel =
                  item.availableQuantity < 0
                    ? `Faltam ${Math.abs(item.availableQuantity)} ${item.unitMeasure}`
                    : `Disponível: ${item.availableQuantity} ${item.unitMeasure}`;
                return (
                  <option key={item.materialId} value={item.materialId}>
                    {item.materialSku} — {item.materialName} ({balanceLabel})
                  </option>
                );
              })}
            </select>
            {errors.materialId && (
              <p className="text-xs text-rose-500">{errors.materialId.message}</p>
            )}
          </div>

          {/* Quantidade + Preço Unitário (RN-06) */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label
                htmlFor="purchase-quantity"
                className="text-xs font-bold uppercase text-on-surface-variant"
              >
                Quantidade Recebida *
              </label>
              <input
                id="purchase-quantity"
                type="number"
                step="any"
                min="0"
                placeholder="Ex: 10"
                {...register('quantity', { valueAsNumber: true })}
                className="w-full rounded-xl border border-outline bg-surface px-3 py-2 font-mono text-xs font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.quantity && (
                <p className="text-xs text-rose-500">{errors.quantity.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label
                htmlFor="purchase-unitCost"
                className="text-xs font-bold uppercase text-on-surface-variant"
              >
                Preço de Compra Unitário (R$) *
              </label>
              <input
                id="purchase-unitCost"
                type="number"
                step="0.01"
                min="0"
                placeholder="Ex: 145.00"
                {...register('unitCost', { valueAsNumber: true })}
                className="w-full rounded-xl border border-outline bg-surface px-3 py-2 font-mono text-xs font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.unitCost && (
                <p className="text-xs text-rose-500">{errors.unitCost.message}</p>
              )}
            </div>
          </div>

          {/* Documento Livre (RN-05) + Fornecedor */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label
                htmlFor="purchase-referenceDocument"
                className="text-xs font-bold uppercase text-on-surface-variant"
              >
                Nº do Pedido / Recibo / NF
              </label>
              <input
                id="purchase-referenceDocument"
                type="text"
                placeholder="Ex: Pedido 1088, Recibo 450"
                {...register('referenceDocument')}
                className="w-full rounded-xl border border-outline bg-surface px-3 py-2 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <p className="text-[10px] text-on-surface-variant">
                Documento livre: não exige chave SEFAZ de 44 dígitos.
              </p>
              {errors.referenceDocument && (
                <p className="text-xs text-rose-500">{errors.referenceDocument.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label
                htmlFor="purchase-supplier"
                className="text-xs font-bold uppercase text-on-surface-variant"
              >
                Fornecedor / Distribuidora
              </label>
              <input
                id="purchase-supplier"
                type="text"
                placeholder="Ex: Distribuidora Asa"
                {...register('supplier')}
                className="w-full rounded-xl border border-outline bg-surface px-3 py-2 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.supplier && (
                <p className="text-xs text-rose-500">{errors.supplier.message}</p>
              )}
            </div>
          </div>

          {/* Justificativa / Observações */}
          <div className="space-y-1">
            <label
              htmlFor="purchase-reason"
              className="text-xs font-bold uppercase text-on-surface-variant"
            >
              Justificativa / Observações
            </label>
            <textarea
              id="purchase-reason"
              rows={2}
              placeholder="Ex: Reposição de lote para O.S. da semana"
              {...register('reason')}
              className="w-full rounded-xl border border-outline bg-surface px-3 py-2 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {errors.reason && <p className="text-xs text-rose-500">{errors.reason.message}</p>}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 border-t border-outline-variant pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-on-surface-variant hover:bg-surface-container transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirmar Entrada no Kardex
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}