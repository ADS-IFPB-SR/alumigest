import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';

describe('Sidebar Component - [US-16.2]', () => {
  it('deve renderizar o atalho Pedidos de Venda apontando para /pedidos', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Sidebar isOpen={true} onClose={vi.fn()} />
      </MemoryRouter>
    );

    const pedidosLink = screen.getByRole('link', { name: /pedidos de venda/i });
    expect(pedidosLink).toBeInTheDocument();
    expect(pedidosLink).toHaveAttribute('href', '/pedidos');
    expect(pedidosLink).toHaveTextContent('shopping_bag');
  });

  it('deve aplicar estilo de rota ativa quando o usuário estiver em /pedidos', () => {
    render(
      <MemoryRouter initialEntries={['/pedidos']}>
        <Sidebar isOpen={true} onClose={vi.fn()} />
      </MemoryRouter>
    );

    const pedidosLink = screen.getByRole('link', { name: /pedidos de venda/i });
    expect(pedidosLink.className).toContain('bg-primary');
    expect(pedidosLink.className).toContain('text-on-primary');
  });

  it('deve manter o item Pedidos de Venda ativo quando o usuário navegar para sub-rota /pedidos/:id', () => {
    render(
      <MemoryRouter initialEntries={['/pedidos/f47ac10b-58cc-4372-a567-0e02b2c3d479']}>
        <Sidebar isOpen={true} onClose={vi.fn()} />
      </MemoryRouter>
    );

    const pedidosLink = screen.getByRole('link', { name: /pedidos de venda/i });
    expect(pedidosLink.className).toContain('bg-primary');
    expect(pedidosLink.className).toContain('text-on-primary');
  });

  it('deve chamar onClose ao clicar em um item de navegação', () => {
    const onClose = vi.fn();
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Sidebar isOpen={true} onClose={onClose} />
      </MemoryRouter>
    );

    const pedidosLink = screen.getByRole('link', { name: /pedidos de venda/i });
    fireEvent.click(pedidosLink);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
