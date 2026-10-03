import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, CheckCircle2, Calendar, MessageSquare, Phone, Users, Mail, FileText } from 'lucide-react';
import {
  orderConvertSchema,
  getDefaultDeliveryDate,
  getMinDeliveryDate,
  type ConvertOrderFormData,
} from '../schemas/orderSchema';
import { useConvertBudget } from '../hooks/useConvertBudget';
import type { ApprovalChannel, Order } from '../types';
import { APPROVAL_CHANNEL_LABELS } from '../types';

export interface OrderApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgetId: string;
  budgetCode: string;
  customerName?: string;
  onSuccess?: (order: Order) => void;
  onConfirm?: (data: ConvertOrderFormData) => Promise<void> | void;
  isSubmitting?: boolean;
}

const CHANNELS: { value: ApprovalChannel; label: string; icon: React.FC<{ className?: string }> }[] = [
  { value: 'WHATSAPP', label: APPROVAL_CHANNEL_LABELS.WHATSAPP, icon: MessageSquare },
  { value: 'PRESENCIAL', label: APPROVAL_CHANNEL_LABELS.PRESENCIAL, icon: Users },
  { value: 'TELEFONE', label: APPROVAL_CHANNEL_LABELS.TELEFONE, icon: Phone },
  { value: 'EMAIL', label: APPROVAL_CHANNEL_LABELS.EMAIL, icon: Mail },
];

