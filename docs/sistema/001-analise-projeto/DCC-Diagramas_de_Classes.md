# 🏗️ DCC — Diagramas de Classes do Domínio e Engenharia (AlumiGest)

| Metadado | Descrição |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Sigla** | ALG |
| **Versão** | 5.0 (Consolidado com Ordens de Serviço, Ficha Técnica, Venda Avulsa, Hub 360° e Prévia Estoque S09) |
| **Data** | 18/11/2026 |
| **Governança** | Docs-as-Code — Oficial de Governança (`alumigest-doc-governor`) |

---

## Histórico de Revisões

| Data | Versão | Descrição | Autor |
|---|---|---|---|
| 05/08/2026 | 1.0 | Versão inicial dos diagramas conceituais | Ítalo Jefferson / Equipe AlumiGest |
| 12/08/2026 | 2.0 | Ajustes de relacionamentos na Sprint 2 | Equipe AlumiGest |
| 31/08/2026 | 3.0 | Atualização preliminar da Sprint 3 com padrões Strategy e UUIDs | Equipe AlumiGest |
| 24/09/2026 | 4.0 | Revisão minuciosa e fiel ao código: `Client`, `Material`, `Product` paramétrico, OpenPDF e DTOs Records | Equipe AlumiGest (Tech Lead: Ítalo Jefferson) |
| 18/11/2026 | 5.0 | Expansão com os pacotes `orders` (O.S., Snapshot, Etiquetas, Kanban, Ficha Técnica), `partsale` (Venda Avulsa Strategy + Factory), `clients` (Hub 360° CQRS) e prévia de `stock` (Sprint 09) | Equipe AlumiGest (Tech Lead: Ítalo Jefferson) |

---

## 1. 🏛️ Modelo de Domínio Base: Clientes, Catálogo e Orçamentos

```mermaid
classDiagram
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

    class MaterialGroup {
        -UUID id
        -String code
        -String name
        -CalculationType calculationType
        -boolean isSystemDefault
        -boolean isActive
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
    }

    class Product {
        -UUID id
        -String name
        -DoorTemplateType templateType
        -TemplateConfig templateConfig
        -List~MaterialCategoryType~ categoryRequirements
        -boolean isActive
        +getCategoryName() String
    }

    class Budget {
        -UUID id
        -String code
        -Client client
        -BigDecimal subtotal
        -BigDecimal discountPercent
        -BigDecimal discountValue
        -BigDecimal total
        -BudgetStatus status
        -PaymentCondition paymentCondition
        -String paymentNotes
        -OffsetDateTime validUntil
        -List~BudgetItem~ items
    }

    class BudgetItem {
        -UUID id
        -Budget budget
        -Product product
        -String productName
        -String templateType
        -BigDecimal widthMm
        -BigDecimal heightMm
        -Integer quantity
        -BigDecimal laborCost
        -BigDecimal subtotal
        -List~BudgetItemOption~ options
    }

    class BudgetItemOption {
        -UUID id
        -BudgetItem budgetItem
        -Material material
        -String materialName
        -String unitMeasure
        -MaterialCategoryType categoryType
        -BigDecimal quantity
        -BigDecimal unitPrice
        -BigDecimal totalPrice
    }

    Client "1" --> "1" PersonType
    MaterialGroup "1" --> "*" Material
    Budget "*" --> "1" Client
    Budget "1" *-- "*" BudgetItem
    BudgetItem "*" --> "1" Product
    BudgetItem "1" *-- "*" BudgetItemOption
    BudgetItemOption "*" --> "1" Material
```

---

## 2. 📦 Domínio de Ordens de Serviço, Etiquetas e Ficha Técnica (`orders`)

