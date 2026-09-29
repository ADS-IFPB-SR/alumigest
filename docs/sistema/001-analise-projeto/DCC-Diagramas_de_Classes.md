# 🏗️ DCC — Diagramas de Classes do Domínio e Engenharia (AlumiGest)

| Metadado | Descrição |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Sigla** | ALG |
| **Versão** | 4.0 (Revisão Completa e Auditoria Estrita com o Código-Fonte de Produção) |
| **Data** | 24/09/2026 |
| **Governança** | Docs-as-Code — Oficial de Governança (`alumigest-doc-governor`) |

---

## Histórico de Revisões

| Data | Versão | Descrição | Autor |
|---|---|---|---|
| 05/08/2026 | 1.0 | Versão inicial dos diagramas conceituais | Ítalo Jefferson / Equipe AlumiGest |
| 12/08/2026 | 2.0 | Ajustes de relacionamentos na Sprint 2 | Equipe AlumiGest |
| 31/08/2026 | 3.0 | Atualização preliminar da Sprint 3 com padrões Strategy e UUIDs | Equipe AlumiGest |
| 24/09/2026 | 4.0 | Revisão minuciosa e fiel ao código: entidade `Client`, modelo unificado `Material`, esquadrias paramétricas `Product` com JSONB, novo motor de PDF (OpenPDF) e DTOs Records | Equipe AlumiGest (Tech Lead: Ítalo Jefferson) |

---

## 1. 🏛️ Modelo de Domínio Completo (Entidades JPA)

```mermaid
classDiagram
    %% Módulo de Clientes
    class Client {
        -UUID id
        -String fullName
        -PersonType personType
        -String documentNumber
        -String phone
        -String email
        -String zipCode
        -String street
        -String number
        -String complement
        -String neighborhood
        -String city
        -String state
        -String notes
        -boolean isActive
        -OffsetDateTime createdAt
        -OffsetDateTime updatedAt
        +activate() void
        +deactivate() void
        +toggleStatus() void
    }

    class PersonType {
        <<enumeration>>
        FISICA
        JURIDICA
    }

    %% Módulo de Catálogo
    class MaterialGroup {
        -UUID id
        -String code
        -String name
        -CalculationType calculationType
        -boolean isSystemDefault
        -boolean isActive
        -OffsetDateTime createdAt
        -OffsetDateTime updatedAt
    }

    class Material {
        -UUID id
        -MaterialGroup group
        -String skuCode
        -String commercialReference
        -String ncmCode
        -String name
        -BigDecimal costPrice
        -BigDecimal salePrice
        -UnitMeasure unitMeasure
        -BigDecimal thicknessMm
        -String colorFinish
        -String familyCode
        -BigDecimal standardLengthM
        -BigDecimal maxWidthMm
        -BigDecimal maxHeightMm
        -String attributesJson
        -boolean isHandle
        -boolean isActive
        -OffsetDateTime createdAt
        -OffsetDateTime updatedAt
    }

    class Product {
        -UUID id
        -String name
        -DoorTemplateType templateType
        -TemplateConfig templateConfig
        -List~MaterialCategoryType~ categoryRequirements
        -boolean isActive
        -OffsetDateTime createdAt
        -OffsetDateTime updatedAt
        +getCategoryName() String
    }

    class DoorTemplateType {
        <<enumeration>>
        SLIDING_DOOR_1F
        SLIDING_DOOR_2F
        SLIDING_DOOR_3F
        SLIDING_DOOR_4F
        SWING_DOOR_1F
        SWING_DOOR_2F
        AWNING_WINDOW_1F
        AWNING_WINDOW_1F_INV
        FRONT_DRAWER
        FIXED_PANEL
        +getGroupName() String
    }

    %% Módulo de Orçamentos
    class Budget {
        -UUID id
        -String code
        -Client client
        -BigDecimal subtotal
        -BigDecimal discountPercent
        -BigDecimal discountValue
        -BigDecimal total
        -BudgetStatus status
        -String notes
        -PaymentCondition paymentCondition
        -String paymentNotes
        -OffsetDateTime validUntil
        -OffsetDateTime createdAt
        -OffsetDateTime updatedAt
        -List~BudgetItem~ items
        +addItem(BudgetItem item) void
        +removeItem(BudgetItem item) void
        +isExpired() boolean
    }

    class BudgetItem {
        -UUID id
        -Budget budget
        -Product product
        -String productName
        -String templateType
        -String templateConfig
        -String handleConfig
        -String drillingConfig
        -BigDecimal widthMm
        -BigDecimal heightMm
        -Integer quantity
        -BigDecimal laborCost
        -BigDecimal subtotal
        -String notes
        -List~BudgetItemOption~ options
        +addOption(BudgetItemOption option) void
        +removeOption(BudgetItemOption option) void
    }

    class BudgetItemOption {
        -UUID id
        -BudgetItem budgetItem
        -Material material
        -String materialName
        -String unitMeasure
        -MaterialCategoryType categoryType
        -String selectedType
        -String selectedColor
        -BigDecimal quantity
        -BigDecimal unitPrice
        -BigDecimal totalPrice
    }

    class BudgetStatus {
        <<enumeration>>
        DRAFT
        SENT
        APPROVED
        REJECTED
        CANCELLED
        EXPIRED
        +getDescricao() String
    }

    class PaymentCondition {
        <<enumeration>>
        A_VISTA_PIX
        ENTRADA_50_SALDO_ENTREGA
        CARTAO_12X
        A_COMBINAR
        +getDescricao() String
    }

    %% Relacionamentos
    Client "1" --> "1" PersonType : classifica
    MaterialGroup "1" --> "*" Material : categoriza
    Budget "*" --> "1" Client : pertence a
    Budget "1" --> "1" BudgetStatus : possui
    Budget "1" --> "0..1" PaymentCondition : define
    Budget "1" *-- "*" BudgetItem : compõe
    BudgetItem "*" --> "1" Product : instancia
    Product "1" --> "1" DoorTemplateType : baseia-se em
    BudgetItem "1" *-- "*" BudgetItemOption : especifica insumos
    BudgetItemOption "*" --> "1" Material : consome
```

