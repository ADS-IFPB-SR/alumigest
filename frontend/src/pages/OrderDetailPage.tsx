import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

// Importe a sua configuração da API (Ajuste o caminho se necessário)
import { api } from '../services/api'; // ou '@/lib/api'

import {
  useOrder,
  useCancelOrder,
  useDownloadComprovantePdf,
  useDownloadLabelsPdf,
  OrderDetailHeader,
  useUpdateOrderStatus,
  OrderCancelledAlert,
  OrderOriginBudgetCard,
  OrderDeliveryTimelineCard,
  OrderFinancialSummaryCard,
  OrderItemList,
  CancelOrderModal,
  ThermalLabelModal,
  type CancelOrderFormData,
} from '../features/orders';

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, isError, refetch } = useOrder(id);
  const { mutate: cancelOrder, isPending: isCanceling } = useCancelOrder(id);
  const { mutate: updateOrderStatus, isPending: isUpdatingStatus } = useUpdateOrderStatus(id);
  const { mutate: downloadComprovante, isPending: isDownloadingComprovante } = useDownloadComprovantePdf();
  const { mutate: downloadLabels, isPending: isDownloadingLabels } = useDownloadLabelsPdf();

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isThermalModalOpen, setIsThermalModalOpen] = useState(false);

  // Estado para controlar o loading específico do botão de Ficha Técnica
  const [isDownloadingTechnicalPdf, setIsDownloadingTechnicalPdf] = useState(false);

  const handleAdvanceToWaitingProduction = () => {
    updateOrderStatus('WAITING_PRODUCTION', {
      onSuccess: () => toast.success('Ordem de serviço avançada para aguardando produção.'),
      onError: () => toast.error('Não foi possível avançar a ordem para aguardando produção.'),
    });
  };

  const handleAdvanceProduction = () => {
    updateOrderStatus('IN_PRODUCTION', {
      onSuccess: () => toast.success('Ordem de serviço avançada para produção.'),
      onError: () => toast.error('Não foi possível avançar a ordem para produção.'),
    });
  };

  const handleCompleteProduction = () => {
    updateOrderStatus('COMPLETED', {
      onSuccess: () => toast.success('Ordem de serviço concluída com sucesso.'),
      onError: () => toast.error('Não foi possível concluir a ordem de serviço.'),
    });
  };

  const handleDownloadComprovante = () => {
    if (!order) return;
    downloadComprovante({ id: order.id, codigo: order.codigo });
  };

  const handleOpenThermalLabelsModal = () => {
    setIsThermalModalOpen(true);
  };

  const handleDownloadLabelsPdf = (itemId?: string, customLeaves?: Record<string, number>) => {
    if (!order) return;
    const sanitizedItemId = typeof itemId === 'string' ? itemId : undefined;
    downloadLabels({
      id: order.id,
      codigo: order.codigo,
      ...(sanitizedItemId ? { itemId: sanitizedItemId } : {}),
      customLeaves,
    });
  };

  const handleConfirmCancel = (data: CancelOrderFormData) => {
    cancelOrder(
      { justificativa: data.justificativa },
      {
        onSuccess: () => {
          setIsCancelModalOpen(false);
          toast.success('Ordem de serviço cancelada com sucesso.');
        },
        onError: (err: any) => {
          const message = err?.response?.data?.message || 'Não foi possível cancelar a ordem de serviço.';
          toast.error(message);
        },
      }
    );
  };

  // LÓGICA DE DOWNLOAD DIRETO (Substitui o Modal)
  const handlePrintTechnicalPdf = async () => {
    if (!order) return;
    setIsDownloadingTechnicalPdf(true);

    try {
      const response = await api.get(`/api/v1/orders/${order.id}/production-sheet/pdf`, {
        responseType: 'blob', // Obrigatório para lidar com ficheiros binários (PDF)
      });

      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Ficha_Tecnica_${order.codigo.replace('/', '-')}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Ficha Técnica baixada com sucesso!');
    } catch (error) {
      console.error('Erro ao baixar Ficha Técnica:', error);
      toast.error('Não foi possível gerar a Ficha Técnica de Produção.');
    } finally {
      setIsDownloadingTechnicalPdf(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-on-surface-variant">Carregando detalhes...</p>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="max-w-xl mx-auto my-12 p-6 bg-surface-container-lowest border border-rose-200 rounded-2xl shadow-xs text-center space-y-4">
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-on-surface">Ordem de Serviço não encontrada</h2>
        </div>
        <div className="flex justify-center gap-3 pt-2">
          <button onClick={() => refetch()} className="px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10 rounded-lg transition-colors">
            Tentar Novamente
          </button>
          <Link to="/ordens-servico" className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-y-auto space-y-6 pr-1 pb-8">
      <div className="w-full space-y-6">

        <OrderDetailHeader
          order={order}
          isUpdatingStatus={isUpdatingStatus}

          // Conectado ao novo estado de loading e à nova função de download direto
          isDownloadingPdf={isDownloadingTechnicalPdf}
          onPrintTechnicalPdf={handlePrintTechnicalPdf}

          isDownloadingComprovante={isDownloadingComprovante}
          isDownloadingLabels={isDownloadingLabels}
          onAdvanceWaitingProduction={handleAdvanceToWaitingProduction}
          onAdvanceProduction={handleAdvanceProduction}
          onCompleteProduction={handleCompleteProduction}
          onOpenCancelModal={() => setIsCancelModalOpen(true)}
          onDownloadComprovante={handleDownloadComprovante}
          onPrintLabels={handleOpenThermalLabelsModal}
          onOpenThermalModal={handleOpenThermalLabelsModal}
        />

        {order.status === 'CANCELLED' && (
          <OrderCancelledAlert justificativa={order.justificativaCancelamento} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 space-y-6">
            <OrderItemList items={order.items} />
          </div>
          <div className="lg:col-span-4 space-y-6">
            <OrderFinancialSummaryCard order={order} />
            <OrderDeliveryTimelineCard order={order} />
            <OrderOriginBudgetCard order={order} />
          </div>
        </div>
      </div>

      <CancelOrderModal
        isOpen={isCancelModalOpen}
        orderCodigo={order.codigo}
        isSubmitting={isCanceling}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
      />

      <ThermalLabelModal
        isOpen={isThermalModalOpen}
        onClose={() => setIsThermalModalOpen(false)}
        order={order}
        onDownloadPdf={handleDownloadLabelsPdf}
        isDownloadingPdf={isDownloadingLabels}
      />
    </div>
  );
}

export default OrderDetailPage;