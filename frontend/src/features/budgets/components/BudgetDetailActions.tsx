import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { budgetsApi } from '../services/budgetsApi';
import { useUpdateBudgetStatus } from '../hooks/useBudgets';
import type { CreateBudgetPayload, BudgetStatus, BudgetDetail } from '../types';
import { WhatsAppSummaryModal } from './WhatsAppSummaryModal';
import { openWhatsAppChat, sanitizeWhatsAppText, shareCommercialPdfLink } from '../utils/whatsappHelper';
import { copyToClipboard } from '../utils/clipboardHelper';
import { useOrders } from '../../orders/hooks/useOrders';
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
}: BudgetDetailActionsProps) {
  const navigate = useNavigate();
  const { mutate: updateStatus } = useUpdateBudgetStatus();

  const currentStatus = (status ?? budgetStatus ?? 'DRAFT') as BudgetStatus;
  const isApproved = currentStatus === 'APPROVED';
  const isCancelledOrRejected = currentStatus === 'CANCELLED' || currentStatus === 'REJECTED';
  const isApprovalDisabled = isApproved || isCancelledOrRejected || isExpired;

  const { data: linkedOrders } = useOrders(
    isApproved ? { search: budgetCode, size: 1 } : undefined
  );
  const linkedOrder = isApproved ? linkedOrders?.content?.[0] : undefined;
  const approvalButtonTooltip = getApprovalButtonTooltip(isApproved, isCancelledOrRejected, isExpired);

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [showWhatsAppMenu, setShowWhatsAppMenu] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [localDownloadingPdfTecnico, setLocalDownloadingPdfTecnico] = useState(false);
  const [isOpeningWhatsApp, setIsOpeningWhatsApp] = useState(false);
  const [isCopyingSummary, setIsCopyingSummary] = useState(false);

  const isDownloadingTecnico = isDownloadingPdfTecnico ?? localDownloadingPdfTecnico;

  const whatsAppMenuRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown do WhatsApp ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (whatsAppMenuRef.current && !whatsAppMenuRef.current.contains(event.target as Node)) {
        setShowWhatsAppMenu(false);
      }
    }
    if (showWhatsAppMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showWhatsAppMenu]);

  const handleDownloadPdfComercial = async () => {
    if (isDownloadingPdf) return;
    try {
      setIsDownloadingPdf(true);
      await budgetsApi.downloadCommercialPdf(budgetId, budgetCode);
      toast.success(`PDF Comercial do orçamento ${budgetCode} gerado com sucesso!`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Erro ao gerar o PDF Comercial.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleSendCommercialPdfViaWhatsApp = () => {
    try {
      setShowWhatsAppMenu(false);

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

  const handleOpenWhatsAppDirect = async () => {
    if (isOpeningWhatsApp) return;
    try {
      setIsOpeningWhatsApp(true);
      setShowWhatsAppMenu(false);

      const rawText = await budgetsApi.getWhatsAppSummary(budgetId);
      const formattedText = sanitizeWhatsAppText(rawText);

      openWhatsAppChat({
        phone: customerPhone,
        text: formattedText,
      });

      if (status === 'DRAFT') {
        updateStatus({ id: budgetId, status: 'SENT' });
      }

      toast.success('WhatsApp aberto pronto para envio do resumo!');
    } catch {
      toast.error('Erro ao abrir o WhatsApp.');
    } finally {
      setIsOpeningWhatsApp(false);
    }
  };

  const handleCopyWhatsAppSummary = async () => {
    if (isCopyingSummary) return;
    try {
      setIsCopyingSummary(true);
      setShowWhatsAppMenu(false);

      const rawText = await budgetsApi.getWhatsAppSummary(budgetId);
      const formattedText = sanitizeWhatsAppText(rawText);
      const success = await copyToClipboard(formattedText);

      if (success) {
        toast.success('Resumo para WhatsApp copiado com sucesso!');
        if (status === 'DRAFT') {
          updateStatus({ id: budgetId, status: 'SENT' });
        }
      } else {
        setShowWhatsAppModal(true);
        toast.error('Não foi possível copiar automaticamente. Selecione e copie no modal.');
      }
    } catch {
      toast.error('Erro ao obter resumo para o WhatsApp.');
    } finally {
      setIsCopyingSummary(false);
    }
  };

  const handleEmitirViaTecnica = async () => {
    if (onDownloadPdfTecnico) {
      onDownloadPdfTecnico();
      return;
    }
    if (isDownloadingTecnico || budgetStatus === 'CANCELLED') return;
    try {
      setLocalDownloadingPdfTecnico(true);
      await budgetsApi.downloadPdfTecnico(budgetId, budgetCode);
      toast.success('PDF da Ficha Técnica baixado com sucesso!');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Erro ao gerar o PDF técnico.');
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
      {/* ── 1º WhatsApp (Dropdown: Abrir Direto / Copiar / Personalizar / PDF) ─ */}
      <div className="relative shrink-0" ref={whatsAppMenuRef}>
        <button
          type="button"
          onClick={() => setShowWhatsAppMenu((prev) => !prev)}
          disabled={status === 'CANCELLED' || budgetStatus === 'CANCELLED'}
          aria-haspopup="true"
          aria-expanded={showWhatsAppMenu}
          className="p-2 text-on-surface-variant hover:text-emerald-600 hover:bg-surface-container rounded-lg border border-outline-variant/60 transition-colors flex items-center gap-1.5 text-xs font-label font-medium disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed shrink-0"
          title={
            status === 'CANCELLED' || budgetStatus === 'CANCELLED'
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
          <div className="absolute left-0 mt-1 w-60 rounded-lg bg-surface-container-lowest border border-outline-variant shadow-lg z-50 py-1 animate-fadeIn">
            {/* Abrir direto no WhatsApp */}
            <button
              type="button"
              onClick={handleOpenWhatsAppDirect}
              disabled={isOpeningWhatsApp}
              className="w-full px-3 py-2 text-left text-xs font-label hover:bg-surface-container flex items-center gap-2 text-on-surface transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-emerald-600">
                {isOpeningWhatsApp ? 'progress_activity' : 'send'}
              </span>
              <div>
                <p className="font-semibold">Abrir no WhatsApp</p>
                <p className="text-[10px] text-on-surface-variant">
                  {customerPhone ? `Conversa direta com ${customerPhone}` : 'Abrir app com texto pronto'}
                </p>
              </div>
            </button>

            {/* Copiar Resumo (com fallback resiliente para HTTP) */}
            <button
              type="button"
              onClick={handleCopyWhatsAppSummary}
              disabled={isCopyingSummary}
              className="w-full px-3 py-2 text-left text-xs font-label hover:bg-surface-container flex items-center gap-2 text-on-surface transition-colors cursor-pointer border-t border-outline-variant/40"
            >
              <span className="material-symbols-outlined text-[18px] text-emerald-600">
                {isCopyingSummary ? 'progress_activity' : 'content_copy'}
              </span>
              <div>
                <p className="font-semibold">Copiar Resumo</p>
                <p className="text-[10px] text-on-surface-variant">Copiar texto (funciona em HTTP e rede local)</p>
              </div>
            </button>

            {/* Personalizar Resumo no Modal */}
            <button
              type="button"
              onClick={() => {
                setShowWhatsAppMenu(false);
                setShowWhatsAppModal(true);
              }}
              className="w-full px-3 py-2 text-left text-xs font-label hover:bg-surface-container flex items-center gap-2 text-on-surface transition-colors cursor-pointer border-t border-outline-variant/40"
            >
              <span className="material-symbols-outlined text-[18px] text-emerald-600">edit_note</span>
              <div>
                <p className="font-semibold">Personalizar Resumo</p>
                <p className="text-[10px] text-on-surface-variant">Editar texto antes de enviar</p>
              </div>
            </button>

            {/* Enviar Link do PDF Comercial */}
            <button
              type="button"
              onClick={handleSendCommercialPdfViaWhatsApp}
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
          </div>
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
        disabled={isDownloadingTecnico || budgetStatus === 'CANCELLED'}
        className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg border border-outline-variant/60 transition-colors flex items-center gap-1.5 text-xs font-label font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
        title={
          budgetStatus === 'CANCELLED'
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

      {/* ── 4º Aprovar ou Ver Ordem de Serviço (US-13.3) ─────────────────── */}
      {isApproved ? (
        <Button
          type="button"
          variant="primary"
          icon="assignment"
          data-testid="btn-view-work-order"
          onClick={() => {
            if (linkedOrder?.id) {
              navigate(`/ordens-servico/${linkedOrder.id}`);
            } else {
              navigate(`/ordens-servico?search=${encodeURIComponent(budgetCode)}`);
            }
          }}
          className="text-xs py-1.5 px-3 whitespace-nowrap cursor-pointer shrink-0"
          title="Ver Ordem de Serviço vinculada a este orçamento"
        >
          <span className="whitespace-nowrap">Ver Ordem de Serviço</span>
        </Button>
      ) : (
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
      )}

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