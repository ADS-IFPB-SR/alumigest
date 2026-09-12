import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  useCreateProduct,
  useUpdateProduct,
  useProductById,
} from '../features/catalog/hooks/useCatalog';
import { ProductGeneralInfo } from '../features/catalog/components/builder/ProductGeneralInfo';
import { ProductCostSummary } from '../features/catalog/components/builder/ProductCostSummary';
import { TemplateSelector } from '../features/catalog/components/builder/TemplateSelector';
import { TemplateOptionSchemaEditor } from '../features/catalog/components/builder/TemplateOptionSchemaEditor';
import { CategoryRequirementsSelector } from '../features/catalog/components/builder/CategoryRequirementsSelector';
import type { DoorTemplateType, TemplateConfig, TemplateOptionSchema, MaterialCategoryType } from '../features/catalog/types/templates';
import { TEMPLATE_DEFAULT_CATEGORIES } from '../features/catalog/types/templates';
import { getDefaultSvgTemplateForCatalogType } from '../features/budgets/utils/mapCatalogTemplate';
import toast from 'react-hot-toast';

export function ProductBuilderPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  // Queries
  const { data: existingProduct } = useProductById(id);
  
  const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();
  
  const isPending = isCreating || isUpdating;

  // Form State — General
  const [name, setName] = useState('');

  // Form State — Template
  const [templateType, setTemplateType] = useState<DoorTemplateType | null>(null);
  const [templateConfig, setTemplateConfig] = useState<Partial<TemplateConfig>>({
    profileMm: 20,
    aluminumColor: '#212121',
    glassColor: '#e3f2fd',
  });
  const [optionSchema, setOptionSchema] = useState<Partial<TemplateOptionSchema>>({});
  const [categoryRequirements, setCategoryRequirements] = useState<MaterialCategoryType[]>([]);

  // Load existing data if editing
  useEffect(() => {
    if (isEditing && existingProduct) {
      setName(existingProduct.name);

      // Template data
      if (existingProduct.templateType) {
        const resolved = getDefaultSvgTemplateForCatalogType(
          existingProduct.templateType,
          existingProduct.name,
          existingProduct.templateConfig
        );
        setTemplateType(resolved);
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
      if (existingProduct.categoryRequirements && existingProduct.categoryRequirements.length > 0) {
        setCategoryRequirements(existingProduct.categoryRequirements);
      } else if (existingProduct.templateType) {
        setCategoryRequirements(TEMPLATE_DEFAULT_CATEGORIES[existingProduct.templateType] || []);
      }
    } else if (!isEditing) {
      // Reset form if navigating from Edit -> New
      setName('');
      setTemplateType(null);
      setTemplateConfig({ profileMm: 20, aluminumColor: '#212121', glassColor: '#e3f2fd' });
      setOptionSchema({});
      setCategoryRequirements([]);
    }
  }, [id, isEditing, existingProduct]);

  // Ao trocar de template na interface, se o usuário não alterou manualmente as categorias ou se estiver vazio, pré-marca
  const handleSelectTemplateType = (newType: DoorTemplateType) => {
    setTemplateType(newType);
    const defaults = TEMPLATE_DEFAULT_CATEGORIES[newType] || ['GLASS', 'PROFILE', 'HARDWARE'];
    setCategoryRequirements(defaults);
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('O nome do produto é obrigatório.');
      return;
    }
    if (name.trim().length > 120) {
      toast.error('O nome do produto não pode exceder 120 caracteres.');
      return;
    }
    if (!templateType) {
      toast.error('Selecione um modelo de esquadria para o produto.');
      return;
    }
    if (categoryRequirements.length === 0) {
      toast.error('Selecione pelo menos uma categoria de insumo requerida para o orçamento.');
      return;
    }

    // Build templateConfig with optionSchema embedded
    const finalTemplateConfig: TemplateConfig = {
      templateType: templateType,
      profileMm: templateConfig.profileMm ?? 20,
      aluminumColor: templateConfig.aluminumColor ?? '#212121',
      glassColor: templateConfig.glassColor ?? '#e3f2fd',
      openingDirection: templateConfig.openingDirection,
      slidingMode: templateConfig.slidingMode,
      handleConfig: templateConfig.handleConfig,
      drillingConfig: templateConfig.drillingConfig,
      optionSchema: optionSchema as TemplateOptionSchema,
    };

    const payload = {
      name: name.trim(),
      templateType: templateType,
      templateConfig: finalTemplateConfig,
      categoryRequirements: categoryRequirements,
    };

    if (isEditing && id) {
      updateProduct({ id, data: payload }, { onSuccess: () => navigate('/produtos') });
    } else {
      createProduct(payload, { onSuccess: () => navigate('/produtos') });
    }
  };

  const getSaveButtonText = () => {
    if (isPending) return 'Salvando...';
    return isEditing ? 'Atualizar' : 'Salvar';
  };

  const isSaveDisabled = isPending || !name.trim() || !templateType || categoryRequirements.length === 0;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-surface relative">
      {/* Top Header & Breadcrumbs */}
      <div className="flex-none px-4 lg:px-8 py-3 border-b border-outline-variant/70 bg-surface-container-lowest/80 backdrop-blur-md z-10 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
          <Link to="/produtos" className="hover:text-primary transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Produtos Finais</span>
          </Link>
          <span className="text-on-surface-variant/40">/</span>
          <span className="text-on-surface font-semibold">
            {isEditing ? 'Editar Esquadria' : 'Nova Esquadria'}
          </span>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={() => navigate('/produtos')}
            className="px-3.5 py-1.5 border border-outline/70 text-on-surface rounded-lg text-xs font-semibold hover:bg-surface-container-low transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button 
            type="button"
            onClick={handleSave}
            disabled={isSaveDisabled}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-semibold hover:bg-primary-container hover:text-on-primary-container transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">save</span>
            {getSaveButtonText()}
          </button>
        </div>
      </div>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-8 max-w-[1600px] mx-auto w-full">
        {/* Título da Página */}
        <div className="mb-6">
          <h2 className="text-xl lg:text-2xl font-bold text-on-surface tracking-tight">
            {isEditing ? 'Edição de Esquadria Paramétrica' : 'Nova Esquadria Paramétrica'}
          </h2>
          <p className="text-xs text-on-surface-variant/80 mt-1">
            Configure a tipologia técnica, opções permitidas aos orçamentistas e insumos requeridos para produção.
          </p>
        </div>

        {/* Layout Studio em 2 Colunas */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start pb-12">
          {/* Coluna Esquerda: Fluxo sequencial de configuração (8 colunas no 2xl, 7 no xl) */}
          <div className="xl:col-span-7 2xl:col-span-8 flex flex-col gap-5 min-w-0">
            {/* 1. Identificação */}
            <ProductGeneralInfo 
              name={name} 
              setName={setName}
              templateType={templateType}
            />

            {/* 2. Seletor Visual de Modelos */}
            <TemplateSelector
              templateType={templateType}
              setTemplateType={handleSelectTemplateType}
              templateConfig={templateConfig}
              setTemplateConfig={setTemplateConfig}
            />

            {/* 3. Opções Permitidas no Orçamento */}
            {templateType && (
              <TemplateOptionSchemaEditor
                templateType={templateType}
                optionSchema={optionSchema}
                setOptionSchema={setOptionSchema}
                templateConfig={templateConfig}
                setTemplateConfig={setTemplateConfig}
              />
            )}

            {/* 4. Categorias de Insumos Requeridas */}
            <CategoryRequirementsSelector
              templateType={templateType}
              selectedCategories={categoryRequirements}
              setSelectedCategories={setCategoryRequirements}
            />
          </div>

          {/* Coluna Direita: Studio CAD e Resumo de Especificações (4 colunas no 2xl, 5 no xl) */}
          <div className="xl:col-span-5 2xl:col-span-4 min-w-0 xl:sticky xl:top-4">
            <ProductCostSummary
              name={name}
              templateType={templateType}
              templateConfig={templateConfig}
              setTemplateConfig={setTemplateConfig}
              categoryRequirements={categoryRequirements}
              onSave={handleSave}
              isPending={isPending}
              isEditing={isEditing}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
