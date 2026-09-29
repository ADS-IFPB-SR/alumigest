import { describe, it, expect } from 'vitest';
import { customerSchema } from '@/features/customers/schemas/customerSchema';

describe('customerSchema Validation', () => {
  describe('Técnica: Análise do Valor Limite (BVA) - Comprimento do Nome Completo', () => {
    it('Limite Inferior Inválido: nome com 2 caracteres deve falhar', () => {
      const result = customerSchema.safeParse({
        nomeCompleto: 'Al',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('O nome deve ter pelo menos 3 letras.');
      }
    });

    it('Limite Inferior Válido: nome com exatamente 3 caracteres deve passar', () => {
      const result = customerSchema.safeParse({
        nomeCompleto: 'Ana',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('Técnica: Particionamento em Classes de Equivalência (EP) - Telefone e E-mail', () => {
    it('Telefone: válido com 8 ou mais dígitos, ou aceita string vazia/null', () => {
      expect(customerSchema.safeParse({ nomeCompleto: 'Cliente Teste', telefone: '12345678' }).success).toBe(true);
      expect(customerSchema.safeParse({ nomeCompleto: 'Cliente Teste', telefone: '' }).success).toBe(true);
      expect(customerSchema.safeParse({ nomeCompleto: 'Cliente Teste', telefone: null }).success).toBe(true);
      expect(customerSchema.safeParse({ nomeCompleto: 'Cliente Teste', telefone: '12345' }).success).toBe(false);
    });

    it('E-mail: formato válido vs formato inválido vs opcional', () => {
      expect(customerSchema.safeParse({ nomeCompleto: 'Cliente Teste', email: 'contato@empresa.com' }).success).toBe(true);
      expect(customerSchema.safeParse({ nomeCompleto: 'Cliente Teste', email: '' }).success).toBe(true);
      expect(customerSchema.safeParse({ nomeCompleto: 'Cliente Teste', email: 'invalido-sem-arroba' }).success).toBe(false);
    });

    it('deve aceitar payload completo com todos os campos de endereço', () => {
      const result = customerSchema.safeParse({
        nomeCompleto: 'Construtora Horizonte Ltda',
        cpfCnpj: '12.345.678/0001-90',
        telefone: '83988887777',
        email: 'contato@horizonte.com.br',
        cep: '58000-000',
        logradouro: 'Av Principal',
        numero: '100',
        complemento: 'Sala 201',
        bairro: 'Centro',
        cidade: 'João Pessoa',
        uf: 'PB',
        observacoes: 'Cliente VIP',
      });

      expect(result.success).toBe(true);
    });
  });
});
