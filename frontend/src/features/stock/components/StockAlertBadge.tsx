import React, { useRef, useState } from 'react';
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
    placement: 'top' | 'bottom';
  } | null>(null);

  const badgeRef = useRef<HTMLSpanElement>(null);
  const effectiveTooltip = tooltip || title;

  const handleMouseEnter = () => {
    if (badgeRef.current) {
      const rect = badgeRef.current.getBoundingClientRect();
      const isCloseToTop = rect.top < 60;
      setTooltipCoords({
        top: isCloseToTop ? rect.bottom + 6 : rect.top - 6,
        left: rect.left + rect.width / 2,
        placement: isCloseToTop ? 'bottom' : 'top',
      });
    }
    setShowHoverTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowHoverTooltip(false);
    setTooltipCoords(null);
  };

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
        tooltipCoords &&
        typeof document !== 'undefined' &&
        createPortal(
          <span
            role="tooltip"
            data-testid="stock-alert-tooltip"
            style={{
              position: 'fixed',
              top: `${tooltipCoords.top}px`,
              left: `${tooltipCoords.left}px`,
              transform:
                tooltipCoords.placement === 'top'
                  ? 'translate(-50%, -100%)'
                  : 'translate(-50%, 0)',
            }}
            className="px-2.5 py-1.5 text-[11px] font-normal bg-slate-900 text-white rounded-md shadow-lg z-[9999] whitespace-pre pointer-events-none text-left max-w-xs sm:max-w-md"
          >
            {effectiveTooltip}
          </span>,
          document.body
        )}
    </>
  );
};
