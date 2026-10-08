import { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  useBudget,
  useDeleteBudget,
  useUpdateBudgetStatus,
  useDownloadPdfTecnico,
  useReopenBudget,
} from '../features/budgets/hooks/useBudgets';
import { useOrders } from '../features/orders/hooks/useOrders';
import { Button } from '../components/ui/Button';
import type { BudgetStatus } from '../features/budgets/types';
import { formatBRL } from '../features/budgets/utils/calculations';
import { BudgetMaterialsSummary } from '../features/budgets/components/BudgetMaterialsSummary';
import { BudgetStatusPipeline } from '../features/budgets/components/BudgetStatusPipeline';
import { BudgetFinancialSummaryCard } from '../features/budgets/components/BudgetFinancialSummaryCard';
import { BudgetDetailActions } from '../features/budgets/components/BudgetDetailActions';
import {
  BudgetProposalItemCard,
  type BudgetProposalItem,
} from '../features/budgets/components/BudgetProposalItemCard';
import { BudgetRomaneioView } from '../features/budgets/components/BudgetRomaneioView';
import { OrderApprovalModal } from '../features/orders/components/OrderApprovalModal';

interface CreatedBudgetBannerProps {
  readonly isOpen: boolean;
  readonly budgetCode: string;
  readonly onClose: () => void;
}

function CreatedBudgetBanner({ isOpen, budgetCode, onClose }: CreatedBudgetBannerProps) {
  if (!isOpen) return null;

  return (
    <div className="bg-tertiary-container/20 border border-tertiary-container/40 rounded-xl p-md flex items-center justify-between gap-sm animate-fadeIn">
      <div className="flex items-center gap-sm">
        <span className="material-symbols-outlined text-primary text-[24px]">verified</span>
        <div>
          <p className="font-label font-bold text-on-surface text-sm">Orçamento gerado com sucesso!</p>
          <p className="text-xs text-on-surface-variant font-body">
            A proposta <strong className="font-data-mono">{budgetCode}</strong> foi salva no sistema.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="p-1 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-md transition-colors"
        aria-label="Fechar aviso"
      >
        <span className="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>
  );
}

interface CancelledOrderBannerProps {
  readonly isVisible: boolean;
  readonly linkedOrderCodigo?: string;
  readonly isReopening: boolean;
  readonly onReopen: () => void;
}

function CancelledOrderBanner({
  isVisible,
  linkedOrderCodigo,
  isReopening,
  onReopen,
}: CancelledOrderBannerProps) {
  if (!isVisible) return null;

  return (
    <div
      data-testid="banner-order-cancelled"
      className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-md flex items-center justify-between gap-sm animate-fadeIn"
    >
      <div className="flex items-center gap-sm">
        <span className="material-symbols-outlined text-amber-600 text-[24px]">
          warning
        </span>
        <div>
          <p className="font-label font-bold text-on-surface text-sm">
            Ordem de Serviço Cancelada {linkedOrderCodigo ? `(${linkedOrderCodigo})` : ''}
          </p>
          <p className="text-xs text-on-surface-variant font-body">
            A ordem de serviço vinculada a este orçamento foi cancelada. Você pode reabrir esta proposta como rascunho para renegociação com o cliente.
          </p>
        </div>
      </div>
      <Button
        type="button"
        variant="secondary"
        icon="replay"
        data-testid="btn-reopen-budget-banner"
        onClick={onReopen}
        disabled={isReopening}
        className="text-xs py-1.5 px-3 whitespace-nowrap shrink-0 border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 cursor-pointer"
      >
        {isReopening ? 'Reabrindo...' : 'Reabrir Orçamento'}
      </Button>
    </div>
  );
}

interface BudgetCustomerCardProps {
  readonly customer?: {
    id?: string;
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    document?: string;
  } | null;
  readonly fallbackName?: string;
}

