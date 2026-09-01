import React, { useEffect, useRef, useState } from 'react';
import type { Customer } from '../types';
import { CustomerQuickCreateModal } from './CustomerQuickCreateModal';
import { useCustomers, useCreateCustomer } from '../../customers/hooks/useCustomers';
import type { CustomerSummaryDTO } from '../../customers/services/customersApi';

interface CustomerSelectorProps {
  selectedCustomer: { id: string; name: string; document: string; phone: string; address: string } | null;
  onSelect: (customer: Customer) => void;
  error?: string;
}

export const CustomerSelector: React.FC<CustomerSelectorProps> = ({
  selectedCustomer,
  onSelect,
  error,
}) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce query search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 250);
    return () => clearTimeout(handler);
  }, [query]);

  // Busca real no backend via React Query
  const { data: customers = [], isLoading: isLoadingCustomers } = useCustomers(
    debouncedQuery.trim().length >= 2 ? debouncedQuery : undefined,
  );

  const { mutate: createCustomer, isPending: isCreatingCustomer } = useCreateCustomer();

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsDropdownOpen(true);
  };

  const handleSelect = (customer: CustomerSummaryDTO) => {
    onSelect({
      id: customer.id,
      nomeCompleto: customer.nomeCompleto,
      cpfCnpj: customer.documento,
      telefone: customer.telefone,
      email: '',
      cidade: customer.cidade,
      uf: customer.uf,
      ativo: customer.ativo,
    });
    setQuery('');
    setIsDropdownOpen(false);
  };

  const handleClear = () => {
    onSelect({ id: '', nomeCompleto: '', ativo: true });
    setQuery('');
    inputRef.current?.focus();
  };

  const handleQuickCreate = (data: {
    nomeCompleto: string;
    cpfCnpj?: string;
    telefone?: string;
    email?: string;
    cep?: string;
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    uf?: string;
    observacoes?: string;
  }) => {
    createCustomer(
      {
        nomeCompleto: data.nomeCompleto.trim(),
        personType: 'FISICA',
        documento: data.cpfCnpj?.trim() || undefined,
        telefone: data.telefone?.trim() || undefined,
        email: data.email?.trim() || undefined,
        cep: data.cep?.trim() || undefined,
        logradouro: data.logradouro?.trim() || undefined,
        numero: data.numero?.trim() || undefined,
        complemento: data.complemento?.trim() || undefined,
        bairro: data.bairro?.trim() || undefined,
        cidade: data.cidade?.trim() || undefined,
        uf: data.uf?.trim() || undefined,
        observacoes: data.observacoes?.trim() || undefined,
      },
      {
        onSuccess: (newCust) => {
          onSelect({
            id: newCust.id,
            nomeCompleto: newCust.nomeCompleto,
            cpfCnpj: newCust.documento,
            telefone: newCust.telefone,
            email: newCust.email,
            logradouro: newCust.logradouro,
            numero: newCust.numero,
            complemento: newCust.complemento,
            bairro: newCust.bairro,
            cidade: newCust.cidade,
            uf: newCust.uf,
            cep: newCust.cep,
            ativo: newCust.ativo,
          });
          setIsCreateModalOpen(false);
          setQuery('');
          setIsDropdownOpen(false);
        },
      },
    );
  };

  return (
    <>
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md shadow-sm">
        <h3 className="font-title-sm text-title-sm text-on-surface mb-md pb-xs border-b border-outline-variant flex items-center justify-between">
          <span>Cliente do Orçamento</span>
          {selectedCustomer?.id && (
            <span className="text-xs font-label font-normal text-secondary flex items-center gap-xs">
              <span className="material-symbols-outlined text-[14px] text-success">check_circle</span>
              Cliente Vinculado
            </span>
          )}
        </h3>

        {/* Cliente selecionado */}
        {selectedCustomer?.id ? (
          <div className="flex items-start justify-between gap-sm bg-surface-container-low p-sm rounded-md border border-primary/30 shadow-xs">
            <div className="flex items-start gap-sm min-w-0">
              <span className="material-symbols-outlined text-primary text-[26px] mt-[2px] shrink-0">
                account_circle
              </span>
              <div className="min-w-0">
                <p className="font-label font-bold text-on-surface text-sm">{selectedCustomer.name}</p>
                <div className="flex items-center gap-sm flex-wrap text-xs text-on-surface-variant mt-xs">
                  {selectedCustomer.document && (
                    <span className="font-data-mono bg-surface-container px-xs py-[2px] rounded border border-outline-variant/60">
                      Doc: {selectedCustomer.document}
                    </span>
                  )}
                  {selectedCustomer.phone && (
                    <span className="font-body">
                      Tel: {selectedCustomer.phone}
                    </span>
                  )}
                </div>
                {selectedCustomer.address && (
                  <p className="text-xs font-body text-secondary mt-xs truncate">
                    Endereço: {selectedCustomer.address}
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="shrink-0 p-xs text-on-surface-variant hover:text-error hover:bg-error/10 rounded-md transition-colors"
              title="Trocar ou remover cliente"
              aria-label="Trocar cliente"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        ) : (
          /* Autocomplete de busca com dados do Backend */
          <div ref={containerRef} className="relative">
            <div className="relative flex items-center gap-sm">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-secondary text-[18px] pointer-events-none">
                  search
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  id="customer-search"
                  value={query}
                  onChange={handleInputChange}
                  onFocus={() => setIsDropdownOpen(true)}
                  placeholder="Buscar cliente por nome ou documento..."
                  className={`w-full pl-xl pr-sm py-sm bg-surface-container-lowest border rounded-sm font-body-sm text-body-sm text-on-surface focus:border-primary focus:outline-none transition-all ${
                    error ? 'border-error' : 'border-outline-variant'
                  }`}
                />
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="shrink-0 flex items-center gap-xs px-md py-sm bg-primary text-on-primary rounded-sm text-xs font-label font-semibold hover:opacity-90 transition-opacity whitespace-nowrap shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">person_add</span>
                <span>Novo Cliente</span>
              </button>
            </div>

            {error && <p className="text-error text-xs mt-xs font-body">{error}</p>}

            {/* Dropdown de resultados conectado ao Backend */}
            {isDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-xs bg-surface-container-lowest border border-outline-variant rounded-md shadow-xl z-30 max-h-64 overflow-y-auto">
                {isLoadingCustomers ? (
                  <div className="p-md text-center text-xs text-on-surface-variant font-body flex items-center justify-center gap-xs">
                    <span className="material-symbols-outlined animate-spin text-[16px] text-primary">progress_activity</span>
                    Buscando clientes no banco de dados...
                  </div>
                ) : customers.length === 0 ? (
                  <div className="p-md text-center text-sm text-on-surface-variant font-body">
                    <p className="text-xs">
                      {query.trim().length >= 2
                        ? `Nenhum cliente encontrado para "${query}".`
                        : 'Nenhum cliente cadastrado no sistema.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setIsCreateModalOpen(true);
                      }}
                      className="mt-sm text-primary text-xs hover:underline font-label font-semibold flex items-center gap-xs mx-auto"
                    >
                      <span className="material-symbols-outlined text-[16px]">add_circle</span>
                      Cadastrar {query.trim() ? `"${query}"` : 'novo cliente'} agora
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="px-sm py-xs bg-surface-container-low border-b border-outline-variant/60 text-[11px] font-label text-on-surface-variant uppercase tracking-wider">
                      Clientes Cadastrados ({customers.length})
                    </div>
                    {customers.map((customer) => (
                      <button
                        key={customer.id}
                        type="button"
                        onClick={() => handleSelect(customer)}
                        className="w-full flex items-start gap-sm px-md py-sm hover:bg-primary/5 hover:text-primary transition-colors border-b border-outline-variant/40 last:border-0 text-left group"
                      >
                        <span className="material-symbols-outlined text-secondary group-hover:text-primary text-[20px] mt-[2px] shrink-0">
                          person
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-label font-semibold text-on-surface group-hover:text-primary text-sm">
                            {customer.nomeCompleto}
                          </p>
                          <p className="text-xs text-on-surface-variant font-data-mono truncate mt-[2px]">
                            {customer.documento ? `Doc: ${customer.documento}` : 'Sem doc'}
                            {customer.telefone ? ` · ${customer.telefone}` : ''}
                            {customer.cidade ? ` · ${customer.cidade}${customer.uf ? `/${customer.uf}` : ''}` : ''}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de cadastro rápido conectado ao Backend */}
      <CustomerQuickCreateModal
        isOpen={isCreateModalOpen}
        initialName={query}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleQuickCreate}
        isLoading={isCreatingCustomer}
      />
    </>
  );
};
