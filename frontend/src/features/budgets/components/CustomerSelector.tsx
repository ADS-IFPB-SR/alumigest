import React, { useEffect, useRef, useState } from 'react';
import type { Customer } from '../types';
import { useSearchClientes, useCreateCliente } from '../hooks/useBudgets';
import { useDebounce } from '../hooks/useDebounce';
import { CustomerQuickCreateModal } from './CustomerQuickCreateModal';

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(query, 300);
  const { data: results = [], isFetching } = useSearchClientes(debouncedQuery);

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

  const handleSelect = (customer: Customer) => {
    onSelect(customer);
    setQuery('');
    setIsDropdownOpen(false);
  };

  const handleClear = () => {
    onSelect({ id: '', nomeCompleto: '', ativo: true });
    setQuery('');
    inputRef.current?.focus();
  };

  const { mutate: createCliente, isPending: isCreating } = useCreateCliente();

  const handleQuickCreate = (data: {
    nomeCompleto: string;
    cpfCnpj?: string;
    telefone?: string;
    email?: string;
    logradouro?: string;
    numero?: string;
    bairro?: string;
    cidade?: string;
    uf?: string;
    cep?: string;
  }) => {
    createCliente(data, {
      onSuccess: (createdCustomer) => {
        onSelect(createdCustomer);
        setIsCreateModalOpen(false);
      },
    });
  };

  return (
    <>
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md shadow-sm">
        <h3 className="font-title-sm text-title-sm text-on-surface mb-md pb-xs border-b border-outline-variant">
          Cliente do Orçamento
        </h3>

        {/* Cliente selecionado */}
        {selectedCustomer?.id ? (
          <div className="flex items-start justify-between gap-sm bg-surface-container p-sm rounded-md border border-outline-variant">
            <div className="flex items-start gap-sm">
              <span className="material-symbols-outlined text-primary text-[24px] mt-xs">account_circle</span>
              <div>
                <p className="font-label font-semibold text-on-surface">{selectedCustomer.name}</p>
                {selectedCustomer.document && (
                  <p className="text-xs font-data-mono text-on-surface-variant">{selectedCustomer.document}</p>
                )}
                {selectedCustomer.phone && (
                  <p className="text-xs font-body text-on-surface-variant">{selectedCustomer.phone}</p>
                )}
                {selectedCustomer.address && (
                  <p className="text-xs font-body text-on-surface-variant mt-xs">{selectedCustomer.address}</p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="shrink-0 p-xs text-on-surface-variant hover:text-error hover:bg-error/10 rounded-md transition-colors"
              title="Remover cliente"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        ) : (
          /* Autocomplete de busca */
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
                  onFocus={() => query.length >= 2 && setIsDropdownOpen(true)}
                  placeholder="Buscar cliente por nome ou documento..."
                  className={`w-full pl-xl pr-sm py-sm bg-surface-container-lowest border rounded-sm font-body-sm text-body-sm text-on-surface focus:border-primary focus:border-2 focus:outline-none transition-all ${error ? 'border-error' : 'border-outline-variant'}`}
                />
                {isFetching && (
                  <span className="material-symbols-outlined absolute right-sm top-1/2 -translate-y-1/2 text-secondary text-[18px] animate-spin">
                    progress_activity
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="shrink-0 flex items-center gap-xs px-md py-sm bg-surface-container border border-outline-variant rounded-sm text-xs font-label font-medium text-on-surface hover:bg-surface-container-high transition-colors whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-[16px]">person_add</span>
                <span className="hidden sm:inline">Novo Cliente</span>
              </button>
            </div>

            {error && <p className="text-error text-xs mt-xs font-body">{error}</p>}

            {/* Dropdown de resultados */}
            {isDropdownOpen && query.length >= 2 && (
              <div className="absolute left-0 right-0 top-full mt-xs bg-surface-container-lowest border border-outline-variant rounded-md shadow-lg z-10 max-h-56 overflow-y-auto">
                {results.length === 0 && !isFetching && (
                  <div className="p-md text-center text-sm text-on-surface-variant font-body">
                    <p>Nenhum cliente encontrado para "{query}"</p>
                    <button
                      type="button"
                      onClick={() => { setIsDropdownOpen(false); setIsCreateModalOpen(true); }}
                      className="mt-sm text-primary text-xs hover:underline font-label flex items-center gap-xs mx-auto"
                    >
                      <span className="material-symbols-outlined text-[14px]">add_circle</span>
                      Cadastrar "{query}" como novo cliente
                    </button>
                  </div>
                )}
                {results.map((customer) => (
                  <button
                    key={customer.id}
                    type="button"
                    onClick={() => handleSelect(customer)}
                    className="w-full flex items-start gap-sm px-md py-sm hover:bg-surface-container-low transition-colors border-b border-outline-variant last:border-0 text-left"
                  >
                    <span className="material-symbols-outlined text-secondary text-[18px] mt-xs shrink-0">person</span>
                    <div className="min-w-0">
                      <p className="font-label font-semibold text-on-surface text-sm">{customer.nomeCompleto}</p>
                      <p className="text-xs text-on-surface-variant font-data-mono truncate">
                        {customer.cpfCnpj ?? ''} {customer.telefone ? `· ${customer.telefone}` : ''} {customer.cidade ? `· ${customer.cidade}/${customer.uf}` : ''}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {query.length > 0 && query.length < 2 && (
              <p className="text-xs text-on-surface-variant mt-xs font-body">Digite ao menos 2 caracteres para buscar.</p>
            )}
          </div>
        )}
      </div>

      {/* Modal de cadastro rápido */}
      <CustomerQuickCreateModal
        isOpen={isCreateModalOpen}
        initialName={query}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleQuickCreate}
        isLoading={isCreating}
      />
    </>
  );
};
