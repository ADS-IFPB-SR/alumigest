import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ProductPickerModal } from '../../../features/budgets/components/builder/ProductPickerModal'

const mockProductsData = {
  content: [
    {
      id: 'prod-1',
      name: 'Porta de Correr Suprema 2F',
      categoryName: 'Portas de Alumínio',
      templateType: 'SLIDING_DOOR_2F',
      isActive: true,
      templateConfig: { profileMm: 20, aluminumColor: '#212121', glassColor: '#e3f2fd' },
    },
    {
      id: 'prod-2',
      name: 'Janela Maxim-ar 1 Folha',
      categoryName: 'Janelas',
      templateType: 'AWNING_WINDOW_1F',
      isActive: true,
      templateConfig: { profileMm: 20, aluminumColor: '#212121', glassColor: '#e3f2fd' },
    },
    {
      id: 'prod-3',
      name: 'Box de Banheiro Frontal',
      categoryName: 'Box',
      templateType: 'SLIDING_DOOR_1F',
      isActive: true,
      templateConfig: { profileMm: 20, aluminumColor: '#212121', glassColor: '#e3f2fd' },
    },
    {
      id: 'prod-inativo',
      name: 'Produto Desativado Inativo',
      categoryName: 'Portas',
      templateType: 'SWING_DOOR_1F',
      isActive: false,
      templateConfig: { profileMm: 20 },
    },
  ],
}

vi.mock('../../../features/catalog/hooks/useCatalog', () => ({
  useProducts: () => ({
    data: mockProductsData,
    isLoading: false,
  }),
}))

describe('ProductPickerModal (Modal de Seleção de Esquadria Pré-Cadastrada)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('não deve renderizar nada quando isOpen for false', () => {
    render(
      <ProductPickerModal
        isOpen={false}
        onClose={vi.fn()}
        onSelectProduct={vi.fn()}
      />
    )

    expect(screen.queryByText(/Selecione a Esquadria do Catálogo/i)).not.toBeInTheDocument()
  })

  it('deve renderizar os produtos ativos quando isOpen for true', () => {
    render(
      <ProductPickerModal
        isOpen={true}
        onClose={vi.fn()}
        onSelectProduct={vi.fn()}
      />
    )

    expect(screen.getByText(/Selecione a Esquadria do Catálogo/i)).toBeInTheDocument()
    expect(screen.getByText('Porta de Correr Suprema 2F')).toBeInTheDocument()
    expect(screen.getByText('Janela Maxim-ar 1 Folha')).toBeInTheDocument()
    expect(screen.getByText('Box de Banheiro Frontal')).toBeInTheDocument()

    // Produto inativo não deve ser renderizado
    expect(screen.queryByText('Produto Desativado Inativo')).not.toBeInTheDocument()
  })

  it('deve fechar o modal ao pressionar a tecla Escape ou clicar no backdrop', () => {
    const onClose = vi.fn()

    render(
      <ProductPickerModal
        isOpen={true}
        onClose={onClose}
        onSelectProduct={vi.fn()}
      />
    )

    // Tecla Escape
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)

    // Backdrop
    const backdrop = screen.getByLabelText('Fechar fundo do modal')
    fireEvent.click(backdrop)
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it('deve filtrar os produtos pelo campo de busca por nome', () => {
    render(
      <ProductPickerModal
        isOpen={true}
        onClose={vi.fn()}
        onSelectProduct={vi.fn()}
      />
    )

    const searchInput = screen.getByPlaceholderText(/Buscar por nome da esquadria/i)
    fireEvent.change(searchInput, { target: { value: 'Maxim-ar' } })

    expect(screen.getByText('Janela Maxim-ar 1 Folha')).toBeInTheDocument()
    expect(screen.queryByText('Porta de Correr Suprema 2F')).not.toBeInTheDocument()
    expect(screen.queryByText('Box de Banheiro Frontal')).not.toBeInTheDocument()
  })

  it('deve filtrar os produtos ao alternar entre as abas de categoria', () => {
    render(
      <ProductPickerModal
        isOpen={true}
        onClose={vi.fn()}
        onSelectProduct={vi.fn()}
      />
    )

    // Clicar na aba Janelas
    const janelasFilterBtn = screen.getByRole('button', { name: /Janelas/i })
    fireEvent.click(janelasFilterBtn)

    expect(screen.getByText('Janela Maxim-ar 1 Folha')).toBeInTheDocument()
    expect(screen.queryByText('Porta de Correr Suprema 2F')).not.toBeInTheDocument()
    expect(screen.queryByText('Box de Banheiro Frontal')).not.toBeInTheDocument()

    // Clicar na aba Box
    const boxFilterBtn = screen.getByRole('button', { name: /Box/i })
    fireEvent.click(boxFilterBtn)

    expect(screen.getByText('Box de Banheiro Frontal')).toBeInTheDocument()
    expect(screen.queryByText('Janela Maxim-ar 1 Folha')).not.toBeInTheDocument()
  })

  it('deve disparar onSelectProduct com o id do produto ao clicar no card da esquadria', () => {
    const onSelectProduct = vi.fn()

    render(
      <ProductPickerModal
        isOpen={true}
        onClose={vi.fn()}
        onSelectProduct={onSelectProduct}
      />
    )

    // Clicar no card do primeiro produto (que é um botão acessível pelo nome)
    const productCard = screen.getByRole('button', { name: /Porta de Correr Suprema 2F/i })
    fireEvent.click(productCard)

    expect(onSelectProduct).toHaveBeenCalledWith('prod-1')
  })
})
