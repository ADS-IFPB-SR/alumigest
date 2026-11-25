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
  const renderCustomerList = () => {
    if (isLoading && customers.length === 0) {
      return (
        <div className="p-6 text-center text-sm text-on-surface-variant">
          Carregando clientes...
        </div>
      );
    }

    if (customers.length === 0) {
      return (
        <div className="p-6 text-center text-sm text-on-surface-variant">
          Nenhum cliente encontrado.
        </div>
      );
    }

    return customers.map((cust) => {
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
              ? 'bg-primary-container text-on-primary-container border border-primary/20'
              : 'hover:bg-surface-container-high border border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          {/* Initials Avatar */}
          <div
            className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center font-bold text-xs uppercase shadow-xs ${
              isSelected
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-highest text-on-surface'
            }`}
          >
            {initials}
          </div>

          {/* Info Container */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <p className={`text-xs font-bold uppercase truncate ${isSelected ? 'text-on-primary-container' : 'text-on-surface'}`}>
                {cust.nomeCompleto}
              </p>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                  isSelected 
                    ? 'bg-primary/20 text-on-primary-container' 
                    : 'bg-surface-container text-on-surface-variant'
                }`}
              >
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
              <p className={`text-[11px] truncate flex items-center gap-1 mt-0.5 ${isSelected ? 'text-on-primary-container opacity-80' : 'text-on-surface-variant'}`}>
                <MapPin className="w-3 h-3 flex-shrink-0 opacity-70" />
                <span>{locationStr}</span>
              </p>
            )}

            {cust.telefone && (
              <p className={`text-[11px] truncate flex items-center gap-1 mt-0.5 ${isSelected ? 'text-on-primary-container opacity-80' : 'text-on-surface-variant'}`}>
                <Phone className="w-3 h-3 flex-shrink-0 opacity-70" />
                <span>{cust.telefone}</span>
              </p>
            )}
          </div>
        </button>
      );
    });
  };

  return (
    <aside
      aria-label="Lista de Clientes"
      className="w-full md:w-80 lg:w-88 flex-shrink-0 border-r border-outline-variant bg-surface flex flex-col h-full min-h-[500px]"
    >
      {/* Top Header */}
      <div className="p-4 border-b border-outline-variant flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-on-surface">Clientes</h2>
          <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full bg-surface-container-high text-on-surface-variant">
            {customers.length}
          </span>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-outline-variant bg-surface-container-lowest">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input
            type="text"
            role="searchbox"
            aria-label="Buscar clientes por nome, fone ou bairro"
            placeholder="Buscar por nome, fone, bairro..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-outline-variant bg-surface text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary transition"
          />
        </div>
      </div>

      {/* Customer List */}
      <div className="flex-1 overflow-y-auto divide-y divide-outline-variant/30 p-2 space-y-1">
        {renderCustomerList()}
      </div>
    </aside>
  );
};