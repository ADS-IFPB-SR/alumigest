import { z } from 'zod';

export const budgetItemSchema = z.object({
  productId: z.string().min(1, 'Produto inválido.'),
  quantity: z.number().min(1, 'A quantidade deve ser maior que zero.'),
  widthMm: z.number().min(1, 'Largura inválida.').optional(),
  heightMm: z.number().min(1, 'Altura inválida.').optional(),
}).passthrough();

export const budgetFormSchema = z.object({
  customerId: z.string().min(1, 'Selecione um cliente para o orçamento.'),
  items: z.array(budgetItemSchema).min(1, 'Adicione ao menos um item ao orçamento.'),
  laborCost: z.number().min(0, 'Custo de mão de obra não pode ser negativo.'),
  discountPercent: z.number()
    .min(0, 'Desconto não pode ser negativo.')
    .max(100, 'Desconto não pode ser maior que 100%.'),
  notes: z.string().optional().or(z.literal('')),
  commercialConditions: z.string().optional().or(z.literal('')),
  validUntil: z.string().optional().refine((val) => {
    if (!val) return true;
    const selected = new Date(`${val}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selected >= today;
  }, {
    message: 'A data de validade não pode ser anterior a hoje.',
  }),
});

export type BudgetFormValues = z.infer<typeof budgetFormSchema>;
