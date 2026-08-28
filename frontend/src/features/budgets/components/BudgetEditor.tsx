import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type {
  BudgetFormState,
  BudgetItem,
  Customer,
  CreateBudgetPayload,
} from '../types';
import { useCreateBudget, useUpdateBudget, useBudget } from '../hooks/useBudgets';
import { CustomerSelector } from './CustomerSelector';
import { BudgetItemsTable } from './BudgetItemsTable';
import { BudgetCommercialConditions } from './BudgetCommercialConditions';
import { BudgetFinancialSummary } from './BudgetFinancialSummary';
import { WindowBuilderModal } from './builder/WindowBuilderModal';
import { Button } from '../../../components/ui/Button';
import toast from 'react-hot-toast';

// ─── Estado inicial ────────────────────────────────────────────────────────
const createInitialFormState = (): BudgetFormState => ({
  customerId:           '',
  customerName:         '',
  customerDocument:     '',
  customerPhone:        '',
  customerAddress:      '',
  items:                [],
  discountPercent:      0,
  notes:                '',
  commercialConditions: '',
});

// ─── Componente ─────────────────────────────────────────────────────────────
/**
 * Editor de orçamento em tela única (suporta criação e edição).
 *
 * Todas as seções são exibidas simultaneamente:
 *   1. Cliente
 *   2. Esquadrias
 *   3. Condições Comerciais + Resumo Financeiro (grid 2 colunas no desktop)
 */
