/**
 * calculations.ts
 * 
 * Fórmulas de cálculo de quantidade de materiais conforme RN-Regras_de_Calculo.md
 * 
 * Referências:
 * - RN-V01..V04: Vidros (m²)
 * - RN-AL01..AL04: Perfis de Alumínio (metros lineares)
 * - Seção 4: Películas (m²)
 * - Seção 5: Templates Compostos
 */

import type { DoorTemplateType } from '../types';

const MIN_GLASS_AREA_M2 = 0.25; // RN-V03: Área mínima de faturamento

/**
 * Converte milímetros para metros
 */
export function mmToM(valueMm: number): number {
  return valueMm / 1000;
}

/**
 * Calcula área em m² de vidro/película
 * RN-V02: Área = (Largura/1000) × (Altura/1000)
 * RN-V03: Mínimo 0,25 m² por unidade
 */
export function calcGlassArea(widthMm: number, heightMm: number, quantity: number): number {
  const areaPerUnit = mmToM(widthMm) * mmToM(heightMm);
  const effectiveArea = Math.max(areaPerUnit, MIN_GLASS_AREA_M2);
  return effectiveArea * quantity;
}

/**
 * Calcula área em m² de película (mesma fórmula do vidro, Seção 4)
 */
export function calcFilmArea(widthMm: number, heightMm: number, quantity: number): number {
  return calcGlassArea(widthMm, heightMm, quantity);
}

/**
 * Calcula comprimento total de perfis em metros lineares
 * Seção 5: Perfis Superiores + Inferiores = Largura; Laterais = Altura
 * 
 * Fórmula genérica por tipo de template:
 * - 2 perfis horizontais (sup+inf) = Largura × 2
 * - 2 perfis verticais (laterais) = Altura × 2
 * Total por esquadria = (Largura × 2 + Altura × 2)
 * Para 2 folhas: duplica para o trilho e montante central
 */
export function calcProfileLength(
  widthMm: number,
  heightMm: number,
  quantity: number,
  templateType: DoorTemplateType
): number {
  const W = mmToM(widthMm);
  const H = mmToM(heightMm);

  let totalPerUnit = 0;

  switch (templateType) {
    case 'SLIDING_DOOR_2F':
    case 'SLIDING_WINDOW_2F':
    case 'GLASS_BOX_FRONTAL':
      // Trilhos (2W) + Batentes laterais (2H) + Quadros das 2 folhas (4H + 2W)
      totalPerUnit = W * 4 + H * 6;
      break;
    case 'SLIDING_DOOR_4F':
    case 'SLIDING_WINDOW_4F':
      // Trilhos (2W) + Batentes laterais (2H) + Quadros das 4 folhas (8H + 2W)
      totalPerUnit = W * 4 + H * 10;
      break;
    case 'SWING_DOOR_1F':
    case 'PIVOTING_DOOR':
      // Marco (W + 2H) + Quadro da folha (2W + 2H)
      totalPerUnit = W * 3 + H * 4;
      break;
    case 'SWING_DOOR_2F':
      // Marco (W + 2H) + Quadros das 2 folhas (2W + 4H)
      totalPerUnit = W * 3 + H * 6;
      break;
    case 'MAXIM_AR_WINDOW':
      // Marco perimetral (2W + 2H) + Caixilho da folha móvel (2W + 2H)
      totalPerUnit = W * 4 + H * 4;
      break;
    case 'GLASS_BOX_CORNER':
      // Box de Canto em L: Trilhos superiores e inferiores (2W) + Batentes (2H) + 4 folhas (8H + 2W)
      totalPerUnit = W * 4 + H * 10;
      break;
    case 'FIXED_GLASS_FACADE':
      // Arremate perimetral da fachada
      totalPerUnit = (W + H) * 2;
      break;
    default:
      totalPerUnit = (W + H) * 2;
  }

  return totalPerUnit * quantity;
}

/**
 * Converte metros lineares para barras comerciais
 * RN-AL02: Barras padrão de 3m (local) ou 6m (indústria)
 */
export function calcBars(totalMeters: number, barLengthM: 3 | 6 = 6): number {
  return Math.ceil(totalMeters / barLengthM);
}

/**
 * Calcula quantidade de ferragens em unidades/pares
 * Varia por tipo de esquadria
 */
export function calcHardwareQty(templateType: DoorTemplateType, quantity: number): number {
  switch (templateType) {
    case 'SLIDING_DOOR_2F':
    case 'SLIDING_WINDOW_2F':
    case 'GLASS_BOX_FRONTAL':
      // 1 kit por unidade
      return quantity;
    case 'SLIDING_DOOR_4F':
    case 'SLIDING_WINDOW_4F':
      // 2 kits por unidade (2 folhas móveis)
      return quantity * 2;
    case 'SWING_DOOR_1F':
    case 'PIVOTING_DOOR':
      // 1 kit de dobradiças (par) + 1 fechadura
      return quantity;
    case 'SWING_DOOR_2F':
      // 2 kits
      return quantity * 2;
    default:
      return quantity;
  }
}

/**
 * Calcula o subtotal de um item do orçamento
 * Preço Total = Σ(qty × unitPrice por opção) + laborCost × quantity
 */
export function calcItemSubtotal(
  options: { quantity: number; unitPrice: number }[],
  laborCost: number,
  quantity: number
): number {
  const materialsCost = options.reduce((acc, opt) => acc + opt.quantity * opt.unitPrice, 0);
  return materialsCost + laborCost * quantity;
}

/**
 * Calcula a quantidade estimada de material por categoria
 * Retorna valor numérico arredondado para exibição
 */
export function calcQuantityForCategory(
  categoryType: string,
  widthMm: number,
  heightMm: number,
  quantity: number,
  templateType: DoorTemplateType
): { value: number; unit: string } {
  switch (categoryType) {
    case 'GLASS':
      return {
        value: parseFloat(calcGlassArea(widthMm, heightMm, quantity).toFixed(3)),
        unit: 'm²',
      };
    case 'FILM':
      return {
        value: parseFloat(calcFilmArea(widthMm, heightMm, quantity).toFixed(3)),
        unit: 'm²',
      };
    case 'PROFILE': {
      const meters = calcProfileLength(widthMm, heightMm, quantity, templateType);
      return {
        value: parseFloat(meters.toFixed(2)),
        unit: 'm',
      };
    }
    case 'HARDWARE':
      return {
        value: calcHardwareQty(templateType, quantity),
        unit: 'un',
      };
    default:
      return { value: quantity, unit: 'un' };
  }
}

/**
 * Formata valor monetário em padrão brasileiro
 */
export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });
}
