export interface BudgetCustomerOption {
  id: string;
  nomeCompleto: string;
  cpfCnpj?: string;
  telefone?: string;
  email?: string;
  logradouro?: string;
  cidade?: string;
  uf?: string;
}

export const budgetCustomersLocalDB: BudgetCustomerOption[] = [
  {
    id: 'cli-1',
    nomeCompleto: 'Thiago Thasso de Melo',
    cpfCnpj: '000.000.000-00',
    telefone: '83999991111',
    email: 'thiago@mock.com',
    cidade: 'João Pessoa',
    uf: 'PB'
  }
];

export const generateLocalId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};
