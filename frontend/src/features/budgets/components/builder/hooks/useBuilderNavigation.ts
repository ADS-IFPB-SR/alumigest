import { useState, useCallback } from 'react';
import type { MaterialSelection, WindowTemplate } from '../../../types';
import toast from 'react-hot-toast';

/**
 * Propriedades para o hook useBuilderNavigation.
 */
export interface UseBuilderNavigationProps {
  template: WindowTemplate | null;
  widthMm: number | '';
  heightMm: number | '';
  quantity: number | '';
  materialSelections: MaterialSelection[];
}

/**
 * Subhook especializado na navegação e fluxo em etapas (Wizard 1 a 4):
 * - Step 1: Dimensões, quantidade e acabamentos base.
 * - Step 2: Materiais (vidro, perfis, ferragens, películas).
 * - Step 3: Mecânica da folha, puxador e furação.
 * - Step 4: Resumo executivo e aprovação.
 * - Validações de transição de etapa e prevenção de avanço com dados inconsistentes.
 */
export function useBuilderNavigation({
  template,
  widthMm,
  heightMm,
  quantity,
  materialSelections,
}: UseBuilderNavigationProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isMobileCadExpanded, setIsMobileCadExpanded] = useState(false);

  const validateStep = useCallback(
    (step: 1 | 2 | 3 | 4): boolean => {
      const newErrors: Record<string, string> = {};

      if (step === 1) {
        const w = typeof widthMm === 'number' ? widthMm : 0;
        const h = typeof heightMm === 'number' ? heightMm : 0;
        const qty = typeof quantity === 'number' ? quantity : 0;

        if (!w || w <= 0) newErrors.widthMm = 'Largura obrigatória';
        if (!h || h <= 0) newErrors.heightMm = 'Altura obrigatória';
        if (!qty || qty < 1) newErrors.quantity = 'Quantidade inválida';

        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
          toast.error('Informe as medidas e quantidade da esquadria.');
          return false;
        }
      }

      if (step === 2) {
        const missingReqs = materialSelections.filter(
          (sel) => !sel.isOptional && !sel.materialId,
        );

        if (missingReqs.length > 0) {
          toast.error(`Selecione os materiais obrigatórios: ${missingReqs.map((r) => r.label).join(', ')}`);
          return false;
        }
      }

      setErrors({});
      return true;
    },
    [widthMm, heightMm, quantity, materialSelections]
  );

  const handleNextStep = useCallback(() => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3 | 4);
      }
    }
  }, [currentStep, validateStep]);

  const handlePrevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
    }
  }, [currentStep]);

  const handleGoToStep = useCallback(
    (targetStep: 1 | 2 | 3 | 4) => {
      if (targetStep > currentStep) {
        for (let s = currentStep; s < targetStep; s++) {
          if (!validateStep(s as 1 | 2 | 3 | 4)) return;
        }
      }
      setCurrentStep(targetStep);
    },
    [currentStep, validateStep]
  );

  const validateAllBeforeSubmit = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!template) {
      toast.error('Selecione um template de esquadria.');
      return false;
    }

    const w = typeof widthMm === 'number' ? widthMm : 0;
    const h = typeof heightMm === 'number' ? heightMm : 0;
    const qty = typeof quantity === 'number' ? quantity : 0;

    if (!w || w <= 0) newErrors.widthMm = 'Largura obrigatória';
    if (!h || h <= 0) newErrors.heightMm = 'Altura obrigatória';
    if (!qty || qty < 1) newErrors.quantity = 'Quantidade inválida';

    const missingReqs = materialSelections.filter(
      (sel) => !sel.isOptional && !sel.materialId,
    );

    if (missingReqs.length > 0) {
      toast.error(`Selecione os materiais obrigatórios: ${missingReqs.map((r) => r.label).join(', ')}`);
      setCurrentStep(2);
      return false;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Verifique as medidas informadas.');
      setCurrentStep(1);
      return false;
    }

    return true;
  }, [template, widthMm, heightMm, quantity, materialSelections]);

  const resetNavigation = useCallback(() => {
    setCurrentStep(1);
    setErrors({});
    setIsMobileCadExpanded(false);
  }, []);

  return {
    currentStep,
    setCurrentStep,
    errors,
    setErrors,
    isMobileCadExpanded,
    setIsMobileCadExpanded,
    validateStep,
    handleNextStep,
    handlePrevStep,
    handleGoToStep,
    validateAllBeforeSubmit,
    resetNavigation,
  };
}
