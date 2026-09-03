# 📐 Documento de Arquitetura e Modelagem de Dados (DER)
## Módulo: Catálogo de Materiais e Produtos (Templates de Esquadrias)
**Projeto:** AlumiGest (Gestão Operacional e Orçamentária para Esquadrias e Vidraçaria)  
**Versão:** 3.0.0 (Atualizado com migrações V8 a V10 da Sprint 3)  
**Data:** 31 de Agosto de 2026  
**Autor:** Equipe de Engenharia de Software (Scrum Master: Italo Jefferson Lima dos Santos)  

---

## 1. 🎯 Visão Geral e Objetivos Arquiteturais

O módulo de **Catálogo de Materiais e Produtos** é o alicerce de dados do AlumiGest. Seu objetivo principal é fornecer uma base sólida, flexível e performática para o cadastro, precificação e consulta de todos os insumos e templates de esquadrias utilizados pela **Alumiportas**.

### 🌟 Princípios de Design e Extensibilidade
1. **Atendimento Imediato à Alumiportas:** Suporte nativo e otimizado para os 4 grupos essenciais de materiais:
   * **Vidros:** Medidos por área ($m^2$) com suporte a espessuras finas para móveis (**2mm e 4mm**) e comuns/temperados (**6mm, 8mm, 10mm**).
   * **Perfis de Alumínio e Puxadores:** Medidos por metro linear ($m$) com suporte a barras comerciais (**3.00m e 6.00m**), referências comerciais de perfis (ex: `SU-001`, `S83`, `SPR-060`) e código NCM opcional para conformidade fiscal.
   * **Películas:** Medidas por área de aplicação ($m^2$) sobre os vidros (Fumê G5/G20, Jateada, Leitosa, Espelhada).
   * **Ferragens e Acessórios:** Medidos por **Unidade (`UN`)**, **Par (`PAR`)** (dobradiças, rodízios) ou **Metro (`METRO`)** (trilhos e escovas).
2. **Templates Paramétricos de Esquadrias (Sprint 3):** Produtos finais no catálogo representam modelos de montagem (portas de correr, pivotantes, boxes, janelas) armazenados com esquemas gráficos paramétricos (`template_config`) e categorias requeridas (`category_requirements`), desacoplados de marcas específicas.
3. **Mão de Obra no Orçamento:** A mão de obra é dinâmica por projeto/instalação e foi transferida exclusivamente para a camada de orçamentos (`BudgetItem.laborCost`), mantendo o catálogo de produtos focado na engenharia base.
4. **Extensibilidade (*Type-Object Pattern*):** Expansão para outros setores (Marcenaria, Serralheria fina) sem alteração de schema.

---

## 2. 📊 Diagrama Entidade-Relacionamento (DER)

