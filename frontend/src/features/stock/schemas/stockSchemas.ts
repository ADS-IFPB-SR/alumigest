import { z } from 'zod';

export const purchaseEntrySchema = z.object({
  materialId: z.string().min(1, 'Selecione o insumo que chegou'),
  quantity: z
    .number({ error: 'A quantidade recebida é obrigatória' })
    .positive('A quantidade recebida deve ser maior que zero'),
  unitCost: z
    .number({ error: 'O preço de compra unitário é obrigatório (RN-06)' })
    .positive('O preço de compra unitário deve ser maior que zero'),
  referenceDocument: z
    .string()
    .max(100, 'O número do documento deve ter no máximo 100 caracteres')
    .optional()
    .or(z.literal('')),
  supplier: z
    .string()
    .max(150, 'O fornecedor deve ter no máximo 150 caracteres')
    .optional()
    .or(z.literal('')),
  reason: z
    .string()
    .max(500, 'As observações devem ter no máximo 500 caracteres')
    .optional()
    .or(z.literal('')),
});

export type PurchaseEntryFormValues = z.infer<typeof purchaseEntrySchema>;

export const initialStockEntrySchema = z.object({
  quantity: z
    .number({ error: 'A quantidade recebida é obrigatória' })
    .positive('A quantidade recebida deve ser maior que zero'),
  unitCost: z
    .number({ error: 'O preço de compra unitário é obrigatório (RN-06)' })
    .positive('O preço de compra unitário deve ser maior que zero'),
  minimumStock: z
    .number({ error: 'Informe um número válido para o ponto de pedido' })
    .min(0, 'O ponto de pedido mínimo não pode ser negativo')
    .optional(),
  supplier: z
    .string()
    .max(150, 'O fornecedor deve ter no máximo 150 caracteres')
    .optional()
    .or(z.literal('')),
  referenceDocument: z
    .string()
    .max(100, 'O número do documento deve ter no máximo 100 caracteres')
    .optional()
    .or(z.literal('')),
  reason: z
    .string()
    .max(500, 'As observações devem ter no máximo 500 caracteres')
    .optional()
    .or(z.literal('')),
});

export type InitialStockFormValues = z.infer<typeof initialStockEntrySchema>;