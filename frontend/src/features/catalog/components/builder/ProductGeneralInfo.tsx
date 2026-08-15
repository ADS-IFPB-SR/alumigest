import React from 'react';
import type { ProductCategory } from '../../types';

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
          <label className="block font-label-bold text-label-bold text-on-surface mb-xs">
            Nome do Template *
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
            onChange={(e) => setLaborCost(e.target.value)}
          />
        </div>
        
        <div className="col-span-1 md:col-span-2">
          <label className="block font-label-bold text-label-bold text-on-surface mb-xs">
            Descrição Breve
          </label>
          <input 
            type="text"
            className="w-full px-sm py-sm bg-surface-container-lowest border border-outline rounded-sm font-body-sm text-body-sm text-on-surface focus:border-primary focus:border-2 focus:outline-none transition-all"
            placeholder="Notas internas sobre este template (opcional)"
          />
        </div>
      </div>
    </section>
  );
}
