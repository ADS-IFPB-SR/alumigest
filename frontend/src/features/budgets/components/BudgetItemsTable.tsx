import React from 'react';
import type { BudgetItem, TemplateConfig } from '../types';
import { TEMPLATE_TYPE_INFO, OPENING_DIRECTION_LABELS } from '../types';
import { formatBRL } from '../utils/calculations';

function formatOpeningDirection(openDir?: string): string {
  if (!openDir) return '';
  const label = OPENING_DIRECTION_LABELS[openDir as keyof typeof OPENING_DIRECTION_LABELS] || openDir;
  if (openDir === 'LEFT_TO_RIGHT') return `→ ${label}`;
  if (openDir === 'RIGHT_TO_LEFT') return `← ${label}`;
  if (openDir === 'CENTER_TO_SIDES') return `↔ ${label}`;
  if (openDir === 'OUTSIDE') return `↗ ${label}`;
  if (openDir === 'INSIDE') return `↙ ${label}`;
  return label;
}

interface BudgetItemsTableProps {
  readonly items: BudgetItem[];
  readonly onEdit: (item: BudgetItem) => void;
  readonly onDuplicate: (item: BudgetItem) => void;
  readonly onDelete: (tempId: string) => void;
}

export const BudgetItemsTable: React.FC<BudgetItemsTableProps> = ({
  items,
  onEdit,
  onDuplicate,
  onDelete,
}) => {
  const [itemToDelete, setItemToDelete] = React.useState<BudgetItem | null>(null);

  if (items.length === 0) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant border-dashed rounded-lg p-xl text-center flex flex-col items-center gap-sm">
        <span className="material-symbols-outlined text-on-surface-variant text-[40px]">window</span>
        <p className="text-on-surface font-label font-semibold">Nenhuma esquadria adicionada</p>
        <p className="text-sm text-on-surface-variant font-body">
          Clique em <strong>+ Adicionar Esquadria</strong> para começar a montar o orçamento.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden shadow-sm">
        {/* Table header */}
        <div className="bg-surface-container-low border-b border-outline-variant px-md py-sm flex items-center justify-between">
          <h3 className="font-title-sm text-title-sm text-on-surface">
            Itens do Orçamento
          </h3>
          <span className="text-xs font-data-mono text-secondary">
            {items.length} item{items.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-[700px]">
            <thead className="bg-surface-container-low sticky top-0 z-10">
              <tr>
                <th className="text-left px-md py-sm font-label font-semibold text-on-surface-variant text-xs">#</th>
                <th className="text-left px-md py-sm font-label font-semibold text-on-surface-variant text-xs">Descrição / Template</th>
                <th className="text-center px-sm py-sm font-label font-semibold text-on-surface-variant text-xs">Medidas (L × A mm)</th>
                <th className="text-center px-sm py-sm font-label font-semibold text-on-surface-variant text-xs">Qtd</th>
                <th className="text-left px-sm py-sm font-label font-semibold text-on-surface-variant text-xs hidden lg:table-cell">Materiais</th>
                <th className="text-right px-sm py-sm font-label font-semibold text-on-surface-variant text-xs">Valor Unitário</th>
                <th className="text-right px-md py-sm font-label font-semibold text-on-surface-variant text-xs">Subtotal</th>
                <th className="text-center px-sm py-sm font-label font-semibold text-on-surface-variant text-xs w-20 sticky right-0 bg-surface-container-low shadow-[-4px_0px_8px_rgba(0,0,0,0.05)]">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40">
              {items.map((item, idx) => {
                const mainMaterial = item.options.find((o) => o.categoryType === 'GLASS') ?? item.options[0];
                
                // Parse seguro do templateConfig para aceitar tanto string JSON quanto objeto
                const parsedConfig: TemplateConfig = typeof item.templateConfig === 'string'
                  ? JSON.parse(item.templateConfig || '{}')
                  : (item.templateConfig ?? {});

                const openDir = parsedConfig?.openingDirection;
                const quantity = Number(item.quantity ?? 1);
                const subtotalNum = Number(item.subtotal ?? 0);
                const unitPrice = item.unitPrice !== undefined 
                  ? Number(item.unitPrice) 
                  : (quantity > 0 ? subtotalNum / quantity : subtotalNum);

                const widthDisplay = item.widthMm ?? item.width ?? 0;
                const heightDisplay = item.heightMm ?? item.height ?? 0;

                return (
                  <tr
                    key={item.tempId ?? `item-${idx}`}
                    className="hover:bg-surface-container-high transition-colors group"
                  >
                    {/* # */}
                    <td className="px-md py-sm text-on-surface-variant text-xs font-data-mono">{idx + 1}</td>

                    {/* Descrição / Template */}
                    <td className="px-md py-sm" aria-label={`Esquadria: ${item.productName}`}>
                      <div className="flex flex-col gap-xs">
                        <span className="font-label font-semibold text-on-surface text-sm leading-tight">
                          {item.productName}
                        </span>
                        <span className="text-xs text-on-surface-variant font-body">
                          Modelo: {item.templateType ? (TEMPLATE_TYPE_INFO[item.templateType as keyof typeof TEMPLATE_TYPE_INFO]?.label || item.templateType) : 'Básico'}
                          {openDir && <span className="ml-xs text-secondary">· {formatOpeningDirection(openDir)}</span>}
                        </span>
                        {(parsedConfig?.aluminumColor || parsedConfig?.glassFinish) && (
                          <span className="text-[11px] text-secondary font-body">
                            {[
                              parsedConfig?.aluminumColor ? `Cor: ${parsedConfig.aluminumColor}` : null,
                              parsedConfig?.glassFinish ? `Vidro: ${parsedConfig.glassFinish}` : null,
                            ].filter(Boolean).join(' · ')}
                          </span>
                        )}
                        {item.notes && (
                          <span className="text-[11px] text-secondary italic truncate max-w-xs">
                            Obs: {item.notes}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Medidas (L × A mm) */}
                    <td className="px-sm py-sm text-center">
                      <span className="font-data-mono text-xs text-on-surface whitespace-nowrap">
                        {widthDisplay}×{heightDisplay}
                      </span>
                      <br />
                      <span className="text-[10px] text-on-surface-variant">mm</span>
                    </td>

                    {/* Quantidade */}
                    <td className="px-sm py-sm text-center">
                      <span className="font-data-mono text-on-surface text-sm font-semibold">{quantity}</span>
                      <span className="text-xs text-on-surface-variant ml-xs">un</span>
                    </td>

                    {/* Materiais (desktop only) */}
                    <td className="px-sm py-sm hidden lg:table-cell">
                      <div className="flex flex-col gap-xs">
                        {mainMaterial && (
                          <span className="text-xs text-on-surface truncate max-w-[180px]">
                            {mainMaterial.materialName}
                          </span>
                        )}
                        {item.options.length > 1 && (
                          <span className="text-[10px] text-on-surface-variant">
                            +{item.options.length - 1} {item.options.length - 1 === 1 ? 'material' : 'materiais'}
                          </span>
                        )}
                        {item.options.length === 0 && (
                          <span className="text-[10px] text-on-surface-variant italic">Sem materiais</span>
                        )}
                      </div>
                    </td>

                    {/* Valor Unitário */}
                    <td className="px-sm py-sm text-right">
                      <span className="font-data-mono text-xs text-on-surface whitespace-nowrap">
                        {formatBRL(unitPrice)}
                      </span>
                    </td>

                    {/* Subtotal */}
                    <td className="px-md py-sm text-right">
                      <span className="font-data-mono font-bold text-primary text-sm whitespace-nowrap">
                        {formatBRL(subtotalNum)}
                      </span>
                    </td>

                    {/* Ações */}
                    <td className="px-sm py-sm text-center sticky right-0 bg-surface-container-lowest border-l border-outline-variant/40 shadow-[-4px_0px_8px_rgba(0,0,0,0.05)] group-hover:bg-surface-container-high transition-colors">
                      <div className="flex items-center justify-center gap-xs">
                        <button
                          type="button"
                          onClick={() => onDuplicate(item)}
                          className="p-xs text-secondary hover:text-primary hover:bg-secondary-container/40 rounded-md transition-colors"
                          aria-label={`Duplicar esquadria ${item.productName}`}
                          title="Duplicar esquadria"
                        >
                          <span className="material-symbols-outlined text-[18px]">content_copy</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onEdit(item)}
                          className="p-xs text-secondary hover:text-primary hover:bg-secondary-container/40 rounded-md transition-colors"
                          aria-label={`Editar esquadria ${item.productName}`}
                          title="Editar item"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setItemToDelete(item)}
                          className="p-xs text-secondary hover:text-error hover:bg-error/10 rounded-md transition-colors"
                          aria-label={`Remover esquadria ${item.productName}`}
                          title="Remover item"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de confirmação de exclusão */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md bg-black/60 backdrop-blur-sm">
          <div className="bg-surface border border-outline-variant rounded-xl p-lg max-w-sm w-full shadow-2xl flex flex-col gap-md">
            <div className="flex items-center gap-sm text-error">
              <span className="material-symbols-outlined text-[24px]">warning</span>
              <h4 className="font-headline font-bold text-on-surface text-base">Excluir esquadria?</h4>
            </div>
            <p className="text-sm text-on-surface-variant font-body">
              Tem certeza que deseja remover <strong>{itemToDelete.productName}</strong> ({itemToDelete.widthMm ?? itemToDelete.width}×{itemToDelete.heightMm ?? itemToDelete.height} mm) do orçamento?
            </p>
            <div className="flex justify-end gap-sm mt-xs">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-md py-xs rounded-md border border-outline-variant text-sm font-label font-medium hover:bg-surface-container transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (itemToDelete.tempId) {
                    onDelete(itemToDelete.tempId);
                  }
                  setItemToDelete(null);
                }}
                className="px-md py-xs rounded-md bg-error text-on-error text-sm font-label font-bold hover:opacity-90 transition-opacity"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};