```mermaid
classDiagram
    class Order {
        -UUID id
        -String codigo
        -Budget orcamento
        -Client cliente
        -String clienteNome
        -String clienteTelefone
        -String clienteEndereco
        -OrderStatus status
        -ApprovalChannel canalAprovacao
        -LocalDate dataAprovacao
        -LocalDate dataPrevisaoEntrega
        -LocalDate dataConclusao
        -BigDecimal valorBruto
        -BigDecimal valorMaoDeObra
        -BigDecimal valorDesconto
        -BigDecimal taxaInstalacao
        -BigDecimal taxaFrete
        -BigDecimal valorLiquido
        -String justificativaCancelamento
        -Boolean ativo
        -List~OrderItem~ items
    }

    class OrderItem {
        -UUID id
        -Order order
        -Product product
        -String descricao
        -Integer larguraMm
        -Integer alturaMm
        -Integer quantidade
        -String corAluminio
        -String tipoVidro
        -String orientacaoAbertura
        -String ferragens
        -BigDecimal valorUnitario
        -BigDecimal valorTotal
        -String templateConfig
        -String handleConfig
        -String drillingConfig
        -Integer ordem
        -List~OrderItemOption~ options
    }

    class OrderItemOption {
        -UUID id
        -OrderItem orderItem
        -Material material
        -String materialName
        -String unitMeasure
        -String categoryType
        -BigDecimal quantity
        -BigDecimal unitPrice
        -BigDecimal totalPrice
    }

    class OrderStatus {
        <<enumeration>>
        CREATED
        WAITING_PRODUCTION
        IN_PRODUCTION
        COMPLETED
        CANCELLED
        +canCancel() boolean
    }

    class ApprovalChannel {
        <<enumeration>>
        WHATSAPP
        PRESENCIAL
        TELEFONE
        EMAIL
        OUTRO
    }

    class FrameCalculatorStrategy {
        <<interface>>
        +supports(OrderItem item) boolean
        +calculateCuts(OrderItem item, ProductionSheetBuilder builder) void
    }

    class SupremaSlidingWindowCalculator {
        +supports(OrderItem item) boolean
        +calculateCuts(OrderItem item, ProductionSheetBuilder builder) void
    }

    class DefaultFrameCalculator {
        +supports(OrderItem item) boolean
        +calculateCuts(OrderItem item, ProductionSheetBuilder builder) void
    }

    class ProductionSheetService {
        +generateSheetData(UUID orderId) ProductionSheetResponse
    }

    class ProductionSheetPdfService {
        +generatePdf(ProductionSheetResponse data) byte[]
    }

    class OrderService {
        <<interface>>
        +convertBudgetToOrder(UUID budgetId, OrderConvertRequest req) OrderResponse
        +findAll(...) PageResponse~OrderSummaryResponse~
        +findDetailedById(UUID id) OrderResponse
        +updateStatus(UUID id, OrderStatus status) OrderResponse
        +cancelOrder(UUID id, OrderCancelRequest req) OrderResponse
        +gerarComprovanteById(UUID id) OrderPdfDTO
        +gerarEtiquetasById(UUID id, UUID itemId) OrderPdfDTO
        +gerarBplbEtiquetasById(UUID id, UUID itemId) byte[]
    }

    Order "1" *-- "*" OrderItem
    OrderItem "1" *-- "*" OrderItemOption
    Order --> OrderStatus
    Order --> ApprovalChannel
    FrameCalculatorStrategy <|.. SupremaSlidingWindowCalculator
    FrameCalculatorStrategy <|.. DefaultFrameCalculator
    ProductionSheetService --> FrameCalculatorStrategy
```

---

## 3. 🛒 Domínio de Venda Avulsa de Partes (`partsale` — US-46)

```mermaid
classDiagram
    class PartSale {
        -UUID id
        -String code
        -Client client
        -PartSaleStatus status
        -BigDecimal subtotalAmount
        -BigDecimal discountAmount
        -BigDecimal totalAmount
        -OffsetDateTime createdAt
        -OffsetDateTime updatedAt
        -List~PartSaleItem~ items
    }

    class PartSaleItem {
        -UUID id
        -PartSale partSale
        -Material material
        -MaterialCategoryType materialType
        -Integer widthMm
        -Integer heightMm
        -Integer quantity
        -BigDecimal lossFactor
        -BigDecimal calculatedUnitMeasure
        -BigDecimal unitPrice
        -BigDecimal totalPrice
    }

    class PartSaleStatus {
        <<enumeration>>
        DRAFT
        APPROVED
        CANCELLED
        +canTransitionTo(PartSaleStatus target) boolean
    }

    class PartItemCalculator {
        <<interface>>
        +getCategory() MaterialCategoryType
        +calculate(CalculatePartItemRequest request) CalculatePartItemResponse
    }

    class GlassPartCalculator {
        -BigDecimal MIN_BILLABLE_AREA = 0.2500
        +calculate(CalculatePartItemRequest request) CalculatePartItemResponse
    }

    class AluminumProfilePartCalculator {
        -int MAX_STANDARD_BAR_LENGTH_MM = 6000
        +calculate(CalculatePartItemRequest request) CalculatePartItemResponse
    }

    class FilmPartCalculator {
        +calculate(CalculatePartItemRequest request) CalculatePartItemResponse
    }

    class HardwarePartCalculator {
        +calculate(CalculatePartItemRequest request) CalculatePartItemResponse
    }

    class PartCalculatorFactory {
        -Map~MaterialCategoryType, PartItemCalculator~ calculators
        +getCalculator(MaterialCategoryType category) PartItemCalculator
    }

    class PartSaleService {
        <<interface>>
        +calculateItem(CalculatePartItemRequest req) CalculatePartItemResponse
        +create(CreatePartSaleRequest req) PartSaleResponse
        +findAll(PartSaleStatus status, String search, Pageable pageable) PageResponse~PartSaleResponse~
        +findById(UUID id) PartSaleResponse
        +updateStatus(UUID id, PartSaleStatus status) PartSaleResponse
        +generatePdf(UUID id) PartSalePdfDTO
        +generatePdfPreview(CreatePartSaleRequest req) byte[]
    }

    PartSale "1" *-- "*" PartSaleItem
    PartSale --> PartSaleStatus
    PartSale "*" --> "1" Client
    PartSaleItem "*" --> "1" Material
    PartItemCalculator <|.. GlassPartCalculator
    PartItemCalculator <|.. AluminumProfilePartCalculator
    PartItemCalculator <|.. FilmPartCalculator
    PartItemCalculator <|.. HardwarePartCalculator
    PartCalculatorFactory o-- PartItemCalculator
    PartSaleService --> PartCalculatorFactory
```

