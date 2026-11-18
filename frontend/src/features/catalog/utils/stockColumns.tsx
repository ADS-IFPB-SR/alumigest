import React from 'react';
import {
  StockAlertBadge,
  formatStockQuantity,
  resolveCatalogStockSnapshot,
  type StockDisplayAlertStatus,
  type StockItem,
} from '@/features/stock';

export interface CatalogTableColumn<T> {
  readonly header: string;
  readonly accessor: keyof T | ((row: T) => React.ReactNode);
  readonly exportValue?: (row: T) => string | number | boolean | null | undefined;
  readonly align?: 'left' | 'center' | 'right';
  readonly className?: string;
}

export interface StockColumnsConfig {
  readonly stockByMaterialId: ReadonlyMap<string, StockItem>;
  readonly hideStockAlert: boolean;
  readonly defaultUnitMeasure?: string;
  readonly statusDataCy: string;
}

const AVAILABLE_TEXT_CLASSES: Readonly<Record<StockDisplayAlertStatus, string>> = {
  NEED_PURCHASE: 'text-rose-700 dark:text-rose-300',
  ORDER_POINT: 'text-amber-800 dark:text-amber-300',
  IN_STOCK: 'text-emerald-700 dark:text-emerald-300',
  NO_BALANCE: 'text-on-surface-variant',
};

function resolveRowSnapshot<T extends { id: string; unitMeasure?: string }>(
  row: T,
  stockByMaterialId: ReadonlyMap<string, StockItem>,
  defaultUnitMeasure?: string
) {
  return resolveCatalogStockSnapshot(
    stockByMaterialId.get(row.id),
    row.unitMeasure || defaultUnitMeasure || 'UN'
  );
}

/**
 * Constrói as colunas padrão de almoxarifado (Físico, Reservado, Disponível e Alerta Estoque opcional)
 * além da coluna padronizada de Status (Ativo/Inativo), evitando duplicação nas 4 abas do catálogo.
 */
export function buildCatalogStockAndStatusColumns<
  T extends { id: string; active?: boolean; unitMeasure?: string },
>({
  stockByMaterialId,
  hideStockAlert,
  defaultUnitMeasure,
  statusDataCy,
}: StockColumnsConfig): readonly CatalogTableColumn<T>[] {
  const columns: CatalogTableColumn<T>[] = [
    {
      header: 'Físico',
      align: 'right',
      className: 'whitespace-nowrap font-data-mono tabular-nums',
      accessor: (row: T) => {
        const snap = resolveRowSnapshot(row, stockByMaterialId, defaultUnitMeasure);
        return (
          <span data-testid={`stock-physical-${row.id}`} className="text-on-surface">
            {formatStockQuantity(snap.physicalQuantity, snap.unitMeasure)}
          </span>
        );
      },
      exportValue: (row: T) => {
        const snap = resolveRowSnapshot(row, stockByMaterialId, defaultUnitMeasure);
        return formatStockQuantity(snap.physicalQuantity, snap.unitMeasure);
      },
    },
    {
      header: 'Reservado',
      align: 'right',
      className: 'whitespace-nowrap font-data-mono tabular-nums',
      accessor: (row: T) => {
        const snap = resolveRowSnapshot(row, stockByMaterialId, defaultUnitMeasure);
        return (
          <span data-testid={`stock-reserved-${row.id}`} className="text-on-surface-variant">
            {formatStockQuantity(snap.reservedQuantity, snap.unitMeasure)}
          </span>
        );
      },
      exportValue: (row: T) => {
        const snap = resolveRowSnapshot(row, stockByMaterialId, defaultUnitMeasure);
        return formatStockQuantity(snap.reservedQuantity, snap.unitMeasure);
      },
    },
    {
      header: 'Disponível',
      align: 'right',
      className: 'whitespace-nowrap font-data-mono tabular-nums',
      accessor: (row: T) => {
        const snap = resolveRowSnapshot(row, stockByMaterialId, defaultUnitMeasure);
        return (
          <span
            data-testid={`stock-available-${row.id}`}
            className={`font-bold ${AVAILABLE_TEXT_CLASSES[snap.displayStatus]}`}
          >
            {formatStockQuantity(snap.availableQuantity, snap.unitMeasure)}
          </span>
        );
      },
      exportValue: (row: T) => {
        const snap = resolveRowSnapshot(row, stockByMaterialId, defaultUnitMeasure);
        return formatStockQuantity(snap.availableQuantity, snap.unitMeasure);
      },
    },
  ];

  if (!hideStockAlert) {
    columns.push({
      header: 'Alerta Estoque',
      align: 'center',
      className: 'whitespace-nowrap',
      accessor: (row: T) => {
        const snap = resolveRowSnapshot(row, stockByMaterialId, defaultUnitMeasure);
        return (
          <StockAlertBadge
            variant="catalog"
            status={snap.displayStatus}
            availableQuantity={snap.availableQuantity}
            unitMeasure={snap.unitMeasure}
          />
        );
      },
      exportValue: (row: T) => {
        const snap = resolveRowSnapshot(row, stockByMaterialId, defaultUnitMeasure);
        if (snap.displayStatus === 'NEED_PURCHASE') {
          return `Falta ${formatStockQuantity(Math.abs(snap.availableQuantity), snap.unitMeasure)}`;
        }
        if (snap.displayStatus === 'ORDER_POINT') return 'Ponto de Pedido';
        if (snap.displayStatus === 'NO_BALANCE') return 'Sem Saldo';
        return 'Em Estoque';
      },
    });
  }

  columns.push({
    header: 'Status',
    align: 'center',
    accessor: (row: T) => (
      <span
        data-cy={statusDataCy}
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
          row.active
            ? 'border border-success/30 bg-success/10 text-success'
            : 'border border-error/30 bg-error/10 text-error'
        }`}
      >
        {row.active ? 'Ativo' : 'Inativo'}
      </span>
    ),
    exportValue: (row: T) => (row.active ? 'Ativo' : 'Inativo'),
  });

  return columns;
}
