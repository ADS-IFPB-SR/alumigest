import { useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useBudgets } from '../servicos-e-mocks/useBudgets';
import { Button } from '../../components/ui/Button';
import { DoorTemplateSvg } from '../componentes-templates-svg/DoorTemplateSvg';
import type { BudgetStatus } from '../tipos';
import toast from 'react-hot-toast';

const statusLabels: Record<BudgetStatus, { label: string; color: string; icon: string }> = {
  DRAFT: { label: 'Rascunho', color: 'bg-surface-container-high text-on-surface-variant', icon: 'edit_note' },
  SENT: { label: 'Enviado', color: 'bg-secondary-container text-on-secondary-container', icon: 'send' },
  APPROVED: { label: 'Aprovado', color: 'bg-tertiary-container text-on-tertiary-container', icon: 'check_circle' },
  REJECTED: { label: 'Rejeitado', color: 'bg-error-container text-on-error-container', icon: 'cancel' },
  CANCELLED: { label: 'Cancelado', color: 'bg-surface-container-high text-outline', icon: 'block' },
};

export function BudgetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { findBudget, changeStatus } = useBudgets();
  const [activeTab, setActiveTab] = useState<'commercial' | 'workshop'>('commercial');
  const printRef = useRef<HTMLDivElement>(null);

  const budget = findBudget(id || '');

  if (!budget) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-xl">
        <span className="material-symbols-outlined text-[64px] text-outline mb-md">search_off</span>
        <h3 className="font-title-sm text-title-sm text-on-surface mb-xs">Orçamento não encontrado</h3>
        <Link to="/orcamentos" className="text-primary hover:underline font-body-sm">Voltar para lista</Link>
      </div>
    );
  }

  const s = statusLabels[budget.status];

  const handleStatusChange = (newStatus: BudgetStatus) => {
    changeStatus(budget.id, newStatus);
    toast.success(`Status atualizado para "${statusLabels[newStatus].label}".`);
    navigate(0);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-surface relative print:bg-white print:overflow-visible print:h-auto">
      {/* Header (Hidden on Print) */}
      <div className="flex-none px-md lg:px-margin-desktop py-sm border-b border-outline-variant bg-surface z-10 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-sm font-body-sm text-body-sm text-on-surface-variant">
          <Link to="/orcamentos" className="hover:text-primary transition-colors">Orçamentos</Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-on-surface font-medium">{budget.code}</span>
        </div>
        <div className="flex items-center gap-sm">
          <Button variant="outline" icon="edit" onClick={() => navigate(`/orcamentos/${budget.id}/editar`)}>
            Editar
          </Button>
          {budget.status === 'DRAFT' && (
            <Button variant="outline" icon="send" onClick={() => handleStatusChange('SENT')}>
              Enviar ao Cliente
            </Button>
          )}
          {budget.status === 'SENT' && (
            <>
              <Button variant="success" icon="check_circle" onClick={() => handleStatusChange('APPROVED')}>
                Aprovar
              </Button>
              <Button variant="outline" icon="cancel" onClick={() => handleStatusChange('REJECTED')}>
                Rejeitar
              </Button>
            </>
          )}
          <Button variant="secondary" icon="print" onClick={handlePrint}>
            Imprimir Proposta
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-md lg:p-margin-desktop max-w-container-max mx-auto w-full print:p-0 print:m-0 print:overflow-visible print:max-w-none">
        {/* Status Bar (Hidden on Print) */}
        <div className="flex items-center justify-between mb-lg print:hidden">
          <div>
            <h2 className="font-headline text-headline-md lg:text-headline-lg text-on-surface flex items-center gap-sm">
              {budget.code}
              <span className={`inline-flex items-center gap-xs px-sm py-xs rounded-full text-xs font-semibold ${s.color}`}>
                <span className="material-symbols-outlined text-[14px]">{s.icon}</span>
                {s.label}
              </span>
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
              Criado em {new Date(budget.createdAt).toLocaleDateString('pt-BR')} · Válido até {new Date(budget.validUntil).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>

        {/* Tab Switcher (Hidden on Print) */}
        <div className="flex gap-xs mb-lg border-b border-outline-variant print:hidden">
          <button
            onClick={() => setActiveTab('commercial')}
            className={`px-md py-sm font-label-bold text-label-bold text-xs border-b-2 transition-colors cursor-pointer ${
              activeTab === 'commercial' 
                ? 'border-primary text-primary font-bold' 
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] mr-xs align-middle">description</span>
            Relatório Comercial (Proposta do Cliente)
          </button>
          <button
            onClick={() => setActiveTab('workshop')}
            className={`px-md py-sm font-label-bold text-label-bold text-xs border-b-2 transition-colors cursor-pointer ${
              activeTab === 'workshop' 
                ? 'border-primary text-primary font-bold' 
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] mr-xs align-middle">construction</span>
            Romaneio de Peças (Oficina)
          </button>
        </div>

        <div ref={printRef} className="printable-document">
          {/* ─── COMMERCIAL REPORT (PROPOSTA COMERCIAL) ── */}
          {activeTab === 'commercial' && (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-lg shadow-sm print:p-0 print:border-none print:shadow-none">
              {/* Company Header */}
              <div className="print-header-box print-avoid-break mb-lg pb-md border-b-2 border-primary/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md">
                <div>
                  <h1 className="font-headline text-headline-lg text-primary font-bold tracking-tight">
                    Gestão de Esquadrias
                  </h1>
                  <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
                    Soluções em Vidros Temperados, Portas, Janelas e Esquadrias de Alumínio
                  </p>
                  <p className="font-body-sm text-[11px] text-on-surface-variant">
                    CNPJ: 00.000.000/0001-00 · Contato: (83) 99999-0000 · contato@esquadrias.com.br
                  </p>
                </div>
                <div className="text-left sm:text-right border-l-2 sm:border-l-0 pl-sm sm:pl-0 border-primary/20">
                  <span className="text-xs uppercase font-bold text-primary tracking-wider block">PROPOSTA COMERCIAL</span>
                  <span className="font-data-mono text-title-md font-bold text-on-surface block">{budget.code}</span>
                  <span className="text-xs text-on-surface-variant block">Data: {new Date(budget.createdAt).toLocaleDateString('pt-BR')}</span>
                  <span className="text-xs text-on-surface-variant block">Validade: {new Date(budget.validUntil).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>

              {/* Client and Proposal Info Box */}
              <div className="print-header-box print-avoid-break grid grid-cols-1 sm:grid-cols-2 gap-md p-md bg-surface-container-low/60 rounded-lg border border-outline-variant mb-lg print:bg-slate-50 print:border-slate-300">
                <div>
                  <h4 className="font-label-bold text-label-bold text-primary text-xs mb-xs uppercase tracking-wider">
                    DADOS DO CLIENTE
                  </h4>
                  <div className="flex flex-col gap-0.5 text-xs">
                    <div><span className="text-on-surface-variant font-medium">Nome:</span> <span className="text-on-surface font-semibold text-sm">{budget.customer.name}</span></div>
                    {budget.customer.phone && <div><span className="text-on-surface-variant">Telefone:</span> <span className="text-on-surface font-mono">{budget.customer.phone}</span></div>}
                    {budget.customer.email && <div><span className="text-on-surface-variant">E-mail:</span> <span className="text-on-surface">{budget.customer.email}</span></div>}
                    {budget.customer.document && <div><span className="text-on-surface-variant">CPF/CNPJ:</span> <span className="text-on-surface font-mono">{budget.customer.document}</span></div>}
                    {budget.customer.address && <div><span className="text-on-surface-variant">Endereço da Obra:</span> <span className="text-on-surface">{budget.customer.address}</span></div>}
                  </div>
                </div>

                <div>
                  <h4 className="font-label-bold text-label-bold text-primary text-xs mb-xs uppercase tracking-wider">
                    RESUMO DO PROJETO
                  </h4>
                  <div className="flex flex-col gap-0.5 text-xs">
                    <div><span className="text-on-surface-variant">Total de Itens:</span> <span className="text-on-surface font-semibold">{budget.items.length} esquadria(s)</span></div>
                    <div><span className="text-on-surface-variant">Área Total Estimada:</span> <span className="text-on-surface font-mono">{budget.items.reduce((acc, it) => acc + ((it.width * it.height) / 1_000_000) * it.quantity, 0).toFixed(2)} m²</span></div>
                    <div><span className="text-on-surface-variant">Status da Proposta:</span> <span className="text-on-surface font-medium">{s.label}</span></div>
                  </div>
                </div>
              </div>

              {/* Items Table with Full Page Break Protection */}
              <div className="mb-lg">
                <h4 className="font-label-bold text-label-bold text-primary text-xs mb-sm uppercase tracking-wider">
                  ITENS E ESPECIFICAÇÕES TÉCNICAS
                </h4>
                <table className="w-full text-left border-collapse border border-outline-variant print:border-slate-300">
                  <thead>
                    <tr className="bg-surface-container-high border-b border-outline-variant print:bg-slate-100 print:border-slate-300">
                      <th className="p-sm font-label-bold text-label-bold text-primary text-xs">Esquadria / Desenho</th>
                      <th className="p-sm font-label-bold text-label-bold text-primary text-xs text-center">Cotas (L × A)</th>
                      <th className="p-sm font-label-bold text-label-bold text-primary text-xs text-center">Qtd</th>
                      <th className="p-sm font-label-bold text-label-bold text-primary text-xs">Especificações & Insumos</th>
                      <th className="p-sm font-label-bold text-label-bold text-primary text-xs text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {budget.items.map((item, idx) => (
                      <tr 
                        key={item.id} 
                        className={`print-item-row print-avoid-break border-b border-outline-variant/60 print:border-slate-200 ${
                          idx % 2 === 0 ? 'bg-surface-container-lowest' : 'bg-surface-container-low/40'
                        }`}
                      >
                        {/* Technical Drawing + Title */}
                        <td className="p-sm align-top">
                          <div className="flex items-center gap-sm">
                            <div className="w-20 h-20 rounded bg-white border border-outline-variant/80 p-1 flex items-center justify-center shrink-0 shadow-xs print:shadow-none print:w-20 print:h-20 print:border-slate-300">
                              <DoorTemplateSvg
                                templateType={item.templateType || 'SLIDING_DOOR_2F'}
                                widthMm={item.width}
                                heightMm={item.height}
                                config={item.templateConfig}
                                showDimensions={false}
                                className="w-full h-full"
                              />
                            </div>
                            <div>
                              <span className="font-body-sm text-on-surface font-bold block">{item.productName}</span>
                              <span className="text-[11px] text-secondary font-mono block mt-0.5">
                                {((item.width * item.height) / 1_000_000).toFixed(2)} m² / un
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Dimensions */}
                        <td className="p-sm text-center align-top whitespace-nowrap">
                          <span className="font-data-mono text-data-mono text-on-surface text-xs font-semibold">
                            {item.width} × {item.height} mm
                          </span>
                        </td>

                        {/* Quantity */}
                        <td className="p-sm text-center align-top">
                          <span className="font-data-mono text-data-mono text-on-surface font-bold text-sm">
                            {item.quantity}
                          </span>
                        </td>

                        {/* Specifications & Materials */}
                        <td className="p-sm align-top">
                          <div className="flex flex-col gap-1 text-xs">
                            {item.options.map((opt, oidx) => (
                              <div key={oidx} className="text-on-surface-variant">
                                <span className="font-medium text-on-surface">• {opt.materialName}:</span> {opt.quantity} {opt.unitMeasure}
                                {opt.selectedType && <span className="text-secondary font-medium"> — {opt.selectedType}</span>}
                                {opt.selectedColor && <span className="text-on-surface-variant"> ({opt.selectedColor})</span>}
                              </div>
                            ))}

                            {/* Handle specifications */}
                            {item.handleConfig && item.handleConfig.handleType !== 'NONE' && (
                              <div className="text-primary font-medium">
                                • Puxador: {item.handleConfig.handleType === 'BAR_TUBULAR' ? 'Tubular Inox' : item.handleConfig.handleType === 'SHELL_LOCK' ? 'Fecho Concha' : 'Maçaneta Alavanca'} ({item.handleConfig.side === 'BOTH_SIDES' ? '2 Lados' : '1 Lado'}, {item.handleConfig.coverage === 'FULL' ? 'Inteiro' : `${item.handleConfig.pieceLengthCm}cm`})
                              </div>
                            )}

                            {/* Drilling specifications */}
                            {item.drillingConfig && item.drillingConfig.holeCount > 0 && (
                              <div className="text-secondary font-medium">
                                • Furação: {item.drillingConfig.holeCount} furos na borda externa ({item.drillingConfig.divisionType === 'EQUAL' ? 'Por igual' : `Medidas: ${item.drillingConfig.customDistancesMm?.join('mm, ')}mm`})
                              </div>
                            )}

                            {/* Item Notes */}
                            {item.notes && (
                              <div className="text-on-surface-variant italic mt-0.5">
                                Obs: {item.notes}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Subtotal */}
                        <td className="p-sm text-right align-top whitespace-nowrap">
                          <span className="font-data-mono text-data-mono text-on-surface font-bold text-sm">
                            R$ {item.subtotal.toFixed(2).replace('.', ',')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Box */}
              <div className="print-summary-box print-avoid-break flex justify-end mb-lg">
                <div className="w-80 p-md bg-surface-container-low rounded-lg border border-outline-variant flex flex-col gap-xs print:bg-slate-50 print:border-slate-300">
                  <div className="flex justify-between text-xs text-on-surface-variant">
                    <span>Subtotal dos Itens</span>
                    <span className="font-data-mono font-medium text-on-surface">R$ {budget.subtotal.toFixed(2).replace('.', ',')}</span>
                  </div>

                  {budget.discountPercent > 0 && (
                    <div className="flex justify-between text-xs text-success">
                      <span>Desconto Comercial ({budget.discountPercent}%)</span>
                      <span className="font-data-mono font-medium">- R$ {budget.discountValue.toFixed(2).replace('.', ',')}</span>
                    </div>
                  )}

                  <div className="flex justify-between font-bold text-base border-t border-outline-variant pt-xs mt-xs text-on-surface print:border-slate-300">
                    <span>VALOR TOTAL</span>
                    <span className="font-data-mono text-primary text-lg">R$ {budget.total.toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>
              </div>

              {/* Notes & Commercial Conditions */}
              {budget.notes && (
                <div className="print-avoid-break p-md bg-surface-container-low/40 rounded-lg border border-outline-variant mb-lg print:border-slate-300">
                  <h4 className="font-label-bold text-label-bold text-primary text-xs mb-xs uppercase tracking-wider">
                    CONDIÇÕES COMERCIAIS & OBSERVAÇÕES
                  </h4>
                  <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">{budget.notes}</p>
                </div>
              )}

              {/* Signatures for Print Acceptance */}
              <div className="print-signature-box print-avoid-break mt-xl pt-lg border-t border-outline-variant/80 hidden print:grid grid-cols-2 gap-xl text-center">
                <div>
                  <div className="border-t border-slate-700 pt-1 mt-8">
                    <span className="font-body text-xs text-on-surface font-bold block">{budget.customer.name}</span>
                    <span className="text-[10px] text-on-surface-variant block">Aceite do Cliente / Assinatura</span>
                  </div>
                </div>
                <div>
                  <div className="border-t border-slate-700 pt-1 mt-8">
                    <span className="font-body text-xs text-on-surface font-bold block">Gestão de Esquadrias</span>
                    <span className="text-[10px] text-on-surface-variant block">Responsável Técnico / Comercial</span>
                  </div>
                </div>
              </div>

              {/* Print Footer */}
              <div className="hidden print:flex justify-between items-center mt-lg pt-xs border-t border-slate-300 text-[10px] text-slate-500">
                <span>AlumiGest ERP · Proposta Comercial {budget.code}</span>
                <span>Página impressa em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          )}

          {/* ─── WORKSHOP PICKLIST (ROMANEIO DE OFICINA) ─ */}
          {activeTab === 'workshop' && (
            <div className="flex flex-col gap-lg">
              {budget.status !== 'APPROVED' && (
                <div className="bg-secondary-container/30 border border-secondary-container rounded-lg p-md flex items-center gap-sm print:hidden">
                  <span className="material-symbols-outlined text-secondary text-[24px]">info</span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    O romaneio de peças ficará completo após a <strong>aprovação</strong> do orçamento.
                  </p>
                </div>
              )}

              {/* Header for Workshop Print */}
              <div className="print-header-box print-avoid-break hidden print:flex justify-between items-center pb-sm border-b-2 border-primary">
                <div>
                  <h2 className="font-headline text-headline-md font-bold text-primary">ROMANEIO DE FABRICAÇÃO</h2>
                  <span className="text-xs text-on-surface-variant">Orçamento {budget.code} · Cliente: {budget.customer.name}</span>
                </div>
                <span className="text-xs font-mono text-on-surface-variant">Data: {new Date().toLocaleDateString('pt-BR')}</span>
              </div>

              {budget.items.map((item, itemIdx) => (
                <div 
                  key={item.id} 
                  className="print-item-card print-avoid-break bg-surface-container-lowest border border-outline-variant rounded-lg p-lg shadow-sm print:p-md print:border-slate-300 print:mb-md"
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-md mb-md pb-sm border-b border-outline-variant print:border-slate-200">
                    <div>
                      <h3 className="font-title-sm text-title-sm text-on-surface font-bold">
                        #{itemIdx + 1} — {item.productName}
                      </h3>
                      <span className="font-data-mono text-xs text-on-surface-variant">
                        Dimensões de Montagem: <strong>{item.width}mm × {item.height}mm</strong> · Quantidade: <strong>{item.quantity} un</strong>
                      </span>
                    </div>
                  </div>

                  {/* Blueprint and Cut List layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg mb-md print:grid-cols-3">
                    {/* Visual Blueprint Schematic */}
                    <div className="lg:col-span-1 print:col-span-1 bg-white border border-outline-variant/80 rounded-lg p-sm flex flex-col items-center justify-center shadow-inner min-h-[220px] print:shadow-none print:border-slate-300">
                      <span className="text-[11px] font-bold text-primary mb-1 uppercase tracking-wider">
                        Gabarito de Fabricação
                      </span>
                      <div className="w-full h-48 flex items-center justify-center">
                        <DoorTemplateSvg
                          templateType={item.templateType || 'SLIDING_DOOR_2F'}
                          widthMm={item.width}
                          heightMm={item.height}
                          config={item.templateConfig}
                          showDimensions={true}
                          className="w-full h-full"
                        />
                      </div>
                    </div>

                    {/* Cut List Table */}
                    <div className="lg:col-span-2 print:col-span-2 flex flex-col">
                      <h4 className="font-label-bold text-label-bold text-primary text-xs mb-sm flex items-center gap-xs">
                        <span className="material-symbols-outlined text-[16px]">content_cut</span>
                        Lista de Peças e Insumos para Montagem
                      </h4>
                      <table className="w-full text-left border-collapse border border-outline-variant print:border-slate-300">
                        <thead>
                          <tr className="bg-surface-container-low border-b border-outline-variant print:bg-slate-100">
                            <th className="p-xs font-label-bold text-primary text-xs">#</th>
                            <th className="p-xs font-label-bold text-primary text-xs">Material</th>
                            <th className="p-xs font-label-bold text-primary text-xs text-center">Un.</th>
                            <th className="p-xs font-label-bold text-primary text-xs text-center">Qtd Total</th>
                            <th className="p-xs font-label-bold text-primary text-xs">Especificação</th>
                            <th className="p-xs font-label-bold text-primary text-xs">Cor</th>
                          </tr>
                        </thead>
                        <tbody>
                          {item.options.map((opt, idx) => (
                            <tr key={idx} className={`border-b border-outline-variant/40 print:border-slate-200 ${idx % 2 === 0 ? 'bg-surface-container-lowest' : 'bg-surface-container-low/40'}`}>
                              <td className="p-xs font-data-mono text-xs text-on-surface-variant">{idx + 1}</td>
                              <td className="p-xs font-body-sm text-xs text-on-surface font-medium">{opt.materialName}</td>
                              <td className="p-xs text-center font-data-mono text-xs text-secondary">{opt.unitMeasure}</td>
                              <td className="p-xs text-center font-data-mono text-xs text-on-surface font-bold">
                                {(opt.quantity * item.quantity).toFixed(opt.unitMeasure === 'M2' ? 2 : 0)}
                              </td>
                              <td className="p-xs font-body-sm text-xs text-on-surface-variant">{opt.selectedType || '—'}</td>
                              <td className="p-xs font-body-sm text-xs text-on-surface-variant">{opt.selectedColor || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {item.notes && (
                    <div className="p-xs bg-surface-container-low rounded border border-outline-variant/60 print:bg-slate-50 print:border-slate-200 text-xs">
                      <span className="font-bold text-on-surface-variant">Observações de Produção: </span>
                      <span className="text-on-surface">{item.notes}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
