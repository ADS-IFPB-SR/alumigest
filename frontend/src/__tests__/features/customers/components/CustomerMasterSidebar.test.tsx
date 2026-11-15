import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CustomerMasterSidebar } from '../../../../features/customers/components/CustomerMasterSidebar';
import { getInitials } from '../../../../features/customers/utils/customerHubUtils';
import { CustomerSummaryDTO } from '../../../../features/customers/services/customersApi';

describe('CustomerMasterSidebar', () => {
  const mockCustomers: CustomerSummaryDTO[] = [
    {
      id: 'cust-1',
      nomeCompleto: 'Antônio Alfredo Figueiredo',
      personType: 'FISICA',
      documento: '042.891.444-09',
      telefone: '(83) 98845-2100',
      bairro: 'Torre',
      cidade: 'João Pessoa',
      uf: 'PB',
      ativo: true,
    },
    {
      id: 'cust-2',
      nomeCompleto: 'Vidraçaria Cristal LTDA',
      personType: 'JURIDICA',
      documento: '12.345.678/0001-90',
      telefone: '(83) 3224-9000',
      bairro: 'Centro',
      cidade: 'Santa Rita',
      uf: 'PB',
      ativo: true,
    },
  ];

  it('deve calcular iniciais corretamente', () => {
    expect(getInitials('Antônio Alfredo Figueiredo')).toBe('AF');
    expect(getInitials('AlumiGest')).toBe('AL');
    expect(getInitials('')).toBe('CL');
  });

  it('deve renderizar a lista de clientes com contador e iniciais', () => {
    const handleSelect = vi.fn();
    const handleSearch = vi.fn();

    render(
      <CustomerMasterSidebar
        customers={mockCustomers}
        selectedCustomerId="cust-1"
        onSelectCustomer={handleSelect}
        searchQuery=""
        onSearchChange={handleSearch}
      />
    );

    expect(screen.getByText('Clientes')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Antônio Alfredo Figueiredo')).toBeInTheDocument();
    expect(screen.getByText('Vidraçaria Cristal LTDA')).toBeInTheDocument();
  });

  it('deve acionar onSelectCustomer ao clicar em um cliente', () => {
    const handleSelect = vi.fn();
    const handleSearch = vi.fn();

    render(
      <CustomerMasterSidebar
        customers={mockCustomers}
        selectedCustomerId="cust-1"
        onSelectCustomer={handleSelect}
        searchQuery=""
        onSearchChange={handleSearch}
      />
    );

    const secondCustomerButton = screen.getByText('Vidraçaria Cristal LTDA').closest('button');
    expect(secondCustomerButton).not.toBeNull();
    fireEvent.click(secondCustomerButton!);

    expect(handleSelect).toHaveBeenCalledWith(mockCustomers[1]);
  });

  it('deve acionar onSearchChange ao digitar na busca', () => {
    const handleSelect = vi.fn();
    const handleSearch = vi.fn();

    render(
      <CustomerMasterSidebar
        customers={mockCustomers}
        selectedCustomerId="cust-1"
        onSelectCustomer={handleSelect}
        searchQuery=""
        onSearchChange={handleSearch}
      />
    );

    const searchInput = screen.getByPlaceholderText('Buscar por nome, fone, bairro...');
    fireEvent.change(searchInput, { target: { value: 'Antonio' } });

    expect(handleSearch).toHaveBeenCalledWith('Antonio');
  });

  it('deve exibir mensagem de lista vazia quando não houver clientes', () => {
    render(
      <CustomerMasterSidebar
        customers={[]}
        selectedCustomerId={undefined}
        onSelectCustomer={vi.fn()}
        searchQuery="Inexistente"
        onSearchChange={vi.fn()}
      />
    );

    expect(screen.getByText('Nenhum cliente encontrado.')).toBeInTheDocument();
  });
});
