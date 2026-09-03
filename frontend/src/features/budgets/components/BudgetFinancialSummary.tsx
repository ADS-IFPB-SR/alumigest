import React from 'react';
import { formatBRL } from '../utils/calculations';
import { Button } from '../../../components/ui/Button';

interface BudgetFinancialSummaryProps {
  /** Número de itens — usado no label "N item(s)" */
  itemCount: number;
  /** Subtotal dos itens (apenas esquadrias) */
  itemsSubtotal: number;
  /** Mão de obra geral (opcional) */
  laborCost?: number;
  /** Subtotal bruto = itemsSubtotal + laborCost */
  subtotal: number;
  /** Percentual de desconto (0-100) */
  discountPercent: number;
  /** Valor calculado do desconto = subtotal × discountPercent / 100 */
  discountValue: number;
  /** Total líquido = subtotal - discountValue */
  total: number;
  /** Callback de submissão */
  onSave: () => void;
  /** Estado de loading durante a requisição de criação */
  isSaving: boolean;
  /**
   * Quando false, o botão de salvar fica desabilitado.
   * Obrigatório ter cliente selecionado + ao menos 1 item.
   */
  canSave: boolean;
}

/**
 * Resumo financeiro do orçamento.
 *
 * Exibe apenas valores derivados (subtotal, desconto, total líquido)
 * e a ação final de submissão. Os campos editáveis (desconto, observações,
 * condições) ficam em BudgetCommercialConditions.
 *
 * Projetado para ser sticky no desktop:
 *   className="lg:sticky lg:top-4 lg:self-start"
 */
export const BudgetFinancialSummary: React.FC<BudgetFinancialSummaryProps> = ({
  itemCount,
  itemsSubtotal,
  laborCost = 0,
  subtotal,
  discountPercent,
  discountValue,
  total,
  onSave,
  isSaving,
  canSave,
}) => {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-primary text-on-primary px-md py-sm flex items-center gap-xs">
        <span className="material-symbols-outlined text-[18px]">payments</span>
        <h3 className="font-title-sm text-title-sm font-semibold">Resumo do Orçamento</h3>
      </div>

      <div className="p-md flex flex-col gap-sm">
        {/* Subtotal das Esquadrias */}
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
          <>
            <div className="flex justify-between items-center py-xs border-b border-outline-variant border-dashed">
              <span className="text-sm text-on-surface-variant font-body">
                Mão de Obra / Serviços
              </span>
              <span className="font-data-mono text-primary font-semibold text-sm">
                + {formatBRL(laborCost)}
              </span>
            </div>

            <div className="flex justify-between items-center py-xs border-b border-outline-variant border-dashed font-medium">
              <span className="text-sm text-on-surface font-body">
                Subtotal Bruto
              </span>
              <span className="font-data-mono text-on-surface text-sm">
                {formatBRL(subtotal)}
              </span>
            </div>
          </>
        )}

        {/* Desconto */}
        {discountPercent > 0 && (
          <div className="flex justify-between items-center py-xs border-b border-outline-variant border-dashed">
            <span className="text-sm text-on-surface-variant font-body">
              Desconto ({discountPercent}%)
            </span>
            <span className="font-data-mono text-sm text-error font-semibold">
              − {formatBRL(discountValue)}
            </span>
          </div>
        )}

        {/* Total Líquido */}
        <div className="flex justify-between items-center pt-sm border-t-2 border-outline mt-xs">
          <span className="font-headline font-bold text-on-surface text-base">
            Valor Total da Proposta
          </span>
          <span className={`font-data-mono font-bold text-xl ${total > 0 ? 'text-primary' : 'text-on-surface-variant'}`}>
            {total > 0 ? formatBRL(total) : 'R$ 0,00'}
          </span>
        </div>

        {/* Aviso quando não há itens */}
        {itemCount === 0 && (
          <p className="text-xs text-on-surface-variant italic text-center py-xs font-body">
            Adicione itens ao orçamento para calcular o total.
          </p>
        )}

        {/* Botão Salvar — única instância no editor */}
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
      </div>
    </div>
  );
};
