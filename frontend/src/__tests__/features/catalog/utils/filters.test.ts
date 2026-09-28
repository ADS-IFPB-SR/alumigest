import { describe, it, expect } from 'vitest';
import { filterByStatus } from '@/features/catalog/utils/filters';

describe('filterByStatus Utility', () => {
  describe('Técnica: Tabela de Decisão - Filtro de Status Ativo/Inativo', () => {
    const itemAtivo = { id: 1, name: 'Item Ativo', active: true };
    const itemInativo = { id: 2, name: 'Item Inativo', active: false };

    it('Regra 1: Filtro ALL deve retornar true para ativos e inativos', () => {
      expect(filterByStatus(itemAtivo, 'ALL')).toBe(true);
      expect(filterByStatus(itemInativo, 'ALL')).toBe(true);
    });

    it('Regra 2: Filtro ACTIVE deve retornar true para ativos e false para inativos', () => {
      expect(filterByStatus(itemAtivo, 'ACTIVE')).toBe(true);
      expect(filterByStatus(itemInativo, 'ACTIVE')).toBe(false);
    });

    it('Regra 3: Filtro INACTIVE deve retornar false para ativos e true para inativos', () => {
      expect(filterByStatus(itemAtivo, 'INACTIVE')).toBe(false);
      expect(filterByStatus(itemInativo, 'INACTIVE')).toBe(true);
    });

    it('Regra 4: Item com active undefined tratado como inativo', () => {
      const itemSemActive = { id: 3, name: 'Sem campo active' };
      expect(filterByStatus(itemSemActive, 'ALL')).toBe(true);
      expect(filterByStatus(itemSemActive, 'ACTIVE')).toBe(false);
      expect(filterByStatus(itemSemActive, 'INACTIVE')).toBe(true);
    });
  });
});
