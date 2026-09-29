import { z } from 'zod';

export const ApprovalChannelEnum = z.enum([
  'WHATSAPP',
  'PRESENCIAL',
  'TELEFONE',
  'EMAIL',
] as const, {
  message: 'Selecione um canal de aprovação válido.',
});

export const convertOrderSchema = z.object({
  canalAprovacao: ApprovalChannelEnum,
  dataPrevisaoEntrega: z
    .string({ message: 'Informe a data prevista de entrega.' })
    .min(1, 'Informe a data prevista de entrega.')
    .refine((val) => {
      const selected = new Date(`${val}T00:00:00`);
      return !Number.isNaN(selected.getTime());
    }, 'Data de entrega inválida.'),
  observacoes: z
    .string()
    .max(1000, 'As observações não podem exceder 1000 caracteres.')
    .optional()
    .or(z.literal('')),
});

export const cancelOrderSchema = z.object({
  justificativa: z
    .string({ message: 'Informe a justificativa de cancelamento.' })
    .trim()
    .min(10, 'A justificativa de cancelamento deve ter pelo menos 10 caracteres.')
    .max(1000, 'A justificativa não pode exceder 1000 caracteres.'),
});

export type ConvertOrderFormData = z.infer<typeof convertOrderSchema>;
export type CancelOrderFormData = z.infer<typeof cancelOrderSchema>;
