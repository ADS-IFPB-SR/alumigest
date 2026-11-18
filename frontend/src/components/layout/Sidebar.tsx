import { NavLink, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { path: '/orcamentos', label: 'Orçamentos', icon: 'receipt_long' },
  { path: '/ordens-servico', label: 'Ordens de Serviço', icon: 'assignment' },
  { path: '/producao', label: 'Produção (Kanban)', icon: 'precision_manufacturing' },
  { path: '/', label: 'Catálogo de Materiais', icon: 'inventory_2' },
  { path: '/vendas/avulsa', label: 'Venda Avulsa', icon: 'shopping_cart' },
  { path: '/estoque', label: 'Estoque', icon: 'inventory' },
  { path: '/produtos', label: 'Produtos', icon: 'category' },
  { path: '/clientes', label: 'Clientes', icon: 'group' },
  { path: '/financeiro', label: 'Financeiro', icon: 'payments' },
  { path: '/configuracoes', label: 'Configurações', icon: 'settings' },
];

interface SidebarProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly isCollapsed?: boolean;
  readonly onToggleCollapse?: () => void;
}

export function Sidebar({ isOpen, onClose, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const location = useLocation();

  const isItemActive = (itemPath: string, isNavLinkActive: boolean) => {
    if (itemPath === '/') {
      return location.pathname === '/';
    }
    if (itemPath === '/ordens-servico') {
      return isNavLinkActive || location.pathname.startsWith('/ordens-servico') || location.pathname.startsWith('/pedidos') || location.pathname.startsWith('/work-orders');
    }
    if (itemPath === '/vendas/avulsa') {
      return isNavLinkActive || location.pathname.startsWith('/vendas');
    }
    return isNavLinkActive || location.pathname.startsWith(itemPath);
  };

  return (
    <>
      {isOpen && (
        <button 
          type="button"
          onClick={onClose}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClose(); }}
          aria-label="Fechar menu"
          className="lg:hidden fixed inset-0 bg-black/60 z-30 backdrop-blur-sm transition-opacity w-full h-full cursor-default"
        />
      )}

      <aside className={`
        fixed lg:static top-0 left-0 h-screen p-md gap-sm bg-surface-container-lowest border-r border-outline-variant z-40 shrink-0 flex flex-col transition-all duration-300 ease-in-out shadow-xs
        ${isCollapsed ? 'lg:w-16 lg:px-2' : 'lg:w-64'}
        w-64
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center flex-col gap-2' : 'justify-between'} px-xs mb-sm`}>
          {!isCollapsed ? (
            <div>
              <h1 className="font-headline text-headline-md font-bold text-on-surface leading-tight tracking-tight">
                Gestão de Esquadrias
              </h1>
              <p className="font-body text-xs text-on-surface-variant font-normal">
                Gestão de Vidros e Alumínio
              </p>
            </div>
          ) : (
            <div className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm" title="Gestão de Esquadrias">
              GE
            </div>
          )}

          <div className="flex items-center gap-1">
            {onToggleCollapse && (
              <button
                type="button"
                data-testid="btn-toggle-sidebar"
                onClick={onToggleCollapse}
                title={isCollapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
                aria-label={isCollapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
                className="hidden lg:flex p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-md transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isCollapsed ? 'chevron_right' : 'chevron_left'}
                </span>
              </button>
            )}
            <button 
              type="button" 
              onClick={onClose}
              className="lg:hidden p-xs text-on-surface-variant hover:bg-surface-container-high rounded-full"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-xs overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => (
            <NavLink 
              key={item.path}
              to={item.path} 
              onClick={onClose}
              title={isCollapsed ? item.label : undefined}
              className={({isActive}) => {
                const active = isItemActive(item.path, isActive);
                return `
                flex items-center ${isCollapsed ? 'justify-center px-1' : 'gap-sm px-sm'} py-sm rounded-md transition-all duration-200 ease-in-out font-medium text-xs sm:text-body-sm
                ${active 
                  ? 'bg-primary text-on-primary shadow-xs font-semibold' 
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }
              `;
              }}
            >
              <span className="material-symbols-outlined text-[20px] shrink-0">{item.icon}</span>
              {!isCollapsed && <span className="font-body truncate">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-xs border-t border-outline-variant pt-sm">
          <button 
            type="button" 
            title={isCollapsed ? 'Suporte' : undefined}
            className={`flex items-center ${isCollapsed ? 'justify-center px-1' : 'gap-sm px-sm'} py-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-md transition-colors text-xs cursor-pointer`}
          >
            <span className="material-symbols-outlined text-[18px] shrink-0">support</span>
            {!isCollapsed && <span className="font-body">Suporte</span>}
          </button>
          <button 
            type="button" 
            title={isCollapsed ? 'Sair' : undefined}
            className={`flex items-center ${isCollapsed ? 'justify-center px-1' : 'gap-sm px-sm'} py-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-md transition-colors text-xs cursor-pointer`}
          >
            <span className="material-symbols-outlined text-[18px] shrink-0">logout</span>
            {!isCollapsed && <span className="font-body">Sair</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
