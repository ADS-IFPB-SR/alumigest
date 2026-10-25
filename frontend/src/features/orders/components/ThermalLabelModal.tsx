import React, { useState, useMemo, useEffect } from 'react';
import { X, Printer, Tag, Loader2, Minus, Plus, SlidersHorizontal } from 'lucide-react';
import type { Order, OrderItem } from '../types';
import { formatDate } from '../utils/formatDate';
import { extractLeavesCount, formatLabelBadge } from '../utils/leafDeduction';
import { resolveLabelItems, resolveLocalAmbiente } from '../utils/thermalLabels';

export interface ThermalLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onDownloadPdf?: (itemId?: string, customLeaves?: Record<string, number>) => void;
  isDownloadingPdf?: boolean;
  onPrintThermal?: (params: { id: string; itemId?: string; leavesPerItem?: Record<string, number> }) => void;
  isPrintingThermal?: boolean;
}

export interface PhysicalPieceLabel {
  uniqueKey: string;
  item: OrderItem;
  itemIndex: number;
  esquadriaIndex: number;
  totalEsquadrias: number;
  folhaIndex: number;
  totalFolhas: number;
  labelFraction: string;
  localAmbiente: string;
}

function getTemplateType(item: OrderItem): string | null {
  const customItem = item as { templateType?: string; templateConfig?: { templateType?: string } };
  if (customItem.templateType) {
    return customItem.templateType;
  }
  if (customItem.templateConfig && typeof customItem.templateConfig === 'object') {
    return customItem.templateConfig.templateType ?? null;
  }
  return null;
}

