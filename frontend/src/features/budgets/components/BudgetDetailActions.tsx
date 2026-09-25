import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { budgetsApi } from '../services/budgetsApi';
import { useUpdateBudgetStatus } from '../hooks/useBudgets';
import type { CreateBudgetPayload, BudgetStatus } from '../types';
import { WhatsAppSummaryModal } from './WhatsAppSummaryModal';
import { shareCommercialPdfLink } from '../utils/whatsappHelper';
import toast from 'react-hot-toast';

interface BudgetDetailActionsProps {
  readonly budgetId: string;
  readonly budgetCode: string;
  readonly customerPhone?: string | null;
  readonly status: BudgetStatus;
  readonly onDeleteClick: () => void;
}

export function BudgetDetailActions({
  budgetId,
  budgetCode,
  customerPhone,
  status,
  onDeleteClick,
}: BudgetDetailActionsProps) {
  const navigate = useNavigate();
  const { mutate: updateStatus } = useUpdateBudgetStatus();

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [showWhatsAppMenu, setShowWhatsAppMenu] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

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
    } catch {
      toast.error('Erro ao gerar o PDF Comercial.');
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

  const handleEmitirViaTecnica = () => {
    navigate(`/orcamentos/${budgetId}/pdf-tecnico`);
  };

  const handleDuplicateBudget = async () => {
    if (isDuplicating) return;
    try {
      setIsDuplicating(true);
      toast('Duplicando orçamento...');

      const currentBudget = await budgetsApi.getBudget(budgetId);

      const payload: CreateBudgetPayload = {
        customerId: currentBudget.customerId ?? '',
        discountPercent: currentBudget.discountPercent ?? 0,
        notes: currentBudget.notes 
          ? `${currentBudget.notes} (Cópia do orçamento ${budgetCode})` 
          : `Cópia do orçamento ${budgetCode}`,
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
      <div className="relative shrink-0" ref={whatsAppMenuRef}>
        <button
          type="button"
          onClick={() => setShowWhatsAppMenu((prev) => !prev)}
          disabled={status === 'CANCELLED'}
          aria-haspopup="true"
          aria-expanded={showWhatsAppMenu}
          className="p-2 text-on-surface-variant hover:text-emerald-600 hover:bg-surface-container rounded-lg border border-outline-variant/60 transition-colors flex items-center gap-1.5 text-xs font-label font-medium disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed shrink-0"
          title={
            status === 'CANCELLED'
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
          <div className="absolute left-0 mt-1 w-56 rounded-lg bg-surface-container-lowest border border-outline-variant shadow-lg z-50 py-1 animate-fadeIn">
            <button
              type="button"
              onClick={() => {
                setShowWhatsAppMenu(false);
                setShowWhatsAppModal(true);
              }}
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
        onClick={handleEmitirViaTecnica}
        className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg border border-outline-variant/60 transition-colors flex items-center gap-1.5 text-xs font-label font-medium cursor-pointer shrink-0"
        title="Emitir Via Técnica (Oficina)"
      >
        <span className="material-symbols-outlined text-[18px]">engineering</span>
        <span className="whitespace-nowrap">Via Técnica</span>
      </button>

      {/* ── 4º Duplicar ─────────────────────────────────────────────────── */}
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
        status={status}
      />
    </div>
  );
}