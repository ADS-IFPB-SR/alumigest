import { useState, useId } from 'react';
import { User, X, FileText, Printer, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCustomers } from '@/features/customers/hooks/useCustomers';
import {
  PartSaleMaterialForm,
  PartSaleItemTable,
  PartSaleSummaryCard,
  useCreatePartSale,
  type PartSaleItemDraft,
  type PartSaleStatus,
  type CreatePartSaleRequest,
  type CreatePartSaleItemRequest,
} from '@/features/part-sales';

export function PartSalePage() {
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [discount, setDiscount] = useState<number>(0);
  const [items, setItems] = useState<PartSaleItemDraft[]>([]);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [isLabelModalOpen, setIsLabelModalOpen] = useState<boolean>(false);
  const [lastCreatedCode, setLastCreatedCode] = useState<string | null>(null);

  const clientIdSelectId = useId();
  const notesTextareaId = useId();

  const { data: customerPage } = useCustomers({ ativo: true, size: 100 });
  const customers = customerPage?.content || [];
  const selectedCustomer = customers.find((c) => c.id === selectedClientId);

  const createPartSale = useCreatePartSale();

  const handleAddItem = (item: PartSaleItemDraft) => {
    setItems((prev) => [...prev, item]);
    toast.success(`${item.description} adicionado ÃƒÂ  venda!`);
  };

  const handleRemoveItem = (tempId: string) => {
    setItems((prev) => prev.filter((item) => item.tempId !== tempId));
  };

  const buildCreateRequest = (status: PartSaleStatus): CreatePartSaleRequest => {
    const targetClientId = selectedClientId || (customers.length > 0 ? customers[0].id : crypto.randomUUID());
    const formattedItems: CreatePartSaleItemRequest[] = items.map((it) => ({
      materialType: it.materialType,
      referenceId: it.referenceId,
      quantity: it.quantity,
      widthMm: it.widthMm,
      heightMm: it.heightMm,
      unitPrice: it.unitPrice,
    }));

    return {
      clientId: targetClientId,
      status,
      discountAmount: discount,
      items: formattedItems,
    };
  };

  const handleSaveSale = async (status: PartSaleStatus) => {
    if (items.length === 0) {
      toast.error('Adicione pelo menos um item ÃƒÂ  venda antes de salvar.');
      return;
    }

    try {
      const request = buildCreateRequest(status);
      const result = await createPartSale.mutateAsync(request);
      setLastCreatedCode(result.code);

      // Limpar formulÃƒÂ¡rio apÃƒÂ³s sucesso
      setItems([]);
      setDiscount(0);
      setNotes('');
      setSelectedClientId('');
    } catch {
      // Erro jÃƒÂ¡ tratado no hook useCreatePartSale via toast
    }
  };

  const handleExportPdf = () => {
    if (items.length === 0) {
      toast.error('Adicione itens ÃƒÂ  venda para visualizar o documento PDF');
      return;
    }
    setIsPdfModalOpen(true);
  };

  const handlePrintLabels = () => {
    if (items.length === 0) {
      toast.error('Adicione itens ÃƒÂ  venda para emitir etiquetas');
      return;
    }
    setIsLabelModalOpen(true);
  };

  const subtotal = items.reduce((acc, item) => acc + item.totalPrice, 0);
  const totalAmount = Math.max(0, subtotal - discount);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="flex-1 flex flex-col p-6 max-w-7xl w-full mx-auto space-y-6">
      {/* Banner de sucesso quando emitido recentemente */}
      {lastCreatedCode && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>
              Venda Avulsa <strong className="font-mono">{lastCreatedCode}</strong> gravada com sucesso no sistema!
            </span>
          </div>
          <button
            type="button"
            onClick={() => setLastCreatedCode(null)}
            className="text-emerald-600 hover:text-emerald-900 font-bold"
          >
            &times;
          </button>
        </div>
      )}

      {/* CARD CONTAINER PRINCIPAL (ESTILO DO PROTÃƒâ€œTIPO) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        {/* CabeÃƒÂ§alho da PÃƒÂ¡gina */}
        <div className="border-b border-slate-100 pb-5">
          <h2 className="text-xl font-bold text-slate-900">Venda Avulsa</h2>
          <p className="text-xs text-slate-500 mt-1">
            LanÃƒÂ§amento rÃƒÂ¡pido de itens, cÃƒÂ¡lculo automÃƒÂ¡tico de medidas e emissÃƒÂ£o imediata.
          </p>
        </div>

        {/* IdentificaÃƒÂ§ÃƒÂ£o do Cliente & ObservaÃƒÂ§ÃƒÂµes */}
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div>
            <label htmlFor={clientIdSelectId} className="block text-xs font-semibold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-500" /> Cliente / BalcÃƒÂ£o
            </label>
            <select
              id={clientIdSelectId}
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-900 focus:border-navy-900 outline-none font-medium text-slate-800"
            >
              <option value="">-- Venda de BalcÃƒÂ£o (NÃƒÂ£o Identificado) --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nomeCompleto} {c.documento ? `(${c.documento})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor={notesTextareaId} className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              ObservaÃƒÂ§ÃƒÂµes / InstruÃƒÂ§ÃƒÂµes da Venda
            </label>
            <input
              type="text"
              id={notesTextareaId}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Entrega no balcÃƒÂ£o da expediÃƒÂ§ÃƒÂ£o / Pagamento ÃƒÂ  vista"
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-900 focus:border-navy-900 outline-none text-slate-800"
            />
          </div>
        </div>

        {/* GRID PRINCIPAL: 8 COLS ESQUERDA + 4 COLS DIREITA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ESQUERDA: FORMULÃƒÂRIO DE INSERÃƒâ€¡ÃƒÆ’O & LISTA DE ITENS */}
          <div className="lg:col-span-8 space-y-6">
            <PartSaleMaterialForm onAddItem={handleAddItem} />
            <PartSaleItemTable items={items} onRemoveItem={handleRemoveItem} />
          </div>

          {/* DIREITA: CARD LATERAL DE RESUMO E AÃƒâ€¡Ãƒâ€¢ES */}
          <div className="lg:col-span-4">
            <PartSaleSummaryCard
              items={items}
              discount={discount}
              onDiscountChange={setDiscount}
              onApproveSale={() => handleSaveSale('APPROVED')}
              onSaveDraft={() => handleSaveSale('DRAFT')}
              onExportPdf={handleExportPdf}
              onPrintLabels={handlePrintLabels}
              isSaving={createPartSale.isPending}
            />
          </div>
        </div>
      </div>

      {/* MODAL DE PRÃƒâ€°-VISUALIZAÃƒâ€¡ÃƒÆ’O / EXPORTAÃƒâ€¡ÃƒÆ’O PDF */}
      {isPdfModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-red-600" /> VisualizaÃƒÂ§ÃƒÂ£o para ExportaÃƒÂ§ÃƒÂ£o / PDF
              </h3>
              <button
                type="button"
                onClick={() => setIsPdfModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div id="pdfContent" className="p-8 overflow-y-auto flex-1 bg-white space-y-6 text-xs">
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <h1 className="text-lg font-bold text-slate-900">AlumiGest ERP</h1>
                  <p className="text-slate-500 text-[11px]">GestÃƒÂ£o de Vidros e AlumÃƒÂ­nio</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold font-mono px-2.5 py-1 bg-slate-100 border border-slate-300 rounded">
                    VENDA AVULSA
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">Data: {new Date().toLocaleDateString('pt-BR')}</p>
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-bold uppercase text-[10px]">Cliente:</span>
                <p className="text-sm font-bold text-slate-800">
                  {selectedCustomer ? selectedCustomer.nomeCompleto : 'Cliente BalcÃƒÂ£o (NÃƒÂ£o Identificado)'}
                </p>
                {selectedCustomer?.documento && (
                  <p className="text-slate-500 text-[11px]">CPF/CNPJ: {selectedCustomer.documento}</p>
                )}
                {notes && <p className="text-slate-600 text-[11px] mt-1 italic">Obs: {notes}</p>}
              </div>

              <table className="w-full text-left border border-slate-200 rounded">
                <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-2">Item</th>
                    <th className="p-2">Tipo</th>
                    <th className="p-2 text-center">Qtd</th>
                    <th className="p-2 text-right">UnitÃƒÂ¡rio</th>
                    <th className="p-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {items.map((it) => (
                    <tr key={it.tempId}>
                      <td className="p-2 font-sans font-medium text-slate-800">{it.description}</td>
                      <td className="p-2 font-sans text-slate-600 text-[11px]">{it.materialType}</td>
                      <td className="p-2 text-center">{it.quantity}</td>
                      <td className="p-2 text-right">{formatCurrency(it.unitPrice)}</td>
                      <td className="p-2 text-right font-bold">{formatCurrency(it.totalPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end">
                <div className="w-64 space-y-1.5 border-t border-slate-200 pt-3">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-mono">{formatCurrency(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Desconto:</span>
                      <span className="font-mono text-red-600">- {formatCurrency(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-900 font-bold text-sm border-t border-slate-300 pt-1">
                    <span>Total:</span>
                    <span className="font-mono text-navy-900">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsPdfModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 text-xs font-bold text-white bg-navy-900 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Imprimir Documento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE ETIQUETAS TÃƒâ€°RMICAS */}
      {isLabelModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Printer className="w-4 h-4 text-amber-500" /> Etiquetas TÃƒÂ©rmicas de ExpediÃƒÂ§ÃƒÂ£o
              </h3>
              <button
                type="button"
                onClick={() => setIsLabelModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              {items.length} tipo(s) de material(is) pronto(s) para emissÃƒÂ£o em impressora tÃƒÂ©rmica (formato 100x52mm).
            </p>

            <div className="max-h-60 overflow-y-auto space-y-2 border border-slate-200 rounded-lg p-3 bg-slate-50 text-xs">
              {items.map((it) => (
                <div key={it.tempId} className="bg-white border border-slate-200 p-2.5 rounded shadow-xs flex justify-between items-center">
                  <div>
                    <strong className="text-slate-800 font-bold block">{it.description}</strong>
                    <span className="text-[11px] text-slate-500">
                      Qtd: {it.quantity} un | Tipo: {it.materialType}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-300">
                    100Ãƒâ€”52mm
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsLabelModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                  setIsLabelModalOpen(false);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-navy-900 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" /> Imprimir Etiquetas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

