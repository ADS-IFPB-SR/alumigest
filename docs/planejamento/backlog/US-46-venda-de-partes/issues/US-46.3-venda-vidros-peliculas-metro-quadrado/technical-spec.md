# Especificação Técnica de Apoio: US-46.3 — Venda de Vidros e Películas em m²

Este documento detalha os aspectos de arquitetura, classes e contratos técnicos para a implementação da fatia vertical **US-46.3**.

---

## ☕ 1. Backend Core & Strategy Pattern

- **Pacote:** `br.edu.ifpb.alumigest.partsale.calculator`
- **Classes Especialistas:**
  - `GlassPartCalculator.java`:
    ```java
    package br.edu.ifpb.alumigest.partsale.calculator;

    @Component
    public class GlassPartCalculator implements PartItemCalculator {

        private static final BigDecimal MIN_BILLABLE_AREA = new BigDecimal("0.2500");
        private static final BigDecimal ONE_MILLION = new BigDecimal("1000000");

        @Override
        public PartMaterialType getMaterialType() {
            return PartMaterialType.GLASS;
        }

        @Override
        public CalculatePartItemResponse calculate(CalculatePartItemRequest request) {
            BigDecimal rawArea = BigDecimal.valueOf(request.widthMm())
                .multiply(BigDecimal.valueOf(request.heightMm()))
                .divide(ONE_MILLION, 4, RoundingMode.HALF_UP);

            BigDecimal billableUnitArea = rawArea.max(MIN_BILLABLE_AREA);
            BigDecimal totalArea = billableUnitArea.multiply(BigDecimal.valueOf(request.quantity()));
            BigDecimal totalPrice = totalArea.multiply(request.unitPrice());

            return new CalculatePartItemResponse(totalArea, request.unitPrice(), totalPrice);
        }
    }
    ```
  - `FilmPartCalculator.java`:
    ```java
    package br.edu.ifpb.alumigest.partsale.calculator;

    @Component
    public class FilmPartCalculator implements PartItemCalculator {

        private static final BigDecimal ONE_MILLION = new BigDecimal("1000000");

        @Override
        public PartMaterialType getMaterialType() {
            return PartMaterialType.FILM;
        }

        @Override
        public CalculatePartItemResponse calculate(CalculatePartItemRequest request) {
            BigDecimal netArea = BigDecimal.valueOf(request.widthMm())
                .multiply(BigDecimal.valueOf(request.heightMm()))
                .divide(ONE_MILLION, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(request.quantity()));

            BigDecimal lossFactor = request.lossFactor() != null ? request.lossFactor() : BigDecimal.ZERO;
            BigDecimal billableArea = netArea.multiply(BigDecimal.ONE.add(lossFactor));
            BigDecimal totalPrice = billableArea.multiply(request.unitPrice());

            return new CalculatePartItemResponse(billableArea, request.unitPrice(), totalPrice);
        }
    }
    ```
- **Validações Físicas de Dimensões:**
  - Lança `BusinessException(HttpStatus.UNPROCESSABLE_ENTITY, "Dimensão informada excede os limites operacionais cadastrados para o insumo")` caso `width_mm` ou `height_mm` exceda os limites cadastrados no material.

---

## ⚛️ 2. Frontend UI & Componentes

- **Módulo:** `frontend/src/modules/part-sales/components/`
- **Componente Especialista:**
  - `GlassAndFilmItemFields.tsx`:
    - Inputs numéricos para `Largura (mm)` e `Altura (mm)`.
    - Input de quantidade de peças.
    - Badges contextuais:
      - Vidro: `bg-cyan-500/10 text-cyan-400 border-cyan-500/20` com rótulo "Vidro (m²)".
      - Película: `bg-emerald-500/10 text-emerald-400 border-emerald-500/20` com rótulo "Película (m²)".
    - Validação com feedback instantâneo no evento `onBlur`: borda destrutiva `border-red-500` e mensagem explicativa abaixo do campo caso dimensões sejam nulas ou excedam os limites.

---

## 🧪 3. Estratégia de Testes (QA)

- `GlassPartCalculatorTest.java`:
  - Teste com dimensões pequenas resultando em área inferior a $0,25\text{ m}^2$ (ex: $300 \times 400\text{ mm} = 0,12\text{ m}^2$), comprovando faturamento na fração mínima de $0,25\text{ m}^2$.
  - Teste com dimensões grandes (ex: $1200 \times 1500\text{ mm} = 1,80\text{ m}^2$).
- `FilmPartCalculatorTest.java`:
  - Teste de cálculo de área com fator de perda de corte de bobina (ex: 10%).
- `GlassAndFilmItemFields.test.tsx` (Vitest):
  - Validação de renderização de inputs e disparo de erro visual no `onBlur`.
