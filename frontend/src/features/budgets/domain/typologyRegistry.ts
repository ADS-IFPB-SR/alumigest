import type { DoorTemplateType, HandlePosition, OpeningDirection } from '../types';

/**
 * Eixo mecânico do movimento e manuseio da esquadria.
 */
export type MechanicalAxis =
  | 'VERTICAL_AXIS'    // Correr, Giro, Pivotante (manuseio em montantes laterais verticais)
  | 'HORIZONTAL_AXIS'  // Basculante, Maxim-ar, Tombar (manuseio em travessas horizontais)
  | 'PANEL_SURFACE'    // Frente de gaveta, painel móvel (manuseio superficial/centro/bordas)
  | 'FIXED';           // Painéis fixos / fachadas (sem puxador)

export interface TypologyMetadata {
  templateType: DoorTemplateType;
  label: string;
  mechanicalAxis: MechanicalAxis;
  defaultHandlePosition: HandlePosition;
  allowedHandlePositions: HandlePosition[];
  defaultOpeningDirection: OpeningDirection;
  supportedOpeningDirections: OpeningDirection[];
}

/**
 * Registry Canônico de Metadados Mecânicos por Tipologia de Esquadria.
 * Padrão Open-Closed: Para adicionar uma nova tipologia, basta registrar aqui.
 */
export const TYPOLOGY_REGISTRY: Record<DoorTemplateType, TypologyMetadata> = {
  SLIDING_DOOR_1F: {
    templateType: 'SLIDING_DOOR_1F',
    label: 'Porta de Correr 1 Folha',
    mechanicalAxis: 'VERTICAL_AXIS',
    defaultHandlePosition: 'RIGHT',
    allowedHandlePositions: ['RIGHT', 'LEFT', 'TOP', 'BOTTOM', 'CENTER'],
    defaultOpeningDirection: 'LEFT_TO_RIGHT',
    supportedOpeningDirections: ['LEFT_TO_RIGHT', 'RIGHT_TO_LEFT'],
  },
  SLIDING_DOOR_2F: {
    templateType: 'SLIDING_DOOR_2F',
    label: 'Porta/Janela de Correr 2 Folhas',
    mechanicalAxis: 'VERTICAL_AXIS',
    defaultHandlePosition: 'RIGHT',
    allowedHandlePositions: ['RIGHT', 'LEFT', 'TOP', 'BOTTOM', 'CENTER'],
    defaultOpeningDirection: 'LEFT_TO_RIGHT',
    supportedOpeningDirections: ['LEFT_TO_RIGHT', 'RIGHT_TO_LEFT'],
  },
  SLIDING_DOOR_3F: {
    templateType: 'SLIDING_DOOR_3F',
    label: 'Porta de Correr 3 Folhas',
    mechanicalAxis: 'VERTICAL_AXIS',
    defaultHandlePosition: 'RIGHT',
    allowedHandlePositions: ['RIGHT', 'LEFT', 'TOP', 'BOTTOM', 'CENTER'],
    defaultOpeningDirection: 'LEFT_TO_RIGHT',
    supportedOpeningDirections: ['LEFT_TO_RIGHT', 'RIGHT_TO_LEFT'],
  },
  SLIDING_DOOR_4F: {
    templateType: 'SLIDING_DOOR_4F',
    label: 'Porta/Janela de Correr 4 Folhas',
    mechanicalAxis: 'VERTICAL_AXIS',
    defaultHandlePosition: 'RIGHT',
    allowedHandlePositions: ['RIGHT', 'LEFT', 'TOP', 'BOTTOM', 'CENTER'],
    defaultOpeningDirection: 'CENTER_TO_SIDES',
    supportedOpeningDirections: ['CENTER_TO_SIDES'],
  },
  SWING_DOOR_1F: {
    templateType: 'SWING_DOOR_1F',
    label: 'Porta de Giro 1 Folha',
    mechanicalAxis: 'VERTICAL_AXIS',
    defaultHandlePosition: 'RIGHT',
    allowedHandlePositions: ['RIGHT', 'LEFT', 'TOP', 'BOTTOM', 'CENTER'],
    defaultOpeningDirection: 'OUTSIDE',
    supportedOpeningDirections: ['OUTSIDE', 'INSIDE', 'LEFT_TO_RIGHT', 'RIGHT_TO_LEFT'],
  },
  SWING_DOOR_2F: {
    templateType: 'SWING_DOOR_2F',
    label: 'Porta de Giro 2 Folhas',
    mechanicalAxis: 'VERTICAL_AXIS',
    defaultHandlePosition: 'RIGHT',
    allowedHandlePositions: ['RIGHT', 'LEFT', 'TOP', 'BOTTOM', 'CENTER'],
    defaultOpeningDirection: 'OUTSIDE',
    supportedOpeningDirections: ['OUTSIDE', 'INSIDE', 'CENTER_TO_SIDES'],
  },
  AWNING_WINDOW_1F: {
    templateType: 'AWNING_WINDOW_1F',
    label: 'Janela Basculante / Maxim-ar',
    mechanicalAxis: 'HORIZONTAL_AXIS',
    defaultHandlePosition: 'BOTTOM',
    allowedHandlePositions: ['BOTTOM', 'TOP', 'RIGHT', 'LEFT', 'CENTER'],
    defaultOpeningDirection: 'OUTSIDE',
    supportedOpeningDirections: ['OUTSIDE'],
  },
  AWNING_WINDOW_1F_INV: {
    templateType: 'AWNING_WINDOW_1F_INV',
    label: 'Janela Basculante Invertida',
    mechanicalAxis: 'HORIZONTAL_AXIS',
    defaultHandlePosition: 'TOP',
    allowedHandlePositions: ['TOP', 'BOTTOM', 'RIGHT', 'LEFT', 'CENTER'],
    defaultOpeningDirection: 'INSIDE',
    supportedOpeningDirections: ['INSIDE'],
  },
  FRONT_DRAWER: {
    templateType: 'FRONT_DRAWER',
    label: 'Frente de Gaveta',
    mechanicalAxis: 'PANEL_SURFACE',
    defaultHandlePosition: 'CENTER',
    allowedHandlePositions: ['CENTER', 'TOP', 'BOTTOM', 'RIGHT', 'LEFT'],
    defaultOpeningDirection: 'OUTSIDE',
    supportedOpeningDirections: ['OUTSIDE'],
  },
  FIXED_PANEL: {
    templateType: 'FIXED_PANEL',
    label: 'Painel Fixo / Fachada',
    mechanicalAxis: 'FIXED',
    defaultHandlePosition: 'RIGHT',
    allowedHandlePositions: [],
    defaultOpeningDirection: 'OUTSIDE',
    supportedOpeningDirections: [],
  },
};

