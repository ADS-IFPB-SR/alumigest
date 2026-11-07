import React, { useState } from 'react';
import { MapPin, Phone, CreditCard, Plus, Building2, User, Edit } from 'lucide-react';
import { WhatsAppIcon } from '../../../components/icons/WhatsAppIcon';
import type { ClientDashboardDTO } from '../services/customersApi';
import { getInitials, formatWhatsAppLink } from '../utils/customerHubUtils';
import { EditCustomerModal } from './EditCustomerModal';

interface CustomerHeroCardProps {
  customer: ClientDashboardDTO;
  onNewBudget: (customerId: string) => void;
}

export const CustomerHeroCard: React.FC<CustomerHeroCardProps> = ({ customer, onNewBudget }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const initials = getInitials(customer.nomeCompleto);

  const locationParts = [
    customer.bairro,
    customer.cidade && customer.uf ? `${customer.cidade} - ${customer.uf}` : customer.cidade || customer.uf,
  ].filter(Boolean);
  const locationStr = locationParts.join(', ');

  const whatsappHref = formatWhatsAppLink(customer.telefone, customer.nomeCompleto);
  const hasPhone = Boolean(customer.telefone && customer.telefone.replace(/\D/g, '').length >= 8);

  return (
    <>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 transition">
        {/* Client Identity & Details */}
        <div className="flex items-center gap-4 min-w-0">
          {/* Large Initials Avatar */}
          <div className="w-14 h-14 rounded-xl bg-slate-900 text-white dark:bg-slate-800 dark:text-blue-400 flex items-center justify-center font-bold text-xl uppercase flex-shrink-0 shadow-sm">
            {initials}
          </div>

          {/* Text Details */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg md:text-xl font-bold uppercase tracking-wide text-slate-900 dark:text-slate-100 truncate">
                {customer.nomeCompleto}
              </h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {customer.personType === 'JURIDICA' ? (
                  <>
                    <Building2 className="w-3 h-3 text-slate-500" /> PJ
                  </>
                ) : (
                  <>
                    <User className="w-3 h-3 text-slate-500" /> PF
                  </>
                )}
              </span>
            </div>

            <div className="flex items-center flex-wrap gap-y-1 gap-x-4 mt-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
              {locationStr && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>{locationStr}</span>
                </span>
              )}
              {customer.telefone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>{customer.telefone}</span>
                </span>
              )}
              {customer.documento && (
                <span className="flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>{customer.documento}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-3 flex-shrink-0 flex-wrap md:flex-nowrap">
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-sm transition"
          >
            <Edit className="w-4 h-4 text-slate-500" />
            <span>Editar</span>
          </button>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contatar cliente via WhatsApp"
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border transition ${
              hasPhone
                ? 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-sm'
                : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/50 text-slate-400 cursor-not-allowed pointer-events-none'
            }`}
          >
            <WhatsAppIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>WhatsApp</span>
          </a>

          <button
            type="button"
            onClick={() => onNewBudget(customer.id)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Orçamento</span>
          </button>
        </div>
      </div>

      <EditCustomerModal
        isOpen={isEditModalOpen}
        customerId={customer.id}
        onClose={() => setIsEditModalOpen(false)}
      />
    </>
  );
};