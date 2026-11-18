import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { StockAlertBadge } from './StockAlertBadge';
import { useKardex } from '../hooks/useStock';
import type { KardexMaterialTarget, StockItem, StockMovement } from '../types';
import {
  computeKardexAvailableAfter,
  formatKardexCurrency,
  formatKardexDateTime,
  formatKardexDeltaSummary,
  formatStockQuantity,
  getKardexMovementPresentation,
  resolveCatalogStockSnapshot,
} from '../utils/stockPresentation';

export interface KardexDrawerProps {
  readonly isOpen: boolean;
  readonly material: KardexMaterialTarget | null;
  readonly stockItem?: StockItem;
  readonly onClose: () => void;
}

const AVAILABLE_BALANCE_CLASSES = {
  NEED_PURCHASE: 'text-rose-700 dark:text-rose-300',
  ORDER_POINT: 'text-amber-800 dark:text-amber-300',
  IN_STOCK: 'text-emerald-700 dark:text-emerald-300',
  NO_BALANCE: 'text-on-surface-variant',
} as const;

interface TimelineCardProps {
  readonly movement: StockMovement;
  readonly fallbackUnitMeasure: string;
}

const KardexTimelineItem: React.FC<TimelineCardProps> = ({
  movement,
  fallbackUnitMeasure,
}) => {
  const presentation = getKardexMovementPresentation(movement.type);
  const unit = movement.unitMeasure || fallbackUnitMeasure;
  const formattedDate = formatKardexDateTime(movement.createdAt);
  const deltaSummary = formatKardexDeltaSummary(movement, fallbackUnitMeasure);
  const unitCostLabel = formatKardexCurrency(movement.unitCost);
  const availableAfter = computeKardexAvailableAfter(movement);

  const hasReservedTransition =
    movement.previousReservedQuantity !== undefined &&
    movement.newReservedQuantity !== undefined;

  return (
    <li
      data-testid="kardex-timeline-item"
      data-movement-type={movement.type}
      className={`relative pl-6 pb-4 last:pb-0 border-l-2 ${presentation.lineClass}`}
    >
      <span
        aria-hidden="true"
        className={`absolute -left-[7px] top-1 w-3 h-3 rounded-full ring-4 ${presentation.dotClass}`}
      />

      <div className={`rounded-xl border p-3 shadow-2xs space-y-2 ${presentation.cardClass}`}>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className={`font-bold ${presentation.titleClass}`}>
            {presentation.badge}
          </span>
          <time
            dateTime={movement.createdAt}
            className="font-data-mono text-[11px] text-on-surface-variant"
          >
            {formattedDate}
          </time>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className={`font-data-mono font-bold ${presentation.deltaClass}`}>
            {deltaSummary}
          </span>
          {unitCostLabel && (
            <span className="font-data-mono text-[11px] font-semibold text-on-surface-variant">
              Custo: {unitCostLabel}/un
            </span>
          )}
        </div>

        {(movement.referenceDocument || movement.reason) && (
          <div className="text-xs text-on-surface space-y-0.5">
            {movement.referenceDocument && (
              <p>
                <span className="text-on-surface-variant">Documento / O.S.: </span>
                <strong className="font-data-mono">{movement.referenceDocument}</strong>
              </p>
            )}
            {movement.reason && (
              <p className="text-on-surface-variant leading-snug">{movement.reason}</p>
            )}
          </div>
        )}

        <div className="pt-2 border-t border-outline-variant/40 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[11px] font-data-mono text-on-surface-variant">
          <span>
            Físico:{' '}
            <strong className="text-on-surface">
              {formatStockQuantity(movement.previousPhysicalQuantity, unit)} →{' '}
              {formatStockQuantity(movement.newPhysicalQuantity, unit)}
            </strong>
          </span>

          {hasReservedTransition && (
            <span>
              Reservado:{' '}
              <strong className="text-on-surface">
                {formatStockQuantity(movement.previousReservedQuantity ?? 0, unit)} →{' '}
                {formatStockQuantity(movement.newReservedQuantity ?? 0, unit)}
              </strong>
            </span>
          )}

          <span>
            Disponível:{' '}
            <strong
              className={
                availableAfter < 0
                  ? 'text-rose-700 dark:text-rose-300'
                  : 'text-on-surface'
              }
            >
              {formatStockQuantity(availableAfter, unit)}
            </strong>
          </span>
        </div>

        {movement.registeredBy && (
          <p className="text-[10px] text-on-surface-variant">
            Responsável: <span className="font-semibold">{movement.registeredBy}</span>
          </p>
        )}
      </div>
    </li>
  );
};

