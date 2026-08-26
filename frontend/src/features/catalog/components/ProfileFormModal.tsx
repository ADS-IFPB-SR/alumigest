import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useCreateProfile, useUpdateProfile } from '../hooks/useCatalog';
import { formatCurrencyInput, parseCurrencyString, formatUppercase, formatInteger, formatWeightInput, parseWeightString } from '../../../utils/formatters';
import { StatusToggle } from './StatusToggle';
import toast from 'react-hot-toast';
import { profileSchema, type ProfileFormValues } from '../schemas/catalogSchemas';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
}

export function ProfileFormModal({ isOpen, onClose, initialData }: Props) {
  const isEditing = Boolean(initialData);
  const { mutate: createProfile, isPending: isCreatePending } = useCreateProfile();
  const { mutate: updateProfile, isPending: isUpdatePending } = useUpdateProfile();
  const isPending = isCreatePending || isUpdatePending;

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      skuCode: '', commercialLine: '', description: '', ncmCode: '', colorFinish: 'INCOLOR', weight: '', length: '3', costPrice: '', salePrice: '', active: true
    }
  });

  const activeValue = watch('active');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          skuCode: initialData.commercialReference || '',
          commercialLine: initialData.commercialLine || '',
          description: initialData.name || '',
          ncmCode: initialData.ncmCode || '',
          colorFinish: initialData.colorFinish || 'INCOLOR',
          weight: formatWeightInput(initialData.weight?.toFixed(3) || ''),
          length: initialData.standardLengthM?.toString() || '3',
          costPrice: formatCurrencyInput((initialData.costPrice ?? 0).toFixed(2)),
          salePrice: formatCurrencyInput((initialData.salePrice ?? 0).toFixed(2)),
          active: initialData.active ?? true
        });
      } else {
        reset({
          skuCode: '', commercialLine: '', description: '', ncmCode: '', colorFinish: 'INCOLOR', weight: '', length: '3', costPrice: '', salePrice: '', active: true
        });
      }
    }
  }, [isOpen, initialData, reset]);

  const onSubmit = (data: ProfileFormValues) => {
    const payload = {
      commercialReference: data.skuCode,
      commercialLine: data.commercialLine,
      name: data.description,
      standardLengthM: Number(data.length),
      weight: parseWeightString(data.weight),
      unitMeasure: 'BARRA_6M' as const,
      ncmCode: data.ncmCode?.trim() ? data.ncmCode.trim() : undefined,
      colorFinish: data.colorFinish,
      costPrice: parseCurrencyString(data.costPrice),
      salePrice: parseCurrencyString(data.salePrice),
      active: data.active
    };
    
    const action = isEditing ? updateProfile : createProfile;
    action(isEditing ? { id: initialData.id, data: payload as any } : payload as any, { 
      onSuccess: onClose, 
      onError: (err: any) => toast.error(err?.response?.data?.message || 'Erro de servidor.') 
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${isEditing ? 'Edição' : 'Cadastro'} de Perfil de Alumínio`}
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
          label="Código *" placeholder="Ex: ALU-SUP-01" 
          {...register('skuCode', { onChange: e => setValue('skuCode', formatUppercase(e.target.value)) })}
          error={errors.skuCode?.message}
        />
        <Input 
          label="Linha Comercial *" placeholder="Ex: ROMETAL" 
          {...register('commercialLine', { onChange: e => setValue('commercialLine', formatUppercase(e.target.value)) })}
          error={errors.commercialLine?.message}
        />
        
        <Input 
          label="Descrição *" placeholder="Descrição completa do perfil" className="col-span-1 md:col-span-2" 
          {...register('description', { onChange: e => setValue('description', formatUppercase(e.target.value)) })}
          error={errors.description?.message}
        />
        
        <Input 
          label="Cor / Acabamento *" placeholder="Ex: INCOLOR" 
          {...register('colorFinish', { onChange: e => setValue('colorFinish', formatUppercase(e.target.value)) })}
          error={errors.colorFinish?.message}
        />
        <Input 
          label="Código NCM" placeholder="Opcional" 
          {...register('ncmCode', { onChange: e => setValue('ncmCode', formatInteger(e.target.value).slice(0, 8)) })}
        />

        <Input 
          label="Peso por Metro *" unit="Kg/m" placeholder="0,000" 
          {...register('weight', { onChange: e => setValue('weight', formatWeightInput(e.target.value)) })}
          error={errors.weight?.message}
        />
        <Input 
          label="Comprimento da Barra *" unit="m" placeholder="3" 
          {...register('length', { onChange: e => setValue('length', formatInteger(e.target.value).slice(0, 2)) })}
          error={errors.length?.message}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md col-span-1 md:col-span-2 mt-xs">
          <Input 
            label="Preço de Custo *" unit="R$" placeholder="0,00" 
            {...register('costPrice', { onChange: e => setValue('costPrice', formatCurrencyInput(e.target.value)) })}
            error={errors.costPrice?.message}
          />
          <Input 
            label="Preço Metro Linear (Venda) *" unit="R$/m" placeholder="0,00" 
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
