import { z } from 'zod';

export const customerSchema = z.object({
  nomeCompleto: z
    .string({ message: 'O nome completo é obrigatório.' })
    .trim()
    .min(3, 'O nome deve ter pelo menos 3 letras.')
    .max(150, 'O nome deve ter no máximo 150 caracteres.')
    .regex(/^[\p{L}\s'.-]+$/u, 'O nome completo não pode conter caracteres especiais ou números.'),

  cpfCnpj: z
    .string({ message: 'O CPF ou CNPJ é obrigatório.' })
    .trim()
    .min(1, 'O CPF ou CNPJ é obrigatório.')
    .regex(
      /^(?:\d{11}|\d{14}|\d{3}\.\d{3}\.\d{3}-\d{2}|\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})$/,
      'Documento com formato inválido (deve ser CPF ou CNPJ).'
    ),

  telefone: z
    .string({ message: 'O telefone é obrigatório.' })
    .trim()
    .min(1, 'O telefone é obrigatório.')
    .regex(
      /^(?:\+?55\s?)?(?:\(?\d{2}\)?[\s-]?)?(?:9?\d{4})[\s-]?\d{4}$|^\d{8,13}$/,
      'Informe um telefone válido.'
    ),

  email: z
    .string()
    .trim()
    .email({ message: 'E-mail inválido.' })
    .or(z.literal(''))
    .optional()
    .nullable(),

  cep: z
    .string()
    .trim()
    .regex(/^$|^\d{5}-?\d{3}$/, 'CEP com formato inválido.')
    .or(z.literal(''))
    .optional()
    .nullable(),

  logradouro: z
    .string()
    .trim()
    .max(150, 'O logradouro deve ter no máximo 150 caracteres.')
    .optional()
    .nullable()
    .or(z.literal('')),

  numero: z
    .string()
    .trim()
    .max(20, 'O número deve ter no máximo 20 caracteres.')
    .optional()
    .nullable()
    .or(z.literal('')),

  complemento: z
    .string()
    .trim()
    .max(100, 'O complemento deve ter no máximo 100 caracteres.')
    .optional()
    .nullable()
    .or(z.literal('')),

  bairro: z
    .string()
    .trim()
    .max(100, 'O bairro deve ter no máximo 100 caracteres.')
    .optional()
    .nullable()
    .or(z.literal('')),

  cidade: z
    .string()
    .trim()
    .max(100, 'A cidade deve ter no máximo 100 caracteres.')
    .regex(/^$|^[\p{L}\s'-]+$/u, 'O nome do município não pode conter caracteres especiais ou números.')
    .optional()
    .nullable()
    .or(z.literal('')),

  uf: z
    .string()
    .trim()
    .regex(/^$|^[A-Z]{2}$/, 'UF inválida (deve conter 2 letras maiúsculas).')
    .optional()
    .nullable()
    .or(z.literal('')),

  observacoes: z.string().optional().nullable().or(z.literal('')),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;
