import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { useProducts, useMaterialsSummary } from '../features/catalog/hooks/useCatalog';
import type { Product } from '../features/catalog/types';

export function ProductTab() {
 const navigate = useNavigate();
 const { data: productsData, isLoading: isLoadingProducts } = useProducts();
 const { data: materialsData, isLoading: isLoadingMaterials } = useMaterialsSummary();

 const products = productsData?.content || [];
 const materials = materialsData || [];

 const materialsCostMap = useMemo(() => {
 const map = new Map<string, number>();
 materials.forEach(m => map.set(m.id, m.costPrice));
 return map;
 }, [materials]);

 const calculateTotalCost = (product: Product) => {
 const materialsCost = product.items.reduce((acc, item) => {
 const price = materialsCostMap.get(item.materialId) || 0;
 return acc + (price * item.quantity);
 }, 0);
 return product.laborCost + materialsCost;
 };

 const columns = [
 { 
 header: 'Nome da Esquadria', 
 accessor: (row: Product) => <span className="font-title-sm text-title-sm text-on-surface font-semibold">{row.name}</span> 
 },
 { 
 header: 'Categoria', 
 accessor: (row: Product) => <span className="font-body text-body-sm text-secondary">{row.categoryName}</span> 
 },
 { 
 header: 'Mão de Obra', 
 accessor: (row: Product) => <span className="font-data-mono text-data-mono text-secondary">R$ {row.laborCost.toFixed(2).replace('.', ',')}</span>,
 },
 { 
 header: 'Custo Total Estimado', 
 accessor: (row: Product) => (
 <span className="font-data-mono text-data-mono text-primary font-bold">
 R$ {calculateTotalCost(row).toFixed(2).replace('.', ',')}
 </span>
 ),
 align: 'right' as const
 }
 ];

 const handleCreate = () => {
 navigate('/produtos/novo');
 };

 const handleEdit = (item: Product) => {
 navigate(`/produtos/${item.id}/editar`);
 };

 if (isLoadingProducts || isLoadingMaterials) {
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
