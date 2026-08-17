import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function DashboardLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="bg-background text-on-background font-body text-body-md antialiased overflow-hidden flex h-screen transition-colors duration-200">
      <Sidebar 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background relative">
        <Topbar onMenuClick={() => setIsMobileMenuOpen(true)} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto w-full relative z-0 scroll-smooth">
          <div className="min-h-full flex flex-col w-full max-w-container-max mx-auto h-full p-sm sm:p-md lg:p-lg xl:p-xl transition-all duration-300">
            <div className="flex-1 w-full bg-surface-container-lowest border border-outline-variant rounded-xl sm:rounded-2xl shadow-sm sm:shadow-md overflow-hidden relative group hover:shadow-lg transition-all duration-300 ease-out">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
