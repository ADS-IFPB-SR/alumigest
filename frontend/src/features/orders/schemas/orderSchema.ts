import { z } from 'zod';

export const ApprovalChannelEnum = z.enum([
  'WHATSAPP',
  'PRESENCIAL',
  'TELEFONE',
  'EMAIL',
] as const, {
  message: 'Selecione um canal de aprovação válido.',
});

/**
 * Retorna uma data formatada em YYYY-MM-DD para inputs do tipo date no fuso horário local.
 */
export function formatToDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Retorna a data mínima permitida para entrega (hoje no fuso local).
 */
export function getMinDeliveryDate(): string {
  return formatToDateInput(new Date());
}

/**
 * Retorna a data sugerida padrão de entrega (+15 dias corridos a partir de hoje).
 */
export function getDefaultDeliveryDate(daysToAdd = 15): string {
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);
  return formatToDateInput(date);
}

export const convertOrderSchema = z.object({
  canalAprovacao: ApprovalChannelEnum,
  dataPrevisaoEntrega: z
    .string({ message: 'Informe a data prevista de entrega.' })
    .min(1, 'Informe a data prevista de entrega.')
    .refine((val) => {
      const selected = new Date(`${val}T00:00:00`);
      return !Number.isNaN(selected.getTime());
    }, 'Data de entrega inválida.')
    .refine((val) => {
      const selected = new Date(`${val}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selected >= today;
    }, 'A data de previsão de entrega não pode ser retroativa.'),
  observacoes: z
    .string()
    .max(1000, 'As observações não podem exceder 1000 caracteres.')
    .optional()
    .or(z.literal('')),
});

export const orderConvertSchema = convertOrderSchema;

export const cancelOrderSchema = z.object({
  justificativa: z
    .string({ message: 'Informe a justificativa de cancelamento.' })
    .trim()
    .min(10, 'A justificativa de cancelamento deve ter pelo menos 10 caracteres.')
    .max(1000, 'A justificativa não pode exceder 1000 caracteres.'),
});

export type ConvertOrderFormData = z.infer<typeof convertOrderSchema>;
export type CancelOrderFormData = z.infer<typeof cancelOrderSchema>;
