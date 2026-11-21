import { useState } from 'react';

const HIDE_OPERATION_GUIDE_STORAGE_KEY = 'alumigest.catalog.hideOperationGuide';

export interface CatalogOperationGuideBannerProps {
  readonly pendingPurchaseCount?: number;
}

interface OperationPointCard {
  readonly step: string;
  readonly title: string;
  readonly routeLabel: string;
  readonly description: string;
  readonly highlightBadge: string;
  readonly highlightClass: string;
  readonly footnote: string;
}

const OPERATION_POINTS: readonly OperationPointCard[] = [
  {
    step: '1',
    title: 'Central 360° do Cliente (Aba O.S.)',
    routeLabel: 'Rota /clientes',
    description:
      'Na listagem de O.S. e nos detalhes das esquadrias, o status de matéria-prima sinaliza compras pendentes sem travar o fechamento comercial.',
    highlightBadge: 'Aguardando Compra de Material',
    highlightClass:
      'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-500/15 dark:text-rose-200 dark:border-rose-500/30',
    footnote: 'Vendas e aprovações comerciais seguem normalmente.',
  },
  {
    step: '2',
    title: 'Painel Kanban Fabril',
    routeLabel: 'Rota /producao',
    description:
      'A faixa superior de avisos e a fila WAITING_PRODUCTION orientam o operador a aguardar a entrega do insumo antes de liberar o corte.',
    highlightBadge: 'FALTA INSUMO',
    highlightClass:
      'bg-rose-600 text-white border-rose-700 dark:bg-rose-600/90 dark:border-rose-500',
    footnote: 'Atualiza automaticamente quando a compra entra no Kardex.',
  },
  {
    step: '3',
    title: 'Ficha Técnica e Etiquetas',
    routeLabel: 'Etiquetas 100×60mm',
    description:
      'Mesmo com compra pendente, a pré-impressão das etiquetas térmicas de identificação permanece liberada para organização da bancada.',
    highlightBadge: 'Emissão de Etiquetas Desimpedida',
    highlightClass:
      'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-500/15 dark:text-amber-200 dark:border-amber-500/30',
    footnote: 'Bancada preparada antes mesmo da descarga na oficina.',
  },
];

function readHideGuidePreference(): boolean {
  try {
    return globalThis.localStorage?.getItem(HIDE_OPERATION_GUIDE_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function persistHideGuidePreference(value: boolean): void {
  try {
    globalThis.localStorage?.setItem(HIDE_OPERATION_GUIDE_STORAGE_KEY, String(value));
  } catch {
    // Ignora falha de armazenamento em ambientes restritos
  }
}

function formatPendingSummary(pendingPurchaseCount: number): string {
  return pendingPurchaseCount === 1
    ? '1 insumo pendente'
    : `${pendingPurchaseCount} insumos pendentes`;
}

/**
 * Guia superior de operação Make-to-Order alinhado ao protótipo homologado de Catálogo & Almoxarifado.
 */
export function CatalogOperationGuideBanner({
  pendingPurchaseCount = 0,
}: CatalogOperationGuideBannerProps) {
  const [isHidden, setIsHidden] = useState<boolean>(readHideGuidePreference);

  const handleToggle = () => {
    setIsHidden((prev) => {
      const next = !prev;
      persistHideGuidePreference(next);
      return next;
    });
  };

  if (isHidden) {
    return (
      <div
        data-testid="catalog-operation-guide-collapsed"
        className="mb-sm px-3.5 py-2 rounded-xl border border-outline-variant bg-surface-container-low flex flex-wrap items-center justify-between gap-2 text-xs flex-none no-print"
      >
        <div className="flex flex-wrap items-center gap-2 text-on-surface">
          <span className="material-symbols-outlined text-[18px] text-primary" aria-hidden="true">
            explore
          </span>
          <span className="font-semibold">Guia de Operação Make-to-Order</span>
          {pendingPurchaseCount > 0 && (
            <span
              data-testid="operation-guide-pending-count"
              className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-300"
            >
              {formatPendingSummary(pendingPurchaseCount)}
            </span>
          )}
        </div>
        <button
          type="button"
          data-testid="btn-toggle-operation-guide"
          onClick={handleToggle}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container-high font-semibold transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[15px]" aria-hidden="true">
            expand_more
          </span>
          <span>Exibir Guia</span>
        </button>
      </div>
    );
  }

  return (
    <section
      data-testid="catalog-operation-guide-banner"
      aria-label="Guia de Operação Make-to-Order"
      className="mb-sm bg-gradient-to-r from-slate-900 via-slate-800 to-[#041632] border border-slate-700/90 rounded-xl p-4 text-white shadow-sm flex-none space-y-3 no-print"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/80 pb-2.5">
        <div className="flex items-start gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-amber-400/20 border border-amber-400/30 text-amber-300 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              explore
            </span>
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-headline font-bold text-sm text-white leading-tight">
                Guia de Operação: Controle de Estoque Make-to-Order
              </h3>
              <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 font-data-mono text-[10px] font-bold px-2 py-0.5 rounded-full">
                Regra Make-to-Order
              </span>
              {pendingPurchaseCount > 0 && (
                <span
                  data-testid="operation-guide-pending-count"
                  className="bg-rose-500/25 text-rose-200 border border-rose-400/40 font-data-mono text-[10px] font-bold px-2 py-0.5 rounded-full"
                >
                  {formatPendingSummary(pendingPurchaseCount)}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
              O estoque <strong>nunca bloqueia</strong> o fechamento de orçamentos ou O.S. Quando faltar matéria-prima, a operação é sinalizada automaticamente nestes 3 pontos:
            </p>
          </div>
        </div>

        <button
          type="button"
          data-testid="btn-toggle-operation-guide"
          onClick={handleToggle}
          className="self-start sm:self-center inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-200 hover:text-white bg-slate-800/70 hover:bg-slate-700/80 border border-slate-600/70 transition-colors cursor-pointer shrink-0"
        >
          <span className="material-symbols-outlined text-[15px]" aria-hidden="true">
            expand_less
          </span>
          <span>Ocultar Guia</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {OPERATION_POINTS.map((point) => (
          <div
            key={point.step}
            className="bg-white/95 dark:bg-slate-900/90 rounded-lg p-3 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between gap-2"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-5 h-5 rounded bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 flex items-center justify-center font-bold text-[11px] shrink-0">
                    {point.step}
                  </span>
                  <h4 className="font-headline font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                    {point.title}
                  </h4>
                </div>
                <span className="text-[10px] font-data-mono text-slate-500 dark:text-slate-400 shrink-0">
                  {point.routeLabel}
                </span>
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                {point.description}
              </p>
            </div>

            <div className="space-y-1.5">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-bold ${point.highlightClass}`}
              >
                {point.highlightBadge}
              </span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                * {point.footnote}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
