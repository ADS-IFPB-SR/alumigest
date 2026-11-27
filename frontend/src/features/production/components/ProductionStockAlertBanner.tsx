import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  PackageSearch,
  RefreshCw,
} from 'lucide-react';
import {
  compareCatalogStockCriticality,
  formatStockQuantity,
  resolveCatalogStockSnapshot,
  useStockBalances,
  type CatalogStockSnapshot,
  type StockItem,
} from '@/features/stock';

interface StockAlertEntry {
  readonly item: StockItem;
  readonly snapshot: CatalogStockSnapshot;
}

interface StockAlertSummary {
  readonly needPurchaseItems: readonly StockAlertEntry[];
  readonly orderPointItems: readonly StockAlertEntry[];
}

const MAX_PREVIEW_CHIPS = 3;

function summarizeStockAlerts(stockItems: readonly StockItem[]): StockAlertSummary {
  const needPurchaseItems: StockAlertEntry[] = [];
  const orderPointItems: StockAlertEntry[] = [];

  for (const item of stockItems) {
    const snapshot = resolveCatalogStockSnapshot(item, item.unitMeasure);
    if (snapshot.displayStatus === 'NEED_PURCHASE') {
      needPurchaseItems.push({ item, snapshot });
    } else if (snapshot.displayStatus === 'ORDER_POINT') {
      orderPointItems.push({ item, snapshot });
    }
  }

  needPurchaseItems.sort((a, b) => compareCatalogStockCriticality(a.snapshot, b.snapshot));
  orderPointItems.sort((a, b) => compareCatalogStockCriticality(a.snapshot, b.snapshot));

  return { needPurchaseItems, orderPointItems };
}

function formatPurchaseChipDetail(snapshot: CatalogStockSnapshot): string {
  if (snapshot.availableQuantity < 0) {
    return `falta ${formatStockQuantity(Math.abs(snapshot.availableQuantity), snapshot.unitMeasure)}`;
  }
  return `saldo ${formatStockQuantity(snapshot.availableQuantity, snapshot.unitMeasure)}`;
}

function StockAlertPreviewChips({
  entries,
  mode,
}: {
  readonly entries: readonly StockAlertEntry[];
  readonly mode: 'NEED_PURCHASE' | 'ORDER_POINT';
}) {
  const visible = entries.slice(0, MAX_PREVIEW_CHIPS);
  const remaining = entries.length - visible.length;
  const isPurchase = mode === 'NEED_PURCHASE';

  const chipClass = isPurchase
    ? 'bg-white/90 text-rose-900 border-rose-200 dark:bg-rose-950/60 dark:text-rose-100 dark:border-rose-700/60'
    : 'bg-white/90 text-amber-900 border-amber-200 dark:bg-amber-950/60 dark:text-amber-100 dark:border-amber-700/60';

  const overflowClass = isPurchase
    ? 'bg-rose-600/15 text-rose-800 border-rose-300 dark:bg-rose-500/25 dark:text-rose-200 dark:border-rose-500/40'
    : 'bg-amber-600/15 text-amber-900 border-amber-300 dark:bg-amber-500/25 dark:text-amber-200 dark:border-amber-500/40';

  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-2">
      {visible.map(({ item, snapshot }) => {
        const detail = isPurchase
          ? formatPurchaseChipDetail(snapshot)
          : `disp. ${formatStockQuantity(snapshot.availableQuantity, snapshot.unitMeasure)}`;

        return (
          <span
            key={item.id || item.materialId}
            data-testid="kanban-stock-alert-chip"
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-medium ${chipClass}`}
          >
            <span className="font-data-mono font-bold">{item.materialSku}</span>
            <span>·</span>
            <span className="truncate max-w-[180px]">{item.materialName}</span>
            <span className="font-data-mono font-semibold">({detail})</span>
          </span>
        );
      })}
      {remaining > 0 && (
        <span
          data-testid="kanban-stock-alert-overflow"
          className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-bold ${overflowClass}`}
        >
          +{remaining} {remaining === 1 ? 'outro' : 'outros'}
        </span>
      )}
    </div>
  );
}

/**
 * Faixa superior de avisos fabris exibida no topo do painel de produção (US-22.4).
 * Sinaliza insumos em falta ou no ponto de pedido sem bloquear a movimentação de O.S. (Make-to-Order).
 */
