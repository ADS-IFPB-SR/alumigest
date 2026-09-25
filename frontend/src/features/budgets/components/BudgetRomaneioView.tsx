import type { BudgetDetail } from '../types';
import { WindowSvgPreview } from './builder/WindowSvgPreview';
import { BudgetMaterialsSummary } from './BudgetMaterialsSummary';

type BudgetWorkshopItem = BudgetDetail['items'][number];

interface BudgetRomaneioViewProps {
  readonly budget: BudgetDetail;
}

function formatHandleTechnicalDescription(handleConfig?: BudgetWorkshopItem['handleConfig']): string {
  if (!handleConfig?.handleType || handleConfig.handleType === 'NONE') {
    return 'Padrão / Sem puxador';
  }

  let dimension = 'Padrão';
  if (handleConfig.handleLengthMm) {
    dimension = `${handleConfig.handleLengthMm}mm`;
  } else if (handleConfig.pieceLengthCm) {
    dimension = `${handleConfig.pieceLengthCm}cm`;
  } else if ((handleConfig as { pieceLengthMm?: number }).pieceLengthMm) {
    dimension = `${(handleConfig as { pieceLengthMm?: number }).pieceLengthMm}mm`;
  }

  return `${handleConfig.handleType} (${dimension})`;
}

function formatDrillingTechnicalDescription(drillingConfig?: BudgetWorkshopItem['drillingConfig']): string {
  if (!drillingConfig?.holeCount) {
    return 'Padrão da linha';
  }

  const divisionLabel = drillingConfig.divisionType === 'EQUAL' ? 'por igual' : 'distâncias manuais';
  return `${drillingConfig.holeCount} furos (${divisionLabel})`;
}

