import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { useProducts } from '../../features/catalog/hooks/useCatalog';
import { DoorTemplateSvg } from '../componentes-templates-svg/DoorTemplateSvg';
import type { Product } from '../tipos';

export function ProductTab() {
  const navigate = useNavigate();
  const { data: productsData, isLoading: isLoadingProducts } = useProducts();

  const products = productsData?.content || [];

  const columns = useMemo(() => [
    { 
      header: 'Esquadria / Template', 
      accessor: (row: Product) => (
        <div className="flex items-center gap-sm">
          <div className="w-12 h-12 rounded-md bg-white flex items-center justify-center shrink-0 border border-outline-variant/80 p-0.5 shadow-sm">
            <DoorTemplateSvg
              templateType={row.templateType || 'SLIDING_DOOR_2F'}
              config={row.templateConfig}
              showDimensions={false}
              className="w-full h-full"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-title-sm text-title-sm text-on-surface font-semibold">{row.name}</span>
            <span className="font-body-sm text-xs text-on-surface-variant">Template Vetorial SVG</span>
          </div>
        </div>
      )
    },
    { 
      header: 'Categoria', 
      accessor: (row: Product) => (
        <span className="inline-flex items-center px-sm py-0.5 rounded-full text-xs font-medium bg-surface-container-high text-on-surface-variant">
          {row.categoryName || 'Geral'}
        </span>
      )
    },
    { 
      header: 'Materiais Vinculados', 
      accessor: (row: Product) => (
        <span className="font-data-mono text-data-mono text-primary font-semibold">
          {row.items?.length || 0} {row.items?.length === 1 ? 'insumo' : 'insumos'}
        </span>
      ),
      align: 'center' as const
    },
    {
      header: 'Status',
      accessor: () => (
        <span className="inline-flex items-center px-sm py-0.5 rounded-full text-xs font-semibold bg-tertiary-container text-on-tertiary-container">
          Ativo
        </span>
      ),
      align: 'center' as const
    }
  ], []);

  const handleCreate = () => {
    navigate('/produtos/novo');
  };

  const handleEdit = (item: Product) => {
    navigate(`/produtos/${item.id}/editar`);
  };

  if (isLoadingProducts) {
    return <div className="p-md text-secondary">Carregando produtos...</div>;
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-md gap-sm flex-none">
        <div>
          <h2 className="font-headline text-headline-md sm:text-headline-lg font-bold text-primary leading-tight">
            Templates de Produtos
          </h2>
          <p className="font-body text-sm text-secondary mt-xs">
            Modelos e gabaritos de esquadrias com sua lista de materiais base para utilização em orçamentos.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-sm">
          <Button 
            variant="primary" 
            icon="add" 
            onClick={handleCreate}
          >
            Novo Template
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col bg-white border border-outline-variant/60 rounded-lg shadow-sm">
        {products.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-xl">
            <span className="material-symbols-outlined text-[64px] text-outline mb-md">category</span>
            <h3 className="font-title-sm text-title-sm text-on-surface mb-xs">Nenhum template cadastrado</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-md max-w-md">
              Crie templates de esquadrias (portas, janelas, boxes) com seus insumos para poder orçar de forma rápida.
            </p>
            <Button variant="primary" icon="add" onClick={handleCreate}>
              Criar Primeiro Template
            </Button>
          </div>
        ) : (
          <Table 
            columns={columns} 
            data={products} 
            onEdit={handleEdit} 
          />
        )}
      </div>
    </div>
  );
}
