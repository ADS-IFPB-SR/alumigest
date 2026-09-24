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

export type MaterialCategoryType = 'GLASS' | 'PROFILE' | 'HARDWARE' | 'FILM';
export type OpeningDirection = 'LEFT_TO_RIGHT' | 'RIGHT_TO_LEFT' | 'OUTSIDE' | 'INSIDE' | 'CENTER_TO_SIDES';
export type SlidingMode = 'BOTH_SLIDING' | 'LEFT_FIXED_RIGHT_SLIDING' | 'RIGHT_FIXED_LEFT_SLIDING';
export type HandleType = 'BAR_TUBULAR' | 'SHELL_LOCK' | 'LEVER_HANDLE' | 'NONE';
export type HandlePosition = 'RIGHT' | 'LEFT' | 'TOP' | 'BOTTOM' | 'CENTER';
export type HoleDrillingMode = 'EQUAL' | 'CUSTOM';
export type DrillingPosition = 'SUPERIOR' | 'LATERAL' | 'FRONTAL';

// --- Configurações ---

export interface HandleConfig {
  handleType: HandleType;
  handleLengthMm?: number;
  handlePosition?: HandlePosition;
  handleOffsetMm?: number;
  side?: 'ONE_SIDE' | 'BOTH_SIDES';
  coverage?: 'FULL' | 'PIECE';
  pieceLengthCm?: number;
  position?: HandlePosition;
}

export interface DrillingConfig {
  drillingMode: HoleDrillingMode;
  drillingPosition?: DrillingPosition;
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
  allowedDrillingPositions: DrillingPosition[];
  allowAluminumColors: string[];
  allowGlassColors: string[];
}

export type HexColor = `#${string}`;

export interface TemplateConfig {
  templateType: DoorTemplateType;
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
  SLIDING_DOOR_2F: 'Porta / Janela de Correr 2 Folhas',
  SLIDING_DOOR_3F: 'Porta de Correr 3 Folhas',
  SLIDING_DOOR_4F: 'Porta / Janela de Correr 4 Folhas',
  SWING_DOOR_1F: 'Porta de Giro 1 Folha',
  SWING_DOOR_2F: 'Porta de Giro 2 Folhas',
  AWNING_WINDOW_1F: 'Janela Maxim-Ar / Basculante',
  AWNING_WINDOW_1F_INV: 'Janela Maxim-Ar Invertida',
  FRONT_DRAWER: 'Frente de Gaveta em Alumínio',
  FIXED_PANEL: 'Painel Fixo / Fachada em Vidro',
};

export interface TemplateGroup {
  id: string;
  label: string;
  icon: string;
  types: DoorTemplateType[];
}

export const DOOR_TEMPLATE_GROUPS: TemplateGroup[] = [
  {
    id: 'doors',
    label: 'Portas',
    icon: 'door_front',
    types: ['SWING_DOOR_1F', 'SWING_DOOR_2F', 'SLIDING_DOOR_2F', 'SLIDING_DOOR_3F', 'SLIDING_DOOR_4F'],
  },
  {
    id: 'windows',
    label: 'Janelas',
    icon: 'window',
    types: ['AWNING_WINDOW_1F', 'AWNING_WINDOW_1F_INV', 'SLIDING_DOOR_2F', 'SLIDING_DOOR_4F'],
  },
  {
    id: 'bath',
    label: 'Box',
    icon: 'shower',
    types: ['SLIDING_DOOR_1F', 'SLIDING_DOOR_2F'],
  },
  {
    id: 'others',
    label: 'Móveis / Painéis',
    icon: 'kitchen',
    types: ['FRONT_DRAWER', 'FIXED_PANEL'],
  },
];

export const MATERIAL_CATEGORY_LABELS: Record<MaterialCategoryType, string> = {
  GLASS: 'Vidro',
  PROFILE: 'Perfil',
  HARDWARE: 'Ferragem',
  FILM: 'Película',
};

export const MATERIAL_CATEGORY_ICONS: Record<MaterialCategoryType, string> = {
  GLASS: 'window',
  PROFILE: 'construction',
  HARDWARE: 'hardware',
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

export const DRILLING_POSITION_LABELS: Record<DrillingPosition, string> = {
  SUPERIOR: 'Borda Superior (roldanas / trilho)',
  LATERAL: 'Borda Lateral (dobradiças / pivô)',
  FRONTAL: 'Frontal no Painel (spider glass / fixação)',
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
  SLIDING_DOOR_1F: ['GLASS', 'PROFILE', 'HARDWARE'],
  SLIDING_DOOR_2F: ['GLASS', 'PROFILE', 'HARDWARE'],
  SLIDING_DOOR_3F: ['GLASS', 'PROFILE', 'HARDWARE'],
  SLIDING_DOOR_4F: ['GLASS', 'PROFILE', 'HARDWARE'],
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
  SLIDING_DOOR_1F:      { openingDirection: true,  slidingMode: true,  handle: true,  drilling: true  },
  SLIDING_DOOR_2F:      { openingDirection: true,  slidingMode: true,  handle: true,  drilling: true  },
  SLIDING_DOOR_3F:      { openingDirection: true,  slidingMode: true,  handle: true,  drilling: true  },
  SLIDING_DOOR_4F:      { openingDirection: true,  slidingMode: true,  handle: true,  drilling: true  },
  SWING_DOOR_1F:        { openingDirection: true,  slidingMode: false, handle: true,  drilling: true  },
  SWING_DOOR_2F:        { openingDirection: true,  slidingMode: false, handle: true,  drilling: true  },
  AWNING_WINDOW_1F:     { openingDirection: false, slidingMode: false, handle: true,  drilling: true  },
  AWNING_WINDOW_1F_INV: { openingDirection: false, slidingMode: false, handle: true,  drilling: true  },
  FRONT_DRAWER:         { openingDirection: false, slidingMode: false, handle: true,  drilling: true  },
  FIXED_PANEL:          { openingDirection: false, slidingMode: false, handle: false, drilling: true  },
};

/** Posição padrão de furação por tipo de template */
export const TEMPLATE_DEFAULT_DRILLING_POSITION: Record<DoorTemplateType, DrillingPosition> = {
  SLIDING_DOOR_1F:      'SUPERIOR',
  SLIDING_DOOR_2F:      'SUPERIOR',
  SLIDING_DOOR_3F:      'SUPERIOR',
  SLIDING_DOOR_4F:      'SUPERIOR',
  SWING_DOOR_1F:        'LATERAL',
  SWING_DOOR_2F:        'LATERAL',
  AWNING_WINDOW_1F:     'LATERAL',
  AWNING_WINDOW_1F_INV: 'LATERAL',
  FRONT_DRAWER:         'FRONTAL',
  FIXED_PANEL:          'FRONTAL',
};
