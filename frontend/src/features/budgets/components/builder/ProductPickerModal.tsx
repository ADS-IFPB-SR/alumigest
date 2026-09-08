import React, { useMemo, useState } from 'react';
import { useProducts } from '../../../catalog/hooks/useCatalog';
import { WindowSvgPreview } from './WindowSvgPreview';
import { DOOR_TEMPLATE_LABELS } from '../../../catalog/types/templates';
import { getDefaultSvgTemplateForCatalogType } from '../../utils/mapCatalogTemplate';

interface ProductPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (productId: string) => void;
}

export const ProductPickerModal: React.FC<ProductPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
}) => {
  const { data: productsData, isLoading } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');

  const products = useMemo(() => {
    if (!productsData?.content) return [];
    return productsData.content.filter((p: any) => p.isActive);
  }, [productsData]);

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    return products.filter((p: any) => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-md sm:p-lg" role="dialog" aria-modal="true" aria-labelledby="product-picker-title">
      <div className="absolute inset-0 bg-scrim/60 backdrop-blur-sm transition-opacity" onClick={onClose} aria-hidden="true" />
      
      <div className="relative bg-surface-container-lowest w-full max-w-[1000px] h-full max-h-[90vh] rounded-xl flex flex-col shadow-lg animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <header className="px-lg py-md border-b border-outline-variant flex items-center justify-between shrink-0">
          <div>
            <h2 id="product-picker-title" className="font-headline text-headline-sm font-bold text-on-surface">
              Selecione o Produto
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Escolha um dos produtos cadastrados no catálogo para adicionar ao orçamento.
            </p>
          </div>
          <button onClick={onClose} className="p-sm hover:bg-surface-container rounded-full text-on-surface-variant hover:text-on-surface transition-colors" aria-label="Fechar modal">
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        {/* Search */}
        <div className="px-lg py-sm border-b border-outline-variant shrink-0 bg-surface">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input
              type="text"
              placeholder="Buscar por nome do produto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-xl pr-md py-sm bg-surface-container-lowest border border-outline-variant rounded-md font-body text-body-md focus:border-primary focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-lg bg-surface">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-on-surface-variant gap-sm">
              <span className="material-symbols-outlined animate-spin text-[32px]">progress_activity</span>
              <span>Carregando produtos...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-on-surface-variant gap-sm">
              <span className="material-symbols-outlined text-[48px]">inventory_2</span>
              <p>Nenhum produto encontrado.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md">
              {filteredProducts.map((product: any) => {
                const templateType = getDefaultSvgTemplateForCatalogType(
                  product.templateType,
                  product.name,
                  product.templateConfig
                );
                
                return (
                  <button
                    key={product.id}
                    onClick={() => onSelectProduct(product.id)}
                    className="flex flex-col text-left bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden hover:border-primary hover:shadow-md transition-all group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    {/* Preview (4:3 aspect ratio area) */}
                    <div className="w-full aspect-[4/3] bg-surface-container relative p-sm">
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
                        templateName={DOOR_TEMPLATE_LABELS[templateType] || templateType}
                      />
                    </div>
                    {/* Details */}
                    <div className="p-sm flex flex-col gap-xs flex-1 border-t border-outline-variant bg-surface-container-lowest group-hover:bg-primary/5 transition-colors">
                      <h3 className="font-label font-bold text-on-surface line-clamp-1" title={product.name}>
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-1 mt-auto">
                        <span className="material-symbols-outlined text-[14px] text-on-surface-variant">category</span>
                        <span className="font-body-sm text-[11px] text-on-surface-variant truncate">
                          {DOOR_TEMPLATE_LABELS[templateType] || templateType}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
