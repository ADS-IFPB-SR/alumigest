import React from 'react';
import type { MaterialSelection, CategoryType } from '../../../types';
import type { GlassDTO, ProfileDTO, HardwareDTO, FilmDTO } from '../../../../catalog/types';
import { formatBRL } from '../../../utils/calculations';

export interface Step2MaterialsProps {
  aluminumColor?: string;
  glassFinish?: string;
  dynamicAluminumColors: string[];
  dynamicGlassFinishes: string[];
  materialSelections: MaterialSelection[];
  glasses: GlassDTO[];
  profiles: ProfileDTO[];
  hardwares: HardwareDTO[];
  films: FilmDTO[];
  categoryIcons: Record<CategoryType, string>;
  onAluminumColorChange: (color: string) => void;
  onGlassFinishChange: (finish: string) => void;
  onAddMaterial: (catType: CategoryType) => void;
  onRemoveMaterial: (reqId: string) => void;
  onMaterialChange: (reqId: string, materialId: string) => void;
  onMaterialQtyChange: (reqId: string, val: string) => void;
}

export const Step2Materials: React.FC<Step2MaterialsProps> = ({
  aluminumColor,
  glassFinish,
  dynamicAluminumColors,
  dynamicGlassFinishes,
  materialSelections,
  glasses,
  profiles,
  hardwares,
  films,
  categoryIcons,
  onAluminumColorChange,
  onGlassFinishChange,
  onAddMaterial,
  onRemoveMaterial,
  onMaterialChange,
  onMaterialQtyChange,
}) => {
  return (
    <div className="flex flex-col gap-md animate-fadeIn">
      {/* Cores e Acabamentos Globais */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md shadow-xs flex flex-col gap-sm">
        <div className="flex items-center justify-between pb-xs border-b border-outline-variant/50">
          <h3 className="text-sm font-label font-bold text-on-surface flex items-center gap-xs uppercase tracking-wider">
            <span className="material-symbols-outlined text-[18px] text-primary">palette</span>
            Acabamentos do Modelo
          </h3>
          <span className="text-xs font-label text-on-surface-variant">Cores Gerais</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
          <div>
            <label htmlFor="aluminum-color-select" className="text-xs sm:text-sm font-label font-medium text-on-surface block mb-1">
              Cor do Alumínio
            </label>
            <select
              id="aluminum-color-select"
              value={aluminumColor}
              onChange={(e) => onAluminumColorChange(e.target.value)}
              aria-label="Cor do Alumínio"
              className="w-full text-sm py-2 px-2.5 bg-surface border border-outline-variant rounded font-body text-on-surface focus:border-primary focus:outline-none transition-colors"
            >
              {dynamicAluminumColors.map((col) => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="glass-finish-select" className="text-xs sm:text-sm font-label font-medium text-on-surface block mb-1">
              Acabamento do Vidro
            </label>
            <select
              id="glass-finish-select"
              value={glassFinish}
              onChange={(e) => onGlassFinishChange(e.target.value)}
              aria-label="Acabamento do Vidro"
              className="w-full text-sm py-2 px-2.5 bg-surface border border-outline-variant rounded font-body text-on-surface focus:border-primary focus:outline-none transition-colors"
            >
              {dynamicGlassFinishes.map((fin) => (
                <option key={fin} value={fin}>{fin}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Insumos da Esquadria */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md shadow-xs flex flex-col gap-sm">
        <div className="flex items-center justify-between pb-xs border-b border-outline-variant flex-wrap gap-xs">
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
              onClick={() => onAddMaterial('ROLLERS')}
              className="px-2.5 py-1 rounded text-xs font-label font-semibold text-primary hover:bg-primary/10 transition-colors border border-primary/40"
            >
              + Roldana
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
          <div className="text-center py-md text-sm text-on-surface-variant font-body bg-surface-container-low rounded border border-outline-variant/60">
            <p>Nenhum insumo configurado para este produto.</p>
            <p className="mt-xs text-secondary text-xs">Utilize os botões acima para adicionar insumos ao item.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-xs max-h-[380px] overflow-y-auto pr-1">
            {materialSelections.map((sel) => {
              const reqId = sel.requirementId;
              const categoryType = sel.categoryType;
              const iconName = categoryIcons[categoryType] ?? 'category';

              let optionsList: { id: string; name: string; price: number; unit: string }[] = [];
              if (categoryType === 'GLASS') {
                optionsList = glasses.map((g) => ({
                  id: g.id,
                  name: g.name,
                  price: g.salePrice ?? g.pricePerSqm ?? 0,
                  unit: 'm²',
                }));
              } else if (categoryType === 'PROFILE') {
                optionsList = profiles.map((p) => ({
                  id: p.id,
                  name: p.name,
                  price: p.salePrice ?? 0,
                  unit: p.unitMeasure ?? 'm',
                }));
              } else if (categoryType === 'HARDWARE' || categoryType === 'ROLLERS') {
                optionsList = hardwares.map((h) => ({
                  id: h.id,
                  name: h.name,
                  price: h.salePrice ?? 0,
                  unit: h.unitMeasure ?? 'un',
                }));
              } else if (categoryType === 'FILM') {
                optionsList = films.map((f) => ({
                  id: f.id,
                  name: f.name,
                  price: f.salePrice ?? 0,
                  unit: 'm²',
                }));
              }

              const categoryPrice = sel.totalPrice;
              const unitMeasure = sel.unitMeasure ?? (categoryType === 'GLASS' || categoryType === 'FILM' ? 'm²' : categoryType === 'PROFILE' ? 'm' : 'un');

              return (
                <div
                  key={reqId}
                  className="bg-surface-container-low border border-outline-variant/60 rounded-md p-sm sm:p-md flex flex-col gap-xs hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-xs min-w-0">
                      <span className="material-symbols-outlined text-[18px] text-primary">{iconName}</span>
                      <span className="text-sm font-label font-semibold text-on-surface truncate">
                        {sel.label} {sel.isOptional && <span className="text-on-surface-variant font-normal text-xs">(Opcional)</span>}
                      </span>
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
                          className="p-1 text-on-surface-variant hover:text-error hover:bg-error/10 rounded transition-colors"
                          title="Remover este insumo"
                        >
                          <span className="material-symbols-outlined text-[16px]">close</span>
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
                        className="w-20 py-2 px-2 bg-surface border border-outline-variant rounded text-sm font-data-mono text-on-surface text-center focus:border-primary focus:outline-none disabled:opacity-40 transition-colors"
                      />
                      <span className="text-xs font-data-mono text-on-surface bg-surface-container px-2.5 py-2 rounded border border-outline-variant min-w-[36px] text-center font-medium">
                        {unitMeasure}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
