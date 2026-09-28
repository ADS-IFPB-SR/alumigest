import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useBuilderCatalog } from '@/features/budgets/components/builder/hooks/useBuilderCatalog';

const mockProfiles = [
  { id: 'p1', name: 'Perfil Linha 25', salePrice: 40, unitMeasure: 'm', colorFinish: 'BRANCO', isHandle: false },
  { id: 'p2', name: 'Perfil Puxador Tubular', salePrice: 85, unitMeasure: 'm', colorFinish: 'PRETO', isHandle: true },
];

const mockHardwares = [
  { id: 'h1', name: 'Roldana 1125', salePrice: 15, unitMeasure: 'un', isHandle: false },
  { id: 'h2', name: 'Fecho Concha com Chave', salePrice: 45, unitMeasure: 'un', isHandle: false },
  { id: 'h3', name: 'Puxador H Inox 60cm', salePrice: 120, unitMeasure: 'un', isHandle: true },
];

const mockGlasses = [
  { id: 'g1', name: 'Vidro Incolor 8mm', salePrice: 110, colorFinish: 'Incolor' },
  { id: 'g2', name: 'Vidro Fumê 8mm', salePrice: 140, colorFinish: 'Fumê' },
];

const mockProducts = [
  { id: 'prod-1', name: 'Janela de Correr 2 Folhas', templateType: 'SLIDING_DOOR_2F', isActive: true, categoryRequirements: ['GLASS', 'PROFILE'] },
  { id: 'prod-2', name: 'Porta Antiga Desativada', templateType: 'SWING_DOOR_1F', isActive: false },
];

vi.mock('../../../../features/catalog/hooks/useCatalog', () => ({
  useProducts: () => ({ data: { content: mockProducts } }),
  useGlasses: () => ({ data: { content: mockGlasses } }),
  useProfiles: () => ({ data: { content: mockProfiles } }),
  useHardwares: () => ({ data: { content: mockHardwares } }),
  useFilms: () => ({ data: { content: [] } }),
}));

describe('useBuilderCatalog — Testes de Integração com o Catálogo', () => {
  it('[Técnica: Classes de Equivalência - Filtro Ativos/Inativos] deve listar apenas templates de esquadrias ativos', () => {
    const { result } = renderHook(() => useBuilderCatalog());

    expect(result.current.templates).toHaveLength(1);
    expect(result.current.templates[0].id).toBe('prod-1');
    expect(result.current.templates[0].name).toBe('Janela de Correr 2 Folhas');
  });

  it('[Técnica: Tabela de Decisão - Extração de Cores Dinâmicas] deve combinar cores base com as do catálogo', () => {
    const { result } = renderHook(() => useBuilderCatalog());

    expect(result.current.dynamicAluminumColors).toContain('BRANCO');
    expect(result.current.dynamicAluminumColors).toContain('PRETO');
    expect(result.current.dynamicGlassFinishes).toContain('Incolor');
    expect(result.current.dynamicGlassFinishes).toContain('Fumê');
  });

  it('[Técnica: Tabela de Decisão - Puxadores de Perfil] deve filtrar apenas perfis marcados como isHandle ou com nome puxador', () => {
    const { result } = renderHook(() => useBuilderCatalog());

    expect(result.current.availableHandleProfiles).toHaveLength(1);
    expect(result.current.availableHandleProfiles[0].id).toBe('p2');
    expect(result.current.availableHandleProfiles[0].name).toBe('Perfil Puxador Tubular');
  });

  it('[Técnica: Tabela de Decisão - Ferragens de Fechamento/Puxador] deve identificar puxadores, fechos concha e fechaduras', () => {
    const { result } = renderHook(() => useBuilderCatalog());

    const names = result.current.availableHandleHardwares.map((h) => h.name);
    expect(names).toContain('Fecho Concha com Chave');
    expect(names).toContain('Puxador H Inox 60cm');
    expect(names).not.toContain('Roldana 1125');
  });
});
