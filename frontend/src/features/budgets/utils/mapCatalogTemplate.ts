import type { DoorTemplateType } from '../types';
import { TEMPLATE_TYPE_INFO } from '../types';

export const ALL_SVG_TEMPLATES: DoorTemplateType[] = Object.keys(TEMPLATE_TYPE_INFO) as DoorTemplateType[];

// ─── 1. Dicionário de Opções Base por Família do Catálogo ─────────────────────
export const CATALOG_FAMILY_TO_SVG_OPTIONS: Record<string, DoorTemplateType[]> = {
  SWING: ['SWING_DOOR_1F', 'SWING_DOOR_2F'],
  SLIDING: ['SLIDING_DOOR_2F', 'SLIDING_DOOR_4F', 'SLIDING_DOOR_1F', 'SLIDING_DOOR_3F'],
  TILT: ['AWNING_WINDOW_1F', 'AWNING_WINDOW_1F_INV'],
  DRAWER: ['FRONT_DRAWER'],
};

// ─── 2. Dicionário de Especializações por Palavra-Chave (Ex: Box, Janela) ────
const KEYWORD_SPECIALIZATIONS: Array<{ keyword: string; options: DoorTemplateType[] }> = [
  { keyword: 'box', options: ['SLIDING_DOOR_1F', 'SLIDING_DOOR_2F'] },
  { keyword: 'janela', options: ['SLIDING_DOOR_2F', 'SLIDING_DOOR_4F'] },
];

/**
 * Retorna os templates SVG disponíveis por consulta direta a dicionários.
 * Elimina completamente cascatas de if/else e switch.
 */
export function getAvailableSvgTemplatesForCatalogType(
  catalogType?: string | null,
  productName?: string
): DoorTemplateType[] {
  const name = (productName ?? '').toLowerCase();
  const keywordMatch = KEYWORD_SPECIALIZATIONS.find((s) => name.includes(s.keyword));

  return (
    keywordMatch?.options ??
    (catalogType ? CATALOG_FAMILY_TO_SVG_OPTIONS[catalogType] : undefined) ??
    ALL_SVG_TEMPLATES
  );
}

// ─── 3. Dicionário de Regras de Resolução do Template Padrão ─────────────────
interface TemplateRule {
  match: (name: string) => boolean;
  template: DoorTemplateType;
}

const DEFAULT_TEMPLATE_RULES: Record<string, TemplateRule[]> = {
  SWING: [
    { match: (name) => name.includes('pivot'), template: 'SWING_DOOR_1F' },
    { match: (name) => name.includes('2 folha') || name.includes('dupla') || name.includes('2f'), template: 'SWING_DOOR_2F' },
    { match: () => true, template: 'SWING_DOOR_1F' },
  ],
  SLIDING: [
    { match: (name) => name.includes('box') && name.includes('canto'), template: 'SLIDING_DOOR_2F' },
    { match: (name) => name.includes('box'), template: 'SLIDING_DOOR_1F' },
    { match: (name) => name.includes('janela') && (name.includes('4') || name.includes('quatro') || name.includes('4f')), template: 'SLIDING_DOOR_4F' },
    { match: (name) => name.includes('janela'), template: 'SLIDING_DOOR_2F' },
    { match: (name) => name.includes('4 folha') || name.includes('quatro') || name.includes('4f'), template: 'SLIDING_DOOR_4F' },
    { match: () => true, template: 'SLIDING_DOOR_2F' },
  ],
  TILT: [
    { match: () => true, template: 'AWNING_WINDOW_1F' },
  ],
  DRAWER: [
    { match: () => true, template: 'FRONT_DRAWER' },
  ],
};

const DEFAULT_FALLBACK_TEMPLATE: DoorTemplateType = 'SLIDING_DOOR_2F';

/**
 * Retorna o template visual padrão recomendado por consulta ao dicionário de regras.
 */
export function getDefaultSvgTemplateForCatalogType(
  catalogType?: string | null,
  productName?: string,
  templateConfig?: { templateType?: string } | null
): DoorTemplateType {
  // Se o próprio templateType ou a config já for uma das 10 variantes homologadas, retorna diretamente
  if (templateConfig?.templateType && ALL_SVG_TEMPLATES.includes(templateConfig.templateType as DoorTemplateType)) {
    return templateConfig.templateType as DoorTemplateType;
  }
  if (catalogType && ALL_SVG_TEMPLATES.includes(catalogType as DoorTemplateType)) {
    return catalogType as DoorTemplateType;
  }

  const rules = catalogType ? DEFAULT_TEMPLATE_RULES[catalogType] : undefined;
  const name = (productName ?? '').toLowerCase();
  const matchedRule = rules?.find((r) => r.match(name));

  return matchedRule?.template ?? DEFAULT_FALLBACK_TEMPLATE;
}