```mermaid
erDiagram
    tb_material_groups ||--o{ tb_materials : "categoriza (1:N)"
    tb_product_categories ||--o{ tb_products : "agrupa (1:N)"
    tb_products ||--o{ tb_product_items : "composto por (1:N)"
    tb_materials ||--o{ tb_product_items : "utilizado em (1:N)"
    
    tb_material_groups {
        uuid id PK "Identificador Único Universal"
        string code UK "VIDRO, ALUMINIO, PELICULA, FERRAGEM"
        string name "Nome legível do grupo"
        enum calculation_type "SQUARE_METER, LINEAR_METER, UNIT, PAIR, WEIGHT_KG"
        string description "Descrição da regra de cálculo"
        boolean is_system_default "TRUE para nativos Alumiportas, FALSE para extensões"
        boolean is_active "Controle de exclusão lógica"
        timestamp created_at "Data de criação"
    }

    tb_materials {
        uuid id PK "Identificador Único do Insumo"
        uuid group_id FK "Chave estrangeira para tb_material_groups"
        string sku_code "Código interno de controle"
        string commercial_reference "Referência de catálogo: S83, S100, SPR-060, SU-001"
        string ncm_code "Código fiscal NCM (Opcional/Anulável)"
        string name "Nome descritivo do material"
        decimal cost_price "Preço de custo base (R$)"
        decimal sale_price "Preço de venda praticado (R$)"
        enum unit_measure "M2, METRO, BARRA_3M, BARRA_6M, UN, PAR"
        decimal thickness_mm "Espessura em mm (2.00, 4.00, 15.00)"
        string color_finish "Cor / Acabamento (Incolor, Fumê, Bronze, Branco Ral)"
        decimal standard_length_m "Comprimento padrão (3.00m ou 6.00m)"
        jsonb attributes_json "Metadados flexíveis para novos setores"
        boolean is_active "Controle de exclusão lógica (Soft Delete)"
        timestamp created_at "Data de criação"
        timestamp updated_at "Data da última modificação"
    }

    tb_product_categories {
        uuid id PK
        string name "Nome da categoria (ex: Esquadrias, Portas, Boxes)"
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    tb_products {
        uuid id PK
        uuid category_id FK
        string name "Nome do produto/template (ex: Porta de Correr 2F)"
        string template_type "Tipo/Modelo: SLIDING_DOOR_2F, PIVOTING_DOOR, BOX_FRONTAL"
        jsonb template_config "Configuração paramétrica de puxador, furação e abertura"
        jsonb category_requirements "Lista de categorias de insumos requeridas (GLASS, PROFILE...)"
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    tb_product_items {
        uuid id PK
        uuid product_id FK
        uuid material_id FK
        decimal quantity "Quantidade consumida na ficha técnica base"
    }
```

---

## 3. 📖 Dicionário de Dados

### 3.1 Tabela `tb_material_groups` (Grupos de Materiais)
Armazena as famílias de insumos e define a estratégia matemática de medição e cálculo de orçamentos.

| Campo | Tipo | Restrições | Descrição / Exemplo |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, DEFAULT uuid_generate_v4()` | Chave primária universal. |
| `code` | `VARCHAR(50)` | `NOT NULL, UNIQUE` | Código identificador (ex: `VIDRO`, `ALUMINIO`, `PELICULA`, `FERRAGEM`, `MDF`). |
| `name` | `VARCHAR(100)` | `NOT NULL` | Nome exibido na interface (*"Vidros e Espelhos"*). |
| `calculation_type` | `VARCHAR(30)` | `NOT NULL` | Enum: `SQUARE_METER`, `LINEAR_METER`, `UNIT`, `PAIR`, `WEIGHT_KG`. |
| `description` | `TEXT` | `NULL` | Descrição técnica das regras do grupo. |
| `is_system_default`| `BOOLEAN` | `DEFAULT FALSE` | `TRUE` para proteger os 4 grupos nativos da Alumiportas contra exclusão. |
| `is_active` | `BOOLEAN` | `DEFAULT TRUE` | Soft delete para desativação de grupos. |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | `DEFAULT NOW()` | Auditoria de criação. |

---

### 3.2 Tabela `tb_materials` (Insumos e Materiais do Catálogo)
Armazena a listagem de todos os materiais comercializados, associados ao seu respectivo grupo.

| Campo | Tipo | Restrições | Descrição / Exemplo |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, DEFAULT uuid_generate_v4()` | Chave primária universal. |
| `group_id` | `UUID` | `FK -> tb_material_groups(id)` | Grupo que rege a regra de cálculo do material. |
| `sku_code` | `VARCHAR(50)` | `NULL` | Código interno de estoque ou SKU. |
| `commercial_reference`| `VARCHAR(100)`| `NULL` | **Referência de Catálogo/Fábrica:** `SU-001`, `S83`, `SPR-060`. |
| `ncm_code` | `VARCHAR(10)` | `NULL` | Nomenclatura Comum do Mercosul (Classificação Fiscal opcional). |
| `name` | `VARCHAR(150)`| `NOT NULL` | Nome completo (*"Vidro Canelado 4mm"*, *"Perfil Puxador Alfa"*). |
| `cost_price` | `DECIMAL(12,2)`| `NOT NULL, DEFAULT 0.00` | Preço de custo base. |
| `sale_price` | `DECIMAL(12,2)`| `NOT NULL, DEFAULT 0.00` | Preço de venda padrão praticado no catálogo. |
| `unit_measure` | `VARCHAR(20)` | `NOT NULL, DEFAULT 'UN'` | Enum: `M2`, `METRO`, `BARRA_3M`, `BARRA_6M`, `UN`, `PAR`. |
| `thickness_mm` | `DECIMAL(6,2)` | `NULL` | Espessura física em mm (**2.00, 4.00, 6.00** ou **15.00** para MDF). |
| `color_finish` | `VARCHAR(50)` | `NULL` | Cor/Acabamento (Incolor, Bronze, Champanhe, Preto Fosco). |
| `standard_length_m`| `DECIMAL(6,2)` | `NULL` | Comprimento padrão da barra (**3.00m** ou **6.00m**). |
| `attributes_json` | `JSONB` | `NULL` | Atributos adicionais dinâmicos para expansão de novos setores. |
| `is_active` | `BOOLEAN` | `DEFAULT TRUE` | Soft delete (`false` quando inativado). |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | `DEFAULT NOW()` | Data de criação. |
| `updated_at` | `TIMESTAMP WITH TIME ZONE` | `DEFAULT NOW()` | Data da última atualização. |

