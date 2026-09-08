import { z } from 'zod';

export const budgetItemSchema = z.object({
  productId: z.string().min(1, 'Produto inválido.'),
  quantity: z.number().min(1, 'A quantidade deve ser maior que zero.'),
  unitCost: z.number().min(0, 'Custo unitário inválido.'),
  unitSale: z.number().min(0, 'Venda unitária inválida.'),
  marginPercent: z.number().min(0, 'Margem inválida.'),
  subtotalCost: z.number().min(0),
  subtotalSale: z.number().min(0),
});

export const budgetFormSchema = z.object({
  customerId: z.string().min(1, 'Selecione um cliente para o orçamento.'),
  items: z.array(budgetItemSchema).min(1, 'Adicione ao menos um item ao orçamento.'),
  laborCost: z.number().min(0, 'Custo de mão de obra não pode ser negativo.'),
  discountPercent: z.number()
    .min(0, 'Desconto não pode ser negativo.')
    .max(100, 'Desconto não pode ser maior que 100%.'),
  notes: z.string().optional(),
  commercialConditions: z.string().optional(),
});

export type BudgetFormValues = z.infer<typeof budgetFormSchema>;
