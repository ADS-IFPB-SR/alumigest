import { useState, useEffect } from 'react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { useBudget, useDeleteBudget, useUpdateBudgetStatus } from '../features/budgets/hooks/useBudgets';
import { Button } from '../components/ui/Button';
import { STATUS_LABELS, type BudgetStatus } from '../features/budgets/types';
import { formatBRL } from '../features/budgets/utils/calculations';
import { WindowSvgPreview } from '../features/budgets/components/builder/WindowSvgPreview';
import { StatusBadge } from '../features/budgets/components/StatusBadge';

const ALL_STATUSES: BudgetStatus[] = ['DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'CANCELLED'];

export function BudgetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const { data: budget, isLoading, isError } = useBudget(id);
  const { mutate: deleteBudget, isPending: isDeleting } = useDeleteBudget();
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateBudgetStatus();

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [showCreatedBanner, setShowCreatedBanner] = useState<boolean>(() => {
    return Boolean((location.state as { justCreated?: boolean } | null)?.justCreated);
  });

  useEffect(() => {
    if ((location.state as { justCreated?: boolean } | null)?.justCreated) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  const handleDelete = () => {
    if (!budget) return;
    deleteBudget(budget.id, {
      onSuccess: () => {
        navigate('/orcamentos');
      },
    });
  };

  const handleStatusChange = (newStatus: BudgetStatus) => {
    if (!budget || budget.status === newStatus || isUpdatingStatus) return;
    updateStatus({ id: budget.id, status: newStatus });
  };


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
      <div className="flex items-center justify-between px-md py-sm border-b border-outline-variant bg-surface flex-none flex-wrap gap-sm">
        <div className="flex items-center gap-sm font-body-sm text-body-sm text-on-surface-variant">
          <Link to="/orcamentos" className="hover:text-primary transition-colors">Orçamentos</Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-on-surface font-medium">{budget.code}</span>
        </div>

        <div className="flex items-center gap-sm flex-wrap">
          {/* Seletor Rápido de Status */}
          <div className="flex items-center gap-xs">
            <label htmlFor="budget-status-select" className="text-xs font-label text-on-surface-variant hidden sm:inline">
              Status:
            </label>
            <select
              id="budget-status-select"
              value={budget.status}
              onChange={(e) => handleStatusChange(e.target.value as BudgetStatus)}
              disabled={isUpdatingStatus}
              aria-label="Status do orçamento"
              className="text-xs px-sm py-[4px] rounded-full border border-outline-variant bg-surface-container font-label font-semibold cursor-pointer outline-none transition-all text-on-surface hover:border-primary"
            >
              {ALL_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {STATUS_LABELS[st]}
                </option>
              ))}
            </select>
          </div>


          <Link to={`/orcamentos/${budget.id}/editar`}>
            <Button variant="outline" icon="edit">
              Editar
            </Button>
          </Link>

          <Button
            variant="outline"
            icon="delete"
            onClick={() => setShowDeleteModal(true)}
            className="text-error border-error/30 hover:bg-error/10 hover:border-error"
          >
            Excluir
          </Button>

          <Link to="/orcamentos/novo">
            <Button variant="primary" icon="add">
              Novo Orçamento
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-md lg:p-lg">
        <div className="max-w-[1000px] mx-auto flex flex-col gap-lg pb-xl">

          {/* Success banner — exibido apenas imediatamente após criação */}
          {showCreatedBanner && (
            <div className="bg-tertiary-container/30 border border-tertiary-container/50 rounded-lg p-md flex items-center justify-between gap-sm">
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-on-tertiary-container text-[24px]">check_circle</span>
                <div>
                  <p className="font-label font-semibold text-on-tertiary-container">Orçamento criado com sucesso!</p>
                  <p className="text-xs text-on-tertiary-container/80 font-body">
                    Código da Proposta: <strong className="font-data-mono">{budget.code}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreatedBanner(false)}
                className="p-xs text-on-tertiary-container/70 hover:text-on-tertiary-container hover:bg-tertiary-container/40 rounded transition-colors"
                aria-label="Fechar aviso"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          )}

          {/* Header Resumo */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-md">
            <div>
              <div className="flex items-center gap-sm">
                <h2 className="font-headline text-headline-md font-bold text-on-surface">
                  {budget.code}
                </h2>
                <StatusBadge status={budget.status} />
              </div>
              <p className="text-xs text-on-surface-variant font-body mt-xs">
                Criado em {new Date(budget.createdAt).toLocaleDateString('pt-BR')} às {new Date(budget.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                {budget.validUntil && (
                  <span> · Válido até {new Date(budget.validUntil).toLocaleDateString('pt-BR')}</span>
                )}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-xs font-label text-on-surface-variant">Valor Total da Proposta</p>
              <p className="font-data-mono font-bold text-primary text-2xl">{formatBRL(total)}</p>
            </div>
          </div>

          {/* Cliente */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md shadow-sm">
            <h3 className="font-title-sm text-title-sm text-on-surface mb-md pb-xs border-b border-outline-variant">
              Cliente
            </h3>
            <div className="flex items-start gap-sm">
              <span className="material-symbols-outlined text-primary text-[28px]">account_circle</span>
              <div className="min-w-0">
                <p className="font-label font-semibold text-on-surface text-base">{budget.customer?.name ?? budget.customerName}</p>
                {budget.customer?.phone && (
                  <p className="text-xs text-on-surface-variant font-data-mono mt-xs flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[14px]">phone</span>
                    {budget.customer.phone}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Itens */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden shadow-sm">
            <div className="bg-surface-container-low border-b border-outline-variant px-md py-sm flex justify-between items-center">
              <h3 className="font-title-sm text-title-sm text-on-surface">
                Itens ({budget.items?.length ?? 0})
              </h3>
              <span className="text-xs font-data-mono text-secondary">
                {budget.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0} esquadrias no total
              </span>
            </div>
            <div className="flex flex-col divide-y divide-outline-variant/40">
              {(budget.items ?? []).map((item, idx) => {
                return (
                  <div key={item.id ?? idx} className="p-md flex flex-col sm:flex-row gap-md items-start">
                    {/* Mini SVG preview — exibido apenas se o item tiver templateType configurado */}
                    {item.templateType && (
                      <div className="shrink-0 bg-surface-container-low rounded-md p-xs border border-outline-variant self-center sm:self-start">
                        <WindowSvgPreview
                          templateType={item.templateType}
                          widthMm={item.width ?? 2000}
                          heightMm={item.height ?? 2100}
                          openingDirection={item.templateConfig?.openingDirection ?? 'LEFT_TO_RIGHT'}
                          handleConfig={item.handleConfig ?? { handleType: 'NONE' }}
                          drillingConfig={item.drillingConfig ?? { holeCount: 0, divisionType: 'EQUAL' }}
                          templateName={item.productName}
                          aluminumColor={item.templateConfig?.aluminumColor}
                          glassFinish={item.templateConfig?.glassFinish}
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 w-full">
                      <div className="flex items-start justify-between gap-sm mb-sm">
                        <div>
                          <p className="font-label font-semibold text-on-surface text-base">{item.productName}</p>
                          <p className="text-xs text-on-surface-variant font-body">Modelo: {item.templateType || 'Básico'}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-data-mono font-bold text-primary text-lg">{formatBRL(item.subtotal)}</p>
                          <p className="text-xs text-on-surface-variant">{item.quantity}× unidade{item.quantity > 1 ? 's' : ''}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-xs text-xs font-data-mono text-on-surface-variant mb-sm">
                        <span className="bg-surface-container px-xs py-[2px] rounded border border-outline-variant">
                          Medida: {item.width}×{item.height} mm
                        </span>
                        {item.laborCost > 0 && (
                          <span className="bg-surface-container px-xs py-[2px] rounded border border-outline-variant">
                            Mão de obra: {formatBRL(item.laborCost * item.quantity)}
                          </span>
                        )}
                        {item.handleConfig?.handleType && item.handleConfig.handleType !== 'NONE' && (
                          <span className="bg-surface-container px-xs py-[2px] rounded border border-outline-variant">
                            Puxador: {item.handleConfig.handleType}
                          </span>
                        )}
                        {(item.drillingConfig?.holeCount ?? 0) > 0 && (
                          <span className="bg-surface-container px-xs py-[2px] rounded border border-outline-variant">
                            {item.drillingConfig?.holeCount} furo{item.drillingConfig.holeCount > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>

                      {/* Materiais do item */}
                      {(item.options ?? []).length > 0 && (
                        <div className="mt-sm bg-surface-container-low rounded-md p-sm border border-outline-variant/60 flex flex-col gap-xs">
                          <p className="text-[11px] font-label font-semibold text-on-surface-variant uppercase tracking-wider mb-xs">
                            Composição de Materiais
                          </p>
                          {item.options.map((opt) => (
                            <div key={opt.id ?? `${opt.materialId}-${opt.materialName}`} className="flex justify-between items-center text-xs text-on-surface-variant py-[2px] border-b border-outline-variant/30 last:border-0">
                              <span className="font-body text-on-surface">{opt.materialName}</span>
                              <span className="font-data-mono">
                                {opt.quantity !== undefined ? (
                                  <>
                                    {opt.quantity} {opt.unitMeasure} × {formatBRL(opt.unitPrice)}
                                    {opt.totalPrice !== undefined && <> = <strong>{formatBRL(opt.totalPrice)}</strong></>}
                                  </>
                                ) : (
                                  <span>{formatBRL(opt.unitPrice)} / {opt.unitMeasure}</span>
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {item.notes && (
                        <p className="text-xs text-on-surface-variant italic mt-xs font-body">
                          Obs: {item.notes}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Resumo Financeiro */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden shadow-sm">
            <div className="bg-primary text-on-primary px-md py-sm flex items-center gap-xs">
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
              <h3 className="font-title-sm text-title-sm font-semibold">Resumo Financeiro da Proposta</h3>
            </div>
            <div className="p-md flex flex-col gap-sm">
              <div className="flex justify-between items-center py-xs border-b border-outline-variant border-dashed text-sm">
                <span className="text-on-surface-variant font-body">Subtotal dos Itens</span>
                <span className="font-data-mono text-on-surface font-semibold">{formatBRL(subtotal)}</span>
              </div>
              {discountValue > 0 && (
                <div className="flex justify-between items-center py-xs border-b border-outline-variant border-dashed text-sm">
                  <span className="text-on-surface-variant font-body">Desconto Comercial ({budget.discountPercent}%)</span>
                  <span className="font-data-mono text-error font-semibold">− {formatBRL(discountValue)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-sm border-t-2 border-outline mt-xs">
                <span className="font-headline font-bold text-on-surface text-base">Total Líquido do Orçamento</span>
                <span className="font-data-mono font-bold text-primary text-2xl">{formatBRL(total)}</span>
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
                  <p className="text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wider mb-xs">Observações do Projeto</p>
                  <p className="text-sm font-body text-on-surface whitespace-pre-line">{budget.notes}</p>
                </div>
              )}
              {budget.commercialConditions && (
                <div>
                  <p className="text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wider mb-xs">Condições Comerciais e Pagamento</p>
                  <p className="text-sm font-body text-on-surface whitespace-pre-line">{budget.commercialConditions}</p>
                </div>
              )}
            </div>
          )}

          {/* Actions Bottom */}
          <div className="flex justify-between items-center flex-wrap gap-sm pt-sm">
            <Link to="/orcamentos">
              <Button variant="outline" icon="arrow_back">Voltar à Lista</Button>
            </Link>
            <div className="flex items-center gap-sm flex-wrap">
              <Link to={`/orcamentos/${budget.id}/editar`}>
                <Button variant="outline" icon="edit">Editar Orçamento</Button>
              </Link>
              <Link to="/orcamentos/novo">
                <Button variant="primary" icon="add">Novo Orçamento</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmação de exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md bg-black/60 backdrop-blur-sm">
          <div className="bg-surface border border-outline-variant rounded-xl p-lg max-w-sm w-full shadow-2xl flex flex-col gap-md">
            <div className="flex items-center gap-sm text-error">
              <span className="material-symbols-outlined text-[24px]">warning</span>
              <h4 className="font-headline font-bold text-on-surface text-base">Excluir Orçamento?</h4>
            </div>
            <p className="text-sm text-on-surface-variant font-body">
              Tem certeza que deseja excluir o orçamento <strong>{budget.code}</strong> de <strong>{budget.customer?.name ?? budget.customerName}</strong> ({formatBRL(budget.total)})? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-sm mt-xs">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-md py-xs rounded-md border border-outline-variant text-sm font-label font-medium hover:bg-surface-container transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-md py-xs rounded-md bg-error text-on-error text-sm font-label font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isDeleting ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
