import type { DoorTemplateType, AluminumColor, GlassFinish, OpeningDirection, HandleType } from '../../types';

export interface TemplateDefinition {
  type: DoorTemplateType;
  name: string;
  category: string;
  defaultWidth: number;
  defaultHeight: number;
  description: string;
  supportedOpeningDirections: OpeningDirection[];
  supportedHandles: HandleType[];
  allowSlatted?: boolean;
  allowFixedPanel?: boolean;
}

export const ALUMINUM_COLORS: { id: AluminumColor; name: string; hex: string; borderHex: string }[] = [
  { id: 'BLACK', name: 'Preto Fosco', hex: '#1E232A', borderHex: '#0F1216' },
  { id: 'WHITE', name: 'Branco Brilhante', hex: '#F1F5F9', borderHex: '#CBD5E1' },
  { id: 'BRONZE', name: 'Bronze 1003', hex: '#453225', borderHex: '#2C1F16' },
  { id: 'NATURAL', name: 'Alumínio Fosco / Anodizado', hex: '#94A3B8', borderHex: '#64748B' },
  { id: 'GOLD', name: 'Gold / Champagne', hex: '#C29B38', borderHex: '#8C6C1C' },
];

export const GLASS_FINISHES: { id: GlassFinish; name: string; fillColor: string; opacity: number; strokeColor: string }[] = [
  { id: 'CLEAR', name: 'Incolor Temperado', fillColor: '#BAE6FD', opacity: 0.35, strokeColor: '#7DD3FC' },
  { id: 'GREEN', name: 'Verde Temperado', fillColor: '#A7F3D0', opacity: 0.45, strokeColor: '#6EE7B7' },
  { id: 'SMOKE', name: 'Fumê / Cinza', fillColor: '#64748B', opacity: 0.55, strokeColor: '#475569' },
  { id: 'BRONZE', name: 'Bronze Translúcido', fillColor: '#D97706', opacity: 0.38, strokeColor: '#B45309' },
  { id: 'FROSTED', name: 'Acidato / Jateado', fillColor: '#E2E8F0', opacity: 0.85, strokeColor: '#CBD5E1' },
  { id: 'REFLECTIVE', name: 'Refletivo / Espelhado', fillColor: '#38BDF8', opacity: 0.65, strokeColor: '#0284C7' },
];

