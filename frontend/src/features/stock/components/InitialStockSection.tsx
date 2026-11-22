import { useEffect, useState } from 'react';
import { PackageCheck } from 'lucide-react';
import { initialStockEntrySchema } from '../schemas/stockSchemas';
import type { InitialStockEntryRequest } from '../types';

export interface InitialStockDraft {
  quantity: string;
  unitCost: string;
  minimumStock: string;
  supplier: string;
  referenceDocument: string;
  reason: string;
}

export type InitialStockErrors = Partial<Record<keyof InitialStockDraft, string>>;

const EMPTY_DRAFT: InitialStockDraft = {
  quantity: '',
  unitCost: '',
  minimumStock: '0',
  supplier: '',
  referenceDocument: '',
  reason: '',
};

function parseOptionalNumber(raw: string): number {
  const trimmed = raw.trim();
  if (trimmed === '') return Number.NaN;
  const normalized = trimmed.includes(',')
    ? trimmed.replaceAll('.', '').replace(',', '.')
    : trimmed;
  return Number(normalized);
}

export function useInitialStockSection(isOpen: boolean, syncedCostPrice?: number) {
  const [enabled, setEnabled] = useState(false);
  const [draft, setDraft] = useState<InitialStockDraft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<InitialStockErrors>({});
  const [unitCostTouched, setUnitCostTouched] = useState(false);

  // Reseta o estado ao fechar/reabrir o modal
  useEffect(() => {
    if (!isOpen) {
      setEnabled(false);
      setDraft(EMPTY_DRAFT);
      setErrors({});
      setUnitCostTouched(false);
    }
  }, [isOpen]);

  // Sincroniza o preço de custo do material para o custo unitário de compra enquanto o usuário não editar manualmente
  useEffect(() => {
    if (
      enabled &&
      !unitCostTouched &&
      typeof syncedCostPrice === 'number' &&
      syncedCostPrice > 0
    ) {
      setDraft((prev) => ({
        ...prev,
        unitCost: syncedCostPrice.toFixed(2),
      }));
    }
  }, [enabled, syncedCostPrice, unitCostTouched]);

  const updateField = (field: keyof InitialStockDraft, value: string) => {
    if (field === 'unitCost') {
      setUnitCostTouched(true);
    }
    setDraft((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const toggleEnabled = (checked: boolean) => {
    setEnabled(checked);
    setErrors({});
  };

  /**
   * Valida os campos com Zod (RN-05 e RN-06).
   * Retorna:
   * - `{ valid: true, payload: null }` se o checkbox estiver desmarcado (auto-provisionamento zerado)
   * - `{ valid: true, payload: InitialStockEntryRequest }` se estiver marcado e válido
   * - `{ valid: false, payload: null }` se houver erro de validação
   */
  const validateAndBuildPayload = (): {
    valid: boolean;
    payload: InitialStockEntryRequest | null;
  } => {
    if (!enabled) {
      return { valid: true, payload: null };
    }

    const parsed = initialStockEntrySchema.safeParse({
      quantity: parseOptionalNumber(draft.quantity),
      unitCost: parseOptionalNumber(draft.unitCost),
      minimumStock:
        draft.minimumStock.trim() === ''
          ? 0
          : parseOptionalNumber(draft.minimumStock),
      supplier: draft.supplier,
      referenceDocument: draft.referenceDocument,
      reason: draft.reason,
    });

    if (!parsed.success) {
      const nextErrors: InitialStockErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof InitialStockDraft | undefined;
        if (key && !nextErrors[key]) {
          nextErrors[key] = issue.message;
        }
      }
      setErrors(nextErrors);
      return { valid: false, payload: null };
    }

    setErrors({});
    return {
      valid: true,
      payload: {
        quantity: parsed.data.quantity,
        unitCost: parsed.data.unitCost,
        minimumStock: parsed.data.minimumStock ?? 0,
        supplier: parsed.data.supplier?.trim() || undefined,
        referenceDocument: parsed.data.referenceDocument?.trim() || undefined,
        reason:
          parsed.data.reason?.trim() || 'Entrada inicial no cadastro do material',
      },
    };
  };

  return {
    enabled,
    draft,
    errors,
    toggleEnabled,
    updateField,
    validateAndBuildPayload,
  };
}

interface InitialStockSectionProps {
  readonly enabled: boolean;
  readonly draft: InitialStockDraft;
  readonly errors: InitialStockErrors;
  readonly unitLabel: string;
  readonly onToggle: (checked: boolean) => void;
  readonly onChangeField: (field: keyof InitialStockDraft, value: string) => void;
}

export function InitialStockSection({
  enabled,
  draft,
  errors,
  unitLabel,
  onToggle,
  onChangeField,
}: Readonly<InitialStockSectionProps>) {
  return (
    <div className="col-span-1 md:col-span-2 mt-xs rounded-xl border border-blue-200 bg-blue-50/60 p-4 dark:border-blue-500/30 dark:bg-blue-950/25 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white">
            <PackageCheck className="h-4 w-4" />
          </div>
          <div>
            <label
              htmlFor="initial-stock-toggle"
              className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-200 cursor-pointer"
            >
              Dar entrada inicial no estoque
            </label>
            <p className="text-[11px] text-on-surface-variant">
              Fluxo 2 em 1: cadastra o material e já lança o lote inicial no Kardex
            </p>
          </div>
        </div>

        <input
          id="initial-stock-toggle"
          data-cy="initial-stock-toggle"
          type="checkbox"
          checked={enabled}
          onChange={(e) => onToggle(e.target.checked)}
          className="h-4 w-4 rounded border-outline text-primary focus:ring-primary cursor-pointer"
        />
      </div>

      {enabled && (
        <div className="space-y-3 border-t border-blue-200/70 pt-3 dark:border-blue-500/20">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <label
                htmlFor="initial-stock-quantity"
                className="text-xs font-bold text-on-surface"
              >
                Quantidade Recebida ({unitLabel}) *
              </label>
              <input
                id="initial-stock-quantity"
                data-cy="initial-stock-quantity"
                type="number"
                step="any"
                min="0"
                placeholder="Ex: 10"
                value={draft.quantity}
                onChange={(e) => onChangeField('quantity', e.target.value)}
                className="w-full rounded-lg border border-outline bg-surface px-3 py-1.5 font-mono text-xs font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.quantity && (
                <p className="text-xs text-rose-500">{errors.quantity}</p>
              )}
            </div>

            <div className="space-y-1">
              <label
                htmlFor="initial-stock-unitCost"
                className="text-xs font-bold text-on-surface"
              >
                Preço de Compra Unit. (R$) *
              </label>
              <input
                id="initial-stock-unitCost"
                data-cy="initial-stock-unit-cost"
                type="number"
                step="0.01"
                min="0"
                placeholder="Ex: 145.00"
                value={draft.unitCost}
                onChange={(e) => onChangeField('unitCost', e.target.value)}
                className="w-full rounded-lg border border-outline bg-surface px-3 py-1.5 font-mono text-xs font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.unitCost && (
                <p className="text-xs text-rose-500">{errors.unitCost}</p>
              )}
            </div>

            <div className="space-y-1">
              <label
                htmlFor="initial-stock-minimumStock"
                className="text-xs font-bold text-on-surface"
              >
                Ponto de Pedido (Mínimo)
              </label>
              <input
                id="initial-stock-minimumStock"
                data-cy="initial-stock-minimum"
                type="number"
                step="any"
                min="0"
                placeholder="Ex: 4"
                value={draft.minimumStock}
                onChange={(e) => onChangeField('minimumStock', e.target.value)}
                className="w-full rounded-lg border border-outline bg-surface px-3 py-1.5 font-mono text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.minimumStock && (
                <p className="text-xs text-rose-500">{errors.minimumStock}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label
                htmlFor="initial-stock-supplier"
                className="text-xs font-bold text-on-surface"
              >
                Fornecedor / Distribuidora
              </label>
              <input
                id="initial-stock-supplier"
                data-cy="initial-stock-supplier"
                type="text"
                placeholder="Ex: Distribuidora Asa"
                value={draft.supplier}
                onChange={(e) => onChangeField('supplier', e.target.value)}
                className="w-full rounded-lg border border-outline bg-surface px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.supplier && (
                <p className="text-xs text-rose-500">{errors.supplier}</p>
              )}
            </div>

            <div className="space-y-1">
              <label
                htmlFor="initial-stock-referenceDocument"
                className="text-xs font-bold text-on-surface"
              >
                Nº do Pedido / Recibo / NF
              </label>
              <input
                id="initial-stock-referenceDocument"
                data-cy="initial-stock-document"
                type="text"
                placeholder="Ex: Pedido 1088, Recibo 450"
                value={draft.referenceDocument}
                onChange={(e) => onChangeField('referenceDocument', e.target.value)}
                className="w-full rounded-lg border border-outline bg-surface px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <p className="text-[10px] text-on-surface-variant">
                Documento livre (RN-05): aceita código de pedido ou recibo.
              </p>
              {errors.referenceDocument && (
                <p className="text-xs text-rose-500">{errors.referenceDocument}</p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="initial-stock-reason"
              className="text-xs font-bold text-on-surface"
            >
              Observações da Entrada
            </label>
            <input
              id="initial-stock-reason"
              data-cy="initial-stock-reason"
              type="text"
              placeholder="Ex: Entrada inicial no cadastro do material"
              value={draft.reason}
              onChange={(e) => onChangeField('reason', e.target.value)}
              className="w-full rounded-lg border border-outline bg-surface px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {errors.reason && (
              <p className="text-xs text-rose-500">{errors.reason}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}