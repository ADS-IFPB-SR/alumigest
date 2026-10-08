import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { budgetsApi } from '../services/budgetsApi';
import { useUpdateBudgetStatus, useReopenBudget } from '../hooks/useBudgets';
import type { CreateBudgetPayload, BudgetStatus, BudgetDetail } from '../types';
import { WhatsAppSummaryModal } from './WhatsAppSummaryModal';
import { shareCommercialPdfLink } from '../utils/whatsappHelper';
import type { Order } from '../../orders/types/order';
import toast from 'react-hot-toast';

interface BudgetDetailActionsProps {
  readonly budgetId: string;
  readonly budgetCode: string;
  readonly customerPhone?: string | null;
  readonly status?: BudgetStatus;
  readonly budgetStatus?: string;
  readonly isExpired?: boolean;
  readonly onDeleteClick: () => void;
  readonly onDownloadPdfTecnico?: () => void;
  readonly isDownloadingPdfTecnico?: boolean;
  readonly onApproveClick?: () => void;
  readonly linkedOrder?: Order | { id: string; codigo?: string; status?: string } | null;
  readonly isOrderCancelled?: boolean;
}

function getApprovalButtonTooltip(isApproved: boolean, isCancelledOrRejected: boolean, isExpired: boolean): string {
  if (isApproved) {
    return 'Este orçamento já foi aprovado e convertido em ordem de serviço.';
  }
  if (isCancelledOrRejected) {
    return 'Orçamentos cancelados ou rejeitados não podem ser aprovados.';
  }
  if (isExpired) {
    return 'Orçamentos com validade expirada não podem ser aprovados.';
  }
  return 'Aprovar este orçamento e convertê-lo em Ordem de Serviço';
}

function buildDuplicatePayload(currentBudget: BudgetDetail, budgetCode: string): CreateBudgetPayload {
  const notes = currentBudget.notes
    ? `${currentBudget.notes} (Cópia do orçamento ${budgetCode})`
    : `Cópia do orçamento ${budgetCode}`;

  return {
    customerId: currentBudget.customerId ?? '',
    discountPercent: currentBudget.discountPercent ?? 0,
    notes,
    commercialConditions: currentBudget.commercialConditions,
    validUntil: currentBudget.validUntil,
    items: (currentBudget.items ?? []).map((item) => ({
      productId: item.productId,
      templateType: item.templateType,
      templateConfig: item.templateConfig,
      handleConfig: item.handleConfig,
      drillingConfig: item.drillingConfig,
      width: item.width,
      height: item.height,
      quantity: item.quantity,
      laborCost: item.laborCost,
      notes: item.notes,
      options: (item.options ?? []).map((opt) => ({
        materialId: opt.materialId,
        quantity: opt.quantity,
        categoryType: opt.categoryType,
      })),
    })),
  };
}

interface WhatsAppDropdownMenuProps {
  readonly menuPosition: { top: number; left: number };
  readonly menuRef: React.RefObject<HTMLDivElement | null>;
  readonly onOpenSummaryModal: () => void;
  readonly onSendCommercialPdf: () => void;
}

function WhatsAppDropdownMenu({
  menuPosition,
  menuRef,
  onOpenSummaryModal,
  onSendCommercialPdf,
}: WhatsAppDropdownMenuProps) {
  return createPortal(
    <div
      ref={menuRef}
      style={{ top: `${menuPosition.top}px`, left: `${menuPosition.left}px` }}
      className="absolute w-56 rounded-lg bg-surface-container-lowest border border-outline-variant shadow-2xl z-[99999] py-1 animate-fadeIn"
    >
      <button
        type="button"
        onClick={onOpenSummaryModal}
        className="w-full px-3 py-2 text-left text-xs font-label hover:bg-surface-container flex items-center gap-2 text-on-surface transition-colors cursor-pointer"
      >
        <span className="material-symbols-outlined text-[18px] text-emerald-600">chat</span>
        <div>
          <p className="font-semibold">Enviar Resumo de Texto</p>
          <p className="text-[10px] text-on-surface-variant">Mensagem formatada com valores</p>
        </div>
      </button>

      <button
        type="button"
        onClick={onSendCommercialPdf}
        className="w-full px-3 py-2 text-left text-xs font-label hover:bg-surface-container flex items-center gap-2 text-on-surface transition-colors cursor-pointer border-t border-outline-variant/40"
      >
        <span className="material-symbols-outlined text-[18px] text-emerald-600">
          picture_as_pdf
        </span>
        <div>
          <p className="font-semibold">Enviar PDF Comercial</p>
          <p className="text-[10px] text-on-surface-variant">Enviar link direto para o cliente</p>
        </div>
      </button>
    </div>,
    document.body
  );
}

