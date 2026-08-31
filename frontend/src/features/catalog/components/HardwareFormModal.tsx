import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

import {
  useCreateHardware,
  useUpdateHardware,
} from '../hooks/useCatalog';

import {
  formatCurrencyInput,
  parseCurrencyString,
  formatUppercase,
  formatInteger,
} from '../../../utils/formatters';

import { StatusToggle } from './StatusToggle';

import toast from 'react-hot-toast';

import {
  hardwareSchema,
  type HardwareFormValues,
} from '../schemas/catalogSchemas';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
}

export function HardwareFormModal({
  isOpen,
  onClose,
  initialData,
}: Props) {
  const isEditing = Boolean(initialData);

  const {
    mutate: createHardware,
    isPending: isCreatePending,
  } = useCreateHardware();

  const {
    mutate: updateHardware,
    isPending: isUpdatePending,
  } = useUpdateHardware();

  const isPending =
    isCreatePending || isUpdatePending;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<HardwareFormValues>({
    resolver: zodResolver(hardwareSchema),

    defaultValues: {
      skuCode: '',
      name: '',
      ncmCode: '',
      unitMeasure: 'UN',
      costPrice: '',
      salePrice: '',
      active: true,
    },
  });

  const activeValue = watch('active');

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (initialData) {
      reset({
        skuCode: initialData.skuCode || '',
        name: initialData.name || '',
        ncmCode: initialData.ncmCode || '',
        unitMeasure:
          initialData.unitMeasure || 'UN',
        costPrice: formatCurrencyInput(
          (initialData.costPrice ?? 0).toFixed(2)
        ),
        salePrice: formatCurrencyInput(
          (initialData.salePrice ?? 0).toFixed(2)
        ),
        active: initialData.active ?? true,
      });

      return;
    }

    reset({
      skuCode: '',
      name: '',
      ncmCode: '',
      unitMeasure: 'UN',
      costPrice: '',
      salePrice: '',
      active: true,
    });
  }, [isOpen, initialData, reset]);

  const onSubmit = (data: HardwareFormValues) => {
    const payload = {
      name: data.name,
      skuCode: data.skuCode,
      unitMeasure: data.unitMeasure,

      calculationType:
        data.unitMeasure === 'UN'
          ? 'UNIT'
          : data.unitMeasure === 'PAR'
            ? 'PAIR'
            : 'LINEAR_METER',

      costPrice: parseCurrencyString(
        data.costPrice
      ),

      salePrice: parseCurrencyString(
        data.salePrice
      ),

      ncmCode: data.ncmCode?.trim()
        ? data.ncmCode.trim()
        : undefined,

      active: data.active,
    };

    if (isEditing) {
      updateHardware(
        {
          id: initialData.id,
          data: payload as any,
        },
        {
          onSuccess: onClose,
          onError: (err: any) => {
            toast.error(
              err?.response?.data?.message ||
                'Erro de servidor.'
            );
          },
        }
      );

      return;
    }

    createHardware(payload as any, {
      onSuccess: onClose,
      onError: (err: any) => {
        toast.error(
          err?.response?.data?.message ||
            'Erro de servidor.'
        );
      },
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${isEditing ? 'Edição' : 'Cadastro'} de Ferragem / Acessório`}
      footer={
        <>
          <Button
            variant="ghost"
            data-cy="hardware-form-cancel-button"
            onClick={onClose}
            disabled={isPending}
          >
            Cancelar
          </Button>

          <Button
            variant="primary"
            data-cy="hardware-form-save-button"
            onClick={handleSubmit(onSubmit)}
            disabled={isPending}
          >
            {isPending
              ? 'Salvando...'
              : isEditing
                ? 'Atualizar'
                : 'Salvar'}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-md">

        {/* Código */}
        <div
          data-cy="hardware-form-sku-field"
          className="col-span-1 md:col-span-2"
        >
          <Input
            data-cy="hardware-form-sku"
            label="Código (SKU) *"
            placeholder="Ex: FER-001"
            aria-invalid={Boolean(errors.skuCode)}
            {...register('skuCode', {
              onChange: (e) => {
                setValue(
                  'skuCode',
                  formatUppercase(e.target.value)
                );
              },
            })}
            error={errors.skuCode?.message}
          />
        </div>

        {/* Nome */}
        <div
          data-cy="hardware-form-name-field"
          className="col-span-1 md:col-span-2"
        >
          <Input
            data-cy="hardware-form-name"
            label="Nome / Descrição *"
            placeholder="Ex: FECHADURA PARA PORTA"
            aria-invalid={Boolean(errors.name)}
            {...register('name', {
              onChange: (e) => {
                setValue(
                  'name',
                  formatUppercase(e.target.value)
                );
              },
            })}
            error={errors.name?.message}
          />
        </div>

        {/* NCM */}
        <div
          data-cy="hardware-form-ncm-field"
          className="col-span-1 md:col-span-2"
        >
          <Input
            data-cy="hardware-form-ncm"
            label="Código NCM"
            placeholder="Opcional"
            {...register('ncmCode', {
              onChange: (e) => {
                setValue(
                  'ncmCode',
                  formatInteger(
                    e.target.value
                  ).slice(0, 8)
                );
              },
            })}
          />
        </div>

        {/* Unidade */}
       <div
         data-cy="hardware-form-unit-field"
         className="flex flex-col gap-xs col-span-1 md:col-span-2"
       >
         <label
           htmlFor="hardware-unit"
           className="font-label-bold text-label-bold text-on-surface text-xs"
         >
           Unidade de Medida *
         </label>

         <select
           id="hardware-unit"
           data-cy="hardware-form-unit"
           className="w-full px-sm py-xs bg-surface-container-low border border-outline-variant rounded-sm font-body-sm text-body-sm text-on-surface h-[34px]"
           {...register('unitMeasure')}
         >
           <option value="">
             Selecione uma unidade
           </option>

           <option value="UN">
             Unidade (UN)
           </option>

           <option value="PAR">
             Par (PAR)
           </option>

           <option value="METRO">
             Metro Linear (M)
           </option>
         </select>

         {errors.unitMeasure?.message && (
           <span
             data-cy="hardware-form-unit-error"
             className="font-body-sm text-body-sm text-error"
           >
             {errors.unitMeasure.message}
           </span>
         )}
       </div>

        {/* Preços */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md col-span-1 md:col-span-2 mt-xs">

          {/* Custo */}
          <div data-cy="hardware-form-cost-price-field">
            <Input
              data-cy="hardware-form-cost-price"
              label="Preço de Custo *"
              unit="R$"
              placeholder="0,00"
              aria-invalid={Boolean(errors.costPrice)}
              {...register('costPrice', {
                onChange: (e) => {
                  setValue(
                    'costPrice',
                    formatCurrencyInput(
                      e.target.value
                    )
                  );
                },
              })}
              error={errors.costPrice?.message}
            />
          </div>

          {/* Venda */}
          <div data-cy="hardware-form-sale-price-field">
            <Input
              data-cy="hardware-form-sale-price"
              label="Preço de Venda *"
              unit="R$"
              placeholder="0,00"
              aria-invalid={Boolean(errors.salePrice)}
              {...register('salePrice', {
                onChange: (e) => {
                  setValue(
                    'salePrice',
                    formatCurrencyInput(
                      e.target.value
                    )
                  );
                },
              })}
              error={errors.salePrice?.message}
            />
          </div>
        </div>

        {/* Status */}
        {isEditing && (
          <div
            data-cy="hardware-form-status-field"
            className="col-span-1 md:col-span-2 mt-xs"
          >
            <StatusToggle
              active={activeValue}
              onChange={(value) =>
                setValue('active', value)
              }
            />
          </div>
        )}
      </div>
    </Modal>
  );
}