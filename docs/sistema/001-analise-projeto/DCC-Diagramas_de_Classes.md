# DCC — Diagrama de Classes do Domínio

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest |
| **Versão** | 2.0 |
| **Data** | 12/08/2026 |

---

## 1. Diagrama de Classes — Domínio Principal (Catálogo)

```mermaid
classDiagram
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
        -BigDecimal laborCost
        -Boolean isActive
        -List~ProductItem~ items
    }

    class ProductItem {
        -UUID id
        -Product product
        -Material material
        -BigDecimal quantity
    }

    MaterialGroup "1" --> "*" Material
    ProductCategory "1" --> "*" Product
    Product "1" --> "*" ProductItem
    ProductItem "*" --> "1" Material
```

---

## 2. Diagrama de Classes — Services

```mermaid
classDiagram
    class MaterialGroupService {
        -MaterialGroupRepository repository
        +findAll() List~MaterialGroupResponseDTO~
        +findById(UUID id) MaterialGroupResponseDTO
    }

    class MaterialService {
        -MaterialRepository repository
        -MaterialGroupRepository groupRepository
        +findAll(Pageable) Page~MaterialResponseDTO~
        +findById(UUID id) MaterialResponseDTO
        +create(MaterialRequestDTO) MaterialResponseDTO
        +update(UUID id, MaterialRequestDTO) MaterialResponseDTO
        +delete(UUID id) void
    }

    class ProductCategoryService {
        -ProductCategoryRepository repository
        +findAll() List~ProductCategoryResponseDTO~
        +findById(UUID id) ProductCategoryResponseDTO
        +create(ProductCategoryRequestDTO) ProductCategoryResponseDTO
        +update(UUID id, ProductCategoryRequestDTO) ProductCategoryResponseDTO
        +delete(UUID id) void
    }

    class ProductService {
        -ProductRepository repository
        -ProductCategoryRepository categoryRepository
        +findAll(Pageable) Page~ProductResponseDTO~
        +findById(UUID id) ProductResponseDTO
        +create(ProductRequestDTO) ProductResponseDTO
        +update(UUID id, ProductRequestDTO) ProductResponseDTO
        +delete(UUID id) void
    }

    MaterialService --> MaterialGroupService : uses Group
    ProductService --> ProductCategoryService : uses Category
```

---

## 3. Diagrama de Classes — Principais DTOs

```mermaid
classDiagram
    class ProductRequestDTO {
        <<record>>
        +String name
        +UUID categoryId
        +BigDecimal laborCost
        +List~ProductItemRequestDTO~ items
    }

    class ProductResponseDTO {
        <<record>>
        +UUID id
        +String name
        +UUID categoryId
        +String categoryName
        +BigDecimal laborCost
        +List~ProductItemResponseDTO~ items
        +Boolean isActive
    }

    class MaterialRequestDTO {
        <<record>>
        +UUID groupId
        +String commercialReference
        +String ncmCode
        +String name
        +BigDecimal costPrice
        +BigDecimal salePrice
        +String unitMeasure
        +BigDecimal thicknessMm
        +BigDecimal standardLengthM
        +String attributesJson
    }
```

---

*Documento atualizado conforme decisões arquiteturais e refatoração do Catálogo (Agosto/2026)*
