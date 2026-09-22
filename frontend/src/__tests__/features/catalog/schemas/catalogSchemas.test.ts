import { describe, it, expect } from 'vitest';
import {
  glassSchema,
  profileSchema,
  hardwareSchema,
  filmSchema,
} from '@/features/catalog/schemas/catalogSchemas';

describe('Catalog Zod Schemas Validation', () => {
  describe('Técnica: Análise do Valor Limite (BVA) - Regra de Margem de Preço (basePriceRefinement)', () => {
    const validGlassBase = {
      name: 'Vidro Teste',
      thicknessMm: '8',
      colorFinish: 'Incolor',
      maxWidthMm: '2000',
      maxHeightMm: '3000',
      active: true,
    };

    it('Limite Inferior: Custo R$ 0,00 deve falhar com erro de preço de custo', () => {
      const result = glassSchema.safeParse({
        ...validGlassBase,
        costPrice: '0,00',
        salePrice: '100,00',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const error = result.error.issues.find((i) => i.path.includes('costPrice'));
        expect(error?.message).toBe('O preço de custo deve ser maior que zero.');
      }
    });

    it('Limite Inferior: Venda R$ 0,00 deve falhar com erro de preço de venda', () => {
      const result = glassSchema.safeParse({
        ...validGlassBase,
        costPrice: '50,00',
        salePrice: '0,00',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const error = result.error.issues.find((i) => i.path.includes('salePrice'));
        expect(error?.message).toBe('O preço de venda deve ser maior que zero.');
      }
    });

    it('Limite Crítico: Preço de Venda IGUAL ao Preço de Custo deve falhar (Margem Zero)', () => {
      const result = glassSchema.safeParse({
        ...validGlassBase,
        costPrice: '100,00',
        salePrice: '100,00',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const error = result.error.issues.find((i) => i.path.includes('salePrice'));
        expect(error?.message).toBe('O preço de venda deve ser maior que o custo.');
      }
    });

    it('Limite Crítico: Preço de Venda Menor que Preço de Custo deve falhar (Prejuízo)', () => {
      const result = glassSchema.safeParse({
        ...validGlassBase,
        costPrice: '100,00',
        salePrice: '99,99',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const error = result.error.issues.find((i) => i.path.includes('salePrice'));
        expect(error?.message).toBe('O preço de venda deve ser maior que o custo.');
      }
    });

    it('Limite Superior Válido: Preço de Venda imediatamente maior que o Custo deve passar', () => {
      const result = glassSchema.safeParse({
        ...validGlassBase,
        costPrice: '100,00',
        salePrice: '100,01',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('Técnica: Particionamento em Classes de Equivalência (EP) - Validações Específicas', () => {
    it('GlassSchema: deve transformar texto em UPPERCASE e aceitar campos válidos', () => {
      const result = glassSchema.safeParse({
        name: 'vidro laminado acústico',
        thicknessMm: '10',
        colorFinish: 'verde',
        maxWidthMm: '2500',
        maxHeightMm: '3200',
        costPrice: '200,00',
        salePrice: '350,00',
        active: true,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('VIDRO LAMINADO ACÚSTICO');
        expect(result.data.colorFinish).toBe('VERDE');
      }
    });

    it('ProfileSchema: deve validar obrigatoriedade de campos específicos de perfis de alumínio', () => {
      const result = profileSchema.safeParse({
        skuCode: 'al-01',
        commercialLine: 'suprema',
        description: 'perfil trilho inferior',
        colorFinish: 'preto',
        weight: '1.25',
        length: '6000',
        costPrice: '80,00',
        salePrice: '140,00',
        active: true,
        isHandle: false,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.skuCode).toBe('AL-01');
        expect(result.data.commercialLine).toBe('SUPREMA');
      }
    });

    it('HardwareSchema: deve exigir unidade de medida e descrição', () => {
      const invalid = hardwareSchema.safeParse({
        skuCode: 'hw-01',
        name: '',
        unitMeasure: '',
        costPrice: '10,00',
        salePrice: '20,00',
        active: true,
        isHandle: true,
      });

      expect(invalid.success).toBe(false);
      if (!invalid.success) {
        expect(invalid.error.issues.some((i) => i.path.includes('name'))).toBe(true);
        expect(invalid.error.issues.some((i) => i.path.includes('unitMeasure'))).toBe(true);
      }
    });

    it('FilmSchema: deve exigir filmType e dimensões da bobina', () => {
      const result = filmSchema.safeParse({
        name: 'Película Blackout',
        filmType: 'Privacidade',
        thicknessMm: '0.1',
        standardLengthM: '30',
        maxWidthMm: '1520',
        costPrice: '50,00',
        salePrice: '120,00',
        active: true,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.filmType).toBe('PRIVACIDADE');
      }
    });
  });
});
