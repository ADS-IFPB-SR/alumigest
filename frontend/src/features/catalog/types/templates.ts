// ============================================================================
// Tipos de Templates de Esquadrias — Espelhados do Backend
// ============================================================================

// --- Enums ---

export type DoorTemplateType = 'GIRO' | 'CORRER' | 'BASCULANTE' | 'GAVETA';
export type MaterialCategoryType = 'GLASS' | 'PROFILE' | 'HARDWARE' | 'ROLLERS' | 'FILM';
export type OpeningDirection = 'LEFT_TO_RIGHT' | 'RIGHT_TO_LEFT' | 'OUTSIDE' | 'INSIDE' | 'CENTER_TO_SIDES';
export type SlidingMode = 'BOTH_SLIDING' | 'LEFT_FIXED_RIGHT_SLIDING' | 'RIGHT_FIXED_LEFT_SLIDING';
export type HandleType = 'BAR_TUBULAR' | 'SHELL_LOCK' | 'LEVER_HANDLE' | 'NONE';
export type HandlePosition = 'RIGHT' | 'LEFT' | 'TOP' | 'BOTTOM' | 'CENTER';
export type HoleDrillingMode = 'EQUAL' | 'CUSTOM';

// --- Configurações ---

export interface HandleConfig {
  handleType: HandleType;
  handleLengthMm: number;
  handlePosition: HandlePosition;
  handleOffsetMm?: number;
}

export interface DrillingConfig {
  drillingMode: HoleDrillingMode;
  holeCount?: number;
  customPositionsMm?: number[];
}

export interface TemplateOptionSchema {
  allowSlidingMode: boolean;
  allowedSlidingModes: SlidingMode[];
  allowOpeningDirection: boolean;
  allowedOpeningDirections: OpeningDirection[];
  allowHandle: boolean;
  allowedHandleTypes: HandleType[];
  allowedHandlePositions: HandlePosition[];
  allowDrilling: boolean;
  allowedDrillingModes: HoleDrillingMode[];
  allowAluminumColors: string[];
  allowGlassColors: string[];
}

export interface TemplateConfig {
  profileMm: number;
  aluminumColor: string;
  glassColor: string;
  openingDirection?: OpeningDirection;
  slidingMode?: SlidingMode;
  handleConfig?: HandleConfig;
  drillingConfig?: DrillingConfig;
  optionSchema?: TemplateOptionSchema;
}

// --- Labels e Metadados para UI ---

export const DOOR_TEMPLATE_LABELS: Record<DoorTemplateType, string> = {
  GIRO: 'Porta de Giro',
  CORRER: 'Porta de Correr (2 Folhas)',
  BASCULANTE: 'Basculante',
  GAVETA: 'Frente de Gaveta',
};

export const MATERIAL_CATEGORY_LABELS: Record<MaterialCategoryType, string> = {
  GLASS: 'Vidro',
  PROFILE: 'Perfil',
  HARDWARE: 'Ferragem',
  ROLLERS: 'Roldanas',
  FILM: 'Película',
};

export const MATERIAL_CATEGORY_ICONS: Record<MaterialCategoryType, string> = {
  GLASS: 'window',
  PROFILE: 'construction',
  HARDWARE: 'hardware',
  ROLLERS: 'settings',
  FILM: 'movie_filter',
};

export const HANDLE_TYPE_LABELS: Record<HandleType, string> = {
  BAR_TUBULAR: 'Puxador Tubular (Barra)',
  SHELL_LOCK: 'Fecho Concha / Embutido',
  LEVER_HANDLE: 'Maçaneta / Alavanca',
  NONE: 'Sem Puxador',
};

export const HANDLE_POSITION_LABELS: Record<HandlePosition, string> = {
  LEFT: 'Lateral Esquerda',
  RIGHT: 'Lateral Direita',
  TOP: 'Topo',
  BOTTOM: 'Base (Embaixo)',
  CENTER: 'Centro',
};

export const OPENING_DIRECTION_LABELS: Record<OpeningDirection, string> = {
  LEFT_TO_RIGHT: 'Esquerda → Direita',
  RIGHT_TO_LEFT: 'Direita → Esquerda',
  OUTSIDE: 'Para Fora',
  INSIDE: 'Para Dentro',
  CENTER_TO_SIDES: 'Do Centro para as Laterais',
};

export const SLIDING_MODE_LABELS: Record<SlidingMode, string> = {
  BOTH_SLIDING: 'Ambas deslizam',
  LEFT_FIXED_RIGHT_SLIDING: 'Esquerda fixa / Direita corre',
  RIGHT_FIXED_LEFT_SLIDING: 'Direita fixa / Esquerda corre',
};

export const DRILLING_MODE_LABELS: Record<HoleDrillingMode, string> = {
  EQUAL: 'Automático (dividir por igual)',
  CUSTOM: 'Personalizado (medida exata)',
};

// --- Cores padrão do gerador SVG Alumiportas ---

export const ALUMINUM_COLORS = [
  { name: 'Bronze', hex: '#8C6239' },
  { name: 'Fosco', hex: '#B0BEC5' },
  { name: 'Preto', hex: '#212121' },
  { name: 'Grafite', hex: '#546E7A' },
  { name: 'Dourado', hex: '#D4AF37' },
  { name: 'Branco', hex: '#FFFFFF' },
  { name: 'Inox', hex: '#9E9E9E' },
] as const;

export const GLASS_COLORS = [
  { name: 'Incolor', hex: '#e3f2fd' },
  { name: 'Champanhe', hex: '#f3e5ab' },
  { name: 'Espelho', hex: '#e0e0e0' },
  { name: 'Reflecta Prata', hex: '#c0c0c0' },
  { name: 'Espelho Bronze', hex: '#b87333' },
  { name: 'Espelho Fumê', hex: '#595959' },
] as const;

// --- Defaults inteligentes por template ---

export const TEMPLATE_DEFAULT_CATEGORIES: Record<DoorTemplateType, MaterialCategoryType[]> = {
  GIRO: ['GLASS', 'PROFILE', 'HARDWARE'],
  CORRER: ['GLASS', 'PROFILE', 'HARDWARE', 'ROLLERS'],
  BASCULANTE: ['GLASS', 'PROFILE', 'HARDWARE'],
  GAVETA: ['GLASS', 'PROFILE', 'HARDWARE'],
};

/** Quais toggles de opção são aplicáveis por tipo de template */
export const TEMPLATE_APPLICABLE_OPTIONS: Record<DoorTemplateType, {
  openingDirection: boolean;
  slidingMode: boolean;
  handle: boolean;
  drilling: boolean;
}> = {
  GIRO: { openingDirection: true, slidingMode: false, handle: true, drilling: true },
  CORRER: { openingDirection: false, slidingMode: true, handle: true, drilling: false },
  BASCULANTE: { openingDirection: false, slidingMode: false, handle: true, drilling: true },
  GAVETA: { openingDirection: false, slidingMode: false, handle: true, drilling: false },
};
