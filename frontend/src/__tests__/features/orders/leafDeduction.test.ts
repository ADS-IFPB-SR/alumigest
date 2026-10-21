import { describe, it, expect } from 'vitest';
import { extractLeavesCount, formatLabelBadge } from '../../../features/orders/utils/leafDeduction';

describe('leafDeduction - extractLeavesCount', () => {
  it('deve extrair folhas corretamente de padrão "X Folhas"', () => {
    expect(extractLeavesCount('Porta de Correr 2 Folhas')).toBe(2);
    expect(extractLeavesCount('Janela de Correr 4 Folhas Suprema')).toBe(4);
    expect(extractLeavesCount('Porta 3 folhas sacada')).toBe(3);
    expect(extractLeavesCount('Porta de Giro 1 Folha')).toBe(1);
  });

  it('deve extrair folhas de abreviações como "XF" ou "X fls"', () => {
    expect(extractLeavesCount('Janela 2F Linha Suprema')).toBe(2);
    expect(extractLeavesCount('Porta 4F')).toBe(4);
    expect(extractLeavesCount('Janela 2 fls')).toBe(2);
    expect(extractLeavesCount('Porta 3 fls alumínio')).toBe(3);
  });

  it('deve extrair folhas de padrões "X Planos"', () => {
    expect(extractLeavesCount('Porta de Correr 3 Planos Sacada')).toBe(3);
    expect(extractLeavesCount('Esquadria 2 planos')).toBe(2);
  });

  it('deve utilizar templateType como fallback quando a descrição for genérica', () => {
    expect(extractLeavesCount('Esquadria sob medida', 'SLIDING_DOOR_2F')).toBe(2);
    expect(extractLeavesCount('Esquadria sob medida', 'SLIDING_DOOR_4F')).toBe(4);
    expect(extractLeavesCount('Esquadria sob medida', 'SWING_DOOR_1F')).toBe(1);
    expect(extractLeavesCount('', 'SLIDING_DOOR_3F')).toBe(3);
  });

  it('deve retornar 1 como fallback seguro para descrições sem menção a folhas ou templates desconhecidos', () => {
    expect(extractLeavesCount('Painel Fixo')).toBe(1);
    expect(extractLeavesCount('Portão Basculante Especial')).toBe(1);
    expect(extractLeavesCount(null, null)).toBe(1);
    expect(extractLeavesCount(undefined, undefined)).toBe(1);
    expect(extractLeavesCount('', '')).toBe(1);
  });

  it('deve rejeitar valores de fronteira inválidos como 0 folhas e adotar fallback 1', () => {
    expect(extractLeavesCount('Porta 0 Folhas')).toBe(1);
    expect(extractLeavesCount('Janela 0F')).toBe(1);
    expect(extractLeavesCount('Esquadria 0 planos')).toBe(1);
  });

  it('deve priorizar a descrição "1 Folha" sobre templateType divergente', () => {
    // Se parsed > 0 for mutado para parsed > 1, este caso cairia no templateType (4) em vez de respeitar a descrição (1)
    expect(extractLeavesCount('Porta de Giro 1 Folha', 'SLIDING_DOOR_4F')).toBe(1);
    expect(extractLeavesCount('Janela 1F', 'SLIDING_DOOR_2F')).toBe(1);
  });
});

describe('leafDeduction - formatLabelBadge', () => {
  it('deve formatar badge para esquadria com múltiplas folhas', () => {
    const badge1 = formatLabelBadge(1, 1, 1, 1, 2);
    expect(badge1).toBe('Item 01 • Esquadria 01/01 | Folha 01/02');

    const badge2 = formatLabelBadge(1, 1, 1, 2, 2);
    expect(badge2).toBe('Item 01 • Esquadria 01/01 | Folha 02/02');
  });

  it('deve formatar badge para múltiplos itens e múltiplas esquadrias', () => {
    const badge = formatLabelBadge(2, 2, 3, 4, 4);
    expect(badge).toBe('Item 02 • Esquadria 02/03 | Folha 04/04');
  });

  it('deve formatar badge com termo "Peça" quando houver apenas 1 folha', () => {
    const badge = formatLabelBadge(1, 1, 1, 1, 1);
    expect(badge).toBe('Item 01 • Esquadria 01/01 | Peça 01/01');
  });
});