export function ProductionStockAlertBanner() {
  const {
    data: stockItems = [],
    isLoading,
    isError,
    refetch,
  } = useStockBalances();

  const { needPurchaseItems, orderPointItems } = useMemo(
    () => summarizeStockAlerts(stockItems),
    [stockItems]
  );

  if (isLoading) {
    return null;
  }

  if (isError) {
    return (
      <div
        role="alert"
        data-testid="kanban-stock-alert-error"
        className="p-3 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs flex-none no-print"
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-300 shrink-0" />
          <span>
            Não foi possível verificar os alertas de insumos do almoxarifado no momento.
          </span>
        </div>
        <button
          type="button"
          onClick={() => void refetch()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-400/80 dark:border-amber-400/40 bg-white/80 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-500/20 font-semibold transition-colors cursor-pointer self-start sm:self-center shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Recarregar saldos</span>
        </button>
      </div>
    );
  }

  if (needPurchaseItems.length === 0 && orderPointItems.length === 0) {
    return (
      <output
        data-testid="kanban-stock-alert-ok"
        className="px-3.5 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50/80 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs flex-none no-print"
      >
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-300 shrink-0" />
          <span>
            <strong>Almoxarifado em dia:</strong> Nenhum insumo em falta ou no ponto de pedido para a produção atual.
          </span>
        </div>
        <Link
          to="/catalogo"
          data-testid="kanban-stock-alert-cta"
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-emerald-300 dark:border-emerald-500/40 bg-white/80 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 font-semibold text-emerald-800 dark:text-emerald-200 transition-colors self-start sm:self-center shrink-0"
        >
          <span>Abrir Catálogo &amp; Estoque</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </output>
    );
  }

  if (needPurchaseItems.length > 0) {
    const missingCount = needPurchaseItems.length;
    const titleText =
      missingCount === 1
        ? 'Alerta Fabril: 1 insumo em falta para produção'
        : `Alerta Fabril: ${missingCount} insumos em falta para produção`;

    return (
      <section
        role="alert"
        data-testid="kanban-stock-alert-banner"
        aria-label="Avisos fabris de estoque"
        className="p-3.5 rounded-xl border-2 border-rose-200 bg-rose-50/90 text-rose-950 dark:border-rose-500/40 dark:bg-rose-500/15 dark:text-rose-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-2xs flex-none no-print"
      >
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-rose-100 border border-rose-200 text-rose-700 dark:bg-rose-500/20 dark:border-rose-500/40 dark:text-rose-200 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xs sm:text-sm font-bold text-rose-900 dark:text-rose-100">
                {titleText}
              </h2>
              {orderPointItems.length > 0 && (
                <span
                  data-testid="kanban-stock-order-point-extra"
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-200 dark:border-amber-500/40"
                >
                  +{orderPointItems.length} no ponto de pedido
                </span>
              )}
            </div>
            <p className="text-xs text-rose-800 dark:text-rose-200/90 mt-0.5">
              Regra Make-to-Order: a movimentação das O.S. não é bloqueada, mas confirme a reposição dos insumos antes de liberar o corte.
            </p>
            <StockAlertPreviewChips entries={needPurchaseItems} mode="NEED_PURCHASE" />
          </div>
        </div>

        <Link
          to="/catalogo?needsPurchase=true"
          data-testid="kanban-stock-alert-cta"
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-2xs transition-colors self-start lg:self-center shrink-0"
        >
          <span>Ver insumos pendentes</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </section>
    );
  }

  const reorderCount = orderPointItems.length;
  const reorderTitle =
    reorderCount === 1
      ? 'Atenção de Almoxarifado: 1 insumo no ponto de pedido'
      : `Atenção de Almoxarifado: ${reorderCount} insumos no ponto de pedido`;

  return (
    <output
      data-testid="kanban-stock-alert-banner"
      aria-label="Avisos fabris de estoque"
      className="p-3.5 rounded-xl border border-amber-300 bg-amber-50/90 text-amber-950 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-2xs flex-none no-print"
    >
      <div className="flex items-start gap-3 min-w-0">
        <div className="w-9 h-9 rounded-lg bg-amber-100 border border-amber-200 text-amber-700 dark:bg-amber-500/20 dark:border-amber-500/40 dark:text-amber-200 flex items-center justify-center shrink-0 mt-0.5">
          <PackageSearch className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <h2 className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-100">
            {reorderTitle}
          </h2>
          <p className="text-xs text-amber-800 dark:text-amber-200/90 mt-0.5">
            Regra Make-to-Order: a produção segue liberada, mas programe a compra para evitar ruptura no corte.
          </p>
          <StockAlertPreviewChips entries={orderPointItems} mode="ORDER_POINT" />
        </div>
      </div>

      <Link
        to="/catalogo?needsPurchase=true"
        data-testid="kanban-stock-alert-cta"
        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-2xs transition-colors self-start lg:self-center shrink-0"
      >
        <span>Consultar reposição</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </output>
  );
}
