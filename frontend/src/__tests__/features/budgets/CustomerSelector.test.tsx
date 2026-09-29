import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CustomerSelector } from '../../../features/budgets/components/CustomerSelector';
import * as customerHooks from '../../../features/customers/hooks/useCustomers';

vi.mock('../../../features/customers/hooks/useCustomers', () => ({
  useCustomers: vi.fn(),
  useCreateCustomer: vi.fn(),
}));

describe('CustomerSelector Component [Joseph Nichollas]', () => {
  const mockOnSelect = vi.fn();
  const mockCreateCustomer = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(customerHooks.useCreateCustomer).mockReturnValue({
      mutate: mockCreateCustomer,
      isPending: false,
    } as any);

    vi.mocked(customerHooks.useCustomers).mockReturnValue({
      data: {
        content: [
          {
            id: 'c-1',
            nomeCompleto: 'João Vidraçaria',
            documento: '123.456.789-00',
            telefone: '83999999999',
            cidade: 'Sousa',
            uf: 'PB',
            ativo: true,
          },
        ],
        totalElements: 1,
        totalPages: 1,
      },
      isLoading: false,
    } as any);
  });

  it('deve renderizar SelectedCustomerCard quando houver cliente selecionado e permitir limpar', () => {
    render(
      <CustomerSelector
        selectedCustomer={{
          id: 'c-1',
          name: 'João Vidraçaria',
          document: '123.456.789-00',
          phone: '83999999999',
          address: 'Rua Principal, 100',
        }}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText('Cliente Vinculado')).toBeInTheDocument();
    expect(screen.getByText('João Vidraçaria')).toBeInTheDocument();
    expect(screen.getByText('Doc: 123.456.789-00')).toBeInTheDocument();
    expect(screen.getByText('Tel: 83999999999')).toBeInTheDocument();
    expect(screen.getByText(/Endereço: Rua Principal, 100/i)).toBeInTheDocument();

    const clearButton = screen.getByRole('button', { name: /Trocar cliente/i });
    fireEvent.click(clearButton);

    expect(mockOnSelect).toHaveBeenCalledWith({
      id: '',
      nomeCompleto: '',
      ativo: true,
    });
  });

  it('deve exibir mensagem de erro quando a prop error for fornecida', () => {
    render(
      <CustomerSelector
        selectedCustomer={null}
        onSelect={mockOnSelect}
        error="Campo cliente é obrigatório"
      />
    );

    expect(screen.getByText('Campo cliente é obrigatório')).toBeInTheDocument();
  });

  it('deve exibir input de busca e abrir dropdown ao focar no campo', () => {
    render(
      <CustomerSelector
        selectedCustomer={null}
        onSelect={mockOnSelect}
      />
    );

    const input = screen.getByPlaceholderText('Buscar cliente por nome ou documento...');
    fireEvent.focus(input);

    expect(screen.getByText(/Clientes Cadastrados/i)).toBeInTheDocument();
    expect(screen.getByText('João Vidraçaria')).toBeInTheDocument();
  });

  it('deve chamar onSelect ao clicar em um cliente da lista', () => {
    render(
      <CustomerSelector
        selectedCustomer={null}
        onSelect={mockOnSelect}
      />
    );

    const input = screen.getByPlaceholderText('Buscar cliente por nome ou documento...');
    fireEvent.focus(input);

    const customerItem = screen.getByRole('button', { name: /João Vidraçaria/i });
    fireEvent.click(customerItem);

    expect(mockOnSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'c-1',
        nomeCompleto: 'João Vidraçaria',
        cpfCnpj: '123.456.789-00',
        telefone: '83999999999',
        cidade: 'Sousa',
        uf: 'PB',
        ativo: true,
      })
    );
  });

  it('deve exibir indicador de carregamento quando isLoadingCustomers for true', () => {
    vi.mocked(customerHooks.useCustomers).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any);

    render(
      <CustomerSelector
        selectedCustomer={null}
        onSelect={mockOnSelect}
      />
    );

    const input = screen.getByPlaceholderText('Buscar cliente por nome ou documento...');
    fireEvent.focus(input);

    expect(screen.getByText('Buscando clientes no banco de dados...')).toBeInTheDocument();
  });

  it('deve exibir mensagem de nenhum cliente cadastrado quando busca for curta e vazia', () => {
    vi.mocked(customerHooks.useCustomers).mockReturnValue({
      data: { content: [] },
      isLoading: false,
    } as any);

    render(
      <CustomerSelector
        selectedCustomer={null}
        onSelect={mockOnSelect}
      />
    );

    const input = screen.getByPlaceholderText('Buscar cliente por nome ou documento...');
    fireEvent.focus(input);

    expect(screen.getByText('Nenhum cliente cadastrado no sistema.')).toBeInTheDocument();
    expect(screen.getByText(/Cadastrar novo cliente agora/i)).toBeInTheDocument();
  });

  it('deve exibir mensagem de nenhum cliente encontrado para a query quando busca for >= 2 chars', () => {
    vi.mocked(customerHooks.useCustomers).mockReturnValue({
      data: { content: [] },
      isLoading: false,
    } as any);

    render(
      <CustomerSelector
        selectedCustomer={null}
        onSelect={mockOnSelect}
      />
    );

    const input = screen.getByPlaceholderText('Buscar cliente por nome ou documento...');
    fireEvent.change(input, { target: { value: 'Inexistente' } });

    expect(screen.getByText('Nenhum cliente encontrado para "Inexistente".')).toBeInTheDocument();
    expect(screen.getByText(/Cadastrar "Inexistente" agora/i)).toBeInTheDocument();
  });

  it('deve abrir modal de cadastro rápido ao clicar no botão "Novo Cliente"', () => {
    render(
      <CustomerSelector
        selectedCustomer={null}
        onSelect={mockOnSelect}
      />
    );

    const novoClienteBtn = screen.getByRole('button', { name: /Novo Cliente/i });
    fireEvent.click(novoClienteBtn);

    expect(screen.getByRole('heading', { name: /Cadastro Rápido de Cliente/i })).toBeInTheDocument();
  });

  it('deve executar handleQuickCreate e invocar onSelect ao cadastrar novo cliente com sucesso', async () => {
    mockCreateCustomer.mockImplementation((dto: any, options: any) => {
      options.onSuccess({
        id: 'new-99',
        nomeCompleto: dto.nomeCompleto,
        documento: dto.documento,
        telefone: dto.telefone,
        email: dto.email,
        ativo: true,
      });
    });

    render(
      <CustomerSelector
        selectedCustomer={null}
        onSelect={mockOnSelect}
      />
    );

    const novoClienteBtn = screen.getByRole('button', { name: /Novo Cliente/i });
    fireEvent.click(novoClienteBtn);

    const nomeInput = screen.getByPlaceholderText('João da Silva');
    fireEvent.change(nomeInput, { target: { value: 'Novo Cliente Teste' } });

    const salvarBtn = screen.getByRole('button', { name: /Cadastrar Cliente/i });
    fireEvent.click(salvarBtn);

    await waitFor(() => {
      expect(mockCreateCustomer).toHaveBeenCalled();
      expect(mockOnSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'new-99',
          nomeCompleto: 'Novo Cliente Teste',
          ativo: true,
        })
      );
    });
  });

  it('deve fechar dropdown ao clicar fora do container', () => {
    render(
      <div>
        <div data-testid="outside">Fora</div>
        <CustomerSelector
          selectedCustomer={null}
          onSelect={mockOnSelect}
        />
      </div>
    );

    const input = screen.getByPlaceholderText('Buscar cliente por nome ou documento...');
    fireEvent.focus(input);

    expect(screen.getByText(/Clientes Cadastrados/i)).toBeInTheDocument();

    const outside = screen.getByTestId('outside');
    fireEvent.mouseDown(outside);

    expect(screen.queryByText(/Clientes Cadastrados/i)).not.toBeInTheDocument();
  });
});
