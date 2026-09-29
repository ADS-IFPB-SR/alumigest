import { useState, useRef, useEffect } from 'react';
import type { BudgetStatus } from '../types';
import { BUDGET_STATUS_THEMES, getBudgetStatusTheme } from '../utils/statusTheme';

interface BudgetStatusPipelineProps {
  readonly status: BudgetStatus;
  readonly onChange: (newStatus: BudgetStatus) => void;
  readonly disabled?: boolean;
}

const PIPELINE_STEPS: BudgetStatus[] = ['DRAFT', 'SENT', 'APPROVED'];

export function BudgetStatusPipeline({ status, onChange, disabled }: BudgetStatusPipelineProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isLostState = status === 'REJECTED' || status === 'CANCELLED';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStepClick = (step: BudgetStatus) => {
    if (disabled || step === status) return;
    onChange(step);
  };

  const currentIdx = PIPELINE_STEPS.indexOf(status);

  // Se estiver em estado terminal negativo (Rejeitado ou Cancelado), exibe o badge característico e ação de Reabrir
  if (isLostState) {
    const theme = getBudgetStatusTheme(status);

    return (
      <div className="flex items-center gap-2">
        <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border shadow-2xs ${theme.badge}`}>
          <span className="material-symbols-outlined text-[18px]">{theme.icon}</span>
          <span className="font-label font-bold text-xs">{theme.label}</span>
        </div>

        <button
          type="button"
          onClick={() => onChange('DRAFT')}
          disabled={disabled}
          className="px-3 py-1.5 text-xs font-label font-bold text-primary hover:bg-primary/10 rounded-full border border-outline-variant/60 hover:border-primary/40 transition-colors focus:outline-none flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          title="Reabrir proposta como Rascunho"
        >
          <span className="material-symbols-outlined text-[16px]">replay</span>
          <span>Reabrir</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {/* Pipeline Stepper Visual com Cores Semânticas */}
      <div className="flex items-center bg-surface-container-lowest border border-outline-variant/60 p-1 rounded-full shadow-2xs">
        {PIPELINE_STEPS.map((step, index) => {
          const stepIdx = PIPELINE_STEPS.indexOf(step);
          const theme = BUDGET_STATUS_THEMES[step];
          const isCompleted = stepIdx < currentIdx;
          const isCurrent = stepIdx === currentIdx;

          // Define o estilo exato baseado no status e fase
          let stepClasses = 'border ';
          if (isCurrent) {
            stepClasses += `${theme.stepperActive} scale-[1.02]`;
          } else if (isCompleted) {
            stepClasses += `${theme.stepperCompleted} cursor-pointer`;
          } else {
            stepClasses += `${theme.stepperUpcoming} cursor-pointer`;
          }

          // Define a cor da linha de conexão
          let connectorClass = 'bg-outline-variant/40';
          if (index === 0 && (status === 'SENT' || status === 'APPROVED')) {
            connectorClass = 'bg-[#93c5fd] dark:bg-blue-600'; // Rascunho -> Enviado ativo
          } else if (index === 1 && status === 'APPROVED') {
            connectorClass = 'bg-emerald-400 dark:bg-emerald-600'; // Enviado -> Aprovado ativo
          }

          return (
            <div key={step} className="flex items-center">
              <button
                type="button"
                onClick={() => handleStepClick(step)}
                disabled={disabled}
                className={`
                  relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-label transition-all duration-200 focus:outline-none
                  ${stepClasses}
                  ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                title={`Alterar para ${theme.label}`}
              >
                <span className="material-symbols-outlined text-[16px] shrink-0">
                  {theme.icon}
                </span>
                <span className="whitespace-nowrap">{theme.label}</span>
              </button>

              {index < PIPELINE_STEPS.length - 1 && (
                <div className={`w-2.5 sm:w-5 h-[2px] mx-1 rounded-full transition-colors duration-300 ${connectorClass}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Ações Secundárias (Rejeitar / Cancelar) */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          disabled={disabled}
          className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-full border border-transparent hover:border-outline-variant transition-all focus:outline-none disabled:opacity-50 cursor-pointer"
          title="Outros status (Rejeitado / Cancelado)"
          aria-label="Opções adicionais de status"
        >
          <span className="material-symbols-outlined text-[20px]">more_vert</span>
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-52 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl py-1.5 z-50 animate-fadeIn backdrop-blur-md">
            <div className="px-3 py-1 text-[10px] font-label font-bold text-on-surface-variant uppercase tracking-wider border-b border-outline-variant/40">
              Ações de Fechamento
            </div>
            <button
              type="button"
              onClick={() => {
                onChange('REJECTED');
                setIsDropdownOpen(false);
              }}
              className={`w-full text-left px-3.5 py-2 text-xs font-label font-medium ${BUDGET_STATUS_THEMES.REJECTED.menuAction} flex items-center gap-2 transition-colors cursor-pointer`}
            >
              <span className="material-symbols-outlined text-[18px]">{BUDGET_STATUS_THEMES.REJECTED.icon}</span>
              <span>Marcar como Rejeitado</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onChange('CANCELLED');
                setIsDropdownOpen(false);
              }}
              className={`w-full text-left px-3.5 py-2 text-xs font-label font-medium ${BUDGET_STATUS_THEMES.CANCELLED.menuAction} flex items-center gap-2 transition-colors cursor-pointer`}
            >
              <span className="material-symbols-outlined text-[18px]">{BUDGET_STATUS_THEMES.CANCELLED.icon}</span>
              <span>Cancelar Orçamento</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

