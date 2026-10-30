import { z } from 'zod';

export const partSaleItemSchema = z.object({
  materialType: z.enum(['GLASS', 'PROFILE', 'FILM', 'HARDWARE']),
  referenceId: z.uuid({ message: 'Selecione um material válido do catálogo' }),
  description: z.string().min(2, { message: 'Descrição do material deve ter pelo menos 2 caracteres' }),
  quantity: z.number().int().positive({ message: 'Quantidade deve ser um número inteiro positivo' }),
  widthMm: z.number().positive({ message: 'Largura deve ser positiva' }).nullable().optional(),
  heightMm: z.number().positive({ message: 'Altura deve ser positiva' }).nullable().optional(),
  linearMeters: z.number().positive({ message: 'Comprimento linear deve ser positivo' }).nullable().optional(),
  unitPrice: z.number().min(0, { message: 'Preço unitário não pode ser negativo' }),
  notes: z.string().max(255).nullable().optional(),
}).superRefine((data, ctx) => {
  if (data.materialType === 'GLASS' || data.materialType === 'FILM') {
    if (!data.widthMm || data.widthMm <= 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['widthMm'],
        message: 'Largura é obrigatória para vidro e película',
      });
    }
    if (!data.heightMm || data.heightMm <= 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['heightMm'],
        message: 'Altura é obrigatória para vidro e película',
      });
    }
  }
});

export const partSaleFormSchema = z.object({
  clientId: z.uuid({ message: 'Selecione um cliente válido' }),
  status: z.enum(['DRAFT', 'APPROVED', 'CANCELLED']).default('DRAFT'),
  discountAmount: z.number().min(0, { message: 'Desconto não pode ser negativo' }).default(0),
  items: z.array(partSaleItemSchema).min(1, { message: 'Insira pelo menos um item na venda avulsa' }),
});

export type PartSaleItemFormData = z.infer<typeof partSaleItemSchema>;
export type PartSaleFormData = z.infer<typeof partSaleFormSchema>;
