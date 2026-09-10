// ============================================================================
// Tipos de Templates de Esquadrias — Espelhados do Backend
// ============================================================================

// --- Enums ---

export type DoorTemplateType =
  | 'SLIDING_DOOR_1F'
  | 'SLIDING_DOOR_2F'
  | 'SLIDING_DOOR_3F'
  | 'SLIDING_DOOR_4F'
  | 'SWING_DOOR_1F'
  | 'SWING_DOOR_2F'
  | 'AWNING_WINDOW_1F'
  | 'AWNING_WINDOW_1F_INV'
  | 'FRONT_DRAWER'
  | 'FIXED_PANEL';

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
  templateType: DoorTemplateType; // now required!
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
  SLIDING_DOOR_1F: 'Porta de Correr 1 Folha',
  SLIDING_DOOR_2F: 'Porta de Correr 2 Folhas',
  SLIDING_DOOR_3F: 'Porta de Correr 3 Folhas',
  SLIDING_DOOR_4F: 'Porta de Correr 4 Folhas',
  SWING_DOOR_1F: 'Porta de Giro 1 Folha',
  SWING_DOOR_2F: 'Porta de Giro 2 Folhas',
  AWNING_WINDOW_1F: 'Porta Basculante 1 Folha',
  AWNING_WINDOW_1F_INV: 'Porta Basculante 1 Folha Inversa',
  FRONT_DRAWER: 'Gaveta Frontal',
  FIXED_PANEL: 'Painel Fixo',
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
  SLIDING_DOOR_1F: ['GLASS', 'PROFILE', 'HARDWARE', 'ROLLERS'],
  SLIDING_DOOR_2F: ['GLASS', 'PROFILE', 'HARDWARE', 'ROLLERS'],
  SLIDING_DOOR_3F: ['GLASS', 'PROFILE', 'HARDWARE', 'ROLLERS'],
  SLIDING_DOOR_4F: ['GLASS', 'PROFILE', 'HARDWARE', 'ROLLERS'],
  SWING_DOOR_1F: ['GLASS', 'PROFILE', 'HARDWARE'],
  SWING_DOOR_2F: ['GLASS', 'PROFILE', 'HARDWARE'],
  AWNING_WINDOW_1F: ['GLASS', 'PROFILE', 'HARDWARE'],
  AWNING_WINDOW_1F_INV: ['GLASS', 'PROFILE', 'HARDWARE'],
  FRONT_DRAWER: ['GLASS', 'PROFILE', 'HARDWARE'],
  FIXED_PANEL: ['GLASS', 'PROFILE'],
};

/** Quais toggles de opção são aplicáveis por tipo de template */
export const TEMPLATE_APPLICABLE_OPTIONS: Record<DoorTemplateType, {
  openingDirection: boolean;
  slidingMode: boolean;
  handle: boolean;
  drilling: boolean;
}> = {
  SLIDING_DOOR_1F: { openingDirection: true, slidingMode: true, handle: true, drilling: false },
  SLIDING_DOOR_2F: { openingDirection: false, slidingMode: true, handle: true, drilling: false },
  SLIDING_DOOR_3F: { openingDirection: false, slidingMode: true, handle: true, drilling: false },
  SLIDING_DOOR_4F: { openingDirection: false, slidingMode: true, handle: true, drilling: false },
  SWING_DOOR_1F: { openingDirection: true, slidingMode: false, handle: true, drilling: true },
  SWING_DOOR_2F: { openingDirection: true, slidingMode: false, handle: true, drilling: true },
  AWNING_WINDOW_1F: { openingDirection: false, slidingMode: false, handle: true, drilling: true },
  AWNING_WINDOW_1F_INV: { openingDirection: false, slidingMode: false, handle: true, drilling: true },
  FRONT_DRAWER: { openingDirection: false, slidingMode: false, handle: true, drilling: false },
  FIXED_PANEL: { openingDirection: false, slidingMode: false, handle: false, drilling: false },
};
