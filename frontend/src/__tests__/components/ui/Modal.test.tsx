import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Modal } from '@/components/ui/Modal';

describe('Modal Component', () => {
  it('não deve renderizar nada quando isOpen for false', () => {
    const { container } = render(
      <Modal isOpen={false} onClose={vi.fn()} title="Título Modal">
        <p>Conteúdo</p>
      </Modal>
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('deve renderizar título, corpo e rodapé quando isOpen for true', () => {
    render(
      <Modal
        isOpen={true}
        onClose={vi.fn()}
        title="Novo Cadastro"
        footer={<button type="button">Salvar</button>}
      >
        <p>Corpo do Modal</p>
      </Modal>
    );

    expect(screen.getByText('Novo Cadastro')).toBeInTheDocument();
    expect(screen.getByText('Corpo do Modal')).toBeInTheDocument();
    expect(screen.getByText('Salvar')).toBeInTheDocument();
  });

  it('deve invocar onClose ao clicar no botão fechar (X)', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="Teste Fechar">
        <p>Conteúdo</p>
      </Modal>
    );

    const closeBtn = screen.getByRole('button', { name: 'Fechar' });
    fireEvent.click(closeBtn);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('deve invocar onClose ao pressionar a tecla Escape', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="Teste Escape">
        <p>Conteúdo</p>
      </Modal>
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('deve invocar onClose ao clicar no backdrop', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="Teste Backdrop">
        <p>Conteúdo</p>
      </Modal>
    );

    const backdropBtn = screen.getByRole('button', { name: 'Fechar fundo do modal' });
    fireEvent.click(backdropBtn);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
