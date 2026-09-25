import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { budgetsApi } from '../services/budgetsApi';
import type { CreateBudgetPayload } from '../types';
import toast from 'react-hot-toast';

interface BudgetDetailActionsProps {
  readonly budgetId: string;
  readonly budgetCode: string;
  readonly onDeleteClick: () => void;
}

export function BudgetDetailActions({
  budgetId,
  budgetCode,
  onDeleteClick,
}: BudgetDetailActionsProps) {
  const navigate = useNavigate();
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isCopyingWhatsApp, setIsCopyingWhatsApp] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

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

  const handleCopyWhatsApp = async () => {
    if (isCopyingWhatsApp) return;
    try {
      setIsCopyingWhatsApp(true);
      
      // Busca o resumo oficial formatado pelo backend
      const text = await budgetsApi.getWhatsAppSummary(budgetId);
      
      await navigator.clipboard.writeText(text);
      toast.success('Resumo para WhatsApp copiado com sucesso!');
    } catch {
      toast.error('Erro ao gerar ou copiar o resumo para o WhatsApp.');
    } finally {
      setIsCopyingWhatsApp(false);
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
    <div className="flex items-center gap-xs sm:gap-sm flex-wrap shrink-0 w-full pb-1 no-print">
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

      <button
        type="button"
        onClick={handleCopyWhatsApp}
        disabled={isCopyingWhatsApp}
        className="p-2 text-on-surface-variant hover:text-emerald-600 hover:bg-surface-container rounded-lg border border-outline-variant/60 transition-colors flex items-center gap-1.5 text-xs font-label font-medium disabled:opacity-50 cursor-pointer shrink-0"
        title="Copiar resumo para WhatsApp"
      >
        <span className="material-symbols-outlined text-[18px]">
          {isCopyingWhatsApp ? 'progress_activity' : 'share'}
        </span>
        <span className="whitespace-nowrap">
          {isCopyingWhatsApp ? 'Copiando...' : 'Copiar para WhatsApp'}
        </span>
      </button>

      <button
        type="button"
        onClick={handleEmitirViaTecnica}
        className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg border border-outline-variant/60 transition-colors flex items-center gap-1.5 text-xs font-label font-medium cursor-pointer shrink-0"
        title="Emitir Via Técnica (Oficina)"
      >
        <span className="material-symbols-outlined text-[18px]">engineering</span>
        <span className="whitespace-nowrap">Via Técnica</span>
      </button>

      <button
        type="button"
        onClick={() => window.print()}
        className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg border border-outline-variant/60 transition-colors flex items-center gap-1.5 text-xs font-label font-medium cursor-pointer shrink-0"
        title="Imprimir proposta"
      >
        <span className="material-symbols-outlined text-[18px]">print</span>
        <span className="whitespace-nowrap">Imprimir</span>
      </button>

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

      <Button
        variant="outline"
        icon="delete"
        onClick={onDeleteClick}
        className="text-error border-error/30 hover:bg-error/10 hover:border-error text-xs py-1.5 px-2.5 shrink-0"
        title="Excluir este orçamento"
      >
        <span className="whitespace-nowrap">Excluir</span>
      </Button>

      <Link to={`/orcamentos/${budgetId}/editar`} className="shrink-0">
        <Button variant="outline" icon="edit" className="text-xs py-1.5 px-3 whitespace-nowrap">
          Editar
        </Button>
      </Link>

      <Link to="/orcamentos/novo" className="shrink-0">
        <Button variant="primary" icon="add" className="text-xs py-1.5 px-3 whitespace-nowrap">
          Novo
        </Button>
      </Link>
    </div>
  );
}