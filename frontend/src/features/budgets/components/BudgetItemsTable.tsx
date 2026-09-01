import React from 'react';
import type { BudgetItem } from '../types';
import { TEMPLATE_TYPE_INFO } from '../types';
import { formatBRL } from '../utils/calculations';

interface BudgetItemsTableProps {
  items: BudgetItem[];
  onEdit: (item: BudgetItem) => void;
  onDelete: (tempId: string) => void;
}

export const BudgetItemsTable: React.FC<BudgetItemsTableProps> = ({
  items,
  onEdit,
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
          <table className="w-full text-sm border-collapse min-w-[600px]">
            <thead className="bg-surface-container-low sticky top-0 z-10">
              <tr>
                <th className="text-left px-md py-sm font-label font-semibold text-on-surface-variant text-xs">#</th>
                <th className="text-left px-md py-sm font-label font-semibold text-on-surface-variant text-xs">Esquadria</th>
                <th className="text-center px-sm py-sm font-label font-semibold text-on-surface-variant text-xs">Medida</th>
                <th className="text-center px-sm py-sm font-label font-semibold text-on-surface-variant text-xs">Qtd</th>
                <th className="text-left px-sm py-sm font-label font-semibold text-on-surface-variant text-xs hidden md:table-cell">Materiais</th>
                <th className="text-right px-md py-sm font-label font-semibold text-on-surface-variant text-xs">Subtotal</th>
                <th className="text-center px-sm py-sm font-label font-semibold text-on-surface-variant text-xs w-20 sticky right-0 bg-surface-container-low shadow-[-4px_0px_8px_rgba(0,0,0,0.05)]">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40">
              {items.map((item, idx) => {
                const mainMaterial = item.options.find((o) => o.categoryType === 'GLASS') ?? item.options[0];
                const openDir = item.templateConfig.openingDirection;
                return (
                  <tr
                    key={item.tempId}
                    className="hover:bg-surface-container-high transition-colors group"
                  >
                    {/* # */}
                    <td className="px-md py-sm text-on-surface-variant text-xs font-data-mono">{idx + 1}</td>

                    {/* Esquadria */}
                    <td className="px-md py-sm" aria-label={`Esquadria: ${item.productName}`}>
                      <div className="flex flex-col gap-xs">
                        <span className="font-label font-semibold text-on-surface text-sm leading-tight">
                          {item.productName}
                        </span>
                        <span className="text-xs text-on-surface-variant font-body">
                          Modelo: {item.templateType ? (TEMPLATE_TYPE_INFO[item.templateType as keyof typeof TEMPLATE_TYPE_INFO]?.label || item.templateType) : 'Básico'}
                          {openDir && <span className="ml-xs text-secondary">· {openDir === 'LEFT_TO_RIGHT' ? '→' : openDir === 'RIGHT_TO_LEFT' ? '←' : openDir}</span>}
                        </span>
                      </div>
                    </td>

                    {/* Medida */}
                    <td className="px-sm py-sm text-center">
                      <span className="font-data-mono text-xs text-on-surface whitespace-nowrap">
                        {item.widthMm}×{item.heightMm}
                      </span>
                      <br />
                      <span className="text-[10px] text-on-surface-variant">mm</span>
                    </td>

                    {/* Quantidade */}
                    <td className="px-sm py-sm text-center">
                      <span className="font-data-mono text-on-surface text-sm font-semibold">{item.quantity}</span>
                      <span className="text-xs text-on-surface-variant ml-xs">un</span>
                    </td>

                    {/* Materiais (desktop only) */}
                    <td className="px-sm py-sm hidden md:table-cell">
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

                    {/* Subtotal */}
                    <td className="px-md py-sm text-right">
                      <span className="font-data-mono font-bold text-primary text-sm whitespace-nowrap">
                        {formatBRL(item.subtotal)}
                      </span>
                    </td>

                    {/* Ações */}
                    <td className="px-sm py-sm text-center sticky right-0 bg-surface-container-lowest border-l border-outline-variant/40 shadow-[-4px_0px_8px_rgba(0,0,0,0.05)] group-hover:bg-surface-container-high transition-colors">
                      <div className="flex items-center justify-center gap-xs">
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
              Tem certeza que deseja remover <strong>{itemToDelete.productName}</strong> ({itemToDelete.widthMm}×{itemToDelete.heightMm} mm) do orçamento?
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
                  onDelete(itemToDelete.tempId);
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
