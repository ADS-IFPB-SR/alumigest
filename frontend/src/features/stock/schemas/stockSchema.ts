import { z } from 'zod';

export const scrapLossSchema = z.object({
  quantity: z.coerce
    .number({ message: 'Informe uma quantidade numérica válida' })
    .positive('A quantidade deve ser estritamente maior que zero'),
  reason: z
    .string()
    .trim()
    .min(5, 'A justificativa da perda deve conter pelo menos 5 caracteres'),
  referenceDocument: z.string().trim().optional(),
  registeredBy: z.string().trim().optional(),
});

export type ScrapLossFormData = z.infer<typeof scrapLossSchema>;
