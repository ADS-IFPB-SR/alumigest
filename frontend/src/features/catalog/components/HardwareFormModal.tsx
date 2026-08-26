import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useCreateHardware, useUpdateHardware } from '../hooks/useCatalog';
import { formatCurrencyInput, parseCurrencyString, formatUppercase, formatInteger } from '../../../utils/formatters';
import { StatusToggle } from './StatusToggle';
import toast from 'react-hot-toast';
import { hardwareSchema, type HardwareFormValues } from '../schemas/catalogSchemas';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
}

export function HardwareFormModal({ isOpen, onClose, initialData }: Props) {
  const isEditing = Boolean(initialData);
  const { mutate: createHardware, isPending: isCreatePending } = useCreateHardware();
  const { mutate: updateHardware, isPending: isUpdatePending } = useUpdateHardware();
  const isPending = isCreatePending || isUpdatePending;

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<HardwareFormValues>({
    resolver: zodResolver(hardwareSchema),
    defaultValues: {
      skuCode: '', name: '', ncmCode: '', unitMeasure: 'UN', costPrice: '', salePrice: '', active: true
    }
  });

  const activeValue = watch('active');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          skuCode: initialData.skuCode || '',
          name: initialData.name || '',
          ncmCode: initialData.ncmCode || '',
          unitMeasure: initialData.unitMeasure || 'UN',
          costPrice: formatCurrencyInput((initialData.costPrice ?? 0).toFixed(2)),
          salePrice: formatCurrencyInput((initialData.salePrice ?? 0).toFixed(2)),
          active: initialData.active ?? true
        });
      } else {
        reset({
          skuCode: '', name: '', ncmCode: '', unitMeasure: 'UN', costPrice: '', salePrice: '', active: true
        });
      }
    }
  }, [isOpen, initialData, reset]);

  const onSubmit = (data: HardwareFormValues) => {
    const payload = {
      name: data.name,
      skuCode: data.skuCode,
      unitMeasure: data.unitMeasure,
      calculationType: data.unitMeasure === 'UN' ? 'UNIT' : (data.unitMeasure === 'PAR' ? 'PAIR' : 'LINEAR_METER'),
      costPrice: parseCurrencyString(data.costPrice),
      salePrice: parseCurrencyString(data.salePrice),
      ncmCode: data.ncmCode?.trim() ? data.ncmCode.trim() : undefined,
      active: data.active
    };

    const action = isEditing ? updateHardware : createHardware;
    action(isEditing ? { id: initialData.id, data: payload as any } : payload as any, { 
      onSuccess: onClose, 
      onError: (err: any) => toast.error(err?.response?.data?.message || 'Erro de servidor.') 
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${isEditing ? 'Edição' : 'Cadastro'} de Ferragem / Acessório`}
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
          label="Código (SKU) *" placeholder="Ex: FER-001" className="col-span-1 md:col-span-2" 
          {...register('skuCode', { onChange: e => setValue('skuCode', formatUppercase(e.target.value)) })}
          error={errors.skuCode?.message}
        />
        <Input 
          label="Nome / Descrição *" placeholder="Ex: FECHADURA PARA PORTA" className="col-span-1 md:col-span-2" 
          {...register('name', { onChange: e => setValue('name', formatUppercase(e.target.value)) })}
          error={errors.name?.message}
        />
        <Input 
          label="Código NCM" placeholder="Opcional" className="col-span-1 md:col-span-2" 
          {...register('ncmCode', { onChange: e => setValue('ncmCode', formatInteger(e.target.value).slice(0, 8)) })}
        />
        
        <div className="flex flex-col gap-xs col-span-1 md:col-span-2">
          <label htmlFor="hardware-unit" className="font-label-bold text-label-bold text-on-surface text-xs">Unidade de Medida *</label>
          <select id="hardware-unit" className="w-full px-sm py-xs bg-surface-container-low border border-outline-variant rounded-sm font-body-sm text-body-sm text-on-surface h-[34px]" {...register('unitMeasure')}>
            <option value="UN">Unidade (UN)</option>
            <option value="PAR">Par (PAR)</option>
            <option value="METRO">Metro Linear (M)</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-md col-span-1 md:col-span-2 mt-xs">
          <Input 
            label="Preço de Custo *" unit="R$" placeholder="0,00" 
            {...register('costPrice', { onChange: e => setValue('costPrice', formatCurrencyInput(e.target.value)) })}
            error={errors.costPrice?.message}
          />
          <Input 
            label="Preço de Venda *" unit="R$" placeholder="0,00" 
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
