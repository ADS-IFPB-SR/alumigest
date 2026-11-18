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
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5 transition">
        {/* Client Identity & Details */}
        <div className="flex items-center gap-4 min-w-0">
          {/* Large Initials Avatar */}
          <div className="w-14 h-14 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold text-xl uppercase flex-shrink-0 shadow-xs">
            {initials}
          </div>

          {/* Text Details */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg md:text-xl font-bold uppercase tracking-wide text-on-surface truncate">
                {customer.nomeCompleto}
              </h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">
                {customer.personType === 'JURIDICA' ? (
                  <>
                    <Building2 className="w-3 h-3 opacity-70" /> PJ
                  </>
                ) : (
                  <>
                    <User className="w-3 h-3 opacity-70" /> PF
                  </>
                )}
              </span>
            </div>

            <div className="flex items-center flex-wrap gap-y-1 gap-x-4 mt-1.5 text-xs text-on-surface-variant font-medium">
              {locationStr && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 opacity-70 flex-shrink-0" />
                  <span>{locationStr}</span>
                </span>
              )}
              {customer.telefone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 opacity-70 flex-shrink-0" />
                  <span>{customer.telefone}</span>
                </span>
              )}
              {customer.documento && (
                <span className="flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 opacity-70 flex-shrink-0" />
                  <span>{customer.documento}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-3 flex-shrink-0 flex-wrap md:flex-nowrap">
          {/* Botão Secundário M3 */}
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high shadow-2xs transition"
          >
            <Edit className="w-4 h-4 opacity-70" />
            <span>Editar</span>
          </button>

          {/* Botão Secundário M3 (Dinâmico para WhatsApp) */}
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contatar cliente via WhatsApp"
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border transition ${
              hasPhone
                ? 'border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high shadow-2xs'
                : 'border-outline-variant bg-surface-container text-on-surface-variant opacity-50 cursor-not-allowed pointer-events-none'
            }`}
          >
            <WhatsAppIcon className={`w-4 h-4 ${hasPhone ? 'text-[#25D366]' : 'opacity-50'}`} />
            <span>WhatsApp</span>
          </a>

          {/* Botão Primário M3 */}
          <button
            type="button"
            onClick={() => onNewBudget(customer.id)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-primary text-on-primary hover:opacity-90 active:scale-95 shadow-2xs transition"
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