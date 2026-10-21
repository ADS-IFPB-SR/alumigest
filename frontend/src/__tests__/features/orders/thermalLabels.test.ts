import { describe, it, expect } from 'vitest';
import {
  buildPhysicalLabels,
  extractAmbienteFromTemplateConfig,
  resolveLabelItems,
  resolveLocalAmbiente,
  NAO_INFORMADO,
} from '../../../features/orders/utils/thermalLabels';
import type { OrderItem } from '../../../features/orders/types';

const makeItem = (overrides: Partial<OrderItem>): OrderItem => ({
  id: 'item',
  orderId: 'order-1',
  descricao: 'Janela',
  larguraMm: 1000,
  alturaMm: 1000,
  quantidade: 1,
  valorUnitario: 100,
  valorTotal: 100,
  ordem: 1,
  ...overrides,
});

describe('thermalLabels — [BUG #486] paridade com ThermalLabelDataResolver', () => {
  describe('resolveLabelItems', () => {
    it('ignora itens com quantidade zero, negativa ou ausente', () => {
      const grupos = resolveLabelItems([
        makeItem({ id: 'a', quantidade: 0, ordem: 1 }),
        makeItem({ id: 'b', quantidade: -2, ordem: 2 }),
        makeItem({ id: 'c', quantidade: undefined as unknown as number, ordem: 3 }),
        makeItem({ id: 'd', quantidade: 2, ordem: 4 }),
      ]);

      expect(grupos.map((g) => g.item.id)).toEqual(['d']);
      expect(grupos[0].quantidade).toBe(2);
    });

    it('ordena os itens pelo campo ordem independentemente da posição no array', () => {
      const grupos = resolveLabelItems([
        makeItem({ id: 'terceiro', ordem: 3 }),
        makeItem({ id: 'primeiro', ordem: 1 }),
        makeItem({ id: 'segundo', ordem: 2 }),
      ]);

      expect(grupos.map((g) => [g.item.id, g.itemIndex])).toEqual([
        ['primeiro', 1],
        ['segundo', 2],
        ['terceiro', 3],
      ]);
    });

    it('usa contador sequencial quando ordem não é positiva', () => {
      const grupos = resolveLabelItems([
        makeItem({ id: 'x', ordem: 0 }),
        makeItem({ id: 'y', ordem: 0 }),
      ]);

      expect(grupos.map((g) => g.itemIndex)).toEqual([1, 2]);
    });

    it('retorna lista vazia para itens nulos ou vazios', () => {
      expect(resolveLabelItems(undefined)).toEqual([]);
      expect(resolveLabelItems([])).toEqual([]);
    });
  });

  describe('extractAmbienteFromTemplateConfig', () => {
    it('lê o ambiente de string JSON', () => {
      expect(extractAmbienteFromTemplateConfig('{"ambiente":"Varanda Gourmet"}')).toBe('Varanda Gourmet');
    });

    it('lê o ambiente de objeto já desserializado', () => {
      expect(extractAmbienteFromTemplateConfig({ ambiente: '  Cozinha ' })).toBe('Cozinha');
    });

    it('respeita a prioridade das chaves alternativas do backend', () => {
      expect(extractAmbienteFromTemplateConfig({ notes: 'Nota', room: 'Quarto Casal' })).toBe('Quarto Casal');
      expect(extractAmbienteFromTemplateConfig({ ambiente: '   ', local: 'Sala' })).toBe('Sala');
    });

    it('retorna null para JSON inválido, vazio ou sem chaves conhecidas', () => {
      expect(extractAmbienteFromTemplateConfig('{invalido')).toBeNull();
      expect(extractAmbienteFromTemplateConfig('')).toBeNull();
      expect(extractAmbienteFromTemplateConfig(null)).toBeNull();
      expect(extractAmbienteFromTemplateConfig({ largura: 10 })).toBeNull();
      expect(extractAmbienteFromTemplateConfig('[1,2]')).toBeNull();
    });
  });

  describe('resolveLocalAmbiente', () => {
    it('prioriza templateConfig, depois observações, depois endereço', () => {
      const order = { observacoes: 'Obs OS', clienteEndereco: 'Rua A' };

      expect(resolveLocalAmbiente(makeItem({ templateConfig: { ambiente: 'Cozinha' } }), order)).toBe('Cozinha');
      expect(resolveLocalAmbiente(makeItem({}), order)).toBe('Obs OS');
      expect(resolveLocalAmbiente(makeItem({}), { observacoes: ' ', clienteEndereco: 'Rua A' })).toBe('Rua A');
      expect(resolveLocalAmbiente(makeItem({}), { observacoes: null, clienteEndereco: null })).toBe(NAO_INFORMADO);
    });
  });

  describe('buildPhysicalLabels', () => {
    it('gera numeração global apenas com peças válidas e ordenadas', () => {
      const labels = buildPhysicalLabels({
        observacoes: 'Obs',
        clienteEndereco: null,
        items: [
          makeItem({ id: 'porta', ordem: 2, quantidade: 1 }),
          makeItem({ id: 'zerado', ordem: 3, quantidade: 0 }),
          makeItem({ id: 'janela', ordem: 1, quantidade: 2 }),
        ],
      });

      expect(labels.map((l) => l.labelFraction)).toEqual([
        'Item 01 | Peça 01/03',
        'Item 01 | Peça 02/03',
        'Item 02 | Peça 03/03',
      ]);
      expect(labels.every((l) => l.item.id !== 'zerado')).toBe(true);
    });

    it('retorna lista vazia quando nenhum item possui quantidade positiva', () => {
      const labels = buildPhysicalLabels({
        observacoes: null,
        clienteEndereco: null,
        items: [makeItem({ quantidade: 0 })],
      });

      expect(labels).toEqual([]);
    });
  });
});
