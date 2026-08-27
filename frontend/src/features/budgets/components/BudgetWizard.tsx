import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type {
  BudgetFormState,
  BudgetItem,
  Customer,
  CreateBudgetPayload,
} from '../types';
import { useCreateBudget } from '../hooks/useBudgets';
import { CustomerSelector } from './CustomerSelector';
import { BudgetItemsTable } from './BudgetItemsTable';
import { BudgetFinancialSummary } from './BudgetFinancialSummary';
import { WindowBuilderModal } from './builder/WindowBuilderModal';
import { Button } from '../../../components/ui/Button';
import { formatBRL } from '../utils/calculations';
import toast from 'react-hot-toast';

type WizardStep = 1 | 2 | 3;

interface StepInfo {
  number: WizardStep;
  label: string;
  description: string;
  icon: string;
}

const STEPS: StepInfo[] = [
  { number: 1, label: 'Cliente', description: 'Identificação e obra', icon: 'person' },
  { number: 2, label: 'Esquadrias', description: 'Medidas e insumos', icon: 'window' },
  { number: 3, label: 'Finalização', description: 'Revisão e descontos', icon: 'payments' },
];

const createInitialFormState = (): BudgetFormState => ({
  customerId: '',
  customerName: '',
  customerDocument: '',
  customerPhone: '',
  customerAddress: '',
  items: [],
  discountPercent: 0,
  notes: '',
  commercialConditions: '',
});

