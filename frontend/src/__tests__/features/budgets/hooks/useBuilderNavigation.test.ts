import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
  useBuilderNavigation,
  type UseBuilderNavigationProps,
} from '@/features/budgets/components/builder/hooks/useBuilderNavigation';
import type { WindowTemplate, MaterialSelection } from '@/features/budgets/types';

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useBuilderNavigation — Testes de Transição de Estados do Wizard', () => {
  const mockTemplate: WindowTemplate = {
    id: 'tpl-1',
    name: 'Janela de Correr 2 Folhas',
    templateType: 'SLIDING_DOOR_2F',
    categoryRequirements: ['GLASS', 'PROFILE'],
  } as unknown as WindowTemplate;

  const validMaterialSelections: MaterialSelection[] = [
    { category: 'GLASS', label: 'Vidro Incolor', isOptional: false, materialId: 'glass-1' } as MaterialSelection,
    { category: 'PROFILE', label: 'Perfil Alumínio', isOptional: false, materialId: 'prof-1' } as MaterialSelection,
  ];

  const defaultProps: UseBuilderNavigationProps = {
    template: mockTemplate,
    widthMm: 1200,
    heightMm: 1000,
    quantity: 1,
    materialSelections: validMaterialSelections,
  };

  it('deve iniciar no Passo 1 com estado limpo', () => {
    const { result } = renderHook(() => useBuilderNavigation(defaultProps));

    expect(result.current.currentStep).toBe(1);
    expect(result.current.errors).toEqual({});
    expect(result.current.isMobileCadExpanded).toBe(false);
  });

  describe('[Técnica: Transição de Estados - Avanço do Passo 1 ➔ 2]', () => {
    it('deve avançar para o Passo 2 quando dimensões e quantidade forem válidas', () => {
      const { result } = renderHook(() => useBuilderNavigation(defaultProps));

      act(() => {
        result.current.handleNextStep();
      });

      expect(result.current.currentStep).toBe(2);
      expect(result.current.errors).toEqual({});
    });

    it('[Técnica: Análise do Valor Limite - Dimensão Zero/Inválida] deve bloquear avanço se largura for inválida', () => {
      const invalidProps: UseBuilderNavigationProps = {
        ...defaultProps,
        widthMm: 0,
      };

      const { result } = renderHook(() => useBuilderNavigation(invalidProps));

      act(() => {
        result.current.handleNextStep();
      });

      expect(result.current.currentStep).toBe(1);
      expect(result.current.errors.widthMm).toBe('Largura obrigatória');
    });

    it('[Técnica: Análise do Valor Limite - Quantidade Menor que 1] deve bloquear avanço se quantidade for zero', () => {
      const invalidProps: UseBuilderNavigationProps = {
        ...defaultProps,
        quantity: 0,
      };

      const { result } = renderHook(() => useBuilderNavigation(invalidProps));

      act(() => {
        result.current.handleNextStep();
      });

      expect(result.current.currentStep).toBe(1);
      expect(result.current.errors.quantity).toBe('Quantidade inválida');
    });
  });

  describe('[Técnica: Transição de Estados - Avanço do Passo 2 ➔ 3]', () => {
    it('deve bloquear avanço para o Passo 3 se houver material obrigatório não selecionado', () => {
      const missingMaterialProps: UseBuilderNavigationProps = {
        ...defaultProps,
        materialSelections: [
          { category: 'GLASS', label: 'Vidro', isOptional: false, materialId: undefined } as unknown as MaterialSelection,
        ],
      };

      const { result } = renderHook(() => useBuilderNavigation(missingMaterialProps));

      // Avança para o passo 2
      act(() => {
        result.current.setCurrentStep(2);
      });

      // Tenta avançar para o passo 3 com pendência
      act(() => {
        result.current.handleNextStep();
      });

      expect(result.current.currentStep).toBe(2);
    });

    it('deve avançar para o Passo 3 quando todos os materiais obrigatórios estiverem preenchidos', () => {
      const { result } = renderHook(() => useBuilderNavigation(defaultProps));

      act(() => {
        result.current.setCurrentStep(2);
      });

      act(() => {
        result.current.handleNextStep();
      });

      expect(result.current.currentStep).toBe(3);
    });
  });

  describe('[Técnica: Transição de Estados - Recuo e Limite Inferior]', () => {
    it('deve recuar corretamente do Passo 3 para o Passo 2', () => {
      const { result } = renderHook(() => useBuilderNavigation(defaultProps));

      act(() => {
        result.current.setCurrentStep(3);
      });

      act(() => {
        result.current.handlePrevStep();
      });

      expect(result.current.currentStep).toBe(2);
    });

    it('não deve recuar abaixo do Passo 1', () => {
      const { result } = renderHook(() => useBuilderNavigation(defaultProps));

      act(() => {
        result.current.handlePrevStep();
      });

      expect(result.current.currentStep).toBe(1);
    });
  });

  describe('[Técnica: Transição de Estados - Navegação Direta (handleGoToStep)]', () => {
    it('deve permitir saltar para trás livremente sem validar etapas intermediárias', () => {
      const { result } = renderHook(() => useBuilderNavigation(defaultProps));

      act(() => {
        result.current.setCurrentStep(4);
      });

      act(() => {
        result.current.handleGoToStep(1);
      });

      expect(result.current.currentStep).toBe(1);
    });

    it('deve impedir avanço direto para o Passo 4 se o Passo 1 possuir erros', () => {
      const invalidProps: UseBuilderNavigationProps = {
        ...defaultProps,
        heightMm: '',
      };

      const { result } = renderHook(() => useBuilderNavigation(invalidProps));

      act(() => {
        result.current.handleGoToStep(4);
      });

      expect(result.current.currentStep).toBe(1);
    });
  });

  describe('Validação Geral Pré-Submissão (validateAllBeforeSubmit) e Reset', () => {
    it('deve retornar false e navegar para o Passo 1 quando template for nulo', () => {
      const noTemplateProps: UseBuilderNavigationProps = {
        ...defaultProps,
        template: null,
      };

      const { result } = renderHook(() => useBuilderNavigation(noTemplateProps));

      act(() => {
        const isValid = result.current.validateAllBeforeSubmit();
        expect(isValid).toBe(false);
      });
    });

    it('deve resetar a navegação de volta para o Passo 1', () => {
      const { result } = renderHook(() => useBuilderNavigation(defaultProps));

      act(() => {
        result.current.setCurrentStep(3);
        result.current.setIsMobileCadExpanded(true);
      });

      act(() => {
        result.current.resetNavigation();
      });

      expect(result.current.currentStep).toBe(1);
      expect(result.current.isMobileCadExpanded).toBe(false);
      expect(result.current.errors).toEqual({});
    });
  });
});
