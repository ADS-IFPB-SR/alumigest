import { useNavigate } from 'react-router-dom';
import { Table } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { useProducts } from '../features/catalog/hooks/useCatalog';
import { TemplateSVGThumbnail } from '../features/catalog/components/templates';
import { CategoryBadges } from '../features/catalog/components/CategoryBadges';
import { DOOR_TEMPLATE_LABELS } from '../features/catalog/types/templates';
import type { Product } from '../features/catalog/types';

const renderPreview = (row: Product) => (
  <TemplateSVGThumbnail templateType={row.templateType} size={44} />
);

const renderName = (row: Product) => (
  <div className="flex flex-col">
    <span className="font-title-sm text-title-sm text-on-surface font-semibold">{row.name}</span>
    {row.templateType && (
      <span className="font-body-sm text-[11px] text-primary font-medium mt-[2px]">
        {DOOR_TEMPLATE_LABELS[row.templateType]}
      </span>
    )}
  </div>
);

const renderCategory = (row: Product) => (
  <span className="font-body text-body-sm text-secondary">{row.categoryName}</span>
);

const renderRequirements = (row: Product) => (
  <CategoryBadges categories={row.categoryRequirements} />
);

const PRODUCT_COLUMNS = [
  { header: 'Preview', accessor: renderPreview, className: 'w-14' },
  { header: 'Nome da Esquadria', accessor: renderName },
  { header: 'Categoria', accessor: renderCategory },
  { header: 'Insumos no Orçamento', accessor: renderRequirements },
];

const SKELETON_ITEMS = ['sk-1', 'sk-2', 'sk-3', 'sk-4', 'sk-5'] as const;

export function ProductTab() {
  const navigate = useNavigate();
  const { data: productsData, isLoading: isLoadingProducts } = useProducts();

  const products = productsData?.content || [];
  const columns = PRODUCT_COLUMNS;

  const handleCreate = () => {
    navigate('/produtos/novo');
  };

  const handleEdit = (item: Product) => {
    navigate(`/produtos/${item.id}/editar`);
  };

  if (isLoadingProducts) {
    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-md gap-sm flex-none">
          <div>
            <div className="h-8 w-48 bg-surface-container-high rounded-md animate-pulse" />
            <div className="h-4 w-72 bg-surface-container-high rounded-md animate-pulse mt-sm" />
          </div>
        </div>
        <div className="flex-1 overflow-hidden flex flex-col bg-white border border-outline-variant/60 rounded-lg shadow-sm">
          {SKELETON_ITEMS.map((skId) => (
            <div key={skId} className="flex items-center gap-md px-md py-sm border-b border-outline-variant/40">
              <div className="w-11 h-11 bg-surface-container-high rounded-md animate-pulse" />
              <div className="flex-1">
                <div className="h-4 w-40 bg-surface-container-high rounded animate-pulse" />
                <div className="h-3 w-24 bg-surface-container-high rounded animate-pulse mt-xs" />
              </div>
              <div className="h-4 w-20 bg-surface-container-high rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-md gap-sm flex-none">
        <div>
          <h2 className="font-headline text-headline-md sm:text-headline-lg font-bold text-primary leading-tight">
            Produtos Finais
          </h2>
          <p className="font-body text-sm text-secondary mt-xs">
            Gerencie as esquadrias, janelas e portas que sua empresa fabrica.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-sm">
          <Button 
            variant="primary"
            icon="add"
            onClick={handleCreate}
          >
            Nova Esquadria
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col bg-white border border-outline-variant/60 rounded-lg shadow-sm">
        <Table 
          columns={columns} 
          data={products} 
          onEdit={handleEdit} 
        />
      </div>
    </div>
  );
}
