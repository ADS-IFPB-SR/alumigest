import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useCreateProduct, useUpdateProduct, useProductCategories, useMaterialsSummary, useProducts } from '../features/catalog/hooks/useCatalog';
import { ProductGeneralInfo } from '../features/catalog/components/builder/ProductGeneralInfo';
import { ProductTechSheet, type FormItem } from '../features/catalog/components/builder/ProductTechSheet';
import { ProductCostSummary } from '../features/catalog/components/builder/ProductCostSummary';
import { formatCurrencyInput, parseCurrencyString } from '../utils/formatters';
import toast from 'react-hot-toast';

export function ProductBuilderPage() {
 const navigate = useNavigate();
 const { id } = useParams<{ id: string }>();
 const isEditing = Boolean(id);

  // Queries
  const { data: categories = [] } = useProductCategories();
  const { data: materials = [] } = useMaterialsSummary();
 
 // We fetch all products to find the one we're editing if we refreshed the page
 const { data: productsData } = useProducts();
 
 const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
 const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();
 
 const isPending = isCreating || isUpdating;

 // Form State
 const [name, setName] = useState('');
 const [categoryId, setCategoryId] = useState('');
 const [laborCost, setLaborCost] = useState('');
 const [items, setItems] = useState<FormItem[]>([]);

 // Load existing data if editing
 useEffect(() => {
   if (isEditing && productsData?.content) {
     const existingProduct = productsData.content.find((p: any) => p.id === id);
     if (existingProduct) {
       setName(existingProduct.name);
       setCategoryId(existingProduct.categoryId);
       setLaborCost(formatCurrencyInput(existingProduct.laborCost.toFixed(2)));
       setItems(existingProduct.items.map((item: any) => ({
         tempId: crypto.randomUUID(),
         materialId: item.materialId,
         quantity: item.quantity.toString().replace('.', ',')
       })));
     }
   } else if (!isEditing) {
     // Reset form if navigating from Edit -> New
     setName('');
     setCategoryId('');
     setLaborCost('');
     setItems([]);
   }
 }, [id, isEditing, productsData]);

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('O nome do produto é obrigatório.');
      return;
    }
    if (!categoryId) {
      toast.error('Selecione uma categoria para o produto.');
      return;
    }

    const parsedLaborCost = parseCurrencyString(laborCost);
    if (isNaN(parsedLaborCost) || parsedLaborCost < 0) {
      toast.error('Custo de mão de obra inválido. Insira um valor maior ou igual a zero.');
      return;
    }

    const invalidItems = items.filter(item => {
      const q = Number(item.quantity.replace(',', '.'));
      return isNaN(q) || q <= 0 || q > 99999 || !item.materialId;
    });

    if (invalidItems.length > 0) {
      toast.error('Existem insumos com quantidade inválida. Ajuste para um valor entre 0.01 e 99999.');
      return;
    }

    if (items.length === 0) {
      toast.error('A ficha técnica precisa de pelo menos um insumo.');
      return;
    }

    const payload = {
      name: name.trim(),
      categoryId,
      laborCost: parsedLaborCost || 0,
      items: items.map(item => ({
        materialId: item.materialId,
        quantity: Number(item.quantity.replace(',', '.'))
      }))
    };

    if (isEditing && id) {
      updateProduct({ id, data: payload }, { onSuccess: () => navigate('/produtos') });
    } else {
      createProduct(payload, { onSuccess: () => navigate('/produtos') });
    }
  };

 return (
 <div className="flex-1 flex flex-col h-full overflow-hidden bg-surface relative">
 {/* Top Header & Breadcrumbs */}
 <div className="flex-none px-md lg:px-margin-desktop py-sm border-b border-outline-variant bg-surface z-10 flex items-center justify-between">
 <div className="flex items-center gap-sm font-body-sm text-body-sm text-on-surface-variant">
 <Link to="/produtos" className="hover:text-primary transition-colors">Produtos Finais</Link>
 <span className="material-symbols-outlined text-[16px]">chevron_right</span>
 <span className="text-on-surface font-medium">
 {isEditing ? 'Editar Produto' : 'Novo Produto Rápido'}
 </span>
 </div>
 
 <div className="flex items-center gap-sm">
 <button 
 onClick={() => navigate('/produtos')}
 className="flex items-center gap-xs px-md py-xs border border-outline text-on-surface rounded-sm font-label-bold text-label-bold hover:bg-surface-container-high transition-colors shadow-sm"
 >
 Cancelar
 </button>
 <button 
 onClick={handleSave}
 disabled={isPending || items.length === 0}
 className="flex items-center gap-xs px-md py-xs bg-primary text-on-primary rounded-sm font-label-bold text-label-bold hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm disabled:opacity-50"
 >
 <span className="material-symbols-outlined text-[18px]">save</span>
 {isEditing ? 'Atualizar' : 'Salvar Produto'}
 </button>
 </div>
 </div>

 {/* Main Scrollable Content */}
 <div className="flex-1 overflow-y-auto p-md lg:p-margin-desktop max-w-container-max mx-auto w-full">
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-sm mb-lg">
 <div>
 <h2 className="font-headline text-headline-md lg:text-headline-lg text-on-surface">
 {isEditing ? 'Edição de Produto' : 'Novo Produto Rápido'}
 </h2>
 <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
 Configure as propriedades e a ficha técnica da esquadria.
 </p>
 </div>
 </div>

 <div className="flex flex-col xl:flex-row gap-lg pb-xl">
 {/* Form Content (Left) */}
 <div className="flex-1 flex flex-col gap-lg min-w-0">
 <ProductGeneralInfo 
 name={name} setName={setName}
 categoryId={categoryId} setCategoryId={setCategoryId}
 laborCost={laborCost} setLaborCost={setLaborCost}
 categories={categories}
 />
 
 <ProductTechSheet 
 items={items} setItems={setItems}
 materials={materials}
 />
 </div>

 {/* Summary Sidebar (Right) */}
 <ProductCostSummary 
 items={items}
 laborCost={laborCost}
 materials={materials}
 onSave={handleSave}
 isPending={isPending}
 isEditing={isEditing}
 />
 </div>
 </div>
 </div>
 );
}
