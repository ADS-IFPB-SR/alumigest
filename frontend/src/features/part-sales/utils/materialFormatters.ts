import type { MaterialOption } from '../types/partSaleTypes';

export function formatUnitMeasure(unit?: string): string {
  if (!unit) return 'un';
  const u = unit.toUpperCase();
  if (u === 'M2') return 'm²';
  if (u === 'METRO' || u === 'LINEAR_METER') return 'm';
  if (u === 'BARRA_3M') return 'barra 3m';
  if (u === 'BARRA_6M') return 'barra 6m';
  if (u === 'PAR') return 'par';
  if (u === 'KG') return 'kg';
  return 'un';
}

export function formatCurrency(val?: number): string {
  if (val == null) return 'R$ 0,00';
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatMaterialLabel(m: MaterialOption): string {
  const parts: string[] = [m.name];
  if (m.thicknessMm && !m.name.includes(`${m.thicknessMm}mm`)) {
    parts.push(`${m.thicknessMm}mm`);
  }
  if (m.color && !m.name.toLowerCase().includes(m.color.toLowerCase())) {
    parts.push(m.color);
  }
  return parts.join(' - ');
}

