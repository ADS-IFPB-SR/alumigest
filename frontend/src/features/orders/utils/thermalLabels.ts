/**
 * Regras de montagem das etiquetas térmicas exibidas na pré-visualização do frontend.
 * Espelha o resolvedor de domínio do backend (`ThermalLabelDataResolver.java`) para
 * garantir paridade entre o modal e o PDF gerado:
 *  - itens com quantidade nula, zero ou negativa são ignorados;
 *  - itens são ordenados pelo campo `ordem` (ordenação estável);
 *  - o índice do item usa `ordem` quando positivo, senão um contador sequencial;
 *  - o local/ambiente prioriza o `templateConfig` do item, depois observações e endereço da O.S.
 * BUG #486 — Paridade do ThermalLabelModal com o backend.
 */
import type { JsonConfig, Order, OrderItem } from '../types';

export const NAO_INFORMADO = 'Não informado';

/** Chaves aceitas no `templateConfig`, na mesma ordem de prioridade do backend. */
const AMBIENTE_KEYS = ['ambiente', 'room', 'local', 'environment', 'location', 'notes'] as const;

export interface PhysicalPieceLabel {
  uniqueKey: string;
  item: OrderItem;
  itemIndex: number;
  pieceNumber: number;
  totalPieces: number;
  labelFraction: string;
  localAmbiente: string;
}

export interface LabelItemGroup {
  item: OrderItem;
  itemIndex: number;
  quantidade: number;
}

const hasPositiveQuantity = (item: OrderItem): boolean =>
  typeof item.quantidade === 'number' && Number.isFinite(item.quantidade) && item.quantidade > 0;

const isNonBlank = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

/**
 * Ordena os itens por `ordem` (nulos/ausentes tratados como 0) e descarta os que não
 * possuem quantidade positiva, atribuindo o índice exibido na etiqueta.
 */
export function resolveLabelItems(items: OrderItem[] | null | undefined): LabelItemGroup[] {
  if (!items || items.length === 0) return [];

  const ordenados = [...items].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));

  const grupos: LabelItemGroup[] = [];
  let sequencial = 1;

  for (const item of ordenados) {
    if (!hasPositiveQuantity(item)) continue;

    const itemIndex = typeof item.ordem === 'number' && item.ordem > 0 ? item.ordem : sequencial;
    grupos.push({ item, itemIndex, quantidade: Math.floor(item.quantidade) });
    sequencial++;
  }

  return grupos;
}

/** Extrai o ambiente do `templateConfig`, aceitando objeto ou string JSON. */
export function extractAmbienteFromTemplateConfig(templateConfig: JsonConfig | undefined): string | null {
  if (templateConfig == null) return null;

  let config: unknown = templateConfig;
  if (typeof templateConfig === 'string') {
    if (templateConfig.trim().length === 0) return null;
    try {
      config = JSON.parse(templateConfig);
    } catch {
      return null;
    }
  }

  if (config === null || typeof config !== 'object' || Array.isArray(config)) return null;

  const record = config as Record<string, unknown>;
  for (const key of AMBIENTE_KEYS) {
    const value = record[key];
    if (value == null) continue;
    const texto = typeof value === 'string' ? value : String(value);
    if (texto.trim().length > 0) return texto.trim();
  }

  return null;
}

/** Resolve o texto da linha "LOCAL / OBS" seguindo a prioridade do backend. */
export function resolveLocalAmbiente(item: OrderItem, order: Pick<Order, 'observacoes' | 'clienteEndereco'>): string {
  const ambiente = extractAmbienteFromTemplateConfig(item.templateConfig);
  if (ambiente) return ambiente;
  if (isNonBlank(order.observacoes)) return order.observacoes.trim();
  if (isNonBlank(order.clienteEndereco)) return order.clienteEndereco.trim();
  return NAO_INFORMADO;
}

/** Gera uma etiqueta por peça física, em sequência global, a partir dos itens válidos. */
export function buildPhysicalLabels(
  order: Pick<Order, 'items' | 'observacoes' | 'clienteEndereco'>,
  grupos: LabelItemGroup[] = resolveLabelItems(order.items),
): PhysicalPieceLabel[] {
  const totalPieces = grupos.reduce((acc, g) => acc + g.quantidade, 0);
  if (totalPieces === 0) return [];

  const totalPad = String(totalPieces).padStart(2, '0');
  const labels: PhysicalPieceLabel[] = [];
  let globalCounter = 1;

  for (const { item, itemIndex, quantidade } of grupos) {
    const itemPad = String(itemIndex).padStart(2, '0');
    const localAmbiente = resolveLocalAmbiente(item, order);

    for (let p = 1; p <= quantidade; p++) {
      const piecePad = String(globalCounter).padStart(2, '0');
      labels.push({
        uniqueKey: `${item.id}-${p}`,
        item,
        itemIndex,
        pieceNumber: globalCounter,
        totalPieces,
        labelFraction: `Item ${itemPad} | Peça ${piecePad}/${totalPad}`,
        localAmbiente,
      });
      globalCounter++;
    }
  }

  return labels;
}
