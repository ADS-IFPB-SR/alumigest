import React, { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useProducts } from '../../../catalog/hooks/useCatalog';
import { WindowSvgPreview } from './WindowSvgPreview';
import { getDefaultSvgTemplateForCatalogType } from '../../utils/mapCatalogTemplate';

interface ProductPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (productId: string) => void;
}

type ModalCategoryFilter = 'TODOS' | 'PORTAS' | 'JANELAS' | 'BOX' | 'MOVEIS';

const CATEGORY_FILTERS: { id: ModalCategoryFilter; label: string; icon: string }[] = [
  { id: 'TODOS', label: 'Todos', icon: 'apps' },
  { id: 'PORTAS', label: 'Portas', icon: 'door_front' },
  { id: 'JANELAS', label: 'Janelas', icon: 'window' },
  { id: 'BOX', label: 'Box', icon: 'shower' },
  { id: 'MOVEIS', label: 'Móveis / Painéis', icon: 'kitchen' },
];

export const ProductPickerModal: React.FC<ProductPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
}) => {
  const { data: productsData, isLoading } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ModalCategoryFilter>('TODOS');

  // Bloqueio de scroll da página de fundo e tecla Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const products = useMemo(() => {
    if (!productsData?.content) return [];
    return productsData.content.filter((p: any) => p.isActive && p.templateConfig);
  }, [productsData]);

  const filteredProducts = useMemo(() => {
    return products.filter((p: any) => {
      // Filtro de texto
      const matchesSearch = !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      // Filtro de categoria
      if (selectedCategory === 'TODOS') return true;

      const catNorm = (p.categoryName || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      if (selectedCategory === 'PORTAS') {
        return catNorm.includes('porta') || (p.templateType && (p.templateType.startsWith('SWING') || p.templateType.startsWith('SLIDING')));
      }
      if (selectedCategory === 'JANELAS') {
        return catNorm.includes('janela') || (p.templateType && p.templateType.startsWith('AWNING'));
      }
      if (selectedCategory === 'BOX') {
        return catNorm.includes('box') || p.templateType === 'SLIDING_DOOR_1F';
      }
      if (selectedCategory === 'MOVEIS') {
        return catNorm.includes('mov') || catNorm.includes('pain') || catNorm.includes('gaveta') || p.templateType === 'FRONT_DRAWER' || p.templateType === 'FIXED_PANEL';
      }

      return true;
    });
  }, [products, searchTerm, selectedCategory]);

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-xs sm:p-md lg:p-lg animate-fadeIn" 
      aria-modal="true" 
      aria-labelledby="product-picker-title"
    >
      {/* Backdrop com blur cobrindo 100% da viewport (acima de Header e Sidebar) */}
      <button 
        type="button"
        className="fixed inset-0 w-full h-full bg-black/70 backdrop-blur-xs transition-opacity cursor-default border-0" 
        onClick={onClose} 
        tabIndex={-1}
        aria-label="Fechar fundo do modal" 
      />
      
      {/* Conteúdo do Modal */}
      <div className="relative bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-[1100px] h-[90vh] max-h-[850px] shadow-2xl flex flex-col overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header do Modal */}
        <header className="px-md sm:px-lg py-sm sm:py-md border-b border-outline-variant flex items-center justify-between shrink-0 bg-surface-container-low">
          <div>
            <div className="flex items-center gap-sm">
              <h2 id="product-picker-title" className="font-headline text-headline-sm sm:text-headline-md font-bold text-on-surface">
                Selecione a Esquadria do Catálogo
              </h2>
              <span className="font-label-bold text-xs bg-surface-container-high text-secondary px-2 py-0.5 rounded-full">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'disponível' : 'disponíveis'}
              </span>
            </div>
            <p className="font-body-sm text-xs sm:text-sm text-secondary mt-0.5">
              Escolha uma esquadria cadastrada para carregar as configurações e insumos no orçamento.
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1.5 hover:bg-surface-container-high rounded-full text-secondary hover:text-on-surface transition-colors" 
            aria-label="Fechar modal"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </header>

        {/* Barra de Filtros e Busca */}
        <div className="px-md sm:px-lg py-sm border-b border-outline-variant shrink-0 bg-surface flex flex-col sm:flex-row gap-xs sm:gap-sm items-stretch sm:items-center justify-between">
          {/* Campo de Busca */}
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-secondary text-[20px]">
              search
            </span>
            <input
              type="text"
              placeholder="Buscar por nome da esquadria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-md py-2 bg-surface-container-lowest border border-outline-variant rounded-lg font-body text-xs sm:text-sm text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors"
            />
          </div>

          {/* Filtro por Categorias */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none flex-none">
            {CATEGORY_FILTERS.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-primary text-on-primary shadow-xs font-semibold'
                      : 'bg-surface-container-low text-secondary hover:bg-surface-container hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid de Produtos */}
        <main className="flex-1 overflow-y-auto p-md sm:p-lg bg-surface">
          {isLoading ? (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-secondary gap-sm">
              <span className="material-symbols-outlined animate-spin text-[36px] text-primary">
                progress_activity
              </span>
              <span className="text-sm font-medium">Carregando catálogo de esquadrias...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-secondary gap-sm border-2 border-dashed border-outline-variant/60 rounded-xl my-4 p-lg text-center">
              <span className="material-symbols-outlined text-[56px] text-outline">
                inventory_2
              </span>
              <p className="text-base font-semibold text-on-surface">
                {products.length === 0 ? 'Nenhuma esquadria configurada no catálogo' : 'Nenhuma esquadria encontrada'}
              </p>
              <p className="text-xs text-secondary max-w-sm">
                {products.length === 0
                  ? 'Cadastre e configure novos modelos de esquadrias no menu Produtos para utilizá-los na montagem de orçamentos.'
                  : 'Tente ajustar os termos de busca ou selecione outra categoria acima.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-sm sm:gap-md">
              {filteredProducts.map((product: any) => {
                const templateType = getDefaultSvgTemplateForCatalogType(
                  product.templateType,
                  product.name,
                  product.templateConfig
                );
                
                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => onSelectProduct(product.id)}
                    className="flex flex-col text-left bg-surface-container-low dark:bg-surface-container border border-outline-variant/70 hover:border-primary dark:hover:border-primary/60 rounded-xl overflow-hidden hover:shadow-lg active:scale-[0.99] transition-all group focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
                  >
                    {/* Miniatura CAD com Desenho 100% Completo */}
                    <div className="w-full h-48 sm:h-52 bg-surface-container-lowest/80 dark:bg-surface-container-lowest relative p-3 flex items-center justify-center border-b border-outline-variant/40 group-hover:border-primary/20 transition-colors">
                      <WindowSvgPreview
                        templateType={templateType}
                        widthMm={1000}
                        heightMm={1000}
                        aluminumColor={product.templateConfig?.aluminumColor}
                        glassFinish={product.templateConfig?.glassColor}
                        handleConfig={product.templateConfig?.handleConfig || { handleType: 'NONE' }}
                        drillingConfig={{ 
                          holeCount: product.templateConfig?.drillingConfig?.holeCount || 0,
                          divisionType: product.templateConfig?.drillingConfig?.drillingMode === 'CUSTOM' ? 'CUSTOM_DISTANCE' : 'EQUAL',
                          customDistancesMm: product.templateConfig?.drillingConfig?.customPositionsMm 
                        }}
                        openingDirection={product.templateConfig?.openingDirection || 'LEFT_TO_RIGHT'}
                        minimal={true}
                        baseWidth="100%"
                        maxHeight="100%"
                      />
                    </div>

                    {/* Detalhes do Modelo - Somente o Nome Completo */}
                    <div className="p-3.5 flex items-center justify-center flex-1 min-h-[58px] bg-surface-container-low dark:bg-surface-container group-hover:bg-surface-container-high transition-colors text-center">
                      <h3 
                        className="font-title-sm text-sm font-bold text-on-surface leading-snug break-words group-hover:text-primary transition-colors"
                      >
                        {product.name}
                      </h3>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>,
    document.body
  );
};
