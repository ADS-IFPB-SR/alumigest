# Especificação Técnica de Apoio: US-46.2 — Venda de Perfis de Alumínio em Metro Linear

Este documento detalha os aspectos de arquitetura, classes e contratos técnicos para a implementação da fatia vertical **US-46.2**.

---

## ☕ 1. Backend Core & Strategy Pattern

- **Pacote:** `br.edu.ifpb.alumigest.partsale.calculator`
- **Classe Especialista:**
  - `AluminumProfilePartCalculator.java`:
    ```java
    package br.edu.ifpb.alumigest.partsale.calculator;

    @Component
    public class AluminumProfilePartCalculator implements PartItemCalculator {

        @Override
        public PartMaterialType getMaterialType() {
            return PartMaterialType.ALUMINUM_PROFILE;
        }

        @Override
        public CalculatePartItemResponse calculate(CalculatePartItemRequest request) {
            // Conversão de comprimento (mm) para metros lineares com fator de perda
            BigDecimal lengthMeters = BigDecimal.valueOf(request.heightMm())
                .divide(BigDecimal.valueOf(1000), 4, RoundingMode.HALF_UP);
            BigDecimal netMeters = lengthMeters.multiply(BigDecimal.valueOf(request.quantity()));
            BigDecimal lossFactor = request.lossFactor() != null ? request.lossFactor() : BigDecimal.ZERO;
            BigDecimal billableMeters = netMeters.multiply(BigDecimal.ONE.add(lossFactor));
            BigDecimal totalPrice = billableMeters.multiply(request.unitPrice());

            return new CalculatePartItemResponse(
                billableMeters,
                request.unitPrice(),
                totalPrice
            );
        }
    }
    ```
- **Gravação em Entidade:**
  - `height_mm`: armazena o comprimento em milímetros da peça/barra.
  - `width_mm`: nulo.
  - `calculated_unit_measure`: armazena a metragem linear faturada com perda.

---

## ⚛️ 2. Frontend UI & Componentes

- **Módulo:** `frontend/src/modules/part-sales/components/`
- **Componente Especialista:**
  - `AluminumItemFields.tsx`:
    - Campo numérico para digitação de `Comprimento (mm)`.
    - Input de quantidade em barras ou pedaços.
    - Badge estilizado âmbar: `bg-amber-500/10 text-amber-400 border-amber-500/20` com rótulo "Metro Linear (m)".
    - Exibe dinamicamente a metragem faturada calculada pela API.

---

## 🧪 3. Estratégia de Testes (QA)

- `AluminumProfilePartCalculatorTest.java`:
  - Teste de cálculo simples de metragem linear ($Comprimento / 1000 \times Qtd$).
  - Teste de aplicação de fator de perda (ex.: 5% sobre a metragem).
  - Teste de rejeição de comprimento zerado ou negativo.
- `AluminumItemFields.test.tsx` (Vitest):
  - Renderização do campo de comprimento e ausência de campo de largura.
  - Atualização do valor retornado pelo backend.
