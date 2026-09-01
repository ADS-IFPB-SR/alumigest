# DCC — Diagrama de Classes do Domínio
**Projeto:** AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias  
**Sigla:** ALG  
**Versão:** 3.0 (Atualizado com Domínios de Clientes, Templates Paramétricos, Orçamentos e Motor Strategy)  
**Data:** 31/08/2026  
**Autor:** Equipe de Engenharia de Software (Scrum Master: Italo Santos)  

---

## 1. 🏗️ Diagrama de Classes — Modelo de Domínio Completo

```mermaid
classDiagram
    %% Módulo de Clientes
    class Client {
        -UUID id
        -String name
        -PersonType personType
        -String cpfCnpj
        -String phone
        -String email
        -String address
        -String notes
        -Boolean isActive
        -LocalDateTime createdAt
        -LocalDateTime updatedAt
    }

    %% Módulo de Catálogo
    class MaterialGroup {
        -UUID id
        -String code
        -String name
        -CalculationType calculationType
        -Boolean isSystemDefault
        -Boolean isActive
    }

    class Material {
        -UUID id
        -MaterialGroup materialGroup
        -String commercialReference
        -String ncmCode
        -String name
        -BigDecimal costPrice
        -BigDecimal salePrice
        -UnitMeasure unitMeasure
        -BigDecimal thicknessMm
        -BigDecimal standardLengthM
        -String attributesJson
        -Boolean isActive
    }

    class ProductCategory {
        -UUID id
        -String name
        -Boolean isActive
    }

    class Product {
        -UUID id
        -ProductCategory category
        -String name
        -TemplateType templateType
        -String templateConfig
        -String categoryRequirements
        -Boolean isActive
    }

    %% Módulo de Orçamentos
    class Budget {
        -UUID id
        -String code
        -Client client
        -BudgetStatus status
        -BigDecimal subtotal
        -BigDecimal discountPercent
        -BigDecimal discountValue
        -BigDecimal total
        -String notes
        -LocalDateTime validUntil
        -LocalDateTime createdAt
        -LocalDateTime updatedAt
        -List~BudgetItem~ items
    }

    class BudgetItem {
        -UUID id
        -Budget budget
        -Product product
        -Integer width
        -Integer height
        -Integer quantity
        -BigDecimal laborCost
        -BigDecimal subtotal
        -String notes
        -List~BudgetItemOption~ options
    }

    class BudgetItemOption {
        -UUID id
        -BudgetItem item
        -Material material
        -CategoryType categoryType
        -UnitMeasure unitMeasure
        -BigDecimal quantity
        -BigDecimal unitPrice
        -BigDecimal totalPrice
    }

    %% Relacionamentos
    MaterialGroup "1" --> "*" Material : agrupa
    ProductCategory "1" --> "*" Product : categoriza
    Client "1" --> "*" Budget : solicita
    Budget "1" *-- "*" BudgetItem : compõe
    BudgetItem "*" --> "1" Product : instancia template
    BudgetItem "1" *-- "*" BudgetItemOption : seleciona insumos
    BudgetItemOption "*" --> "1" Material : referencia
```

---

## 2. 🧮 Diagrama de Classes — Motor de Cálculo (Padrão Strategy + Factory)

```mermaid
classDiagram
    class QuantityCalculatorStrategy {
        <<interface>>
        +supports(CategoryType categoryType) boolean
        +calculateQuantity(TemplateType templateType, Integer widthMm, Integer heightMm, BudgetItemOption option) BigDecimal
    }

    class GlassQuantityCalculator {
        +calculateQuantity(...) BigDecimal
    }

    class ProfileQuantityCalculator {
        +calculateQuantity(...) BigDecimal
    }

    class HardwareQuantityCalculator {
        +calculateQuantity(...) BigDecimal
    }

    class FilmQuantityCalculator {
        +calculateQuantity(...) BigDecimal
    }

    class QuantityCalculatorFactory {
        -List~QuantityCalculatorStrategy~ strategies
        +getStrategy(CategoryType categoryType) QuantityCalculatorStrategy
    }

    class BudgetPricingService {
        -QuantityCalculatorFactory calculatorFactory
        +calculateItemTotals(BudgetItem item) void
        +calculateBudgetTotals(Budget budget) void
    }

    QuantityCalculatorStrategy <|.. GlassQuantityCalculator
    QuantityCalculatorStrategy <|.. ProfileQuantityCalculator
    QuantityCalculatorStrategy <|.. HardwareQuantityCalculator
    QuantityCalculatorStrategy <|.. FilmQuantityCalculator
    QuantityCalculatorFactory o-- QuantityCalculatorStrategy
    BudgetPricingService --> QuantityCalculatorFactory
```

