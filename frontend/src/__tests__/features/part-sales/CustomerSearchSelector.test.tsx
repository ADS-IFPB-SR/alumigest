import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  CustomerSearchSelector,
  DEFAULT_WALK_IN_CLIENT_ID,
  DEFAULT_WALK_IN_CLIENT_NAME,
} from '../../../features/part-sales/components/CustomerSearchSelector';
import { customersApi } from '../../../features/customers/services/customersApi';

vi.mock('../../../features/customers/services/customersApi', () => ({
  customersApi: {
    getCustomers: vi.fn(),
  },
}));

const mockClients = [
  {
    id: 'cli-101',
    nomeCompleto: 'Vidros e Alumínios São José',
    documento: '12.345.678/0001-90',
    telefone: '(83) 98888-7777',
    cidade: 'Campina Grande/PB',
  },
  {
    id: 'cli-102',
    nomeCompleto: 'Carlos Alberto Ferreira',
    documento: '111.222.333-44',
    telefone: '(83) 99999-1111',
    cidade: 'João Pessoa/PB',
  },
];

describe('CustomerSearchSelector Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar o cliente balcão padrão inicialmente', () => {
    const handleSelect = vi.fn();
    render(
      <CustomerSearchSelector
        selectedClientId={DEFAULT_WALK_IN_CLIENT_ID}
        onSelectClient={handleSelect}
        initialCustomers={mockClients}
      />
    );

    expect(screen.getByTestId('input-search-client')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Cliente Balcão \(Padrão\) - Digite para buscar cliente cadastrado.../i)
    ).toBeInTheDocument();
  });

  it('deve abrir o dropdown ao focar no campo de busca e mostrar a opção de Cliente Balcão', async () => {
    const handleSelect = vi.fn();
    render(
      <CustomerSearchSelector
        selectedClientId={DEFAULT_WALK_IN_CLIENT_ID}
        onSelectClient={handleSelect}
        initialCustomers={mockClients}
      />
    );

    const input = screen.getByTestId('input-search-client');
    fireEvent.focus(input);

    expect(await screen.findByTestId('option-client-walk-in')).toBeInTheDocument();
    expect(screen.getByText(DEFAULT_WALK_IN_CLIENT_NAME)).toBeInTheDocument();
  });

  it('deve buscar clientes ao digitar no input e permitir selecionar um cliente cadastrado', async () => {
    vi.mocked(customersApi.getCustomers).mockResolvedValueOnce({
      content: [
        {
          id: 'cli-101',
          nomeCompleto: 'Vidros e Alumínios São José',
          documento: '12.345.678/0001-90',
          telefone: '(83) 98888-7777',
          cidade: 'Campina Grande',
          uf: 'PB',
          personType: 'JURIDICA',
          ativo: true,
        },
      ],
      page: { size: 20, number: 0, totalElements: 1, totalPages: 1 },
    });

    const handleSelect = vi.fn();
    render(
      <CustomerSearchSelector
        selectedClientId={DEFAULT_WALK_IN_CLIENT_ID}
        onSelectClient={handleSelect}
      />
    );

    const input = screen.getByTestId('input-search-client');
    fireEvent.change(input, { target: { value: 'São José' } });

    await waitFor(() => {
      expect(customersApi.getCustomers).toHaveBeenCalledWith(
        expect.objectContaining({ busca: 'São José' })
      );
    });

    const clientOption = await screen.findByTestId('option-client-cli-101');
    expect(clientOption).toBeInTheDocument();
    fireEvent.click(clientOption);

    expect(handleSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'cli-101',
        nomeCompleto: 'Vidros e Alumínios São José',
      })
    );
  });

  it('deve permitir voltar ao Cliente Balcão quando um cliente cadastrado está selecionado', () => {
    const handleSelect = vi.fn();
    render(
      <CustomerSearchSelector
        selectedClientId="cli-101"
        onSelectClient={handleSelect}
        initialCustomers={mockClients}
      />
    );

    expect(screen.getByText('Vidros e Alumínios São José')).toBeInTheDocument();
    const btnReset = screen.getByRole('button', { name: /voltar ao cliente balcão/i });
    fireEvent.click(btnReset);

    expect(handleSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        id: DEFAULT_WALK_IN_CLIENT_ID,
        nomeCompleto: DEFAULT_WALK_IN_CLIENT_NAME,
      })
    );
  });
});