export const ThermalLabelModal: React.FC<ThermalLabelModalProps> = ({
  isOpen,
  onClose,
  order,
  onDownloadPdf,
  isDownloadingPdf = false,
}) => {
  // Filtro por ID do item (evita colisão quando dois itens compartilham o mesmo `ordem`)
  const [selectedItemFilter, setSelectedItemFilter] = useState<string>('ALL');

  // Itens válidos (quantidade > 0) ordenados por `ordem`, em paridade com o backend (BUG #486)
  const labelItems = useMemo(() => resolveLabelItems(order?.items), [order?.items]);

  // Mapa de folhas por item (inicializado via dedução automática por regex na descrição/tipologia)
  const [leavesPerItem, setLeavesPerItem] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!order?.items) return;
    const initialMap: Record<string, number> = {};
    order.items.forEach((item) => {
      const templateType = getTemplateType(item);
      initialMap[item.id] = extractLeavesCount(item.descricao, templateType);
    });
    setLeavesPerItem(initialMap);
  }, [order?.items]);

  const handleUpdateLeaves = (itemId: string, delta: number) => {
    setLeavesPerItem((prev) => {
      const current = prev[itemId] ?? 1;
      const nextVal = Math.max(1, current + delta);
      return { ...prev, [itemId]: nextVal };
    });
  };

  // Geração 1:1 de etiquetas físicas: (quantidade de esquadrias) x (folhas deduzidas/conferidas)
  const allPhysicalLabels = useMemo(() => {
    if (!order || labelItems.length === 0) return [];

    const labels: PhysicalPieceLabel[] = [];

    labelItems.forEach(({ item, itemIndex, quantidade }) => {
      const qtdEsquadrias = Math.max(1, quantidade);
      const folhas = Math.max(1, leavesPerItem[item.id] ?? extractLeavesCount(item.descricao));
      const localAmbiente = resolveLocalAmbiente(item, order);

      for (let esq = 1; esq <= qtdEsquadrias; esq++) {
        for (let folha = 1; folha <= folhas; folha++) {
          const badgeText = formatLabelBadge(
            itemIndex,
            esq,
            qtdEsquadrias,
            folha,
            folhas
          );

          labels.push({
            uniqueKey: `${item.id}-esq-${esq}-folha-${folha}`,
            item,
            itemIndex,
            esquadriaIndex: esq,
            totalEsquadrias: qtdEsquadrias,
            folhaIndex: folha,
            totalFolhas: folhas,
            labelFraction: badgeText,
            localAmbiente,
          });
        }
      }
    });

    return labels;
  }, [order, labelItems, leavesPerItem]);

  // Etiquetas filtradas por item ou todas
  const filteredLabels = useMemo(() => {
    if (selectedItemFilter === 'ALL') {
      return allPhysicalLabels;
    }
    return allPhysicalLabels.filter((label) => label.item.id === selectedItemFilter);
  }, [allPhysicalLabels, selectedItemFilter]);

  // ID do item selecionado no filtro rápido (ou undefined quando em 'ALL')
  const activeItemId = selectedItemFilter === 'ALL' ? undefined : selectedItemFilter;

  // Rótulo dinâmico da impressão térmica de acordo com o filtro selecionado (Bugs #487 e #493)
  const printButtonLabel = useMemo(() => {
    if (selectedItemFilter === 'ALL') {
      return `Imprimir (${allPhysicalLabels.length})`;
    }
    return `Imprimir Filtradas (${filteredLabels.length})`;
  }, [selectedItemFilter, allPhysicalLabels.length, filteredLabels.length]);

  if (!isOpen) return null;


  const handleDownloadPdf = () => {
    onDownloadPdf?.(activeItemId, leavesPerItem);
  };

  const formattedDate = order.dataAprovacao
    ? formatDate(order.dataAprovacao)
    : formatDate(new Date().toISOString());

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
      aria-labelledby="thermal-label-modal-title"
      data-testid="thermal-label-modal"
    >
      {/* Modal Visual na Tela */}
      <div className="relative w-full max-w-5xl bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant flex flex-col max-h-[90vh] overflow-hidden my-auto">
        {/* Header do Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant bg-surface-container-low">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-800 flex items-center justify-center">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 id="thermal-label-modal-title" className="text-lg font-bold text-on-surface">
                Conferência e Impressão de Etiquetas Térmicas (100x60mm)
              </h2>
              <p className="text-xs text-on-surface-variant">
                Ordem de Serviço #{order.codigo} • {order.clienteNome} • {allPhysicalLabels.length}{' '}
                {allPhysicalLabels.length === 1 ? 'etiqueta gerada' : 'etiquetas geradas'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
            aria-label="Fechar modal"
            data-testid="btn-close-thermal-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Seção de Conferência Prévia de Folhas por Item com Edição Permitida */}
        <div className="px-6 py-3 border-b border-outline-variant bg-amber-50/50">
          <div className="flex items-center gap-2 mb-2">
            <SlidersHorizontal className="w-4 h-4 text-amber-800" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
              Conferência de Folhas por Esquadria (Dedução Automática por Modelo)
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-36 overflow-y-auto pr-1">
            {labelItems.map(({ item, itemIndex: itemNum, quantidade: qtd }) => {
              const leaves = leavesPerItem[item.id] ?? extractLeavesCount(item.descricao);
              const totalLabels = qtd * leaves;

              return (
                <div
                  key={`conf-${item.id}`}
                  data-testid={`conference-item-${itemNum}`}
                  className="bg-white border border-amber-200/80 rounded-lg p-2.5 flex items-center justify-between gap-2 shadow-2xs"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black text-slate-900 truncate" title={item.descricao}>
                      Item {itemNum} — {item.descricao || 'Esquadria'}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {qtd} {qtd === 1 ? 'esquadria' : 'esquadrias'} • <strong>{totalLabels}</strong> {totalLabels === 1 ? 'etiqueta' : 'etiquetas'}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 bg-slate-50 border border-slate-200 rounded-md px-1 py-0.5">
                    <button
                      type="button"
                      data-testid={`btn-decrease-leaves-${itemNum}`}
                      aria-label={`Diminuir folhas do item ${itemNum}`}
                      onClick={() => handleUpdateLeaves(item.id, -1)}
                      className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      disabled={leaves <= 1}
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span
                      data-testid={`leaves-count-item-${itemNum}`}
                      className="text-xs font-black font-mono text-slate-900 px-1 min-w-[20px] text-center"
                    >
                      {leaves} {leaves === 1 ? 'fl' : 'fls'}
                    </span>
                    <button
                      type="button"
                      data-testid={`btn-increase-leaves-${itemNum}`}
                      aria-label={`Aumentar folhas do item ${itemNum}`}
                      onClick={() => handleUpdateLeaves(item.id, 1)}
                      className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Barra de Filtros Rápidos */}
        <div className="px-6 py-2.5 border-b border-outline-variant bg-surface-container-lowest flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-on-surface-variant mr-1">Filtrar Visualização:</span>

          <button
            type="button"
            data-testid="filter-piece-all"
            onClick={() => setSelectedItemFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              selectedItemFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface'
            }`}
          >
            Todas as Peças ({allPhysicalLabels.length})
          </button>

          {labelItems.map(({ item, itemIndex: itemNum, quantidade: qtd }) => {
            const leaves = leavesPerItem[item.id] ?? extractLeavesCount(item.descricao);
            const qtdLabels = qtd * leaves;
            const isSelected = selectedItemFilter === item.id;
            return (
              <button
                key={item.id}
                type="button"
                data-testid={`filter-piece-item-${itemNum}`}
                onClick={() => setSelectedItemFilter(item.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface'
                }`}
              >
                Item {itemNum} ({qtdLabels} {qtdLabels === 1 ? 'Peça' : 'Peças'})
              </button>
            );
          })}
        </div>

        {/* Grade de Pré-visualização na Tela (Somente Tela) */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-100/70" id="thermal-preview-area">
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 justify-items-center"
            data-testid="thermal-labels-grid"
          >
            {filteredLabels.map((lbl) => (
              <div
                key={lbl.uniqueKey}
                data-testid="thermal-label-card"
                className="w-full max-w-[420px] bg-white text-slate-900 rounded-xl p-4 border border-slate-900 shadow-md flex flex-col justify-between font-sans leading-tight select-none relative"
                style={{ aspectRatio: '100 / 60' }}
              >
                {/* 1. Cabeçalho da Etiqueta */}
                <div className="border-b-2 border-slate-900 pb-1.5 flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <span className="font-black text-[11px] tracking-wider uppercase block leading-none text-slate-800">
                      Alumiportas
                    </span>
                    <span className="text-xs font-black text-slate-900 mt-1 block break-words" title={order.clienteNome}>
                      <span className="text-slate-500 uppercase text-[9px] font-bold">CLIENTE: </span>
                      <span>{order.clienteNome}</span>
                    </span>
                  </div>
                  <div className="text-right flex flex-col items-end shrink-0">
                    <span className="font-mono font-black text-xs text-slate-900 block leading-none">
                      #{order.codigo}
                    </span>
                    <span
                      data-testid="label-piece-fraction"
                      className="inline-block mt-1 px-2 py-0.5 bg-slate-900 text-white text-[9px] font-black rounded font-mono uppercase tracking-wide"
                    >
                      {lbl.labelFraction}
                    </span>
                  </div>
                </div>

                {/* 2. Descrição da Esquadria */}
                <div className="py-1 space-y-1">
                  <div className="flex justify-between items-baseline">
                    <p className="font-black text-xs text-slate-900 break-words w-full">
                      {lbl.item.descricao || 'Esquadria de Alumínio'}
                    </p>
                  </div>

                  {/* 3. Destaque das Medidas Nominais (L x A) */}
                  <div
                    data-testid="label-dimensions"
                    className="bg-slate-50 border border-slate-900 py-1.5 px-2 rounded-lg text-center my-0.5 shadow-2xs"
                  >
                    <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500 block leading-none">
                      MEDIDAS NOMINAIS (L X A)
                    </span>
                    <div className="flex items-center justify-center gap-1.5 mt-0.5">
                      <span className="text-base select-none">📐</span>
                      <span className="font-mono font-black text-xl text-slate-950 tracking-tight leading-tight">
                        {lbl.item.larguraMm} x {lbl.item.alturaMm} mm
                      </span>
                    </div>
                  </div>

                  {/* 4. Especificações Técnicas (Cor e Vidro) */}
                  <div className="grid grid-cols-2 gap-1 text-[9px] font-bold">
                    <div data-testid="label-color">
                      <span className="text-slate-500 text-[8px] uppercase block leading-none mb-0.5">
                        COR / ACABAMENTO:
                      </span>
                      <span className="text-slate-900 truncate block">
                        🎨 {lbl.item.corAluminio || 'Preto Anodizado'}
                      </span>
                    </div>
                    <div data-testid="label-glass">
                      <span className="text-slate-500 text-[8px] uppercase block leading-none mb-0.5">
                        VIDRO ESPECIFICADO:
                      </span>
                      <span className="text-slate-900 truncate block">
                        🪟 {lbl.item.tipoVidro || 'Incolor 6mm Temperado'}
                      </span>
                    </div>
                  </div>

                  {/* 5. Linha de Local / Obs */}
                  <div className="text-[9px] font-bold text-slate-800 border-t border-slate-200 pt-0.5 break-words">
                    <span className="text-slate-500 text-[8px] uppercase">LOCAL / OBS: </span>
                    <span data-testid="label-local">{lbl.localAmbiente}</span>
                  </div>
                </div>

                {/* 6. Rodapé Limpo */}
                <div className="border-t-2 border-slate-900 pt-1 flex items-center justify-between text-[8px] font-extrabold text-slate-800">
                  <span data-testid="label-date">DATA: {formattedDate}</span>
                  <span className="font-mono uppercase text-slate-600">AlumiGest • 100x60mm</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rodapé com Ações */}
        <div className="px-6 py-3.5 border-t border-outline-variant bg-surface-container-low flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <p className="text-xs text-on-surface-variant text-center sm:text-left">
              Exibindo <strong>{filteredLabels.length}</strong> de <strong>{allPhysicalLabels.length}</strong> etiquetas (100x60mm).
            </p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {onDownloadPdf && (
              <button
                type="button"
                data-testid="btn-modal-download-pdf"
                onClick={handleDownloadPdf}
                disabled={isDownloadingPdf}
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-xs transition-colors cursor-pointer"
              >
                {isDownloadingPdf ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Printer className="w-4 h-4" />
                )}
                {isDownloadingPdf ? 'Abrindo Impressão...' : printButtonLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