---

## 3. ⚙️ Diagrama de Classes — Camada de Serviços (Services)

```mermaid
classDiagram
    class ClientService {
        -ClientRepository clientRepository
        +findAll(String busca, Pageable) PageResponse~ClientResponseDTO~
        +findById(UUID id) ClientResponseDTO
        +create(ClientRequestDTO) ClientResponseDTO
        +update(UUID id, ClientRequestDTO) ClientResponseDTO
        +delete(UUID id) void
    }

    class MaterialService {
        -MaterialRepository repository
        -MaterialGroupRepository groupRepository
        +findAll(Pageable) PageResponse~MaterialResponseDTO~
        +findById(UUID id) MaterialResponseDTO
        +create(MaterialRequestDTO) MaterialResponseDTO
        +update(UUID id, MaterialRequestDTO) MaterialResponseDTO
        +updateStatus(UUID id, boolean status) void
    }

    class ProductService {
        -ProductRepository productRepository
        -ProductCategoryRepository categoryRepository
        +findAll(Pageable) PageResponse~ProductResponseDTO~
        +findById(UUID id) ProductResponseDTO
        +create(ProductRequestDTO) ProductResponseDTO
        +update(UUID id, ProductRequestDTO) ProductResponseDTO
        +delete(UUID id) void
    }

    class BudgetService {
        -BudgetRepository budgetRepository
        -ClientRepository clientRepository
        -ProductRepository productRepository
        -MaterialRepository materialRepository
        -BudgetPricingService pricingService
        +create(BudgetRequestDTO) BudgetResponseDTO
        +findAll(String busca, BudgetStatus status, Pageable) PageResponse~BudgetSummaryResponseDTO~
        +findById(UUID id) BudgetResponseDTO
        +update(UUID id, BudgetRequestDTO) BudgetResponseDTO
        +recalculate(UUID id) BudgetResponseDTO
        +updateStatus(UUID id, BudgetStatusUpdateDTO) void
        +delete(UUID id) void
    }

    BudgetService --> ClientService : valida cliente
    BudgetService --> ProductService : valida template
    BudgetService --> BudgetPricingService : executa cálculo
```

---

## 4. 📦 Diagrama de Classes — DTOs Principais

```mermaid
classDiagram
    class BudgetRequestDTO {
        <<record>>
        +UUID clientId
        +BigDecimal discountPercent
        +BigDecimal discountValue
        +String notes
        +List~BudgetItemRequestDTO~ items
    }

    class BudgetItemRequestDTO {
        <<record>>
        +UUID productId
        +Integer width
        +Integer height
        +Integer quantity
        +BigDecimal laborCost
        +String notes
        +List~BudgetItemOptionRequestDTO~ options
    }

    class BudgetItemOptionRequestDTO {
        <<record>>
        +UUID materialId
        +CategoryType categoryType
        +BigDecimal unitPrice
    }

    class BudgetResponseDTO {
        <<record>>
        +UUID id
        +String code
        +ClientSummaryDTO client
        +BudgetStatus status
        +BigDecimal subtotal
        +BigDecimal discountPercent
        +BigDecimal discountValue
        +BigDecimal total
        +List~BudgetItemResponseDTO~ items
        +LocalDateTime createdAt
    }

    BudgetRequestDTO *-- BudgetItemRequestDTO
    BudgetItemRequestDTO *-- BudgetItemOptionRequestDTO
```

---

*Documento de Classes homologado com o código da Sprint 3 — Versão 3.0 — 31/08/2026*