function useWhatsAppMenu() {
  const [showWhatsAppMenu, setShowWhatsAppMenu] = useState(false);
  const whatsAppMenuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const toggleWhatsAppMenu = () => {
    if (!showWhatsAppMenu && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
      });
    }
    setShowWhatsAppMenu((prev) => !prev);
  };

  const closeWhatsAppMenu = () => setShowWhatsAppMenu(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const clickedMenu = whatsAppMenuRef.current?.contains(target);
      const clickedButton = buttonRef.current?.contains(target);
      if (!clickedMenu && !clickedButton) {
        setShowWhatsAppMenu(false);
      }
    }
    if (showWhatsAppMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', () => setShowWhatsAppMenu(false), { once: true });
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showWhatsAppMenu]);

  return {
    showWhatsAppMenu,
    toggleWhatsAppMenu,
    closeWhatsAppMenu,
    whatsAppMenuRef,
    buttonRef,
    menuPosition,
  };
}

interface BudgetApprovalOrOrderActionsProps {
  readonly isApproved: boolean;
  readonly isCancelled: boolean;
  readonly linkedOrderId?: string;
  readonly isOrderCancelled: boolean;
  readonly budgetCode: string;
  readonly budgetId: string;
  readonly isApprovalDisabled: boolean;
  readonly approvalButtonTooltip: string;
  readonly onApproveClick?: () => void;
  readonly onReopen: (id: string) => void;
  readonly isReopening: boolean;
}

function BudgetApprovalOrOrderActions({
  isApproved,
  isCancelled,
  linkedOrderId,
  isOrderCancelled,
  budgetCode,
  budgetId,
  isApprovalDisabled,
  approvalButtonTooltip,
  onApproveClick,
  onReopen,
  isReopening,
}: BudgetApprovalOrOrderActionsProps) {
  const navigate = useNavigate();

  if ((isCancelled && isOrderCancelled) || isApproved) {
    const handleNavigate = () => {
      if (linkedOrderId) {
        navigate(`/ordens-servico/${linkedOrderId}`);
      } else {
        navigate(`/ordens-servico?search=${encodeURIComponent(budgetCode)}`);
      }
    };

    return (
      <div className="flex items-center gap-xs shrink-0">
        <Button
          type="button"
          variant="primary"
          icon="assignment"
          data-testid="btn-view-work-order"
          onClick={handleNavigate}
          className="text-xs py-1.5 px-3 whitespace-nowrap cursor-pointer shrink-0"
          title="Ver Ordem de Serviço vinculada a este orçamento"
        >
          <span className="whitespace-nowrap">
            {isOrderCancelled ? 'Ver O.S. (Cancelada)' : 'Ver Ordem de Serviço'}
          </span>
        </Button>

        {isOrderCancelled && (
          <Button
            type="button"
            variant="secondary"
            icon="replay"
            data-testid="btn-reopen-budget"
            onClick={() => onReopen(budgetId)}
            disabled={isReopening}
            className="text-xs py-1.5 px-3 whitespace-nowrap cursor-pointer shrink-0 border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
            title="Reabrir orçamento como rascunho para renegociação após cancelamento do pedido"
          >
            <span className="whitespace-nowrap">
              {isReopening ? 'Reabrindo...' : 'Reabrir Orçamento'}
            </span>
          </Button>
        )}
      </div>
    );
  }

  return (
    <Button
      type="button"
      variant="success"
      icon="check_circle"
      data-testid="btn-approve-budget"
      onClick={onApproveClick}
      disabled={isApprovalDisabled || !onApproveClick}
      className="text-xs py-1.5 px-3 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
      title={approvalButtonTooltip}
    >
      <span className="whitespace-nowrap">Aprovar e Gerar O.S.</span>
    </Button>
  );
}

