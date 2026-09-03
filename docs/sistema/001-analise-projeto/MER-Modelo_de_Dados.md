# 📊 MER — Modelo de Dados Oficial (AlumiGest)
**Projeto:** AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias  
**Versão:** 3.0 (Consolidado com Clientes, Orçamentos, Templates Paramétricos e Migrations V1-V10)  
**Data:** 31 de Agosto de 2026  
**SGBD:** PostgreSQL 16 com extensão `uuid-ossp`  
**Autor:** Equipe de Engenharia AlumiGest (Scrum Master: Italo Santos)  

---

## 1. 🎯 Visão Geral da Arquitetura de Dados

O modelo de dados do AlumiGest foi projetado com foco em **extensibilidade universal (*Type-Object Pattern*)**, **templates de esquadrias paramétricas** e **cálculo dinâmico de propostas comerciais**.

```mermaid
erDiagram
    tb_material_groups ||--o{ tb_materials : "categoriza (1:N)"
    tb_product_categories ||--o{ tb_products : "agrupa (1:N)"
    tb_products ||--o{ tb_product_items : "composto por (1:N)"
    tb_materials ||--o{ tb_product_items : "utilizado em (1:N)"
    
    tb_customers ||--o{ tb_budgets : "solicita (1:N)"
    tb_budgets ||--o{ tb_budget_items : "possui (1:N)"
    tb_products ||--o{ tb_budget_items : "instanciado em (1:N)"
    tb_budget_items ||--o{ tb_budget_item_options : "customizado por (1:N)"
    tb_materials ||--o{ tb_budget_item_options : "fornece insumo para (1:N)"

    tb_material_groups {
        uuid id PK
        string code UK "VIDRO, ALUMINIO, PELICULA, FERRAGEM"
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
        decimal thickness_mm "2.00, 4.00, 8.00"
        decimal standard_length_m "3.00 ou 6.00"
        jsonb attributes_json "Metadados flexíveis"
        boolean is_active
    }

    tb_product_categories {
        uuid id PK
        string name "Portas, Janelas, Box"
        boolean is_active
    }

    tb_products {
        uuid id PK
        uuid category_id FK
        string name "Nome do template de esquadria"
        string template_type "SLIDING_DOOR_2F, PIVOTING_DOOR"
        jsonb template_config "Puxador, abertura, furação"
        jsonb category_requirements "GLASS, PROFILE, HARDWARE..."
        boolean is_active
    }

    tb_product_items {
        uuid id PK
        uuid product_id FK
        uuid material_id FK
        decimal quantity
    }

    tb_customers {
        uuid id PK
        string name "Nome / Razão Social"
        string person_type "INDIVIDUAL, LEGAL_ENTITY"
        string cpf_cnpj UK "Documento validado"
        string phone
        string email
        string address
        string notes
        boolean is_active
    }

    tb_budgets {
        uuid id PK
        string code UK "ORC-YYYYMMDD-NNNN"
        uuid customer_id FK
        string status "DRAFT, SENT, APPROVED, CANCELLED"
        decimal subtotal
        decimal discount_percent
        decimal discount_value
        decimal total
        string notes
        timestamp valid_until
    }

    tb_budget_items {
        uuid id PK
        uuid budget_id FK
        uuid product_id FK
        integer width "Largura em mm"
        integer height "Altura em mm"
        integer quantity
        decimal labor_cost "Mão de obra do item"
        decimal subtotal
        string notes
    }

    tb_budget_item_options {
        uuid id PK
        uuid budget_item_id FK
        uuid material_id FK
        string category_type "GLASS, PROFILE, HARDWARE, FILM"
        string unit_measure
        decimal quantity "Computado pela Strategy"
        decimal unit_price
        decimal total_price
    }
```

---

## 2. 🗄️ Dicionário das Tabelas Principais

### 2.1 `tb_material_groups` (Grupos de Insumos)
* **Finalidade:** Define o tipo de insumo e a estratégia física de cálculo (área $m^2$, metro linear ou unidade).
* **Campos:** `id` (UUID PK), `code` (VARCHAR UK), `name` (VARCHAR), `calculation_type` (VARCHAR), `is_system_default` (BOOLEAN), `is_active` (BOOLEAN).

### 2.2 `tb_materials` (Insumos e Matérias-Primas do Catálogo)
* **Finalidade:** Tabela universal para vidros, perfis, películas e ferragens.
* **Campos:** `id` (UUID PK), `group_id` (UUID FK), `commercial_reference` (VARCHAR), `ncm_code` (VARCHAR), `name` (VARCHAR), `cost_price` (DECIMAL), `sale_price` (DECIMAL), `unit_measure` (VARCHAR), `thickness_mm` (DECIMAL), `standard_length_m` (DECIMAL), `attributes_json` (JSONB), `is_active` (BOOLEAN).

### 2.3 `tb_product_categories` (Categorias de Produtos)
* **Finalidade:** Agrupamento e organização dos produtos finais (ex: Esquadrias, Portas, Janelas, Box).
* **Campos:** `id` (UUID PK), `name` (VARCHAR), `is_active` (BOOLEAN).

### 2.4 `tb_products` (Templates Paramétricos de Esquadrias)
* **Finalidade:** Modelagem de modelos de esquadrias (`TemplateType`), esquemas paramétricos vetoriais (`template_config`) e categorias obrigatórias (`category_requirements`).
* **Campos:** `id` (UUID PK), `category_id` (UUID FK), `name` (VARCHAR), `template_type` (VARCHAR), `template_config` (JSONB), `category_requirements` (JSONB), `is_active` (BOOLEAN).

### 2.5 `tb_customers` (Clientes)
* **Finalidade:** Gestão de clientes físicos (PF) e jurídicos (PJ) para emissão de propostas comerciais.
* **Campos:** `id` (UUID PK), `name` (VARCHAR), `person_type` (VARCHAR), `cpf_cnpj` (VARCHAR UK), `phone` (VARCHAR), `email` (VARCHAR), `address` (TEXT), `notes` (TEXT), `is_active` (BOOLEAN).

### 2.6 `tb_budgets` (Orçamentos)
* **Finalidade:** Cabeçalho do orçamento comercial com código sequencial, máquina de estados e totalização financeira.
* **Campos:** `id` (UUID PK), `code` (VARCHAR UK), `customer_id` (UUID FK), `status` (VARCHAR), `subtotal` (DECIMAL), `discount_percent` (DECIMAL), `discount_value` (DECIMAL), `total` (DECIMAL), `notes` (TEXT), `valid_until` (TIMESTAMP).

### 2.7 `tb_budget_items` & `tb_budget_item_options` (Itens e Insumos do Orçamento)
* **Finalidade:** Registra cada esquadria sob medida (medidas em mm, mão de obra desacoplada) e os insumos específicos selecionados com precificação congelada na aprovação.

---

*Modelo de Dados homologado com a base PostgreSQL 16 — Versão 3.0 — 31/08/2026*
