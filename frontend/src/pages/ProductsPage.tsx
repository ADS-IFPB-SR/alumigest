import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useProducts, useInactivateProduct } from '../features/catalog/hooks/useCatalog';
import { TemplateSVGThumbnail } from '../features/catalog/components/templates';
import { CategoryBadges } from '../features/catalog/components/CategoryBadges';
import type { Product } from '../features/catalog/types';

type CategoryColumnId = 'Portas' | 'Janelas' | 'Box' | 'Móveis / Painéis';

interface CategoryColumnDef {
  id: CategoryColumnId;
  label: string;
  icon: string;
  colorClass: string;
  badgeBg: string;
  badgeText: string;
  description: string;
}

const CATEGORY_COLUMNS: CategoryColumnDef[] = [
  {
    id: 'Portas',
    label: 'Portas',
    icon: 'door_front',
    colorClass: 'border-blue-500/20 bg-blue-50/30 dark:bg-blue-950/20 dark:border-blue-800/30',
    badgeBg: 'bg-blue-100 dark:bg-blue-950/80 border border-blue-200/60 dark:border-blue-800/50',
    badgeText: 'text-blue-800 dark:text-blue-300',
    description: 'Giro, pivotante e correr',
  },
  {
    id: 'Janelas',
    label: 'Janelas',
    icon: 'window',
    colorClass: 'border-cyan-500/20 bg-cyan-50/30 dark:bg-cyan-950/20 dark:border-cyan-800/30',
    badgeBg: 'bg-cyan-100 dark:bg-cyan-950/80 border border-cyan-200/60 dark:border-cyan-800/50',
    badgeText: 'text-cyan-800 dark:text-cyan-300',
    description: 'Correr, basculante e maxim-ar',
  },
  {
    id: 'Box',
    label: 'Box',
    icon: 'shower',
    colorClass: 'border-indigo-500/20 bg-indigo-50/30 dark:bg-indigo-950/20 dark:border-indigo-800/30',
    badgeBg: 'bg-indigo-100 dark:bg-indigo-950/80 border border-indigo-200/60 dark:border-indigo-800/50',
    badgeText: 'text-indigo-800 dark:text-indigo-300',
    description: 'Frontal e canto para banheiro',
  },
  {
    id: 'Móveis / Painéis',
    label: 'Móveis / Painéis',
    icon: 'kitchen',
    colorClass: 'border-amber-500/20 bg-amber-50/30 dark:bg-amber-950/20 dark:border-amber-800/30',
    badgeBg: 'bg-amber-100 dark:bg-amber-950/80 border border-amber-200/60 dark:border-amber-800/50',
    badgeText: 'text-amber-800 dark:text-amber-300',
    description: 'Frentes de gaveta e painéis',
  },
];

