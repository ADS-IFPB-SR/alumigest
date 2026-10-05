import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDownloadPdfTecnico } from '../features/budgets/hooks/useBudgets';
import {
  useOrder,
  useCancelOrder,
  OrderDetailHeader,
  OrderCancelledAlert,
  OrderOriginBudgetCard,
  OrderDeliveryTimelineCard,
  OrderFinancialSummaryCard,
  OrderItemList,
  CancelOrderModal,
  type CancelOrderFormData,
} from '../features/orders';

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, isError, refetch } = useOrder(id);
  const { mutate: cancelOrder, isPending: isCanceling } = useCancelOrder(id);
  const { mutate: downloadPdfTecnico, isPending: isDownloadingPdf } = useDownloadPdfTecnico();

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const handleAdvanceProduction = () => {
    toast('Fluxo de avanço fabril será consolidado com a US-14.', {
      icon: '🏭',
    });
  };

  const handleCompleteProduction = () => {
    toast('Fluxo de conclusão fabril será consolidado com a US-18.', {
      icon: '🏁',
    });
  };

  const handlePrintTechnicalPdf = () => {
    if (!order) return;
    if (!order.orcamentoId) {
      toast.error('Ordem de serviço sem orçamento de origem vinculado.');
      return;
    }
    downloadPdfTecnico({ id: order.orcamentoId, code: order.orcamentoCodigo || order.codigo });
  };

  const handleConfirmCancel = (data: CancelOrderFormData) => {
    cancelOrder(
      { justificativa: data.justificativa },
      {
        onSuccess: () => {
          setIsCancelModalOpen(false);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div
        className="min-h-[50vh] flex flex-col items-center justify-center gap-3"
        data-testid="order-detail-loading"
      >
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-on-surface-variant">Carregando detalhes da ordem de serviço...</p>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div
        className="max-w-xl mx-auto my-12 p-6 bg-surface-container-lowest border border-rose-200 rounded-2xl shadow-xs text-center space-y-4"
        data-testid="order-detail-error"
      >
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-on-surface">Ordem de Serviço não encontrada</h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Não foi possível carregar as informações da ordem de serviço solicitada. Ela pode ter sido removida ou o identificador é inválido.
          </p>
        </div>
        <div className="flex justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10 rounded-lg transition-colors"
          >
            Tentar Novamente
          </button>
          <Link
            to="/work-orders"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Ordens de Serviço
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-y-auto space-y-6 pr-1 pb-8" data-testid="order-detail-page">
      <div className="w-full space-y-6">
        {/* Cabeçalho de Ações e Status */}
        <OrderDetailHeader
          order={order}
          isDownloadingPdf={isDownloadingPdf}
          onAdvanceProduction={handleAdvanceProduction}
          onCompleteProduction={handleCompleteProduction}
          onOpenCancelModal={() => setIsCancelModalOpen(true)}
          onPrintTechnicalPdf={handlePrintTechnicalPdf}
        />

        {/* Alerta de Cancelamento com Justificativa */}
        {order.status === 'CANCELLED' && (
          <OrderCancelledAlert justificativa={order.justificativaCancelamento} />
        )}

        {/* Conteúdo Principal em Grade Responsiva */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Coluna Esquerda: Itens do Pedido */}
          <div className="lg:col-span-8 space-y-6">
            <OrderItemList items={order.items} />
          </div>

          {/* Coluna Direita: Cards Laterais (Financeiro, Cronograma, Origem) */}
          <div className="lg:col-span-4 space-y-6">
            <OrderFinancialSummaryCard order={order} />
            <OrderDeliveryTimelineCard order={order} />
            <OrderOriginBudgetCard order={order} />
          </div>
        </div>
      </div>

      {/* Modal de Cancelamento de Pedido com Justificativa Obrigatória */}
      <CancelOrderModal
        isOpen={isCancelModalOpen}
        orderCodigo={order.codigo}
        isSubmitting={isCanceling}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
      />
    </div>
  );
}

export default OrderDetailPage;
