import React from 'react';
import { ArrowLeft, Play, CheckCircle, Ban, FileText, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Order } from '../types';
import { OrderStatusBadge } from './OrderStatusBadge';

interface OrderDetailHeaderProps {
  order: Order;
  isDownloadingPdf?: boolean;
  onAdvanceProduction?: () => void;
  onCompleteProduction?: () => void;
  onOpenCancelModal?: () => void;
  onPrintTechnicalPdf?: () => void;
}

export const OrderDetailHeader: React.FC<OrderDetailHeaderProps> = ({
  order,
  isDownloadingPdf = false,
  onAdvanceProduction,
  onCompleteProduction,
  onOpenCancelModal,
  onPrintTechnicalPdf,
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

        {/* CTA 1: Avançar para Produção (quando CRIADO ou AGUARDANDO_PRODUCAO) */}
        {isAwaitingProduction && (
          <button
            type="button"
            onClick={onAdvanceProduction}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg shadow-sm transition-colors"
          >
            <Play className="w-4 h-4" />
            Avançar para Produção
          </button>
        )}

        {/* CTA 2: Concluir Produção (quando EM_PRODUCAO) */}
        {isInProduction && (
          <button
            type="button"
            onClick={onCompleteProduction}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            Concluir Produção
          </button>
        )}
      </div>
    </div>
  );
};
