import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  separateSaleSchema,
  type SeparateSaleFormData,
  type SaleType
} from '../schemas/separateSaleSchema';

import { useCreateSeparateSale } from '../hooks/useSeparateSale';

// Importação dos componentes do seu Design System
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';

// Importação genial: Consumindo os hooks do seu módulo de Catálogo!
import {
  useGlasses,
  useProfiles,
  useFilms,
  useHardwares
} from '../../catalog/hooks/useCatalog';

export function SeparateSaleForm() {
  const { mutateAsync: createSale, isPending: isSubmitting } = useCreateSeparateSale();

  // Fetches do Catálogo
  const { data: glassesData } = useGlasses();
  const { data: profilesData } = useProfiles();
  const { data: filmsData } = useFilms();
  const { data: hardwaresData } = useHardwares();

  // Transformando os DTOs do backend no formato { value, label } que o Select precisa
  const glassOptions = useMemo(() =>
    glassesData?.content.filter(g => g.active).map(g => ({ value: g.id, label: `${g.skuCode || ''} - ${g.name}` })) || [],
  [glassesData]);

  const profileOptions = useMemo(() =>
    profilesData?.content.filter(p => p.active).map(p => ({ value: p.id, label: `${p.commercialReference} - ${p.name}` })) || [],
  [profilesData]);

  const filmOptions = useMemo(() =>
    filmsData?.content.filter(f => f.active).map(f => ({ value: f.id, label: f.name })) || [],
  [filmsData]);

  const hardwareOptions = useMemo(() =>
    hardwaresData?.content.filter(h => h.active).map(h => ({ value: h.id, label: `${h.skuCode} - ${h.name}` })) || [],
  [hardwaresData]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<SeparateSaleFormData>({
    resolver: zodResolver(separateSaleSchema),
    defaultValues: {
      saleType: 'GLASS',
      quantity: 1,
    },
  });

  const currentSaleType = watch('saleType');

  // Alternador de Abas Interno (Limpa os dados ao trocar para não enviar sujeira pro Back)
  const handleTypeChange = (type: SaleType) => {
    if (type === currentSaleType) return;
    reset({
      saleType: type,
      quantity: 1, // Mantém default
    });
  };

  const onSubmit = async (data: SeparateSaleFormData) => {
    await createSale(data);
    reset({ saleType: currentSaleType, quantity: 1 }); // Reseta o form após sucesso
  };

  return (
    <div className="bg-surface-container-lowest dark:bg-[#182230] border border-outline-variant/80 dark:border-outline/30 rounded-lg p-md sm:p-lg w-full max-w-3xl shadow-sm animate-in fade-in zoom-in-95 duration-200">

      {/* Cabeçalho */}
      <div className="mb-md">
        <div className="flex items-center gap-sm mb-xs">
          <span className="material-symbols-outlined text-primary dark:text-primary-fixed text-[24px]">
            sell
          </span>
          <h2 className="font-headline text-headline-sm font-bold text-primary dark:text-inverse-on-surface leading-tight">
            Venda das Partes
          </h2>
        </div>
        <p className="font-body text-sm text-secondary dark:text-outline-variant">
          Adicione insumos avulsos ao orçamento (venda separada) sem a necessidade de compor uma esquadria completa.
        </p>
      </div>

      {/* Segmented Control (Toggle Estilizado) */}
      <div className="flex p-1 mb-lg bg-surface-container-low dark:bg-[#0a1424] rounded-md border border-outline-variant/40 dark:border-outline/20">
        <button
          type="button"
          onClick={() => handleTypeChange('GLASS')}
          className={`flex-1 py-sm text-sm font-label font-bold rounded-sm transition-all flex items-center justify-center gap-xs ${
            currentSaleType === 'GLASS'
              ? 'bg-white dark:bg-[#182230] text-primary dark:text-primary-fixed shadow-xs'
              : 'text-secondary dark:text-outline-variant hover:text-primary dark:hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">window</span>
          Venda de Vidro
        </button>
        <button
          type="button"
          onClick={() => handleTypeChange('ALUMINUM')}
          className={`flex-1 py-sm text-sm font-label font-bold rounded-sm transition-all flex items-center justify-center gap-xs ${
            currentSaleType === 'ALUMINUM'
              ? 'bg-white dark:bg-[#182230] text-primary dark:text-primary-fixed shadow-xs'
              : 'text-secondary dark:text-outline-variant hover:text-primary dark:hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">view_column</span>
          Venda de Alumínio
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-md">

        {/* CAMPOS COMUNS (Base) */}
        <div className="p-md rounded-md border border-outline-variant/40 dark:border-outline/20 bg-[#F8FAFC] dark:bg-surface-container-high/10">
          <h3 className="font-label text-label-bold text-primary dark:text-inverse-on-surface mb-sm uppercase tracking-wider text-xs">
            Dimensões e Quantidade
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-sm">
            <Input
              label="Largura (L) *"
              type="number"
              unit="mm"
              {...register('width')}
              error={errors.width?.message}
            />
            <Input
              label="Altura (H) *"
              type="number"
              unit="mm"
              {...register('height')}
              error={errors.height?.message}
            />
            <Input
              label="Quantidade *"
              type="number"
              unit="un"
              {...register('quantity')}
              error={errors.quantity?.message}
            />
          </div>
        </div>

        {/* CAMPOS CONDICIONAIS */}
        <div className="p-md rounded-md border border-outline-variant/40 dark:border-outline/20 bg-[#F8FAFC] dark:bg-surface-container-high/10">
          <h3 className="font-label text-label-bold text-primary dark:text-inverse-on-surface mb-sm uppercase tracking-wider text-xs">
            Especificações do Material
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">

            {currentSaleType === 'GLASS' && (
              <>
                <Select
                  label="Tipo de Vidro *"
                  options={glassOptions}
                  {...register('glassId')}
                  error={errors.glassId?.message}
                />
                <Select
                  label="Película (Opcional)"
                  options={filmOptions}
                  {...register('filmId')}
                  error={errors.filmId?.message}
                />
              </>
            )}

            {currentSaleType === 'ALUMINUM' && (
              <>
                <Select
                  label="Tipo de Alumínio *"
                  options={profileOptions}
                  {...register('profileId')}
                  error={errors.profileId?.message}
                />
                <Select
                  label="Esquadreta *"
                  options={hardwareOptions}
                  {...register('hardwareId')}
                  error={errors.hardwareId?.message}
                />
              </>
            )}

          </div>
        </div>

        {/* Rodapé e Ações */}
        <div className="flex justify-end pt-sm border-t border-outline-variant/60 dark:border-outline/30 gap-xs">
          <Button type="button" variant="ghost" onClick={() => reset()}>
            Limpar
          </Button>
          <Button type="submit" variant="primary" icon="add" disabled={isSubmitting}>
            {isSubmitting ? 'Processando...' : 'Adicionar ao Orçamento'}
          </Button>
        </div>
      </form>
    </div>
  );
}