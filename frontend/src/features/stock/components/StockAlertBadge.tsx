import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { StockAlertStatus } from '../types';

export interface StockAlertBadgeProps {
  status: StockAlertStatus;
  availableQuantity?: number;
  unitMeasure?: string;
  className?: string;
  variant?: 'default' | 'kanban';
  label?: string;
  tooltip?: string;
  title?: string;
}

interface StatusConfig {
  testId: string;
  badgeClass: string;
  dotClass: string;
  getDefaultLabel: (opts: {
    variant: 'default' | 'kanban';
    availableQuantity?: number;
    unitMeasure?: string;
  }) => string;
}

const STATUS_CONFIG: Record<StockAlertStatus, StatusConfig> = {
  NEED_PURCHASE: {
    testId: 'badge-stock-need-purchase',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    dotClass: 'bg-rose-500 animate-pulse',
    getDefaultLabel: ({ variant, availableQuantity, unitMeasure }) => {
      if (variant === 'kanban') {
        return 'Falta Insumo / Comprar';
      }
      if (availableQuantity !== undefined && availableQuantity < 0) {
        const absQty = Math.abs(availableQuantity);
        const unit = unitMeasure ? ` ${unitMeasure}` : '';
        return `Comprar (${absQty}${unit})`;
      }
      return 'Comprar';
    },
  },
  ORDER_POINT: {
    testId: 'badge-stock-order-point',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    dotClass: 'bg-amber-500',
    getDefaultLabel: () => 'Ponto de Pedido',
  },
  IN_STOCK: {
    testId: 'badge-stock-in-stock',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotClass: 'bg-emerald-500',
    getDefaultLabel: ({ variant }) => (variant === 'kanban' ? 'Insumos Disponíveis' : 'Em Dia'),
  },
};

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

  const config = STATUS_CONFIG[status] || STATUS_CONFIG.IN_STOCK;
  const displayLabel = label || config.getDefaultLabel({ variant, availableQuantity, unitMeasure });

  return (
    <>
      <span
        ref={badgeRef}
        data-testid={config.testId}
        title={effectiveTooltip}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border cursor-default whitespace-nowrap shrink-0 ${config.badgeClass} ${className}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
        <span>{displayLabel}</span>
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
