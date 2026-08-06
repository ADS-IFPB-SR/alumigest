# DCC — Diagrama de Classes do Domínio

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest |
| **Versão** | 1.0 |
| **Data** | 05/08/2026 |

---

## 1. Diagrama de Classes — Módulo de Materiais

```mermaid
classDiagram
    class Vidro {
        -Long id
        -String nome
        -BigDecimal espessuraMm
        -String corAcabamento
        -BigDecimal precoMetroQuadrado
        -Integer larguraMaximaMm
        -Integer alturaMaximaMm
        -Fornecedor fornecedor
        -Boolean ativo
        +validarDimensoes(larguraCm, alturaCm) Boolean
    }

    class PerfilAluminio {
        -Long id
        -String codigo
        -String descricao
        -String linhaComercial
        -BigDecimal pesoMetroKg
        -BigDecimal precoMetroLinear
        -Integer comprimentoBarraMm
        -Fornecedor fornecedor
        -Boolean ativo
    }

    class Ferragem {
        -Long id
        -String nome
        -String codigo
        -UnidadeMedida unidadeMedida
        -BigDecimal precoUnitario
        -Fornecedor fornecedor
        -Boolean ativo
    }

    class Pelicula {
        -Long id
        -String nome
        -TipoPelicula tipo
        -BigDecimal precoMetroQuadrado
        -Boolean ativo
    }

    class TipoProduto {
        -Long id
        -String nome
        -String codigo
        -String descricao
        -Boolean usaVidro
        -Boolean usaAluminio
        -Boolean usaPelicula
        -List~ComposicaoFerragem~ ferragens
        -List~ComposicaoPerfil~ perfis
        -Boolean ativo
    }

    class ComposicaoFerragem {
        -Long id
        -TipoProduto tipoProduto
        -Ferragem ferragem
        -Integer quantidadePadrao
        -Boolean obrigatorio
    }

    class ComposicaoPerfil {
        -Long id
        -TipoProduto tipoProduto
        -PerfilAluminio perfilAluminio
        -String funcao
        -String formulaComprimento
        -Integer quantidade
    }

    class Fornecedor {
        -Long id
        -String razaoSocial
        -String cnpj
        -String telefone
        -String email
        -Boolean ativo
    }

    TipoProduto "1" --> "*" ComposicaoFerragem
    TipoProduto "1" --> "*" ComposicaoPerfil
    ComposicaoFerragem "*" --> "1" Ferragem
    ComposicaoPerfil "*" --> "1" PerfilAluminio
    Vidro "*" --> "0..1" Fornecedor
    PerfilAluminio "*" --> "0..1" Fornecedor
    Ferragem "*" --> "0..1" Fornecedor
```

---

## 2. Diagrama de Classes — Módulo de Orçamentos

```mermaid
classDiagram
    class Orcamento {
        -Long id
        -String numero
        -Cliente cliente
        -Usuario usuario
        -StatusOrcamento status
        -LocalDateTime dataCriacao
        -LocalDate dataValidade
        -BigDecimal descontoPercentual
        -BigDecimal subtotal
        -BigDecimal valorDesconto
        -BigDecimal valorTotal
        -String observacoes
        -List~ItemOrcamento~ itens
        +adicionarItem(ItemOrcamento) void
        +removerItem(Long itemId) void
        +recalcularTotais() void
        +aplicarDesconto(BigDecimal percentual) void
        +alterarStatus(StatusOrcamento novoStatus) void
        +isEditavel() Boolean
    }

    class ItemOrcamento {
        -Long id
        -Orcamento orcamento
        -TipoProduto tipoProduto
        -Vidro vidro
        -Pelicula pelicula
        -String linhaAluminio
        -BigDecimal larguraCm
        -BigDecimal alturaCm
        -Integer quantidade
        -BigDecimal areaVidroM2
        -BigDecimal custoVidro
        -BigDecimal custoAluminio
        -BigDecimal custoFerragens
        -BigDecimal custoPelicula
        -BigDecimal descontoItemPercentual
        -BigDecimal subtotalItem
        -BigDecimal totalItem
        -List~MaterialItem~ materiais
        -Integer ordem
    }

    class MaterialItem {
        -Long id
        -ItemOrcamento itemOrcamento
        -TipoMaterial tipoMaterial
        -PerfilAluminio perfilAluminio
        -Ferragem ferragem
        -String funcao
        -BigDecimal comprimentoMetros
        -BigDecimal quantidade
        -BigDecimal precoUnitario
        -BigDecimal custoTotal
    }

    class StatusOrcamento {
        <<enumeration>>
        RASCUNHO
        ENVIADO
        APROVADO
        RECUSADO
        EXPIRADO
        +podeTransitar(StatusOrcamento destino) Boolean
    }

    class TipoMaterial {
        <<enumeration>>
        PERFIL_ALUMINIO
        FERRAGEM
    }

    Orcamento "1" --> "*" ItemOrcamento
    ItemOrcamento "1" --> "*" MaterialItem
    Orcamento --> StatusOrcamento
    MaterialItem --> TipoMaterial
    Orcamento "*" --> "1" Cliente
    Orcamento "*" --> "1" Usuario
```

