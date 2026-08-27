import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useCreateProduct, useUpdateProduct, useProductCategories, useProducts } from '../../features/catalog/hooks/useCatalog';
import { ProductGeneralInfo } from '../componentes-builder/ProductGeneralInfo';
import { ProductTechSheet } from '../componentes-builder/ProductTechSheet';
import type { DoorTemplateType, TemplateConfig, ProductCategoryRequirement } from '../tipos';
import toast from 'react-hot-toast';

export function ProductBuilderPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  // Queries
  const { data: categories = [] } = useProductCategories();
  const { data: productsData } = useProducts();

  const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();

  const isPending = isCreating || isUpdating;

  // Form State
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [templateType, setTemplateType] = useState<DoorTemplateType>('SLIDING_DOOR_2F');
  const [templateConfig, setTemplateConfig] = useState<TemplateConfig>({
    templateType: 'SLIDING_DOOR_2F',
    aluminumColor: 'BLACK',
    glassFinish: 'CLEAR',
    openingDirection: 'LEFT_TO_RIGHT',
    handleType: 'SHELL_LOCK',
  });
  const [categoryRequirements, setCategoryRequirements] = useState<ProductCategoryRequirement[]>([
    { id: 'req-vidro', categoryType: 'GLASS', label: 'Vidro das Folhas' },
    { id: 'req-perfil', categoryType: 'PROFILE', label: 'Perfis e Trilhos de Alumínio' },
    { id: 'req-ferragem', categoryType: 'HARDWARE', label: 'Kit de Ferragens e Fechos' },
  ]);

  // Load existing data if editing
  useEffect(() => {
    if (isEditing && productsData?.content) {
      const existingProduct = productsData.content.find((p: any) => p.id === id);
      if (existingProduct) {
        setName(existingProduct.name);
        setCategoryId(existingProduct.categoryId);
        if (existingProduct.templateType) {
          setTemplateType(existingProduct.templateType);
        }
        if (existingProduct.templateConfig) {
          setTemplateConfig(existingProduct.templateConfig);
        }
        if (existingProduct.categoryRequirements && existingProduct.categoryRequirements.length > 0) {
          setCategoryRequirements(existingProduct.categoryRequirements);
        } else if (existingProduct.items && existingProduct.items.length > 0) {
          // Backward compatibility inference
          setCategoryRequirements([
            { id: 'req-vidro', categoryType: 'GLASS', label: 'Vidro das Folhas' },
            { id: 'req-perfil', categoryType: 'PROFILE', label: 'Perfis de Alumínio' },
            { id: 'req-ferragem', categoryType: 'HARDWARE', label: 'Ferragens e Acessórios' },
          ]);
        }
      }
    } else if (!isEditing) {
      setName('');
      setCategoryId('');
      setTemplateType('SLIDING_DOOR_2F');
      setTemplateConfig({
        templateType: 'SLIDING_DOOR_2F',
        aluminumColor: 'BLACK',
        glassFinish: 'CLEAR',
        openingDirection: 'LEFT_TO_RIGHT',
        handleType: 'SHELL_LOCK',
      });
      setCategoryRequirements([
        { id: 'req-vidro', categoryType: 'GLASS', label: 'Vidro das Folhas' },
        { id: 'req-perfil', categoryType: 'PROFILE', label: 'Perfis e Trilhos de Alumínio' },
        { id: 'req-ferragem', categoryType: 'HARDWARE', label: 'Kit de Ferragens e Fechos' },
      ]);
    }
  }, [id, isEditing, productsData]);

  const handleCreateCategory = (categoryName: string) => {
    toast.success(`Categoria "${categoryName}" criada com sucesso!`);
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('O nome do produto é obrigatório.');
      return;
    }
    if (!categoryId) {
      toast.error('Selecione uma categoria para o produto.');
      return;
    }

    if (categoryRequirements.length === 0) {
      toast.error('Adicione ao menos uma categoria de insumo ao template da esquadria.');
      return;
    }

    const payload = {
      name: name.trim(),
      categoryId,
      laborCost: 0,
      templateType,
      templateConfig: {
        ...templateConfig,
        templateType,
      },
      categoryRequirements,
      items: [],
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
            {isEditing ? 'Editar Template' : 'Novo Template de Produto'}
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
            disabled={isPending || categoryRequirements.length === 0}
            className="flex items-center gap-xs px-md py-xs bg-primary text-on-primary rounded-sm font-label-bold text-label-bold hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            {isEditing ? 'Atualizar' : 'Salvar Template'}
          </button>
        </div>
      </div>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-md lg:p-margin-desktop max-w-4xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-sm mb-lg">
          <div>
            <h2 className="font-headline text-headline-md lg:text-headline-lg text-on-surface">
              {isEditing ? 'Edição de Template' : 'Novo Template de Produto'}
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
              Defina o nome da esquadria, categoria, modelo SVG paramétrico e as categorias de insumos necessárias (ex: Vidro, Perfil, Ferragem, Película).
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-lg pb-xl">
          {/* Informações Básicas + Modelo SVG */}
          <ProductGeneralInfo
            name={name}
            setName={setName}
            categoryId={categoryId}
            setCategoryId={setCategoryId}
            templateType={templateType}
            setTemplateType={setTemplateType}
            templateConfig={templateConfig}
            setTemplateConfig={setTemplateConfig}
            categories={categories}
            onCreateCategory={handleCreateCategory}
          />

          {/* Categorias de Insumos da Esquadria */}
          <ProductTechSheet
            categoryRequirements={categoryRequirements}
            setCategoryRequirements={setCategoryRequirements}
          />
        </div>
      </div>
    </div>
  );
}