export const BudgetWizard: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [form, setForm] = useState<BudgetFormState>(createInitialFormState);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { mutate: createBudget, isPending } = useCreateBudget();

  // ─── Cálculos financeiros ─────────────────────────────────────────────────
  const subtotal = useMemo(
    () => form.items.reduce((acc, item) => acc + item.subtotal, 0),
    [form.items],
  );
  const discountValue = useMemo(
    () => (subtotal * form.discountPercent) / 100,
    [subtotal, form.discountPercent],
  );
  const total = subtotal - discountValue;

  // ─── Handlers de Cliente ──────────────────────────────────────────────────
  const handleCustomerSelect = useCallback((customer: Customer) => {
    if (!customer.id) {
      setForm((prev) => ({
        ...prev,
        customerId: '',
        customerName: '',
        customerDocument: '',
        customerPhone: '',
        customerAddress: '',
      }));
      return;
    }
    const parts = [
      customer.logradouro,
      customer.numero,
      customer.bairro,
      customer.cidade,
      customer.uf,
    ].filter(Boolean);
    const address = parts.join(', ');

    setForm((prev) => ({
      ...prev,
      customerId: customer.id,
      customerName: customer.nomeCompleto,
      customerDocument: customer.cpfCnpj ?? '',
      customerPhone: customer.telefone ?? '',
      customerAddress: address,
    }));
    setFormErrors((prev) => {
      const next = { ...prev };
      delete next.customerId;
      return next;
    });
  }, []);

  // ─── Handlers de Esquadrias ───────────────────────────────────────────────
  const handleOpenBuilder = () => {
    setEditingItem(null);
    setIsBuilderOpen(true);
  };

  const handleEditItem = (item: BudgetItem) => {
    setEditingItem(item);
    setIsBuilderOpen(true);
  };

  const handleDeleteItem = (tempId: string) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.tempId !== tempId),
    }));
  };

  const handleAddOrUpdateItem = (item: BudgetItem) => {
    setForm((prev) => {
      const existingIdx = prev.items.findIndex((i) => i.tempId === item.tempId);
      if (existingIdx >= 0) {
        const updated = [...prev.items];
        updated[existingIdx] = item;
        return { ...prev, items: updated };
      }
      return { ...prev, items: [...prev.items, item] };
    });
    setFormErrors((prev) => {
      const next = { ...prev };
      delete next.items;
      return next;
    });
  };

  // ─── Navegação e Bloqueio entre Etapas ─────────────────────────────────────
  const canAccessStep2 = Boolean(form.customerId);
  const canAccessStep3 = Boolean(form.customerId) && form.items.length > 0;

  const goToStep1 = () => {
    setCurrentStep(1);
  };

  const goToStep2 = () => {
    if (!form.customerId) {
      setFormErrors((prev) => ({ ...prev, customerId: 'Selecione um cliente para prosseguir.' }));
      toast.error('Selecione um cliente para prosseguir para a etapa de Esquadrias.');
      return;
    }
    setFormErrors((prev) => {
      const next = { ...prev };
      delete next.customerId;
      return next;
    });
    setCurrentStep(2);
  };

  const goToStep3 = () => {
    if (!form.customerId) {
      toast.error('Selecione um cliente para o orçamento.');
      setCurrentStep(1);
      return;
    }
    if (form.items.length === 0) {
      setFormErrors((prev) => ({ ...prev, items: 'Adicione ao menos uma esquadria ao orçamento.' }));
      toast.error('Adicione ao menos uma esquadria antes de prosseguir para a Finalização.');
      return;
    }
    setFormErrors((prev) => {
      const next = { ...prev };
      delete next.items;
      return next;
    });
    setCurrentStep(3);
  };

  const handleStepClick = (stepNum: WizardStep) => {
    if (stepNum === 1) {
      goToStep1();
    } else if (stepNum === 2) {
      goToStep2();
    } else if (stepNum === 3) {
      goToStep3();
    }
  };

  // ─── Validação Final ──────────────────────────────────────────────────────
  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!form.customerId) {
      errs.customerId = 'Selecione um cliente para o orçamento.';
    }
    if (form.items.length === 0) {
      errs.items = 'Adicione ao menos uma esquadria ao orçamento.';
    }
    if (form.discountPercent < 0 || form.discountPercent > 100) {
      errs.discountPercent = 'Desconto deve ser entre 0% e 100%.';
    }

    setFormErrors(errs);

    if (Object.keys(errs).length > 0) {
      const firstError = Object.values(errs)[0];
      toast.error(firstError);
      return false;
    }
    return true;
  };

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handleSave = () => {
    if (isPending) return;
    if (!validate()) return;

    const payload: CreateBudgetPayload = {
      customerId: form.customerId,
      discountPercent: form.discountPercent,
      notes: form.notes || undefined,
      commercialConditions: form.commercialConditions || undefined,
      items: form.items.map((item) => ({
        productId: item.productId,
        templateType: item.templateType,
        templateConfig: item.templateConfig,
        handleConfig: item.handleConfig,
        drillingConfig: item.drillingConfig,
        width: item.widthMm,
        height: item.heightMm,
        quantity: item.quantity,
        options: item.options.map((opt) => ({
          materialId: opt.materialId,
          quantity: opt.quantity,
        })),
        notes: item.notes,
      })),
    };

    createBudget(payload, {
      onSuccess: (data) => {
        navigate(`/orcamentos/${data.id}`);
      },
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-surface">
      {/* ─── Top Header ──────────────────────────────────────────────────── */}
      <header className="flex-none px-md lg:px-lg py-sm border-b border-outline-variant bg-surface z-10 flex items-center justify-between gap-sm">
        <div>
          <h2 className="font-headline text-headline-md font-bold text-on-surface">
            Novo Orçamento
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Wizard de criação e precificação de propostas comerciais.
          </p>
        </div>

        {/* Resumo rápido no header (desktop) */}
        {form.items.length > 0 && (
          <div className="hidden md:flex items-center gap-md text-sm bg-surface-container-low px-md py-xs rounded-md border border-outline-variant">
            <div className="text-center">
              <p className="text-[10px] uppercase font-label font-semibold text-on-surface-variant">Itens</p>
              <p className="font-data-mono font-bold text-on-surface">{form.items.length}</p>
            </div>
            <div className="h-6 w-px bg-outline-variant" />
            <div className="text-center">
              <p className="text-[10px] uppercase font-label font-semibold text-on-surface-variant">Total Estimado</p>
              <p className="font-data-mono font-bold text-primary">{formatBRL(total)}</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-sm shrink-0">
          <Button
            variant="outline"
            onClick={() => navigate('/orcamentos')}
          >
            Cancelar
          </Button>
          {currentStep === 3 && (
            <Button
              variant="primary"
              icon="save"
              onClick={handleSave}
              disabled={isPending || form.items.length === 0}
            >
              {isPending ? 'Salvando...' : 'Salvar e Gerar Proposta'}
            </Button>
          )}
        </div>
      </header>

      {/* ─── Stepper Visual ───────────────────────────────────────────────── */}
      <nav aria-label="Progresso do Orçamento" className="flex-none bg-surface-container-lowest border-b border-outline-variant px-md lg:px-lg py-sm">
        <div className="max-w-[1200px] mx-auto">
          <ol className="grid grid-cols-3 gap-xs sm:gap-md">
            {STEPS.map((step) => {
              const isCurrent = currentStep === step.number;
              const isCompleted = currentStep > step.number || (step.number === 1 && Boolean(form.customerId)) || (step.number === 2 && form.items.length > 0 && currentStep === 3);
              const isAccessible = step.number === 1 || (step.number === 2 && canAccessStep2) || (step.number === 3 && canAccessStep3);

              return (
                <li key={step.number} className="flex-1">
                  <button
                    type="button"
                    onClick={() => handleStepClick(step.number)}
                    disabled={!isAccessible}
                    className={`
                      w-full flex items-center gap-xs sm:gap-sm p-xs sm:p-sm rounded-lg border text-left transition-all
                      ${isCurrent
                        ? 'border-primary bg-primary/10 shadow-xs'
                        : isCompleted
                        ? 'border-outline-variant bg-surface-container-low hover:bg-surface-container'
                        : 'border-outline-variant/40 bg-surface-container-lowest opacity-60 cursor-not-allowed'
                      }
                    `}
                  >
                    <div
                      className={`
                        w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors
                        ${isCurrent
                          ? 'bg-primary text-on-primary shadow-xs'
                          : isCompleted
                          ? 'bg-primary-container text-on-primary-container'
                          : 'bg-surface-container text-on-surface-variant'
                        }
                      `}
                    >
                      {isCompleted && !isCurrent ? (
                        <span className="material-symbols-outlined text-[18px]">check</span>
                      ) : (
                        <span>{step.number}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 hidden sm:block">
                      <p className={`text-xs font-label font-semibold leading-tight truncate ${isCurrent ? 'text-primary font-bold' : 'text-on-surface'}`}>
                        {step.label}
                      </p>
                      <p className="text-[10px] text-on-surface-variant font-body truncate">
                        {step.description}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </nav>

      {/* ─── Main Content by Step ─────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto p-md lg:p-lg">
        <div className="max-w-[1200px] mx-auto flex flex-col gap-lg pb-xl">

          {/* ════════════════════════════════════════════════════════════════
              STEP 1: CLIENTE
             ════════════════════════════════════════════════════════════════ */}
          {currentStep === 1 && (
            <div className="flex flex-col gap-lg animate-in fade-in duration-200">
              <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md lg:p-lg shadow-sm">
                <div className="mb-md">
                  <h3 className="font-title-sm text-title-sm text-on-surface font-semibold flex items-center gap-xs">
                    <span className="material-symbols-outlined text-primary text-[20px]">person</span>
                    Etapa 1: Seleção do Cliente
                  </h3>
                  <p className="text-xs text-on-surface-variant font-body mt-xs">
                    Busque um cliente cadastrado ou cadastre rapidamente um novo cliente para a obra.
                  </p>
                </div>

                <CustomerSelector
                  selectedCustomer={
                    form.customerId
                      ? {
                          id: form.customerId,
                          name: form.customerName,
                          document: form.customerDocument,
                          phone: form.customerPhone,
                          address: form.customerAddress,
                        }
                      : null
                  }
                  onSelect={handleCustomerSelect}
                  error={formErrors.customerId}
                />
              </div>

              {/* Step 1 Navigation Footer */}
              <div className="flex items-center justify-between pt-md border-t border-outline-variant">
                <Button
                  variant="outline"
                  onClick={() => navigate('/orcamentos')}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  icon="arrow_forward"
                  onClick={goToStep2}
                  disabled={!form.customerId}
                >
                  Avançar para Esquadrias
                </Button>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              STEP 2: ESQUADRIAS
             ════════════════════════════════════════════════════════════════ */}
          {currentStep === 2 && (
            <div className="flex flex-col gap-lg animate-in fade-in duration-200">
              {/* Card Resumo do Cliente Selecionado */}
              <div className="bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm flex items-center justify-between gap-sm">
                <div className="flex items-center gap-sm min-w-0">
                  <span className="material-symbols-outlined text-primary text-[20px] shrink-0">check_circle</span>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-label font-bold text-on-surface-variant">Cliente Selecionado:</span>
                    <p className="text-xs font-label font-semibold text-on-surface truncate">
                      {form.customerName} {form.customerPhone ? `· ${form.customerPhone}` : ''} {form.customerAddress ? `· ${form.customerAddress}` : ''}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={goToStep1}
                  className="text-xs text-primary hover:underline font-label font-medium shrink-0"
                >
                  Alterar Cliente
                </button>
              </div>

              {/* Seção de Adicionar Esquadrias */}
              <div className="flex flex-col gap-md">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-title-sm text-title-sm text-on-surface font-semibold flex items-center gap-xs">
                      <span className="material-symbols-outlined text-primary text-[20px]">window</span>
                      Etapa 2: Esquadrias e Medidas
                    </h3>
                    <p className="text-xs text-on-surface-variant font-body mt-xs">
                      Configure as dimensões, sentidos de abertura, insumos e ferragens para cada item.
                    </p>
                    {formErrors.items && (
                      <p className="text-error text-xs mt-xs font-body font-semibold">{formErrors.items}</p>
                    )}
                  </div>
                  <Button
                    variant="primary"
                    icon="add"
                    onClick={handleOpenBuilder}
                    id="btn-add-window"
                  >
                    + Adicionar Esquadria
                  </Button>
                </div>

                {/* Tabela de Itens */}
                <BudgetItemsTable
                  items={form.items}
                  onEdit={handleEditItem}
                  onDelete={handleDeleteItem}
                />
              </div>

              {/* Step 2 Navigation Footer */}
              <div className="flex items-center justify-between pt-md border-t border-outline-variant">
                <Button
                  variant="outline"
                  icon="arrow_back"
                  onClick={goToStep1}
                >
                  Voltar para Cliente
                </Button>
                <Button
                  variant="primary"
                  icon="arrow_forward"
                  onClick={goToStep3}
                  disabled={form.items.length === 0}
                >
                  Avançar para Finalização ({form.items.length} {form.items.length === 1 ? 'item' : 'itens'})
                </Button>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              STEP 3: FINALIZAÇÃO
             ════════════════════════════════════════════════════════════════ */}
          {currentStep === 3 && (
            <div className="flex flex-col gap-lg animate-in fade-in duration-200">
              {/* Header do Step 3 */}
              <div>
                <h3 className="font-title-sm text-title-sm text-on-surface font-semibold flex items-center gap-xs">
                  <span className="material-symbols-outlined text-primary text-[20px]">receipt_long</span>
                  Etapa 3: Revisão e Condições Comerciais
                </h3>
                <p className="text-xs text-on-surface-variant font-body mt-xs">
                  Revise os itens configurados, aplique desconto e informe as condições comerciais da proposta.
                </p>
              </div>

              {/* Tabela de Itens para Revisão */}
              <BudgetItemsTable
                items={form.items}
                onEdit={handleEditItem}
                onDelete={handleDeleteItem}
              />

              {/* Resumo Financeiro, Desconto e Observações */}
              <BudgetFinancialSummary
                items={form.items}
                discountPercent={form.discountPercent}
                onDiscountChange={(val) => setForm((p) => ({ ...p, discountPercent: val }))}
                notes={form.notes}
                onNotesChange={(val) => setForm((p) => ({ ...p, notes: val }))}
                commercialConditions={form.commercialConditions}
                onCommercialConditionsChange={(val) => setForm((p) => ({ ...p, commercialConditions: val }))}
                errors={{ discountPercent: formErrors.discountPercent }}
              />

              {/* Step 3 Navigation Footer */}
              <div className="flex items-center justify-between pt-md border-t border-outline-variant">
                <Button
                  variant="outline"
                  icon="arrow_back"
                  onClick={goToStep2}
                >
                  Voltar para Esquadrias
                </Button>
                <Button
                  variant="success"
                  icon="send"
                  onClick={handleSave}
                  disabled={isPending || form.items.length === 0}
                >
                  {isPending ? 'Salvando...' : 'Salvar e Gerar Proposta'}
                </Button>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ─── WindowBuilderModal (React Portal) ──────────────────────────── */}
      <WindowBuilderModal
        isOpen={isBuilderOpen}
        onClose={() => {
          setIsBuilderOpen(false);
          setEditingItem(null);
        }}
        onAddItem={handleAddOrUpdateItem}
        editingItem={editingItem}
      />
    </div>
  );
};
