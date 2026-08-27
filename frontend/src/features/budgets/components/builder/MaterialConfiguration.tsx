import React, { useMemo } from 'react';
import type { CategoryRequirement, MaterialSelection, DoorTemplateType } from '../../types';
import type { GlassDTO, ProfileDTO, HardwareDTO, FilmDTO } from '../../../catalog/types';
import { calcQuantityForCategory, formatBRL } from '../../utils/calculations';

interface MaterialConfigurationProps {
  requirements: CategoryRequirement[];
  selections: MaterialSelection[];
  onSelectionChange: (requirementId: string, materialId: string) => void;
  glasses: GlassDTO[];
  profiles: ProfileDTO[];
  hardwares: HardwareDTO[];
  films: FilmDTO[];
  widthMm: number;
  heightMm: number;
  quantity: number;
  templateType: DoorTemplateType;
  errors?: Record<string, string>;
  isLoadingMaterials: boolean;
}

const CATEGORY_ICONS: Record<string, string> = {
  GLASS: 'window',
  PROFILE: 'category',
  HARDWARE: 'settings',
  FILM: 'layers',
};

const CATEGORY_LABELS: Record<string, string> = {
  GLASS: 'Vidro',
  PROFILE: 'Perfil de Alumínio',
  HARDWARE: 'Ferragem',
  FILM: 'Película',
};

export const MaterialConfiguration: React.FC<MaterialConfigurationProps> = ({
  requirements,
  selections,
  onSelectionChange,
  glasses,
  profiles,
  hardwares,
  films,
  widthMm,
  heightMm,
  quantity,
  templateType,
  errors = {},
  isLoadingMaterials,
}) => {
  // Monta as opções de seleção por categoria
  const optionsByCategory = useMemo(() => ({
    GLASS: glasses.filter((g) => g.active !== false).map((g) => ({
      id: g.id,
      name: g.name,
      description: `${g.thicknessMm}mm — ${g.colorFinish}`,
      unitPrice: g.salePrice ?? g.pricePerSqm ?? 0,
      unit: 'm²',
    })),
    PROFILE: profiles.filter((p) => p.active !== false).map((p) => ({
      id: p.id,
      name: p.name,
      description: `${p.colorFinish} — ${p.commercialReference}`,
      unitPrice: p.salePrice ?? 0,
      unit: p.unitMeasure,
    })),
    HARDWARE: hardwares.filter((h) => h.active !== false).map((h) => ({
      id: h.id,
      name: h.name,
      description: `${h.skuCode ?? ''} ${h.commercialReference ?? ''}`.trim(),
      unitPrice: h.salePrice ?? 0,
      unit: h.unitMeasure,
    })),
    FILM: films.filter((f) => f.active !== false).map((f) => ({
      id: f.id,
      name: f.name,
      description: `${f.colorFinish}`,
      unitPrice: f.salePrice ?? 0,
      unit: 'm²',
    })),
  }), [glasses, profiles, hardwares, films]);

  if (isLoadingMaterials) {
    return (
      <div className="flex items-center gap-sm text-secondary py-md">
        <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
        <span className="font-body-sm">Carregando materiais do catálogo...</span>
      </div>
    );
  }

  if (requirements.length === 0) {
    return (
      <div className="bg-surface-container border border-outline-variant rounded-md p-sm text-xs text-secondary font-body italic">
        Este template não possui requisitos de materiais cadastrados.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-md">
      {requirements.map((req) => {
        const options = optionsByCategory[req.categoryType as keyof typeof optionsByCategory] ?? [];
        const selection = selections.find((s) => s.requirementId === req.id);
        const selectedMaterial = options.find((o) => o.id === selection?.materialId);
        const icon = CATEGORY_ICONS[req.categoryType] ?? 'inventory_2';
        const catLabel = CATEGORY_LABELS[req.categoryType] ?? req.categoryType;

        // Calcula quantidade estimada
        const calcResult = (widthMm > 0 && heightMm > 0 && quantity > 0)
          ? calcQuantityForCategory(req.categoryType, widthMm, heightMm, quantity, templateType)
          : null;

        const totalPrice = calcResult && selectedMaterial
          ? calcResult.value * selectedMaterial.unitPrice
          : 0;

        const hasError = Boolean(errors[req.id]);

        return (
          <div
            key={req.id}
            className={`bg-surface-container-lowest border rounded-lg p-md transition-all ${hasError ? 'border-error' : 'border-outline-variant'}`}
          >
            {/* Header da categoria */}
            <div className="flex items-center justify-between mb-sm">
              <div className="flex items-center gap-xs">
                <span className={`material-symbols-outlined text-[18px] ${hasError ? 'text-error' : 'text-secondary'}`}>
                  {icon}
                </span>
                <span className="font-label font-semibold text-on-surface text-sm">
                  {req.label}
                </span>
                <span className={`text-xs px-xs py-[2px] rounded-full ${catLabel ? 'bg-surface-container text-on-surface-variant' : ''}`}>
                  {catLabel}
                </span>
                {req.isOptional && (
                  <span className="text-xs text-on-surface-variant italic">(opcional)</span>
                )}
              </div>
            </div>

            {/* Select de material */}
            <div className="flex flex-col gap-xs">
              <select
                id={`material-${req.id}`}
                value={selection?.materialId ?? ''}
                onChange={(e) => onSelectionChange(req.id, e.target.value)}
                className={`w-full px-sm py-sm bg-surface-container-lowest border rounded-sm font-body-sm text-body-sm text-on-surface focus:border-primary focus:border-2 focus:outline-none transition-all appearance-none cursor-pointer ${hasError ? 'border-error' : 'border-outline-variant'}`}
              >
                <option value="">
                  {req.isOptional ? '(Sem película)' : `Selecionar ${catLabel}...`}
                </option>
                {options.length === 0 && (
                  <option disabled>Nenhum material cadastrado nesta categoria</option>
                )}
                {options.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name} — {opt.description}
                  </option>
                ))}
              </select>
              {hasError && (
                <span className="text-error text-xs font-body">{errors[req.id]}</span>
              )}
            </div>

            {/* Detalhes do material selecionado */}
            {selectedMaterial && (
              <div className="mt-sm bg-surface-container rounded-md p-sm border border-outline-variant">
                <div className="flex flex-wrap items-center gap-md text-xs font-data-mono">
                  <div>
                    <span className="text-on-surface-variant">Unidade: </span>
                    <span className="text-on-surface font-semibold">{selectedMaterial.unit}</span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant">Preço unit.: </span>
                    <span className="text-on-surface font-semibold">{formatBRL(selectedMaterial.unitPrice)}</span>
                  </div>
                  {calcResult && (
                    <>
                      <div>
                        <span className="text-on-surface-variant">Qtd estimada: </span>
                        <span className="text-primary font-semibold">{calcResult.value} {calcResult.unit}</span>
                      </div>
                      <div className="ml-auto">
                        <span className="text-on-surface-variant">Subtotal: </span>
                        <span className="text-on-surface font-bold">{formatBRL(totalPrice)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
