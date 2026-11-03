import React from 'react';
import { Search, MapPin, Phone, Building2, User } from 'lucide-react';
import type { CustomerSummaryDTO } from '../services/customersApi';
import { getInitials } from '../utils/customerHubUtils';

interface CustomerMasterSidebarProps {
  customers: CustomerSummaryDTO[];
  selectedCustomerId?: string;
  onSelectCustomer: (customer: CustomerSummaryDTO) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isLoading?: boolean;
}

export const CustomerMasterSidebar: React.FC<CustomerMasterSidebarProps> = ({
  customers,
  selectedCustomerId,
  onSelectCustomer,
  searchQuery,
  onSearchChange,
  isLoading = false,
}) => {
  return (
    <aside
      aria-label="Lista de Clientes"
      className="w-full md:w-80 lg:w-88 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-full min-h-[500px]"
    >
      {/* Top Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Clientes</h2>
          <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {customers.length}
          </span>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            role="searchbox"
            aria-label="Buscar clientes por nome, fone ou bairro"
            placeholder="Buscar por nome, fone, bairro..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
          />
        </div>
      </div>

      {/* Customer List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-2 space-y-1">
        {isLoading && customers.length === 0 ? (
          <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Carregando clientes...
          </div>
        ) : customers.length === 0 ? (
          <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Nenhum cliente encontrado.
          </div>
        ) : (
          customers.map((cust) => {
            const isSelected = cust.id === selectedCustomerId;
            const initials = getInitials(cust.nomeCompleto);
            const locationStr = [cust.bairro, cust.cidade].filter(Boolean).join(' • ');

            return (
              <button
                key={cust.id}
                type="button"
                onClick={() => onSelectCustomer(cust)}
                className={`w-full text-left p-3 rounded-lg flex items-start gap-3 transition-colors ${
                  isSelected
                    ? 'bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-slate-900 dark:text-white'
                    : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/60 border border-transparent text-slate-700 dark:text-slate-300'
                }`}
              >
                {/* Initials Avatar */}
                <div
                  className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center font-bold text-xs uppercase ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-800 text-white dark:bg-slate-700 dark:text-slate-200'
                  }`}
                >
                  {initials}
                </div>

                {/* Info Container */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-bold uppercase truncate text-slate-900 dark:text-slate-100">
                      {cust.nomeCompleto}
                    </p>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center gap-0.5">
                      {cust.personType === 'JURIDICA' ? (
                        <>
                          <Building2 className="w-2.5 h-2.5" /> PJ
                        </>
                      ) : (
                        <>
                          <User className="w-2.5 h-2.5" /> PF
                        </>
                      )}
                    </span>
                  </div>

                  {locationStr && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 flex-shrink-0 text-slate-400" />
                      <span>{locationStr}</span>
                    </p>
                  )}

                  {cust.telefone && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 flex-shrink-0 text-slate-400" />
                      <span>{cust.telefone}</span>
                    </p>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
};
