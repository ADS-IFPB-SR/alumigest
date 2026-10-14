# 📊 MER — Modelo de Dados Oficial (AlumiGest)
**Projeto:** AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias  
**Versão:** 5.0 (Consolidado com Ordens de Serviço / Pedidos, Snapshot Imutável, Lock de Preços e Migrações Flyway V1-V19)  
**Data:** 12 de Outubro de 2026  
**SGBD:** PostgreSQL 16 com extensão `uuid-ossp`  
**Autor:** Equipe de Engenharia AlumiGest (Scrum Master: Italo Santos)  

---

## 1. 🎯 Visão Geral da Arquitetura de Dados

O modelo de dados do AlumiGest foi projetado com foco em **extensibilidade universal (*Type-Object Pattern*)**, **templates de esquadrias paramétricas** e **cálculo dinâmico de propostas comerciais**.

Com a evolução para templates paramétricos na Sprint 3 (migrações Flyway `V12` e `V13`):
* As antigas tabelas `tb_product_categories` e `tb_product_items` foram **extintas**.
* As esquadrias (`tb_products`) são classificadas dinamicamente a partir do seu modelo canônico (`template_type`), e seus insumos são desacoplados via requisitos dinâmicos de categoria (`category_requirements`).
* Foi introduzida a coluna `option_schema` (JSONB) para configurar limites e restrições técnicas específicas de cada produto no Studio CAD e no Wizard de Orçamentos.