---

## 2. 🧮 Motor de Cálculo Físico e Precificação (Padrão Strategy + Factory)

```mermaid
classDiagram
    class MaterialQuantityCalculator {
        <<interface>>
        +getCategoryType() CategoryType
        +calculate(TemplateType templateType, int widthMm, int heightMm, int quantity, BigDecimal requestedMaterialQty) BigDecimal
    }

    class GlassQuantityCalculator {
        -BigDecimal MIN_AREA = 0.25
        +getCategoryType() CategoryType
        +calculate(...) BigDecimal
    }

    class ProfileQuantityCalculator {
        +getCategoryType() CategoryType
        +calculate(...) BigDecimal
    }

    class HardwareQuantityCalculator {
        +getCategoryType() CategoryType
        +calculate(...) BigDecimal
    }

    class FilmQuantityCalculator {
        -BigDecimal MIN_AREA = 0.25
        +getCategoryType() CategoryType
        +calculate(...) BigDecimal
    }

    class MaterialCalculatorFactory {
        -Map~CategoryType, MaterialQuantityCalculator~ calculators
        +getCalculator(CategoryType categoryType) MaterialQuantityCalculator
    }

    class BudgetQuantityService {
        -MaterialCalculatorFactory calculatorFactory
        -MaterialRepository materialRepository
        -ProductRepository productRepository
        +calculateQuantities(Budget budget) void
        +previewCalculation(BudgetItemCalculationRequestDTO request) BudgetItemCalculationResponseDTO
    }

    class BudgetPricingService {
        -MaterialRepository materialRepository
        +calculatePricing(Budget budget) void
    }

    MaterialQuantityCalculator <|.. GlassQuantityCalculator
    MaterialQuantityCalculator <|.. ProfileQuantityCalculator
    MaterialQuantityCalculator <|.. HardwareQuantityCalculator
    MaterialQuantityCalculator <|.. FilmQuantityCalculator
    MaterialCalculatorFactory o-- MaterialQuantityCalculator
    BudgetQuantityService --> MaterialCalculatorFactory
    BudgetPricingService --> MaterialRepository
```

---

## 3. 📄 Motor de Emissão Documental e Relatórios (OpenPDF)

```mermaid
classDiagram
    class BudgetPdfService {
        -CompanyProperties companyProperties
        +gerarPdfComercial(Budget budget) byte[]
        +gerarPdfTecnico(Budget budget) byte[]
        +gerarResumoWhatsApp(Budget budget) String
    }

    class BudgetPdfPageEvent {
        -CompanyProperties companyProperties
        -PdfTemplate totalPages
        +onEndPage(PdfWriter writer, Document document) void
        +onCloseDocument(PdfWriter writer, Document document) void
    }

    class TechnicalPdfPageEvent {
        -CompanyProperties companyProperties
        -PdfTemplate totalPages
        +onEndPage(PdfWriter writer, Document document) void
        +onCloseDocument(PdfWriter writer, Document document) void
    }

    class CompanyProperties {
        -String name
        -String cnpj
        -String phone
        -String email
        -String address
    }

    class BudgetCodeGenerator {
        -BudgetRepository budgetRepository
        +generateCode() String
    }

    class BudgetPdfDTO {
        <<record>>
        +byte[] bytes
        +String filename
    }

    BudgetPdfService --> BudgetPdfPageEvent : utiliza na via cliente
    BudgetPdfService --> TechnicalPdfPageEvent : utiliza na via oficina
    BudgetPdfService --> CompanyProperties : dados cadastrais
    BudgetPdfService ..> BudgetPdfDTO : encapsula resposta
```

