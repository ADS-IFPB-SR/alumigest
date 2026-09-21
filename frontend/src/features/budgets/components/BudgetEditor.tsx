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
import { BudgetMaterialsSummary } from './BudgetMaterialsSummary';
import { WindowBuilderModal } from './builder/WindowBuilderModal';
import { Button } from '../../../components/ui/Button';
import { ProductPickerModal } from './builder/ProductPickerModal';
import { budgetFormSchema } from '../schemas/budgetSchema';
import toast from 'react-hot-toast';

// ─── Estado inicial ────────────────────────────────────────────────────────
const createInitialFormState = (): BudgetFormState => {
  const defaultValid = new Date();
  defaultValid.setDate(defaultValid.getDate() + 15);
  return {
    customerId: '',
    customerName: '',
    customerDocument: '',
    customerPhone: '',
    customerAddress: '',
    items: [],
    laborCost: 0,
    discountPercent: 0,
    discountType: 'PERCENTUAL',
    discountInput: 0,
    paymentCondition: '',
    notes: '',
    commercialConditions: '',
    validUntil: defaultValid.toISOString().split('T')[0],
  };
};

// ─── Componente ─────────────────────────────────────────────────────────────
export const BudgetEditor: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const { data: existingBudget, isLoading: isLoadingBudget } = useBudget(id);
  const [form, setForm] = useState<BudgetFormState>(createInitialFormState);
  
  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
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
        widthMm: Number(item.widthMm ?? item.width ?? 0),
        heightMm: Number(item.heightMm ?? item.height ?? 0),
        width: Number(item.width ?? item.widthMm ?? 0),
        height: Number(item.height ?? item.heightMm ?? 0),
        quantity: Number(item.quantity ?? 1),
        laborCost: Number(item.laborCost ?? 0),
        options: item.options ?? [],
        subtotal: Number(item.subtotal ?? 0),
        notes: item.notes,
      }));

      const loadedLaborCost = (existingBudget.items ?? []).reduce((sum, item) => sum + Number(item.laborCost || 0), 0);
      const existingDiscountType = (existingBudget as any).discountType ?? 'PERCENTUAL';
      const existingDiscountInput = (existingBudget as any).discountInput ?? existingBudget.discountPercent ?? 0;
      const existingDiscountPercent = existingBudget.discountPercent ?? (existingDiscountType === 'PERCENTUAL' ? existingDiscountInput : 0);

      setForm({
        customerId: existingBudget.customer?.id ?? (existingBudget as any).clientId ?? existingBudget.customerId ?? '',
        customerName: existingBudget.customer?.name ?? (existingBudget as any).clientName ?? existingBudget.customerName ?? '',
        customerDocument: existingBudget.customer?.document ?? '',
        customerPhone: existingBudget.customer?.phone ?? '',
        customerAddress: existingBudget.customer?.address ?? '',
        items: loadedItems,
        laborCost: Number(loadedLaborCost),
        discountPercent: Number(existingDiscountPercent),
        discountType: existingDiscountType,
        discountInput: Number(existingDiscountInput),
        paymentCondition: (existingBudget as any).paymentCondition || '',
        notes: existingBudget.notes ?? '',
        commercialConditions: existingBudget.commercialConditions ?? '',
        validUntil: existingBudget.validUntil ? existingBudget.validUntil.split('T')[0] : '',
      });
    }
  }, [existingBudget, isEditing]);

  // ─── Cálculos financeiros — derivados do estado, sem fonte alternativa ──
  const itemsSubtotal = useMemo(
    () => form.items.reduce((acc: number, item: BudgetItem) => acc + Number(item.subtotal || 0), 0),
    [form.items],
  );
  
  const subtotal = useMemo(
    () => itemsSubtotal + Number(form.laborCost || 0),
    [itemsSubtotal, form.laborCost],
  );
  
  const discountValue = useMemo(() => {
    const isPercent = form.discountType === 'PERCENTUAL' || (form.discountType as string) === 'PERCENTAGE';
    if (isPercent) {
      return subtotal > 0 ? (subtotal * Number(form.discountInput || 0)) / 100 : 0;
    }
    return Number(form.discountInput || 0);
  }, [subtotal, form.discountType, form.discountInput]);

  const isDiscountExceeding = discountValue > subtotal;
  const total = Math.max(0, subtotal - discountValue);

  // ─── Controle de habilitação do submit ────────────────────────────────────
  const canSave =
    Boolean(form.customerId) &&
    form.items.length > 0 &&
    Number(form.discountInput) >= 0 &&
    !isDiscountExceeding && 
    !isPending;

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
    const addressParts = [
      customer.logradouro,
      customer.numero,
      customer.bairro,
      customer.cidade,
      customer.uf,
    ].filter(Boolean);

    setForm((prev) => ({
      ...prev,
      customerId: customer.id,
      customerName: customer.nomeCompleto,
      customerDocument: customer.cpfCnpj ?? '',
      customerPhone: customer.telefone ?? '',
      customerAddress: addressParts.join(', '),
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
    setSelectedProductId(null);
    setIsProductPickerOpen(true);
  };

  const handleEditItem = (item: BudgetItem) => {
    setEditingItem(item);
    setIsBuilderOpen(true);
  };

  const handleDuplicateItem = (item: BudgetItem) => {
    const duplicatedItem: BudgetItem = {
      ...item,
      tempId: `item-dup-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`,
      productName: `${item.productName} (Cópia)`,
      options: item.options.map((opt) => ({ ...opt })),
    };
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, duplicatedItem],
    }));
    toast.success(`Esquadria "${item.productName}" duplicada com sucesso!`);
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

  // ─── Validação — chamada sempre antes do submit ───────────────────────────
  const validate = (): boolean => {
    const parsed = budgetFormSchema.safeParse(form);
    
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      let firstErrorMsg = '';

      parsed.error.issues.forEach((err) => {
        const path = err.path[0] as string;
        if (!errs[path]) {
          errs[path] = err.message;
          if (!firstErrorMsg) firstErrorMsg = err.message;
        }
      });
      
      setFormErrors(errs);
      toast.error(firstErrorMsg);
      return false;
    }
    
    setFormErrors({});
    return true;
  };

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handleSave = () => {
    if (isPending) return;
    if (!validate()) return;

    const laborPerItem = form.items.length > 0 && Number(form.laborCost) > 0 ? Number(form.laborCost) / form.items.length : 0;
    const isPercent = form.discountType === 'PERCENTUAL' || (form.discountType as string) === 'PERCENTAGE';
    let effectiveDiscountPercent = Number(form.discountInput);
    if (!isPercent) {
      effectiveDiscountPercent = subtotal > 0 ? (Number(form.discountInput) / subtotal) * 100 : 0;
    }

    const payload: CreateBudgetPayload = {
      customerId: form.customerId,
      discountPercent: effectiveDiscountPercent,
      discountType: form.discountType,
      discountInput: Number(form.discountInput),
      paymentCondition: form.paymentCondition || undefined,
      notes: form.notes || undefined,
      commercialConditions: form.commercialConditions || undefined,
      validUntil: form.validUntil || undefined,
      items: form.items.map((item: BudgetItem) => ({
        productId: item.productId,
        templateType: item.templateType,
        templateConfig: typeof item.templateConfig === 'string' 
          ? JSON.parse(item.templateConfig || '{}') 
          : item.templateConfig,
        handleConfig: typeof item.handleConfig === 'string' 
          ? JSON.parse(item.handleConfig || '{}') 
          : item.handleConfig,
        drillingConfig: typeof item.drillingConfig === 'string' 
          ? JSON.parse(item.drillingConfig || '{}') 
          : item.drillingConfig ?? item.drillingConfig,
        width: Number(item.widthMm ?? (item as any).larguraMm ?? item.width ?? 0),
        height: Number(item.heightMm ?? (item as any).alturaMm ?? item.height ?? 0),
        quantity: Number(item.quantity ?? 1),
        laborCost: Number(laborPerItem),
        options: item.options.map((opt) => ({
          materialId: opt.materialId,
          quantity: Number(opt.quantity ?? 0),
          categoryType: opt.categoryType,
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

          {/* 1. CLIENTE */}
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
                      id:     form.customerId,
                      name:    form.customerName,
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

          {/* 2. ESQUADRIAS */}
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
                >
                  Adicionar Esquadria
                </Button>
              </div>
            </div>

            {!form.customerId && (
              <p className="text-xs text-on-surface-variant font-body mb-sm sm:hidden">
                Selecione um cliente para adicionar esquadrias.
              </p>
            )}

            {formErrors.items && (
              <p
                className="text-error text-xs mb-sm font-body font-semibold flex items-center gap-xs"
                role="alert"
              >
                <span className="material-symbols-outlined text-[14px]">error</span>
                {formErrors.items}
              </p>
            )}

            {form.items.length > 0 ? (
              <div className="flex flex-col gap-md">
                <BudgetItemsTable
                  items={form.items}
                  onEdit={handleEditItem}
                  onDuplicate={handleDuplicateItem}
                  onDelete={handleDeleteItem}
                />
                <BudgetMaterialsSummary items={form.items} />
              </div>
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

          {/* 3. CONDIÇÕES COMERCIAIS + RESUMO FINANCEIRO */}
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
              <BudgetCommercialConditions
                laborCost={form.laborCost}
                onLaborCostChange={(val) => setForm((p) => ({ ...p, laborCost: Number(val) }))}
                discountType={form.discountType}
                onDiscountTypeChange={(val) => setForm((p) => ({ ...p, discountType: val }))}
                discountInput={form.discountInput}
                discountPercent={form.discountPercent}
                onDiscountChange={(val) =>
                  setForm((p) => {
                    const isPercent = p.discountType === 'PERCENTUAL' || (p.discountType as string) === 'PERCENTAGE';
                    return {
                      ...p,
                      discountInput: Number(val),
                      discountPercent: isPercent ? Number(val) : p.discountPercent,
                    };
                  })
                }
                paymentCondition={form.paymentCondition}
                onPaymentConditionChange={(val) => setForm((p) => ({ ...p, paymentCondition: val }))}
                notes={form.notes}
                onNotesChange={(val) => setForm((p) => ({ ...p, notes: val }))}
                commercialConditions={form.commercialConditions}
                onCommercialConditionsChange={(val) =>
                  setForm((p) => ({ ...p, commercialConditions: val }))
                }
                validUntil={form.validUntil}
                onValidUntilChange={(val) =>
                  setForm((p) => ({ ...p, validUntil: val }))
                }
                subtotal={subtotal}
                errors={{ discount: formErrors.discount, validUntil: formErrors.validUntil }}
              />

              <div className="lg:sticky lg:top-4 lg:self-start">
                <BudgetFinancialSummary
                  itemCount={form.items.length}
                  itemsSubtotal={itemsSubtotal}
                  laborCost={form.laborCost}
                  subtotal={subtotal}
                  discountPercent={form.discountPercent}
                  discountType={form.discountType}
                  discountInput={form.discountInput}
                  discountValue={discountValue}
                  total={total}
                  paymentCondition={form.paymentCondition || undefined}
                  commercialConditions={form.commercialConditions}
                  onSave={handleSave}
                  isSaving={isPending}
                  canSave={canSave}
                />
              </div>
            </div>
          </section>

        </div>
      </main>

      <ProductPickerModal
        isOpen={isProductPickerOpen}
        onClose={() => setIsProductPickerOpen(false)}
        onSelectProduct={(productId) => {
          setSelectedProductId(productId);
          setIsProductPickerOpen(false);
          setIsBuilderOpen(true);
        }}
      />

      <WindowBuilderModal
        isOpen={isBuilderOpen}
        selectedProductId={selectedProductId}
        onClose={() => {
          setIsBuilderOpen(false);
          setEditingItem(null);
          setSelectedProductId(null);
        }}
        onAddItem={handleAddOrUpdateItem}
        editingItem={editingItem}
      />
    </div>
  );
};