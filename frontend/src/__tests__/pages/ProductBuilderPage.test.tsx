import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProductBuilderPage } from '../../pages/ProductBuilderPage'

// Mock de navegação
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock de React Hot Toast
vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

// Mocks de dados e mutations do useCatalog
const mockCreateProduct = vi.fn()
const mockUpdateProduct = vi.fn()
let mockProductByIdData: any = null

vi.mock('../../features/catalog/hooks/useCatalog', () => ({
  useProductById: (id?: string) => ({
    data: id ? mockProductByIdData : null,
    isLoading: false,
  }),
  useCreateProduct: () => ({
    mutate: mockCreateProduct,
    isPending: false,
  }),
  useUpdateProduct: () => ({
    mutate: mockUpdateProduct,
    isPending: false,
  }),
}))

function renderBuilder(route = '/produtos/novo') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/produtos/novo" element={<ProductBuilderPage />} />
          <Route path="/produtos/editar/:id" element={<ProductBuilderPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('ProductBuilderPage (Página Construtora de Esquadria / Produto)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockProductByIdData = null
  })

  describe('Modo Criação (/produtos/novo)', () => {
    it('deve renderizar a página em modo de criação com campos vazios e botão desabilitado', () => {
      renderBuilder('/produtos/novo')

      expect(screen.getByText('Nova Esquadria')).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/Ex: Porta de Correr 2 Folhas Prime/i)).toHaveValue('')

      // O botão de salvar deve estar desabilitado
      const saveBtn = screen.getByRole('button', { name: /Salvar Nova Esquadria/i })
      expect(saveBtn).toBeDisabled()

      // Validações visíveis no painel lateral
      expect(screen.getByText(/Pendências para salvar:/i)).toBeInTheDocument()
      expect(screen.getByText('Preencha o nome comercial')).toBeInTheDocument()
      expect(screen.getByText('Selecione um modelo de esquadria')).toBeInTheDocument()
    })

    it('deve preencher o formulário, selecionar modelo e disparar createProduct com payload correto', () => {
      renderBuilder('/produtos/novo')

      // 1. Preencher nome comercial
      const nameInput = screen.getByPlaceholderText(/Ex: Porta de Correr 2 Folhas Prime/i)
      fireEvent.change(nameInput, { target: { value: 'Porta Linha Gold 2F' } })

      // 2. Selecionar modelo de esquadria
      const templateBtn = screen.getByRole('button', { name: /Selecionar modelo Porta \/ Janela de Correr 2 Folhas/i })
      fireEvent.click(templateBtn)

      // 3. O botão de salvar deve passar a estar habilitado
      const saveBtn = screen.getByRole('button', { name: /Salvar Nova Esquadria/i })
      expect(saveBtn).not.toBeDisabled()

      // 4. Clicar em salvar
      fireEvent.click(saveBtn)

      expect(mockCreateProduct).toHaveBeenCalledTimes(1)
      expect(mockCreateProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Porta Linha Gold 2F',
          templateType: 'SLIDING_DOOR_2F',
          categoryRequirements: expect.arrayContaining(['GLASS', 'PROFILE', 'HARDWARE']),
          templateConfig: expect.objectContaining({
            templateType: 'SLIDING_DOOR_2F',
            profileMm: 20,
          }),
        }),
        expect.any(Object)
      )
    })
  })

  describe('Modo Edição (/produtos/editar/:id)', () => {
    it('deve carregar os dados existentes do produto e disparar updateProduct ao salvar', () => {
      mockProductByIdData = {
        id: 'prod-456',
        name: 'Janela Maxim-ar Gold',
        templateType: 'AWNING_WINDOW_1F',
        categoryRequirements: ['GLASS', 'PROFILE', 'HARDWARE'],
        templateConfig: {
          profileMm: 25,
          aluminumColor: '#212121',
          glassColor: '#e3f2fd',
          openingDirection: 'OUTSIDE',
        },
      }

      renderBuilder('/produtos/editar/prod-456')

      // Cabeçalho deve refletir edição
      expect(screen.getByText('Editar Esquadria')).toBeInTheDocument()

      // Nome deve estar preenchido
      const nameInput = screen.getByPlaceholderText(/Ex: Porta de Correr 2 Folhas Prime/i)
      expect(nameInput).toHaveValue('Janela Maxim-ar Gold')

      // Botão de atualizar deve estar disponível
      const updateBtn = screen.getByRole('button', { name: /Atualizar Esquadria/i })
      expect(updateBtn).not.toBeDisabled()

      // Alterar nome
      fireEvent.change(nameInput, { target: { value: 'Janela Maxim-ar Gold V2' } })

      // Disparar atualização
      fireEvent.click(updateBtn)

      expect(mockUpdateProduct).toHaveBeenCalledTimes(1)
      expect(mockUpdateProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'prod-456',
          data: expect.objectContaining({
            name: 'Janela Maxim-ar Gold V2',
            templateType: 'AWNING_WINDOW_1F',
          }),
        }),
        expect.any(Object)
      )
    })
  })
})
