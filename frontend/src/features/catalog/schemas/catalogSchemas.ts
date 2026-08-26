import { z } from 'zod';
import { parseCurrencyString } from '../../../utils/formatters';

const basePriceRefinement = (data: { costPrice: string; salePrice: string }, ctx: z.RefinementCtx) => {
  const cost = parseCurrencyString(data.costPrice);
  const sale = parseCurrencyString(data.salePrice);
  
  if (cost <= 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'O preço de custo deve ser maior que zero.', path: ['costPrice'] });
  }
  if (sale <= 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'O preço de venda deve ser maior que zero.', path: ['salePrice'] });
  } else if (sale <= cost) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'O preço de venda deve ser maior que o custo.', path: ['salePrice'] });
  }
};

export const glassSchema = z.object({
  name: z.string().min(1, 'O nome/descrição é obrigatório.').transform(v => v.toUpperCase()),
  ncmCode: z.string().optional(),
  thicknessMm: z.string().min(1),
  colorFinish: z.string().min(1, 'A cor/acabamento é obrigatória.').transform(v => v.toUpperCase()),
  maxWidthMm: z.string().min(1, 'Largura obrigatória'),
  maxHeightMm: z.string().min(1, 'Altura obrigatória'),
  costPrice: z.string().min(1, 'O preço de custo é obrigatório'),
  salePrice: z.string().min(1, 'O preço de venda é obrigatório'),
  active: z.boolean()
}).superRefine(basePriceRefinement);

export type GlassFormValues = z.infer<typeof glassSchema>;

export const profileSchema = z.object({
  skuCode: z.string().min(1, 'Código obrigatório').transform(v => v.toUpperCase()),
  commercialLine: z.string().min(1, 'Linha comercial obrigatória').transform(v => v.toUpperCase()),
  description: z.string().min(1, 'A descrição é obrigatória.').transform(v => v.toUpperCase()),
  ncmCode: z.string().optional(),
  colorFinish: z.string().min(1, 'A cor é obrigatória.').transform(v => v.toUpperCase()),
  weight: z.string().min(1, 'O peso é obrigatório.'),
  length: z.string().min(1, 'O comprimento é obrigatório.'),
  costPrice: z.string().min(1, 'O preço de custo é obrigatório'),
  salePrice: z.string().min(1, 'O preço de venda é obrigatório'),
  active: z.boolean()
}).superRefine(basePriceRefinement);

export type ProfileFormValues = z.infer<typeof profileSchema>;

export const hardwareSchema = z.object({
  skuCode: z.string().min(1, 'Código obrigatório').transform(v => v.toUpperCase()),
  name: z.string().min(1, 'A descrição é obrigatória.').transform(v => v.toUpperCase()),
  ncmCode: z.string().optional(),
  unitMeasure: z.string().min(1),
  costPrice: z.string().min(1, 'O preço de custo é obrigatório'),
  salePrice: z.string().min(1, 'O preço de venda é obrigatório'),
  active: z.boolean()
}).superRefine(basePriceRefinement);

export type HardwareFormValues = z.infer<typeof hardwareSchema>;

export const filmSchema = z.object({
  skuCode: z.string().optional().transform(v => v ? v.toUpperCase() : undefined),
  name: z.string().min(1, 'A descrição é obrigatória.').transform(v => v.toUpperCase()),
  ncmCode: z.string().optional(),
  filmType: z.string().min(1, 'O tipo é obrigatório.').transform(v => v.toUpperCase()),
  thicknessMm: z.string().min(1),
  standardLengthM: z.string().min(1),
  maxWidthMm: z.string().min(1),
  costPrice: z.string().min(1, 'O preço de custo é obrigatório'),
  salePrice: z.string().min(1, 'O preço de venda é obrigatório'),
  active: z.boolean()
}).superRefine(basePriceRefinement);

export type FilmFormValues = z.infer<typeof filmSchema>;