export function BudgetRomaneioView({ budget }: BudgetRomaneioViewProps) {
  const customerName = budget.customer?.name ?? budget.customerName ?? 'Vidraçaria Silva';
  const customerPhone = budget.customer?.phone;
  const customerAddress = budget.customer?.address;
  const items = budget.items ?? [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-md lg:gap-lg items-start" data-testid="romaneio-view">
      <div className="lg:col-span-8 flex flex-col gap-md">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xs overflow-hidden break-inside-avoid">
          <div className="bg-primary/5 border-b border-outline-variant px-md py-sm flex justify-between items-center flex-wrap gap-xs">
            <div className="flex items-center gap-xs">
              <span className="material-symbols-outlined text-[20px] text-primary">engineering</span>
              <h2 className="font-label font-bold text-sm sm:text-base text-on-surface uppercase tracking-wider">
                Romaneio Técnico & Gabarito de Fabricação
              </h2>
            </div>
            <span className="bg-surface-container px-2.5 py-0.5 rounded text-xs font-data-mono font-bold text-primary">
              {items.length} {items.length === 1 ? 'esquadria' : 'esquadrias'}
            </span>
          </div>

          <div className="divide-y divide-outline-variant/60">
            {items.map((item, idx) => {
              const width = item.width ?? 0;
              const height = item.height ?? 0;
              const alturaPerfilMm = Math.max(0, height - 35);
              const larguraFolhaMm = Math.max(0, Math.round(width / 2 + 25));
              const alturaVidroMm = Math.max(0, height - 45);

              return (
                <div key={item.id ?? idx} className="p-md sm:p-lg flex flex-col gap-md break-inside-avoid">
                  <div className="flex flex-col sm:flex-row gap-md items-start">
                    {item.templateType && (
                      <div className="shrink-0 bg-surface-container-low rounded-lg p-2 border border-outline-variant self-center sm:self-start w-[160px] flex items-center justify-center">
                        <WindowSvgPreview
                          templateType={item.templateType}
                          widthMm={width}
                          heightMm={height}
                          openingDirection={item.templateConfig?.openingDirection ?? 'LEFT_TO_RIGHT'}
                          handleConfig={item.handleConfig ?? { handleType: 'NONE' }}
                          drillingConfig={item.drillingConfig ?? { holeCount: 0, divisionType: 'EQUAL' }}
                          templateName={item.productName}
                          aluminumColor={item.templateConfig?.aluminumColor}
                          glassFinish={item.templateConfig?.glassFinish}
                          maxHeight={130}
                        />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-headline font-bold text-base text-on-surface">
                            Item #{idx + 1} — {item.productName}
                          </h3>
                          <p className="text-xs text-on-surface-variant font-data-mono mt-0.5">
                            Medidas Nominais: <strong>{width} × {height} mm</strong> ({item.quantity} {item.quantity > 1 ? 'unidades' : 'unidade'})
                          </p>
                        </div>
                        <span className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded text-xs font-bold font-data-mono">
                          {item.quantity}x
                        </span>
                      </div>

                      {/* Parâmetros técnicos de fabricação */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-xs text-xs mt-3 bg-surface-container-low/60 p-2.5 rounded-lg border border-outline-variant/40">
                        <div>
                          <span className="font-bold text-on-surface">Perfil / Alumínio:</span>{' '}
                          <span className="text-on-surface-variant">{item.templateConfig?.aluminumColor ?? 'Linha Box Branco'}</span>
                        </div>
                        <div>
                          <span className="font-bold text-on-surface">Vidro:</span>{' '}
                          <span className="text-on-surface-variant">{item.templateConfig?.glassFinish ?? '8mm Incolor'}</span>
                        </div>
                        <div>
                          <span className="font-bold text-on-surface">Puxador:</span>{' '}
                          <span className="text-on-surface-variant">
                            {formatHandleTechnicalDescription(item.handleConfig)}
                          </span>
                        </div>
                        <div>
                          <span className="font-bold text-on-surface">Furação Técnica:</span>{' '}
                          <span className="text-on-surface-variant">
                            {formatDrillingTechnicalDescription(item.drillingConfig)}
                          </span>
                        </div>
                      </div>

                      {/* Lista de Corte de Peças */}
                      <div className="mt-3 pt-2 border-t border-outline-variant/40">
                        <p className="text-xs font-label font-bold text-primary uppercase tracking-wider mb-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">content_cut</span>
                          {' '}Lista de Corte & Gabarito Técnico
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-data-mono">
                          <div className="bg-surface-container p-2 rounded border border-outline-variant/40">
                            <span className="text-[10px] text-on-surface-variant block uppercase font-sans">Trilho Sup / Inf:</span>
                            <strong>{width} mm</strong> (2 un)
                          </div>
                          <div className="bg-surface-container p-2 rounded border border-outline-variant/40">
                            <span className="text-[10px] text-on-surface-variant block uppercase font-sans">Laterais / Marco:</span>
                            <strong>{alturaPerfilMm} mm</strong> (2 un)
                          </div>
                          <div className="bg-surface-container p-2 rounded border border-outline-variant/40">
                            <span className="text-[10px] text-on-surface-variant block uppercase font-sans">Vidro (2 folhas):</span>
                            <strong>{larguraFolhaMm} × {alturaVidroMm} mm</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resumo de Consumo Agregado de Materiais */}
        {items.length > 0 && (
          <BudgetMaterialsSummary items={items} className="break-inside-avoid" />
        )}
      </div>

      {/* Sidebar Técnica (Obra & Liberação de Oficina) */}
      <div className="lg:col-span-4 flex flex-col gap-md lg:sticky lg:top-4">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-xs flex flex-col gap-sm break-inside-avoid">
          <div className="flex items-center justify-between pb-xs border-b border-outline-variant">
            <span className="text-xs font-label font-bold text-on-surface uppercase tracking-wider flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-primary">location_city</span>
              {' '}Dados da Obra & Cliente
            </span>
          </div>
          <div className="pt-xs flex flex-col gap-xs text-xs">
            <p className="font-bold text-on-surface text-sm">
              {customerName}
            </p>
            {customerPhone && (
              <p className="font-data-mono text-on-surface-variant">Tel: {customerPhone}</p>
            )}
            {customerAddress && (
              <p className="text-secondary font-body bg-surface-container-low p-2 rounded border border-outline-variant/40">
                Endereço da Obra: <strong>{customerAddress}</strong>
              </p>
            )}
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-xs flex flex-col gap-sm break-inside-avoid">
          <h4 className="font-label font-bold text-xs uppercase tracking-wider text-primary border-b border-outline-variant pb-xs flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">verified_user</span>
            {' '}Controle de Qualidade & Fábrica
          </h4>
          <p className="text-xs text-on-surface-variant leading-relaxed font-body">
            Esta via técnica destina-se exclusivamente à conferência de corte, têmpera de vidro e montagem de esquadrias na oficina, em estrito sigilo comercial.
          </p>
          <div className="pt-6 border-t border-dashed border-outline-variant/80 text-center text-xs text-secondary mt-2">
            <div className="w-48 border-t border-on-surface/40 mx-auto mb-1"></div>
            <span>Responsável Técnico / Serralheiro</span>
          </div>
        </div>
      </div>
    </div>
  );
}
