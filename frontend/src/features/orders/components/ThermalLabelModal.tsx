import React, { useState, useMemo, useEffect } from 'react';
import { X, Printer, Tag, Loader2, Minus, Plus, SlidersHorizontal } from 'lucide-react';
import type { Order, OrderItem } from '../types';
import { formatDate } from '../utils/formatDate';
import { extractLeavesCount, formatLabelBadge } from '../utils/leafDeduction';
import { resolveLabelItems, resolveLocalAmbiente } from '../utils/thermalLabels';

export interface PartSaleItemLabelData {
  id: string;
  description?: string;
  name?: string;
  category?: string;
  categoryLabel?: string;
  quantity: number;
  widthMm?: number | null;
  heightMm?: number | null;
  lengthMm?: number | null;
  color?: string;
  finish?: string;
  notes?: string;
}

export interface PartSaleLabelData {
  id?: string;
  code: string;
  clientName?: string;
  createdAt?: string;
  items?: PartSaleItemLabelData[];
}

export interface ThermalLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  order?: Order;
  partSale?: PartSaleLabelData;
  onDownloadPdf?: (itemId?: string, customLeaves?: Record<string, number>) => void;
  isDownloadingPdf?: boolean;
}

export interface UnifiedPieceLabel {
  uniqueKey: string;
  itemId: string;
  itemIndex: number;
  title: string;
  orderCode: string;
  clientName: string;
  labelFraction: string;
  dimensoesTitulo: string;
  dimensoesValor: string;
  spec1Label: string;
  spec1Valor: string;
  spec2Label: string;
  spec2Valor: string;
  localAmbiente: string;
  formattedDate: string;
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
  partSale,
  onDownloadPdf,
  isDownloadingPdf = false,
}) => {
  // Filtro por ID do item (evita colisão quando dois itens compartilham o mesmo `ordem`)
  const [selectedItemFilter, setSelectedItemFilter] = useState<string>('ALL');

  // Itens válidos (quantidade > 0) de O.S. ordenados por `ordem`, em paridade com o backend (BUG #486)
  const labelItems = useMemo(() => {
    if (order?.items) {
      return resolveLabelItems(order.items);
    }
    return [];
  }, [order?.items]);

  // Mapa de folhas por item (usado apenas em Ordens de Serviço com esquadrias)
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

  const formattedDate = useMemo(() => {
    const rawDate = order?.dataAprovacao || partSale?.createdAt;
    return rawDate ? formatDate(rawDate) : formatDate(new Date().toISOString());
  }, [order?.dataAprovacao, partSale?.createdAt]);

  // Geração 1:1 de etiquetas físicas
  const allPhysicalLabels = useMemo(() => {
    // 1. Caso Ordem de Serviço
    if (order && labelItems.length > 0) {
      const labels: UnifiedPieceLabel[] = [];

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
              itemId: item.id,
              itemIndex,
              title: item.descricao || 'Esquadria de Alumínio',
              orderCode: order.codigo,
              clientName: order.clienteNome || 'Cliente',
              labelFraction: badgeText,
              dimensoesTitulo: 'MEDIDAS NOMINAIS (L X A)',
              dimensoesValor: `${item.larguraMm} x ${item.alturaMm} mm`,
              spec1Label: 'COR / ACABAMENTO:',
              spec1Valor: `🎨 ${item.corAluminio || 'Preto Anodizado'}`,
              spec2Label: 'VIDRO ESPECIFICADO:',
              spec2Valor: `🪟 ${item.tipoVidro || 'Incolor 6mm Temperado'}`,
              localAmbiente,
              formattedDate,
            });
          }
        }
      });

      return labels;
    }

    // 2. Caso Venda Avulsa (PartSale)
    if (partSale && (partSale.items || []).length > 0) {
      const labels: UnifiedPieceLabel[] = [];
      const clientName = partSale.clientName || 'Cliente Balcão';

      partSale.items?.forEach((it, idx) => {
        const itemIndex = idx + 1;
        const qtd = Math.max(1, it.quantity || 1);
        const categoryUpper = (it.category || '').toUpperCase();
        const itemDesc = it.description || it.name || 'Material AlumiGest';

        // Definição contextual de dimensões e especificações em paridade com ThermalLabelPdfRenderer
        let dimTitulo = 'MEDIDAS NOMINAIS (L X A)';
        let dimValor = `${it.widthMm ?? 0} x ${it.heightMm ?? 0} mm`;
        let spec1Label = 'COR / ACABAMENTO:';
        let spec1Valor = `🎨 ${it.color || 'Padrão'}`;
        let spec2Label = 'ESPECIFICAÇÃO:';
        let spec2Valor = `🪟 ${itemDesc}`;

        if (categoryUpper === 'PROFILE' || (it.lengthMm && !it.widthMm)) {
          dimTitulo = 'CORTE / COMPRIMENTO';
          dimValor = `CORTE: ${it.lengthMm ?? 0} mm`;
          spec1Label = 'LIGA / ACABAMENTO:';
          spec1Valor = `🎨 ${it.color || 'Alumínio Natural'}`;
          spec2Label = 'COMPRIMENTO:';
          spec2Valor = `📏 ${it.lengthMm ?? 0} mm`;
        } else if (categoryUpper === 'HARDWARE' || (!it.widthMm && !it.lengthMm)) {
          dimTitulo = 'QUANTIDADE INDIVIDUAL';
          dimValor = '1 UNIDADE';
          spec1Label = 'TIPO / CATEGORIA:';
          spec1Valor = '🔩 Ferragem / Acessório';
          spec2Label = 'CONDIÇÃO:';
          spec2Valor = '📦 Balcão / Pronta Entrega';
        }

        for (let peca = 1; peca <= qtd; peca++) {
          const badgeText = `Item ${String(itemIndex).padStart(2, '0')} | Peça ${String(peca).padStart(2, '0')}/${String(qtd).padStart(2, '0')}`;

          labels.push({
            uniqueKey: `${it.id}-peca-${peca}`,
            itemId: it.id,
            itemIndex,
            title: itemDesc,
            orderCode: partSale.code,
            clientName,
            labelFraction: badgeText,
            dimensoesTitulo: dimTitulo,
            dimensoesValor: dimValor,
            spec1Label,
            spec1Valor,
            spec2Label,
            spec2Valor,
            localAmbiente: it.notes || 'Venda Avulsa de Materiais',
            formattedDate,
          });
        }
      });

      return labels;
    }

    return [];
  }, [order, partSale, labelItems, leavesPerItem, formattedDate]);

  // Lista de itens distintos para barra de filtros
  const filterOptions = useMemo(() => {
    if (order && labelItems.length > 0) {
      return labelItems.map(({ item, itemIndex, quantidade }) => {
        const leaves = leavesPerItem[item.id] ?? extractLeavesCount(item.descricao);
        const qtdLabels = quantidade * leaves;
        return {
          id: item.id,
          label: `Item ${itemIndex} (${qtdLabels} ${qtdLabels === 1 ? 'Peça' : 'Peças'})`,
        };
      });
    }

    if (partSale?.items) {
      return partSale.items.map((it, idx) => ({
        id: it.id,
        label: `Item ${idx + 1} (${it.quantity} ${it.quantity === 1 ? 'Peça' : 'Peças'})`,
      }));
    }

    return [];
  }, [order, partSale, labelItems, leavesPerItem]);

  // Etiquetas filtradas por item ou todas
  const filteredLabels = useMemo(() => {
    if (selectedItemFilter === 'ALL') {
      return allPhysicalLabels;
    }
    return allPhysicalLabels.filter((label) => label.itemId === selectedItemFilter);
  }, [allPhysicalLabels, selectedItemFilter]);

  // ID do item selecionado no filtro rápido (ou undefined quando em 'ALL')
  const activeItemId = selectedItemFilter === 'ALL' ? undefined : selectedItemFilter;

  // Rótulo dinâmico da impressão térmica de acordo com o filtro selecionado
  const printButtonLabel = useMemo(() => {
    if (selectedItemFilter === 'ALL') {
      return `Imprimir (${allPhysicalLabels.length})`;
    }
    return `Imprimir Filtradas (${filteredLabels.length})`;
  }, [selectedItemFilter, allPhysicalLabels.length, filteredLabels.length]);

  if (!isOpen) return null;

  const handleDownloadPdf = () => {
    if (onDownloadPdf) {
      onDownloadPdf(activeItemId, leavesPerItem);
    } else {
      window.print();
    }
  };

  const isPartSaleMode = Boolean(partSale);
  const codeDisplay = order?.codigo || partSale?.code || '---';
  const clientDisplay = order?.clienteNome || partSale?.clientName || 'Cliente Balcão';

  let printActionText = printButtonLabel;
  if (isDownloadingPdf) {
    printActionText = 'Abrindo Impressão...';
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
      aria-labelledby="thermal-label-modal-title"
      data-testid={isPartSaleMode ? 'modal-thermal-labels' : 'thermal-label-modal'}
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
                {isPartSaleMode
                  ? 'Etiquetas Térmicas Elgin L42 (100×60mm)'
                  : 'Conferência e Impressão de Etiquetas Térmicas (100x60mm)'}
              </h2>
              <p className="text-xs text-on-surface-variant flex flex-wrap items-center gap-1">
                {isPartSaleMode && <span>Etiquetas Térmicas de Expedição</span>}
                {isPartSaleMode && <span>•</span>}
                <span>{isPartSaleMode ? `Venda #${codeDisplay}` : `Ordem de Serviço #${codeDisplay}`}</span>
                <span>•</span>
                <span>{clientDisplay}</span>
                <span>•</span>
                <span>
                  {allPhysicalLabels.length}{' '}
                  {allPhysicalLabels.length === 1 ? 'etiqueta gerada' : 'etiquetas geradas'}
                </span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
            aria-label="Fechar modal"
            data-testid={isPartSaleMode ? 'btn-close-labels-modal' : 'btn-close-thermal-modal'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Seção de Conferência Prévia de Folhas por Item (Apenas para O.S. com esquadrias) */}
        {!isPartSaleMode && labelItems.length > 0 && (
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
        )}

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

          {filterOptions.map((opt, optIdx) => {
            const isSelected = selectedItemFilter === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                data-testid={`filter-piece-item-${optIdx + 1}`}
                onClick={() => setSelectedItemFilter(opt.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface'
                }`}
              >
                {opt.label}
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
                    <span className="text-xs font-black text-slate-900 mt-1 block break-words" title={lbl.clientName}>
                      <span className="text-slate-500 uppercase text-[9px] font-bold">CLIENTE: </span>
                      <span>{lbl.clientName}</span>
                    </span>
                  </div>
                  <div className="text-right flex flex-col items-end shrink-0">
                    <span className="font-mono font-black text-xs text-slate-900 block leading-none">
                      #{lbl.orderCode}
                    </span>
                    <span
                      data-testid="label-piece-fraction"
                      className="inline-block mt-1 px-2 py-0.5 bg-slate-900 text-white text-[9px] font-black rounded font-mono uppercase tracking-wide"
                    >
                      {lbl.labelFraction}
                    </span>
                  </div>
                </div>

                {/* 2. Descrição da Peça / Material */}
                <div className="py-1 space-y-1">
                  <div className="flex justify-between items-baseline">
                    <p className="font-black text-xs text-slate-900 break-words w-full">
                      {lbl.title}
                    </p>
                  </div>

                  {/* 3. Destaque das Medidas Nominais */}
                  <div
                    data-testid="label-dimensions"
                    className="bg-slate-50 border border-slate-900 py-1.5 px-2 rounded-lg text-center my-0.5 shadow-2xs"
                  >
                    <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500 block leading-none">
                      {lbl.dimensoesTitulo}
                    </span>
                    <div className="flex items-center justify-center gap-1.5 mt-0.5">
                      <span className="text-base select-none">📐</span>
                      <span className="font-mono font-black text-xl text-slate-950 tracking-tight leading-tight">
                        {lbl.dimensoesValor}
                      </span>
                    </div>
                  </div>

                  {/* 4. Especificações Técnicas */}
                  <div className="grid grid-cols-2 gap-1 text-[9px] font-bold">
                    <div data-testid="label-color">
                      <span className="text-slate-500 text-[8px] uppercase block leading-none mb-0.5">
                        {lbl.spec1Label}
                      </span>
                      <span className="text-slate-900 truncate block">
                        {lbl.spec1Valor}
                      </span>
                    </div>
                    <div data-testid="label-glass">
                      <span className="text-slate-500 text-[8px] uppercase block leading-none mb-0.5">
                        {lbl.spec2Label}
                      </span>
                      <span className="text-slate-900 truncate block">
                        {lbl.spec2Valor}
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
                  <span data-testid="label-date">DATA: {lbl.formattedDate}</span>
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
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
            >
              Cancelar
            </button>
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
              {printActionText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
