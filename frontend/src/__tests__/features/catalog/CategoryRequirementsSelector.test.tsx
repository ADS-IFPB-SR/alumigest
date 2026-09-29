import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CategoryRequirementsSelector } from '../../../features/catalog/components/builder/CategoryRequirementsSelector'
import type { MaterialCategoryType } from '../../../features/catalog/types/templates'

describe('CategoryRequirementsSelector (Seletor de Insumos Requeridos)', () => {
  it('deve renderizar as 4 categorias de insumos com seus respectivos botões', () => {
    render(
      <CategoryRequirementsSelector
        templateType={null}
        selectedCategories={[]}
        setSelectedCategories={vi.fn()}
      />
    )

    expect(screen.getByRole('button', { name: /Categoria: Vidro/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Categoria: Perfil/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Categoria: Ferragem/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Categoria: Película/i })).toBeInTheDocument()
  })

  it('deve marcar o botão com aria-pressed="true" para categorias selecionadas e exibir contador', () => {
    const selected: MaterialCategoryType[] = ['GLASS', 'PROFILE']

    render(
      <CategoryRequirementsSelector
        templateType={null}
        selectedCategories={selected}
        setSelectedCategories={vi.fn()}
      />
    )

    const glassBtn = screen.getByRole('button', { name: /Categoria: Vidro/i })
    const profileBtn = screen.getByRole('button', { name: /Categoria: Perfil/i })
    const hardwareBtn = screen.getByRole('button', { name: /Categoria: Ferragem/i })

    expect(glassBtn).toHaveAttribute('aria-pressed', 'true')
    expect(profileBtn).toHaveAttribute('aria-pressed', 'true')
    expect(hardwareBtn).toHaveAttribute('aria-pressed', 'false')

    expect(screen.getByText('2 de 4 selecionadas')).toBeInTheDocument()
  })

  it('deve chamar setSelectedCategories adicionando categoria quando uma não selecionada for clicada', () => {
    const setSelected = vi.fn()
    const selected: MaterialCategoryType[] = ['GLASS']

    render(
      <CategoryRequirementsSelector
        templateType={null}
        selectedCategories={selected}
        setSelectedCategories={setSelected}
      />
    )

    const profileBtn = screen.getByRole('button', { name: /Categoria: Perfil/i })
    fireEvent.click(profileBtn)

    expect(setSelected).toHaveBeenCalledWith(['GLASS', 'PROFILE'])
  })

  it('deve chamar setSelectedCategories removendo categoria quando uma já selecionada for clicada', () => {
    const setSelected = vi.fn()
    const selected: MaterialCategoryType[] = ['GLASS', 'PROFILE', 'HARDWARE']

    render(
      <CategoryRequirementsSelector
        templateType={null}
        selectedCategories={selected}
        setSelectedCategories={setSelected}
      />
    )

    const profileBtn = screen.getByRole('button', { name: /Categoria: Perfil/i })
    fireEvent.click(profileBtn)

    expect(setSelected).toHaveBeenCalledWith(['GLASS', 'HARDWARE'])
  })

  it('deve exibir badge "Sugerido" e caixa informativa de configuração padrão quando templateType for fornecido', () => {
    render(
      <CategoryRequirementsSelector
        templateType="SLIDING_DOOR_2F"
        selectedCategories={['GLASS', 'PROFILE']}
        setSelectedCategories={vi.fn()}
      />
    )

    // SLIDING_DOOR_2F sugere GLASS, PROFILE, HARDWARE
    const suggestedBadges = screen.getAllByText('Sugerido')
    expect(suggestedBadges.length).toBeGreaterThan(0)

    expect(screen.getByText(/Configuração padrão sugerida para este modelo:/i)).toBeInTheDocument()
  })

  it('deve atualizar as sugestões dinamicamente de forma controlada quando templateType for alterado', () => {
    const setSelected = vi.fn()
    const { rerender } = render(
      <CategoryRequirementsSelector
        templateType={null}
        selectedCategories={[]}
        setSelectedCategories={setSelected}
      />
    )

    expect(screen.queryByText(/Configuração padrão sugerida para este modelo:/i)).not.toBeInTheDocument()

    // Troca para FIXED_PANEL (sugere Vidro e Perfil)
    rerender(
      <CategoryRequirementsSelector
        templateType="FIXED_PANEL"
        selectedCategories={['GLASS', 'PROFILE']}
        setSelectedCategories={setSelected}
      />
    )

    expect(screen.getByText(/Configuração padrão sugerida para este modelo:/i)).toBeInTheDocument()
    expect(screen.getByText(/Vidro \+ Perfil/i)).toBeInTheDocument()
  })
})
