import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success';
  icon?: string;
}

export function Button({ variant = 'primary', icon, children, className = '', ...props }: ButtonProps) {
  const baseClasses = "shrink-0 flex items-center justify-center gap-xs px-md py-xs sm:py-sm rounded-md font-label text-label-bold text-xs sm:text-body-sm transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary dark:bg-primary-container text-white hover:bg-primary-container dark:hover:bg-primary/80 shadow-sm",
    secondary: "bg-surface-container-high dark:bg-surface-variant/30 text-on-surface dark:text-inverse-on-surface hover:bg-surface-container-highest dark:hover:bg-surface-variant/50",
    outline: "border border-outline-variant dark:border-outline/40 bg-surface-container-lowest dark:bg-[#182230] text-primary dark:text-inverse-on-surface hover:bg-surface-container-low dark:hover:bg-surface-variant/30",
    ghost: "bg-transparent text-secondary dark:text-outline-variant hover:bg-surface-container-high dark:hover:bg-surface-variant/30 shadow-none",
    success: "bg-success text-white hover:bg-success/90 shadow-sm",
  };

  return (
    <button className={`${baseClasses} ${variants[variant]} ${className}`} {...props}>
      {icon && <span className="material-symbols-outlined text-[18px]">{icon}</span>}
      {children}
    </button>
  );
}
