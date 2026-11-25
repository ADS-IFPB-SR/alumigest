import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { StockDisplayAlertStatus } from '../types';
import { formatStockQuantity } from '../utils/stockPresentation';

export type StockAlertBadgeVariant = 'default' | 'kanban' | 'catalog';

export interface StockAlertBadgeProps {
  status: StockDisplayAlertStatus;
  availableQuantity?: number;
  unitMeasure?: string;
  className?: string;
  variant?: StockAlertBadgeVariant;
  label?: string;
  tooltip?: string;
  title?: string;
}

interface BadgeStyleConfig {
  readonly testId: string;
  readonly containerClass: string;
  readonly dotClass: string;
}

const BADGE_STYLES: Readonly<Record<StockDisplayAlertStatus, BadgeStyleConfig>> = {
  NEED_PURCHASE: {
    testId: 'badge-stock-need-purchase',
    containerClass:
      'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30',
    dotClass: 'bg-rose-500 animate-pulse',
  },
  ORDER_POINT: {
    testId: 'badge-stock-order-point',
    containerClass:
      'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
    dotClass: 'bg-amber-500',
  },
  IN_STOCK: {
    testId: 'badge-stock-in-stock',
    containerClass:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
    dotClass: 'bg-emerald-500',
  },
  NO_BALANCE: {
    testId: 'badge-stock-no-balance',
    containerClass:
      'bg-surface-container text-on-surface-variant border-outline-variant',
    dotClass: 'bg-slate-400 dark:bg-slate-500',
  },
};

const IN_STOCK_LABELS: Readonly<Record<StockAlertBadgeVariant, string>> = {
  kanban: 'Insumos Disponíveis',
  catalog: 'Em Estoque',
  default: 'Em Dia',
};

function resolveNeedPurchaseLabel(
  variant: StockAlertBadgeVariant,
  availableQuantity?: number,
  unitMeasure = ''
): string {
  if (variant === 'kanban') {
    return 'Falta Insumo / Comprar';
  }

  const hasDeficit = availableQuantity !== undefined && availableQuantity < 0;
  if (variant === 'catalog') {
    return hasDeficit
      ? `Falta ${formatStockQuantity(Math.abs(availableQuantity), unitMeasure)}`
      : 'Falta Insumo';
  }

  if (!hasDeficit) {
    return 'Comprar';
  }
  const unitSuffix = unitMeasure ? ` ${unitMeasure}` : '';
  return `Comprar (${Math.abs(availableQuantity)}${unitSuffix})`;
}

function resolveBadgeLabel(
  status: StockDisplayAlertStatus,
  variant: StockAlertBadgeVariant,
  availableQuantity?: number,
  unitMeasure = '',
  customLabel?: string
): string {
  if (customLabel) {
    return customLabel;
  }
  if (status === 'NO_BALANCE') {
    return 'Sem Saldo';
  }
  if (status === 'ORDER_POINT') {
    return 'Ponto de Pedido';
  }
  if (status === 'IN_STOCK') {
    return IN_STOCK_LABELS[variant];
  }
  return resolveNeedPurchaseLabel(variant, availableQuantity, unitMeasure);
}

export const StockAlertBadge: React.FC<StockAlertBadgeProps> = ({
  status,
  availableQuantity,
  unitMeasure = '',
  className = '',
  variant = 'default',
  label,
  tooltip,
  title,
}) => {
  const [showHoverTooltip, setShowHoverTooltip] = useState(false);
  const [tooltipCoords, setTooltipCoords] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const badgeRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const effectiveTooltip = tooltip || title;

  const updateTooltipPosition = useCallback(() => {
    if (!badgeRef.current || typeof window === 'undefined') return;
    const badgeRect = badgeRef.current.getBoundingClientRect();

    const tooltipEl = tooltipRef.current;
    const tooltipWidth = tooltipEl ? tooltipEl.offsetWidth || 280 : 280;
    const tooltipHeight = tooltipEl ? tooltipEl.offsetHeight || 60 : 60;

    const viewportWidth = window.innerWidth || 1024;
    const viewportHeight = window.innerHeight || 768;
    const PADDING = 8;
    const GAP = 6;

    const spaceAbove = badgeRect.top;
    const spaceBelow = viewportHeight - badgeRect.bottom;

    let top: number;
    if (spaceAbove >= tooltipHeight + GAP + PADDING) {
      top = badgeRect.top - tooltipHeight - GAP;
    } else if (spaceBelow >= tooltipHeight + GAP + PADDING) {
      top = badgeRect.bottom + GAP;
    } else if (spaceAbove >= spaceBelow) {
      top = Math.max(PADDING, badgeRect.top - tooltipHeight - GAP);
    } else {
      top = Math.min(viewportHeight - tooltipHeight - PADDING, badgeRect.bottom + GAP);
    }

    let left = badgeRect.left + (badgeRect.width - tooltipWidth) / 2;
    if (left < PADDING) {
      left = PADDING;
    } else if (left + tooltipWidth > viewportWidth - PADDING) {
      left = Math.max(PADDING, viewportWidth - tooltipWidth - PADDING);
    }

    setTooltipCoords({ top, left });
  }, []);

  const handleMouseEnter = () => {
    updateTooltipPosition();
    setShowHoverTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowHoverTooltip(false);
    setTooltipCoords(null);
  };

  useLayoutEffect(() => {
    if (showHoverTooltip) {
      updateTooltipPosition();
    }
  }, [showHoverTooltip, effectiveTooltip, updateTooltipPosition]);

  useEffect(() => {
    if (!showHoverTooltip) return;
    const handleReposition = () => {
      updateTooltipPosition();
    };
    window.addEventListener('scroll', handleReposition, true);
    window.addEventListener('resize', handleReposition);
    return () => {
      window.removeEventListener('scroll', handleReposition, true);
      window.removeEventListener('resize', handleReposition);
    };
  }, [showHoverTooltip, updateTooltipPosition]);

  const style = BADGE_STYLES[status] || BADGE_STYLES.IN_STOCK;
  const resolvedLabel = resolveBadgeLabel(
    status,
    variant,
    availableQuantity,
    unitMeasure,
    label
  );

  return (
    <>
      <span
        ref={badgeRef}
        data-testid={style.testId}
        title={effectiveTooltip}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border cursor-default whitespace-nowrap shrink-0 ${style.containerClass} ${className}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dotClass}`} aria-hidden="true" />
        <span>{resolvedLabel}</span>
      </span>

      {showHoverTooltip &&
        effectiveTooltip &&
        typeof document !== 'undefined' &&
        createPortal(
          <span
            ref={tooltipRef}
            role="tooltip"
            data-testid="stock-alert-tooltip"
            style={{
              position: 'fixed',
              top: tooltipCoords ? `${tooltipCoords.top}px` : '-9999px',
              left: tooltipCoords ? `${tooltipCoords.left}px` : '-9999px',
              visibility: tooltipCoords ? 'visible' : 'hidden',
            }}
            className="px-2.5 py-1.5 text-[11px] font-normal bg-slate-900 text-white rounded-md shadow-xl z-[99999] whitespace-pre-wrap break-words pointer-events-none text-left max-w-xs sm:max-w-sm"
          >
            {effectiveTooltip}
          </span>,
          document.body
        )}
    </>
  );
};
