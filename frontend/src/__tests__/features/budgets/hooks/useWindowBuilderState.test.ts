import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useWindowBuilderState } from '../../../../features/budgets/components/builder/hooks/useWindowBuilderState'
import type { DoorTemplateType } from '../../../../features/budgets/types'

// Referências constantes estáveis para evitar re-renders infinitos
const mockProductsData = {
  content: [
    {
      id: 'prod-1',
      name: 'Porta de Correr 2 Folhas',
      templateType: 'SLIDING_DOOR_2F' as DoorTemplateType,
      isActive: true,
      categoryRequirements: ['GLASS', 'PROFILE', 'HARDWARE'],
      templateConfig: {
        aluminumColor: '#212121',
        glassColor: '#e3f2fd',
        profileMm: 20,
        openingDirection: 'LEFT_TO_RIGHT',
      },
    },
    {
      id: 'prod-2',
      name: 'Porta Pivotante',
      templateType: 'PIVOTING_DOOR' as DoorTemplateType,
      isActive: true,
      categoryRequirements: ['GLASS', 'PROFILE'],
      templateConfig: {
        aluminumColor: '#FFFFFF',
        glassColor: '#595959',
        profileMm: 45,
      },
    },
  ],
}

const emptyData = { content: [] }
const mockHardwaresData = {
  content: [
    {
      id: 'hw-1',
      name: 'Puxador Tubular Inox 40cm',
      salePrice: 120,
      unitMeasure: 'un',
    },
  ],
}

// Mock dos hooks de catálogo com retornos estáveis
vi.mock('../../../../features/catalog/hooks/useCatalog', () => ({
  useProducts: () => ({ data: mockProductsData, isLoading: false }),
  useGlasses: () => ({ data: emptyData, isLoading: false }),
  useProfiles: () => ({ data: emptyData, isLoading: false }),
  useHardwares: () => ({ data: mockHardwaresData, isLoading: false }),
  useFilms: () => ({ data: emptyData, isLoading: false }),
}))