---

## 4. 👤 Hub 360° do Cliente (`clients` — US-47) & Prévia de Estoque (`stock` — Sprint 09)

```mermaid
classDiagram
    class ClientHubController {
        -ClientHubService clientHubService
        +getDashboard(UUID id) ClientDashboardDto
        +getBudgets(UUID id) List~ClientBudgetSummaryDto~
        +getOrders(UUID id) List~ClientOrderSummaryDto~
    }

    class ClientHubService {
        -ClientRepository clientRepository
        -BudgetRepository budgetRepository
        -OrderRepository orderRepository
        +getDashboard(UUID clientId) ClientDashboardDto
        +getClientBudgets(UUID clientId) List~ClientBudgetSummaryDto~
        +getClientOrders(UUID clientId) List~ClientOrderSummaryDto~
    }

    class StockItem {
        -UUID id
        -Material material
        -BigDecimal physicalQuantity
        -BigDecimal reservedQuantity
        -BigDecimal availableQuantity
        -BigDecimal minimumStock
    }

    class StockMovement {
        -UUID id
        -StockItem stockItem
        -Material material
        -UUID orderId
        -StockMovementType type
        -BigDecimal quantity
        -BigDecimal unitCost
        -BigDecimal previousPhysicalQuantity
        -BigDecimal newPhysicalQuantity
        -BigDecimal previousReservedQuantity
        -BigDecimal newReservedQuantity
        -String referenceDocument
        -String reason
        -String registeredBy
    }

    class StockPort {
        <<interface>>
        +reserveMaterialsForOrder(UUID orderId) void
        +consumeReservedMaterialsForOrder(UUID orderId) void
        +cancelReservationsForOrder(UUID orderId) void
    }

    class StockService {
        +listStockBalances(StockBalanceFilter filter) List~StockItemResponseDTO~
        +getStockBalance(UUID materialId) StockItemResponseDTO
        +listMovements(UUID materialId) List~StockMovementResponseDTO~
        +registerMovement(StockMovementRequestDTO req) StockMovementResponseDTO
    }

    ClientHubController --> ClientHubService
    StockPort <|.. StockService
    StockItem "1" *-- "*" StockMovement
    StockService --> StockItem
```

---

## 5. 🧮 Motor de Cálculo de Orçamentos & Emissão Documental (`budgets`)

```mermaid
classDiagram
    class MaterialQuantityCalculator {
        <<interface>>
        +getCategoryType() CategoryType
        +calculate(TemplateType templateType, int widthMm, int heightMm, int quantity, BigDecimal requestedMaterialQty) BigDecimal
    }
    class MaterialCalculatorFactory {
        +getCalculator(CategoryType categoryType) MaterialQuantityCalculator
    }
    class BudgetQuantityService {
        +calculateQuantities(Budget budget) void
        +previewCalculation(BudgetItemCalculationRequestDTO request) BudgetItemCalculationResponseDTO
    }
    class BudgetPricingService {
        +calculatePricing(Budget budget) void
    }
    class BudgetPdfService {
        +gerarPdfComercial(Budget budget) byte[]
        +gerarPdfTecnico(Budget budget) byte[]
        +gerarResumoWhatsApp(Budget budget) String
    }

    BudgetQuantityService --> MaterialCalculatorFactory
    MaterialCalculatorFactory o-- MaterialQuantityCalculator
```

---
*Documento homologado pelo Oficial de Governança Técnica (`alumigest-doc-governor`) em 18/11/2026.*
