import type {
  CustomerResponseDTO,
  CustomerSummaryDTO,
  CreateCustomerRequest,
} from '@/features/customers/services/customersApi';

/**
 * Fixture factory para CustomerResponseDTO (Cliente completo).
 */
export function buildMockCustomer(overrides?: Partial<CustomerResponseDTO>): CustomerResponseDTO {
  return {
    id: 'cust-1',
    nomeCompleto: 'CARLOS EDUARDO SILVA',
    personType: 'FISICA',
    documento: '123.456.789-00',
    telefone: '(83) 98888-7777',
    email: 'carlos.silva@email.com',
    cep: '58000-000',
    logradouro: 'Rua das Esquadrias',
    numero: '123',
    complemento: 'Apto 402',
    bairro: 'Manaíra',
    cidade: 'João Pessoa',
    uf: 'PB',
    observacoes: 'Cliente prioritário',
    ativo: true,
    ...overrides,
  };
}

/**
 * Fixture factory para CustomerSummaryDTO (Resumo em listas de paginação).
 */
export function buildMockCustomerSummary(overrides?: Partial<CustomerSummaryDTO>): CustomerSummaryDTO {
  return {
    id: 'cust-1',
    nomeCompleto: 'CARLOS EDUARDO SILVA',
    personType: 'FISICA',
    documento: '123.456.789-00',
    telefone: '(83) 98888-7777',
    cidade: 'João Pessoa',
    uf: 'PB',
    ativo: true,
    ...overrides,
  };
}

/**
 * Fixture factory para CreateCustomerRequest (Payload de cadastro).
 */
export function buildMockCreateCustomerRequest(overrides?: Partial<CreateCustomerRequest>): CreateCustomerRequest {
  return {
    nomeCompleto: 'MARIA FERNANDA OLIVEIRA',
    personType: 'FISICA',
    documento: '987.654.321-99',
    telefone: '(83) 99999-1111',
    email: 'maria.oliveira@email.com',
    cidade: 'Campina Grande',
    uf: 'PB',
    ...overrides,
  };
}
