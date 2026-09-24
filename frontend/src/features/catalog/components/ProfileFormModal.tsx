import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

function getModalSaveLabel(isPending: boolean, isEditing: boolean): string {
  if (isPending) return 'Salvando...';
  return isEditing ? 'Atualizar' : 'Salvar';
}

import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

import {
  useCreateProfile,
  useUpdateProfile,
} from '../hooks/useCatalog';

import {
  formatCurrencyInput,
  parseCurrencyString,
  formatUppercase,
  formatInteger,
  formatWeightInput,
  parseWeightString,
} from '../../../utils/formatters';

import { StatusToggle } from './StatusToggle';

import toast from 'react-hot-toast';

import {
  profileSchema,
  type ProfileFormValues,
} from '../schemas/catalogSchemas';

import { FamilyAutocompleteInput } from './FamilyAutocompleteInput';

interface Props {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly initialData?: any;
}

export function ProfileFormModal({
  isOpen,
  onClose,
  initialData,
}: Props) {
  const isEditing = Boolean(initialData);

  const {
    mutate: createProfile,
    isPending: isCreatePending,
  } = useCreateProfile();

  const {
    mutate: updateProfile,
    isPending: isUpdatePending,
  } = useUpdateProfile();

  const isPending =
    isCreatePending || isUpdatePending;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),

    defaultValues: {
      skuCode: '',
      commercialLine: '',
      description: '',
      ncmCode: '',
      colorFinish: 'INCOLOR',
      familyCode: '',
      weight: '',
      length: '3',
      costPrice: '',
      salePrice: '',
      active: true,
      isHandle: false,
    },
  });

  const activeValue = watch('active');
  const familyCodeValue = watch('familyCode');
  const isHandleValue = watch('isHandle');

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (initialData) {
      reset({
        skuCode:
          initialData.commercialReference || '',

        commercialLine:
          initialData.commercialLine || '',

        description:
          initialData.name || '',

        ncmCode:
          initialData.ncmCode || '',

        colorFinish:
          initialData.colorFinish || 'INCOLOR',

        familyCode:
          initialData.familyCode || '',

        weight:
          formatWeightInput(
            initialData.weight?.toFixed(3) || ''
          ),

        length:
          initialData.standardLengthM?.toString() || '3',

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

        isHandle:
          initialData.isHandle ?? false,
      });

      return;
    }

    reset({
      skuCode: '',
      commercialLine: '',
      description: '',
      ncmCode: '',
      colorFinish: 'INCOLOR',
      familyCode: '',
      weight: '',
      length: '3',
      costPrice: '',
      salePrice: '',
      active: true,
      isHandle: false,
    });
  }, [isOpen, initialData, reset]);

  const onSubmit = (data: ProfileFormValues) => {
    const payload = {
      commercialReference: data.skuCode,
      commercialLine: data.commercialLine,
      name: data.description,
      familyCode: data.familyCode?.trim() ? data.familyCode.trim() : undefined,
      standardLengthM: Number(data.length),
      weight: parseWeightString(data.weight),
      unitMeasure: 'BARRA_6M' as const,
      ncmCode: data.ncmCode?.trim()
        ? data.ncmCode.trim()
        : undefined,
      colorFinish: data.colorFinish,
      costPrice: parseCurrencyString(data.costPrice),
      salePrice: parseCurrencyString(data.salePrice),
      active: data.active,
      isHandle: data.isHandle,
    };

    if (isEditing) {
      updateProfile(
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

    createProfile(payload as any, {
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
      title={`${isEditing ? 'Edição' : 'Cadastro'} de Perfil de Alumínio`}
      footer={
        <>
          <Button
            variant="ghost"
            data-cy="profile-form-cancel-button"
            onClick={onClose}
            disabled={isPending}
          >
            Cancelar
          </Button>

          <Button
            variant="primary"
            data-cy="profile-form-save-button"
            onClick={handleSubmit(onSubmit)}
            disabled={isPending}
          >
            {getModalSaveLabel(isPending, isEditing)}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-md">

        {/* Código */}
        <div data-cy="profile-form-sku-field">
          <Input
            data-cy="profile-form-sku"
            label="Código *"
            placeholder="Ex: ALU-SUP-01"
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

        {/* Linha Comercial */}
        <div data-cy="profile-form-commercial-line-field">
          <Input
            data-cy="profile-form-commercial-line"
            label="Linha Comercial *"
            placeholder="Ex: ROMETAL"
            aria-invalid={Boolean(errors.commercialLine)}
            {...register('commercialLine', {
              onChange: (e) => {
                setValue(
                  'commercialLine',
                  formatUppercase(e.target.value)
                );
              },
            })}
            error={errors.commercialLine?.message}
          />
        </div>

        {/* Descrição */}
        <div
          data-cy="profile-form-description-field"
          className="col-span-1 md:col-span-2"
        >
          <Input
            data-cy="profile-form-description"
            label="Descrição *"
            placeholder="Descrição completa do perfil"
            aria-invalid={Boolean(errors.description)}
            {...register('description', {
              onChange: (e) => {
                setValue(
                  'description',
                  formatUppercase(e.target.value)
                );
              },
            })}
            error={errors.description?.message}
          />
        </div>

        {/* Cor / Acabamento */}
        <div data-cy="profile-form-color-finish-field">
          <Input
            data-cy="profile-form-color-finish"
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

        {/* Família do Material (Agrupamento de Cores) */}
        <div
          data-cy="profile-form-family-code-field"
          className="col-span-1 md:col-span-2"
        >
          <FamilyAutocompleteInput
            data-cy="profile-form-family-code"
            label="Família do Perfil (Opcional - Linha/Troca de Cor)"
            placeholder="Ex: FAM-PERFIL-SUPREMA"
            groupCode="ALUMINIO"
            value={familyCodeValue ?? ''}
            onChange={(val) => setValue('familyCode', val, { shouldValidate: true })}
            error={errors.familyCode?.message}
          />
        </div>

        {/* NCM */}
        <div data-cy="profile-form-ncm-field">
          <Input
            data-cy="profile-form-ncm"
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

        {/* Peso */}
        <div data-cy="profile-form-weight-field">
          <Input
            data-cy="profile-form-weight"
            label="Peso por Metro *"
            unit="Kg/m"
            placeholder="0,000"
            aria-invalid={Boolean(errors.weight)}
            {...register('weight', {
              onChange: (e) => {
                setValue(
                  'weight',
                  formatWeightInput(e.target.value)
                );
              },
            })}
            error={errors.weight?.message}
          />
        </div>

        {/* Comprimento */}
        <div data-cy="profile-form-length-field">
          <Input
            data-cy="profile-form-length"
            label="Comprimento da Barra *"
            unit="m"
            placeholder="3"
            aria-invalid={Boolean(errors.length)}
            {...register('length', {
              onChange: (e) => {
                setValue(
                  'length',
                  formatInteger(e.target.value).slice(0, 2)
                );
              },
            })}
            error={errors.length?.message}
          />
        </div>

        {/* Preços */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md col-span-1 md:col-span-2 mt-xs">

          {/* Custo */}
          <div data-cy="profile-form-cost-price-field">
            <Input
              data-cy="profile-form-cost-price"
              label="Preço de Custo *"
              unit="R$"
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
          <div data-cy="profile-form-sale-price-field">
            <Input
              data-cy="profile-form-sale-price"
              label="Preço Metro Linear (Venda) *"
              unit="R$/m"
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

        {/* É Puxador? */}
        <div className="col-span-1 md:col-span-2 mt-xs p-3 rounded-lg border border-border bg-background-light flex items-center justify-between">
          <div>
            <label className="font-medium text-sm text-foreground flex items-center gap-2 cursor-pointer" htmlFor="profile-is-handle">
              <span>Este perfil é um puxador?</span>
            </label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Habilite se este perfil de alumínio for utilizado como puxador integrado nas esquadrias.
            </p>
          </div>
          <input
            id="profile-is-handle"
            type="checkbox"
            checked={Boolean(isHandleValue)}
            onChange={(e) => setValue('isHandle', e.target.checked)}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
          />
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