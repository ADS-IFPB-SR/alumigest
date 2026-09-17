import React from 'react';
import { formatBRL } from '../utils/calculations';
import { Button } from '../../../components/ui/Button';
import { PAYMENT_CONDITION_LABELS, type PaymentCondition, type DiscountType } from '../types';

export interface BudgetFinancialSummaryProps {
  /** Número de itens — usado no label "N item(s)" */
  readonly itemCount: number;
  /** Subtotal dos itens (apenas esquadrias) */
  readonly itemsSubtotal: number;
  /** Mão de obra geral (opcional) */
  readonly laborCost?: number;
  /** Subtotal bruto = itemsSubtotal + laborCost */
  readonly subtotal: number;
  
  /** Percentual de desconto (legado/retrocompatível) */
  readonly discountPercent?: number;
  /** Tipo de desconto selecionado na negociação */
  readonly discountType?: DiscountType | 'PERCENTAGE' | 'FIXED';
  /** O valor bruto digitado no input (ex: 10 para 10% ou 500 para R$ 500) */
  readonly discountInput?: number;
  /** Valor calculado do desconto financeiro = o que realmente vai ser subtraído (R$) */
  readonly discountValue: number;
  
  /** Total líquido = subtotal - discountValue */
  readonly total: number;
  /** Condição de pagamento selecionada (código/enum) */
  readonly paymentCondition?: PaymentCondition | string;
  /** Rótulo customizado da condição de pagamento */
  readonly paymentConditionLabel?: string;
  /** Texto livre de condições comerciais (fallback se paymentCondition não for informado) */
  readonly commercialConditions?: string;
  /** Callback de submissão (opcional para permitir uso como card de resumo puro) */
  readonly onSave?: () => void;
  /** Estado de loading durante a requisição de criação */
  readonly isSaving?: boolean;
  /**
   * Quando false, o botão de salvar fica desabilitado.
   * Obrigatório ter cliente selecionado + ao menos 1 item.
   */
  readonly canSave?: boolean;
}

/**
 * Resumo financeiro do orçamento (US-09.37).
 *
 * Exibe de forma clara e em tempo real:
 * - Subtotal Bruto
 * - Desconto Comercial (destacado em verde com percentual e economia)
 * - Total Líquido (com destaque visual de fechamento)
 * - Condição de Pagamento Selecionada (rótulo informativo)
 *
 * Responsabilidade pura de apresentação (SOLID - SRP), recebendo os valores
 * calculados e reagindo instantaneamente a alterações de desconto.
 */
