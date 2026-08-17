import { useState, useEffect } from 'react';

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  return (
    <header className="bg-surface-container-lowest relative z-10 w-full top-0 border-b border-outline-variant shadow-xs">
      <div className="flex justify-between items-center w-full px-sm sm:px-margin-desktop h-16 max-w-container-max mx-auto gap-sm">
        
        {/* Mobile Menu Toggle Button */}
        <div className="flex items-center gap-sm">
          <button 
            onClick={onMenuClick}
            className="lg:hidden text-primary p-xs hover:bg-surface-container-high rounded-md transition-colors"
            aria-label="Abrir menu"
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>
          <h2 className="font-headline text-title-sm font-bold text-primary">
            AlumiGest <span className="font-normal text-xs text-secondary font-body">ERP</span>
          </h2>
        </div>

        {/* Search and Top Right Icons */}
        <div className="flex items-center gap-xs sm:gap-sm ml-auto">
          {/* Desktop Theme Toggle and Notifications */}
          <button 
            onClick={toggleTheme}
            className="p-xs sm:p-xs text-secondary hover:bg-surface-container-high rounded-full transition-colors flex items-center justify-center cursor-pointer"
            title={isDarkMode ? "Modo Claro" : "Modo Escuro"}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isDarkMode ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {/* Notification Icon */}
          <button className="relative p-xs sm:p-xs text-secondary hover:bg-surface-container-high rounded-full transition-colors flex items-center justify-center cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full border-2 border-surface-container-lowest"></span>
          </button>

          <div className="w-px h-6 bg-outline-variant mx-xs"></div>

          {/* User Profile */}
          <button className="flex items-center gap-sm hover:bg-surface-container-high p-xs sm:p-xs rounded-md transition-colors cursor-pointer group">
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs shadow-sm overflow-hidden group-hover:border-primary transition-colors">
              <span className="material-symbols-outlined text-[20px]">person</span>
            </div>
            <div className="hidden sm:flex flex-col items-start leading-none">
              <span className="text-body-sm font-semibold text-on-surface group-hover:text-primary transition-colors">Admin</span>
              <span className="text-[10px] text-on-surface-variant">Gerente</span>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant text-[16px] hidden sm:block">expand_more</span>
          </button>
        </div>
      </div>
    </header>
  );
}
