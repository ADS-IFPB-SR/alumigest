import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EditCustomerModal } from '../../../../features/customers/components/EditCustomerModal';
import * as customerHooks from '../../../../features/customers/hooks/useCustomers';
import toast from 'react-hot-toast';

vi.mock('../../../../features/customers/hooks/useCustomers');
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('EditCustomerModal', () => {
  const mockCustomer = {
    id: 'c1',
    nomeCompleto: 'José da Silva',
    personType: 'FISICA',
    documento: '12345678900',
    telefone: '83999999999',
    email: 'jose@email.com',
  };

  const mockOnClose = vi.fn();
  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(customerHooks, 'useCustomer').mockReturnValue({
      data: mockCustomer,
      isLoading: false,
      isError: false,
    } as any);

    vi.spyOn(customerHooks, 'useUpdateCustomer').mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as any);
  });

  it('deve carregar e preencher os dados iniciais ao abrir o modal', async () => {
    render(<EditCustomerModal isOpen={true} customerId="c1" onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('José da Silva')).toBeInTheDocument();
      expect(screen.getByDisplayValue('12345678900')).toBeInTheDocument();
      expect(screen.getByDisplayValue('83999999999')).toBeInTheDocument();
      expect(screen.getByDisplayValue('jose@email.com')).toBeInTheDocument();
    });
  });

  it('deve bloquear a submissão e não disparar a mutação se o documento for apagado', async () => {
    render(<EditCustomerModal isOpen={true} customerId="c1" onClose={mockOnClose} />);

    const docInput = await screen.findByLabelText(/CPF \/ CNPJ \*/i);
    fireEvent.change(docInput, { target: { value: '' } });

    const submitBtn = screen.getByRole('button', { name: /Salvar Alterações/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockMutate).not.toHaveBeenCalled();
    });
  });

  it('deve disparar a mutação e fechar o modal com sucesso ao salvar', async () => {
    // Simula o onSuccess da mutação
    mockMutate.mockImplementation((variables, options) => {
      options.onSuccess();
    });

    render(<EditCustomerModal isOpen={true} customerId="c1" onClose={mockOnClose} />);

    const nameInput = await screen.findByLabelText(/Nome \/ Razão Social \*/i);
    fireEvent.change(nameInput, { target: { value: 'José da Silva Editado' } });

    const submitBtn = screen.getByRole('button', { name: /Salvar Alterações/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'c1' }),
        expect.any(Object)
      );
      expect(toast.success).toHaveBeenCalledWith('Cliente atualizado com sucesso!');
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('deve exibir toast de erro em caso de status 409 (conflito)', async () => {
    // Simula o onError da mutação com payload do Axios
    mockMutate.mockImplementation((variables, options) => {
      options.onError({
        response: { data: { message: 'Já existe outro cliente cadastrado com este documento.' } }
      });
    });

    render(<EditCustomerModal isOpen={true} customerId="c1" onClose={mockOnClose} />);

    const submitBtn = screen.getByRole('button', { name: /Salvar Alterações/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Já existe outro cliente cadastrado com este documento.');
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });
});