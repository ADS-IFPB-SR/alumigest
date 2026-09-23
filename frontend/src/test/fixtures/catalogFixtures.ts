import type { GlassDTO, ProfileDTO, HardwareDTO, FilmDTO, MaterialSummary } from '@/features/catalog/types';

/**
 * Fixture factory para GlassDTO (Vidro).
 */
export function buildMockGlass(overrides?: Partial<GlassDTO>): GlassDTO {
  return {
    id: 'g-1',
    name: 'VIDRO TEMPERADO INCOLOR 8MM',
    thicknessMm: 8,
    colorFinish: 'INCOLOR',
    maxWidthMm: 2400,
    maxHeightMm: 3000,
    costPrice: 120.0,
    salePrice: 220.0,
    active: true,
    familyCode: 'TEMPERADO',
    ...overrides,
  };
}

/**
 * Fixture factory para ProfileDTO (Perfil de Alumínio).
 */
export function buildMockProfile(overrides?: Partial<ProfileDTO>): ProfileDTO {
  return {
    id: 'p-1',
    skuCode: 'ALU-SUP-01',
    commercialReference: 'ALU-SUP-01',
    commercialLine: 'SUPREMA',
    description: 'PERFIL TRILHO SUPERIOR 2 VIAS',
    name: 'PERFIL TRILHO SUPERIOR 2 VIAS',
    colorFinish: 'BRANCO',
    weight: 1.25,
    length: 6000,
    standardLengthM: 6,
    costPrice: 55.0,
    salePrice: 110.0,
    active: true,
    isHandle: false,
    unitMeasure: 'm',
    familyCode: 'LINHA_SUPREMA',
    ...overrides,
  };
}

/**
 * Fixture factory para HardwareDTO (Ferragem / Acessório).
 */
export function buildMockHardware(overrides?: Partial<HardwareDTO>): HardwareDTO {
  return {
    id: 'h-1',
    skuCode: 'HW-FEC-01',
    name: 'FECHO CONCHA LATERAL COM CHAVE',
    unitMeasure: 'UN',
    costPrice: 25.0,
    salePrice: 60.0,
    active: true,
    isHandle: true,
    familyCode: 'FECHOS',
    ...overrides,
  };
}

/**
 * Fixture factory para FilmDTO (Película).
 */
export function buildMockFilm(overrides?: Partial<FilmDTO>): FilmDTO {
  return {
    id: 'f-1',
    name: 'PELÍCULA SOLAR FUMÊ G5',
    filmType: 'SOLAR',
    colorFinish: 'SOLAR',
    thicknessMm: 0.05,
    standardLengthM: 30,
    maxWidthMm: 1520,
    costPrice: 20.0,
    salePrice: 50.0,
    active: true,
    familyCode: 'SOLAR_G5',
    ...overrides,
  };
}

/**
 * Fixture factory para MaterialSummary (Resumo unificado para o builder de esquadrias).
 */
export function buildMockMaterialSummary(overrides?: Partial<MaterialSummary>): MaterialSummary {
  return {
    id: 'mat-1',
    name: 'PERFIL TRILHO SUPERIOR 2 VIAS',
    categoryType: 'PROFILE',
    skuCode: 'ALU-SUP-01',
    unitMeasure: 'm',
    salePrice: 110.0,
    active: true,
    ...overrides,
  };
}
