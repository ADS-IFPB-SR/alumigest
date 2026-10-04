import { describe, it, expect } from 'vitest';
import { customerSchema } from '@/features/customers/schemas/customerSchema';

describe('customerSchema Validation', () => {
  const validBasePayload = {
    nomeCompleto: 'João da Silva',
    cpfCnpj: '123.456.789-00',
    telefone: '(83) 99999-0000',
  };

  describe('Técnica: Análise do Valor Limite (BVA) - Nome Completo', () => {
    it('Limite Inferior Inválido: nome com 2 caracteres deve falhar', () => {
      const result = customerSchema.safeParse({
        ...validBasePayload,
        nomeCompleto: 'Al',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('O nome deve ter pelo menos 3 letras.');
      }
    });

    it('Limite Inferior Válido: nome com exatamente 3 caracteres deve passar', () => {
      const result = customerSchema.safeParse({
        ...validBasePayload,
        nomeCompleto: 'Ana',
      });

      expect(result.success).toBe(true);
    });

    it('Nome com caracteres especiais inválidos deve falhar', () => {
      const result = customerSchema.safeParse({
        ...validBasePayload,
        nomeCompleto: 'João @@@ Silva %¨*',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('contém caracteres inválidos');
      }
    });

    it('Deve aceitar Razão Social / Nome de Pessoa Jurídica com algarismos e símbolos comerciais', () => {
      expect(customerSchema.safeParse({ ...validBasePayload, nomeCompleto: '3M do Brasil Ltda' }).success).toBe(true);
      expect(customerSchema.safeParse({ ...validBasePayload, nomeCompleto: 'Construtora 1000 Ltda' }).success).toBe(true);
      expect(customerSchema.safeParse({ ...validBasePayload, nomeCompleto: 'Posto BR 101' }).success).toBe(true);
      expect(customerSchema.safeParse({ ...validBasePayload, nomeCompleto: 'Esquadrias Silva S/A' }).success).toBe(true);
      expect(customerSchema.safeParse({ ...validBasePayload, nomeCompleto: 'Sousa & Filhos Ltda' }).success).toBe(true);
      expect(customerSchema.safeParse({ ...validBasePayload, nomeCompleto: 'M&M Vidros' }).success).toBe(true);
      expect(customerSchema.safeParse({ ...validBasePayload, nomeCompleto: 'Silva, Santos & Cia Ltda' }).success).toBe(true);
    });
  });

  describe('Regra de Negócio: Obrigatoriedade de CPF/CNPJ', () => {
    it('CPF/CNPJ vazio deve falhar', () => {
      const result = customerSchema.safeParse({
        ...validBasePayload,
        cpfCnpj: '',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('O CPF ou CNPJ é obrigatório.');
      }
    });

    it('CPF/CNPJ em formato inválido deve falhar', () => {
      const result = customerSchema.safeParse({
        ...validBasePayload,
        cpfCnpj: '12345',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Documento com formato inválido');
      }
    });

    it('CPF válido com ou sem pontuação deve passar', () => {
      expect(customerSchema.safeParse({ ...validBasePayload, cpfCnpj: '12345678901' }).success).toBe(true);
      expect(customerSchema.safeParse({ ...validBasePayload, cpfCnpj: '123.456.789-01' }).success).toBe(true);
    });

    it('CNPJ válido com ou sem pontuação deve passar', () => {
      expect(customerSchema.safeParse({ ...validBasePayload, cpfCnpj: '12345678000199' }).success).toBe(true);
      expect(customerSchema.safeParse({ ...validBasePayload, cpfCnpj: '12.345.678/0001-99' }).success).toBe(true);
    });
  });

  describe('Regra de Negócio: Obrigatoriedade de Telefone', () => {
    it('Telefone vazio deve falhar', () => {
      const result = customerSchema.safeParse({
        ...validBasePayload,
        telefone: '',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('O telefone é obrigatório.');
      }
    });

    it('Telefone com menos de 8 dígitos ou letras deve falhar', () => {
      expect(customerSchema.safeParse({ ...validBasePayload, telefone: '123' }).success).toBe(false);
      expect(customerSchema.safeParse({ ...validBasePayload, telefone: 'telefone-invalido' }).success).toBe(false);
    });

    it('Telefone com formato válido deve passar', () => {
      expect(customerSchema.safeParse({ ...validBasePayload, telefone: '(83) 99999-0000' }).success).toBe(true);
      expect(customerSchema.safeParse({ ...validBasePayload, telefone: '83999990000' }).success).toBe(true);
      expect(customerSchema.safeParse({ ...validBasePayload, telefone: '32180000' }).success).toBe(true);
    });

    it('Telefone com espaço no nono dígito ou com código do país deve passar', () => {
      expect(customerSchema.safeParse({ ...validBasePayload, telefone: '(83) 9 9999-0000' }).success).toBe(true);
      expect(customerSchema.safeParse({ ...validBasePayload, telefone: '+55 83 99999-0000' }).success).toBe(true);
      expect(customerSchema.safeParse({ ...validBasePayload, telefone: '+55 (83) 99999-0000' }).success).toBe(true);
    });
  });

  describe('Controle de Entradas: Município (Cidade)', () => {
    it('Cidade com caracteres especiais deve falhar', () => {
      const result = customerSchema.safeParse({
        ...validBasePayload,
        cidade: 'Santa Rita @#$ 123',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('O nome do município não pode conter caracteres especiais ou números.');
      }
    });

    it('Cidade vazia ou não informada deve passar (campo opcional de endereço)', () => {
      expect(customerSchema.safeParse({ ...validBasePayload, cidade: '' }).success).toBe(true);
      expect(customerSchema.safeParse({ ...validBasePayload, cidade: undefined }).success).toBe(true);
    });

    it('Cidade com caracteres válidos (acentos, hífens, apóstrofos) deve passar', () => {
      expect(customerSchema.safeParse({ ...validBasePayload, cidade: 'Santa Rita' }).success).toBe(true);
      expect(customerSchema.safeParse({ ...validBasePayload, cidade: 'São Paulo' }).success).toBe(true);
      expect(customerSchema.safeParse({ ...validBasePayload, cidade: "Olho-d'Água do Borges" }).success).toBe(true);
    });
  });

  describe('Validação Completa', () => {
    it('deve aceitar payload completo com todos os campos de endereço preenchidos corretamente', () => {
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
