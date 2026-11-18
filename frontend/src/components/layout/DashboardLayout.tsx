import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function DashboardLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('alumigest_sidebar_collapsed') === 'true';
  });

  const handleToggleCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('alumigest_sidebar_collapsed', String(next));
      return next;
    });
  };

  return (
    <div className="bg-background text-on-background font-body text-body-md antialiased overflow-hidden flex h-screen transition-colors duration-200">
      <Sidebar 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background relative min-w-0">
        <Topbar onMenuClick={() => setIsMobileMenuOpen(true)} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto w-full relative scroll-smooth">
          <div className="min-h-full flex flex-col w-full h-full p-2.5 sm:p-4 lg:p-5 transition-all duration-300">
            <div className="flex-1 w-full bg-surface-container-lowest border border-outline-variant rounded-xl sm:rounded-2xl shadow-sm sm:shadow-md overflow-hidden relative group hover:shadow-lg transition-all duration-300 ease-out p-4 sm:p-5 lg:p-6 flex flex-col min-w-0">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
