import { useState, useEffect, useRef } from 'react';
import type { BudgetStatus } from '../types';
import { BUDGET_STATUS_OPTIONS } from '../types';

interface BudgetsFiltersProps {
  activeStatus: BudgetStatus | '';
  searchTerm: string;
  statusCounts?: Record<BudgetStatus | '', number>;
  onStatusChange: (status: BudgetStatus | '') => void;
  onSearchChange: (search: string) => void;
}

export function BudgetsFilters({
  activeStatus,
  searchTerm,
  statusCounts,
  onStatusChange,
  onSearchChange,
}: BudgetsFiltersProps) {
  const [localSearch, setLocalSearch] = useState(searchTerm);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      onSearchChange(localSearch);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [localSearch, onSearchChange]);

  useEffect(() => {
    setLocalSearch(searchTerm);
  }, [searchTerm]);

  return (
    <div className="flex flex-col gap-sm">
      <div className="flex overflow-x-auto no-scrollbar scrollbar-none gap-xs border-b border-outline-variant pb-px">
        {BUDGET_STATUS_OPTIONS.map((option) => {
          const isActive = activeStatus === option.value;
          const count = statusCounts?.[option.value];

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onStatusChange(option.value)}
              className={`flex items-center gap-xs px-md py-sm font-label text-sm whitespace-nowrap transition-all border-b-2 font-medium cursor-pointer ${
                isActive
                  ? 'text-primary border-primary font-bold bg-surface-container rounded-t-md'
                  : 'text-secondary border-transparent hover:text-primary hover:bg-surface-container-high'
              }`}
            >
              <span>{option.label}</span>
              {count !== undefined && (
                <span
                  className={`inline-flex items-center justify-center min-w-[20px] h-5 px-xs rounded-full text-[10px] font-data-mono font-bold ${
                    isActive
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container-high text-secondary'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="relative w-full sm:max-w-sm">
        <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-[18px] text-secondary pointer-events-none">
          search
        </span>
        <input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Buscar por código ou cliente..."
          className="w-full pl-xl pr-sm py-xs bg-surface-container-low border border-outline-variant rounded-md font-body text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:border-2 focus:outline-none focus:ring-0 transition-all"
        />
        {localSearch && (
          <button
            type="button"
            onClick={() => setLocalSearch('')}
            className="absolute right-sm top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        )}
      </div>
    </div>
  );
}
