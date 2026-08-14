import { useMemo } from 'react';
import { Table } from '../../../components/ui/Table';
import { useProducts, useMaterialsSummary } from '../hooks/useCatalog';
import type { Product } from '../types';

interface Props {
  onEdit: (item: Product) => void;
}

export function ProductTab({ onEdit }: Props) {
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
      accessor: (row: Product) => <span className="font-title-sm text-title-sm text-on-surface dark:text-inverse-on-surface font-semibold">{row.name}</span> 
    },
    { 
      header: 'Categoria', 
      accessor: (row: Product) => <span className="font-body text-body-sm text-secondary dark:text-outline-variant">{row.categoryName}</span> 
    },
    { 
      header: 'Mão de Obra', 
      accessor: (row: Product) => <span className="font-data-mono text-data-mono text-secondary dark:text-outline-variant">R$ {row.laborCost.toFixed(2).replace('.', ',')}</span>,
    },
    { 
      header: 'Custo Total Estimado', 
      accessor: (row: Product) => (
        <span className="font-data-mono text-data-mono text-primary dark:text-primary-80 font-bold">
          R$ {calculateTotalCost(row).toFixed(2).replace('.', ',')}
        </span>
      ),
      align: 'right' as const
    }
  ];

  if (isLoadingProducts || isLoadingMaterials) {
    return <div className="p-md text-secondary">Carregando produtos...</div>;
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col p-xs sm:p-md">
      <Table 
        columns={columns} 
        data={products} 
        onEdit={(row) => onEdit(row)} 
      />
    </div>
  );
}
