/**
 * calculations.ts
 * 
 * Cálculos exclusivamente comerciais e visuais do módulo de Orçamentos.
 * 
 * REGRA DE DOMÍNIO ARQUITETURAL:
 * - Fórmulas de fabricação física, consumo de perfis, área de vidros,
 *   cortes, barras, perdas e ferragens pertencem EXCLUSIVAMENTE ao backend.
 * - Este arquivo contém apenas operações financeiras/comerciais triviais
 *   (subtotal de itens conhecidos + mão de obra, e formatação BRL).
 */

/**
 * Calcula o subtotal financeiro de um item do orçamento.
 * Cálculo puramente comercial: Σ(quantidade × preço unitário) + mão de obra × quantidade de esquadrias.
 */
export function calcItemSubtotal(
  options: { quantity?: number; unitPrice: number }[],
  laborCost: number,
  quantity: number
): number {
  const materialsCost = options.reduce((acc, opt) => {
    const qty = typeof opt.quantity === 'number' && opt.quantity > 0 ? opt.quantity : 0;
    return acc + qty * opt.unitPrice;
  }, 0);
  return materialsCost + laborCost * quantity;
}

/**
 * Formata valor monetário em padrão brasileiro (R$ X.XXX,XX).
 */
export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });
}
