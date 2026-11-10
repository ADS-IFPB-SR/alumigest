import { useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { X, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCustomer, useUpdateCustomer } from '../hooks/useCustomers';
import { editCustomerSchema, type EditCustomerFormValues } from '../schemas/customerSchema';
import type { CreateCustomerRequest } from '../services/customersApi';

interface EditCustomerModalProps {
  isOpen: boolean;
  customerId: string | undefined;
  onClose: () => void;
}

export function EditCustomerModal({ isOpen, customerId, onClose }: Readonly<EditCustomerModalProps>) {
  const { data: customer, isLoading: isLoadingCustomer } = useCustomer(isOpen ? customerId : undefined);
  const { mutate: updateCustomer, isPending } = useUpdateCustomer();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<EditCustomerFormValues>({
    resolver: zodResolver(editCustomerSchema),
    defaultValues: {
      personType: 'FISICA',
    },
  });

  useEffect(() => {
    if (isOpen && customer) {
      reset({
        nomeCompleto: customer.nomeCompleto,
        personType: customer.personType,
        documento: customer.documento,
        telefone: customer.telefone || '',
        email: customer.email || '',
        cep: customer.cep || '',
        logradouro: customer.logradouro || '',
        numero: customer.numero || '',
        complemento: customer.complemento || '',
        bairro: customer.bairro || '',
        cidade: customer.cidade || '',
        uf: customer.uf || '',
        observacoes: customer.observacoes || '',
      });
    }
  }, [isOpen, customer, reset]);

  if (!isOpen || !customerId) return null;

  const onSubmit: SubmitHandler<EditCustomerFormValues> = (data) => {
    updateCustomer(
      { id: customerId, data: data as CreateCustomerRequest },
      {
        onSuccess: () => {
          toast.success('Cliente atualizado com sucesso!');
          onClose();
        },
        onError: (error: unknown) => {
          const err = error as { response?: { data?: { message?: string } } };
          const message = err?.response?.data?.message || 'Erro ao atualizar cliente.';
          toast.error(message);
        },
      }
    );
  };

  // Extração das classes repetitivas de input para manter o JSX limpo e padronizado no M3
  const inputClassName = "w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary transition";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant">

        <div className="flex items-center justify-between p-6 border-b border-outline-variant">
          <h3 className="text-lg font-bold text-on-surface">Editar Cliente</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-lg transition-colors"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {isLoadingCustomer ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <form id="edit-customer" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1 md:col-span-2">
                  <label htmlFor="nomeCompleto" className="text-xs font-semibold text-on-surface-variant uppercase">
                    Nome / Razão Social *
                  </label>
                  <input
                    id="nomeCompleto"
                    {...register('nomeCompleto')}
                    className={inputClassName}
                  />
                  {errors.nomeCompleto && <p className="text-xs text-error">{errors.nomeCompleto.message}</p>}
                </div>

                <div className="space-y-1">
                  <label htmlFor="documento" className="text-xs font-semibold text-on-surface-variant uppercase">
                    CPF / CNPJ *
                  </label>
                  <input
                    id="documento"
                    {...register('documento')}
                    className={inputClassName}
                  />
                  {errors.documento && <p className="text-xs text-error">{errors.documento.message}</p>}
                </div>

                <div className="space-y-1">
                  <label htmlFor="personType" className="text-xs font-semibold text-on-surface-variant uppercase">
                    Tipo de Pessoa *
                  </label>
                  <select
                    id="personType"
                    {...register('personType')}
                    className={inputClassName}
                  >
                    <option value="FISICA">Física</option>
                    <option value="JURIDICA">Jurídica</option>
                  </select>
                  {errors.personType && <p className="text-xs text-error">{errors.personType.message}</p>}
                </div>

                <div className="space-y-1">
                  <label htmlFor="telefone" className="text-xs font-semibold text-on-surface-variant uppercase">
                    Telefone *
                  </label>
                  <input
                    id="telefone"
                    {...register('telefone')}
                    className={inputClassName}
                  />
                  {errors.telefone && <p className="text-xs text-error">{errors.telefone.message}</p>}
                </div>

                <div className="space-y-1">
                  <label htmlFor="email" className="text-xs font-semibold text-on-surface-variant uppercase">
                    E-mail
                  </label>
                  <input
                    id="email"
                    type="email"
                    {...register('email')}
                    className={inputClassName}
                  />
                  {errors.email && <p className="text-xs text-error">{errors.email.message}</p>}
                </div>

                <div className="space-y-1 md:col-span-2 border-t border-outline-variant pt-4 mt-2">
                  <h4 className="text-sm font-semibold text-on-surface mb-2">Endereço</h4>
                </div>

                <div className="space-y-1">
                  <label htmlFor="cep" className="text-xs font-semibold text-on-surface-variant uppercase">
                    CEP
                  </label>
                  <input
                    id="cep"
                    {...register('cep')}
                    className={inputClassName}
                  />
                  {errors.cep && <p className="text-xs text-error">{errors.cep.message}</p>}
                </div>

                <div className="space-y-1">
                  <label htmlFor="logradouro" className="text-xs font-semibold text-on-surface-variant uppercase">
                    Logradouro
                  </label>
                  <input
                    id="logradouro"
                    {...register('logradouro')}
                    className={inputClassName}
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="numero" className="text-xs font-semibold text-on-surface-variant uppercase">
                    Número
                  </label>
                  <input
                    id="numero"
                    {...register('numero')}
                    className={inputClassName}
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="complemento" className="text-xs font-semibold text-on-surface-variant uppercase">
                    Complemento
                  </label>
                  <input
                    id="complemento"
                    {...register('complemento')}
                    className={inputClassName}
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="bairro" className="text-xs font-semibold text-on-surface-variant uppercase">
                    Bairro
                  </label>
                  <input
                    id="bairro"
                    {...register('bairro')}
                    className={inputClassName}
                  />
                </div>

                <div className="grid grid-cols-[2fr_1fr] gap-4">
                  <div className="space-y-1">
                    <label htmlFor="cidade" className="text-xs font-semibold text-on-surface-variant uppercase">
                      Cidade
                    </label>
                    <input
                      id="cidade"
                      {...register('cidade')}
                      className={inputClassName}
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="uf" className="text-xs font-semibold text-on-surface-variant uppercase">
                      UF
                    </label>
                    <input
                      id="uf"
                      {...register('uf')}
                      maxLength={2}
                      className={`${inputClassName} uppercase`}
                    />
                  </div>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label htmlFor="observacoes" className="text-xs font-semibold text-on-surface-variant uppercase">
                    Observações
                  </label>
                  <textarea
                    id="observacoes"
                    {...register('observacoes')}
                    rows={2}
                    className={inputClassName}
                  />
                </div>
              </div>
            </form>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-outline-variant bg-surface-container rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="edit-customer"
            disabled={isPending || isLoadingCustomer}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-on-primary bg-primary hover:opacity-90 rounded-lg transition-opacity disabled:opacity-50"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar Alterações
          </button>
        </div>

      </div>
    </div>
  );
}