```mermaid
erDiagram
    tb_material_groups ||--o{ tb_materials : "categoriza (1:N)"
    
    tb_customers ||--o{ tb_budgets : "solicita (1:N)"
    tb_budgets ||--o{ tb_budget_items : "possui (1:N)"
    tb_products ||--o{ tb_budget_items : "instanciado em (1:N)"
    tb_budget_items ||--o{ tb_budget_item_options : "customizado por (1:N)"
    tb_materials ||--o{ tb_budget_item_options : "fornece insumo para (1:N)"
    
    tb_budgets ||--o| tb_orders : "converte em (1:1)"
    tb_customers ||--o{ tb_orders : "titular de (1:N)"
    tb_orders ||--o{ tb_order_items : "contém itens congelados (1:N)"

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

    tb_products {
        uuid id PK
        string name "Nome do template de esquadria"
        string template_type "SLIDING_DOOR_2F, SWING_DOOR_1F..."
        jsonb template_config "Puxador, abertura, furação técnica"
        jsonb category_requirements "GLASS, PROFILE, HARDWARE..."
        jsonb option_schema "Regras de restrição técnica de opções"
        boolean is_active
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
        string status "DRAFT, SENT, APPROVED, REJECTED, CANCELLED, EXPIRED"
        decimal subtotal
        decimal discount_percent
        decimal discount_value
        decimal total
        string payment_condition "A_VISTA_PIX, ENTRADA_50_50, PARCELADO_CARTAO"
        string payment_notes
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

    tb_orders {
        uuid id PK
        string code UK "OS-YYYY-NNNN"
        uuid budget_id UK_FK "Invariante 1:1"
        uuid customer_id FK
        string customer_name "Snapshot do cliente"
        string customer_phone
        string delivery_address
        string status "CREATED, WAITING_PRODUCTION, IN_PRODUCTION, COMPLETED, CANCELLED"
        string approval_channel "WHATSAPP, PRESENCIAL, TELEFONE, EMAIL"
        date approval_date
        date expected_delivery_date
        date completion_date
        decimal gross_total
        decimal discount_total
        decimal installation_fee
        decimal freight_fee
        decimal net_total "Total formalizado"
        string payment_condition
        string payment_notes
        string notes
        string cancellation_reason
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    tb_order_items {
        uuid id PK
        uuid order_id FK
        uuid product_id FK
        string description "Descrição congelada"
        integer width_mm "Medida nominal"
        integer height_mm "Medida nominal"
        integer quantity
        string aluminum_color
        string glass_type
        string opening_direction
        string hardware
        decimal unit_price "Preço congelado"
        decimal total_price "Subtotal congelado"
        jsonb template_config "Snapshot imutável"
        jsonb handle_config "Snapshot puxador"
        jsonb drilling_config "Snapshot furação"
        integer display_order
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

### 2.3 `tb_products` (Templates Paramétricos de Esquadrias)
* **Finalidade:** Modelagem de modelos de esquadrias (`DoorTemplateType`), esquemas paramétricos vetoriais (`template_config`), requisitos dinâmicos de insumos (`category_requirements`) e esquemas de opções técnicas permitidas (`option_schema`).
* **Campos:** `id` (UUID PK), `name` (VARCHAR), `template_type` (VARCHAR), `template_config` (JSONB), `category_requirements` (JSONB), `option_schema` (JSONB), `is_active` (BOOLEAN).
* *Nota Histórica:* A antiga coluna `category_id` e a tabela `tb_product_categories` foram eliminadas na migração `V12`; a antiga tabela `tb_product_items` foi eliminada na migração `V13`.

### 2.4 `tb_customers` (Clientes)
* **Finalidade:** Gestão de clientes físicos (PF) e jurídicos (PJ) para emissão de propostas comerciais.
* **Campos:** `id` (UUID PK), `name` (VARCHAR), `person_type` (VARCHAR), `cpf_cnpj` (VARCHAR UK), `phone` (VARCHAR), `email` (VARCHAR), `address` (TEXT), `notes` (TEXT), `is_active` (BOOLEAN).

### 2.5 `tb_budgets` (Orçamentos)
* **Finalidade:** Cabeçalho do orçamento comercial com código sequencial, máquina de estados, condições de pagamento e totalização financeira.
* **Campos:** `id` (UUID PK), `code` (VARCHAR UK), `customer_id` (UUID FK), `status` (VARCHAR: `DRAFT`, `SENT`, `APPROVED`, `REJECTED`, `CANCELLED`, `EXPIRED`), `subtotal` (DECIMAL), `discount_percent` (DECIMAL), `discount_value` (DECIMAL), `total` (DECIMAL), `payment_condition` (VARCHAR), `payment_notes` (TEXT), `notes` (TEXT), `valid_until` (TIMESTAMP).

### 2.6 `tb_budget_items` & `tb_budget_item_options` (Itens e Insumos do Orçamento)
* **Finalidade:** Registra cada esquadria sob medida (medidas em mm, mão de obra desacoplada) e os insumos específicos selecionados com precificação congelada na aprovação.
* **Campos `tb_budget_items`:** `id` (UUID PK), `budget_id` (UUID FK), `product_id` (UUID FK), `width` (INTEGER), `height` (INTEGER), `quantity` (INTEGER), `labor_cost` (DECIMAL), `subtotal` (DECIMAL), `notes` (TEXT).
* **Campos `tb_budget_item_options`:** `id` (UUID PK), `budget_item_id` (UUID FK), `material_id` (UUID FK), `category_type` (VARCHAR), `unit_measure` (VARCHAR), `quantity` (DECIMAL), `unit_price` (DECIMAL), `total_price` (DECIMAL).

### 2.7 `tb_orders` (Ordens de Serviço / Pedidos de Venda — Migration V19)
* **Finalidade:** Formalização contratual de venda e ordem executiva de produção fabril. Gerado a partir de um orçamento aprovado (invariante 1-para-1), garantindo lock de preços e controle de prazos de entrega.
* **Campos:** `id` (UUID PK), `code` (VARCHAR UK), `budget_id` (UUID UK FK), `customer_id` (UUID FK), `customer_name` (VARCHAR), `customer_phone` (VARCHAR), `delivery_address` (TEXT), `status` (VARCHAR: `CREATED`, `WAITING_PRODUCTION`, `IN_PRODUCTION`, `COMPLETED`, `CANCELLED`), `approval_channel` (VARCHAR: `WHATSAPP`, `PRESENCIAL`, `TELEFONE`, `EMAIL`), `approval_date` (DATE), `expected_delivery_date` (DATE), `completion_date` (DATE), `gross_total` (DECIMAL), `discount_total` (DECIMAL), `installation_fee` (DECIMAL), `freight_fee` (DECIMAL), `net_total` (DECIMAL), `payment_condition` (VARCHAR), `payment_notes` (TEXT), `notes` (TEXT), `cancellation_reason` (TEXT), `is_active` (BOOLEAN), `created_at` (TIMESTAMP), `updated_at` (TIMESTAMP).

### 2.8 `tb_order_items` (Itens da Ordem de Serviço — Snapshot Imutável — Migration V19)
* **Finalidade:** Registra cada exemplar físico de esquadria contratada com dimensões nominais, especificações de perfil, vidro e valores unitários congelados via clonagem profunda (*deep copy*), blindados contra reajustes posteriores de catálogo.
* **Campos:** `id` (UUID PK), `order_id` (UUID FK), `product_id` (UUID FK), `description` (VARCHAR), `width_mm` (INTEGER), `height_mm` (INTEGER), `quantity` (INTEGER), `aluminum_color` (VARCHAR), `glass_type` (VARCHAR), `opening_direction` (VARCHAR), `hardware` (TEXT), `unit_price` (DECIMAL), `total_price` (DECIMAL), `template_config` (JSONB), `handle_config` (JSONB), `drilling_config` (JSONB), `display_order` (INTEGER).

---

*Modelo de Dados homologado com a base PostgreSQL 16 — Versão 5.0 — 12/10/2026*

