import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  useCreateProduct,
  useUpdateProduct,
  useProductCategories,
  useProductById,
  useMaterialsSummary,
} from '../features/catalog/hooks/useCatalog';
import { ProductGeneralInfo } from '../features/catalog/components/builder/ProductGeneralInfo';
import { ProductCostSummary } from '../features/catalog/components/builder/ProductCostSummary';
import { TemplateSelector } from '../features/catalog/components/builder/TemplateSelector';
import { TemplateOptionSchemaEditor } from '../features/catalog/components/builder/TemplateOptionSchemaEditor';
import { CategoryRequirementsSelector } from '../features/catalog/components/builder/CategoryRequirementsSelector';
import { ProductTechSheet, type FormItem } from '../features/catalog/components/builder/ProductTechSheet';
import type { DoorTemplateType, TemplateConfig, TemplateOptionSchema, MaterialCategoryType } from '../features/catalog/types/templates';
import toast from 'react-hot-toast';

export function ProductBuilderPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  // Queries
  const { data: categories = [] } = useProductCategories();
  const { data: materials = [] } = useMaterialsSummary();
  
  // Fetch single product for editing
  const { data: existingProduct } = useProductById(id);
  
  const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();
  
  const isPending = isCreating || isUpdating;

  // Form State — General
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');

  // Form State — Template
  const [templateType, setTemplateType] = useState<DoorTemplateType | null>(null);
  const [templateConfig, setTemplateConfig] = useState<Partial<TemplateConfig>>({
    profileMm: 20,
    aluminumColor: '#212121',
    glassColor: '#e3f2fd',
  });
  const [optionSchema, setOptionSchema] = useState<Partial<TemplateOptionSchema>>({});
  const [categoryRequirements, setCategoryRequirements] = useState<MaterialCategoryType[]>([]);

  // Form State — Ficha Técnica (Insumos Estáticos)
  const [items, setItems] = useState<FormItem[]>([]);

  const selectedCategory = useMemo(() => {
    return categories.find((c) => c.id === categoryId);
  }, [categories, categoryId]);

  // Load existing data if editing
  useEffect(() => {
    if (isEditing && existingProduct) {
      setName(existingProduct.name);
      setCategoryId(existingProduct.categoryId);

      // Template data
      if (existingProduct.templateType) {
        setTemplateType(existingProduct.templateType);
      }
      if (existingProduct.templateConfig) {
        const config = existingProduct.templateConfig;
        setTemplateConfig({
          profileMm: config.profileMm ?? 20,
          aluminumColor: config.aluminumColor ?? '#212121',
          glassColor: config.glassColor ?? '#e3f2fd',
          openingDirection: config.openingDirection,
          slidingMode: config.slidingMode,
          handleConfig: config.handleConfig,
          drillingConfig: config.drillingConfig,
        });
        if (config.optionSchema) {
          setOptionSchema(config.optionSchema);
        }
      }
      if (existingProduct.categoryRequirements) {
        setCategoryRequirements(existingProduct.categoryRequirements);
      }

      // Ficha Técnica / Items
      if (existingProduct.items && existingProduct.items.length > 0) {
        setItems(
          existingProduct.items.map((item) => ({
            tempId: Math.random().toString(36).slice(2),
            materialId: item.materialId,
            quantity: item.quantity.toString().replace('.', ','),
          }))
        );
      } else {
        setItems([]);
      }
    } else if (!isEditing) {
      // Reset form if navigating from Edit -> New
      setName('');
      setCategoryId('');
      setTemplateType(null);
      setTemplateConfig({ profileMm: 20, aluminumColor: '#212121', glassColor: '#e3f2fd' });
      setOptionSchema({});
      setCategoryRequirements([]);
      setItems([]);
    }
  }, [id, isEditing, existingProduct]);

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('O nome do produto é obrigatório.');
      return;
    }
    if (!categoryId) {
      toast.error('Selecione uma categoria para o produto.');
      return;
    }

    if (templateType) {
      // Validação de categorias requeridas quando houver template
      if (categoryRequirements.length === 0) {
        toast.error('Selecione pelo menos uma categoria de insumo para o template.');
        return;
      }
    } else {
      // Validação da ficha técnica para produtos estáticos (sem template)
      const invalidItems = items.filter((item) => {
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
    }

    // Build templateConfig with optionSchema embedded
    const finalTemplateConfig: TemplateConfig | undefined = templateType ? {
      profileMm: templateConfig.profileMm ?? 20,
      aluminumColor: templateConfig.aluminumColor ?? '#212121',
      glassColor: templateConfig.glassColor ?? '#e3f2fd',
      openingDirection: templateConfig.openingDirection,
      slidingMode: templateConfig.slidingMode,
      handleConfig: templateConfig.handleConfig,
      drillingConfig: templateConfig.drillingConfig,
      optionSchema: optionSchema as TemplateOptionSchema,
    } : undefined;

    const payload = {
      name: name.trim(),
      categoryId,
      templateType: templateType || undefined,
      templateConfig: finalTemplateConfig,
      categoryRequirements: templateType ? categoryRequirements : undefined,
      items: templateType
        ? []
        : items.map((item) => ({
            materialId: item.materialId,
            quantity: Number(item.quantity.replace(',', '.')),
          })),
    };

    if (isEditing && id) {
      updateProduct({ id, data: payload }, { onSuccess: () => navigate('/produtos') });
    } else {
      createProduct(payload, { onSuccess: () => navigate('/produtos') });
    }
  };

  const isSaveDisabled = isPending || (!templateType && items.length === 0);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-surface relative">
      {/* Top Header & Breadcrumbs */}
      <div className="flex-none px-md lg:px-margin-desktop py-sm border-b border-outline-variant bg-surface z-10 flex items-center justify-between">
        <div className="flex items-center gap-sm font-body-sm text-body-sm text-on-surface-variant">
          <Link to="/produtos" className="hover:text-primary transition-colors">Produtos Finais</Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-on-surface font-medium">
            {isEditing ? 'Editar Produto' : 'Novo Produto'}
          </span>
        </div>
        
        <div className="flex items-center gap-sm">
          <button 
            onClick={() => navigate('/produtos')}
            className="flex items-center gap-xs px-md py-xs border border-outline text-on-surface rounded-sm font-label-bold text-label-bold hover:bg-surface-container-high transition-colors shadow-sm cursor-pointer"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaveDisabled}
            className="flex items-center gap-xs px-md py-xs bg-primary text-on-primary rounded-sm font-label-bold text-label-bold hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            {isPending ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Salvar Produto')}
          </button>
        </div>
      </div>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-md lg:p-margin-desktop max-w-container-max mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-sm mb-lg">
          <div>
            <h2 className="font-headline text-headline-md lg:text-headline-lg text-on-surface">
              {isEditing ? 'Edição de Produto' : 'Novo Produto'}
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
              Configure as propriedades, modelo de esquadria e opções permitidas para orçamento.
            </p>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-lg pb-xl">
          {/* Form Content (Left) */}
          <div className="flex-1 flex flex-col gap-lg min-w-0">
            <ProductGeneralInfo 
              name={name} 
              setName={setName}
              categoryId={categoryId} 
              setCategoryId={setCategoryId}
              categories={categories}
            />

            <TemplateSelector
              templateType={templateType}
              setTemplateType={setTemplateType}
              templateConfig={templateConfig}
              setTemplateConfig={setTemplateConfig}
              categoryName={selectedCategory?.name}
            />

            {templateType ? (
              <>
                <TemplateOptionSchemaEditor
                  templateType={templateType}
                  optionSchema={optionSchema}
                  setOptionSchema={setOptionSchema}
                />

                <CategoryRequirementsSelector
                  templateType={templateType}
                  selectedCategories={categoryRequirements}
                  setSelectedCategories={setCategoryRequirements}
                />
              </>
            ) : (
              <ProductTechSheet
                items={items}
                setItems={setItems}
                materials={materials}
              />
            )}
          </div>

          {/* Sidebar (Right) */}
          <ProductCostSummary
            name={name}
            templateType={templateType}
            categoryRequirements={categoryRequirements}
            onSave={handleSave}
            isPending={isPending}
            isEditing={isEditing}
            items={items}
            materials={materials}
          />
        </div>
      </div>
    </div>
  );
}
