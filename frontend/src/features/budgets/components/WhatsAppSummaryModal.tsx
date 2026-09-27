import { useState, useEffect, useRef } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { useWhatsAppSummary, useUpdateBudgetStatus } from '../hooks/useBudgets';
import { openWhatsAppChat, sanitizeWhatsAppText } from '../utils/whatsappHelper';
import type { BudgetStatus } from '../types';
import toast from 'react-hot-toast';

interface WhatsAppSummaryModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly budgetId: string;
  readonly budgetCode: string;
  readonly customerPhone?: string | null;
  readonly status: BudgetStatus;
}

export function WhatsAppSummaryModal({
  isOpen,
  onClose,
  budgetId,
  budgetCode,
  customerPhone,
  status,
}: WhatsAppSummaryModalProps) {
  const { data: summaryText, isLoading, isError, refetch } = useWhatsAppSummary(budgetId, isOpen);
  const { mutate: updateStatus } = useUpdateBudgetStatus();

  const [text, setText] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [fallbackNotice, setFallbackNotice] = useState(false);
  const [markAsSent, setMarkAsSent] = useState(status === 'DRAFT');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sincroniza o texto inicial da API quando carregado ou quando o modal é aberto
  useEffect(() => {
    if (summaryText) {
      setText(sanitizeWhatsAppText(summaryText));
    }
  }, [summaryText]);

  useEffect(() => {
    if (isOpen) {
      setIsCopied(false);
      setFallbackNotice(false);
      setMarkAsSent(status === 'DRAFT');
    }
  }, [isOpen, status]);

  let rawClean = customerPhone ? customerPhone.replace(/\D/g, '') : '';
  if (rawClean.startsWith('55') && rawClean.length >= 12) {
    rawClean = rawClean.slice(2);
  }
  const cleanPhone = rawClean;
  const hasPhone = cleanPhone.length >= 8;
  const cleanOriginal = summaryText ? sanitizeWhatsAppText(summaryText) : '';
  const isModified = Boolean(cleanOriginal && text !== cleanOriginal);

  const checkAndTransitionStatus = () => {
    if (markAsSent && status === 'DRAFT') {
      updateStatus({ id: budgetId, status: 'SENT' });
    }
  };

  const handleCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setIsCopied(true);
        setFallbackNotice(false);
        toast.success('Resumo para WhatsApp copiado com sucesso!');
        checkAndTransitionStatus();
        setTimeout(() => setIsCopied(false), 2000);
      } else {
        throw new Error('Clipboard API indisponível');
      }
    } catch {
      // Fallback para seleção forçada caso o navegador bloqueie
      textareaRef.current?.focus();
      textareaRef.current?.select();
      setFallbackNotice(true);
      toast.error('Não foi possível copiar automaticamente. Pressione Ctrl+C para copiar.');
    }
  };

  const handleOpenWhatsApp = () => {
    openWhatsAppChat({
      phone: customerPhone,
      text,
    });
    checkAndTransitionStatus();
    onClose();
  };

  const handleRestoreOriginal = () => {
    if (summaryText) {
      setText(sanitizeWhatsAppText(summaryText));
      toast.success('Texto original restaurado.');
    }
  };

  const renderStatusSection = () => {
    if (status === 'DRAFT') {
      return (
        <div>
          <label
            htmlFor="chk-mark-sent"
            className="flex items-center justify-between p-sm rounded-lg bg-surface-container border border-outline-variant/80 cursor-pointer hover:bg-surface-container-high transition-colors select-none"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-primary">schedule_send</span>
              <div>
                <p className="text-xs font-semibold text-on-surface">Atualização Automática de Status</p>
                <p className="text-[11px] text-on-surface-variant">
                  Marcar orçamento como <strong>Enviado (SENT)</strong> ao compartilhar ou copiar.
                </p>
              </div>
            </div>
            <input
              id="chk-mark-sent"
              aria-label="Marcar orçamento como Enviado (SENT)"
              type="checkbox"
              checked={markAsSent}
              onChange={(e) => setMarkAsSent(e.target.checked)}
              className="rounded border-outline text-primary focus:ring-primary w-4 h-4 cursor-pointer shrink-0"
            />
          </label>
        </div>
      );
    }

    if (status === 'SENT') {
      return (
        <div>
          <div className="flex items-center gap-2 p-sm rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-body">
            <span className="material-symbols-outlined text-[20px] text-emerald-600 shrink-0">check_circle</span>
            <div>
              <p className="font-semibold">Status atual: Enviado (SENT)</p>
              <p className="text-[11px] opacity-90">Este orçamento já foi registrado como enviado ao cliente.</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="flex items-center gap-2 p-sm rounded-lg bg-surface-container-low border border-outline-variant/60 text-xs font-body text-on-surface-variant">
          <span className="material-symbols-outlined text-[18px]">info</span>
          <span>Status atual do orçamento: <strong>{status}</strong></span>
        </div>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Resumo para WhatsApp — ${budgetCode}`}
      footer={
        <div className="flex items-center gap-xs justify-end flex-wrap w-full">
          {isModified && (
            <Button
              type="button"
              variant="outline"
              onClick={handleRestoreOriginal}
              className="text-xs py-1.5 px-3"
              title="Desfazer edições e voltar ao texto oficial"
            >
              Restaurar Original
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            icon={isCopied ? 'check' : 'content_copy'}
            onClick={handleCopy}
            disabled={isLoading || isError || !text}
            className={`text-xs py-1.5 px-3 transition-colors ${
              isCopied ? 'text-emerald-600 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30' : ''
            }`}
          >
            {isCopied ? 'Copiado!' : 'Copiar Texto'}
          </Button>

          <button
            type="button"
            onClick={handleOpenWhatsApp}
            disabled={isLoading || isError || !text}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-3 py-1.5 text-xs font-label font-medium transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
            title={
              hasPhone
                ? `Abrir conversa direta com ${customerPhone}`
                : 'Abrir WhatsApp para selecionar contato'
            }
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
            <span>Abrir no WhatsApp</span>
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-sm">
        {/* Aviso de ausência de telefone */}
        {!hasPhone && !isLoading && (
          <div className="flex items-start gap-2 p-sm rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-body animate-fadeIn">
            <span className="material-symbols-outlined text-[18px] text-amber-600 shrink-0">info</span>
            <div>
              <p className="font-semibold">Cliente sem telefone cadastrado</p>
              <p className="text-[11px] opacity-90">
                O WhatsApp será aberto permitindo escolher o contato manualmente, ou você pode clicar em{' '}
                <strong>Copiar Texto</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Status e Opção de Transição */}
        {!isLoading && !isError && renderStatusSection()}

        {/* Notificação de fallback de cópia manual */}
        {fallbackNotice && (
          <div className="flex items-start gap-2 p-sm rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-xs font-body animate-fadeIn">
            <span className="material-symbols-outlined text-[18px] text-blue-600 shrink-0">content_paste</span>
            <div>
              <p className="font-semibold">Texto selecionado para cópia manual</p>
              <p className="text-[11px] opacity-90">Pressione <strong>Ctrl + C</strong> para copiar o resumo.</p>
            </div>
          </div>
        )}

        {/* Carregando */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-xl gap-sm text-secondary">
            <span className="material-symbols-outlined animate-spin text-[32px] text-primary">progress_activity</span>
            <span className="text-xs font-body">Carregando resumo oficial do orçamento...</span>
          </div>
        )}

        {/* Erro */}
        {isError && !isLoading && (
          <div className="flex flex-col items-center justify-center py-lg gap-sm text-center">
            <span className="material-symbols-outlined text-error text-[36px]">error</span>
            <p className="text-sm font-semibold text-on-surface">Falha ao carregar o resumo</p>
            <p className="text-xs text-on-surface-variant">Não foi possível obter a mensagem formatada para WhatsApp.</p>
            <Button variant="outline" icon="refresh" onClick={() => refetch()} className="text-xs mt-xs">
              Tentar novamente
            </Button>
          </div>
        )}

        {/* Editor de Texto */}
        {!isLoading && !isError && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px] font-label text-on-surface-variant">
              <span>Mensagem estruturada (editável antes do envio):</span>
              <span>{text.length} caracteres</span>
            </div>

            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={11}
              className="w-full font-mono text-xs p-3 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all resize-y leading-relaxed"
              placeholder="Digite ou edite o resumo para WhatsApp..."
            />
          </div>
        )}
      </div>
    </Modal>
  );
}
