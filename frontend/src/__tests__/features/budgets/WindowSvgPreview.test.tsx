import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WindowSvgPreview } from '../../../features/budgets/components/builder/WindowSvgPreview'

describe('WindowSvgPreview (Studio CAD)', () => {
  it('deve renderizar o container SVG com dimensões e aria-label', () => {
    render(
      <WindowSvgPreview
        templateType="SLIDING_DOOR_2F"
        widthMm={1600}
        heightMm={2150}
        templateName="Porta 2 Folhas"
      />
    )

    const svg = screen.getByLabelText(/Preview da esquadria 1600×2150mm/i)
    expect(svg).toBeInTheDocument()
  })

  it('deve exibir as cotas técnicas milimétricas de largura e altura', () => {
    render(
      <WindowSvgPreview
        templateType="SLIDING_DOOR_2F"
        widthMm={1800}
        heightMm={2200}
      />
    )

    expect(screen.getByText('L: 1800 mm')).toBeInTheDocument()
    expect(screen.getByText('A: 2200 mm')).toBeInTheDocument()
  })

  it('deve renderizar folha FIXA e MÓVEL para portas de correr de 2 folhas (SLIDING_DOOR_2F)', () => {
    render(
      <WindowSvgPreview
        templateType="SLIDING_DOOR_2F"
        widthMm={1600}
        heightMm={2100}
      />
    )

    expect(screen.getByText('FIXA')).toBeInTheDocument()
    expect(screen.getByText('MÓVEL')).toBeInTheDocument()
  })

  it('deve renderizar painel fixo de vidro (FIXED_PANEL) com Spider Glass', () => {
    render(
      <WindowSvgPreview
        templateType="FIXED_PANEL"
        widthMm={2000}
        heightMm={2500}
        drillingConfig={{
          holeCount: 4,
          divisionType: 'EQUAL',
          drillingPosition: 'FRONTAL',
        }}
      />
    )

    expect(screen.getByText('PAINEL FIXO DE VIDRO')).toBeInTheDocument()
    expect(screen.getByText('SISTEMA SPIDER GLASS')).toBeInTheDocument()
  })

  it('deve renderizar a cota milimétrica do puxador quando configurado como PIECE', () => {
    render(
      <WindowSvgPreview
        templateType="SLIDING_DOOR_2F"
        widthMm={1600}
        heightMm={2100}
        handleConfig={{
          handleType: 'BAR_TUBULAR',
          side: 'ONE_SIDE',
          pieceLengthCm: 40,
          coverage: 'PIECE',
        }}
      />
    )

    expect(screen.getByText('400mm')).toBeInTheDocument()
  })

  it('deve inverter a disposição da folha móvel quando openingDirection for RIGHT_TO_LEFT', () => {
    const { container: ltrContainer } = render(
      <WindowSvgPreview
        templateType="SLIDING_DOOR_2F"
        widthMm={1600}
        heightMm={2100}
        openingDirection="LEFT_TO_RIGHT"
      />
    )

    const { container: rtlContainer } = render(
      <WindowSvgPreview
        templateType="SLIDING_DOOR_2F"
        widthMm={1600}
        heightMm={2100}
        openingDirection="RIGHT_TO_LEFT"
      />
    )

    expect(ltrContainer.innerHTML).not.toEqual(rtlContainer.innerHTML)
  })

  it('deve renderizar o puxador tubular inox deitado (HORIZONTAL) com selo 2L', () => {
    const { container } = render(
      <WindowSvgPreview
        templateType="SLIDING_DOOR_2F"
        widthMm={1600}
        heightMm={2100}
        handleConfig={{
          handleType: 'BAR_TUBULAR',
          side: 'BOTH_SIDES',
          pieceLengthCm: 40,
          coverage: 'PIECE',
          orientation: 'HORIZONTAL',
          position: 'CENTER',
        }}
      />
    )

    // Cota de 400mm visível
    expect(screen.getByText('400mm')).toBeInTheDocument()
    // Identificador 2L visível
    expect(screen.getByText('2L')).toBeInTheDocument()
    // O rect horizontal deve ter height="5"
    const rects = Array.from(container.querySelectorAll('rect'))
    const horizontalHandleRect = rects.find((r) => r.getAttribute('height') === '5')
    expect(horizontalHandleRect).toBeDefined()
  })

  it('deve renderizar o perfil puxador deitado (HORIZONTAL) com cobertura TOTAL (FULL)', () => {
    const { container } = render(
      <WindowSvgPreview
        templateType="SLIDING_DOOR_2F"
        widthMm={1600}
        heightMm={2100}
        handleConfig={{
          handleType: 'PROFILE_HANDLE',
          side: 'ONE_SIDE',
          coverage: 'FULL',
          orientation: 'HORIZONTAL',
          position: 'TOP',
        }}
      />
    )

    // O rect horizontal de topo deve ter height="5"
    const rects = Array.from(container.querySelectorAll('rect'))
    const horizontalHandleRect = rects.find((r) => r.getAttribute('height') === '5')
    expect(horizontalHandleRect).toBeDefined()
  })
})
