import type { DoorTemplateType } from '../types';
import { TEMPLATE_TYPE_INFO } from '../types';

/**
 * Mapeia a família de abertura do catálogo (backend DoorTemplateType: SWING, SLIDING, etc.)
 * para as opções de templates visuais (SVG) permitidas no Budget.
 * O usuário deverá escolher uma destas opções no modal.
 */
export const CATALOG_FAMILY_TO_SVG_OPTIONS: Record<string, DoorTemplateType[]> = {
  SWING: ['SWING_DOOR_1F', 'SWING_DOOR_2F', 'PIVOTING_DOOR'],
  SLIDING: ['SLIDING_DOOR_2F', 'SLIDING_DOOR_4F', 'SLIDING_WINDOW_2F', 'SLIDING_WINDOW_4F'],
  TILT: ['MAXIM_AR_WINDOW'],
};

/**
 * Retorna a lista de templates visuais (SVG) disponíveis para uma dada família do catálogo.
 * Se o tipo for desconhecido ou nulo, retorna todos os templates disponíveis para que o usuário escolha.
 */
export function getAvailableSvgTemplatesForCatalogType(catalogType?: string | null): DoorTemplateType[] {
  if (!catalogType || !CATALOG_FAMILY_TO_SVG_OPTIONS[catalogType]) {
    // Se não há família definida, permite qualquer template visual existente
    return Object.keys(TEMPLATE_TYPE_INFO) as DoorTemplateType[];
  }
  return CATALOG_FAMILY_TO_SVG_OPTIONS[catalogType];
}
