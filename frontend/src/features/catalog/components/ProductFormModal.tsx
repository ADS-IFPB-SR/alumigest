import { useState, useEffect, useMemo } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useCreateProduct, useUpdateProduct, useProductCategories, useMaterialsSummary } from '../hooks/useCatalog';
import type { Product } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Product;
}

interface FormItem {
  tempId: string;
  materialId: string;
  quantity: string;
}

export function ProductFormModal({ isOpen, onClose, initialData }: Props) {
  const isEditing = Boolean(initialData);
  const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();
  
  const { data: categories } = useProductCategories();
  const { data: materialsData } = useMaterialsSummary();
  const materials = materialsData || [];

  const isPending = isCreating || isUpdating;

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [laborCost, setLaborCost] = useState('');
  const [items, setItems] = useState<FormItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setCategoryId(initialData.categoryId);
        setLaborCost(initialData.laborCost.toString());
        setItems(initialData.items.map(item => ({
          tempId: crypto.randomUUID(),
          materialId: item.materialId,
          quantity: item.quantity.toString()
        })));
      } else {
        setName('');
        setCategoryId('');
        setLaborCost('');
        setItems([]);
      }
    }
  }, [isOpen, initialData]);

  // Map to easily lookup cost
  const materialsCostMap = useMemo(() => {
    const map = new Map<string, number>();
    materials.forEach(m => map.set(m.id, m.costPrice));
    return map;
  }, [materials]);

  const handleAddItem = () => {
    setItems([...items, { tempId: crypto.randomUUID(), materialId: '', quantity: '' }]);
  };

  const handleRemoveItem = (tempId: string) => {
    setItems(items.filter(item => item.tempId !== tempId));
  };

  const handleChangeItem = (tempId: string, field: keyof FormItem, value: string) => {
    setItems(items.map(item => item.tempId === tempId ? { ...item, [field]: value } : item));
  };

  const totalMaterialsCost = items.reduce((acc, item) => {
    const price = materialsCostMap.get(item.materialId) || 0;
    const qty = Number(item.quantity.replace(',', '.')) || 0;
    return acc + (price * qty);
  }, 0);

  const totalCost = (Number(laborCost.replace(',', '.')) || 0) + totalMaterialsCost;

  const handleSave = () => {
    if (!name || !categoryId) return; // Simple validation

    const payload = {
      name,
      categoryId,
      laborCost: Number(laborCost.replace(',', '.')) || 0,
      items: items
        .filter(item => item.materialId && item.quantity)
        .map(item => ({
          materialId: item.materialId,
          quantity: Number(item.quantity.replace(',', '.'))
        }))
    };

    if (isEditing && initialData) {
      updateProduct({ id: initialData.id, data: payload }, { onSuccess: onClose });
    } else {
      createProduct(payload, { onSuccess: onClose });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${isEditing ? 'Edição' : 'Cadastro'} de Produto`}
      footer={
        <div className="flex justify-between items-center w-full">
          <div className="text-sm font-medium text-secondary dark:text-outline-variant">
            Custo Total Estimado: <span className="text-primary dark:text-primary-80 text-lg font-bold">R$ {totalCost.toFixed(2).replace('.', ',')}</span>
          </div>
          <div className="flex gap-sm">
            <Button variant="ghost" onClick={onClose} disabled={isPending}>Cancelar</Button>
            <Button variant="primary" onClick={handleSave} disabled={isPending || items.length === 0}>
              {isPending ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Salvar')}
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-lg">
        {/* Basic Data Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <Input 
            label="Nome da Esquadria" 
            placeholder="Ex: Janela Basculante 2 Folhas" 
            value={name}
            onChange={(e) => setName(e.target.value)} 
            className="md:col-span-2"
          />
          <div className="flex flex-col gap-1">
            <label className="font-label text-label-md text-on-surface dark:text-inverse-on-surface">Categoria</label>
            <select
              className="w-full h-10 px-sm rounded-md bg-background dark:bg-surface-container-highest border border-outline-variant dark:border-outline focus:border-primary focus:outline-none transition-colors font-body text-body-md text-on-surface dark:text-inverse-on-surface"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Selecione uma categoria...</option>
              {categories?.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <Input 
            label="Mão de Obra" 
            unit="R$" 
            placeholder="0,00" 
            value={laborCost}
            onChange={(e) => setLaborCost(e.target.value)} 
          />
        </div>

        {/* Technical Sheet Section */}
        <div className="border border-outline-variant dark:border-outline/30 rounded-lg p-md flex flex-col gap-sm bg-surface-container-lowest dark:bg-surface-container/10">
          <div className="flex justify-between items-center mb-xs">
            <h3 className="font-title-md font-bold text-on-surface dark:text-inverse-on-surface">Ficha Técnica</h3>
            <Button variant="outline" onClick={handleAddItem} type="button">
              <span className="material-symbols-outlined text-[18px]">add</span> Adicionar Insumo
            </Button>
          </div>
          
          {items.length === 0 ? (
            <div className="text-center p-xl text-secondary dark:text-outline-variant text-sm border border-dashed border-outline-variant dark:border-outline/50 rounded-md">
              Nenhum material adicionado à ficha técnica.<br/>
              Adicione insumos para calcular o custo e produzir a esquadria.
            </div>
          ) : (
            <div className="flex flex-col gap-sm max-h-[300px] overflow-y-auto pr-xs">
              {items.map((item) => {
                const itemCostPrice = materialsCostMap.get(item.materialId) || 0;
                const qty = Number(item.quantity.replace(',', '.')) || 0;
                const rowCost = itemCostPrice * qty;
                
                return (
                  <div key={item.tempId} className="flex gap-sm items-end p-sm bg-surface-container-lowest dark:bg-[#151f2b] border border-outline-variant dark:border-outline/20 rounded-md shadow-xs animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex flex-col gap-1 flex-1">
                      <label className="font-label text-[10px] uppercase text-secondary dark:text-outline-variant tracking-wider">Insumo</label>
                      <select
                        className="w-full h-9 px-sm rounded-md bg-background dark:bg-surface-container border border-outline-variant dark:border-outline/50 focus:border-primary focus:outline-none transition-colors font-body text-sm text-on-surface dark:text-inverse-on-surface"
                        value={item.materialId}
                        onChange={(e) => handleChangeItem(item.tempId, 'materialId', e.target.value)}
                      >
                        <option value="">Selecionar Material...</option>
                        {materials.map(m => (
                          <option key={m.id} value={m.id}>
                            {m.name} {m.skuCode ? `(${m.skuCode})` : ''} - {m.unitMeasure}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex flex-col gap-1 w-24">
                      <label className="font-label text-[10px] uppercase text-secondary dark:text-outline-variant tracking-wider">Quantidade</label>
                      <input
                        type="text"
                        placeholder="0,00"
                        className="w-full h-9 px-sm rounded-md bg-background dark:bg-surface-container border border-outline-variant dark:border-outline/50 focus:border-primary focus:outline-none text-sm text-on-surface dark:text-inverse-on-surface"
                        value={item.quantity}
                        onChange={(e) => handleChangeItem(item.tempId, 'quantity', e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col gap-1 w-24">
                      <label className="font-label text-[10px] uppercase text-secondary dark:text-outline-variant tracking-wider">Subtotal</label>
                      <div className="h-9 flex items-center px-xs font-data-mono text-sm font-semibold text-primary dark:text-primary-80 bg-surface-container dark:bg-surface-container-highest rounded-md border border-transparent">
                        R$ {rowCost.toFixed(2).replace('.', ',')}
                      </div>
                    </div>

                    <button 
                      onClick={() => handleRemoveItem(item.tempId)}
                      className="h-9 w-9 flex items-center justify-center text-error hover:bg-error/10 dark:hover:bg-error/20 rounded-md transition-colors shrink-0"
                      title="Remover"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
