import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { useProducts } from '../features/catalog/hooks/useCatalog';
import type { Product } from '../features/catalog/types';

const renderName = (row: Product) => (
  <span className="font-title-sm text-title-sm text-on-surface font-semibold">{row.name}</span>
);

const renderCategory = (row: Product) => (
  <span className="font-body text-body-sm text-secondary">{row.categoryName}</span>
);

export function ProductTab() {
  const navigate = useNavigate();
  const { data: productsData, isLoading: isLoadingProducts } = useProducts();

  const products = productsData?.content || [];

  const columns = useMemo(() => [
    { 
      header: 'Nome da Esquadria', 
      accessor: renderName
    },
    { 
      header: 'Categoria', 
      accessor: renderCategory
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
