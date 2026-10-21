import React, { useState, useMemo } from 'react';
import { X, Printer, Download, Tag, Loader2 } from 'lucide-react';
import type { Order } from '../types';
import { formatDate } from '../utils/formatDate';
import { buildPhysicalLabels, resolveLabelItems } from '../utils/thermalLabels';

export type { PhysicalPieceLabel } from '../utils/thermalLabels';

export interface ThermalLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onDownloadPdf?: () => void;
  isDownloadingPdf?: boolean;
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

  // Multiplicação de cada item pela sua quantidade para gerar as peças físicas 1:1
  const allPhysicalLabels = useMemo(
    () => (order ? buildPhysicalLabels(order, labelItems) : []),
    [order, labelItems],
  );

  // Etiquetas filtradas por item ou todas
  const filteredLabels = useMemo(() => {
    if (selectedItemFilter === 'ALL') {
      return allPhysicalLabels;
    }
    return allPhysicalLabels.filter((label) => label.item.id === selectedItemFilter);
  }, [allPhysicalLabels, selectedItemFilter]);

  if (!isOpen) return null;

  const handlePrintThermal = () => {
    window.print();
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
      {/* Estilos embutidos para impressão térmica industrial @media print */}
      <style>{`
        @media print {
          @page {
            size: 100mm 60mm;
            margin: 0;
          }
          body * {
            visibility: hidden !important;
          }
          #thermal-print-area, #thermal-print-area * {
            visibility: visible !important;
          }
          #thermal-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100mm !important;
            background: transparent !important;
            padding: 0 !important;
          }
          .thermal-print-card {
            width: 96mm !important;
            height: 56mm !important;
            margin: 2mm !important;
            padding: 3mm !important;
            border: 1.2px solid #0f172a !important;
            border-radius: 4mm !important;
            page-break-after: always !important;
            page-break-inside: avoid !important;
            box-sizing: border-box !important;
            background-color: #ffffff !important;
            box-shadow: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-5xl bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant flex flex-col max-h-[90vh] overflow-hidden my-auto">
        {/* Header do Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant bg-surface-container-low">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-800 flex items-center justify-center">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 id="thermal-label-modal-title" className="text-lg font-bold text-on-surface">
                Visualização Prévia de Etiquetas Térmicas (100x60mm)
              </h2>
              <p className="text-xs text-on-surface-variant">
                Ordem de Serviço #{order.codigo} • {order.clienteNome} • {allPhysicalLabels.length} {allPhysicalLabels.length === 1 ? 'peça física' : 'peças físicas'}
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

        {/* Barra de Filtros Rápidos */}
        <div className="px-6 py-3 border-b border-outline-variant bg-surface-container-lowest flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-on-surface-variant mr-1">Filtrar Peças:</span>
          
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
                Item {itemNum} ({qtd} {qtd === 1 ? 'Peça' : 'Peças'})
              </button>
            );
          })}
        </div>

        {/* Grade Responsiva Contínua de Etiquetas (Visualização em Tela Única) */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-100/70" id="thermal-print-area">
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 justify-items-center"
            data-testid="thermal-labels-grid"
          >
            {filteredLabels.map((lbl) => (
              <div
                key={lbl.uniqueKey}
                data-testid="thermal-label-card"
                className="thermal-print-card w-full max-w-[420px] bg-white text-slate-900 rounded-xl p-4 border border-slate-900 shadow-md flex flex-col justify-between font-sans leading-tight select-none relative"
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

                {/* 6. Rodapé Limpo (Sem Código de Barras e Apenas Data) */}
                <div className="border-t-2 border-slate-900 pt-1 flex items-center justify-start text-[8px] font-extrabold text-slate-800">
                  <span data-testid="label-date">DATA: {formattedDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rodapé com Ações */}
        <div className="px-6 py-3.5 border-t border-outline-variant bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-on-surface-variant text-center sm:text-left">
            Exibindo <strong>{filteredLabels.length}</strong> de <strong>{allPhysicalLabels.length}</strong> etiquetas térmicas padronizadas (100x60mm).
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              data-testid="btn-modal-print-thermal"
              onClick={handlePrintThermal}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-surface-container-highest hover:bg-outline-variant text-on-surface transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Imprimir Todas na Térmica
            </button>

            {onDownloadPdf && (
              <button
                type="button"
                data-testid="btn-modal-download-pdf"
                onClick={onDownloadPdf}
                disabled={isDownloadingPdf}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-primary hover:bg-primary-dark text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDownloadingPdf ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {isDownloadingPdf ? 'Baixando PDF...' : 'Baixar PDF'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
