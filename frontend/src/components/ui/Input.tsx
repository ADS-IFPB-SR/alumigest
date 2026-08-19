import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
 label: string;
 error?: string;
 unit?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
 ({ label, error, unit, className = '', ...props }, ref) => {
 return (
 <div className="flex flex-col gap-xs w-full">
 <label className="font-label-bold text-label-bold text-on-surface text-xs">{label}</label>
 <div className="relative">
 <input
 ref={ref}
 className={`w-full px-sm py-xs bg-surface-container-low border ${
 error ? 'border-error' : 'border-outline-variant '
 } rounded-sm font-body-sm text-body-sm text-on-surface focus:border-primary :border-primary-fixed focus:border-2 focus:outline-none focus:ring-0 transition-all ${
 unit ? 'pr-xl' : ''
 } ${className}`}
 {...props}
 />
 {unit && (
 <span className="absolute right-sm top-1/2 -translate-y-1/2 font-data-mono text-data-mono text-on-surface-variant pointer-events-none text-xs">
 {unit}
 </span>
 )}
 </div>
 {error && <span className="font-body-sm text-body-sm text-error">{error}</span>}
 </div>
 );
 }
);
Input.displayName = 'Input';
