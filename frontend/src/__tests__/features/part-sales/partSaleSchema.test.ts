import { describe, it, expect } from 'vitest';
import { partSaleItemSchema, partSaleFormSchema } from '@/features/part-sales/schemas/partSaleSchema';

describe('PartSale Zod Schemas [US-46.1] - Formal QA Tests', () => {
  const validHardwareId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  const validClientId = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';

  describe('partSaleItemSchema', () => {
    it('deve validar com sucesso item de ferragem por unidade sem dimensões', () => {
      const validItem = {
        materialType: 'HARDWARE',
        referenceId: validHardwareId,
        description: 'ROLDANA DUPLA SUPREMA 112',
        quantity: 5,
        unitPrice: 28.5,
      };

      const result = partSaleItemSchema.safeParse(validItem);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.materialType).toBe('HARDWARE');
        expect(result.data.quantity).toBe(5);
        expect(result.data.unitPrice).toBe(28.5);
      }
    });

    it('deve rejeitar item com quantidade zero ou negativa', () => {
      const itemZero = {
        materialType: 'HARDWARE',
        referenceId: validHardwareId,
        description: 'ROLDANA',
        quantity: 0,
        unitPrice: 28.5,
      };

      const itemNegative = {
        materialType: 'HARDWARE',
        referenceId: validHardwareId,
        description: 'ROLDANA',
        quantity: -2,
        unitPrice: 28.5,
      };

      expect(partSaleItemSchema.safeParse(itemZero).success).toBe(false);
      expect(partSaleItemSchema.safeParse(itemNegative).success).toBe(false);
    });

    it('deve rejeitar item com preço unitário negativo', () => {
      const itemNegativePrice = {
        materialType: 'HARDWARE',
        referenceId: validHardwareId,
        description: 'ROLDANA',
        quantity: 1,
        unitPrice: -5.0,
      };

      const result = partSaleItemSchema.safeParse(itemNegativePrice);
      expect(result.success).toBe(false);
    });

    it('deve exigir altura e largura se o material for vidro ou película', () => {
      const glassWithoutDimensions = {
        materialType: 'GLASS',
        referenceId: validHardwareId,
        description: 'VIDRO 8MM TEMPERADO',
        quantity: 1,
        unitPrice: 150.0,
      };

      const result = partSaleItemSchema.safeParse(glassWithoutDimensions);
      expect(result.success).toBe(false);
    });
  });

  describe('partSaleFormSchema', () => {
    it('deve validar venda com itens e desconto válido', () => {
      const validSale = {
        clientId: validClientId,
        status: 'DRAFT',
        discountAmount: 10,
        items: [
          {
            materialType: 'HARDWARE',
            referenceId: validHardwareId,
            description: 'ROLDANA',
            quantity: 2,
            unitPrice: 25.0,
          },
        ],
      };

      const result = partSaleFormSchema.safeParse(validSale);
      expect(result.success).toBe(true);
    });

    it('deve rejeitar venda sem itens', () => {
      const emptySale = {
        clientId: validClientId,
        status: 'DRAFT',
        discountAmount: 0,
        items: [],
      };

      const result = partSaleFormSchema.safeParse(emptySale);
      expect(result.success).toBe(false);
    });
  });
});
