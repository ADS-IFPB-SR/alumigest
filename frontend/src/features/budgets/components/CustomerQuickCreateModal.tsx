import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import type { CustomerRequest } from '../types';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

interface CustomerQuickCreateModalProps {
  isOpen: boolean;
  initialName?: string;
  onClose: () => void;
  onSubmit: (data: CustomerRequest) => void;
  isLoading: boolean;
}

const ESTADOS_BR = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS',
  'MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC',
  'SP','SE','TO',
];

export const CustomerQuickCreateModal: React.FC<CustomerQuickCreateModalProps> = ({
  isOpen,
  initialName = '',
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [form, setForm] = useState<CustomerRequest>({
    nomeCompleto: initialName,
    cpfCnpj: '',
    telefone: '',
    email: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
    observacoes: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerRequest, string>>>({});

  React.useEffect(() => {
    if (isOpen) {
      setForm((prev) => ({ ...prev, nomeCompleto: initialName }));
      setErrors({});
    }
  }, [isOpen, initialName]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const set = (field: keyof CustomerRequest, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validate = (): boolean => {
    const errs: Partial<Record<keyof CustomerRequest, string>> = {};
    if (!form.nomeCompleto?.trim()) errs.nomeCompleto = 'Nome é obrigatório.';
    if (!form.telefone?.trim()) errs.telefone = 'Telefone é obrigatório.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...form,
      nomeCompleto: form.nomeCompleto.trim(),
    });
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-xs sm:p-md bg-black/60 backdrop-blur-sm">
      <button
        type="button"
        className="fixed inset-0 w-full h-full bg-transparent border-0 cursor-default"
        onClick={onClose}
        tabIndex={-1}
        aria-label="Fechar fundo do modal"
      />
      <div
        className="relative bg-surface border border-outline-variant rounded-xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl z-10"
        aria-modal="true"
        aria-labelledby="customer-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-md py-sm border-b border-outline-variant bg-surface-container-low rounded-t-xl">
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-primary text-[22px]">person_add</span>
            <h3 id="customer-modal-title" className="font-headline text-headline-md font-bold text-on-surface">Cadastro Rápido de Cliente</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-xs text-on-surface-variant hover:bg-surface-container-highest rounded-full transition-colors"
            aria-label="Fechar"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-md flex flex-col gap-md">
          {/* Dados pessoais */}
          <section>
            <h4 className="text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wider mb-sm">
              Dados Pessoais
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
              <div className="col-span-1 sm:col-span-2">
                <Input
                  label="Nome Completo *"
                  id="cqc-nome"
                  value={form.nomeCompleto}
                  onChange={(e) => set('nomeCompleto', e.target.value)}
                  error={errors.nomeCompleto}
                  placeholder="João da Silva"
                />
              </div>
              <Input
                label="CPF / CNPJ"
                id="cqc-doc"
                value={form.cpfCnpj ?? ''}
                onChange={(e) => set('cpfCnpj', e.target.value)}
                placeholder="000.000.000-00"
              />
              <Input
                label="Telefone *"
                id="cqc-tel"
                value={form.telefone ?? ''}
                onChange={(e) => set('telefone', e.target.value)}
                error={errors.telefone}
                placeholder="(83) 99999-0000"
              />
              <div className="col-span-1 sm:col-span-2">
                <Input
                  label="E-mail"
                  id="cqc-email"
                  type="email"
                  value={form.email ?? ''}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="joao@email.com"
                />
              </div>
            </div>
          </section>

          {/* Endereço */}
          <section>
            <h4 className="text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wider mb-sm">
              Endereço da Obra
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-sm">
              <div className="col-span-1">
                <Input
                  label="CEP"
                  id="cqc-cep"
                  value={form.cep ?? ''}
                  onChange={(e) => set('cep', e.target.value)}
                  placeholder="58300-000"
                />
              </div>
              <div className="col-span-2 sm:col-span-3">
                <Input
                  label="Logradouro"
                  id="cqc-logr"
                  value={form.logradouro ?? ''}
                  onChange={(e) => set('logradouro', e.target.value)}
                  placeholder="Rua das Flores"
                />
              </div>
              <div className="col-span-1">
                <Input
                  label="Número"
                  id="cqc-num"
                  value={form.numero ?? ''}
                  onChange={(e) => set('numero', e.target.value)}
                  placeholder="123"
                />
              </div>
              <div className="col-span-1 sm:col-span-2">
                <Input
                  label="Complemento"
                  id="cqc-comp"
                  value={form.complemento ?? ''}
                  onChange={(e) => set('complemento', e.target.value)}
                  placeholder="Casa / Ap 101"
                />
              </div>
              <div className="col-span-2">
                <Input
                  label="Bairro"
                  id="cqc-bairro"
                  value={form.bairro ?? ''}
                  onChange={(e) => set('bairro', e.target.value)}
                  placeholder="Centro"
                />
              </div>
              <div className="col-span-1 sm:col-span-3">
                <Input
                  label="Cidade"
                  id="cqc-cidade"
                  value={form.cidade ?? ''}
                  onChange={(e) => set('cidade', e.target.value)}
                  placeholder="Santa Rita"
                />
              </div>
              <div>
                <label htmlFor="cqc-uf" className="block font-label-bold text-label-bold text-on-surface text-xs mb-xs">
                  UF
                </label>
                <select
                  id="cqc-uf"
                  value={form.uf ?? ''}
                  onChange={(e) => set('uf', e.target.value)}
                  className="w-full px-sm py-xs bg-surface-container-low border border-outline-variant rounded-sm font-body-sm text-body-sm text-on-surface focus:border-primary focus:outline-none transition-all"
                >
                  <option value="">UF</option>
                  {ESTADOS_BR.map((uf) => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Observações */}
          <div>
            <label htmlFor="cqc-obs" className="block font-label-bold text-label-bold text-on-surface text-xs mb-xs">
              Observações
            </label>
            <textarea
              id="cqc-obs"
              value={form.observacoes ?? ''}
              onChange={(e) => set('observacoes', e.target.value)}
              rows={2}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-sm p-sm font-body text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all resize-none"
              placeholder="Informações adicionais..."
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-sm px-md py-sm border-t border-outline-variant bg-surface-container-low rounded-b-xl">
          <Button variant="outline" type="button" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            icon="person_add"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? 'Cadastrando...' : 'Cadastrar Cliente'}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
