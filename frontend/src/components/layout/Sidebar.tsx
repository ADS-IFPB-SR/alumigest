import { NavLink, useNavigate } from 'react-router-dom';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { path: '/orcamentos', label: 'Orçamentos', icon: 'description' },
  { path: '/kanban', label: 'Kanban', icon: 'view_kanban' },
  { path: '/', label: 'Catálogo de Materiais', icon: 'inventory_2' },
  { path: '/estoque', label: 'Estoque', icon: 'inventory' },
  { path: '/produtos', label: 'Produtos', icon: 'category' },
  { path: '/clientes', label: 'Clientes', icon: 'group' },
  { path: '/financeiro', label: 'Financeiro', icon: 'payments' },
  { path: '/configuracoes', label: 'Configurações', icon: 'settings' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <button 
          onClick={onClose}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClose(); }}
          aria-label="Fechar menu"
          className="lg:hidden fixed inset-0 bg-black/60 z-30 backdrop-blur-sm transition-opacity w-full h-full cursor-default"
        />
      )}

      {/* SideNavBar */}
      <aside className={`
        fixed lg:static top-0 left-0 h-screen p-md gap-sm bg-surface-container-lowest border-r border-outline-variant z-40 shrink-0 w-64 flex flex-col transition-transform duration-300 ease-in-out shadow-xs
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="flex items-center justify-between px-xs mb-sm">
          <div>
            <h1 className="font-headline text-headline-md font-bold text-on-surface leading-tight tracking-tight">
              Gestão de Esquadrias
            </h1>
            <p className="font-body text-xs text-on-surface-variant font-normal">
              Gestão de Vidros e Alumínio
            </p>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden p-xs text-on-surface-variant hover:bg-surface-container-high rounded-full"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* 1. Novo Orçamento Action Button */}
        <div className="mb-sm">
          <button
            onClick={() => { navigate('/orcamentos/novo'); onClose(); }}
            className="w-full flex items-center justify-center gap-xs px-md py-sm bg-primary hover:opacity-90 text-on-primary rounded-md font-label text-label-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
          >
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
              onClick={onClose}
              className={({isActive}) => `
                flex items-center gap-sm px-sm py-sm rounded-md transition-all duration-200 ease-in-out font-medium text-xs sm:text-body-sm
                ${isActive 
                  ? 'bg-primary text-on-primary shadow-xs font-semibold' 
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }
              `}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span className="font-body">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer Items */}
        <div className="mt-auto flex flex-col gap-xs border-t border-outline-variant pt-sm">
          <button className="flex items-center gap-sm px-sm py-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-md transition-colors text-xs cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">support</span>
            <span className="font-body">Suporte</span>
          </button>
          <button className="flex items-center gap-sm px-sm py-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-md transition-colors text-xs cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span className="font-body">Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
}
