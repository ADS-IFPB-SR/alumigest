/**
 * Utilitário para dedução da quantidade de folhas por esquadria a partir
 * da descrição e tipologia do item da Ordem de Serviço.
 * US-17 / Correção de Bugs #492 e #493.
 */

const PATTERN_FOLHAS = /\b(\d{1,2})\s*(?:folhas?|fls)\b/i;
const PATTERN_F_SUFFIX = /\b(\d{1,2})\s*f\b/i;
const PATTERN_PLANOS = /\b(\d{1,2})\s*planos?\b/i;
const PATTERN_TEMPLATE_TYPE = /(\d{1,2})f\b/i;

function parseMatch(match: RegExpExecArray | RegExpMatchArray | null): number | null {
  if (!match?.[1]) return null;
  const parsed = Number.parseInt(match[1], 10);
  return !Number.isNaN(parsed) && parsed > 0 ? parsed : null;
}

function extractFromDescription(descricao?: string | null): number | null {
  if (!descricao) return null;

  return (
    parseMatch(PATTERN_FOLHAS.exec(descricao)) ??
    parseMatch(PATTERN_F_SUFFIX.exec(descricao)) ??
    parseMatch(PATTERN_PLANOS.exec(descricao))
  );
}

function extractFromTemplate(templateType?: string | null): number | null {
  if (!templateType) return null;
  return parseMatch(PATTERN_TEMPLATE_TYPE.exec(templateType));
}

/**
 * Deduz o número de folhas físicas de uma esquadria com base na sua descrição
 * textual ou tipo de template registrado.
 *
 * Exemplos:
 * - "Porta de Correr 2 Folhas" -> 2
 * - "Janela de Correr 4 Folhas Suprema" -> 4
 * - "Janela 2F Linha Suprema" -> 2
 * - "Porta 3 Planos Sacada" -> 3
 * - "Porta de Giro 1 Folha" -> 1
 * - "Box Frontal 2 Folhas" -> 2
 * - templateType 'SLIDING_DOOR_4F' -> 4
 *
 * @param descricao descrição textual do item da O.S.
 * @param templateType tipo de modelo cadastrado no catálogo (opcional)
 * @returns quantidade de folhas deduzida (mínimo 1)
 */
export function extractLeavesCount(
  descricao?: string | null,
  templateType?: string | null
): number {
  return (
    extractFromDescription(descricao) ??
    extractFromTemplate(templateType) ??
    1
  );
}

/**
 * Formata a identificação técnica da etiqueta física conforme o padrão Alumiportas:
 * `Item XX • Esquadria YY/ZZ | Folha AA/BB` (quando tem múltiplas folhas)
 * ou `Item XX • Esquadria YY/ZZ | Peça AA/BB` (quando folha única).
 */
export function formatLabelBadge(
  itemNumber: number,
  esquadriaIndex: number,
  totalEsquadrias: number,
  folhaIndex: number,
  totalFolhas: number
): string {
  const itemPad = String(itemNumber).padStart(2, '0');
  const esqPad = String(esquadriaIndex).padStart(2, '0');
  const totalEsqPad = String(totalEsquadrias).padStart(2, '0');
  const folhaPad = String(folhaIndex).padStart(2, '0');
  const totalFolhasPad = String(totalFolhas).padStart(2, '0');

  const sufixoFolha = totalFolhas > 1
    ? `Folha ${folhaPad}/${totalFolhasPad}`
    : `Peça ${folhaPad}/${totalFolhasPad}`;

  return `Item ${itemPad} • Esquadria ${esqPad}/${totalEsqPad} | ${sufixoFolha}`;
}