export const OrderApprovalModal: React.FC<OrderApprovalModalProps> = ({
  isOpen,
  onClose,
  budgetId,
  budgetCode,
  customerName,
  onSuccess,
  onConfirm,
  isSubmitting = false,
}) => {
  const { mutateAsync: convertBudget, isPending: isConverting } = useConvertBudget(budgetId);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ConvertOrderFormData>({
    resolver: zodResolver(orderConvertSchema),
    defaultValues: {
      canalAprovacao: 'WHATSAPP',
      dataPrevisaoEntrega: getDefaultDeliveryDate(15),
      observacoes: '',
    },
  });

  const selectedChannel = watch('canalAprovacao');
  const observacoesValue = watch('observacoes') || '';

  const handleClose = React.useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  // Reinicia os valores do formulário toda vez que o modal é aberto
  useEffect(() => {
    if (isOpen) {
      reset({
        canalAprovacao: 'WHATSAPP',
        dataPrevisaoEntrega: getDefaultDeliveryDate(15),
        observacoes: '',
      });
    }
  }, [isOpen, reset]);

  // Bloqueio de scroll e atalho Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const handleFormSubmit = async (data: ConvertOrderFormData) => {
    if (onConfirm) {
      await onConfirm(data);
      return;
    }

    try {
      const order = await convertBudget({ budgetId, data });
      handleClose();
      if (onSuccess && order) {
        onSuccess(order);
      }
    } catch {
      // O tratamento de erro e toast já é gerenciado pelo useConvertBudget
    }
  };

  const isPending = isSubmitting || isConverting;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fadeIn"
      data-testid="order-approval-modal"
      aria-modal="true"
      aria-labelledby="approval-modal-title"
    >
      {/* Backdrop escurecido */}
      <button
        type="button"
        className="fixed inset-0 w-full h-full bg-black/70 backdrop-blur-xs transition-opacity cursor-default border-0"
        onClick={handleClose}
        tabIndex={-1}
        aria-label="Fechar fundo do modal"
      />

      <div className="relative bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant bg-surface-container-high/30">
          <div className="flex items-center gap-2.5 text-emerald-600 font-semibold text-lg">
            <CheckCircle2 className="w-5 h-5" />
            <span id="approval-modal-title">Aprovar Orçamento e Gerar Pedido</span>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isPending}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container-high transition-colors disabled:opacity-50"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-5">
          {/* Mensagem descritiva e contexto */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-xs text-emerald-800 dark:text-emerald-300">
            <p>
              Ao aprovar o orçamento <strong className="font-semibold">{budgetCode}</strong>
              {customerName ? <> para o cliente <strong className="font-semibold">{customerName}</strong></> : null},
              um novo <strong>Pedido de Venda</strong> será formalizado com lock de preços e código sequencial automático.
            </p>
          </div>

          {/* Campo: Canal de Aprovação */}
          <div>
            <label
              htmlFor="canalAprovacao"
              className="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-2"
            >
              Canal de Aprovação <span className="text-error">*</span>
            </label>

            {/* Grid de Seleção Rápida por Cartões */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
              {CHANNELS.map(({ value, label, icon: Icon }) => {
                const isSelected = selectedChannel === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setValue('canalAprovacao', value, { shouldValidate: true })}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/30'
                        : 'border-outline-variant hover:border-outline text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mb-1.5 ${isSelected ? 'text-emerald-600' : 'text-on-surface-variant'}`} />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>

            {/* Select oculto visualmente — mantido no DOM para react-hook-form e testes (sr-only) */}
            <select
              id="canalAprovacao"
              data-testid="input-canal-aprovacao"
              {...register('canalAprovacao')}
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
            >
              {CHANNELS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>

            {errors.canalAprovacao && (
              <p className="mt-1 text-xs text-error font-medium">
                {errors.canalAprovacao.message}
              </p>
            )}
          </div>

          {/* Campo: Data Prevista de Entrega */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="dataPrevisaoEntrega"
                className="block text-xs font-semibold text-on-surface uppercase tracking-wider"
              >
                Previsão de Entrega <span className="text-error">*</span>
              </label>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <Calendar className="w-3 h-3" />
                Sugerido: +15 dias corridos
              </span>
            </div>

            <div className="relative">
              <input
                id="dataPrevisaoEntrega"
                data-testid="input-data-entrega"
                type="date"
                min={getMinDeliveryDate()}
                {...register('dataPrevisaoEntrega')}
                className={`w-full rounded-lg border bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 ${
                  errors.dataPrevisaoEntrega
                    ? 'border-error focus:ring-error'
                    : 'border-outline-variant focus:ring-emerald-500'
                }`}
              />
            </div>

            {errors.dataPrevisaoEntrega && (
              <p className="mt-1 text-xs text-error font-medium">
                {errors.dataPrevisaoEntrega.message}
              </p>
            )}
            <p className="mt-1 text-[11px] text-on-surface-variant">
              Data estipulada para entrega ou início da instalação. Não pode ser anterior a hoje.
            </p>
          </div>

          {/* Campo: Observações */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="observacoes"
                className="block text-xs font-semibold text-on-surface uppercase tracking-wider flex items-center gap-1"
              >
                <FileText className="w-3.5 h-3.5 text-on-surface-variant" />
                Observações de Produção / Entrega
              </label>
              <span className="text-[11px] text-on-surface-variant font-mono">
                {observacoesValue.length}/1000
              </span>
            </div>

            <textarea
              id="observacoes"
              data-testid="input-observacoes"
              rows={3}
              maxLength={1000}
              placeholder="Ex: Cliente solicitou entrega pela manhã. Atenção ao vão do vão superior na instalação..."
              {...register('observacoes')}
              className={`w-full rounded-lg border bg-surface px-3 py-2 text-sm text-on-surface resize-none focus:outline-none focus:ring-2 ${
                errors.observacoes
                  ? 'border-error focus:ring-error'
                  : 'border-outline-variant focus:ring-emerald-500'
              }`}
            />

            {errors.observacoes && (
              <p className="mt-1 text-xs text-error font-medium">
                {errors.observacoes.message}
              </p>
            )}
          </div>

          {/* Rodapé com botões de ação */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant">
            <button
              type="button"
              data-testid="btn-cancel-approval"
              onClick={handleClose}
              disabled={isPending}
              className="px-4 py-2 text-xs font-medium text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-container transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              data-testid="btn-confirm-approval"
              disabled={isPending}
              className="px-4 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Gerando Pedido...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmar e Gerar Pedido</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
