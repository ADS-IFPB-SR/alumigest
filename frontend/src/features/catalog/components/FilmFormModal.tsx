// @ts-nocheck
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useCreateFilm, useUpdateFilm } from '../hooks/useCatalog';
import { formatCurrencyInput, parseCurrencyString, formatUppercase, formatInteger } from '../../../utils/formatters';
import { StatusToggle } from './StatusToggle';
import toast from 'react-hot-toast';
import { filmSchema, type FilmFormValues } from '../schemas/catalogSchemas';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
}

export function FilmFormModal({ isOpen, onClose, initialData }: Props) {
  const isEditing = Boolean(initialData);
  const { mutate: createFilm, isPending: isCreatePending } = useCreateFilm();
  const { mutate: updateFilm, isPending: isUpdatePending } = useUpdateFilm();
  const isPending = isCreatePending || isUpdatePending;

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FilmFormValues>({
    resolver: zodResolver(filmSchema),
    defaultValues: {
      skuCode: '', name: '', ncmCode: '', filmType: '', thicknessMm: '0.08', standardLengthM: '30', maxWidthMm: '1520', costPrice: '', salePrice: '', active: true
    }
  });

  const activeValue = watch('active');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          skuCode: initialData.commercialReference || '',
          name: initialData.name || '',
          ncmCode: initialData.ncmCode || '',
          filmType: initialData.colorFinish || '',
          thicknessMm: initialData.thicknessMm?.toString() || '0.08',
          standardLengthM: initialData.standardLengthM?.toString() || '30',
          maxWidthMm: initialData.maxWidthMm?.toString() || '1520',
          costPrice: formatCurrencyInput((initialData.costPrice ?? 0).toFixed(2)),
          salePrice: formatCurrencyInput((initialData.salePrice ?? 0).toFixed(2)),
          active: initialData.active ?? true
        });
      } else {
        reset({
          skuCode: '', name: '', ncmCode: '', filmType: '', thicknessMm: '0.08', standardLengthM: '30', maxWidthMm: '1520', costPrice: '', salePrice: '', active: true
        });
      }
    }
  }, [isOpen, initialData, reset]);

  const onSubmit = (data: FilmFormValues) => {
    const payload = {
      name: data.name,
      commercialReference: data.skuCode,
      colorFinish: data.filmType,
      salePrice: parseCurrencyString(data.salePrice),
      costPrice: parseCurrencyString(data.costPrice),
      thicknessMm: Number(data.thicknessMm) || 0.08,
      standardLengthM: Number(data.standardLengthM) || 30,
      maxWidthMm: Number(data.maxWidthMm) || 1520,
      ncmCode: data.ncmCode?.trim() ? data.ncmCode.trim() : undefined,
      unitMeasure: initialData?.unitMeasure || 'M2',
      active: data.active
    };

    const action = isEditing ? updateFilm : createFilm;
    action(isEditing ? { id: initialData.id, data: payload as any } : payload as any, { 
      onSuccess: onClose, 
      onError: (err: any) => toast.error(err?.response?.data?.message || 'Erro de servidor.') 
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${isEditing ? 'Edição' : 'Cadastro'} de Película`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isPending}>Cancelar</Button>
          <Button variant="primary" onClick={handleSubmit(onSubmit)} disabled={isPending}>
            {isPending ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Salvar')}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
        <Input 
          label="Referência Comercial (Opcional)" placeholder="Ex: G20" className="col-span-1 md:col-span-2" 
          {...register('skuCode', { onChange: e => setValue('skuCode', formatUppercase(e.target.value)) })}
        />
        <Input 
          label="Nome / Descrição *" placeholder="Ex: PELÍCULA G20 FUMÊ" className="col-span-1 md:col-span-2" 
          {...register('name', { onChange: e => setValue('name', formatUppercase(e.target.value)) })}
          error={errors.name?.message}
        />
        <Input 
          label="Código NCM" placeholder="Opcional" className="col-span-1 md:col-span-2" 
          {...register('ncmCode', { onChange: e => setValue('ncmCode', formatInteger(e.target.value).slice(0, 8)) })}
        />
        
        <Input 
          label="Tipo/Cor *" placeholder="Ex: FUMÊ" className="col-span-1 md:col-span-2" 
          {...register('filmType', { onChange: e => setValue('filmType', formatUppercase(e.target.value)) })}
          error={errors.filmType?.message}
        />
        <Input 
          label="Espessura (mm)" placeholder="Ex: 0.08" 
          {...register('thicknessMm')}
        />
        <Input 
          label="Comprimento da Bobina (m)" placeholder="Ex: 30" 
          {...register('standardLengthM')}
        />
        <Input 
          label="Largura da Bobina (mm)" placeholder="Ex: 1520" className="col-span-1 md:col-span-2" 
          {...register('maxWidthMm', { onChange: e => setValue('maxWidthMm', formatInteger(e.target.value).slice(0, 5)) })}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-md col-span-1 md:col-span-2 mt-xs">
          <Input 
            label="Preço de Custo *" unit="R$/m²" placeholder="0,00" 
            {...register('costPrice', { onChange: e => setValue('costPrice', formatCurrencyInput(e.target.value)) })}
            error={errors.costPrice?.message}
          />
          <Input 
            label="Preço de Venda *" unit="R$/m²" placeholder="0,00" 
            {...register('salePrice', { onChange: e => setValue('salePrice', formatCurrencyInput(e.target.value)) })}
            error={errors.salePrice?.message}
          />
        </div>
        
        {isEditing && (
          <div className="col-span-1 md:col-span-2 mt-xs">
            <StatusToggle active={activeValue} onChange={(v) => setValue('active', v)} />
          </div>
        )}
      </div>
    </Modal>
  );
}
