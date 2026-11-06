import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

// 1. IMPORTAÇÃO DIRETA DO MODAL NOVO
import { TechnicalSheetPreviewModal } from '../features/orders/components/TechnicalSheetPreviewModal';

// 2. IMPORTAÇÕES DA PASTA ORDERS (Sem o Modal novo aqui dentro!)
import {
  useOrder,
  useCancelOrder,
  useDownloadComprovantePdf,
  useDownloadLabelsPdf,
  // OrderDetailHeader, // COMENTADO TEMPORARIAMENTE
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

  // 3. ESTADO DO NOVO MODAL
  const [isTechnicalModalOpen, setIsTechnicalModalOpen] = useState(false);

  // ... (funções mantidas iguais para não quebrar referências)
  const handleAdvanceToWaitingProduction = () => { /* ... */ };
  const handleAdvanceProduction = () => { /* ... */ };
  const handleCompleteProduction = () => { /* ... */ };
  const handleDownloadComprovante = () => { /* ... */ };
  const handleOpenThermalLabelsModal = () => { /* ... */ };
  const handleDownloadLabelsPdf = () => { /* ... */ };
  const handleConfirmCancel = () => { /* ... */ };

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

        {/* ========================================================= */}
        {/* SOLUÇÃO NUCLEAR: BOTÃO DE TESTE DIRETO                    */}
        {/* ========================================================= */}
        <div className="p-4 bg-rose-100 border-2 border-rose-500 rounded-xl mb-6 text-center">
          <h2 className="text-rose-800 font-bold mb-2">DEBUG: Teste de Abertura do Modal</h2>
          <button
            type="button"
            onClick={() => {
              console.log("Clicou no botão nuclear! isTechnicalModalOpen vai mudar para TRUE.");
              setIsTechnicalModalOpen(true);
            }}
            className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-lg"
          >
            TESTE NUCLEAR: ABRIR MODAL DA FICHA TÉCNICA
          </button>
        </div>
        {/* ========================================================= */}

        {/*
          O componente original está comentado para não interferir

          <OrderDetailHeader
            order={order}
            isUpdatingStatus={isUpdatingStatus}
            isDownloadingPdf={false}
            isDownloadingComprovante={isDownloadingComprovante}
            isDownloadingLabels={isDownloadingLabels}
            onAdvanceWaitingProduction={handleAdvanceToWaitingProduction}
            onAdvanceProduction={handleAdvanceProduction}
            onCompleteProduction={handleCompleteProduction}
            onOpenCancelModal={() => setIsCancelModalOpen(true)}
            onPrintTechnicalPdf={() => setIsTechnicalModalOpen(true)}
            onDownloadComprovante={handleDownloadComprovante}
            onPrintLabels={handleOpenThermalLabelsModal}
            onOpenThermalModal={handleOpenThermalLabelsModal}
          />
        */}

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

      {/* 5. O COMPONENTE DO MODAL SENDO RENDERIZADO */}
      <TechnicalSheetPreviewModal
        isOpen={isTechnicalModalOpen}
        onClose={() => setIsTechnicalModalOpen(false)}
        orderId={order.id}
        orderCode={order.codigo}
      />
    </div>
  );
}

export default OrderDetailPage;