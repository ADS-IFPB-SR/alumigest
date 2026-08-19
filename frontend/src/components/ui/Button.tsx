import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
 variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success';
 icon?: string;
}

export function Button({ variant = 'primary', icon, children, className = '', ...props }: ButtonProps) {
 const baseClasses ="shrink-0 flex items-center justify-center gap-xs px-md py-xs sm:py-sm rounded-md font-label text-label-bold text-xs sm:text-body-sm transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
 
 const variants = {
 primary:"bg-primary text-on-primary hover:bg-primary-container shadow-sm",
 secondary:"bg-surface-container-high text-on-surface hover:bg-surface-container-highest",
 outline:"border border-outline bg-transparent text-primary hover:bg-surface-container-low",
 ghost:"bg-transparent text-secondary hover:bg-surface-container-high shadow-none",
 success:"bg-success text-white hover:bg-success/90 shadow-sm",
 };

 return (
 <button className={`${baseClasses} ${variants[variant]} ${className}`} {...props}>
 {icon && <span className="material-symbols-outlined text-[18px]">{icon}</span>}
 {children}
 </button>
 );
}