---

## 4. ⚙️ Camada de Serviços da Aplicação (Services)

```mermaid
classDiagram
    class ClientService {
        -ClientRepository clientRepository
        -ClientMapper clientMapper
        +findAll(String busca, Pageable pageable) PageResponse~ClientResponseDTO~
        +findById(UUID id) ClientResponseDTO
        +create(ClientRequestDTO request) ClientResponseDTO
        +update(UUID id, ClientRequestDTO request) ClientResponseDTO
        +delete(UUID id) void
    }

    class ProductService {
        -ProductRepository productRepository
        -ProductMapper productMapper
        +findAll(Pageable pageable) PageResponse~ProductResponseDTO~
        +findById(UUID id) ProductResponseDTO
        +create(ProductRequestDTO request) ProductResponseDTO
        +update(UUID id, ProductRequestDTO request) ProductResponseDTO
        +delete(UUID id) void
    }

    class BudgetService {
        -BudgetRepository budgetRepository
        -ClientRepository clientRepository
        -ProductRepository productRepository
        -MaterialRepository materialRepository
        -BudgetMapper budgetMapper
        -BudgetQuantityService budgetQuantityService
        -BudgetPricingService budgetPricingService
        -BudgetCodeGenerator budgetCodeGenerator
        -BudgetPdfService budgetPdfService
        +create(BudgetCreateRequest request) BudgetResponseDTO
        +findAll(Pageable pageable) PageResponse~BudgetSummaryResponseDTO~
        +findById(UUID id) BudgetResponseDTO
        +aplicarDesconto(UUID id, DiscountRequest request) BudgetResponseDTO
        +alterarStatus(UUID id, StatusChangeRequest request) BudgetResponseDTO
        +adicionarItem(UUID id, BudgetItemRequestDTO request) BudgetItemResponseDTO
        +gerarPdfComercial(UUID id) BudgetPdfDTO
        +gerarPdfTecnico(UUID id) BudgetPdfDTO
        +gerarResumoWhatsApp(UUID id) String
        +delete(UUID id) void
    }

    BudgetService --> ClientService : valida cliente
    BudgetService --> ProductService : valida template
    BudgetService --> BudgetQuantityService : resolve dimensões
    BudgetService --> BudgetPricingService : calcula totais
    BudgetService --> BudgetPdfService : gera PDFs
    BudgetService --> BudgetCodeGenerator : gera sequencial
```

---

## 5. 📦 Catálogo de DTOs Records de Entrada e Saída

```mermaid
classDiagram
    class BudgetCreateRequest {
        <<record>>
        +UUID clientId
        +String observacoes
        +BigDecimal descontoPercentual
        +PaymentCondition condicaoPagamento
        +LocalDate dataValidade
        +List~BudgetItemCreateRequest~ itens
    }

    class BudgetItemCreateRequest {
        <<record>>
        +UUID productId
        +BigDecimal larguraMm
        +BigDecimal alturaMm
        +Integer quantidade
        +BigDecimal valorUnitario
        +String ferragens
        +String descricao
    }

    class DiscountRequest {
        <<record>>
        +DiscountType tipo
        +BigDecimal valor
        +PaymentCondition condicaoPagamento
        +String observacoesPagamento
        +LocalDate dataValidade
    }

    class StatusChangeRequest {
        <<record>>
        +BudgetStatus status
    }

    class BudgetResponseDTO {
        <<record>>
        +UUID id
        +String code
        +ClientSummaryDTO client
        +BigDecimal subtotal
        +BigDecimal discountPercent
        +BigDecimal discountValue
        +BigDecimal total
        +BudgetStatus status
        +PaymentCondition paymentCondition
        +String paymentNotes
        +OffsetDateTime validUntil
        +List~BudgetItemResponseDTO~ items
        +OffsetDateTime createdAt
    }

    class BudgetSummaryResponseDTO {
        <<record>>
        +UUID id
        +String code
        +String clientName
        +BigDecimal total
        +BudgetStatus status
        +PaymentCondition paymentCondition
        +OffsetDateTime validUntil
        +OffsetDateTime createdAt
    }

    BudgetCreateRequest *-- BudgetItemCreateRequest
```

---
*Documento homologado pelo Oficial de Governança Técnica (`alumigest-doc-governor`) em 24/09/2026.*