---

## 3. Diagrama de Classes — Services

```mermaid
classDiagram
    class OrcamentoService {
        -OrcamentoRepository repository
        -ItemOrcamentoRepository itemRepository
        -CalculoOrcamentoService calculoService
        -ClienteService clienteService
        +criar(OrcamentoRequest) OrcamentoResponse
        +adicionarItem(Long orcId, ItemRequest) ItemResponse
        +atualizarItem(Long orcId, Long itemId, ItemRequest) ItemResponse
        +removerItem(Long orcId, Long itemId) void
        +aplicarDesconto(Long orcId, BigDecimal pct) OrcamentoResponse
        +alterarStatus(Long orcId, StatusOrcamento) OrcamentoResponse
        +duplicar(Long orcId) OrcamentoResponse
        +gerarPdf(Long orcId, TipoPdf) byte[]
    }

    class CalculoOrcamentoService {
        -VidroRepository vidroRepo
        -TipoProdutoRepository tipoProdutoRepo
        +calcularItem(ItemRequest) CalculoResultado
        -calcularVidro(BigDecimal largura, BigDecimal altura, Vidro vidro, int qtd) BigDecimal
        -calcularPerfis(TipoProduto tipo, BigDecimal largura, BigDecimal altura, String linha, int qtd) List~MaterialItem~
        -calcularFerragens(TipoProduto tipo, int qtd) List~MaterialItem~
        -calcularPelicula(BigDecimal areaM2, Pelicula pelicula, int qtd) BigDecimal
    }

    class VidroService {
        -VidroRepository repository
        +listar(Pageable, filtros) Page~VidroResponse~
        +buscarPorId(Long id) VidroResponse
        +criar(VidroRequest) VidroResponse
        +atualizar(Long id, VidroRequest) VidroResponse
        +alterarStatus(Long id, Boolean ativo) void
    }

    class ClienteService {
        -ClienteRepository repository
        +listar(Pageable, busca) Page~ClienteResponse~
        +buscarPorId(Long id) ClienteResponse
        +criar(ClienteRequest) ClienteResponse
        +atualizar(Long id, ClienteRequest) ClienteResponse
        +alterarStatus(Long id, Boolean ativo) void
    }

    OrcamentoService --> CalculoOrcamentoService
    OrcamentoService --> ClienteService
```

---

## 4. Diagrama de Classes — DTOs

```mermaid
classDiagram
    class OrcamentoRequest {
        <<record>>
        +Long clienteId
        +LocalDate dataValidade
        +String observacoes
    }

    class ItemOrcamentoRequest {
        <<record>>
        +Long tipoProdutoId
        +Long vidroId
        +Long peliculaId
        +String linhaAluminio
        +BigDecimal larguraCm
        +BigDecimal alturaCm
        +Integer quantidade
        +String observacoes
    }

    class OrcamentoResponse {
        <<record>>
        +Long id
        +String numero
        +ClienteResumo cliente
        +String status
        +LocalDateTime dataCriacao
        +LocalDate dataValidade
        +List~ItemOrcamentoResponse~ itens
        +BigDecimal subtotal
        +BigDecimal descontoPercentual
        +BigDecimal valorDesconto
        +BigDecimal valorTotal
    }

    class VidroRequest {
        <<record>>
        +String nome
        +BigDecimal espessuraMm
        +String corAcabamento
        +BigDecimal precoMetroQuadrado
        +Integer larguraMaximaMm
        +Integer alturaMaximaMm
        +Long fornecedorId
    }

    class ClienteRequest {
        <<record>>
        +String nomeCompleto
        +String cpfCnpj
        +String tipoPessoa
        +String telefone
        +String email
        +String cep
        +String logradouro
        +String numero
        +String complemento
        +String bairro
        +String cidade
        +String uf
    }
```

---

## 5. Enums do Domínio

| Enum | Valores | Uso |
|---|---|---|
| `StatusOrcamento` | RASCUNHO, ENVIADO, APROVADO, RECUSADO, EXPIRADO | Status do orçamento |
| `TipoMaterial` | PERFIL_ALUMINIO, FERRAGEM | Tipo de material por item |
| `UnidadeMedida` | UNIDADE, PAR, JOGO, METRO | Unidade de medida das ferragens |
| `TipoPelicula` | JATEADO, FUME, INSULFILM, ESPELHADO, DECORATIVO | Tipo de película |
| `TipoPessoa` | PF, PJ | Pessoa física ou jurídica |
| `Perfil` (Role) | ADMINISTRADOR, VENDEDOR, PRODUCAO | Perfil de acesso do usuário |

---

*Documento elaborado pela Ítalo Jefferson / Equipe AlumiGest — IFPB CST em ADS — Agosto/2026*
