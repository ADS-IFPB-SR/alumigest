import React, { useState, useEffect, useRef, useId } from 'react';
import { User, Search, Check, X, Building2, UserCheck } from 'lucide-react';
import { customersApi, type CustomerSummaryDTO } from '@/features/customers/services/customersApi';

export const DEFAULT_WALK_IN_CLIENT_ID = '00000000-0000-0000-0000-000000000001';
export const DEFAULT_WALK_IN_CLIENT_NAME = 'Cliente Balcão (Consumidor Final)';

export interface CustomerOption {
  id: string;
  nomeCompleto: string;
  documento?: string;
  telefone?: string;
  cidade?: string;
}

export interface CustomerSearchSelectorProps {
  selectedClientId: string;
  onSelectClient: (client: CustomerOption) => void;
  initialCustomers?: CustomerOption[];
  disabled?: boolean;
}

const isWalkInClient = (c: { id?: string; nomeCompleto?: string }) =>
  c.id === DEFAULT_WALK_IN_CLIENT_ID ||
  (c.nomeCompleto ? c.nomeCompleto.toLowerCase().includes('balcão') : false);

const sanitizeCustomerList = (list?: CustomerOption[]) =>
  (list || []).filter((c) => !isWalkInClient(c));

export const CustomerSearchSelector: React.FC<CustomerSearchSelectorProps> = ({
  selectedClientId,
  onSelectClient,
  initialCustomers,
  disabled = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<CustomerOption[]>(() =>
    sanitizeCustomerList(initialCustomers)
  );
  const [isLoading, setIsLoading] = useState(false);
  const [selectedClientData, setSelectedClientData] = useState<CustomerOption | null>(() => {
    if (selectedClientId && selectedClientId !== DEFAULT_WALK_IN_CLIENT_ID) {
      const found = initialCustomers?.find((c) => c.id === selectedClientId);
      return found || null;
    }
    return {
      id: DEFAULT_WALK_IN_CLIENT_ID,
      nomeCompleto: DEFAULT_WALK_IN_CLIENT_NAME,
      documento: 'Consumidor Final',
    };
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputId = useId();

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sincroniza se selectedClientId mudar externamente
  useEffect(() => {
    if (!selectedClientId || selectedClientId === DEFAULT_WALK_IN_CLIENT_ID) {
      setSelectedClientData({
        id: DEFAULT_WALK_IN_CLIENT_ID,
        nomeCompleto: DEFAULT_WALK_IN_CLIENT_NAME,
        documento: 'Consumidor Final',
      });
    } else if (initialCustomers && initialCustomers.length > 0) {
      const found = initialCustomers.find((c) => c.id === selectedClientId);
      if (found) {
        setSelectedClientData(found);
      }
    }
  }, [selectedClientId, initialCustomers]);

  // Busca clientes com debounce
  useEffect(() => {
    if (!isDropdownOpen) return;
    const timer = setTimeout(() => {
      setIsLoading(true);
      customersApi
        .getCustomers({
          busca: searchTerm.trim().length >= 2 ? searchTerm.trim() : undefined,
          ativo: true,
          size: 20,
        })
        .then((res) => {
          if (res?.content) {
            const mapped: CustomerOption[] = res.content
              .filter(
                (c: CustomerSummaryDTO) =>
                  c.id !== DEFAULT_WALK_IN_CLIENT_ID &&
                  !(c.nomeCompleto && c.nomeCompleto.toLowerCase().includes('balcão'))
              )
              .map((c: CustomerSummaryDTO) => ({
                id: c.id,
                nomeCompleto: c.nomeCompleto,
                documento: c.documento,
                telefone: c.telefone,
                cidade: c.cidade ? `${c.cidade}${c.uf ? `/${c.uf}` : ''}` : undefined,
              }));
            setSearchResults(mapped);
          }
        })
        .catch(() => {
          // Fallback gracioso
        })
        .finally(() => {
          setIsLoading(false);
        });
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm, isDropdownOpen]);

  const handleSelectWalkIn = () => {
    const walkInClient: CustomerOption = {
      id: DEFAULT_WALK_IN_CLIENT_ID,
      nomeCompleto: DEFAULT_WALK_IN_CLIENT_NAME,
      documento: 'Consumidor Final',
    };
    setSelectedClientData(walkInClient);
    onSelectClient(walkInClient);
    setIsDropdownOpen(false);
    setSearchTerm('');
  };

  const handleSelectCustomer = (customer: CustomerOption) => {
    setSelectedClientData(customer);
    onSelectClient(customer);
    setIsDropdownOpen(false);
    setSearchTerm('');
  };

  const isCustomClient =
    selectedClientData && selectedClientData.id !== DEFAULT_WALK_IN_CLIENT_ID;

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="flex items-center justify-between mb-1">
        <label
          htmlFor={searchInputId}
          className="text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase flex items-center gap-1.5"
        >
          <User className="w-3.5 h-3.5 text-slate-500" />
          <span>Cliente / Destinatário *</span>
        </label>
        {isCustomClient && (
          <button
            type="button"
            data-testid="btn-reset-walk-in"
            onClick={handleSelectWalkIn}
            className="text-[11px] font-medium text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Voltar ao Cliente Balcão</span>
          </button>
        )}
      </div>

      {/* Exibição do Cliente Selecionado */}
      {!isDropdownOpen && isCustomClient && (
        <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 border border-primary/40 rounded-lg shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="p-1.5 bg-primary/10 text-primary dark:text-primary-fixed rounded-md shrink-0">
              <UserCheck className="w-4 h-4" />
            </span>
            <div className="truncate">
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                {selectedClientData.nomeCompleto}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {selectedClientData.documento ? `Doc: ${selectedClientData.documento}` : 'Sem documento'}
                {selectedClientData.cidade ? ` • ${selectedClientData.cidade}` : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(true)}
            className="text-xs text-primary hover:text-primary-container font-semibold px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
          >
            Alterar
          </button>
        </div>
      )}

      {/* Caixa de Entrada / Busca quando não é cliente customizado ou dropdown está aberto */}
      {(isDropdownOpen || !isCustomClient) && (
        <div className="relative">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
            <input
              id={searchInputId}
              data-testid="input-search-client"
              type="text"
              disabled={disabled}
              value={searchTerm}
              placeholder={
                selectedClientData && !isCustomClient
                  ? 'Cliente Balcão (Padrão) - Digite para buscar cliente cadastrado...'
                  : 'Pesquise por nome, CPF/CNPJ ou telefone...'
              }
              onFocus={() => setIsDropdownOpen(true)}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (!isDropdownOpen) setIsDropdownOpen(true);
              }}
              className="w-full pl-9 pr-8 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:border-primary dark:focus:border-primary-fixed focus:ring-1 focus:ring-primary outline-none font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Dropdown de Opções */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 animate-in fade-in duration-150">
              {/* Opção Padrão: Cliente Balcão */}
              <button
                type="button"
                data-testid="option-client-walk-in"
                onClick={handleSelectWalkIn}
                className={`w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition flex items-center justify-between ${
                  !isCustomClient ? 'bg-amber-500/10' : ''
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 bg-amber-500/10 text-amber-600 rounded">
                    <User className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                      {DEFAULT_WALK_IN_CLIENT_NAME}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Venda avulsa / Consumidor final sem cadastro prévio
                    </span>
                  </div>
                </div>
                {!isCustomClient && <Check className="w-4 h-4 text-amber-600 shrink-0" />}
              </button>

              {/* Status de Carregamento */}
              {isLoading && (
                <div className="p-3 text-center text-xs text-slate-500">
                  Buscando clientes na base...
                </div>
              )}

              {/* Clientes Cadastrados */}
              {!isLoading &&
                searchResults.length > 0 &&
                searchResults.map((customer) => {
                  const isSelected = selectedClientData?.id === customer.id;
                  return (
                    <button
                      key={customer.id}
                      type="button"
                      data-testid={`option-client-${customer.id}`}
                      onClick={() => handleSelectCustomer(customer)}
                      className={`w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition flex items-center justify-between ${
                        isSelected ? 'bg-primary/10' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded shrink-0">
                          <Building2 className="w-4 h-4" />
                        </span>
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                            {customer.nomeCompleto}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {customer.documento ? `CPF/CNPJ: ${customer.documento}` : 'Sem documento'}
                            {customer.telefone ? ` • Tel: ${customer.telefone}` : ''}
                            {customer.cidade ? ` • ${customer.cidade}` : ''}
                          </p>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                    </button>
                  );
                })}

              {/* Nenhum cliente encontrado */}
              {!isLoading && searchTerm.trim().length >= 2 && searchResults.length === 0 && (
                <div className="p-4 text-center text-xs text-slate-500">
                  Nenhum cliente cadastrado encontrado com o termo "{searchTerm}".
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
