# Especificação Técnica de Apoio: US-46.1 — Venda Avulsa de Ferragens por Unidade

Este documento detalha os aspectos de arquitetura, banco de dados, classes e contratos técnicos para a implementação da fatia vertical **US-46.1**.

---

## 🗄️ 1. Banco de Dados (Flyway Migration)

- **Arquivo:** `backend/src/main/resources/db/migration/V23__create_part_sales_schema.sql`
- **Sequência:** Imediatamente após `V22__set_default_order_status_created.sql` de `develop`.

```sql
CREATE TABLE tb_part_sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(30) UNIQUE NOT NULL,
    client_id UUID NOT NULL REFERENCES tb_clients(id),
    status VARCHAR(20) NOT NULL,
    subtotal_amount NUMERIC(12, 2) NOT NULL,
    discount_amount NUMERIC(12, 2) DEFAULT 0.00,
    total_amount NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE tb_part_sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    part_sale_id UUID NOT NULL REFERENCES tb_part_sales(id) ON DELETE CASCADE,
    material_id UUID NOT NULL REFERENCES tb_materials(id),
    material_type VARCHAR(30) NOT NULL,
    width_mm INT NULL,
    height_mm INT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    calculated_unit_measure NUMERIC(10, 4) NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL,
    total_price NUMERIC(12, 2) NOT NULL
);

CREATE INDEX idx_part_sales_client ON tb_part_sales(client_id);
CREATE INDEX idx_part_sales_status ON tb_part_sales(status);
CREATE INDEX idx_part_sale_items_sale ON tb_part_sale_items(part_sale_id);
```

---

## ☕ 2. Backend Core & Strategy Pattern

- **Pacote:** `br.edu.ifpb.alumigest.partsale`
- **Enums:**
  - `PartSaleStatus`: `DRAFT`, `QUOTED`, `APPROVED`, `DELIVERED`, `CANCELLED`
  - `PartMaterialType`: `GLASS`, `ALUMINUM_PROFILE`, `HARDWARE`, `FILM`
- **Strategy Pattern (Cálculo Desacoplado):**
  - `PartItemCalculator.java`:
    ```java
    package br.edu.ifpb.alumigest.partsale.calculator;

    public interface PartItemCalculator {
        PartMaterialType getMaterialType();
        CalculatePartItemResponse calculate(CalculatePartItemRequest request);
    }
    ```
  - `PartCalculatorFactory.java`:
    ```java
    package br.edu.ifpb.alumigest.partsale.calculator;

    @Component
    public class PartCalculatorFactory {
        private final Map<PartMaterialType, PartItemCalculator> calculators;

        public PartCalculatorFactory(List<PartItemCalculator> calculatorList) {
            this.calculators = calculatorList.stream()
                .collect(Collectors.toMap(PartItemCalculator::getMaterialType, Function.identity()));
        }

        public PartItemCalculator getCalculator(PartMaterialType type) {
            PartItemCalculator calc = calculators.get(type);
            if (calc == null) throw new IllegalArgumentException("Calculadora não encontrada: " + type);
            return calc;
        }
    }
    ```
  - `HardwarePartCalculator.java`:
    Multiplica `quantity * unitPrice`, define `widthMm = null`, `heightMm = null` e `calculatedUnitMeasure = 1.0000`.
- **Endpoints REST (`PartSaleController.java`):**
  - `POST /api/v1/part-sales/calculate-item`
  - `POST /api/v1/part-sales`
  - `GET /api/v1/part-sales/{id}`
  - `PATCH /api/v1/part-sales/{id}/status`

---

## ⚛️ 3. Frontend UI & Componentes

- **Módulo:** `frontend/src/modules/part-sales/`
- **Componentes:**
  - `PartSaleFormPage.tsx`: Página base do formulário em `/vendas/partes/nova`.
  - `PartSaleItemGrid.tsx`: Tabela de itens gerenciando adição e remoção.
  - `HardwareItemFields.tsx`: Subcomponente especialista com inputs de dimensões com valor "N/A" desabilitados e badge roxo `Ferragem (un)`.
  - `PartSaleSummaryCard.tsx`: Card flutuante com totais recebidos da API.
- **Hook:** `usePartCalculation.ts` com debounce de 300ms via TanStack Query.

---

## 🧪 4. Estratégia de Testes (QA)

- `HardwarePartCalculatorTest.java`: Cálculo unitário exato de ferragens inteiras.
- `PartSaleControllerTest.java` (MockMvc): Criação, cálculo e transição de status.
- `PartSaleFormPage.test.tsx` (Vitest): Seleção de ferragem, campos N/A e resumo financeiro.
