import { z } from 'zod';

export const customerSchema = z.object({
  nomeCompleto: z.string().min(3, 'O nome deve ter pelo menos 3 letras.'),
  cpfCnpj: z.string().optional(),
  telefone: z.string().min(8, 'Informe um telefone válido.').or(z.literal('')),
  email: z.string().email('E-mail inválido.').or(z.literal('')),
  cep: z.string().optional(),
  logradouro: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  uf: z.string().optional(),
  observacoes: z.string().optional(),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;
