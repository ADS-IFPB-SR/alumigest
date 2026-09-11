import React from 'react';
import type { MaterialSelection, CategoryType } from '../../../types';
import type { GlassDTO, ProfileDTO, HardwareDTO, FilmDTO } from '../../../../catalog/types';
import { formatBRL } from '../../../utils/calculations';
import { getSwatchColor } from '../../../utils/mapCatalogTemplate';

export interface Step2MaterialsProps {
  materialSelections: MaterialSelection[];
  glasses: GlassDTO[];
  profiles: ProfileDTO[];
  hardwares: HardwareDTO[];
  films: FilmDTO[];
  categoryIcons: Record<CategoryType, string>;
  onAddMaterial: (catType: CategoryType) => void;
  onRemoveMaterial: (reqId: string) => void;
  onMaterialChange: (reqId: string, materialId: string) => void;
  onMaterialQtyChange: (reqId: string, val: string) => void;
}

export const Step2Materials: React.FC<Step2MaterialsProps> = ({
  materialSelections,
  glasses,
  profiles,
  hardwares,
  films,
  categoryIcons,
  onAddMaterial,
  onRemoveMaterial,
  onMaterialChange,
  onMaterialQtyChange,
}) => {
  // Dicionário canônico de catálogos por categoria para eliminar cascatas de if/else
  type CatalogItem = {
    id: string;
    name: string;
    salePrice?: number;
    pricePerSqm?: number;
    unitMeasure?: string;
    colorFinish?: string;
    familyCode?: string;
  };

  const getCatalogItemPrice = (item: CatalogItem): number => item.salePrice ?? item.pricePerSqm ?? 0;

  const catalogByCategory: Record<CategoryType, CatalogItem[]> = {
    GLASS: glasses as CatalogItem[],
    PROFILE: profiles as CatalogItem[],
    HARDWARE: hardwares as CatalogItem[],
    FILM: films as CatalogItem[],
  };
  return (
    <div className="flex flex-col gap-md animate-fadeIn flex-1 h-full">
      {/* Lista de Insumos da Esquadria */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md shadow-xs flex flex-col gap-sm flex-1">
        <div className="flex items-center justify-between pb-xs border-b border-outline-variant flex-wrap gap-xs shrink-0">
          <div className="flex items-center gap-xs">
            <span className="material-symbols-outlined text-[18px] text-primary">inventory_2</span>
            <h3 className="text-sm font-label font-bold text-on-surface uppercase tracking-wider">
              Composição de Insumos
            </h3>
          </div>

          {/* Botões rápidos para adicionar insumos */}
          <div className="flex items-center gap-xs flex-wrap">
            <button
              type="button"
              onClick={() => onAddMaterial('GLASS')}
              className="px-2.5 py-1 rounded text-xs font-label font-semibold text-primary hover:bg-primary/10 transition-colors border border-primary/40"
            >
              + Vidro
            </button>
            <button
              type="button"
              onClick={() => onAddMaterial('PROFILE')}
              className="px-2.5 py-1 rounded text-xs font-label font-semibold text-primary hover:bg-primary/10 transition-colors border border-primary/40"
            >
              + Perfil
            </button>
            <button
              type="button"
              onClick={() => onAddMaterial('HARDWARE')}
              className="px-2.5 py-1 rounded text-xs font-label font-semibold text-primary hover:bg-primary/10 transition-colors border border-primary/40"
            >
              + Ferragem
            </button>
            <button
              type="button"
              onClick={() => onAddMaterial('FILM')}
              className="px-2.5 py-1 rounded text-xs font-label font-semibold text-primary hover:bg-primary/10 transition-colors border border-primary/40"
            >
              + Película
            </button>
          </div>
        </div>

        {materialSelections.length === 0 ? (
          <div className="text-center py-md text-sm text-on-surface-variant font-body bg-surface-container-low rounded border border-outline-variant/60 my-auto">
            <p>Nenhum insumo configurado para este produto.</p>
            <p className="mt-xs text-secondary text-xs">Utilize os botões acima para adicionar insumos ao item.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-xs flex-1 max-h-[520px] lg:max-h-[580px] overflow-y-auto pr-1">
            {materialSelections.map((sel) => {
              const reqId = sel.requirementId;
              const categoryType = sel.categoryType;
              const iconName = categoryIcons[categoryType] ?? 'category';


              const categoryPrice = sel.totalPrice;
              const unitMeasure = sel.unitMeasure ?? (categoryType === 'GLASS' || categoryType === 'FILM' ? 'm²' : categoryType === 'PROFILE' ? 'm' : 'un');

              // Consulta direta ao dicionário de catálogo por categoria
              const categoryItems = catalogByCategory[categoryType] ?? [];
              const optionsList = categoryItems.map((item) => ({
                id: item.id,
                name: item.name,
                price: item.salePrice ?? item.pricePerSqm ?? 0,
                unit: item.unitMeasure ?? (categoryType === 'GLASS' || categoryType === 'FILM' ? 'm²' : 'un'),
              }));

              // Encontra o item selecionado e suas variantes da mesma família
              const currentCatalogItem = categoryItems.find((item) => item.id === sel.materialId);
              const familyVariants = currentCatalogItem?.familyCode
                ? categoryItems.filter((item) => item.familyCode === currentCatalogItem.familyCode)
                : [];

              return (
                <div
                  key={reqId}
                  className={`bg-surface-container-low border rounded-md p-sm sm:p-md flex flex-col gap-xs transition-colors ${
                    sel.isBelowPhysicalMinimum
                      ? 'border-amber-500/70 bg-amber-500/5'
                      : 'border-outline-variant/60 hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-xs min-w-0">
                      <span className="material-symbols-outlined text-[18px] text-primary">{iconName}</span>
                      <span className="text-sm font-label font-semibold text-on-surface truncate">
                        {sel.label} {sel.isOptional && <span className="text-on-surface-variant font-normal text-xs">(Opcional)</span>}
                      </span>
                      {currentCatalogItem?.familyCode && (
                        <span className="text-[10px] uppercase font-data-mono px-1.5 py-0.5 rounded bg-surface border border-outline-variant text-secondary font-medium tracking-wide">
                          Família: {currentCatalogItem.familyCode}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-xs shrink-0">
                      <span className="font-data-mono font-bold text-primary text-sm sm:text-base">
                        {categoryPrice !== undefined
                          ? formatBRL(categoryPrice)
                          : sel.materialId
                          ? `${formatBRL(sel.unitPrice)} / ${unitMeasure}`
                          : '—'}
                      </span>
                      {sel.isOptional && (
                        <button
                          type="button"
                          onClick={() => onRemoveMaterial(reqId)}
                          className="p-1 text-on-surface-variant hover:text-error hover:bg-error/10 rounded transition-colors cursor-pointer"
                          title="Remover este insumo adicional"
                          aria-label={`Remover ${sel.label}`}
                        >
                          <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-xs mt-xs">
                    <select
                      value={sel.materialId ?? ''}
                      onChange={(e) => onMaterialChange(reqId, e.target.value)}
                      aria-label={`Selecionar material para ${sel.label}`}
                      className="flex-1 text-sm py-2 px-2.5 bg-surface border border-outline-variant rounded font-body text-on-surface focus:border-primary focus:outline-none min-w-0 transition-colors"
                    >
                      {sel.isOptional && <option value="">-- Sem {sel.label} / Nenhuma --</option>}
                      {!sel.isOptional && !sel.materialId && (
                        <option value="">-- Selecione o material --</option>
                      )}
                      {optionsList.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.name} · {formatBRL(opt.price)} / {opt.unit}
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center gap-[2px] shrink-0">
                      <input
                        type="number"
                        step={unitMeasure === 'UN' || unitMeasure === 'PAR' || unitMeasure === 'PAIR' || unitMeasure === 'un' ? '1' : '0.01'}
                        min={0}
                        value={sel.quantity ?? ''}
                        onChange={(e) => onMaterialQtyChange(reqId, e.target.value)}
                        disabled={!sel.materialId}
                        placeholder="Qtd"
                        aria-label={`Quantidade de ${sel.label}`}
                        className={`w-20 py-2 px-2 bg-surface border rounded text-sm font-data-mono text-center focus:outline-none disabled:opacity-40 transition-colors ${
                          sel.isBelowPhysicalMinimum
                            ? 'border-amber-500 text-amber-900 dark:text-amber-200 bg-amber-50/50 dark:bg-amber-950/20'
                            : 'border-outline-variant text-on-surface focus:border-primary'
                        }`}
                      />
                      <span className="text-xs font-data-mono text-on-surface bg-surface-container px-2.5 py-2 rounded border border-outline-variant min-w-[36px] text-center font-medium">
                        {unitMeasure}
                      </span>
                    </div>
                  </div>

                  {/* Seleção Rápida de Variantes por Família (Color Swatches) */}
                  {familyVariants.length > 1 && (
                    <div className="flex items-center gap-2 pt-1 border-t border-outline-variant/40 mt-1 flex-wrap">
                      <span className="text-[11px] font-label text-on-surface-variant font-medium">
                        Cores da Família:
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {familyVariants.map((v) => {
                          const isSelected = v.id === sel.materialId;
                          const bgHex = getSwatchColor(v.colorFinish || v.name);
                          return (
                            <button
                              key={v.id}
                              type="button"
                              onClick={() => onMaterialChange(reqId, v.id)}
                              title={`${v.colorFinish || v.name} (${formatBRL(getCatalogItemPrice(v))})`}
                              className={`group relative flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-body transition-all ${
                                isSelected
                                  ? 'border-primary bg-primary/10 font-bold shadow-2xs'
                                  : 'border-outline-variant hover:border-outline bg-surface hover:bg-surface-container'
                              }`}
                            >
                              <span
                                className="w-3 h-3 rounded-full border border-black/20 shadow-2xs shrink-0"
                                style={{ backgroundColor: bgHex }}
                              />
                              <span className="truncate max-w-[110px] text-[11px]">
                                {v.colorFinish || v.name}
                              </span>
                              {isSelected && (
                                <span className="material-symbols-outlined text-[13px] text-primary">check</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Warning Visual Não-Bloqueante de Corte ou Perímetro Insuficiente */}
                  {sel.isBelowPhysicalMinimum && (
                    <div className="flex items-start gap-1.5 text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 p-2 rounded border border-amber-300 dark:border-amber-800 animate-fadeIn mt-1">
                      <span className="material-symbols-outlined text-[16px] text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                        warning
                      </span>
                      <div className="flex-1 leading-tight">
                        <span className="font-semibold">Atenção ao corte: </span>
                        <span>
                          {sel.warningMessage ||
                            `A quantidade informada (${sel.quantity ?? 0} ${unitMeasure}) é inferior à área/perímetro físico da esquadria (${sel.physicalMinimumQuantity ?? 0} ${unitMeasure}). Risco de falta de material!`}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
