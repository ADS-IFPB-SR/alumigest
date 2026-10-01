import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, AlertCircle } from 'lucide-react';
import { cancelOrderSchema, type CancelOrderFormData } from '../schemas/orderSchema';

interface CancelOrderModalProps {
  isOpen: boolean;
  orderCodigo: string;
  isSubmitting?: boolean;
  onClose: () => void;
  onConfirm: (data: CancelOrderFormData) => void;
}

export const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
  isOpen,
  orderCodigo,
  isSubmitting = false,
  onClose,
  onConfirm,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CancelOrderFormData>({
    resolver: zodResolver(cancelOrderSchema),
    defaultValues: {
      justificativa: '',
    },
  });

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        reset();
        onClose();
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
  }, [isOpen, onClose, reset]);

  if (!isOpen) return null;

  const handleFormSubmit = (data: CancelOrderFormData) => {
    onConfirm(data);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fadeIn"
      data-testid="cancel-order-modal"
    >
      {/* Backdrop escurecido padrão do sistema cobrindo 100% da viewport */}
      <button
        type="button"
        className="fixed inset-0 w-full h-full bg-black/70 backdrop-blur-xs transition-opacity cursor-default border-0"
        onClick={handleClose}
        tabIndex={-1}
        aria-label="Fechar fundo do modal"
      />

      <div className="relative bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-md shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant bg-surface-container-high/30">
          <div className="flex items-center gap-2 text-rose-600 font-semibold text-lg">
            <AlertCircle className="w-5 h-5" />
            <span>Cancelar Pedido</span>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container-high transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
          <p className="text-sm text-on-surface-variant">
            Você está cancelando o pedido <strong className="text-on-surface">{orderCodigo}</strong>.
            Esta ação formaliza o encerramento do pedido antes da fabricação física.
          </p>

          <div>
            <label
              htmlFor="justificativa"
              className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1"
            >
              Justificativa Obrigatória (mínimo 10 caracteres) *
            </label>
            <textarea
              id="justificativa"
              rows={4}
              placeholder="Descreva o motivo comercial do cancelamento..."
              className={`w-full px-3 py-2 text-sm rounded-lg border bg-surface-container-lowest text-on-surface focus:outline-hidden focus:ring-2 transition-all ${
                errors.justificativa
                  ? 'border-rose-500 focus:ring-rose-500/20'
                  : 'border-outline-variant focus:ring-primary/20 focus:border-primary'
              }`}
              {...register('justificativa')}
            />
            {errors.justificativa && (
              <p className="text-xs text-rose-600 mt-1 font-medium">
                {errors.justificativa.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors"
            >
              Voltar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-lg shadow-xs transition-colors"
            >
              {isSubmitting ? 'Cancelando...' : 'Confirmar Cancelamento'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