// ─── 4. Dicionários de Cores e Acabamentos ─────────────────────────────────────
interface ColorDictionaryEntry {
  synonyms: string[];
  canonical: string;
}

const ALUMINUM_COLORS: ColorDictionaryEntry[] = [
  { synonyms: ['#212121', 'preto', 'black'], canonical: 'Preto Fosco' },
  { synonyms: ['#8c6239', 'bronze', 'champ'], canonical: 'Bronze / Champanhe' },
  { synonyms: ['#ffffff', 'branco', 'white'], canonical: 'Branco Brilhante' },
  { synonyms: ['#546e7a', '#b0bec5', 'grafit', 'cinza', 'fosco', 'anodiz'], canonical: 'Alumínio Fosco / Anodizado' },
  { synonyms: ['#d4af37', 'dourad', 'gold'], canonical: 'Dourado / Gold' },
  { synonyms: ['#9e9e9e', 'inox', 'polid', 'crom'], canonical: 'Cromado / Polido' },
];

const GLASS_COLORS: ColorDictionaryEntry[] = [
  { synonyms: ['#e3f2fd', 'incolor', 'clear'], canonical: 'Incolor' },
  { synonyms: ['#595959', 'fume', 'fumê', 'cinza'], canonical: 'Fumê / Cinza' },
  { synonyms: ['#b87333', 'reflecta bronze', 'bronze', '#f3e5ab', 'champ'], canonical: 'Reflecta Bronze' },
  { synonyms: ['#e0f2f1', 'verde', 'green'], canonical: 'Verde' },
  { synonyms: ['#e0e0e0', 'canelad', 'textur'], canonical: 'Canelado / Texturizado' },
];

const DEFAULT_ALUMINUM_NAME = 'Alumínio Fosco / Anodizado';
const DEFAULT_GLASS_NAME = 'Incolor';

function lookupColor(
  rawInput: string | null | undefined,
  dictionary: ColorDictionaryEntry[],
  fallback: string
): string {
  if (!rawInput) return fallback;
  const normalized = rawInput.trim().toLowerCase();
  const entry = dictionary.find((item) =>
    item.synonyms.some((s) => normalized === s || normalized.includes(s))
  );
  return entry?.canonical ?? rawInput;
}

/**
 * Mapeia cores hexadecimais ou identificadores do catálogo para as opções de acabamento de alumínio.
 */
export function mapCatalogAluminumColor(rawColor?: string | null): string {
  return lookupColor(rawColor, ALUMINUM_COLORS, DEFAULT_ALUMINUM_NAME);
}

/**
 * Mapeia cores hexadecimais ou identificadores do catálogo para as opções de acabamento de vidro.
 */
export function mapCatalogGlassColor(rawGlass?: string | null): string {
  return lookupColor(rawGlass, GLASS_COLORS, DEFAULT_GLASS_NAME);
}

// ─── 5. Categorização Macro e Filtros Unificados (DRY) ───────────────────────
export type ModalCategoryFilter = 'TODOS' | 'PORTAS' | 'JANELAS' | 'BOX' | 'MOVEIS';

export function resolveProductMacroCategory(product: {
  name: string;
  categoryName?: string | null;
  templateType?: string | null;
}): ModalCategoryFilter {
  const catNorm = (product.categoryName || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const nameNorm = (product.name || '').toLowerCase();
  const tType = product.templateType || '';

  if (catNorm.includes('box') || nameNorm.includes('box')) {
    return 'BOX';
  }
  if (
    catNorm.includes('mov') ||
    catNorm.includes('pain') ||
    catNorm.includes('gaveta') ||
    nameNorm.includes('painel') ||
    nameNorm.includes('gaveta') ||
    tType === 'FRONT_DRAWER' ||
    tType === 'FIXED_PANEL'
  ) {
    return 'MOVEIS';
  }
  if (
    catNorm.includes('janela') ||
    nameNorm.includes('janela') ||
    tType.startsWith('AWNING')
  ) {
    return 'JANELAS';
  }
  if (
    catNorm.includes('porta') ||
    nameNorm.includes('porta') ||
    tType.startsWith('SWING') ||
    tType.startsWith('SLIDING')
  ) {
    return 'PORTAS';
  }

  return 'TODOS';
}

export function matchProductCategoryFilter(
  product: { name: string; categoryName?: string | null; templateType?: string | null },
  filter: ModalCategoryFilter
): boolean {
  if (filter === 'TODOS') return true;
  return resolveProductMacroCategory(product) === filter;
}
