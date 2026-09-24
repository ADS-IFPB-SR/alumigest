import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CustomerQuickCreateModal } from '../../../features/budgets/components/CustomerQuickCreateModal';

describe('CustomerQuickCreateModal Component [Joseph Nichollas]', () => {
  it('não deve renderizar nada quando isOpen for false', () => {
    render(
      <CustomerQuickCreateModal
        isOpen={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        isLoading={false}
      />
    );

    expect(screen.queryByText('Cadastro Rápido de Cliente')).not.toBeInTheDocument();
  });

  it('deve renderizar o modal com initialName preenchido quando isOpen for true', () => {
    render(
      <CustomerQuickCreateModal
        isOpen={true}
        initialName="Carlos Eduardo"
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        isLoading={false}
      />
    );

    expect(screen.getByText('Cadastro Rápido de Cliente')).toBeInTheDocument();
    const nomeInput = screen.getByPlaceholderText('João da Silva') as HTMLInputElement;
    expect(nomeInput.value).toBe('Carlos Eduardo');
  });

  it('deve chamar onClose ao clicar no botão Fechar e no botão Cancelar', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();

    render(
      <CustomerQuickCreateModal
        isOpen={true}
        onClose={handleClose}
        onSubmit={vi.fn()}
        isLoading={false}
      />
    );

    const btnCancelar = screen.getByRole('button', { name: /cancelar/i });
    await user.click(btnCancelar);
    expect(handleClose).toHaveBeenCalledTimes(1);

    const btnFechar = screen.getByRole('button', { name: 'Fechar' });
    await user.click(btnFechar);
    expect(handleClose).toHaveBeenCalledTimes(2);
  });

  it('deve fechar o modal ao pressionar a tecla Escape', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();

    render(
      <CustomerQuickCreateModal
        isOpen={true}
        onClose={handleClose}
        onSubmit={vi.fn()}
        isLoading={false}
      />
    );

    await user.keyboard('{Escape}');
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('deve validar e submeter os dados ao preencher os campos válidos', () => {
    const handleSubmit = vi.fn();

    render(
      <CustomerQuickCreateModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={handleSubmit}
        isLoading={false}
      />
    );

    const getById = (id: string) => document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

    fireEvent.change(getById('cqc-nome'), { target: { value: 'Ana Paula Silva' } });
    fireEvent.change(getById('cqc-doc'), { target: { value: '123.456.789-00' } });
    fireEvent.change(getById('cqc-tel'), { target: { value: '83988887777' } });
    fireEvent.change(getById('cqc-email'), { target: { value: 'ana@email.com' } });
    fireEvent.change(getById('cqc-cep'), { target: { value: '58300-000' } });
    fireEvent.change(getById('cqc-logr'), { target: { value: 'Av. Brasil' } });
    fireEvent.change(getById('cqc-num'), { target: { value: '100' } });
    fireEvent.change(getById('cqc-comp'), { target: { value: 'Apto 202' } });
    fireEvent.change(getById('cqc-bairro'), { target: { value: 'Centro' } });
    fireEvent.change(getById('cqc-cidade'), { target: { value: 'Sousa' } });
    fireEvent.change(getById('cqc-uf'), { target: { value: 'PB' } });
    fireEvent.change(getById('cqc-obs'), { target: { value: 'Cliente preferencial' } });

    const submitBtn = screen.getByRole('button', { name: /cadastrar cliente/i });
    fireEvent.click(submitBtn);

    expect(handleSubmit).toHaveBeenCalledWith({
      nomeCompleto: 'Ana Paula Silva',
      cpfCnpj: '123.456.789-00',
      telefone: '83988887777',
      email: 'ana@email.com',
      cep: '58300-000',
      logradouro: 'Av. Brasil',
      numero: '100',
      complemento: 'Apto 202',
      bairro: 'Centro',
      cidade: 'Sousa',
      uf: 'PB',
      observacoes: 'Cliente preferencial',
    });
  });

  it('deve desabilitar botões quando isLoading for true', () => {
    render(
      <CustomerQuickCreateModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        isLoading={true}
      />
    );

    const submitBtn = screen.getByRole('button', { name: /cadastrando\.\.\./i });
    expect(submitBtn).toBeDisabled();

    const cancelBtn = screen.getByRole('button', { name: /cancelar/i });
    expect(cancelBtn).toBeDisabled();
  });

  it('deve exibir erros de validação e não chamar onSubmit ao tentar submeter formulário inválido', () => {
    const handleSubmit = vi.fn();

    render(
      <CustomerQuickCreateModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={handleSubmit}
        isLoading={false}
      />
    );

    const submitBtn = screen.getByRole('button', { name: /cadastrar cliente/i });
    fireEvent.click(submitBtn);

    expect(handleSubmit).not.toHaveBeenCalled();
  });
});
