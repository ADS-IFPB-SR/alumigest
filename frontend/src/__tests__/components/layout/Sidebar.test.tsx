import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';

describe('Sidebar Component - [US-16.2]', () => {
  it('deve renderizar o atalho Ordens de Serviço apontando para /ordens-servico', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Sidebar isOpen={true} onClose={vi.fn()} />
      </MemoryRouter>
    );

    const osLink = screen.getByRole('link', { name: /ordens de serviço/i });
    expect(osLink).toBeInTheDocument();
    expect(osLink).toHaveAttribute('href', '/ordens-servico');
    expect(osLink).toHaveTextContent('assignment');
  });

  it('deve aplicar estilo de rota ativa quando o usuário estiver em /ordens-servico', () => {
    render(
      <MemoryRouter initialEntries={['/ordens-servico']}>
        <Sidebar isOpen={true} onClose={vi.fn()} />
      </MemoryRouter>
    );

    const osLink = screen.getByRole('link', { name: /ordens de serviço/i });
    expect(osLink.className).toContain('bg-primary');
    expect(osLink.className).toContain('text-on-primary');
  });

  it('deve manter o item Ordens de Serviço ativo quando o usuário navegar para sub-rota /ordens-servico/:id ou rotas legadas', () => {
    const { unmount } = render(
      <MemoryRouter initialEntries={['/ordens-servico/f47ac10b-58cc-4372-a567-0e02b2c3d479']}>
        <Sidebar isOpen={true} onClose={vi.fn()} />
      </MemoryRouter>
    );

    let osLink = screen.getByRole('link', { name: /ordens de serviço/i });
    expect(osLink.className).toContain('bg-primary');
    expect(osLink.className).toContain('text-on-primary');

    unmount();

    render(
      <MemoryRouter initialEntries={['/work-orders']}>
        <Sidebar isOpen={true} onClose={vi.fn()} />
      </MemoryRouter>
    );

    osLink = screen.getByRole('link', { name: /ordens de serviço/i });
    expect(osLink.className).toContain('bg-primary');
    expect(osLink.className).toContain('text-on-primary');
  });

  it('deve chamar onClose ao clicar em um item de navegação', () => {
    const onClose = vi.fn();
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Sidebar isOpen={true} onClose={onClose} />
      </MemoryRouter>
    );

    const osLink = screen.getByRole('link', { name: /ordens de serviço/i });
    fireEvent.click(osLink);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
