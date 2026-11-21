import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

function renderLayout(initialRoute = '/catalogo') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<div>Conteúdo Raiz</div>} />
          <Route
            path="catalogo"
            element={
              <div>
                <span>Conteúdo Catálogo</span>
                <Link to="/producao">Ir para Produção</Link>
              </div>
            }
          />
          <Route path="producao" element={<div>Conteúdo Produção</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('DashboardLayout Component - [US-22.4]', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('deve renderizar Sidebar, Topbar e conteúdo do Outlet', () => {
    renderLayout('/catalogo');

    expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /catálogo & estoque/i })).toBeInTheDocument();
    expect(screen.getByText('AlumiGest')).toBeInTheDocument();
    expect(screen.getByText('Conteúdo Catálogo')).toBeInTheDocument();
  });

  it('deve alternar o recolhimento da barra lateral e persistir em localStorage', () => {
    const { unmount } = renderLayout('/catalogo');

    const toggleBtn = screen.getByTestId('btn-toggle-sidebar');
    expect(screen.getByTestId('sidebar-unified-badge')).toBeInTheDocument();

    fireEvent.click(toggleBtn);
    expect(localStorage.getItem('alumigest_sidebar_collapsed')).toBe('true');
    expect(screen.queryByTestId('sidebar-unified-badge')).not.toBeInTheDocument();

    unmount();
    renderLayout('/catalogo');
    expect(screen.queryByTestId('sidebar-unified-badge')).not.toBeInTheDocument();
  });

  it('deve abrir o menu mobile pela Topbar e fechar automaticamente ao trocar de rota', () => {
    renderLayout('/catalogo');

    expect(screen.queryByRole('button', { name: 'Fechar menu' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }));
    expect(screen.getByRole('button', { name: 'Fechar menu' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('link', { name: 'Ir para Produção' }));
    expect(screen.getByText('Conteúdo Produção')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Fechar menu' })).not.toBeInTheDocument();
  });

  it('deve ignorar falhas de acesso ao localStorage sem quebrar a renderização', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage indisponível');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage indisponível');
    });

    renderLayout('/catalogo');

    expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('btn-toggle-sidebar'));
    expect(screen.queryByTestId('sidebar-unified-badge')).not.toBeInTheDocument();
  });
});
