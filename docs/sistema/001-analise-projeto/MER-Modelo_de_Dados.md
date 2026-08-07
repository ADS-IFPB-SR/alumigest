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
    tb_product_templates ||--o{ tb_template_items : "composto por (1:N)"
    tb_materials ||--o{ tb_template_items : "utilizado em (1:N)"
    tb_customers ||--o{ tb_quotes : "solicita (1:N)"
    tb_quotes ||--o{ tb_quote_items : "possui (1:N)"

    tb_material_groups {
        uuid id PK
        string code UK "VIDRO, ALUMINIO, PELICULA, FERRAGEM, MDF"
        string name "Nome legível"
        string calculation_type "SQUARE_METER, LINEAR_METER, UNIT, PAIR"
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
        string unit_measure "M2, METRO, BARRA_3M, BARRA_6M, UN, PAR"
        decimal thickness_mm "2.00, 4.00, 6.00 a 15.00"
        decimal standard_length_m "3.00 ou 6.00"
        jsonb attributes_json "Extensibilidade para novos setores"
        boolean is_active
    }

    tb_product_templates {
        uuid id PK
        string code UK "PORTA_CORRER_2F, JANELA_4F, BOX_PADRAO"
        string name "Nome do produto final"
        string description
        boolean is_active
    }

    tb_template_items {
        uuid id PK
        uuid template_id FK
        uuid material_id FK
        string component_role "PERFIL_SUPERIOR, PERFIL_LATERAL, VIDRO, ROLDANA"
        string formula_expression "Ex: LARGURA, ALTURA, AREA_VIDRO"
        integer default_quantity
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

### 2.3 `tb_customers` (Clientes)
* **Finalidade:** Cadastro de clientes da vidraçaria para geração de orçamentos e pedidos.
* **Campos:** `id` (UUID PK), `name` (VARCHAR), `document` (VARCHAR - CPF/CNPJ), `phone` (VARCHAR), `whatsapp` (VARCHAR), `address` (TEXT), `is_active` (BOOLEAN).

### 2.4 `tb_product_templates` & `tb_template_items` (Templates de Portas/Esquadrias - Sprint 3)
* **Finalidade:** Modelagem de portas e janelas compostas, definindo a "receita" de quais perfis, vidros e roldanas formam a esquadria acabada.
