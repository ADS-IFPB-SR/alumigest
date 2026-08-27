import { Link, useParams } from 'react-router-dom';
import { useBudget } from '../features/budgets/hooks/useBudgets';
import { Button } from '../components/ui/Button';
import { STATUS_LABELS } from '../features/budgets/types';
import { formatBRL } from '../features/budgets/utils/calculations';
import { TEMPLATE_TYPE_INFO } from '../features/budgets/types';
import { WindowSvgPreview } from '../features/budgets/components/builder/WindowSvgPreview';

export function BudgetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: budget, isLoading, isError } = useBudget(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-xl gap-sm text-secondary">
        <span className="material-symbols-outlined animate-spin text-[24px]">progress_activity</span>
        <span className="font-body-sm">Carregando orçamento...</span>
      </div>
    );
  }

  if (isError || !budget) {
    return (
      <div className="flex flex-col items-center justify-center py-xl gap-md text-center">
        <span className="material-symbols-outlined text-error text-[48px]">error</span>
        <p className="font-headline text-headline-md text-on-surface">Orçamento não encontrado</p>
        <p className="text-sm text-on-surface-variant">
          O orçamento com ID <code className="font-data-mono bg-surface-container px-xs rounded">{id}</code> não foi encontrado.
        </p>
        <Link to="/orcamentos">
          <Button variant="primary" icon="arrow_back">Voltar aos Orçamentos</Button>
        </Link>
      </div>
    );
  }

  const subtotal = budget.subtotal ?? 0;
  const discountValue = budget.discountValue ?? 0;
  const total = budget.total ?? 0;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Breadcrumb + Actions */}
      <div className="flex items-center justify-between px-md py-sm border-b border-outline-variant bg-surface flex-none">
        <div className="flex items-center gap-sm font-body-sm text-body-sm text-on-surface-variant">
          <Link to="/orcamentos" className="hover:text-primary transition-colors">Orçamentos</Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-on-surface font-medium">{budget.code}</span>
        </div>
        <div className="flex items-center gap-sm">
          <span className={`text-xs px-sm py-xs rounded-full border font-label font-semibold bg-surface-container text-on-surface-variant border-outline-variant`}>
            {STATUS_LABELS[budget.status]}
          </span>
          <Link to="/orcamentos/novo">
            <Button variant="outline" icon="add">Novo Orçamento</Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-md lg:p-lg">
        <div className="max-w-[1000px] mx-auto flex flex-col gap-lg">

          {/* Success banner */}
          <div className="bg-tertiary-container/30 border border-tertiary-container/50 rounded-lg p-md flex items-center gap-sm">
            <span className="material-symbols-outlined text-on-tertiary-container text-[24px]">check_circle</span>
            <div>
              <p className="font-label font-semibold text-on-tertiary-container">Orçamento criado com sucesso!</p>
              <p className="text-xs text-on-tertiary-container/80 font-body">
                Código: <strong className="font-data-mono">{budget.code}</strong>
              </p>
            </div>
          </div>

          {/* Cliente */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md shadow-sm">
            <h3 className="font-title-sm text-title-sm text-on-surface mb-md pb-xs border-b border-outline-variant">
              Cliente
            </h3>
            <div className="flex items-start gap-sm">
              <span className="material-symbols-outlined text-primary text-[24px]">account_circle</span>
              <div>
                <p className="font-label font-semibold text-on-surface">{budget.customer.name}</p>
                {budget.customer.phone && (
                  <p className="text-xs text-on-surface-variant font-data-mono">{budget.customer.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Itens */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden shadow-sm">
            <div className="bg-surface-container-low border-b border-outline-variant px-md py-sm">
              <h3 className="font-title-sm text-title-sm text-on-surface">
                Itens ({budget.items?.length ?? 0})
              </h3>
            </div>
            <div className="flex flex-col divide-y divide-outline-variant/40">
              {(budget.items ?? []).map((item, idx) => {
                const info = item.templateType ? TEMPLATE_TYPE_INFO[item.templateType] : null;
                return (
                  <div key={item.id ?? idx} className="p-md flex gap-md">
                    {/* Mini SVG preview */}
                    <div className="shrink-0 hidden sm:block">
                      <WindowSvgPreview
                        templateType={item.templateType ?? 'SLIDING_DOOR_2F'}
                        widthMm={item.width ?? 2000}
                        heightMm={item.height ?? 2100}
                        openingDirection={item.templateConfig?.openingDirection ?? 'LEFT_TO_RIGHT'}
                        handleConfig={item.handleConfig ?? { handleType: 'NONE' }}
                        drillingConfig={item.drillingConfig ?? { holeCount: 0, divisionType: 'EQUAL' }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-sm mb-sm">
                        <div>
                          <p className="font-label font-semibold text-on-surface text-sm">{item.productName}</p>
                          <p className="text-xs text-on-surface-variant font-body">{info?.label ?? item.templateType}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-data-mono font-bold text-primary text-base">{formatBRL(item.subtotal)}</p>
                          <p className="text-xs text-on-surface-variant">{item.quantity}× unidade{item.quantity > 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-xs text-xs font-data-mono text-on-surface-variant">
                        <span className="bg-surface-container px-xs py-[2px] rounded">{item.width}×{item.height} mm</span>
                        {item.handleConfig?.handleType && item.handleConfig.handleType !== 'NONE' && (
                          <span className="bg-surface-container px-xs py-[2px] rounded">{item.handleConfig.handleType}</span>
                        )}
                        {(item.drillingConfig?.holeCount ?? 0) > 0 && (
                          <span className="bg-surface-container px-xs py-[2px] rounded">{item.drillingConfig?.holeCount} furos</span>
                        )}
                      </div>
                      {/* Materiais do item */}
                      {(item.options ?? []).length > 0 && (
                        <div className="mt-sm flex flex-col gap-xs">
                          {item.options.map((opt, oi) => (
                            <div key={oi} className="flex justify-between text-xs text-on-surface-variant">
                              <span className="font-body">{opt.materialName}</span>
                              <span className="font-data-mono">{opt.quantity} {opt.unitMeasure} × {formatBRL(opt.unitPrice)} = {formatBRL(opt.totalPrice)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Resumo Financeiro */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden shadow-sm">
            <div className="bg-primary text-on-primary px-md py-sm">
              <h3 className="font-title-sm text-title-sm">Resumo Financeiro</h3>
            </div>
            <div className="p-md flex flex-col gap-sm">
              <div className="flex justify-between items-center py-xs border-b border-outline-variant border-dashed text-sm">
                <span className="text-on-surface-variant">Subtotal</span>
                <span className="font-data-mono text-on-surface">{formatBRL(subtotal)}</span>
              </div>
              {discountValue > 0 && (
                <div className="flex justify-between items-center py-xs border-b border-outline-variant border-dashed text-sm">
                  <span className="text-on-surface-variant">Desconto ({budget.discountPercent}%)</span>
                  <span className="font-data-mono text-error">− {formatBRL(discountValue)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-sm border-t-2 border-outline mt-xs">
                <span className="font-headline font-bold text-on-surface text-base">Total Líquido</span>
                <span className="font-data-mono font-bold text-primary text-xl">{formatBRL(total)}</span>
              </div>
            </div>
          </div>

          {/* Observações */}
          {(budget.notes || budget.commercialConditions) && (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md shadow-sm">
              <h3 className="font-title-sm text-title-sm text-on-surface mb-sm pb-xs border-b border-outline-variant">
                Observações e Condições
              </h3>
              {budget.notes && (
                <div className="mb-sm">
                  <p className="text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wider mb-xs">Observações</p>
                  <p className="text-sm font-body text-on-surface whitespace-pre-line">{budget.notes}</p>
                </div>
              )}
              {budget.commercialConditions && (
                <div>
                  <p className="text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wider mb-xs">Condições Comerciais</p>
                  <p className="text-sm font-body text-on-surface whitespace-pre-line">{budget.commercialConditions}</p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center">
            <Link to="/orcamentos">
              <Button variant="outline" icon="arrow_back">Voltar à Lista</Button>
            </Link>
            <Link to="/orcamentos/novo">
              <Button variant="primary" icon="add">Novo Orçamento</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