function BudgetCustomerCard({ customer, fallbackName }: BudgetCustomerCardProps) {
  const displayName = customer?.name ?? fallbackName ?? 'Cliente';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-xs flex flex-col gap-sm break-inside-avoid">
      <div className="flex items-center justify-between pb-xs border-b border-outline-variant">
        <span className="text-xs font-label font-bold text-on-surface uppercase tracking-wider flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px] text-primary">person</span>
          {' '}Cliente
        </span>
        {customer?.id && (
          <Link
            to={`/clientes/${customer.id}`}
            className="text-[11px] font-label font-semibold text-primary hover:underline no-print"
          >
            Ver cadastro
          </Link>
        )}
      </div>

      <div className="flex items-start gap-sm pt-xs">
        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-base flex items-center justify-center shrink-0 border border-primary/20">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-label font-bold text-on-surface text-sm sm:text-base truncate">
            {displayName}
          </p>
          {customer?.document && (
            <p className="text-[11px] font-data-mono text-on-surface-variant">
              Doc: {customer.document}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-xs pt-xs border-t border-outline-variant/50 text-xs font-body text-on-surface-variant">
        {customer?.phone ? (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-primary">phone</span>
              <span className="font-data-mono">{customer.phone}</span>
            </span>
            <a
              href={`https://wa.me/55${customer.phone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-emerald-600 dark:text-emerald-400 font-label font-semibold hover:underline flex items-center gap-0.5 no-print"
            >
              <span>WhatsApp</span>
              <span className="material-symbols-outlined text-[13px]">open_in_new</span>
            </a>
          </div>
        ) : (
          <p className="text-[11px] italic text-on-surface-variant/70">Telefone não informado</p>
        )}

        {customer?.email && (
          <div className="flex items-center gap-1 truncate">
            <span className="material-symbols-outlined text-[15px] text-primary shrink-0">mail</span>
            <span className="truncate">{customer.email}</span>
          </div>
        )}

        {customer?.address && (
          <div className="flex items-start gap-1 pt-0.5">
            <span className="material-symbols-outlined text-[15px] text-primary shrink-0 mt-0.5">location_on</span>
            <span className="line-clamp-2 text-[11px]">{customer.address}</span>
          </div>
        )}
      </div>
    </div>
  );
}

interface BudgetPrintHeaderProps {
  readonly code: string;
  readonly activeTab: 'proposta' | 'romaneio';
  readonly customerName?: string;
  readonly customerAddress?: string;
}

function BudgetPrintHeader({
  code,
  activeTab,
  customerName,
  customerAddress,
}: BudgetPrintHeaderProps) {
  const isRomaneio = activeTab === 'romaneio';

  return (
    <div className="print-only mb-4 pb-3 border-b-2 border-primary">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold text-primary uppercase tracking-wider">
            {isRomaneio ? 'Romaneio de Peças — Via Técnica / Oficina' : 'Proposta Comercial'}
          </h1>
          <p className="text-xs text-secondary font-mono mt-0.5">
            Proposta: {code} · Emissão: {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>
        <div className="text-right text-xs text-secondary">
          <p className="font-bold text-primary">AlumiGest — Gestão de Esquadrias & Vidros</p>
          <p>Cliente: {customerName ?? 'Vidraçaria Silva'}</p>
          {customerAddress && <p>Endereço: {customerAddress}</p>}
        </div>
      </div>
    </div>
  );
}

interface BudgetProposalItemsSectionProps {
  readonly budgetId: string;
  readonly items?: BudgetProposalItem[];
  readonly expandedItems: Record<string, boolean>;
  readonly onToggleExpanded: (id: string) => void;
}

function BudgetProposalItemsSection({
  budgetId,
  items,
  expandedItems,
  onToggleExpanded,
}: BudgetProposalItemsSectionProps) {
  const itemList = items ?? [];
  const totalUnits = itemList.reduce((sum, item) => sum + (item.quantity ?? 1), 0);

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xs overflow-hidden break-inside-avoid">
      <div className="bg-surface-container-low/50 border-b border-outline-variant px-md py-sm flex justify-between items-center flex-wrap gap-xs">
        <div className="flex items-center gap-xs">
          <span className="material-symbols-outlined text-[20px] text-primary">window</span>
          <h2 className="font-label font-bold text-sm sm:text-base text-on-surface uppercase tracking-wider">
            Esquadrias & Itens do Orçamento
          </h2>
        </div>
        <div className="flex items-center gap-sm text-xs font-data-mono text-on-surface-variant">
          <span className="bg-surface px-2 py-0.5 rounded border border-outline-variant font-semibold text-primary">
            {itemList.length} {itemList.length === 1 ? 'modelo' : 'modelos'}
          </span>
          <span>
            {totalUnits} un no total
          </span>
        </div>
      </div>

      {itemList.length === 0 ? (
        <div className="p-xl text-center flex flex-col items-center justify-center gap-sm bg-surface-container-lowest">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-xs">
            <span className="material-symbols-outlined text-[28px]">design_services</span>
          </div>
          <h3 className="font-headline font-bold text-on-surface text-base">
            Nenhuma esquadria adicionada a esta proposta
          </h3>
          <p className="text-xs sm:text-sm text-on-surface-variant max-w-md font-body">
            Este orçamento ainda não possui itens cadastrados. Clique no botão abaixo para adicionar esquadrias sob medida.
          </p>
          <Link to={`/orcamentos/${budgetId}/editar`} className="mt-xs">
            <Button variant="primary" icon="add">
              Configurar Esquadrias
            </Button>
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-outline-variant/50">
          {itemList.map((item, idx) => {
            const itemId = item.id || `item-${idx}`;
            return (
              <BudgetProposalItemCard
                key={itemId}
                item={item}
                isExpanded={expandedItems[itemId] ?? false}
                onToggleExpanded={() => onToggleExpanded(itemId)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

interface BudgetNotesCardProps {
  readonly notes?: string | null;
}

function BudgetNotesCard({ notes }: BudgetNotesCardProps) {
  if (!notes) return null;

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-xs flex flex-col gap-sm break-inside-avoid">
      <h3 className="font-label font-bold text-xs uppercase tracking-wider text-on-surface-variant pb-xs border-b border-outline-variant flex items-center gap-1">
        <span className="material-symbols-outlined text-[16px] text-primary">description</span>
        {' '}Observações / Notas do Orçamento
      </h3>
      <div className="bg-surface-container-low p-sm rounded-lg border border-outline-variant/50 text-xs font-body">
        <p className="text-on-surface-variant whitespace-pre-line leading-relaxed">{notes}</p>
      </div>
    </div>
  );
}

interface BudgetDeleteConfirmModalProps {
  readonly isOpen: boolean;
  readonly budgetCode: string;
  readonly customerName?: string;
  readonly total: number;
  readonly isDeleting: boolean;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}

function BudgetDeleteConfirmModal({
  isOpen,
  budgetCode,
  customerName,
  total,
  isDeleting,
  onConfirm,
  onCancel,
}: BudgetDeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-md bg-black/60 backdrop-blur-sm">
      <div className="bg-surface border border-outline-variant rounded-xl p-lg max-w-sm w-full shadow-2xl flex flex-col gap-md">
        <div className="flex items-center gap-sm text-error">
          <span className="material-symbols-outlined text-[24px]">warning</span>
          <h4 className="font-headline font-bold text-on-surface text-base">Excluir Orçamento?</h4>
        </div>
        <p className="text-sm text-on-surface-variant font-body">
          Tem certeza que deseja excluir o orçamento <strong>{budgetCode}</strong> de <strong>{customerName ?? 'Cliente'}</strong> ({formatBRL(total)})? Esta ação não pode ser desfeita.
        </p>
        <div className="flex justify-end gap-sm mt-xs">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="px-md py-xs rounded-md border border-outline-variant text-sm font-label font-medium hover:bg-surface-container transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-md py-xs rounded-md bg-error text-on-error text-sm font-label font-bold hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
          >
            {isDeleting ? 'Excluindo...' : 'Excluir'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function BudgetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const { data: budget, isLoading, isError } = useBudget(id);
  const { mutate: deleteBudget, isPending: isDeleting } = useDeleteBudget();
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateBudgetStatus();
  const { mutate: downloadPdf, isPending: isDownloadingPdf } = useDownloadPdfTecnico();
  const { mutate: reopenBudget, isPending: isReopening } = useReopenBudget();

  const isApproved = budget?.status === 'APPROVED';
  const orderSearchParams = isApproved && budget?.code ? { search: budget.code, size: 1 } : undefined;
  const { data: linkedOrders } = useOrders(orderSearchParams);
  const linkedOrder = isApproved ? linkedOrders?.content?.[0] : undefined;
  const isOrderCancelled = linkedOrder?.status === 'CANCELLED';

  const downloadPdfTecnico = () => {
    if (!budget || isDownloadingPdf || budget.status === 'CANCELLED') return;
    downloadPdf({ id: budget.id, code: budget.code });
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'proposta' | 'romaneio'>('proposta');
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleItemExpanded = (itemId: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const [showCreatedBanner, setShowCreatedBanner] = useState<boolean>(() => {
    return Boolean((location.state as { justCreated?: boolean } | null)?.justCreated);
  });

  useEffect(() => {
    if ((location.state as { justCreated?: boolean } | null)?.justCreated) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  const handleDelete = () => {
    if (!budget) return;
    deleteBudget(budget.id, {
      onSuccess: () => {
        navigate('/orcamentos');
      },
    });
  };

  const handleStatusChange = (newStatus: BudgetStatus) => {
    if (!budget || budget.status === newStatus || isUpdatingStatus) return;
    updateStatus({ id: budget.id, status: newStatus });
  };

  const isBudgetExpired = Boolean(
    budget?.validUntil && new Date(budget.validUntil) < new Date(new Date().toDateString()),
  );

  const handleCloseApprovalModal = useCallback(() => {
    setShowApprovalModal(false);
  }, []);

  const handleApprovalSuccess = useCallback(
    (order: import('../features/orders/types').Order) => {
      setShowApprovalModal(false);
      navigate(`/ordens-servico/${order.id}`);
    },
    [navigate],
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-xl gap-sm text-secondary">
        <span className="material-symbols-outlined animate-spin text-[24px]">progress_activity</span>
        <span className="font-body-sm">Carregando orçamento...</span>
      </div>
    );
  }

  if (isError || !budget) {
    return (
      <div className="flex flex-col items-center justify-center py-xl gap-md text-center">
        <span className="material-symbols-outlined text-error text-[48px]">error</span>
        <p className="font-headline text-headline-md text-on-surface">Orçamento não encontrado</p>
        <p className="text-sm text-on-surface-variant">
          O orçamento com ID <code className="font-data-mono bg-surface-container px-xs rounded">{id}</code> não foi encontrado.
        </p>
        <Link to="/orcamentos">
          <Button variant="primary" icon="arrow_back">Voltar aos Orçamentos</Button>
        </Link>
      </div>
    );
  }

  const subtotal = budget.subtotal ?? 0;
  const discountValue = budget.discountValue ?? 0;
  const freightCost = budget.freightCost ?? 0;
  const installationCost = budget.installationCost ?? 0;

  const totalLaborCost = (budget.items ?? []).reduce((sum, item) => {
    return sum + ((item.laborCost ?? 0) * (item.quantity ?? 1));
  }, 0);

  const total = budget.total ?? 0;
  const hasDiscount = discountValue > 0;
  const isPercentDiscount = Boolean(budget.discountPercent && budget.discountPercent > 0);

  const commercialConditions = budget.paymentNotes ?? budget.commercialConditions ?? null;
  const paymentMethod = budget.paymentConditionLabel ?? budget.paymentCondition ?? null;
  const customerDisplayName = budget.customer?.name ?? budget.customerName;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-surface">
      {/* ── Topbar / Header Executivo ──────────────────────────────────── */}
      <header className="border-b border-outline-variant bg-surface-container-lowest/80 backdrop-blur-md px-md lg:px-xl py-sm flex flex-col gap-3 shrink-0 shadow-2xs">
        <div className="flex items-center gap-sm flex-wrap w-full">
          <Link
            to="/orcamentos"
            className="flex items-center gap-1 text-xs font-label font-medium text-on-surface-variant hover:text-primary transition-colors py-1 px-2 rounded-md hover:bg-surface-container shrink-0"
            title="Voltar aos orçamentos"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span className="hidden sm:inline">Orçamentos</span>
          </Link>

          <span className="text-outline-variant shrink-0 hidden sm:inline">/</span>

          <h1 className="font-headline text-xl sm:text-2xl font-extrabold text-on-surface tracking-tight whitespace-nowrap shrink-0">
            {budget.code}
          </h1>

          <div className="ml-xs sm:ml-sm flex-shrink-0">
            <BudgetStatusPipeline
              status={budget.status}
              onChange={handleStatusChange}
              disabled={isUpdatingStatus}
            />
          </div>
        </div>

        {/* ── Barra de Ações Superior Isolada ────────────────────────────── */}
        <BudgetDetailActions
          budgetId={budget.id}
          budgetCode={budget.code}
          customerPhone={budget.customer?.phone}
          status={budget.status}
          budgetStatus={budget.status}
          onDeleteClick={() => setShowDeleteModal(true)}
          onDownloadPdfTecnico={downloadPdfTecnico}
          isDownloadingPdfTecnico={isDownloadingPdf}
          onApproveClick={() => setShowApprovalModal(true)}
          isExpired={isBudgetExpired}
        />
      </header>

      {/* ── Conteúdo Principal ───────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-md lg:p-xl">
        <div className="max-w-[1440px] mx-auto flex flex-col gap-md">

          <CreatedBudgetBanner
            isOpen={showCreatedBanner}
            budgetCode={budget.code}
            onClose={() => setShowCreatedBanner(false)}
          />

          <CancelledOrderBanner
            isVisible={Boolean(isApproved && isOrderCancelled)}
            linkedOrderCodigo={linkedOrder?.codigo}
            isReopening={isReopening}
            onReopen={() => reopenBudget(budget.id)}
          />

          {/* ── Navegação por Abas (Proposta Comercial vs Romaneio de Peças) ── */}
          <div className="flex items-center gap-xs border-b border-outline-variant/60 pb-2 no-print">
            <button
              type="button"
              data-testid="tab-proposta"
              onClick={() => setActiveTab('proposta')}
              className={`px-4 py-2 text-xs font-label font-bold rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'proposta'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">request_quote</span>
              <span>Proposta Comercial</span>
            </button>

            <button
              type="button"
              data-testid="tab-romaneio"
              onClick={() => setActiveTab('romaneio')}
              className={`px-4 py-2 text-xs font-label font-bold rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'romaneio'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">build_circle</span>
              <span>Romaneio de Peças</span>
            </button>
          </div>

          {/* ── Cabeçalho Timbrado para Saída Impressa (A4) ──────────────────── */}
          <BudgetPrintHeader
            code={budget.code}
            activeTab={activeTab}
            customerName={customerDisplayName}
            customerAddress={budget.customer?.address}
          />

          {activeTab === 'proposta' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-md lg:gap-lg items-start">
              {/* Coluna Esquerda: Itens & Materiais (8 colunas) */}
              <div className="lg:col-span-8 flex flex-col gap-md">
                <BudgetProposalItemsSection
                  budgetId={budget.id}
                  items={budget.items}
                  expandedItems={expandedItems}
                  onToggleExpanded={toggleItemExpanded}
                />

                {budget.items && budget.items.length > 0 && (
                  <BudgetMaterialsSummary items={budget.items} className="break-inside-avoid" />
                )}

                <BudgetNotesCard notes={budget.notes} />
              </div>

              {/* Coluna Direita: Sidebar Cliente + Fechamento Financeiro (4 colunas) */}
              <div className="lg:col-span-4 flex flex-col gap-md lg:sticky lg:top-4">
                <BudgetCustomerCard
                  customer={budget.customer}
                  fallbackName={budget.customerName}
                />

                <div className="break-inside-avoid">
                  <BudgetFinancialSummaryCard
                    subtotal={subtotal}
                    totalLaborCost={totalLaborCost}
                    freightCost={freightCost}
                    installationCost={installationCost}
                    hasDiscount={hasDiscount}
                    isPercentDiscount={isPercentDiscount}
                    discountPercent={budget.discountPercent}
                    discountValue={discountValue}
                    total={total}
                    paymentCondition={budget.paymentCondition}
                    paymentConditionLabel={budget.paymentConditionLabel}
                    paymentMethod={paymentMethod}
                    paymentNotes={budget.paymentNotes}
                    commercialConditions={commercialConditions}
                    createdAt={budget.createdAt}
                    validUntil={budget.validUntil}
                  />
                </div>
              </div>
            </div>
          ) : (
            <BudgetRomaneioView budget={budget} />
          )}
        </div>
      </div>

      <BudgetDeleteConfirmModal
        isOpen={showDeleteModal}
        budgetCode={budget.code}
        customerName={customerDisplayName}
        total={budget.total}
        isDeleting={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

      <OrderApprovalModal
        isOpen={showApprovalModal}
        onClose={handleCloseApprovalModal}
        budgetId={budget.id}
        budgetCode={budget.code}
        customerName={budget.customer?.name}
        onSuccess={handleApprovalSuccess}
      />
    </div>
  );
}