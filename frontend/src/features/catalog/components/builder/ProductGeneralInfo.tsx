import React from 'react';
import type { ProductCategory } from '../../types';
import { formatCurrencyInput } from '../../../../utils/formatters';

interface ProductGeneralInfoProps {
  name: string;
  setName: (val: string) => void;
  categoryId: string;
  setCategoryId: (val: string) => void;
  laborCost: string;
  setLaborCost: (val: string) => void;
  categories: ProductCategory[] | undefined;
}

export function ProductGeneralInfo({
  name,
  setName,
  categoryId,
  setCategoryId,
  laborCost,
  setLaborCost,
  categories
}: ProductGeneralInfoProps) {
  return (
    <section className="bg-surface-container-lowest border border-outline-variant rounded-lg p-lg shadow-sm">
      <h3 className="font-title-sm text-title-sm text-on-surface mb-md pb-xs border-b border-outline-variant">
        Informações Gerais
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
        <div className="col-span-1 md:col-span-2">
          <label className="block font-label-md text-label-md font-medium text-on-surface mb-xs">
            Nome do Produto *
          </label>
          <input 
            type="text"
            className="w-full px-sm py-sm bg-surface-container-lowest border border-outline rounded-sm font-body-sm text-body-sm text-on-surface focus:border-primary focus:border-2 focus:outline-none transition-all"
            placeholder="Ex: Janela Basculante Padrão"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        
        <div>
          <label className="block font-label-bold text-label-bold text-on-surface mb-xs">
            Categoria
          </label>
          <select 
            className="w-full px-sm py-sm bg-surface-container-lowest border border-outline rounded-sm font-body-sm text-body-sm text-on-surface focus:border-primary focus:border-2 focus:outline-none transition-all"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">Selecionar...</option>
            {categories?.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block font-label-bold text-label-bold text-on-surface mb-xs">
            Mão de Obra (R$)
          </label>
          <input 
            type="text"
            className="w-full px-sm py-sm bg-surface-container-lowest border border-outline rounded-sm font-data-mono text-data-mono text-on-surface focus:border-primary focus:border-2 focus:outline-none transition-all"
            placeholder="0,00"
            value={laborCost}
            onChange={(e) => setLaborCost(formatCurrencyInput(e.target.value))}
          />
        </div>
        
        <div className="col-span-1 md:col-span-2">
          <label className="block font-label-bold text-label-bold text-on-surface mb-xs">
            Descrição Breve
          </label>
          <textarea 
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-md p-sm font-body text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all shadow-sm resize-none h-24"
            placeholder="Notas internas sobre este produto (opcional)"
          />
        </div>
      </div>
    </section>
  );
}