export const TEMPLATE_DEFINITIONS: TemplateDefinition[] = [
  {
    type: 'SLIDING_DOOR_2F',
    name: 'Porta de Correr 2 Folhas',
    category: 'Portas de Alumínio',
    defaultWidth: 1600,
    defaultHeight: 2150,
    description: '1 folha fixa + 1 folha móvel de correr (ou 2 móveis) com trilhos e batedor.',
    supportedOpeningDirections: ['LEFT_TO_RIGHT', 'RIGHT_TO_LEFT', 'CENTER_TO_SIDES'],
    supportedHandles: ['SHELL_LOCK', 'BAR_TUBULAR'],
    allowFixedPanel: true,
  },
  {
    type: 'SLIDING_DOOR_4F',
    name: 'Porta de Correr 4 Folhas',
    category: 'Portas de Alumínio',
    defaultWidth: 3200,
    defaultHeight: 2200,
    description: '2 folhas fixas laterais + 2 folhas móveis centrais de abertura ampla.',
    supportedOpeningDirections: ['CENTER_TO_SIDES'],
    supportedHandles: ['SHELL_LOCK', 'BAR_TUBULAR'],
    allowFixedPanel: true,
  },
  {
    type: 'PIVOTING_DOOR',
    name: 'Porta Pivotante de Entrada',
    category: 'Portas Nobres / Pivotantes',
    defaultWidth: 1200,
    defaultHeight: 2400,
    description: 'Porta imponente com eixo pivô descentralizado, opção de ripado 3D e puxador tubular.',
    supportedOpeningDirections: ['LEFT_TO_RIGHT', 'RIGHT_TO_LEFT'],
    supportedHandles: ['BAR_TUBULAR', 'LEVER_HANDLE'],
    allowSlatted: true,
    allowFixedPanel: true,
  },
  {
    type: 'SWING_DOOR_1F',
    name: 'Porta de Abrir / Giro 1 Folha',
    category: 'Portas de Alumínio',
    defaultWidth: 900,
    defaultHeight: 2100,
    description: 'Porta clássica de giro com dobradiças laterais, fechadura e maçaneta.',
    supportedOpeningDirections: ['LEFT_TO_RIGHT', 'RIGHT_TO_LEFT', 'OUTSIDE', 'INSIDE'],
    supportedHandles: ['LEVER_HANDLE', 'BAR_TUBULAR'],
    allowSlatted: true,
  },
  {
    type: 'SWING_DOOR_2F',
    name: 'Porta de Abrir / Giro 2 Folhas',
    category: 'Portas de Alumínio',
    defaultWidth: 1600,
    defaultHeight: 2150,
    description: 'Porta dupla de abrir com duas folhas simétricas e abertura central.',
    supportedOpeningDirections: ['CENTER_TO_SIDES', 'OUTSIDE', 'INSIDE'],
    supportedHandles: ['LEVER_HANDLE', 'BAR_TUBULAR'],
    allowSlatted: true,
  },
  {
    type: 'SLIDING_WINDOW_2F',
    name: 'Janela de Correr 2 Folhas',
    category: 'Janelas de Alumínio',
    defaultWidth: 1200,
    defaultHeight: 1200,
    description: 'Janela 2 folhas de correr (1 fixa + 1 móvel ou 2 móveis) com fechos concha.',
    supportedOpeningDirections: ['LEFT_TO_RIGHT', 'RIGHT_TO_LEFT', 'CENTER_TO_SIDES'],
    supportedHandles: ['SHELL_LOCK', 'NONE'],
  },
  {
    type: 'SLIDING_WINDOW_4F',
    name: 'Janela de Correr 4 Folhas',
    category: 'Janelas de Alumínio',
    defaultWidth: 2000,
    defaultHeight: 1200,
    description: 'Janela 4 folhas com abertura central (2 fixas laterais + 2 móveis centrais).',
    supportedOpeningDirections: ['CENTER_TO_SIDES'],
    supportedHandles: ['SHELL_LOCK', 'NONE'],
  },
  {
    type: 'MAXIM_AR_WINDOW',
    name: 'Janela Maxim-Ar / Basculante',
    category: 'Janelas de Alumínio',
    defaultWidth: 800,
    defaultHeight: 600,
    description: 'Janela projetante com braço articulado para ventilação superior.',
    supportedOpeningDirections: ['OUTSIDE'],
    supportedHandles: ['SHELL_LOCK', 'LEVER_HANDLE', 'NONE'],
  },
  {
    type: 'GLASS_BOX_FRONTAL',
    name: 'Box de Banheiro Frontal F1',
    category: 'Boxes de Vidro',
    defaultWidth: 1200,
    defaultHeight: 1900,
    description: 'Box frontal reto com 1 vidro fixo + 1 porta de correr com roldanas superiores.',
    supportedOpeningDirections: ['LEFT_TO_RIGHT', 'RIGHT_TO_LEFT'],
    supportedHandles: ['SHELL_LOCK', 'BAR_TUBULAR', 'NONE'],
  },
  {
    type: 'GLASS_BOX_CORNER',
    name: 'Box de Banheiro Canto em L',
    category: 'Boxes de Vidro',
    defaultWidth: 1000,
    defaultHeight: 1900,
    description: 'Box de canto angular em L com 2 vidros fixos e 2 portas de correr de encontro.',
    supportedOpeningDirections: ['CENTER_TO_SIDES'],
    supportedHandles: ['SHELL_LOCK', 'NONE'],
  },
  {
    type: 'FIXED_GLASS_FACADE',
    name: 'Painel Fixo / Fachada / Pele de Vidro',
    category: 'Guarda-Corpos & Fachadas',
    defaultWidth: 2400,
    defaultHeight: 2600,
    description: 'Painel fixo estruturado em alumínio com vidros laminados ou temperados.',
    supportedOpeningDirections: [],
    supportedHandles: ['NONE'],
  }
];

export function getTemplateDefinition(type?: DoorTemplateType): TemplateDefinition {
  const found = TEMPLATE_DEFINITIONS.find((t) => t.type === type);
  return found || TEMPLATE_DEFINITIONS[0];
}
