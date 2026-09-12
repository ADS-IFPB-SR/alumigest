import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { ProductCostSummary } from '../../../features/catalog/components/builder/ProductCostSummary'
import type { MaterialCategoryType, TemplateConfig } from '../../../features/catalog/types/templates'

describe('ProductCostSummary (Painel Lateral do Builder)', () => {
  const defaultTemplateConfig: Partial<TemplateConfig> = {
    profileMm: 20,
    aluminumColor: '#212121',
    glassColor: '#e3f2fd',
    openingDirection: 'LEFT_TO_RIGHT',
    handleConfig: { handleType: 'BAR_TUBULAR', handlePosition: 'RIGHT' },
  }

  it('deve exibir mensagem de nenhum modelo selecionado quando templateType for null', () => {
    render(
      <ProductCostSummary
        name=""
        templateType={null}
        templateConfig={{}}
        setTemplateConfig={vi.fn()}
        categoryRequirements={[]}
        onSave={vi.fn()}
        isPending={false}
        isEditing={false}
      />
    )

    expect(screen.getByText('Nenhum modelo selecionado')).toBeInTheDocument()
    expect(screen.getByText(/Selecione uma tipologia no catálogo/i)).toBeInTheDocument()
  })

  it('deve desabilitar o botão de salvar se faltar nome, template ou categorias', () => {
    const { rerender } = render(
      <ProductCostSummary
        name=""
        templateType="SLIDING_DOOR_2F"
        templateConfig={defaultTemplateConfig}
        setTemplateConfig={vi.fn()}
        categoryRequirements={['GLASS']}
        onSave={vi.fn()}
        isPending={false}
        isEditing={false}
      />
    )

    // Nome vazio -> Desabilitado
    const saveBtn = screen.getByRole('button', { name: /Salvar Nova Esquadria/i })
    expect(saveBtn).toBeDisabled()

    // Template nulo -> Desabilitado
    rerender(
      <ProductCostSummary
        name="Porta de Correr"
        templateType={null}
        templateConfig={defaultTemplateConfig}
        setTemplateConfig={vi.fn()}
        categoryRequirements={['GLASS']}
        onSave={vi.fn()}
        isPending={false}
        isEditing={false}
      />
    )
    expect(screen.getByRole('button', { name: /Salvar Nova Esquadria/i })).toBeDisabled()

    // Sem categorias -> Desabilitado
    rerender(
      <ProductCostSummary
        name="Porta de Correr"
        templateType="SLIDING_DOOR_2F"
        templateConfig={defaultTemplateConfig}
        setTemplateConfig={vi.fn()}
        categoryRequirements={[]}
        onSave={vi.fn()}
        isPending={false}
        isEditing={false}
      />
    )
    expect(screen.getByRole('button', { name: /Salvar Nova Esquadria/i })).toBeDisabled()
  })

  it('deve habilitar o botão de salvar quando todos os dados estiverem válidos e disparar onSave', () => {
    const onSave = vi.fn()

    render(
      <ProductCostSummary
        name="Porta Suprema 2 Folhas"
        templateType="SLIDING_DOOR_2F"
        templateConfig={defaultTemplateConfig}
        setTemplateConfig={vi.fn()}
        categoryRequirements={['GLASS', 'PROFILE']}
        onSave={onSave}
        isPending={false}
        isEditing={false}
      />
    )

    const saveBtn = screen.getByRole('button', { name: /Salvar Nova Esquadria/i })
    expect(saveBtn).not.toBeDisabled()

    fireEvent.click(saveBtn)
    expect(onSave).toHaveBeenCalledTimes(1)
  })

  it('deve exibir os badges de insumos requeridos', () => {
    const categories: MaterialCategoryType[] = ['GLASS', 'PROFILE', 'HARDWARE']

    render(
      <ProductCostSummary
        name="Porta Completa"
        templateType="SLIDING_DOOR_2F"
        templateConfig={defaultTemplateConfig}
        setTemplateConfig={vi.fn()}
        categoryRequirements={categories}
        onSave={vi.fn()}
        isPending={false}
        isEditing={false}
      />
    )

    const insumosHeader = screen.getByText(/Insumos Requeridos \(3\)/i)
    expect(insumosHeader).toBeInTheDocument()

    const insumosContainer = insumosHeader.parentElement!
    expect(within(insumosContainer).getByText(/^Vidro$/i)).toBeInTheDocument()
    expect(within(insumosContainer).getByText(/^Perfil$/i)).toBeInTheDocument()
    expect(within(insumosContainer).getByText(/^Ferragem$/i)).toBeInTheDocument()
  })

  it('deve exibir o texto "Atualizar Esquadria" quando isEditing for true', () => {
    render(
      <ProductCostSummary
        name="Porta Existente"
        templateType="SLIDING_DOOR_2F"
        templateConfig={defaultTemplateConfig}
        setTemplateConfig={vi.fn()}
        categoryRequirements={['GLASS']}
        onSave={vi.fn()}
        isPending={false}
        isEditing={true}
      />
    )

    expect(screen.getByRole('button', { name: /Atualizar Esquadria/i })).toBeInTheDocument()
  })
})