/**
 * Fallback padrão caso a tipologia seja desconhecida
 */
const DEFAULT_TYPOLOGY_METADATA: TypologyMetadata = {
  templateType: 'SLIDING_DOOR_2F',
  label: 'Esquadria Padrão',
  mechanicalAxis: 'VERTICAL_AXIS',
  defaultHandlePosition: 'RIGHT',
  allowedHandlePositions: ['RIGHT', 'LEFT'],
  defaultOpeningDirection: 'LEFT_TO_RIGHT',
  supportedOpeningDirections: ['LEFT_TO_RIGHT', 'RIGHT_TO_LEFT'],
};

/**
 * Obtém os metadados mecânicos da esquadria, mesclando com o schema customizado do produto se houver.
 */
export function getTypologyMetadata(
  templateType?: string | null,
  schemaAllowedPositions?: HandlePosition[] | null,
): TypologyMetadata {
  if (!templateType) return DEFAULT_TYPOLOGY_METADATA;

  const base = TYPOLOGY_REGISTRY[templateType as DoorTemplateType] ?? DEFAULT_TYPOLOGY_METADATA;

  if (schemaAllowedPositions && schemaAllowedPositions.length > 0) {
    return {
      ...base,
      allowedHandlePositions: schemaAllowedPositions,
      defaultHandlePosition: schemaAllowedPositions.includes(base.defaultHandlePosition)
        ? base.defaultHandlePosition
        : schemaAllowedPositions[0],
    };
  }

  return base;
}
