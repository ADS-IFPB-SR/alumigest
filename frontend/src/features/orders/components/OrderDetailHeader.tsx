import React from 'react';
import { ArrowLeft, Play, CheckCircle, Ban, FileText, Download, Loader2, Tag, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Order } from '../types';
import { OrderStatusBadge } from './OrderStatusBadge';

interface OrderDetailHeaderProps {
  order: Order;
  isDownloadingPdf?: boolean;
  isDownloadingComprovante?: boolean;
  isDownloadingLabels?: boolean;
  isUpdatingStatus?: boolean;
  onAdvanceProduction?: () => void;
  onCompleteProduction?: () => void;
  onOpenCancelModal?: () => void;
  onPrintTechnicalPdf?: () => void;
  onDownloadComprovante?: () => void;
  onPrintLabels?: () => void;
  onOpenThermalModal?: () => void;
}

export const OrderDetailHeader: React.FC<OrderDetailHeaderProps> = ({
  order,
  isDownloadingPdf = false,
  isDownloadingComprovante = false,
  isDownloadingLabels = false,
  isUpdatingStatus = false,
  onAdvanceProduction,
  onCompleteProduction,
  onOpenCancelModal,
  onPrintTechnicalPdf,
  onDownloadComprovante,
  onPrintLabels,
  onOpenThermalModal,
}) => {
  const isAwaitingProduction = order.status === 'CREATED' || order.status === 'WAITING_PRODUCTION';
  const isInProduction = order.status === 'IN_PRODUCTION';
  const isCompleted = order.status === 'COMPLETED';

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-outline-variant">
      <div className="flex items-center gap-4">
        <Link
          to="/ordens-servico"
          className="p-2 rounded-lg border border-outline-variant hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-on-surface"
          aria-label="Voltar para a lista de ordens de serviço"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-on-surface font-headline">
              #{order.codigo}
            </h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="text-sm text-on-surface-variant mt-0.5">
            Cliente: <span className="font-medium text-on-surface">{order.clienteNome}</span>
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Ação de Cancelamento: disponível apenas quando ainda não iniciou fabricação física */}
        {isAwaitingProduction && (
          <button
            type="button"
            onClick={onOpenCancelModal}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors"
          >
            <Ban className="w-4 h-4" />
            Cancelar Ordem de Serviço
          </button>
        )}

        {/* Quando em produção: cancelamento comercial bloqueado */}
        {isInProduction && (
          <button
            type="button"
            disabled
            title="Cancelamento bloqueado: o material já está em processo de corte e usinagem na fábrica."
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-400 bg-slate-100 rounded-lg border border-slate-200 cursor-not-allowed opacity-60"
          >
            <Ban className="w-4 h-4" />
            Cancelamento Restrito
          </button>
        )}

        {/* Emissão de Ficha Técnica / Chão de Fábrica (Liberado para Em Produção ou Concluído) */}
        {(isInProduction || isCompleted) && (
          <button
            type="button"
            onClick={onPrintTechnicalPdf}
            disabled={isDownloadingPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 disabled:opacity-50 rounded-lg border border-primary/20 transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            {isDownloadingPdf ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            <span>{isDownloadingPdf ? 'Baixando Ficha...' : 'Ficha de Fabricação'}</span>
          </button>
        )}

        {/* Comprovante de Pedido de Venda em PDF — US-16.1 (#364) */}
        {order.status !== 'CANCELLED' && (
          <button
            type="button"
            id="btn-download-comprovante-pdf"
            onClick={onDownloadComprovante}
            disabled={isDownloadingComprovante}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 rounded-lg border border-emerald-200 transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            {isDownloadingComprovante ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>{isDownloadingComprovante ? 'Gerando PDF...' : 'Baixar Comprovante PDF'}</span>
          </button>
        )}

        {/* Etiquetas Térmicas de Identificação de Peças em PDF (100x60mm) — US-17.4 (#451) */}
        {order.status !== 'CANCELLED' && (
          <button
            type="button"
            id="btn-download-labels-pdf"
            data-testid="btn-download-labels-pdf"
            onClick={onPrintLabels}
            disabled={isDownloadingLabels}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 disabled:opacity-50 rounded-lg border border-amber-200 transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            {isDownloadingLabels ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Tag className="w-4 h-4" />
            )}
            <span>{isDownloadingLabels ? 'Gerando Etiquetas...' : 'Imprimir Etiquetas'}</span>
          </button>
        )}

        {/* Visualização Prévia Contínua no Modal Frontend com Filtro por Item — US-17.5 (#474) */}
        {order.status !== 'CANCELLED' && onOpenThermalModal && (
          <button
            type="button"
            id="btn-open-thermal-modal"
            data-testid="btn-open-thermal-modal"
            onClick={onOpenThermalModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>Visualizar Etiquetas</span>
          </button>
        )}

        {/* CTA 1: Avançar para Produção (quando CRIADO ou AGUARDANDO_PRODUCAO) */}
        {isAwaitingProduction && (
          <button
            type="button"
            data-testid="btn-advance-production"
            onClick={onAdvanceProduction}
            disabled={isUpdatingStatus}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg shadow-sm transition-colors"
          >
            {isUpdatingStatus ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {isUpdatingStatus ? 'Avançando...' : 'Avançar para Produção'}
          </button>
        )}

        {/* CTA 2: Concluir Produção (quando EM_PRODUCAO) */}
        {isInProduction && (
          <button
            type="button"
            data-testid="btn-complete-production"
            onClick={onCompleteProduction}
            disabled={isUpdatingStatus}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
          >
            {isUpdatingStatus ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            {isUpdatingStatus ? 'Concluindo...' : 'Concluir Produção'}
          </button>
        )}
      </div>
    </div>
  );
};
