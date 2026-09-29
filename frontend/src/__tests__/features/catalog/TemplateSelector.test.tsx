import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TemplateSelector } from '../../../features/catalog/components/builder/TemplateSelector'
import { DOOR_TEMPLATE_LABELS, DOOR_TEMPLATE_GROUPS } from '../../../features/catalog/types/templates'

describe('TemplateSelector (Seletor de Modelos de Esquadria)', () => {
  it('deve renderizar inicialmente todos os 10 modelos de esquadria e suas abas de filtro', () => {
    render(
      <TemplateSelector
        templateType={null}
        setTemplateType={vi.fn()}
      />
    )

    // Aba "Todos"
    expect(screen.getByRole('button', { name: /Todos \(10\)/i })).toBeInTheDocument()

    // Modelos oficiais devem estar presentes na tela
    expect(screen.getByRole('button', { name: /Selecionar modelo Porta \/ Janela de Correr 2 Folhas/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Selecionar modelo Janela Maxim-Ar \/ Basculante/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Selecionar modelo Painel Fixo \/ Fachada em Vidro/i })).toBeInTheDocument()
  })

  it('deve filtrar os modelos exibidos ao clicar na aba de categoria', () => {
    render(
      <TemplateSelector
        templateType={null}
        setTemplateType={vi.fn()}
      />
    )

    // Filtrar pelo grupo 'others' (Móveis / Painéis: FRONT_DRAWER e FIXED_PANEL)
    const othersGroup = DOOR_TEMPLATE_GROUPS.find(g => g.id === 'others')
    expect(othersGroup).toBeDefined()

    const othersFilterBtn = screen.getByRole('button', { name: new RegExp(othersGroup!.label, 'i') })
    fireEvent.click(othersFilterBtn)

    // Móveis e painéis devem estar visíveis
    expect(screen.getByRole('button', { name: /Selecionar modelo Painel Fixo \/ Fachada em Vidro/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Selecionar modelo Frente de Gaveta em Alumínio/i })).toBeInTheDocument()

    // Portas de correr e janelas maxim-ar NÃO devem estar visíveis após o filtro
    expect(screen.queryByRole('button', { name: /Selecionar modelo Porta \/ Janela de Correr 2 Folhas/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Selecionar modelo Janela Maxim-Ar \/ Basculante/i })).not.toBeInTheDocument()

    // Voltar para "Todos"
    const allFilterBtn = screen.getByRole('button', { name: /Todos \(10\)/i })
    fireEvent.click(allFilterBtn)

    expect(screen.getByRole('button', { name: /Selecionar modelo Porta \/ Janela de Correr 2 Folhas/i })).toBeInTheDocument()
  })

  it('deve chamar setTemplateType ao clicar no card de um modelo', () => {
    const setTemplateType = vi.fn()

    render(
      <TemplateSelector
        templateType={null}
        setTemplateType={setTemplateType}
      />
    )

    const sliding4fCard = screen.getByRole('button', { name: /Selecionar modelo Porta \/ Janela de Correr 4 Folhas/i })
    fireEvent.click(sliding4fCard)

    expect(setTemplateType).toHaveBeenCalledWith('SLIDING_DOOR_4F')
  })

  it('deve indicar visualmente o modelo selecionado no card e no cabeçalho', () => {
    render(
      <TemplateSelector
        templateType="SWING_DOOR_1F"
        setTemplateType={vi.fn()}
      />
    )

    // Card selecionado deve ter aria-pressed="true"
    const selectedCard = screen.getByRole('button', { name: /Selecionar modelo Porta de Giro 1 Folha/i })
    expect(selectedCard).toHaveAttribute('aria-pressed', 'true')

    // Card não selecionado deve ter aria-pressed="false"
    const unselectedCard = screen.getByRole('button', { name: /Selecionar modelo Porta \/ Janela de Correr 2 Folhas/i })
    expect(unselectedCard).toHaveAttribute('aria-pressed', 'false')

    // Header e card devem conter o nome do modelo selecionado (2 ocorrências)
    expect(screen.getAllByText(DOOR_TEMPLATE_LABELS['SWING_DOOR_1F'])).toHaveLength(2)
    expect(screen.getByText('check_circle')).toBeInTheDocument()
  })
})
