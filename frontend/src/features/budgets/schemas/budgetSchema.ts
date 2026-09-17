import { z } from 'zod';

// ─── 1. Schema do Item ──────────────────────────────────────────────────────
export const budgetItemSchema = z.object({
  productId: z.string().min(1, 'Produto inválido.'),
  quantity: z.number().min(1, 'A quantidade deve ser maior que zero.'),
  widthMm: z.number().min(1, 'Largura inválida.').optional(),
  heightMm: z.number().min(1, 'Altura inválida.').optional(),
}).passthrough();

// ─── 2. Enums Alinhados com os Contratos e Componentes ─────────────────────────────
export const DiscountTypeEnum = z.enum([
  'PERCENTUAL',
  'VALOR_FIXO',
  'PERCENTAGE',
  'FIXED',
] as const, {
  message: 'Selecione um tipo de desconto válido.',
});

export const PaymentConditionEnum = z.enum([
  'A_VISTA_PIX',
  'ENTRADA_50_SALDO_ENTREGA',
  'CARTAO_12X',
  'A_COMBINAR',
  'CASH',
  'HALF_HALF',
  'CREDIT_CARD',
  'CUSTOM',
  '',
] as const, {
  message: 'Selecione uma condição de pagamento válida.',
});

// ─── 3. Schema Completo do Formulário (Dinâmico) ─────────────────────────────
/**
 * Cria o schema de validação do orçamento.
 * @param subtotal Opcional: Subtotal bruto usado para impedir que o desconto fixo (R$) supere o valor da proposta.
 */
export function createBudgetFormSchema(subtotal: number = 0) {
  return z.object({
    customerId: z.string().min(1, 'Selecione um cliente para o orçamento.'),
    items: z.array(budgetItemSchema).min(1, 'Adicione ao menos um item ao orçamento.'),
    laborCost: z.coerce.number().min(0, 'Custo de mão de obra não pode ser negativo.'),
    
    // Condições Comerciais & Descontos
    discountType: DiscountTypeEnum.optional().default('PERCENTUAL'),
    discountInput: z.coerce
      .number({ message: 'Informe um valor numérico para o desconto.' })
      .min(0, 'O valor do desconto não pode ser negativo.')
      .optional()
      .default(0),
    discountPercent: z.coerce.number().min(0).max(100).optional(),
      
    paymentCondition: z.string().optional().or(z.literal('')),
    
    commercialConditions: z.string()
      .max(500, 'Os detalhes do pagamento não podem exceder 500 caracteres.')
      .optional()
      .or(z.literal('')),
      
    notes: z.string().optional().or(z.literal('')),
    
    validUntil: z.string().optional().or(z.literal('')).refine((val) => {
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
  // Validações Interdependentes (Super Refine)
  .superRefine((data, ctx) => {
    const isPercent = data.discountType === 'PERCENTUAL' || data.discountType === 'PERCENTAGE';
    const discountVal = data.discountInput ?? 0;

    // Regra 1: Desconto Percentual não passa de 100%
    if (isPercent && discountVal > 100) {
      ctx.addIssue({
        code: 'custom',
        path: ['discountInput'],
        message: 'O desconto percentual não pode ser maior que 100%.',
      });
    } 
    // Regra 2: Desconto Fixo não passa do Subtotal
    else if (!isPercent) {
      if (subtotal > 0 && discountVal > subtotal) {
        ctx.addIssue({
          code: 'custom',
          path: ['discountInput'],
          message: `O desconto fixo não pode ser superior ao subtotal (R$ ${subtotal.toFixed(2)}).`,
        });
      }
    }
  });
}

// ─── 4. Exportação Padrão (Tipagem) ──────────────────────────────────────────
export const budgetFormSchema = createBudgetFormSchema(0);

export type BudgetFormValues = z.infer<typeof budgetFormSchema>;