export const BudgetFinancialSummary: React.FC<BudgetFinancialSummaryProps> = ({
  itemCount,
  itemsSubtotal,
  laborCost = 0,
  subtotal,
  discountPercent,
  discountType,
  discountInput,
  discountValue,
  total,
  paymentCondition,
  paymentConditionLabel,
  commercialConditions,
  onSave,
  isSaving = false,
  canSave = true,
}) => {
  const isPercent = discountType
    ? discountType === 'PERCENTUAL' || discountType === 'PERCENTAGE'
    : true;
  const percentDisplay = discountInput ?? discountPercent ?? 0;
  const hasDiscount = discountValue > 0 || percentDisplay > 0;

  // Resolução do rótulo informativo da condição de pagamento
  const resolvedPaymentCondition =
    paymentConditionLabel ||
    (paymentCondition && PAYMENT_CONDITION_LABELS[paymentCondition as PaymentCondition]) ||
    paymentCondition ||
    commercialConditions ||
    'A combinar no fechamento';

  return (
    <div
      className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden shadow-sm"
      data-testid="budget-financial-summary"
    >
      {/* Header */}
      <div className="bg-primary text-on-primary px-md py-sm flex items-center justify-between">
        <div className="flex items-center gap-xs">
          <span className="material-symbols-outlined text-[18px]">payments</span>
          <h3 className="font-title-sm text-title-sm font-semibold">Resumo do Orçamento</h3>
        </div>
        <span className="text-xs bg-white/10 text-on-primary px-2 py-0.5 rounded font-label">
          {itemCount} {itemCount === 1 ? 'item' : 'itens'}
        </span>
      </div>

      <div className="p-md flex flex-col gap-sm">
        {/* Detalhamento das Esquadrias */}
        <div className="flex justify-between items-center py-xs border-b border-outline-variant border-dashed">
          <span className="text-sm text-on-surface-variant font-body">
            Esquadrias ({itemCount} {itemCount === 1 ? 'item' : 'itens'})
          </span>
          <span className="font-data-mono text-on-surface font-semibold text-sm">
            {formatBRL(itemsSubtotal)}
          </span>
        </div>

        {/* Mão de Obra Geral (Opcional) */}
        {laborCost > 0 && (
          <div className="flex justify-between items-center py-xs border-b border-outline-variant border-dashed">
            <span className="text-sm text-on-surface-variant font-body">
              Mão de Obra / Serviços
            </span>
            <span className="font-data-mono text-primary font-semibold text-sm">
              + {formatBRL(laborCost)}
            </span>
          </div>
        )}

        {/* Subtotal Bruto — sempre exibido com identificação clara */}
        <div className="flex justify-between items-center py-xs border-b border-outline-variant border-dashed font-medium">
          <span className="text-sm text-on-surface font-body font-medium">
            Subtotal Bruto
          </span>
          <span className="font-data-mono text-on-surface text-sm font-semibold">
            {formatBRL(subtotal)}
          </span>
        </div>

        {/* Desconto Comercial — com destaque verde e economia */}
        {hasDiscount ? (
          <div className="flex flex-col gap-1 py-xs border-b border-outline-variant border-dashed">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-success flex items-center gap-1 font-body">
                <span className="material-symbols-outlined text-[16px]">sell</span>
                Desconto {isPercent ? `(${percentDisplay}%)` : '(Fixo)'}
              </span>
              <span className="font-data-mono text-sm text-success font-bold">
                − {formatBRL(discountValue)} {isPercent ? `(${percentDisplay}%)` : ''}
              </span>
            </div>
            <div className="self-end inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 border border-success/20 text-success text-[11px] font-semibold tracking-wide">
              <span className="material-symbols-outlined text-[13px]">savings</span>
              <span>Economia de {formatBRL(discountValue)}</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-center py-xs border-b border-outline-variant border-dashed">
            <span className="text-sm text-on-surface-variant font-body">
              Desconto Comercial
            </span>
            <span className="font-data-mono text-sm text-on-surface-variant">
              R$ 0,00 (0%)
            </span>
          </div>
        )}

        {/* Total Líquido — destaque visual marcante para fechamento */}
        <div className="bg-surface-container-low border border-primary/20 rounded-lg p-sm mt-xs flex justify-between items-center shadow-xs">
          <div className="flex flex-col">
            <span className="font-headline font-bold text-on-surface text-base">
              Total Líquido
            </span>
            <span className="text-[11px] text-on-surface-variant font-body">
              Valor Total da Proposta
            </span>
          </div>
          <span
            className={`font-data-mono font-bold text-2xl ${
              total > 0 ? 'text-primary' : 'text-on-surface-variant'
            }`}
          >
            {total > 0 ? formatBRL(total) : 'R$ 0,00'}
          </span>
        </div>

        {/* Condição de Pagamento Selecionada — rótulo informativo */}
        <div className="bg-surface-container-low/60 border border-outline-variant/60 rounded-md p-xs px-sm flex items-start gap-xs text-xs mt-xs">
          <span className="material-symbols-outlined text-[16px] text-secondary shrink-0 mt-0.5">
            account_balance_wallet
          </span>
          <div className="flex-1 min-w-0">
            <span className="font-semibold text-on-surface-variant block uppercase tracking-wider text-[10px]">
              Condição de Pagamento
            </span>
            <span
              className="text-on-surface font-medium truncate block"
              title={resolvedPaymentCondition}
            >
              {resolvedPaymentCondition}
            </span>
          </div>
        </div>

        {/* Aviso quando não há itens */}
        {itemCount === 0 && (
          <p className="text-xs text-on-surface-variant italic text-center py-xs font-body">
            Adicione itens ao orçamento para calcular o total.
          </p>
        )}

        {/* Botão Salvar — exibido quando onSave for fornecido */}
        {onSave && (
          <div className="pt-sm mt-xs">
            <Button
              variant="success"
              icon="send"
              onClick={onSave}
              disabled={!canSave}
              className="w-full"
            >
              {isSaving ? 'Salvando...' : 'Salvar e Gerar Proposta'}
            </Button>

            {/* Hint contextual */}
            {!canSave && !isSaving && (
              <p className="text-xs text-on-surface-variant text-center mt-xs font-body leading-tight">
                {itemCount === 0
                  ? 'Adicione ao menos uma esquadria.'
                  : 'Selecione um cliente para habilitar.'}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};