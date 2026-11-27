import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

const SIDEBAR_COLLAPSED_STORAGE_KEY = 'alumigest_sidebar_collapsed';

function readSidebarCollapsed(): boolean {
  try {
    return globalThis.localStorage?.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function persistSidebarCollapsed(value: boolean): void {
  try {
    globalThis.localStorage?.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, String(value));
  } catch {
    // Ignora falha de armazenamento em ambientes restritos
  }
}

export function DashboardLayout() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(readSidebarCollapsed);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleToggleCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      persistSidebarCollapsed(next);
      return next;
    });
  };

  return (
    <div
      data-testid="dashboard-layout"
      className="bg-background text-on-background font-body text-body-md antialiased overflow-hidden flex h-screen transition-colors duration-200"
    >
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
