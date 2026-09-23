import { formatBRL } from '../utils/calculations';

interface BudgetFinancialSummaryCardProps {
  readonly subtotal: number;
  readonly totalLaborCost: number;
  readonly freightCost: number;
  readonly installationCost: number;
  readonly hasDiscount: boolean;
  readonly isPercentDiscount: boolean;
  readonly discountPercent?: number;
  readonly discountValue: number;
  readonly total: number;
  readonly paymentCondition?: string;
  readonly paymentConditionLabel?: string;
  readonly paymentMethod?: string | null;
  readonly paymentNotes?: string;
  readonly commercialConditions?: string | null;
  readonly createdAt: string;
  readonly validUntil?: string;
}

export function BudgetFinancialSummaryCard({
  subtotal,
  totalLaborCost,
  freightCost,
  installationCost,
  hasDiscount,
  isPercentDiscount,
  discountPercent,
  discountValue,
  total,
  paymentCondition,
  paymentConditionLabel,
  paymentMethod,
  paymentNotes,
  commercialConditions,
  createdAt,
  validUntil,
}: BudgetFinancialSummaryCardProps) {
  const resolvedPaymentCondition = paymentConditionLabel ?? paymentCondition;
  const resolvedPaymentMethod = paymentMethod;
  const resolvedNotes = paymentNotes ?? commercialConditions;

  // Evita duplicidade caso a API retorne a mesma string para ambos
  const showDistinctMethod = resolvedPaymentMethod && resolvedPaymentMethod !== resolvedPaymentCondition;

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-xs flex flex-col gap-sm">
      <div className="flex items-center justify-between pb-xs border-b border-outline-variant">
        <h3 className="text-xs font-label font-bold text-on-surface uppercase tracking-wider flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px] text-primary">receipt_long</span>
          Fechamento Financeiro
        </h3>
        <span className="text-[10px] font-data-mono text-secondary px-1.5 py-0.5 rounded bg-surface-container">
          BRL (R$)
        </span>
      </div>

      <div className="flex flex-col gap-xs pt-xs">
        {/* Valor Bruto */}
        <div className="flex justify-between items-center text-xs py-1 border-b border-outline-variant/40 border-dashed">
          <span className="text-on-surface-variant font-body">Valor Bruto dos Itens:</span>
          <span className="font-data-mono text-on-surface font-semibold">{formatBRL(subtotal)}</span>
        </div>

        {/* Mão de Obra */}
        {totalLaborCost > 0 && (
          <div className="flex justify-between items-center text-xs py-1 border-b border-outline-variant/40 border-dashed">
            <span className="text-on-surface-variant font-body">Mão de Obra:</span>
            <span className="font-data-mono text-on-surface font-semibold">{`+ ${formatBRL(totalLaborCost)}`}</span>
          </div>
        )}

        {/* Taxa de Frete */}
        {freightCost > 0 && (
          <div className="flex justify-between items-center text-xs py-1 border-b border-outline-variant/40 border-dashed">
            <span className="text-on-surface-variant font-body">Taxa de Frete:</span>
            <span className="font-data-mono text-on-surface">{`+ ${formatBRL(freightCost)}`}</span>
          </div>
        )}

        {/* Taxa de Instalação */}
        {installationCost > 0 && (
          <div className="flex justify-between items-center text-xs py-1 border-b border-outline-variant/40 border-dashed">
            <span className="text-on-surface-variant font-body">Taxa de Instalação:</span>
            <span className="font-data-mono text-on-surface">{`+ ${formatBRL(installationCost)}`}</span>
          </div>
        )}

        {/* Desconto */}
        {hasDiscount && (
          <div className="flex justify-between items-center text-xs py-1 border-b border-outline-variant/40 border-dashed">
            <span className="text-on-surface-variant font-body flex items-center gap-1.5">
              <span>Desconto</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-error/10 border border-error/20 text-error font-extrabold tracking-wide">
                {isPercentDiscount ? `${discountPercent}%` : 'R$'}
              </span>
            </span>
            <span className="font-data-mono text-error font-bold">{`− ${formatBRL(discountValue)}`}</span>
          </div>
        )}

        {/* Valor Líquido */}
        <div className="bg-surface-container-low rounded-lg p-sm border border-outline-variant/60 flex flex-col gap-0.5 mt-xs shadow-inner">
          <span className="text-[11px] font-label font-bold text-on-surface-variant uppercase tracking-wider">
            Valor Líquido a Pagar
          </span>
          <span className="font-data-mono font-extrabold text-primary text-2xl sm:text-3xl leading-tight">
            {formatBRL(total)}
          </span>
        </div>

        {/* Forma de Pagamento */}
        {showDistinctMethod && (
          <div className="mt-2 pt-2 border-t border-outline-variant/50 flex flex-col gap-1">
            <span className="text-[10px] font-label font-bold text-on-surface uppercase flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-primary">payments</span>
              Forma de Pagamento
            </span>
            <p className="text-[11px] font-body text-primary font-bold bg-surface-container px-2 py-1.5 rounded-md border border-outline-variant/50">
              {resolvedPaymentMethod}
            </p>
          </div>
        )}

        {/* Condição de Pagamento */}
        {resolvedPaymentCondition && (
          <div className="mt-1 pt-1 flex flex-col gap-1">
            <span className="text-[10px] font-label font-bold text-on-surface uppercase flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-primary">credit_card</span>
              Condição de Pagamento
            </span>
            <p className="text-[11px] font-body text-on-surface-variant bg-surface-container px-2 py-1.5 rounded-md border border-outline-variant/50">
              {resolvedPaymentCondition}
            </p>
          </div>
        )}

        {/* Notas Comerciais */}
        {resolvedNotes && (
          <div className="mt-1">
            <span className="text-[10px] font-label font-bold text-on-surface uppercase flex items-center gap-1 mb-1">
              <span className="material-symbols-outlined text-[14px] text-primary">description</span>
              Notas Comerciais
            </span>
            <p className="text-[11px] font-body text-on-surface-variant bg-surface-container px-2 py-1.5 rounded-md border border-outline-variant/50 whitespace-pre-line leading-relaxed">
              {resolvedNotes}
            </p>
          </div>
        )}

        {/* Informações de Validade */}
        <div className="flex flex-col gap-1 pt-2 text-[11px] font-body text-on-surface-variant border-t border-outline-variant mt-2">
          <div className="flex items-center justify-between">
            <span>Criado em:</span>
            <strong className="font-data-mono text-on-surface">
              {new Date(createdAt).toLocaleDateString('pt-BR')}
            </strong>
          </div>
          {validUntil && (
            <div className="flex items-center justify-between">
              <span>Validade da proposta:</span>
              <strong className="font-data-mono text-on-surface">
                {new Date(validUntil).toLocaleDateString('pt-BR')}
              </strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}