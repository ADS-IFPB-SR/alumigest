import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../../lib/api';
import {
  useCustomers,
  useCustomerDashboard,
  useCustomerBudgets,
  useCustomerOrders,
} from '../hooks/useCustomers';
import { useDownloadLabelsPdf } from '../../orders/hooks/useOrders';
import { ordersApi } from '../../orders/services/ordersApi';
import { ThermalLabelModal } from '../../orders/components/ThermalLabelModal';
import type { Order } from '../../orders/types';
import type { CustomerSummaryDTO } from '../services/customersApi';
import { CustomerMasterSidebar } from './CustomerMasterSidebar';
import { CustomerHeroCard } from './CustomerHeroCard';
import { CustomerKpiGrid } from './CustomerKpiGrid';
import { CustomerBudgetsTab } from './CustomerBudgetsTab';
import { CustomerOrdersTab } from './CustomerOrdersTab';
import { Users, FileText, ClipboardList } from 'lucide-react';

function triggerPdfBlobDownload(data: BlobPart, filename: string): void {
  const url = window.URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export const CustomerHubPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | undefined>(
    searchParams.get('id') || undefined
  );
  const [activeTab, setActiveTab] = useState<'orders' | 'budgets'>('budgets');
  const [budgetPage, setBudgetPage] = useState(0);

  // Estado para o Modal de Etiquetas Térmicas (US-47.4)
  const [selectedOrderForLabels, setSelectedOrderForLabels] = useState<Order | null>(null);
  const [isThermalModalOpen, setIsThermalModalOpen] = useState(false);

  // Hook de download de PDF de etiquetas térmicas (US-47.4)
  const { mutate: downloadLabels, isPending: isDownloadingLabels } = useDownloadLabelsPdf();

  // 1. Fetch Customers List for Master Sidebar
  const { data: customersData, isLoading: isLoadingCustomers } = useCustomers({
    busca: searchQuery,
    page: 0,
    size: 50,
  });

  const customers = useMemo(() => customersData?.content || [], [customersData]);

  // If no customer is explicitly selected, default to the first customer in list
  useEffect(() => {
    if (!selectedCustomerId && customers.length > 0) {
      const firstId = customers[0].id;
      setSelectedCustomerId(firstId);
      setSearchParams({ id: firstId }, { replace: true });
    }
  }, [customers, selectedCustomerId, setSearchParams]);

  // 2. Fetch Selected Customer Dashboard (Hero + KPIs)
  const {
    data: dashboardData,
    isLoading: isLoadingDashboard,
    isError: isDashboardError,
  } = useCustomerDashboard(selectedCustomerId);

  // 3. Fetch Selected Customer Budgets
  const {
    data: budgetsData,
    isLoading: isLoadingBudgets,
  } = useCustomerBudgets(selectedCustomerId, { page: budgetPage, size: 10 });

  const budgets = useMemo(() => budgetsData?.content || [], [budgetsData]);
  const totalBudgetPages = budgetsData?.page?.totalPages ?? 1;

  // 4. Fetch Selected Customer Orders
  const {
    data: ordersData,
    isLoading: isLoadingOrders,
  } = useCustomerOrders(selectedCustomerId);

  const orders = useMemo(() => ordersData ?? [], [ordersData]);

  // Handlers
  const handleSelectCustomer = (customer: CustomerSummaryDTO) => {
    setSelectedCustomerId(customer.id);
    setBudgetPage(0);
    setSearchParams({ id: customer.id });
  };

  const handleNewBudget = (customerId: string) => {
    navigate(`/orcamentos/novo?clienteId=${customerId}`);
  };

  const handleViewPdf = (budgetId: string) => {
    toast.success(`Abrindo proposta em PDF (ID: ${budgetId.slice(0, 8)})...`);
    window.open(`/api/orcamentos/${budgetId}/pdf`, '_blank');
  };

  const handleOpenTechSheet = async (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    const identifier = (order?.codigo ?? orderId).replaceAll('/', '-');
    try {
      const response = await api.get(`/orders/${orderId}/production-sheet/pdf`, {
        responseType: 'blob',
      });
      triggerPdfBlobDownload(response.data, `Ficha_Tecnica_${identifier}.pdf`);
      toast.success('Ficha Técnica baixada com sucesso!');
    } catch {
      toast.error('Erro ao transferir a ficha técnica.');
    }
  };

  /**
   * Aciona a abertura do ThermalLabelModal para a ordem selecionada (US-47.4).
   */
  const handleOpenLabels = async (orderId: string) => {
    try {
      const fullOrder = await ordersApi.getOrderById(orderId);
      setSelectedOrderForLabels(fullOrder);
      setIsThermalModalOpen(true);
    } catch (error) {
      console.error('Erro ao buscar dados da O.S. para etiquetas térmicas:', error);
      toast.error('Não foi possível carregar a Ordem de Serviço para impressão de etiquetas.');
    }
  };

  /**
   * Dispara o download das etiquetas em PDF a partir do ThermalLabelModal (US-47.4).
   */
  const handleDownloadLabelsPdf = (
    itemId?: string,
    customLeaves?: Record<string, number>
  ) => {
    if (!selectedOrderForLabels) return;
    const sanitizedItemId = typeof itemId === 'string' ? itemId : undefined;
    downloadLabels({
      id: selectedOrderForLabels.id,
      codigo: selectedOrderForLabels.codigo,
      ...(sanitizedItemId ? { itemId: sanitizedItemId } : {}),
      customLeaves,
    });
  };

  const renderDetailContent = () => {
    if (isLoadingDashboard) {
      return (
        <div className="flex items-center justify-center p-16 text-slate-500 text-sm">
          Carregando dados do cliente...
        </div>
      );
    }

    if (isDashboardError || !dashboardData) {
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center text-slate-500">
          <Users className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
          <p className="text-sm font-semibold">Nenhum cliente selecionado</p>
          <p className="text-xs text-slate-400 mt-1">
            Selecione um cliente na barra lateral para visualizar seu Hub 360°.
          </p>
        </div>
      );
    }

    return (
      <>
        {/* 1. Hero Card */}
        <CustomerHeroCard
          customer={dashboardData}
          onNewBudget={handleNewBudget}
        />

        {/* 2. KPI Cards */}
        <CustomerKpiGrid
          totalContratado={dashboardData.totalContratado}
          quantidadeOrdensServico={dashboardData.quantidadeOrdensServico}
          quantidadeOrcamentos={dashboardData.quantidadeOrcamentos}
        />

        {/* 3. Navigation Tabs */}
        <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-6">
          <button
            type="button"
            onClick={() => setActiveTab('budgets')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'budgets'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Orçamentos</span>
            <span className="px-1.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              {dashboardData.quantidadeOrcamentos}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'orders'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Ordens de Serviço (O.S.)</span>
            <span className="px-1.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {dashboardData.quantidadeOrdensServico}
            </span>
          </button>
        </div>

        {/* 4. Tab Content */}
        {activeTab === 'budgets' ? (
          <CustomerBudgetsTab
            budgets={budgets}
            clientPhone={dashboardData.telefone}
            clientName={dashboardData.nomeCompleto}
            isLoading={isLoadingBudgets}
            page={budgetPage}
            totalPages={totalBudgetPages}
            onPageChange={setBudgetPage}
            onViewPdf={handleViewPdf}
          />
        ) : (
          <CustomerOrdersTab
            orders={orders}
            isLoading={isLoadingOrders}
            onOpenTechSheet={handleOpenTechSheet}
            onOpenLabels={handleOpenLabels}
          />
        )}
      </>
    );
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-0 overflow-hidden rounded-xl">
      {/* Top Bar / Breadcrumb */}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Central 360° do Cliente
              </h1>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                Hub 360°
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Gestão unificada de histórico, orçamentos e Ordens de Serviço
            </p>
          </div>
        </div>
      </div>

      {/* Main Content: Master-Detail Layout */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        {/* Left: Master Sidebar */}
        <CustomerMasterSidebar
          customers={customers}
          selectedCustomerId={selectedCustomerId}
          onSelectCustomer={handleSelectCustomer}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isLoading={isLoadingCustomers}
        />

        {/* Right: 360 Detail Work Area */}
        <main
          aria-label="Painel 360 do Cliente"
          className="flex-1 p-4 md:p-6 min-h-0 overflow-y-auto space-y-6"
        >
          {renderDetailContent()}
        </main>
      </div>

      {/* Modal de Etiquetas Térmicas (100x60mm Elgin L42) - US-47.4 */}
      {selectedOrderForLabels && (
        <ThermalLabelModal
          isOpen={isThermalModalOpen}
          onClose={() => setIsThermalModalOpen(false)}
          order={selectedOrderForLabels}
          onDownloadPdf={handleDownloadLabelsPdf}
          isDownloadingPdf={isDownloadingLabels}
        />
      )}
    </div>
  );
};