interface KardexDrawerDialogProps {
  readonly material: KardexMaterialTarget;
  readonly stockItem?: StockItem;
  readonly onClose: () => void;
}

const KardexDrawerDialog: React.FC<KardexDrawerDialogProps> = ({
  material,
  stockItem,
  onClose,
}) => {
  const {
    data: movements = [],
    isLoading,
    isError,
    refetch,
  } = useKardex(material.id, true);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    globalThis.addEventListener('keydown', handleKeyDown);
    return () => globalThis.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const snapshot = resolveCatalogStockSnapshot(
    stockItem,
    material.unitMeasure || 'UN'
  );
  const skuLabel = stockItem?.materialSku || material.skuCode || 'SEM-SKU';

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        data-testid="kardex-drawer-backdrop"
        onClick={onClose}
        tabIndex={-1}
        aria-label="Fechar fundo da gaveta Kardex"
        className="fixed inset-0 w-full h-full bg-slate-900/45 backdrop-blur-[2px] border-0 cursor-default transition-opacity"
      />

      <dialog
        open
        aria-modal="true"
        aria-labelledby="kardex-drawer-title"
        data-testid="kardex-drawer"
        className="relative z-10 m-0 ml-auto p-0 border-0 border-l border-outline-variant w-full max-w-lg h-full max-h-none bg-surface-container-lowest text-on-surface shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
      >
        {/* Cabeçalho do Insumo */}
        <header className="p-5 border-b border-outline-variant bg-surface-container-low flex items-start justify-between gap-3 flex-none">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                data-testid="kardex-material-sku"
                className="text-[11px] font-bold font-data-mono text-primary uppercase tracking-wider"
              >
                #{skuLabel}
              </span>
              <StockAlertBadge
                variant="catalog"
                status={snapshot.displayStatus}
                availableQuantity={snapshot.availableQuantity}
                unitMeasure={snapshot.unitMeasure}
              />
            </div>

            <h3
              id="kardex-drawer-title"
              className="font-headline font-bold text-base text-on-surface leading-snug"
            >
              {material.name}
            </h3>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-on-surface-variant">
              <span>Extrato Cronológico de Movimentações (Kardex Imutável)</span>
              <span
                data-testid="kardex-minimum-stock"
                className="font-data-mono font-semibold text-on-surface"
              >
                Ponto de Pedido:{' '}
                {formatStockQuantity(snapshot.minimumStock, snapshot.unitMeasure)}
              </span>
            </div>
          </div>

          <button
            type="button"
            data-testid="kardex-close-button"
            onClick={onClose}
            aria-label="Fechar gaveta Kardex"
            title="Fechar (Esc)"
            className="w-8 h-8 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high flex items-center justify-center transition-colors shrink-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </header>

        {/* Resumo dos 3 Saldos Consolidados */}
        <section
          aria-label="Saldos consolidados do insumo"
          className="grid grid-cols-3 gap-2.5 p-4 bg-surface-container border-b border-outline-variant text-center flex-none"
        >
          <div className="bg-surface-container-lowest p-2.5 rounded-xl border border-outline-variant shadow-2xs">
            <span className="text-[10px] font-bold text-on-surface-variant block uppercase tracking-wider">
              Físico
            </span>
            <span
              data-testid="kardex-physical"
              className="font-data-mono tabular-nums font-extrabold text-sm text-on-surface"
            >
              {formatStockQuantity(snapshot.physicalQuantity, snapshot.unitMeasure)}
            </span>
          </div>

          <div className="bg-surface-container-lowest p-2.5 rounded-xl border border-outline-variant shadow-2xs">
            <span className="text-[10px] font-bold text-on-surface-variant block uppercase tracking-wider">
              Reservado
            </span>
            <span
              data-testid="kardex-reserved"
              className="font-data-mono tabular-nums font-extrabold text-sm text-amber-600 dark:text-amber-300"
            >
              {formatStockQuantity(snapshot.reservedQuantity, snapshot.unitMeasure)}
            </span>
          </div>

          <div className="bg-surface-container-lowest p-2.5 rounded-xl border border-outline-variant shadow-2xs">
            <span className="text-[10px] font-bold text-on-surface-variant block uppercase tracking-wider">
              Disponível
            </span>
            <span
              data-testid="kardex-available"
              className={`font-data-mono tabular-nums font-extrabold text-sm ${AVAILABLE_BALANCE_CLASSES[snapshot.displayStatus]}`}
            >
              {formatStockQuantity(snapshot.availableQuantity, snapshot.unitMeasure)}
            </span>
          </div>
        </section>

        {/* Linha do Tempo de Auditoria */}
        <div
          data-testid="kardex-timeline"
          className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Linha do Tempo de Auditoria
            </h4>
            {!isLoading && !isError && (
              <span className="text-[11px] font-data-mono text-on-surface-variant">
                {movements.length} {movements.length === 1 ? 'registro' : 'registros'}
              </span>
            )}
          </div>

          {isLoading && (
            <div data-testid="kardex-loading" className="space-y-3" aria-busy="true">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-24 rounded-xl border border-outline-variant bg-surface-container animate-pulse"
                />
              ))}
            </div>
          )}

          {!isLoading && isError && (
            <div
              role="alert"
              data-testid="kardex-error"
              className="rounded-xl border border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-500/40 dark:bg-rose-950/30 dark:text-rose-200 p-4 text-xs space-y-2"
            >
              <p className="font-semibold">
                Não foi possível carregar o extrato Kardex deste insumo.
              </p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="px-3 py-1.5 rounded-lg border border-rose-400/60 font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors cursor-pointer"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {!isLoading && !isError && movements.length === 0 && (
            <div
              data-testid="kardex-empty"
              className="rounded-xl border border-dashed border-outline-variant bg-surface-container-low p-6 text-center space-y-1.5"
            >
              <span
                className="material-symbols-outlined text-[28px] text-on-surface-variant"
                aria-hidden="true"
              >
                history
              </span>
              <p className="text-sm font-semibold text-on-surface">
                Nenhuma movimentação registrada no Kardex.
              </p>
              <p className="text-xs text-on-surface-variant">
                Entradas de compra, reservas de O.S. e baixas físicas aparecerão aqui em ordem cronológica.
              </p>
            </div>
          )}

          {!isLoading && !isError && movements.length > 0 && (
            <ol className="space-y-0">
              {movements.map((movement) => (
                <KardexTimelineItem
                  key={movement.id}
                  movement={movement}
                  fallbackUnitMeasure={snapshot.unitMeasure}
                />
              ))}
            </ol>
          )}
        </div>

        {/* Rodapé */}
        <footer className="p-4 border-t border-outline-variant bg-surface-container-low flex items-center justify-between flex-none">
          <span className="text-[11px] text-on-surface-variant">
            Pressione{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-surface-container border border-outline-variant font-data-mono text-[10px]">
              Esc
            </kbd>{' '}
            para fechar
          </span>
          <button
            type="button"
            data-testid="kardex-footer-close"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            Fechar Extrato
          </button>
        </footer>
      </dialog>
    </div>,
    document.body
  );
};

/**
 * Gaveta Lateral Deslizante (Sheet / Drawer) para inspeção do extrato cronológico Kardex
 * e saldos consolidados de um insumo sem sair do Catálogo de Materiais (US-22.2).
 */
export const KardexDrawer: React.FC<KardexDrawerProps> = ({
  isOpen,
  material,
  stockItem,
  onClose,
}) => {
  if (!isOpen || !material) {
    return null;
  }

  return (
    <KardexDrawerDialog
      material={material}
      stockItem={stockItem}
      onClose={onClose}
    />
  );
};