---

### 3.3 Tabela `tb_product_categories` (Categorias de Produtos)
Agrupamento e organização dos produtos e templates (ex: Esquadrias, Portas, Janelas, Box).

| Campo | Tipo | Restrições | Descrição / Exemplo |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK` | Chave primária universal. |
| `name` | `VARCHAR(100)` | `NOT NULL` | Nome da categoria (*"Esquadrias de Alumínio"*). |
| `is_active` | `BOOLEAN` | `DEFAULT TRUE` | Soft delete. |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | `NOT NULL` | Data de criação. |
| `updated_at` | `TIMESTAMP WITH TIME ZONE` | `NOT NULL` | Data da última modificação. |

---

### 3.4 Tabela `tb_products` (Templates de Produtos / Esquadrias)
Modelagem do produto/template paramétrico de montagem.

| Campo | Tipo | Restrições | Descrição / Exemplo |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK` | Chave primária universal. |
| `category_id` | `UUID` | `FK -> tb_product_categories(id)` | Categoria a qual o produto pertence. |
| `name` | `VARCHAR(150)` | `NOT NULL` | Nome descritivo (*"Porta de Correr 2 Folhas Linha Rometal"*). |
| `template_type` | `VARCHAR(50)` | `NULL` | Enum/Tipo de Esquadria (`SLIDING_DOOR_2F`, `PIVOTING_DOOR`, `GLASS_BOX_FRONTAL`). |
| `template_config` | `JSONB` | `NULL` | Configuração paramétrica de puxador, sentido de abertura e furação. |
| `category_requirements` | `JSONB` | `NULL` | Lista de categorias obrigatórias (`["GLASS", "PROFILE", "HARDWARE", "FILM"]`). |
| `is_active` | `BOOLEAN` | `DEFAULT TRUE` | Soft delete. |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | `NOT NULL` | Data de criação. |
| `updated_at` | `TIMESTAMP WITH TIME ZONE` | `NOT NULL` | Data da última modificação. |

---

### 3.5 Tabela `tb_product_items` (Ficha Técnica / Composição Fixa)
Relação de itens fixos consumidos na montagem de um produto.

