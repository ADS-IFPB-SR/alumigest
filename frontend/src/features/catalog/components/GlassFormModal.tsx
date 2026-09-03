import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

import { useCreateGlass, useUpdateGlass } from '../hooks/useCatalog';

import {
  formatCurrencyInput,
  parseCurrencyString,
  formatUppercase,
  formatInteger,
} from '../../../utils/formatters';

import { StatusToggle } from './StatusToggle';

import toast from 'react-hot-toast';

import {
  glassSchema,
  type GlassFormValues,
} from '../schemas/catalogSchemas';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
}

export function GlassFormModal({
  isOpen,
  onClose,
  initialData,
}: Props) {
  const isEditing = Boolean(initialData);

  const {
    mutate: createGlass,
    isPending: isCreatePending,
  } = useCreateGlass();

  const {
    mutate: updateGlass,
    isPending: isUpdatePending,
  } = useUpdateGlass();

  const isPending = isCreatePending || isUpdatePending;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<GlassFormValues>({
    resolver: zodResolver(glassSchema),

    defaultValues: {
      name: '',
      ncmCode: '',
      thicknessMm: '8',
      colorFinish: '',
      maxWidthMm: '2000',
      maxHeightMm: '3000',
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
        name: initialData.name ?? '',
        ncmCode: initialData.ncmCode ?? '',
        thicknessMm: initialData.thicknessMm?.toString() ?? '8',
        colorFinish: initialData.colorFinish ?? '',
        maxWidthMm: initialData.maxWidthMm?.toString() ?? '2000',
        maxHeightMm: initialData.maxHeightMm?.toString() ?? '3000',
        costPrice: formatCurrencyInput(
          Number(initialData.costPrice ?? 0).toFixed(2)
        ),
        salePrice: formatCurrencyInput(
          Number(
            initialData.salePrice ??
            initialData.pricePerSqm ??
            0
          ).toFixed(2)
        ),
        active: initialData.active ?? true,
      });

      return;
    }

    reset({
      name: '',
      ncmCode: '',
      thicknessMm: '8',
      colorFinish: '',
      maxWidthMm: '2000',
      maxHeightMm: '3000',
      costPrice: '',
      salePrice: '',
      active: true,
    });
  }, [isOpen, initialData, reset]);

  const onSubmit = (data: GlassFormValues) => {
    const payload = {
      name: data.name,
      thicknessMm: Number(data.thicknessMm),
      colorFinish: data.colorFinish,
      maxWidthMm: Number(data.maxWidthMm),
      maxHeightMm: Number(data.maxHeightMm),
      costPrice: parseCurrencyString(data.costPrice),
      salePrice: parseCurrencyString(data.salePrice),
      ncmCode: data.ncmCode?.trim()
        ? data.ncmCode.trim()
        : undefined,
      active: data.active,
    };

    if (isEditing) {
      updateGlass(
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

    createGlass(payload as any, {
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
      title={`${isEditing ? 'Edição' : 'Cadastro'} de Vidro`}
      footer={
        <>
          <Button
            variant="ghost"
            data-cy="glass-form-cancel-button"
            onClick={onClose}
            disabled={isPending}
          >
            Cancelar
          </Button>

          <Button
            variant="primary"
            data-cy="glass-form-save-button"
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

        {/* Nome */}
        <div
          data-cy="glass-form-name-field"
          className="col-span-1 md:col-span-2"
        >
          <Input
            data-cy="glass-form-name"
            label="Nome / Descrição *"
            placeholder="Ex: VIDRO TEMPERADO 8MM INCOLOR"
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
          data-cy="glass-form-ncm-field"
          className="col-span-1 md:col-span-2"
        >
          <Input
            data-cy="glass-form-ncm"
            label="Código NCM"
            placeholder="Opcional"
            aria-invalid={Boolean(errors.ncmCode)}
            {...register('ncmCode', {
              onChange: (e) => {
                setValue(
                  'ncmCode',
                  formatInteger(e.target.value).slice(0, 8)
                );
              },
            })}
            error={errors.ncmCode?.message}
          />
        </div>

        {/* Espessura */}
        <div
          data-cy="glass-form-thickness-field"
          className="flex flex-col gap-xs"
        >
          <label
            htmlFor="glass-thickness"
            className="font-label-bold text-label-bold text-on-surface text-xs"
          >
            Espessura (mm) *
          </label>

          <select
            id="glass-thickness"
            data-cy="glass-form-thickness"
            aria-invalid={Boolean(errors.thicknessMm)}
            className="w-full px-sm py-xs bg-surface-container-low border border-outline-variant rounded-sm font-body-sm text-body-sm text-on-surface h-[34px]"
            {...register('thicknessMm')}
          >
            {[2, 4, 6, 8, 10].map((value) => (
              <option key={value} value={value}>
                {value} mm
              </option>
            ))}
          </select>

          {errors.thicknessMm?.message && (
            <span
              data-cy="glass-form-thickness-error"
              className="font-body-sm text-body-sm text-error"
            >
              {errors.thicknessMm.message}
            </span>
          )}
        </div>

        {/* Cor / Acabamento */}
        <div data-cy="glass-form-color-finish-field">
          <Input
            data-cy="glass-form-color-finish"
            label="Cor / Acabamento *"
            placeholder="Ex: INCOLOR"
            aria-invalid={Boolean(errors.colorFinish)}
            {...register('colorFinish', {
              onChange: (e) => {
                setValue(
                  'colorFinish',
                  formatUppercase(e.target.value)
                );
              },
            })}
            error={errors.colorFinish?.message}
          />
        </div>

        {/* Largura Máxima */}
        <div data-cy="glass-form-max-width-field">
          <Input
            data-cy="glass-form-max-width"
            label="Largura Máxima (mm) *"
            placeholder="Ex: 2000"
            aria-invalid={Boolean(errors.maxWidthMm)}
            {...register('maxWidthMm', {
              onChange: (e) => {
                setValue(
                  'maxWidthMm',
                  formatInteger(e.target.value).slice(0, 5)
                );
              },
            })}
            error={errors.maxWidthMm?.message}
          />
        </div>

        {/* Altura Máxima */}
        <div data-cy="glass-form-max-height-field">
          <Input
            data-cy="glass-form-max-height"
            label="Altura Máxima (mm) *"
            placeholder="Ex: 3000"
            aria-invalid={Boolean(errors.maxHeightMm)}
            {...register('maxHeightMm', {
              onChange: (e) => {
                setValue(
                  'maxHeightMm',
                  formatInteger(e.target.value).slice(0, 5)
                );
              },
            })}
            error={errors.maxHeightMm?.message}
          />
        </div>

        {/* Preços */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md col-span-1 md:col-span-2 mt-xs">

          {/* Preço de Custo */}
          <div data-cy="glass-form-cost-price-field">
            <Input
              data-cy="glass-form-cost-price"
              label="Preço de Custo *"
              unit="R$/m²"
              placeholder="0,00"
              aria-invalid={Boolean(errors.costPrice)}
              {...register('costPrice', {
                onChange: (e) => {
                  setValue(
                    'costPrice',
                    formatCurrencyInput(e.target.value)
                  );
                },
              })}
              error={errors.costPrice?.message}
            />
          </div>

          {/* Preço de Venda */}
          <div data-cy="glass-form-sale-price-field">
            <Input
              data-cy="glass-form-sale-price"
              label="Preço de Venda *"
              unit="R$/m²"
              placeholder="0,00"
              aria-invalid={Boolean(errors.salePrice)}
              {...register('salePrice', {
                onChange: (e) => {
                  setValue(
                    'salePrice',
                    formatCurrencyInput(e.target.value)
                  );
                },
              })}
              error={errors.salePrice?.message}
            />
          </div>

        </div>

        {/* Status - somente edição */}
        {isEditing && (
          <div className="col-span-1 md:col-span-2 mt-xs">
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