import { useMemo } from 'react';
import type { Product, GlassDTO, ProfileDTO, HardwareDTO, FilmDTO } from '../../../../catalog/types';
import {
  useProducts,
  useGlasses,
  useProfiles,
  useHardwares,
  useFilms,
} from '../../../../catalog/hooks/useCatalog';
import { getDefaultSvgTemplateForCatalogType } from '../../../utils/mapCatalogTemplate';
import { BASE_ALUMINUM_COLORS, BASE_GLASS_FINISHES } from '../constants';
import type { WindowTemplate, CategoryType } from '../../../types';

/**
 * Subhook responsável por gerenciar a integração com as fontes de catálogo do sistema:
 * - Templates de produtos de esquadrias ativos.
 * - Materiais brutos (Vidros, Perfis, Ferragens, Películas).
 * - Cores e acabamentos dinâmicos extraídos dos itens cadastrados no estoque.
 * - Listas especializadas de perfis e ferragens elegíveis para puxadores.
 */
export function useBuilderCatalog() {
  const { data: productsData } = useProducts();

  const templates = useMemo(() => {
    if (!productsData?.content) return [];
    return (productsData.content as unknown as Product[])
      .filter((p) => p.isActive)
      .map((p): WindowTemplate => {
        const defaultSvg = getDefaultSvgTemplateForCatalogType(p.templateType, p.name, p.templateConfig);
        return {
          id: p.id,
          name: p.name,
          categoryId: (p as any).categoryId ?? '',
          categoryName: p.categoryName ?? '',
          isActive: p.isActive,
          laborCost: 0,
          catalogTemplateType: p.templateType ?? null,
          templateType: defaultSvg,
          templateConfig: p.templateConfig ?? undefined,
          categoryRequirements: p.categoryRequirements ?? [],
          items: [],
        };
      });
  }, [productsData]);

  const { data: glassesData } = useGlasses();
  const { data: profilesData } = useProfiles();
  const { data: hardwaresData } = useHardwares();
  const { data: filmsData } = useFilms();

  const glasses: GlassDTO[] = useMemo(() => (glassesData?.content ?? []) as GlassDTO[], [glassesData]);
  const profiles: ProfileDTO[] = useMemo(() => (profilesData?.content ?? []) as ProfileDTO[], [profilesData]);
  const hardwares: HardwareDTO[] = useMemo(() => (hardwaresData?.content ?? []) as HardwareDTO[], [hardwaresData]);
  const films: FilmDTO[] = useMemo(() => (filmsData?.content ?? []) as FilmDTO[], [filmsData]);

  const dynamicAluminumColors = useMemo(() => {
    const fromCatalog = profiles
      .map((p) => p.colorFinish)
      .filter((c): c is string => Boolean(c && c.trim()));
    return Array.from(new Set([...BASE_ALUMINUM_COLORS, ...fromCatalog]));
  }, [profiles]);

  const dynamicGlassFinishes = useMemo(() => {
    const fromCatalog = glasses
      .map((g) => g.colorFinish)
      .filter((c): c is string => Boolean(c && c.trim()));
    return Array.from(new Set([...BASE_GLASS_FINISHES, ...fromCatalog]));
  }, [glasses]);

  const availableHandleProfiles = useMemo(() => {
    return profiles.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.salePrice ?? 0,
      unit: p.unitMeasure ?? 'm',
      categoryType: 'PROFILE' as CategoryType,
      colorFinish: p.colorFinish,
    }));
  }, [profiles]);

  const availableHandleHardwares = useMemo(() => {
    return hardwares.map((h) => ({
      id: h.id,
      name: h.name,
      price: h.salePrice ?? 0,
      unit: h.unitMeasure ?? 'un',
      categoryType: 'HARDWARE' as CategoryType,
    }));
  }, [hardwares]);

  return {
    templates,
    glasses,
    profiles,
    hardwares,
    films,
    dynamicAluminumColors,
    dynamicGlassFinishes,
    availableHandleProfiles,
    availableHandleHardwares,
  };
}
