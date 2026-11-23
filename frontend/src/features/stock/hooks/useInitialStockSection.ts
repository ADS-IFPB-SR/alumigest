import { useEffect, useState } from 'react';
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
