import React from 'react';

export interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-xs w-full">
        <label className="font-label-bold text-label-bold text-on-surface dark:text-inverse-on-surface text-xs">
          {label}
        </label>
        <div className="relative">
          <select
            ref={ref}
            className={`w-full px-sm py-xs bg-surface-container-low dark:bg-surface-container-high/20 border appearance-none ${
              error ? 'border-error' : 'border-outline-variant dark:border-outline/40'
            } rounded-sm font-body-sm text-body-sm text-on-surface dark:text-inverse-on-surface focus:border-primary dark:focus:border-primary-fixed focus:border-2 focus:outline-none focus:ring-0 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
            {...props}
          >
            <option value="" disabled className="dark:bg-[#182230] dark:text-inverse-on-surface">
              Selecione...
            </option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="dark:bg-[#182230] dark:text-inverse-on-surface">
                {opt.label}
              </option>
            ))}
          </select>
          <span className="absolute right-sm top-1/2 -translate-y-1/2 pointer-events-none material-symbols-outlined text-[18px] text-on-surface-variant dark:text-outline-variant">
            expand_more
          </span>
        </div>
        {error && <span className="font-body-sm text-body-sm text-error">{error}</span>}
      </div>
    );
  }
);
Select.displayName = 'Select';