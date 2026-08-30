import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

import {
  useCreateFilm,
  useUpdateFilm,
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
  filmSchema,
  type FilmFormValues,
} from '../schemas/catalogSchemas';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
}

export function FilmFormModal({
  isOpen,
  onClose,
  initialData,
}: Props) {
  const isEditing = Boolean(initialData);

  const {
    mutate: createFilm,
    isPending: isCreatePending,
  } = useCreateFilm();

  const {
    mutate: updateFilm,
    isPending: isUpdatePending,
  } = useUpdateFilm();

  const isPending =
    isCreatePending || isUpdatePending;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FilmFormValues>({
    resolver: zodResolver(filmSchema),

    defaultValues: {
      skuCode: '',
      name: '',
      ncmCode: '',
      filmType: '',
      thicknessMm: '0.08',
      standardLengthM: '30',
      maxWidthMm: '1520',
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
        skuCode:
          initialData.commercialReference || '',

        name:
          initialData.name || '',

        ncmCode:
          initialData.ncmCode || '',

        filmType:
          initialData.colorFinish || '',

        thicknessMm:
          initialData.thicknessMm?.toString() ||
          '0.08',

        standardLengthM:
          initialData.standardLengthM?.toString() ||
          '30',

        maxWidthMm:
          initialData.maxWidthMm?.toString() ||
          '1520',

        costPrice:
          formatCurrencyInput(
            (initialData.costPrice ?? 0).toFixed(2)
          ),

        salePrice:
          formatCurrencyInput(
            (initialData.salePrice ?? 0).toFixed(2)
          ),

        active:
          initialData.active ?? true,
      });

      return;
    }

    reset({
      skuCode: '',
      name: '',
      ncmCode: '',
      filmType: '',
      thicknessMm: '0.08',
      standardLengthM: '30',
      maxWidthMm: '1520',
      costPrice: '',
      salePrice: '',
      active: true,
    });
  }, [isOpen, initialData, reset]);

  const onSubmit = (data: FilmFormValues) => {
    const payload = {
      name: data.name,
      commercialReference: data.skuCode,
      colorFinish: data.filmType,
      salePrice: parseCurrencyString(data.salePrice),
      costPrice: parseCurrencyString(data.costPrice),
      thicknessMm:
        Number(data.thicknessMm) || 0.08,
      standardLengthM:
        Number(data.standardLengthM) || 30,
      maxWidthMm:
        Number(data.maxWidthMm) || 1520,
      ncmCode: data.ncmCode?.trim()
        ? data.ncmCode.trim()
        : undefined,
      unitMeasure:
        initialData?.unitMeasure || 'M2',
      active: data.active,
    };

    if (isEditing) {
      updateFilm(
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

    createFilm(payload as any, {
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
      title={`${isEditing ? 'Edição' : 'Cadastro'} de Película`}
      footer={
        <>
          <Button
            variant="ghost"
            data-cy="film-form-cancel-button"
            onClick={onClose}
            disabled={isPending}
          >
            Cancelar
          </Button>

          <Button
            variant="primary"
            data-cy="film-form-save-button"
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

        {/* Referência Comercial */}
        <div
          data-cy="film-form-sku-field"
          className="col-span-1 md:col-span-2"
        >
          <Input
            data-cy="film-form-sku"
            label="Referência Comercial (Opcional)"
            placeholder="Ex: G20"
            {...register('skuCode', {
              onChange: (e) => {
                setValue(
                  'skuCode',
                  formatUppercase(e.target.value)
                );
              },
            })}
          />
        </div>

        {/* Nome / Descrição */}
        <div
          data-cy="film-form-name-field"
          className="col-span-1 md:col-span-2"
        >
          <Input
            data-cy="film-form-name"
            label="Nome / Descrição *"
            placeholder="Ex: PELÍCULA G20 FUMÊ"
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
          data-cy="film-form-ncm-field"
          className="col-span-1 md:col-span-2"
        >
          <Input
            data-cy="film-form-ncm"
            label="Código NCM"
            placeholder="Opcional"
            {...register('ncmCode', {
              onChange: (e) => {
                setValue(
                  'ncmCode',
                  formatInteger(e.target.value).slice(0, 8)
                );
              },
            })}
          />
        </div>

        {/* Tipo / Cor */}
        <div
          data-cy="film-form-type-field"
          className="col-span-1 md:col-span-2"
        >
          <Input
            data-cy="film-form-type"
            label="Tipo/Cor *"
            placeholder="Ex: FUMÊ"
            aria-invalid={Boolean(errors.filmType)}
            {...register('filmType', {
              onChange: (e) => {
                setValue(
                  'filmType',
                  formatUppercase(e.target.value)
                );
              },
            })}
            error={errors.filmType?.message}
          />
        </div>

        {/* Espessura */}
        <div data-cy="film-form-thickness-field">
          <Input
            data-cy="film-form-thickness"
            label="Espessura (mm)"
            placeholder="Ex: 0.08"
            {...register('thicknessMm')}
            error={errors.thicknessMm?.message}
          />
        </div>

        {/* Comprimento */}
        <div data-cy="film-form-standard-length-field">
          <Input
            data-cy="film-form-standard-length"
            label="Comprimento da Bobina (m)"
            placeholder="Ex: 30"
            {...register('standardLengthM')}
             error={errors.standardLengthM?.message}
          />
        </div>

        {/* Largura */}
        <div
          data-cy="film-form-max-width-field"
          className="col-span-1 md:col-span-2"
        >
          <Input
            data-cy="film-form-max-width"
            label="Largura da Bobina (mm)"
            placeholder="Ex: 1520"
            error={errors.maxWidthMm?.message}
            {...register('maxWidthMm', {
              onChange: (e) => {
                setValue(
                  'maxWidthMm',
                  formatInteger(e.target.value).slice(0, 5)
                );
              },
            })}
          />
        </div>

        {/* Preços */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md col-span-1 md:col-span-2 mt-xs">

          {/* Custo */}
          <div data-cy="film-form-cost-price-field">
            <Input
              data-cy="film-form-cost-price"
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

          {/* Venda */}
          <div data-cy="film-form-sale-price-field">
            <Input
              data-cy="film-form-sale-price"
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

        {/* Status */}
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