export const BudgetEditor: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const { data: existingBudget, isLoading: isLoadingBudget } = useBudget(id);
  const [form, setForm] = useState<BudgetFormState>(createInitialFormState);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { mutate: createBudget, isPending: isCreating } = useCreateBudget();
  const { mutate: updateBudget, isPending: isUpdating } = useUpdateBudget();
  const isPending = isCreating || isUpdating;

  // ─── Preencher formulário ao carregar orçamento existente para edição ─────
  useEffect(() => {
    if (existingBudget && isEditing) {
      const loadedItems: BudgetItem[] = (existingBudget.items ?? []).map((item, idx) => ({
        tempId: item.id || `item-loaded-${idx}`,
        productId: item.productId,
        productName: item.productName,
        templateType: item.templateType,
        templateConfig: item.templateConfig,
        handleConfig: item.handleConfig,
        drillingConfig: item.drillingConfig,
        widthMm: item.width,
        heightMm: item.height,
        quantity: item.quantity,
        laborCost: item.laborCost,
        options: item.options ?? [],
        subtotal: item.subtotal,
        notes: item.notes,
      }));

      setForm({
        customerId: existingBudget.customer.id,
        customerName: existingBudget.customer.name,
        customerDocument: '',
        customerPhone: existingBudget.customer.phone ?? '',
        customerAddress: '',
        items: loadedItems,
        discountPercent: existingBudget.discountPercent,
        notes: existingBudget.notes ?? '',
        commercialConditions: existingBudget.commercialConditions ?? '',
      });
    }
  }, [existingBudget, isEditing]);

  // ─── Cálculos financeiros — derivados do estado, sem fonte alternativa ──
  const subtotal = useMemo(
    () => form.items.reduce((acc, item) => acc + item.subtotal, 0),
    [form.items],
  );
  const discountValue = useMemo(
    () => (subtotal * form.discountPercent) / 100,
    [subtotal, form.discountPercent],
  );
  const total = subtotal - discountValue;

  // ─── Controle de habilitação do submit ────────────────────────────────────
  const canSave =
    Boolean(form.customerId) &&
    form.items.length > 0 &&
    form.discountPercent >= 0 &&
    form.discountPercent <= 100 &&
    !isPending;

  // ─── Handlers de Cliente ──────────────────────────────────────────────────
  const handleCustomerSelect = useCallback((customer: Customer) => {
    if (!customer.id) {
      // Troca/remoção de cliente: itens são preservados
      setForm((prev) => ({
        ...prev,
        customerId:       '',
        customerName:     '',
        customerDocument: '',
        customerPhone:    '',
        customerAddress:  '',
      }));
      return;
    }
    const addressParts = [
      customer.logradouro,
      customer.numero,
      customer.bairro,
      customer.cidade,
      customer.uf,
    ].filter(Boolean);

    setForm((prev) => ({
      ...prev,
      customerId:       customer.id,
      customerName:     customer.nomeCompleto,
      customerDocument: customer.cpfCnpj   ?? '',
      customerPhone:    customer.telefone   ?? '',
      customerAddress:  addressParts.join(', '),
    }));
    setFormErrors((prev) => {
      const next = { ...prev };
      delete next.customerId;
      return next;
    });
  }, []);

  // ─── Handlers de Esquadrias ───────────────────────────────────────────────
  const handleOpenBuilder = () => {
    if (!form.customerId) {
      toast.error('Selecione um cliente antes de adicionar uma esquadria.');
      return;
    }
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
        const updated       = [...prev.items];
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

  // ─── Validação — chamada sempre antes do submit ───────────────────────────
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
      toast.error(Object.values(errs)[0]);
      return false;
    }
    return true;
  };

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handleSave = () => {
    if (isPending) return;
    if (!validate()) return;

    const payload: CreateBudgetPayload = {
      customerId:           form.customerId,
      discountPercent:      form.discountPercent,
      notes:                form.notes               || undefined,
      commercialConditions: form.commercialConditions || undefined,
      items: form.items.map((item) => ({
        productId:      item.productId,
        templateType:   item.templateType,
        templateConfig: item.templateConfig,
        handleConfig:   item.handleConfig,
        drillingConfig: item.drillingConfig,
        width:          item.widthMm,
        height:         item.heightMm,
        quantity:       item.quantity,
        options: item.options.map((opt) => ({
          materialId: opt.materialId,
          quantity:   opt.quantity,
        })),
        notes: item.notes,
      })),
    };

    if (isEditing && id) {
      updateBudget(
        { id, data: payload },
        {
          onSuccess: (data) => {
            navigate(`/orcamentos/${data.id}`);
          },
        },
      );
    } else {
      createBudget(payload, {
        onSuccess: (data) => {
          navigate(`/orcamentos/${data.id}`, {
            state: { justCreated: true },
          });
        },
      });
    }
  };

  if (isEditing && isLoadingBudget) {
    return (
      <div className="flex-1 flex items-center justify-center py-xl gap-sm text-secondary">
        <span className="material-symbols-outlined animate-spin text-[24px]">progress_activity</span>
        <span className="font-body-sm">Carregando dados do orçamento...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-surface">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="flex-none px-md lg:px-lg py-sm border-b border-outline-variant bg-surface z-10 flex items-center justify-between gap-sm flex-wrap">
        <div>
          <h1 className="font-headline text-headline-md font-bold text-on-surface leading-tight">
            {isEditing ? `Editar Orçamento ${existingBudget?.code ?? ''}` : 'Novo Orçamento'}
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-[2px]">
            {isEditing
              ? 'Atualize os dados do cliente, esquadrias e valores da proposta.'
              : 'Selecione o cliente, configure as esquadrias e revise os valores antes de gerar a proposta.'}
          </p>
        </div>

        {/* Contador de esquadrias */}
        {form.items.length > 0 && (
          <div className="hidden md:flex items-center gap-xs text-sm bg-surface-container-low px-sm py-xs rounded-md border border-outline-variant">
            <span className="material-symbols-outlined text-[16px] text-secondary">window</span>
            <span className="font-data-mono font-semibold text-on-surface">{form.items.length}</span>
            <span className="text-on-surface-variant text-xs">
              esquadria{form.items.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        <Button
          variant="outline"
          onClick={() => (isEditing && id ? navigate(`/orcamentos/${id}`) : navigate('/orcamentos'))}
        >
          Cancelar
        </Button>
      </header>

      {/* ── Main ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto p-md lg:p-lg">
        <div className="max-w-[1200px] mx-auto flex flex-col gap-lg pb-xl">

          {/* ════════════════════════════════════════════════════════════════
              1. CLIENTE
             ════════════════════════════════════════════════════════════════ */}
          <section aria-labelledby="heading-cliente">
            <div className="flex items-center gap-xs mb-sm">
              <span className="material-symbols-outlined text-primary text-[20px]">person</span>
              <h2
                id="heading-cliente"
                className="font-title-sm text-title-sm text-on-surface font-semibold"
              >
                Cliente
              </h2>
            </div>

            <CustomerSelector
              selectedCustomer={
                form.customerId
                  ? {
                      id:       form.customerId,
                      name:     form.customerName,
                      document: form.customerDocument,
                      phone:    form.customerPhone,
                      address:  form.customerAddress,
                    }
                  : null
              }
              onSelect={handleCustomerSelect}
              error={formErrors.customerId}
            />
          </section>

          {/* ════════════════════════════════════════════════════════════════
              2. ESQUADRIAS
             ════════════════════════════════════════════════════════════════ */}
          <section aria-labelledby="heading-esquadrias">
            <div className="flex items-center justify-between gap-sm mb-sm flex-wrap">
              <div className="flex items-center gap-xs">
                <span className="material-symbols-outlined text-primary text-[20px]">window</span>
                <h2
                  id="heading-esquadrias"
                  className="font-title-sm text-title-sm text-on-surface font-semibold"
                >
                  Esquadrias
                  {form.items.length > 0 && (
                    <span className="ml-sm text-sm font-data-mono font-normal text-on-surface-variant">
                      ({form.items.length})
                    </span>
                  )}
                </h2>
              </div>

              <div className="flex items-center gap-sm">
                {!form.customerId && (
                  <p className="text-xs text-on-surface-variant font-body hidden sm:block">
                    Selecione um cliente para adicionar esquadrias.
                  </p>
                )}
                <Button
                  variant="primary"
                  icon="add"
                  onClick={handleOpenBuilder}
                  disabled={!form.customerId}
                  id="btn-add-window"
                  title={
                    !form.customerId
                      ? 'Selecione um cliente para adicionar esquadrias'
                      : undefined
                  }
                >
                  Adicionar Esquadria
                </Button>
              </div>
            </div>

            {/* Mensagem contextual mobile */}
            {!form.customerId && (
              <p className="text-xs text-on-surface-variant font-body mb-sm sm:hidden">
                Selecione um cliente para adicionar esquadrias.
              </p>
            )}

            {/* Erro de validação */}
            {formErrors.items && (
              <p
                className="text-error text-xs mb-sm font-body font-semibold flex items-center gap-xs"
                role="alert"
              >
                <span className="material-symbols-outlined text-[14px]">error</span>
                {formErrors.items}
              </p>
            )}

            {/* Lista de itens ou empty state */}
            {form.items.length > 0 ? (
              <BudgetItemsTable
                items={form.items}
                onEdit={handleEditItem}
                onDelete={handleDeleteItem}
              />
            ) : (
              <div className="bg-surface-container-lowest border border-outline-variant border-dashed rounded-lg p-xl text-center flex flex-col items-center gap-sm">
                <span className="material-symbols-outlined text-on-surface-variant text-[40px]">
                  window
                </span>
                <p className="text-on-surface font-label font-semibold">
                  Nenhuma esquadria adicionada
                </p>
                <p className="text-sm text-on-surface-variant font-body max-w-xs">
                  {form.customerId
                    ? 'Clique em "Adicionar Esquadria" para configurar a primeira esquadria do orçamento.'
                    : 'Selecione um cliente e clique em "Adicionar Esquadria" para começar.'}
                </p>
                {form.customerId && (
                  <Button
                    variant="outline"
                    icon="add"
                    onClick={handleOpenBuilder}
                    className="mt-xs"
                  >
                    Adicionar Esquadria
                  </Button>
                )}
              </div>
            )}
          </section>

          {/* ════════════════════════════════════════════════════════════════
              3. CONDIÇÕES COMERCIAIS + RESUMO FINANCEIRO
             ════════════════════════════════════════════════════════════════ */}
          <section aria-labelledby="heading-finalização">
            <div className="flex items-center gap-xs mb-sm">
              <span className="material-symbols-outlined text-primary text-[20px]">receipt_long</span>
              <h2
                id="heading-finalização"
                className="font-title-sm text-title-sm text-on-surface font-semibold"
              >
                Condições e Resumo
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-lg items-start">

              {/* Coluna esquerda: campos editáveis */}
              <BudgetCommercialConditions
                discountPercent={form.discountPercent}
                onDiscountChange={(val) =>
                  setForm((p) => ({ ...p, discountPercent: val }))
                }
                notes={form.notes}
                onNotesChange={(val) => setForm((p) => ({ ...p, notes: val }))}
                commercialConditions={form.commercialConditions}
                onCommercialConditionsChange={(val) =>
                  setForm((p) => ({ ...p, commercialConditions: val }))
                }
                subtotal={subtotal}
                errors={{ discountPercent: formErrors.discountPercent }}
              />

              {/* Coluna direita: valores derivados + salvar (sticky) */}
              <div className="lg:sticky lg:top-4 lg:self-start">
                <BudgetFinancialSummary
                  itemCount={form.items.length}
                  subtotal={subtotal}
                  discountPercent={form.discountPercent}
                  discountValue={discountValue}
                  total={total}
                  onSave={handleSave}
                  isSaving={isPending}
                  canSave={canSave}
                />
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* ── WindowBuilderModal ──────────────────────────────────────────────── */}
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