| Campo | Tipo | Restrições | Descrição / Exemplo |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK` | Chave primária universal. |
| `product_id` | `UUID` | `FK -> tb_products(id)` | Produto final sendo composto. |
| `material_id`| `UUID` | `FK -> tb_materials(id)` | Material (insumo) a ser utilizado. |
| `quantity` | `DECIMAL(10,4)`| `NOT NULL` | Quantidade demandada deste material na receita base. |

---

## 4. 🗄️ Script DDL Oficial (PostgreSQL 16 & Flyway V1 a V10)

```sql
-- ============================================================================
-- AlumiGest Database Migration (Consolidado V1 a V10)
-- Módulo: Catálogo de Materiais, Categorias e Templates de Produtos
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabela de Grupos de Materiais (V1)
CREATE TABLE tb_material_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    calculation_type VARCHAR(30) NOT NULL,
    description TEXT,
    is_system_default BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela Universal de Materiais (V1 / V3 / V6)
CREATE TABLE tb_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL,
    sku_code VARCHAR(50),
    commercial_reference VARCHAR(100),
    ncm_code VARCHAR(10),
    name VARCHAR(150) NOT NULL,
    cost_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    sale_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    unit_measure VARCHAR(20) NOT NULL DEFAULT 'UN',
    thickness_mm DECIMAL(6, 2),
    color_finish VARCHAR(50),
    standard_length_m DECIMAL(6, 2),
    attributes_json JSONB,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_materials_group FOREIGN KEY (group_id) REFERENCES tb_material_groups (id) ON DELETE RESTRICT
);

-- 3. Índices de Otimização
CREATE INDEX idx_materials_group_id ON tb_materials(group_id);
CREATE INDEX idx_materials_name ON tb_materials(name);
CREATE INDEX idx_materials_commercial_ref ON tb_materials(commercial_reference);
CREATE INDEX idx_materials_active ON tb_materials(is_active);

-- 4. Tabela de Categorias de Produtos (V4)
CREATE TABLE tb_product_categories (
    id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

-- 5. Tabela de Produtos / Templates de Esquadria (V2 / V8 / V10)
CREATE TABLE tb_products (
    id UUID NOT NULL,
    name VARCHAR(150) NOT NULL,
    category_id UUID NOT NULL,
    template_type VARCHAR(50),
    template_config JSONB,
    category_requirements JSONB,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id),
    CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES tb_product_categories (id)
);

-- 6. Tabela de Itens da Ficha Técnica (V2)
CREATE TABLE tb_product_items (
    id UUID NOT NULL,
    product_id UUID NOT NULL,
    material_id UUID NOT NULL,
    quantity NUMERIC(10,4) NOT NULL,
    
    PRIMARY KEY (id),
    CONSTRAINT fk_product_item_product FOREIGN KEY (product_id) REFERENCES tb_products (id) ON DELETE CASCADE,
    CONSTRAINT fk_product_item_material FOREIGN KEY (material_id) REFERENCES tb_materials (id)
);
```

---

## 5. 🔮 Guia de Extensibilidade: Como expandir para Marcenaria

Para cadastrar insumos de **Marcenaria** (ou qualquer outro setor), basta registrar o novo grupo via API ou SQL:

```sql
-- Exemplo: Adicionar suporte a Marcenaria
INSERT INTO tb_material_groups (code, name, calculation_type, description, is_system_default)
VALUES ('MDF', 'Chapas e Painéis de MDF', 'SQUARE_METER', 'Painéis de madeira calculados por m²', FALSE);

-- Exemplo: Cadastrar Chapa de MDF
INSERT INTO tb_materials (group_id, name, thickness_mm, color_finish, cost_price, sale_price, unit_measure)
SELECT id, 'Chapa MDF Branco TX', 15.00, 'Branco', 70.00, 110.00, 'M2'
FROM tb_material_groups WHERE code = 'MDF';
```
O sistema processará o cálculo de área do MDF automaticamente pelo motor de cálculo genérico!

---

*Documento atualizado e sincronizado com o banco de dados oficial do AlumiGest — 31/08/2026*
