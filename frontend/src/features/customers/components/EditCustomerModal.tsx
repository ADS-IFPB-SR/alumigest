import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCustomer, useUpdateCustomer } from '../hooks/useCustomers';
import type { CreateCustomerRequest } from '../services/customersApi';

interface EditCustomerModalProps {
  isOpen: boolean;
  customerId: string | undefined;
  onClose: () => void;
}

export function EditCustomerModal({ isOpen, customerId, onClose }: EditCustomerModalProps) {
  // O modal faz a busca pelo cadastro completo do cliente assim que é aberto
  const { data: customer, isLoading: isLoadingCustomer } = useCustomer(isOpen ? customerId : undefined);
  const { mutate: updateCustomer, isPending } = useUpdateCustomer();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateCustomerRequest>();

  useEffect(() => {
    if (customer) {
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
  }, [customer, reset]);

  if (!isOpen || !customerId) return null;

  const onSubmit = (data: CreateCustomerRequest) => {
    updateCustomer(
      { id: customerId, data },
      {
        onSuccess: () => {
          toast.success('Cliente atualizado com sucesso!');
          onClose();
        },
        onError: (err: any) => {
          const message = err?.response?.data?.message || 'Erro ao atualizar cliente.';
          toast.error(message);
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant">

        <div className="flex items-center justify-between p-6 border-b border-outline-variant">
          <h3 className="text-lg font-bold text-on-surface">Editar Cliente</h3>
          <button onClick={onClose} className="p-1 text-on-surface-variant hover:text-on-surface rounded-lg transition-colors">
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
                  <label className="text-xs font-semibold text-on-surface-variant uppercase">Nome / Razão Social *</label>
                  <input
                    {...register('nomeCompleto', { required: 'Nome é obrigatório' })}
                    className="w-full px-3 py-2 border rounded-lg bg-surface text-on-surface border-outline focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                  />
                  {errors.nomeCompleto && <p className="text-xs text-rose-500">{errors.nomeCompleto.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase">CPF / CNPJ *</label>
                  <input
                    {...register('documento', { required: 'Documento é obrigatório' })}
                    className="w-full px-3 py-2 border rounded-lg bg-surface text-on-surface border-outline focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                  />
                  {errors.documento && <p className="text-xs text-rose-500">{errors.documento.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase">Tipo de Pessoa *</label>
                  <select {...register('personType', { required: true })} className="w-full px-3 py-2 border rounded-lg bg-surface text-on-surface border-outline focus:outline-hidden focus:ring-2 focus:ring-primary/20">
                    <option value="FISICA">Física</option>
                    <option value="JURIDICA">Jurídica</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase">Telefone *</label>
                  <input
                    {...register('telefone', { required: 'Telefone é obrigatório' })}
                    className="w-full px-3 py-2 border rounded-lg bg-surface text-on-surface border-outline focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                  />
                  {errors.telefone && <p className="text-xs text-rose-500">{errors.telefone.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase">E-mail</label>
                  <input
                    type="email"
                    {...register('email')}
                    className="w-full px-3 py-2 border rounded-lg bg-surface text-on-surface border-outline focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-1 md:col-span-2 border-t border-outline-variant pt-4 mt-2">
                  <h4 className="text-sm font-semibold text-on-surface mb-2">Endereço</h4>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase">CEP</label>
                  <input {...register('cep')} className="w-full px-3 py-2 border rounded-lg bg-surface text-on-surface border-outline focus:outline-hidden focus:ring-2 focus:ring-primary/20" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase">Logradouro</label>
                  <input {...register('logradouro')} className="w-full px-3 py-2 border rounded-lg bg-surface text-on-surface border-outline focus:outline-hidden focus:ring-2 focus:ring-primary/20" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase">Número</label>
                  <input {...register('numero')} className="w-full px-3 py-2 border rounded-lg bg-surface text-on-surface border-outline focus:outline-hidden focus:ring-2 focus:ring-primary/20" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase">Complemento</label>
                  <input {...register('complemento')} className="w-full px-3 py-2 border rounded-lg bg-surface text-on-surface border-outline focus:outline-hidden focus:ring-2 focus:ring-primary/20" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase">Bairro</label>
                  <input {...register('bairro')} className="w-full px-3 py-2 border rounded-lg bg-surface text-on-surface border-outline focus:outline-hidden focus:ring-2 focus:ring-primary/20" />
                </div>

                <div className="grid grid-cols-[2fr_1fr] gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-on-surface-variant uppercase">Cidade</label>
                    <input {...register('cidade')} className="w-full px-3 py-2 border rounded-lg bg-surface text-on-surface border-outline focus:outline-hidden focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-on-surface-variant uppercase">UF</label>
                    <input {...register('uf')} maxLength={2} className="w-full px-3 py-2 border rounded-lg bg-surface text-on-surface border-outline focus:outline-hidden focus:ring-2 focus:ring-primary/20 uppercase" />
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-outline-variant bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="edit-customer"
            disabled={isPending || isLoadingCustomer}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors disabled:opacity-50"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar Alterações
          </button>
        </div>

      </div>
    </div>
  );
}