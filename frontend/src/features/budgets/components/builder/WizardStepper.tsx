import React from 'react';

export interface WizardStepperProps {
  readonly currentStep: 1 | 2 | 3 | 4;
  readonly onGoToStep: (step: 1 | 2 | 3 | 4) => void;
}

const STEPS = [
  { num: 1 as const, title: 'Medidas', fullTitle: 'Medidas & Vão', icon: 'aspect_ratio' },
  { num: 2 as const, title: 'Insumos', fullTitle: 'Insumos & Cores', icon: 'palette' },
  { num: 3 as const, title: 'Mecânica', fullTitle: 'Mecânica & Furação', icon: 'tune' },
  { num: 4 as const, title: 'Resumo', fullTitle: 'Resumo & Confirmação', icon: 'task_alt' },
];

export const WizardStepper: React.FC<WizardStepperProps> = ({ currentStep, onGoToStep }) => {
  return (
    <div className="bg-surface-container-low border-b border-outline-variant px-sm sm:px-lg py-2 sm:py-sm flex-shrink-0">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {STEPS.map((step, idx) => {
          const isActive = currentStep === step.num;
          const isCompleted = currentStep > step.num;

          let circleClass = 'bg-surface-container-highest text-on-surface-variant';
          let titleClass = 'text-on-surface-variant';

          if (isActive) {
            circleClass = 'bg-primary text-on-primary shadow-xs ring-2 ring-primary/30';
            titleClass = 'text-primary';
          } else if (isCompleted) {
            circleClass = 'bg-primary/20 text-primary hover:bg-primary/30';
            titleClass = 'text-on-surface';
          }

          return (
            <React.Fragment key={step.num}>
              <button
                type="button"
                onClick={() => onGoToStep(step.num)}
                className="flex items-center gap-1 sm:gap-2 group focus:outline-none"
                aria-current={isActive ? 'step' : undefined}
                title={step.fullTitle}
              >
                <div
                  className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-label font-bold transition-all ${circleClass}`}
                >
                  {isCompleted ? (
                    <span className="material-symbols-outlined text-[14px] sm:text-[18px]">check</span>
                  ) : (
                    step.num
                  )}
                </div>
                <div className="flex flex-col text-left">
                  <span
                    className={`text-[11px] sm:text-xs font-label font-bold leading-tight ${titleClass}`}
                  >
                    <span className="sm:hidden">{step.title}</span>
                    <span className="hidden sm:inline">{step.fullTitle}</span>
                  </span>
                  <span className="hidden md:inline text-[10px] text-secondary font-body leading-none">
                    Passo {step.num} de 4
                  </span>
                </div>
              </button>

              {idx < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-1 sm:mx-3 transition-colors ${
                    currentStep > step.num ? 'bg-primary' : 'bg-outline-variant'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
