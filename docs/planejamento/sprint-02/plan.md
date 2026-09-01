# ⚙️ Plano de Implementação Técnica — Sprint 02

> **Fase:** Catálogo de Materiais e Produtos  
> **Status:** 🟢 Executado e Homologado  

---

## 1. 🏛️ Constitution Check
- ✅ Pacotes `br.edu.ifpb.alumigest.catalog` e `br.edu.ifpb.alumigest.products`.
- ✅ Migrations Flyway V1 a V7.
- ✅ Records Java para DTOs e Bean Validation.
- ✅ React 18, Tailwind CSS, modais acessíveis e filtros dinâmicos.

---

## 2. 📦 Estrutura de Pacotes

```
backend/src/main/java/br/edu/ifpb/alumigest/
├── catalog/
│   ├── controller/ (GlassController, AluminumProfileController, HardwareController, FilmController)
│   ├── domain/ (Material, Glass, AluminumProfile, Hardware, Film)
│   ├── dto/ (Records DTO)
│   ├── repository/ (MaterialRepository, etc.)
│   └── service/ (GlassService, AluminumProfileService, etc.)
└── products/
    ├── controller/ (ProductController, ProductCategoryController)
    ├── domain/ (Product, ProductCategory, ProductItem)
    ├── dto/ (ProductRequestDTO, ProductResponseDTO)
    └── service/ (ProductService)
```
