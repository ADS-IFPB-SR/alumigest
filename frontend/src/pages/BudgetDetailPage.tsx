import { useState, useEffect } from 'react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { useBudget, useDeleteBudget, useUpdateBudgetStatus } from '../features/budgets/hooks/useBudgets';
import { Button } from '../components/ui/Button';
import {
  TEMPLATE_TYPE_INFO,
  type BudgetStatus,
  type DoorTemplateType,
} from '../features/budgets/types';
import { formatBRL } from '../features/budgets/utils/calculations';
import { WindowSvgPreview } from '../features/budgets/components/builder/WindowSvgPreview';
import { BudgetMaterialsSummary } from '../features/budgets/components/BudgetMaterialsSummary';
import { BudgetStatusPipeline } from '../features/budgets/components/BudgetStatusPipeline';
import { BudgetFinancialSummaryCard } from '../features/budgets/components/BudgetFinancialSummaryCard';
import { BudgetDetailActions } from '../features/budgets/components/BudgetDetailActions';

export function BudgetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const { data: budget, isLoading, isError } = useBudget(id);
  const { mutate: deleteBudget, isPending: isDeleting } = useDeleteBudget();
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateBudgetStatus();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  
  const toggleItemExpanded = (itemId: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

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
  const freightCost = budget.freightCost ?? 0;
  const installationCost = budget.installationCost ?? 0;
  
  const totalLaborCost = (budget.items ?? []).reduce((sum, item) => {
    return sum + ((item.laborCost ?? 0) * (item.quantity ?? 1));
  }, 0);

  const total = budget.total ?? 0;
  const hasDiscount = discountValue > 0;
  const isPercentDiscount = Boolean(budget.discountPercent && budget.discountPercent > 0);

  const commercialConditions = budget.paymentNotes ?? budget.commercialConditions ?? null;
  const paymentMethod = budget.paymentConditionLabel ?? budget.paymentCondition ?? null;
  
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-surface">
      {/* ── Topbar / Header Executivo ──────────────────────────────────── */}
      <header className="border-b border-outline-variant bg-surface-container-lowest/80 backdrop-blur-md px-md lg:px-xl py-sm flex flex-col gap-3 shrink-0 shadow-2xs">
        <div className="flex items-center gap-sm flex-wrap w-full">
          <Link
            to="/orcamentos"
            className="flex items-center gap-1 text-xs font-label font-medium text-on-surface-variant hover:text-primary transition-colors py-1 px-2 rounded-md hover:bg-surface-container shrink-0"
            title="Voltar aos orçamentos"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span className="hidden sm:inline">Orçamentos</span>
          </Link>
          
          <span className="text-outline-variant shrink-0 hidden sm:inline">/</span>

          <h1 className="font-headline text-xl sm:text-2xl font-extrabold text-on-surface tracking-tight whitespace-nowrap shrink-0">
            {budget.code}
          </h1>

          <div className="ml-xs sm:ml-sm flex-shrink-0">
            <BudgetStatusPipeline
              status={budget.status}
              onChange={handleStatusChange}
              disabled={isUpdatingStatus}
            />
          </div>
        </div>

        {/* ── Barra de Ações Superior Isolada ────────────────────────────── */}
        <BudgetDetailActions
          budgetId={budget.id}
          budgetCode={budget.code}
          customerPhone={budget.customer?.phone}
          status={budget.status}
          onDeleteClick={() => setShowDeleteModal(true)}
        />
      </header>

      {/* ── Conteúdo Principal ───────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-md lg:p-xl">
        <div className="max-w-[1440px] mx-auto flex flex-col gap-md">

          {showCreatedBanner && (
            <div className="bg-tertiary-container/20 border border-tertiary-container/40 rounded-xl p-md flex items-center justify-between gap-sm animate-fadeIn">
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-primary text-[24px]">verified</span>
                <div>
                  <p className="font-label font-bold text-on-surface text-sm">Orçamento gerado com sucesso!</p>
                  <p className="text-xs text-on-surface-variant font-body">
                    A proposta <strong className="font-data-mono">{budget.code}</strong> foi salva no sistema.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreatedBanner(false)}
                className="p-1 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-md transition-colors"
                aria-label="Fechar aviso"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-md lg:gap-lg items-start">
            
            {/* Coluna Esquerda: Itens & Materiais (8 colunas) */}
            <div className="lg:col-span-8 flex flex-col gap-md">
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xs overflow-hidden">
                <div className="bg-surface-container-low/50 border-b border-outline-variant px-md py-sm flex justify-between items-center flex-wrap gap-xs">
                  <div className="flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[20px] text-primary">window</span>
                    <h2 className="font-label font-bold text-sm sm:text-base text-on-surface uppercase tracking-wider">
                      Esquadrias & Itens do Orçamento
                    </h2>
                  </div>
                  <div className="flex items-center gap-sm text-xs font-data-mono text-on-surface-variant">
                    <span className="bg-surface px-2 py-0.5 rounded border border-outline-variant font-semibold text-primary">
                      {budget.items?.length ?? 0} {budget.items?.length === 1 ? 'modelo' : 'modelos'}
                    </span>
                    <span>
                      {budget.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0} un no total
                    </span>
                  </div>
                </div>

                {!budget.items || budget.items.length === 0 ? (
                  <div className="p-xl text-center flex flex-col items-center justify-center gap-sm bg-surface-container-lowest">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-xs">
                      <span className="material-symbols-outlined text-[28px]">design_services</span>
                    </div>
                    <h3 className="font-headline font-bold text-on-surface text-base">
                      Nenhuma esquadria adicionada a esta proposta
                    </h3>
                    <p className="text-xs sm:text-sm text-on-surface-variant max-w-md font-body">
                      Este orçamento ainda não possui itens cadastrados. Clique no botão abaixo para adicionar esquadrias sob medida.
                    </p>
                    <Link to={`/orcamentos/${budget.id}/editar`} className="mt-xs">
                      <Button variant="primary" icon="add">
                        Configurar Esquadrias
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-outline-variant/50">
                    {budget.items.map((item, idx) => {
                      const itemId = item.id || `item-${idx}`;
                      const isExpanded = expandedItems[itemId] ?? false;
                      const hasOptions = (item.options ?? []).length > 0;

                      return (
                        <div key={itemId} className="p-md hover:bg-surface-container-lowest/50 transition-colors flex flex-col gap-sm">
                          <div className="flex flex-col sm:flex-row gap-md items-start">
                            {item.templateType ? (
                              <div className="shrink-0 bg-surface-container-low rounded-lg p-2 border border-outline-variant self-center sm:self-start w-[140px] flex items-center justify-center">
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
                                  maxHeight={110}
                                />
                              </div>
                            ) : (
                              <div className="shrink-0 bg-surface-container-low rounded-lg p-4 border border-outline-variant text-on-surface-variant flex flex-col items-center justify-center w-[120px] h-[90px]">
                                <span className="material-symbols-outlined text-[24px]">view_in_ar</span>
                                <span className="text-[10px] font-label mt-1">Item Padrão</span>
                              </div>
                            )}

                            <div className="flex-1 min-w-0 w-full flex flex-col gap-xs">
                              <div className="flex items-start justify-between gap-sm">
                                <div>
                                  <h3 className="font-label font-bold text-on-surface text-base">
                                    {item.productName}
                                  </h3>
                                  <p className="text-xs text-on-surface-variant font-body">
                                    {item.templateType && TEMPLATE_TYPE_INFO[item.templateType as DoorTemplateType]?.label
                                      ? TEMPLATE_TYPE_INFO[item.templateType as DoorTemplateType].label
                                      : 'Esquadria sob medida'}
                                  </p>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="font-data-mono font-extrabold text-primary text-lg">
                                    {formatBRL(item.subtotal)}
                                  </span>
                                  <p className="text-xs font-label text-on-surface-variant">
                                    {item.quantity} {item.quantity > 1 ? 'unidades' : 'unidade'}
                                    {item.quantity > 1 && (
                                      <span className="text-[10px] text-on-surface-variant block font-data-mono">
                                        ({formatBRL(item.subtotal / item.quantity)} / un)
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-xs text-xs font-data-mono text-on-surface-variant mt-1">
                                <span className="bg-surface-container px-2 py-0.5 rounded border border-outline-variant font-medium flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[13px] text-primary">square_foot</span>
                                  {item.width} × {item.height} mm
                                </span>
                                {item.templateConfig?.aluminumColor && (
                                  <span className="bg-surface-container px-2 py-0.5 rounded border border-outline-variant">
                                    {item.templateConfig.aluminumColor}
                                  </span>
                                )}
                                {item.templateConfig?.glassFinish && (
                                  <span className="bg-surface-container px-2 py-0.5 rounded border border-outline-variant">
                                    {item.templateConfig.glassFinish}
                                  </span>
                                )}
                                {item.laborCost > 0 && (
                                  <span className="bg-surface-container px-2 py-0.5 rounded border border-outline-variant">
                                    MO: {formatBRL(item.laborCost * item.quantity)}
                                  </span>
                                )}
                                {item.handleConfig?.handleType && item.handleConfig.handleType !== 'NONE' && (
                                  <span className="bg-surface-container px-2 py-0.5 rounded border border-outline-variant">
                                    Puxador: {item.handleConfig.handleType}
                                  </span>
                                )}
                              </div>

                              {item.notes && (
                                <p className="text-xs text-on-surface-variant/90 italic font-body bg-surface-container-low/60 px-2 py-1 rounded border border-outline-variant/40 mt-1">
                                  Obs: {item.notes}
                                </p>
                              )}

                              {hasOptions && (
                                <div className="mt-2 pt-1 border-t border-outline-variant/30 flex justify-between items-center">
                                  <button
                                    type="button"
                                    onClick={() => toggleItemExpanded(itemId)}
                                    className="flex items-center gap-1 text-xs font-label font-semibold text-primary hover:text-primary/80 transition-colors focus:outline-none cursor-pointer"
                                  >
                                    <span className="material-symbols-outlined text-[16px] transition-transform duration-200" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                                      expand_more
                                    </span>
                                    <span>
                                      {isExpanded ? 'Ocultar Insumos' : `Ver Insumos da Esquadria (${item.options.length})`}
                                    </span>
                                  </button>
                                  <span className="text-[11px] font-data-mono text-on-surface-variant">
                                    {item.options.length} materiais calculados
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {hasOptions && isExpanded && (
                            <div className="bg-surface-container-low rounded-lg p-sm border border-outline-variant/60 flex flex-col gap-1 mt-1 animate-fadeIn">
                              <p className="text-[10px] font-label font-bold text-on-surface-variant uppercase tracking-wider pb-1 border-b border-outline-variant/40">
                                Insumos & Componentes Utilizados:
                              </p>
                              <div className="divide-y divide-outline-variant/30">
                                {item.options.map((opt, oIdx) => (
                                  <div
                                    key={opt.id ?? `${opt.materialId}-${oIdx}`}
                                    className="flex justify-between items-center text-xs py-1 gap-2"
                                  >
                                    <span className="font-body text-on-surface truncate flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                                      {opt.materialName}
                                    </span>
                                    <span className="font-data-mono text-on-surface-variant shrink-0">
                                      {opt.quantity !== undefined ? (
                                        <>
                                          {opt.quantity} {opt.unitMeasure} × {formatBRL(opt.unitPrice)}
                                          {opt.totalPrice !== undefined && (
                                            <span className="font-bold text-on-surface ml-1">
                                              = {formatBRL(opt.totalPrice)}
                                            </span>
                                          )}
                                        </>
                                      ) : (
                                        <span>{formatBRL(opt.unitPrice)} / {opt.unitMeasure}</span>
                                      )}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {budget.items && budget.items.length > 0 && (
                <BudgetMaterialsSummary items={budget.items} />
              )}

              {budget.notes && (
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-xs flex flex-col gap-sm">
                  <h3 className="font-label font-bold text-xs uppercase tracking-wider text-on-surface-variant pb-xs border-b border-outline-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-primary">description</span>
                    {' '}Observações / Notas do Orçamento
                  </h3>
                  <div className="bg-surface-container-low p-sm rounded-lg border border-outline-variant/50 text-xs font-body">
                    <p className="text-on-surface-variant whitespace-pre-line leading-relaxed">{budget.notes}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Coluna Direita: Sidebar Cliente + Fechamento Financeiro (4 colunas) */}
            <div className="lg:col-span-4 flex flex-col gap-md lg:sticky lg:top-4">

              {/* Card do Cliente */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-xs flex flex-col gap-sm">
                <div className="flex items-center justify-between pb-xs border-b border-outline-variant">
                  <span className="text-xs font-label font-bold text-on-surface uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-primary">person</span>
                    {' '}Cliente
                  </span>
                  {budget.customer?.id && (
                    <Link
                      to={`/clientes/${budget.customer.id}`}
                      className="text-[11px] font-label font-semibold text-primary hover:underline"
                    >
                      Ver cadastro
                    </Link>
                  )}
                </div>

                <div className="flex items-start gap-sm pt-xs">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-base flex items-center justify-center shrink-0 border border-primary/20">
                    {(budget.customer?.name ?? budget.customerName ?? 'C').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-label font-bold text-on-surface text-sm sm:text-base truncate">
                      {budget.customer?.name ?? budget.customerName}
                    </p>
                    {budget.customer?.document && (
                      <p className="text-[11px] font-data-mono text-on-surface-variant">
                        Doc: {budget.customer.document}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-xs pt-xs border-t border-outline-variant/50 text-xs font-body text-on-surface-variant">
                  {budget.customer?.phone ? (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px] text-primary">phone</span>
                        <span className="font-data-mono">{budget.customer.phone}</span>
                      </span>
                      <a
                        href={`https://wa.me/55${budget.customer.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-emerald-600 dark:text-emerald-400 font-label font-semibold hover:underline flex items-center gap-0.5"
                      >
                        <span>WhatsApp</span>
                        <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                      </a>
                    </div>
                  ) : (
                    <p className="text-[11px] italic text-on-surface-variant/70">Telefone não informado</p>
                  )}

                  {budget.customer?.email && (
                    <div className="flex items-center gap-1 truncate">
                      <span className="material-symbols-outlined text-[15px] text-primary shrink-0">mail</span>
                      <span className="truncate">{budget.customer.email}</span>
                    </div>
                  )}

                  {budget.customer?.address && (
                    <div className="flex items-start gap-1 pt-0.5">
                      <span className="material-symbols-outlined text-[15px] text-primary shrink-0 mt-0.5">location_on</span>
                      <span className="line-clamp-2 text-[11px]">{budget.customer.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* ── CARD DE FECHAMENTO FINANCEIRO ISOLADO ────────────────── */}
              <BudgetFinancialSummaryCard
                subtotal={subtotal}
                totalLaborCost={totalLaborCost}
                freightCost={freightCost}
                installationCost={installationCost}
                hasDiscount={hasDiscount}
                isPercentDiscount={isPercentDiscount}
                discountPercent={budget.discountPercent}
                discountValue={discountValue}
                total={total}
                paymentCondition={budget.paymentCondition}
                paymentConditionLabel={budget.paymentConditionLabel}
                paymentMethod={paymentMethod}
                paymentNotes={budget.paymentNotes}
                commercialConditions={commercialConditions}
                createdAt={budget.createdAt}
                validUntil={budget.validUntil}
              />

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
                className="px-md py-xs rounded-md border border-outline-variant text-sm font-label font-medium hover:bg-surface-container transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-md py-xs rounded-md bg-error text-on-error text-sm font-label font-bold hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
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