import { z } from 'zod';

export const customerSchema = z.object({
  nomeCompleto: z.string().min(3, 'O nome deve ter pelo menos 3 letras.'),
  cpfCnpj: z.string().optional().nullable().or(z.literal('')),
  telefone: z.string().min(8, 'Informe um telefone válido.').or(z.literal('')).optional().nullable(),
  email: z.string().email('E-mail inválido.').or(z.literal('')).optional().nullable(),
  cep: z.string().optional().nullable().or(z.literal('')),
  logradouro: z.string().optional().nullable().or(z.literal('')),
  numero: z.string().optional().nullable().or(z.literal('')),
  complemento: z.string().optional().nullable().or(z.literal('')),
  bairro: z.string().optional().nullable().or(z.literal('')),
  cidade: z.string().optional().nullable().or(z.literal('')),
  uf: z.string().optional().nullable().or(z.literal('')),
  observacoes: z.string().optional().nullable().or(z.literal('')),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;
