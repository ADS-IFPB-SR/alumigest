import { useState } from 'react';
import type { ProductCategory } from '../../types';
import { useCreateProductCategory } from '../../hooks/useCatalog';
import { Modal } from '../../../../components/ui/Modal';
import { Button } from '../../../../components/ui/Button';

interface ProductGeneralInfoProps {
  name: string;
  setName: (val: string) => void;
  categoryId: string;
  setCategoryId: (val: string) => void;
  categories: ProductCategory[] | undefined;
}

export function ProductGeneralInfo({
  name,
  setName,
  categoryId,
  setCategoryId,
  categories
}: ProductGeneralInfoProps) {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');

  const { mutate: createCategory, isPending: isCreatingCategory } = useCreateProductCategory();

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    createCategory(
      { name: newCategoryName.trim(), description: newCategoryDesc.trim() || undefined },
      {
        onSuccess: (newCat) => {
          if (newCat?.id) {
            setCategoryId(newCat.id);
          }
          setNewCategoryName('');
          setNewCategoryDesc('');
          setIsCategoryModalOpen(false);
        },
      }
    );
  };

  return (
    <section className="bg-surface-container-lowest border border-outline-variant rounded-lg p-lg shadow-sm">
      <div className="flex items-center justify-between pb-xs mb-md border-b border-outline-variant">
        <h3 className="font-title-sm text-title-sm text-on-surface flex items-center gap-sm">
          <span className="material-symbols-outlined text-[20px] text-primary">info</span>
          Informações Gerais
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
        {/* Nome do Produto */}
        <div>
          <label htmlFor="product-name" className="block font-label-md text-label-md font-medium text-on-surface mb-xs">
            Nome do Produto *
          </label>
          <input 
            id="product-name"
            type="text"
            className="w-full px-sm py-sm bg-surface-container-lowest border border-outline rounded-sm font-body-sm text-body-sm text-on-surface focus:border-primary focus:border-2 focus:outline-none transition-all"
            placeholder="Ex: Janela Basculante Padrão, Frente de Gaveta..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        
        {/* Categoria */}
        <div>
          <div className="flex items-center justify-between mb-xs">
            <label htmlFor="product-category" className="block font-label-md text-label-md font-medium text-on-surface">
              Categoria *
            </label>
            <button
              type="button"
              onClick={() => setIsCategoryModalOpen(true)}
              className="text-primary hover:text-primary-container text-xs font-semibold flex items-center gap-[2px] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Nova Categoria
            </button>
          </div>
          <select 
            id="product-category"
            className="w-full px-sm py-sm bg-surface-container-lowest border border-outline rounded-sm font-body-sm text-body-sm text-on-surface focus:border-primary focus:border-2 focus:outline-none transition-all"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">Selecionar categoria...</option>
            {categories?.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Modal de Criação de Categoria */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Nova Categoria de Produto"
        footer={
          <div className="flex items-center justify-end gap-sm w-full">
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsCategoryModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="button"
              onClick={handleCreateCategory}
              disabled={isCreatingCategory || !newCategoryName.trim()}
            >
              {isCreatingCategory ? 'Salvando...' : 'Criar Categoria'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreateCategory} className="flex flex-col gap-md">
          <div>
            <label htmlFor="modal-cat-name" className="block font-label-md text-label-md font-medium text-on-surface mb-xs">
              Nome da Categoria *
            </label>
            <input
              id="modal-cat-name"
              type="text"
              className="w-full px-sm py-sm bg-surface-container-lowest border border-outline rounded-sm font-body-sm text-body-sm text-on-surface focus:border-primary focus:border-2 focus:outline-none transition-all"
              placeholder="Ex: Gavetas, Fachadas, Divisórias..."
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="modal-cat-desc" className="block font-label-md text-label-md font-medium text-on-surface mb-xs">
              Descrição (opcional)
            </label>
            <textarea
              id="modal-cat-desc"
              className="w-full bg-surface-container-lowest border border-outline rounded-sm p-sm font-body-sm text-body-sm text-on-surface focus:border-primary focus:border-2 focus:outline-none transition-all resize-none h-20"
              placeholder="Ex: Frentes de gavetas em perfis de alumínio e vidro..."
              value={newCategoryDesc}
              onChange={(e) => setNewCategoryDesc(e.target.value)}
            />
          </div>
        </form>
      </Modal>
    </section>
  );
}
