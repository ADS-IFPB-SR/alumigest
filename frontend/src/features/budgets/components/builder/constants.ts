import type { CategoryType } from '../../types';

export const BASE_ALUMINUM_COLORS = [
  'Alumínio Fosco / Anodizado',
  'Preto Fosco',
  'Branco Brilhante',
  'Bronze / Champanhe',
  'Cromado / Polido',
  'Dourado / Gold',
];

export const BASE_GLASS_FINISHES = [
  'Incolor',
  'Fumê / Cinza',
  'Verde',
  'Canelado / Texturizado',
  'Reflecta Bronze',
];

export const CATEGORY_ICONS: Record<CategoryType, string> = {
  GLASS: 'grid_view',
  PROFILE: 'view_stream',
  HARDWARE: 'hardware',
  FILM: 'layers',
  ROLLERS: 'tune',
};

export const CATEGORY_LABELS: Record<string, string> = {
  GLASS: 'Vidros',
  PROFILE: 'Perfis de Alumínio',
  HARDWARE: 'Ferragens / Componentes',
  FILM: 'Películas',
  ROLLERS: 'Roldanas / Deslizamento',
};

export const DEFAULT_WIDTH = 1600;
export const DEFAULT_HEIGHT = 2150;
