# 📊 MER — Modelo de Dados Oficial (AlumiGest)
**Projeto:** AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias  
**Versão:** 2.0 (Alinhado com DER Genérico e Decisões da Planning em 05/08/2026)  
**SGBD:** PostgreSQL 16 com extensão `uuid-ossp`  

---

## 1. 🎯 Visão Geral da Arquitetura de Dados

O modelo de dados do AlumiGest foi projetado com foco em **extensibilidade universal (*Type-Object Pattern*)** e **desacoplamento entre Insumos Básicos e Produtos Finais Compostos**.

```mermaid
erDiagram
    tb_material_groups ||--o{ tb_materials : "categoriza (1:N)"
    tb_product_categories ||--o{ tb_products : "agrupa (1:N)"
    tb_products ||--o{ tb_product_items : "composto por (1:N)"
    tb_materials ||--o{ tb_product_items : "utilizado em (1:N)"

    tb_material_groups {
        uuid id PK
        string code UK "VIDRO, ALUMINIO, PELICULA, FERRAGEM, MDF"
        string name "Nome legível"
        enum calculation_type "SQUARE_METER, LINEAR_METER, UNIT, PAIR"
        boolean is_system_default "Blindagem dos 4 grupos Alumiportas"
        boolean is_active
    }

    tb_materials {
        uuid id PK
        uuid group_id FK
        string commercial_reference "Ref de fábrica: S83, SU-001"
        string ncm_code "Classificação fiscal"
        string name "Nome do insumo"
        decimal cost_price
        decimal sale_price
        enum unit_measure "M2, METRO, BARRA_3M, BARRA_6M, UN, PAR"
        decimal thickness_mm "2.00, 4.00, 6.00 a 15.00"
        decimal standard_length_m "3.00 ou 6.00"
        jsonb attributes_json "Extensibilidade para novos setores"
        boolean is_active
    }

    tb_product_categories {
        uuid id PK
        string name "Nome da categoria (ex: Esquadrias)"
        boolean is_active
    }

    tb_products {
        uuid id PK
        uuid category_id FK
        string name "Nome do produto final"
        decimal labor_cost "Custo de mão de obra"
        boolean is_active
    }

    tb_product_items {
        uuid id PK
        uuid product_id FK
        uuid material_id FK
        decimal quantity "Quantidade consumida na ficha técnica"
    }
```

---

## 2. 🗄️ Dicionário das Tabelas Principais

### 2.1 `tb_material_groups` (Grupos de Insumos)
* **Finalidade:** Define o tipo de insumo e a estratégia de cálculo de área, metro linear ou unidade.
* **Campos:** `id` (UUID PK), `code` (VARCHAR UK), `name` (VARCHAR), `calculation_type` (VARCHAR), `is_system_default` (BOOLEAN), `is_active` (BOOLEAN).

### 2.2 `tb_materials` (Insumos e Matérias-Primas)
* **Finalidade:** Tabela universal de insumos para vidros, perfis, películas e ferragens.
* **Campos:** `id` (UUID PK), `group_id` (UUID FK), `commercial_reference` (VARCHAR), `ncm_code` (VARCHAR), `name` (VARCHAR), `cost_price` (DECIMAL), `sale_price` (DECIMAL), `unit_measure` (VARCHAR), `thickness_mm` (DECIMAL), `standard_length_m` (DECIMAL), `attributes_json` (JSONB), `is_active` (BOOLEAN).

### 2.3 `tb_product_categories` (Categorias de Produtos)
* **Finalidade:** Agrupamento e organização dos produtos finais (ex: Esquadrias, Portas, Janelas).
* **Campos:** `id` (UUID PK), `name` (VARCHAR), `is_active` (BOOLEAN).

### 2.4 `tb_products` & `tb_product_items` (Produtos Finais e Fichas Técnicas)
* **Finalidade:** Modelagem do produto final (`tb_products`), definindo custo de mão de obra e categoria, bem como sua ficha técnica (`tb_product_items`), que é a "receita" relacionando as quantidades necessárias de cada material (`tb_materials`) para montar o produto.
* **Campos Principais:** `labor_cost` no Produto, `quantity` no Item associado.