export function BudgetDetailActions({
  budgetId,
  budgetCode,
  customerPhone,
  status,
  budgetStatus,
  isExpired = false,
  onDeleteClick,
  onDownloadPdfTecnico,
  isDownloadingPdfTecnico,
  onApproveClick,
  linkedOrder,
  isOrderCancelled,
}: BudgetDetailActionsProps) {
  const navigate = useNavigate();
  const { mutate: updateStatus } = useUpdateBudgetStatus();
  const { mutate: reopenBudget, isPending: isReopening } = useReopenBudget();

  const currentStatus = (status ?? budgetStatus ?? 'DRAFT') as BudgetStatus;
  const isApproved = currentStatus === 'APPROVED';
  const isCancelled = currentStatus === 'CANCELLED' || budgetStatus === 'CANCELLED';
  const isCancelledOrRejected = isCancelled || currentStatus === 'REJECTED';
  const isApprovalDisabled = isApproved || isCancelledOrRejected || isExpired;

  const effectiveIsOrderCancelled = Boolean(isOrderCancelled ?? (linkedOrder?.status === 'CANCELLED'));
  const approvalButtonTooltip = getApprovalButtonTooltip(isApproved, isCancelledOrRejected, isExpired);

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [localDownloadingPdfTecnico, setLocalDownloadingPdfTecnico] = useState(false);

  const {
    showWhatsAppMenu,
    toggleWhatsAppMenu,
    closeWhatsAppMenu,
    whatsAppMenuRef,
    buttonRef,
    menuPosition,
  } = useWhatsAppMenu();

  const isDownloadingTecnico = isDownloadingPdfTecnico ?? localDownloadingPdfTecnico;

  const handleDownloadPdfComercial = async () => {
    if (isDownloadingPdf) return;
    try {
      setIsDownloadingPdf(true);
      await budgetsApi.downloadCommercialPdf(budgetId, budgetCode);
      toast.success(`PDF Comercial do orçamento ${budgetCode} gerado com sucesso!`);
    } catch {
      toast.error('Erro ao gerar o PDF Comercial.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleSendCommercialPdfViaWhatsApp = () => {
    try {
      closeWhatsAppMenu();

      shareCommercialPdfLink({
        budgetId,
        budgetCode,
        customerPhone,
        onSuccess: () => {
          if (status === 'DRAFT') {
            updateStatus({ id: budgetId, status: 'SENT' });
          }
        },
      });

      toast.success('WhatsApp aberto com o link do PDF Comercial pronto para envio!');
    } catch {
      toast.error('Erro ao preparar envio do PDF Comercial pelo WhatsApp.');
    }
  };

  const handleEmitirViaTecnica = async () => {
    if (onDownloadPdfTecnico) {
      onDownloadPdfTecnico();
      return;
    }
    if (isDownloadingTecnico || isCancelled) return;
    try {
      setLocalDownloadingPdfTecnico(true);
      await budgetsApi.downloadPdfTecnico(budgetId, budgetCode);
      toast.success('PDF da Ficha Técnica baixado com sucesso!');
    } catch {
      toast.error('Erro ao gerar o PDF técnico.');
    } finally {
      setLocalDownloadingPdfTecnico(false);
    }
  };

  const handleDuplicateBudget = async () => {
    if (isDuplicating) return;
    try {
      setIsDuplicating(true);
      toast('Duplicando orçamento...');

      const currentBudget = await budgetsApi.getBudget(budgetId);
      const payload = buildDuplicatePayload(currentBudget, budgetCode);
      const newBudget = await budgetsApi.createBudget(payload);
      toast.success('Orçamento duplicado com sucesso!');

      if (newBudget?.id) {
        navigate(`/orcamentos/${newBudget.id}`, { state: { justCreated: true } });
      } else {
        navigate('/orcamentos');
      }
    } catch {
      toast.error('Erro ao duplicar o orçamento.');
    } finally {
      setIsDuplicating(false);
    }
  };

  return (
    <div className="flex items-center gap-xs sm:gap-sm flex-wrap shrink-0 w-full pb-1">
      {/* ── 1º WhatsApp (Dropdown: Resumo em Texto / PDF Comercial) ──────── */}
      <div className="relative shrink-0">
        <button
          ref={buttonRef}
          type="button"
          onClick={toggleWhatsAppMenu}
          disabled={isCancelled}
          aria-haspopup="true"
          aria-expanded={showWhatsAppMenu}
          className="p-2 text-on-surface-variant hover:text-emerald-600 hover:bg-surface-container rounded-lg border border-outline-variant/60 transition-colors flex items-center gap-1.5 text-xs font-label font-medium disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed shrink-0"
          title={
            isCancelled
              ? 'Orçamento cancelado. Não é permitido compartilhar proposta cancelada.'
              : 'Opções de compartilhamento via WhatsApp'
          }
        >
          <span className="material-symbols-outlined text-[18px] text-emerald-600">share</span>
          <span className="whitespace-nowrap">WhatsApp</span>
          <span
            className="material-symbols-outlined text-[16px] transition-transform duration-200"
            style={{ transform: showWhatsAppMenu ? 'rotate(180deg)' : 'none' }}
          >
            expand_more
          </span>
        </button>

        {showWhatsAppMenu && (
          <WhatsAppDropdownMenu
            menuPosition={menuPosition}
            menuRef={whatsAppMenuRef}
            onOpenSummaryModal={() => {
              closeWhatsAppMenu();
              setShowWhatsAppModal(true);
            }}
            onSendCommercialPdf={handleSendCommercialPdfViaWhatsApp}
          />
        )}
      </div>

      {/* ── 2º PDF Comercial ────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={handleDownloadPdfComercial}
        disabled={isDownloadingPdf}
        className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg border border-outline-variant/60 transition-colors flex items-center gap-1.5 text-xs font-label font-medium disabled:opacity-50 cursor-pointer shrink-0"
        title="Emitir PDF Comercial"
      >
        <span className="material-symbols-outlined text-[18px]">
          {isDownloadingPdf ? 'progress_activity' : 'picture_as_pdf'}
        </span>
        <span className="whitespace-nowrap">
          {isDownloadingPdf ? 'Gerando PDF...' : 'PDF Comercial'}
        </span>
      </button>

      {/* ── 3º Via Técnica ──────────────────────────────────────────────── */}
      <button
        type="button"
        data-testid="btn-download-pdf-tecnico"
        onClick={handleEmitirViaTecnica}
        disabled={isDownloadingTecnico || isCancelled}
        className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg border border-outline-variant/60 transition-colors flex items-center gap-1.5 text-xs font-label font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
        title={
          isCancelled
            ? 'Não é possível emitir ficha técnica de orçamento cancelado'
            : 'Emitir Via Técnica (Oficina)'
        }
      >
        <span className={`material-symbols-outlined text-[18px] ${isDownloadingTecnico ? 'animate-spin' : ''}`}>
          {isDownloadingTecnico ? 'progress_activity' : 'engineering'}
        </span>
        <span className="whitespace-nowrap">
          {isDownloadingTecnico ? 'Gerando...' : 'Via Técnica'}
        </span>
      </button>

      {/* ── 4º Aprovar ou Ver Ordem de Serviço (US-13.3 / US-15.2) ──────── */}
      <BudgetApprovalOrOrderActions
        isApproved={isApproved}
        isCancelled={isCancelled}
        linkedOrderId={linkedOrder?.id}
        isOrderCancelled={effectiveIsOrderCancelled}
        budgetCode={budgetCode}
        budgetId={budgetId}
        isApprovalDisabled={isApprovalDisabled}
        approvalButtonTooltip={approvalButtonTooltip}
        onApproveClick={onApproveClick}
        onReopen={reopenBudget}
        isReopening={isReopening}
      />

      {/* ── 5º Duplicar ─────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={handleDuplicateBudget}
        disabled={isDuplicating}
        className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg border border-outline-variant/60 transition-colors flex items-center gap-1.5 text-xs font-label font-medium disabled:opacity-50 cursor-pointer shrink-0"
        title="Duplicar este orçamento como uma nova proposta"
      >
        <span className="material-symbols-outlined text-[18px]">
          {isDuplicating ? 'progress_activity' : 'content_copy'}
        </span>
        <span className="whitespace-nowrap">
          {isDuplicating ? 'Duplicando...' : 'Duplicar'}
        </span>
      </button>

      {/* ── 5º Excluir ──────────────────────────────────────────────────── */}
      <Button
        variant="outline"
        icon="delete"
        onClick={onDeleteClick}
        className="text-error border-error/30 hover:bg-error/10 hover:border-error text-xs py-1.5 px-2.5 shrink-0"
        title="Excluir este orçamento"
      >
        <span className="whitespace-nowrap">Excluir</span>
      </Button>

      {/* ── 6º Editar ───────────────────────────────────────────────────── */}
      <Link to={`/orcamentos/${budgetId}/editar`} className="shrink-0">
        <Button variant="outline" icon="edit" className="text-xs py-1.5 px-3 whitespace-nowrap">
          Editar
        </Button>
      </Link>

      {/* ── 7º Novo ─────────────────────────────────────────────────────── */}
      <Link to="/orcamentos/novo" className="shrink-0">
        <Button variant="primary" icon="add" className="text-xs py-1.5 px-3 whitespace-nowrap">
          Novo
        </Button>
      </Link>

      <WhatsAppSummaryModal
        isOpen={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
        budgetId={budgetId}
        budgetCode={budgetCode}
        customerPhone={customerPhone}
        status={status ?? (budgetStatus as BudgetStatus) ?? 'DRAFT'}
      />
    </div>
  );
}