function classifyProductCategory(product: Product): CategoryColumnId {
  const raw = (product.categoryName || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (raw.includes('porta')) return 'Portas';
  if (raw.includes('janela')) return 'Janelas';
  if (raw.includes('box')) return 'Box';
  if (raw.includes('mov') || raw.includes('pain') || raw.includes('gaveta')) return 'Móveis / Painéis';

  // Fallback por tipo de template
  if (product.templateType) {
    if (product.templateType.startsWith('AWNING')) return 'Janelas';
    if (product.templateType === 'FRONT_DRAWER' || product.templateType === 'FIXED_PANEL') return 'Móveis / Painéis';
    if (product.templateType === 'SLIDING_DOOR_1F') return 'Box';
    if (product.templateType.startsWith('SWING') || product.templateType.startsWith('SLIDING')) return 'Portas';
  }

  return 'Portas';
}

const renderPreview = (row: Product) => (
  <TemplateSVGThumbnail templateType={row.templateType} size={44} />
);

const renderName = (row: Product) => (
  <span className="font-title-sm text-title-sm text-on-surface font-semibold">{row.name}</span>
);

const renderCategory = (row: Product) => (
  <span className="font-body text-body-sm text-secondary">{row.categoryName}</span>
);

const renderRequirements = (row: Product) => (
  <CategoryBadges categories={row.categoryRequirements} />
);

const PRODUCT_TABLE_COLUMNS = [
  { header: 'Preview', accessor: renderPreview, className: 'w-14' },
  { header: 'Nome da Esquadria', accessor: renderName },
  { header: 'Categoria', accessor: renderCategory },
  { header: 'Insumos no Orçamento', accessor: renderRequirements },
];

const SKELETON_ITEMS = ['sk-1', 'sk-2', 'sk-3', 'sk-4'] as const;

export function ProductTab() {
  const navigate = useNavigate();
  const { data: productsData, isLoading: isLoadingProducts } = useProducts();
  const inactivateProductMutation = useInactivateProduct();
  const [viewMode, setViewMode] = useState<'columns' | 'table'>('table');
  const [activeMobileCategory, setActiveMobileCategory] = useState<CategoryColumnId>('Portas');
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const products = productsData?.content || [];

  // Agrupamento dos produtos nas 4 colunas canônicas
  const groupedProducts = useMemo(() => {
    const map: Record<CategoryColumnId, Product[]> = {
      Portas: [],
      Janelas: [],
      Box: [],
      'Móveis / Painéis': [],
    };

    for (const prod of products) {
      const cat = classifyProductCategory(prod);
      map[cat].push(prod);
    }

    return map;
  }, [products]);

  const handleCreate = () => {
    navigate('/produtos/novo');
  };

  const handleEdit = (item: Product) => {
    navigate(`/produtos/${item.id}/editar`);
  };

  const handleDeleteClick = (item: Product) => {
    setProductToDelete(item);
  };

  const handleConfirmDelete = () => {
    if (!productToDelete) return;
    inactivateProductMutation.mutate(productToDelete.id, {
      onSuccess: () => {
        setProductToDelete(null);
      },
    });
  };

  // Metadados da categoria móvel ativa
  const currentMobileCategoryDef = useMemo(() => {
    return CATEGORY_COLUMNS.find((c) => c.id === activeMobileCategory) || CATEGORY_COLUMNS[0];
  }, [activeMobileCategory]);

  if (isLoadingProducts) {
    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden p-xs sm:p-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-md gap-sm flex-none">
          <div>
            <div className="h-8 w-48 bg-surface-container-high rounded-md animate-pulse" />
            <div className="h-4 w-72 bg-surface-container-high rounded-md animate-pulse mt-sm" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-md flex-1">
          {SKELETON_ITEMS.map((skId) => (
            <div key={skId} className="bg-surface-container-low dark:bg-surface-container border border-outline-variant/60 rounded-xl p-md flex flex-col gap-md">
              <div className="h-6 w-32 bg-surface-container-high rounded animate-pulse" />
              <div className="h-24 bg-surface-container-high rounded-lg animate-pulse" />
              <div className="h-24 bg-surface-container-high rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Page Header Responsivo */}
      <div className="flex flex-col gap-sm mb-md flex-none">
        <div className="flex items-center justify-between gap-sm flex-wrap">
          <div>
            <div className="flex items-center gap-sm">
              <h2 className="font-headline text-headline-sm sm:text-headline-md font-bold text-primary leading-tight">
                Produtos Finais
              </h2>
              <span className="font-label-bold text-xs bg-surface-container-high text-secondary px-2 py-0.5 rounded-full">
                {products.length} {products.length === 1 ? 'modelo' : 'modelos'}
              </span>
            </div>
            <p className="font-body text-xs sm:text-sm text-secondary mt-0.5 hidden sm:block">
              Gerencie as esquadrias, janelas e portas organizadas por categoria de produto.
            </p>
          </div>

          <div className="flex items-center gap-xs sm:gap-sm">
            {/* Alternador de Visualização: 1ª opção Tabela, 2ª opção Colunas */}
            <div className="flex items-center bg-surface-container rounded-lg p-0.5 border border-outline-variant/60">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-md font-body text-xs sm:text-sm font-medium transition-all ${
                  viewMode === 'table'
                    ? 'bg-surface-container-lowest dark:bg-surface-container-highest text-primary dark:text-primary-fixed shadow-xs font-semibold'
                    : 'text-secondary hover:text-on-surface hover:bg-surface-container-high/40'
                }`}
                title="Visualizar em formato de tabela"
              >
                <span className="material-symbols-outlined text-[18px]">table_rows</span>
                <span className="hidden xs:inline">Tabela</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('columns')}
                className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-md font-body text-xs sm:text-sm font-medium transition-all ${
                  viewMode === 'columns'
                    ? 'bg-surface-container-lowest dark:bg-surface-container-highest text-primary dark:text-primary-fixed shadow-xs font-semibold'
                    : 'text-secondary hover:text-on-surface hover:bg-surface-container-high/40'
                }`}
                title="Visualizar em 4 colunas por categoria"
              >
                <span className="material-symbols-outlined text-[18px]">view_column</span>
                <span className="hidden xs:inline">Colunas</span>
              </button>
            </div>

            <Button 
              variant="primary"
              icon="add"
              onClick={handleCreate}
              className="text-xs sm:text-sm"
            >
              Nova Esquadria
            </Button>
          </div>
        </div>
      </div>

      {/* Visualização de Colunas */}
      {viewMode === 'columns' ? (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          
          {/* ========================================================
              VERSÃO MOBILE (< xl): Segmented Pills com toque ágil
              ======================================================== */}
          <div className="flex xl:hidden flex-col flex-1 min-h-0 overflow-hidden">
            {/* Barra de Pílulas Horizontais Deslizantes */}
            <div className="flex items-center gap-xs overflow-x-auto pb-2 mb-2 flex-none scrollbar-none">
              {CATEGORY_COLUMNS.map((col) => {
                const count = groupedProducts[col.id].length;
                const isActive = activeMobileCategory === col.id;

                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => setActiveMobileCategory(col.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full font-body text-xs font-semibold whitespace-nowrap transition-all shadow-xs ${
                      isActive
                        ? 'bg-primary text-white ring-2 ring-primary/30 shadow-sm scale-[1.02]'
                        : 'bg-surface-container-low text-secondary hover:bg-surface-container hover:text-on-surface'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{col.icon}</span>
                    <span>{col.label}</span>
                    <span
                      className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ${
                        isActive
                          ? 'bg-white/25 text-white'
                          : 'bg-surface-container-high text-secondary'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Subtítulo informativo da Categoria Selecionada no Mobile */}
            <div className="flex items-center justify-between px-1 py-1.5 mb-2 flex-none bg-surface-container-low/60 rounded-lg border border-outline-variant/40">
              <div className="flex items-center gap-1.5 text-xs text-secondary pl-1">
                <span className="material-symbols-outlined text-[16px] text-primary">
                  {currentMobileCategoryDef.icon}
                </span>
                <span className="font-medium">{currentMobileCategoryDef.description}</span>
              </div>
              <span className="text-[11px] font-semibold text-primary pr-1">
                {groupedProducts[activeMobileCategory].length} modelos
              </span>
            </div>

            {/* Lista Vertical de Cards no Mobile com Rolagem Fluida */}
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-sm min-h-0 pb-6">
              {groupedProducts[activeMobileCategory].length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-lg text-center border-2 border-dashed border-outline-variant/40 rounded-xl my-4">
                  <span className="material-symbols-outlined text-outline text-[40px] mb-sm">
                    {currentMobileCategoryDef.icon}
                  </span>
                  <p className="text-sm font-medium text-on-surface">
                    Nenhum modelo cadastrado em {currentMobileCategoryDef.label}
                  </p>
                  <p className="text-xs text-secondary mt-1 mb-md">
                    Crie uma esquadria com template desta categoria para listar aqui.
                  </p>
                  <Button variant="outline" icon="add" onClick={handleCreate} className="text-xs">
                    Cadastrar em {currentMobileCategoryDef.label}
                  </Button>
                </div>
              ) : (
                groupedProducts[activeMobileCategory].map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => handleEdit(prod)}
                    className="group relative bg-surface-container-low dark:bg-surface-container hover:bg-surface-container dark:hover:bg-surface-container-high active:bg-surface-container-high border border-outline-variant/60 hover:border-primary/50 dark:hover:border-primary/50 rounded-xl p-sm sm:p-md transition-all shadow-xs cursor-pointer flex flex-col gap-xs"
                  >
                    <div className="flex items-center gap-sm">
                      <div className="flex-none">
                        <TemplateSVGThumbnail templateType={prod.templateType} size={52} />
                      </div>

                      <div className="flex-1 min-w-0 pr-16">
                        <h4 className="font-title-sm text-sm font-semibold text-on-surface leading-snug break-words group-hover:text-primary transition-colors">
                          {prod.name}
                        </h4>
                      </div>

                      {/* Botões de Ação no Mobile: Editar e Excluir */}
                      <div className="absolute top-2.5 right-2 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(prod);
                          }}
                          className="w-7 h-7 flex items-center justify-center text-secondary hover:text-primary active:bg-surface-container-high rounded-full transition-colors"
                          title={`Editar ${prod.name}`}
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(prod);
                          }}
                          className="w-7 h-7 flex items-center justify-center text-secondary hover:text-error active:bg-error-container/40 rounded-full transition-colors"
                          title={`Excluir ${prod.name}`}
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </div>

                    {prod.categoryRequirements && prod.categoryRequirements.length > 0 && (
                      <div className="pt-2 border-t border-outline-variant/30 flex items-center justify-between">
                        <div className="scale-90 origin-left">
                          <CategoryBadges categories={prod.categoryRequirements} />
                        </div>
                        <span className="material-symbols-outlined text-outline/50 text-[18px] group-hover:text-primary transition-colors">
                          chevron_right
                        </span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ========================================================
              VERSÃO DESKTOP (>= xl): 4 Colunas Canônicas Lado a Lado
              ======================================================== */}
          <div className="hidden xl:grid xl:grid-cols-4 gap-md flex-1 min-h-0 overflow-hidden pb-sm">
            {CATEGORY_COLUMNS.map((col) => {
              const items = groupedProducts[col.id];

              return (
                <div
                  key={col.id}
                  className="flex flex-col bg-surface-container-lowest border border-outline-variant/70 rounded-xl shadow-xs overflow-hidden h-full min-w-0"
                >
                  {/* Cabeçalho Fixo da Coluna com Ícone e Contador */}
                  <div className="p-md border-b border-outline-variant/60 bg-surface-container/60 flex items-center justify-between flex-none">
                    <div className="flex items-center gap-sm min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary flex-none">
                        <span className="material-symbols-outlined text-[20px]">{col.icon}</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-title-sm text-title-sm font-bold text-on-surface leading-tight truncate">
                          {col.label}
                        </h3>
                        <p className="text-[11px] text-secondary leading-tight truncate">
                          {col.description}
                        </p>
                      </div>
                    </div>

                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-none ${col.badgeBg} ${col.badgeText}`}>
                      {items.length}
                    </span>
                  </div>

                  {/* Lista de Modelos com Scroll Vertical Interno */}
                  <div className="flex-1 overflow-y-auto p-sm flex flex-col gap-sm">
                    {items.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center p-md text-center border-2 border-dashed border-outline-variant/40 rounded-lg my-sm">
                        <span className="material-symbols-outlined text-outline text-[32px] mb-xs">
                          {col.icon}
                        </span>
                        <p className="text-xs font-medium text-secondary">
                          Nenhum modelo cadastrado em {col.label}
                        </p>
                      </div>
                    ) : (
                      items.map((prod) => (
                        <div
                          key={prod.id}
                          onClick={() => handleEdit(prod)}
                          className="group relative bg-surface-container-low dark:bg-surface-container hover:bg-surface-container dark:hover:bg-surface-container-high border border-outline-variant/60 hover:border-primary/50 dark:hover:border-primary/50 rounded-lg p-sm transition-all shadow-xs hover:shadow-sm cursor-pointer flex flex-col gap-xs"
                        >
                          <div className="flex items-start gap-sm">
                            <div className="flex-none">
                              <TemplateSVGThumbnail templateType={prod.templateType} size={48} />
                            </div>

                            <div className="flex-1 min-w-0 pr-16">
                              <h4 className="font-title-sm text-xs sm:text-sm font-semibold text-on-surface leading-snug break-words group-hover:text-primary transition-colors">
                                {prod.name}
                              </h4>
                            </div>

                            {/* Botões de Ação no Desktop: Editar e Excluir */}
                            <div className="absolute top-2 right-2 flex items-center gap-0.5">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(prod);
                                }}
                                className="p-1 text-secondary hover:text-primary hover:bg-surface-container-high rounded-md transition-colors"
                                title={`Editar ${prod.name}`}
                              >
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteClick(prod);
                                }}
                                className="p-1 text-secondary hover:text-error hover:bg-error-container/40 rounded-md transition-colors"
                                title={`Excluir ${prod.name}`}
                              >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            </div>
                          </div>

                          {prod.categoryRequirements && prod.categoryRequirements.length > 0 && (
                            <div className="pt-1 border-t border-outline-variant/30 flex items-center justify-between">
                              <div className="scale-90 origin-left">
                                <CategoryBadges categories={prod.categoryRequirements} />
                              </div>
                              <span className="material-symbols-outlined text-outline/50 text-[16px] group-hover:text-primary group-hover:translate-x-0.5 transition-transform">
                                chevron_right
                              </span>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      ) : (
        /* Visualização em Tabela Completa (com sticky top-0 right-0 z-30 sem corte) */
        <div className="flex-1 overflow-hidden flex flex-col bg-surface-container-lowest border border-outline-variant/60 rounded-lg shadow-sm">
          <Table 
            columns={PRODUCT_TABLE_COLUMNS} 
            data={products} 
            onEdit={handleEdit} 
            onDelete={handleDeleteClick}
          />
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        title="Excluir Esquadria"
        footer={
          <div className="flex items-center gap-sm">
            <Button
              variant="ghost"
              onClick={() => setProductToDelete(null)}
              disabled={inactivateProductMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              className="!bg-error !text-white hover:!bg-error/90"
              onClick={handleConfirmDelete}
              disabled={inactivateProductMutation.isPending}
              icon={inactivateProductMutation.isPending ? 'progress_activity' : 'delete'}
            >
              {inactivateProductMutation.isPending ? 'Excluindo...' : 'Confirmar Exclusão'}
            </Button>
          </div>
        }
      >
        <div className="flex items-start gap-md py-sm">
          <div className="w-10 h-10 rounded-full bg-error-container/40 flex items-center justify-center text-error flex-none">
            <span className="material-symbols-outlined text-[24px]">warning</span>
          </div>
          <div className="flex-1">
            <p className="font-body text-sm text-on-surface">
              Tem certeza de que deseja excluir a esquadria{' '}
              <strong className="font-semibold text-primary">{productToDelete?.name}</strong>?
            </p>
            <p className="font-body-sm text-xs text-secondary mt-1">
              Esta esquadria deixará de aparecer na lista de produtos e no catálogo de novos orçamentos.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
