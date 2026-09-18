import { z } from 'zod';

export const DiscountTypeEnum = z.enum(['PERCENTUAL', 'VALOR_FIXO'] as const, {
  message: 'Selecione um tipo de desconto válido.',
});

export const PaymentConditionEnum = z.enum([
  'A_VISTA_PIX',
  'ENTRADA_50_SALDO_ENTREGA',
  'CARTAO_12X',
  'A_COMBINAR',
] as const, {
  message: 'Selecione uma condição de pagamento válida.',
});

/**
 * Cria o schema de validação para aplicação de descontos e condições comerciais.
 * @param totalBudget Subtotal bruto opcional para validar que o desconto fixo não exceda o total da proposta.
 */
export function createDiscountSchema(totalBudget?: number) {
  return z
    .object({
      discountType: DiscountTypeEnum,
      discountValue: z.coerce
        .number({ message: 'Informe um valor numérico para o desconto.' })
        .min(0, 'O valor do desconto não pode ser negativo.'),
      paymentCondition: PaymentConditionEnum,
      paymentNotes: z
        .string()
        .max(500, 'As observações de pagamento não podem exceder 500 caracteres.')
        .optional()
        .or(z.literal('')),
      validUntil: z
        .string()
        .optional()
        .or(z.literal(''))
        .refine((val) => {
          if (!val) return true;
          const selected = new Date(`${val}T00:00:00`);
          if (Number.isNaN(selected.getTime())) return false;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return selected >= today;
        }, {
          message: 'A data de validade não pode ser anterior a hoje.',
        }),
    })
    .superRefine((data, ctx) => {
      if (data.discountType === 'PERCENTUAL') {
        if (data.discountValue > 100) {
          ctx.addIssue({
            code: 'custom',
            path: ['discountValue'],
            message: 'O desconto percentual não pode ser maior que 100%.',
          });
        }
      } else if (data.discountType === 'VALOR_FIXO') {
        if (typeof totalBudget === 'number' && totalBudget >= 0 && data.discountValue > totalBudget) {
          ctx.addIssue({
            code: 'custom',
            path: ['discountValue'],
            message: `O desconto fixo não pode ser superior ao valor total do orçamento (R$ ${totalBudget.toFixed(2)}).`,
          });
        }
      }
    });
}

/**
 * Schema padrão de descontos e condições comerciais para formulários React Hook Form.
 */
export const discountSchema = createDiscountSchema();

export type DiscountFormValues = z.infer<typeof discountSchema>;
