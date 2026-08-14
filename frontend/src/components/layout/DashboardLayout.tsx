import { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { path: '/kanban', label: 'Kanban', icon: 'view_kanban' },
  { path: '/', label: 'Catálogo de Materiais', icon: 'inventory_2' },
  { path: '/estoque', label: 'Estoque', icon: 'inventory' },
  { path: '/produtos', label: 'Produtos', icon: 'category' },
  { path: '/clientes', label: 'Clientes', icon: 'group' },
  { path: '/financeiro', label: 'Financeiro', icon: 'payments' },
  { path: '/configuracoes', label: 'Configurações', icon: 'settings' },
];

export function DashboardLayout() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <div className="bg-background dark:bg-[#121a24] text-on-background dark:text-inverse-on-surface font-body text-body-md antialiased overflow-hidden flex h-screen transition-colors duration-200">
      
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <button 
          type="button"
          aria-label="Fechar menu"
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden fixed inset-0 w-full h-full bg-black/60 z-30 backdrop-blur-sm transition-opacity cursor-default border-none"
        />
      )}

      {/* SideNavBar - Light mode matches image, Dark mode supported */}
      <aside className={`
        fixed lg:static top-0 left-0 h-screen p-md gap-sm bg-[#edf0f5] dark:bg-[#0a1424] border-r border-[#d8dadc] dark:border-outline/20 z-40 shrink-0 w-64 flex flex-col transition-transform duration-300 ease-in-out shadow-xs
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="flex items-center justify-between px-xs mb-sm">
          <div>
            <h1 className="font-headline text-headline-md font-bold text-[#191c1e] dark:text-white leading-tight tracking-tight">
              Gestão de Esquadrias
            </h1>
            <p className="font-body text-xs text-[#505f76] dark:text-[#8393b5] font-normal">
              Gestão de Vidros e Alumínio
            </p>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-xs text-secondary dark:text-[#8393b5] hover:bg-[#e2e6eb] dark:hover:bg-[#1b2b48] rounded-full"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* 1. Novo Orçamento Action Button */}
        <div className="mb-sm">
          <button className="w-full flex items-center justify-center gap-xs px-md py-sm bg-[#041632] hover:bg-[#1b2b48] text-white rounded-md font-label text-label-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Novo Orçamento</span>
          </button>
        </div>

        {/* 2-9. Navigation Items in Exact Required Order */}
        <nav className="flex-1 flex flex-col gap-xs overflow-y-auto">
          {navItems.map((item) => (
            <NavLink 
              key={item.path}
              to={item.path} 
              onClick={() => setIsMobileMenuOpen(false)}
              className={({isActive}) => `
                flex items-center gap-sm px-sm py-sm rounded-md transition-all duration-200 ease-in-out font-medium text-xs sm:text-body-sm
                ${isActive 
                  ? 'bg-[#041632] dark:bg-[#1b2b48] text-white shadow-xs font-semibold' 
                  : 'text-[#44474d] dark:text-[#b7c7eb] hover:bg-[#e2e6eb] dark:hover:bg-[#1b2b48]/60 hover:text-[#191c1e] dark:hover:text-white'
                }
              `}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span className="font-body">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer Items */}
        <div className="mt-auto flex flex-col gap-xs border-t border-[#d8dadc] dark:border-[#1b2b48] pt-sm">
          <button className="flex items-center gap-sm px-sm py-xs text-[#505f76] dark:text-[#8393b5] hover:text-[#191c1e] dark:hover:text-white hover:bg-[#e2e6eb] dark:hover:bg-[#1b2b48] rounded-md transition-colors text-xs cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">support</span>
            <span className="font-body">Suporte</span>
          </button>
          <button className="flex items-center gap-sm px-sm py-xs text-[#505f76] dark:text-[#8393b5] hover:text-[#191c1e] dark:hover:text-white hover:bg-[#e2e6eb] dark:hover:bg-[#1b2b48] rounded-md transition-colors text-xs cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span className="font-body">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background dark:bg-[#121a24] relative">
        
        {/* TopNavBar */}
        <header className="bg-surface-container-lowest dark:bg-[#182230] relative z-10 w-full top-0 border-b border-outline-variant/60 dark:border-outline/20 shadow-xs">
          <div className="flex justify-between items-center w-full px-sm sm:px-margin-desktop h-16 max-w-container-max mx-auto gap-sm">
            
            {/* Mobile Menu Toggle Button */}
            <div className="flex items-center gap-sm">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden text-primary dark:text-inverse-on-surface p-xs hover:bg-surface-container-high dark:hover:bg-surface-variant/20 rounded-md transition-colors"
                aria-label="Abrir menu"
              >
                <span className="material-symbols-outlined text-[24px]">menu</span>
              </button>
              <h2 className="font-headline text-title-sm font-bold text-primary dark:text-inverse-on-surface">
                AlumiGest <span className="font-normal text-xs text-secondary dark:text-outline-variant font-body">ERP</span>
              </h2>
            </div>

            {/* Search and Top Right Icons */}
            <div className="flex items-center gap-xs sm:gap-sm ml-auto">
              {/* Desktop Theme Toggle and Notifications */}
              <button 
                onClick={toggleTheme}
                className="p-xs sm:p-xs text-secondary dark:text-inverse-on-surface hover:bg-surface-container-high dark:hover:bg-surface-variant/30 rounded-full transition-colors flex items-center justify-center cursor-pointer"
                title={isDarkMode ? "Modo Claro" : "Modo Escuro"}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {isDarkMode ? 'light_mode' : 'dark_mode'}
                </span>
              </button>

              {/* Notification Icon */}
              <button 
                className="p-xs text-secondary dark:text-inverse-on-surface hover:bg-surface-container-high dark:hover:bg-surface-variant/30 rounded-full transition-colors flex items-center justify-center relative cursor-pointer"
                title="Notificações"
              >
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full" />
              </button>

              {/* User Profile Avatar Toggle */}
              <div className="flex items-center gap-xs cursor-pointer hover:opacity-80 transition-opacity pl-xs sm:pl-sm border-l border-outline-variant/60 dark:border-outline/30">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant dark:border-outline/40">
                  <img 
                    alt="Avatar do Usuário" 
                    className="w-full h-full object-cover" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDR_l-Rq7INLVZkQHJUKyYCu-r-o2SBnKu5msdlCb1B1CMk2wbzDVlKx_P-pVcQu0WF23cSWAgxu7THsKJLWzmn_yZPeyadpnIt8ylj-wn5eJ36s_Fq34x8iSaxYfqm90xf7P4ANeuF-pxqBciEAGrGS2nRPMegoNaVOiPRWKXxDKvWvM5YQ9ZaYpvP7C7qAmV0vJtvzNwNgwL83roZRMZfQoXQG_JzOr3tL9SHzD4AsiWip8jNAfha" 
                  />
                </div>
                <span className="hidden md:inline font-body font-medium text-primary dark:text-inverse-on-surface text-xs">
                  Admin
                </span>
              </div>

            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-xs sm:p-md md:p-margin-desktop relative z-10 max-w-container-max mx-auto w-full flex flex-col h-full overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