// Mock de toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('useWindowBuilderState (Hook do Studio CAD)', () => {
  const onAddItem = vi.fn()
  const onClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve inicializar com dimensões padrão de 1600 x 2150 mm e template inicial', () => {
    const { result } = renderHook(() =>
      useWindowBuilderState({
        isOpen: true,
        onAddItem,
        onClose,
      })
    )

    expect(result.current.state.widthMm).toBe(1600)
    expect(result.current.state.heightMm).toBe(2150)
    expect(result.current.currentStep).toBe(1)
    expect(result.current.svgW).toBe(1600)
    expect(result.current.svgH).toBe(2150)
    expect(result.current.unitAreaM2).toBe('3.44') // (1.6 * 2.15)
  })

  it('deve atualizar largura e altura no estado através de setState', () => {
    const { result } = renderHook(() =>
      useWindowBuilderState({
        isOpen: true,
        onAddItem,
        onClose,
      })
    )

    act(() => {
      result.current.setState((prev) => ({
        ...prev,
        widthMm: 1800,
        heightMm: 2200,
      }))
    })

    expect(result.current.state.widthMm).toBe(1800)
    expect(result.current.state.heightMm).toBe(2200)
    expect(result.current.unitAreaM2).toBe('3.96')
  })

  it('deve alternar as opções de puxador via handlers dedicados', () => {
    const { result } = renderHook(() =>
      useWindowBuilderState({
        isOpen: true,
        onAddItem,
        onClose,
      })
    )

    act(() => {
      result.current.handleHandleTypeChange('SHELL_LOCK')
      result.current.handleHandleSideChange('BOTH_SIDES')
      result.current.handleHandleCoverageChange('PIECE')
      result.current.handleHandlePieceLengthChange(50)
    })

    expect(result.current.state.handleConfig.handleType).toBe('SHELL_LOCK')
    expect(result.current.state.handleConfig.side).toBe('BOTH_SIDES')
    expect(result.current.state.handleConfig.coverage).toBe('PIECE')
    expect(result.current.state.handleConfig.pieceLengthCm).toBe(50)
  })

  it('deve atualizar a configuração de furação e quantidade de furos', () => {
    const { result } = renderHook(() =>
      useWindowBuilderState({
        isOpen: true,
        onAddItem,
        onClose,
      })
    )

    act(() => {
      result.current.handleHoleCountChange(3)
    })

    act(() => {
      result.current.handleDivisionTypeChange('CUSTOM_DISTANCE')
    })

    expect(result.current.state.drillingConfig.holeCount).toBe(3)
    expect(result.current.state.drillingConfig.divisionType).toBe('CUSTOM_DISTANCE')
    expect(result.current.state.drillingConfig.customDistancesMm).toHaveLength(3)
  })

  it('deve navegar entre as etapas do wizard com validação', () => {
    const { result } = renderHook(() =>
      useWindowBuilderState({
        isOpen: true,
        onAddItem,
        onClose,
      })
    )

    expect(result.current.currentStep).toBe(1)

    act(() => {
      result.current.handleNextStep()
    })

    expect(result.current.currentStep).toBe(2)

    act(() => {
      result.current.handlePrevStep()
    })

    expect(result.current.currentStep).toBe(1)
  })

  it('[Transição de Estados] deve transitar puxador para NONE quando a ferragem for removida (#335)', () => {
    const { result } = renderHook(() =>
      useWindowBuilderState({
        isOpen: true,
        onAddItem,
        onClose,
      })
    )

    // O template inicial prod-1 possui HARDWARE nos categoryRequirements
    const hardwareSel = result.current.state.materialSelections.find(
      (s) => s.categoryType === 'HARDWARE'
    )
    expect(hardwareSel).toBeDefined()
    expect(hardwareSel?.isOptional).toBe(true)

    // Ao remover o insumo de ferragem via handleRemoveMaterial
    act(() => {
      result.current.handleRemoveMaterial(hardwareSel!.requirementId)
    })

    // A ferragem deve ter sido eliminada de materialSelections
    expect(
      result.current.state.materialSelections.find((s) => s.categoryType === 'HARDWARE')
    ).toBeUndefined()

    // O puxador deve transitar automaticamente para 'NONE'
    expect(result.current.state.handleConfig.handleType).toBe('NONE')
  })

  it('[Transição de Estados] deve adicionar ferragem à lista ao selecionar puxador que a exige após ter sido removida (#335)', () => {
    const { result } = renderHook(() =>
      useWindowBuilderState({
        isOpen: true,
        onAddItem,
        onClose,
      })
    )

    const hardwareSel = result.current.state.materialSelections.find(
      (s) => s.categoryType === 'HARDWARE'
    )
    if (hardwareSel) {
      act(() => {
        result.current.handleRemoveMaterial(hardwareSel.requirementId)
      })
    }

    expect(result.current.state.handleConfig.handleType).toBe('NONE')

    // Usuário no Step 3 decide escolher puxador Tubular
    act(() => {
      result.current.handleHandleTypeChange('BAR_TUBULAR')
    })

    expect(result.current.state.handleConfig.handleType).toBe('BAR_TUBULAR')
    const addedHw = result.current.state.materialSelections.find(
      (s) => s.categoryType === 'HARDWARE'
    )
    expect(addedHw).toBeDefined()
    expect(addedHw?.materialId).toBe('hw-1')
  })

  it('[Análise de Valor Limite] deve permitir quantidade 0 de ferragem com flexibilidade (#335)', () => {
    const { result } = renderHook(() =>
      useWindowBuilderState({
        isOpen: true,
        onAddItem,
        onClose,
      })
    )

    const hardwareSel = result.current.state.materialSelections.find(
      (s) => s.categoryType === 'HARDWARE'
    )
    expect(hardwareSel).toBeDefined()

    act(() => {
      result.current.handleMaterialQtyChange(hardwareSel!.requirementId, '0')
    })

    const updatedHw = result.current.state.materialSelections.find(
      (s) => s.requirementId === hardwareSel!.requirementId
    )
    expect(updatedHw?.quantity).toBe(0)
    expect(updatedHw?.totalPrice).toBe(0)
  })
})
