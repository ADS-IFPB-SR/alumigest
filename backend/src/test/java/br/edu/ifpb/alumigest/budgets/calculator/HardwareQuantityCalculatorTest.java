package br.edu.ifpb.alumigest.budgets.calculator;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("HardwareQuantityCalculator — Testes Unitários")
class HardwareQuantityCalculatorTest {

    private HardwareQuantityCalculator calculator;

    @BeforeEach
    void setUp() {
        calculator = new HardwareQuantityCalculator();
    }

    @Nested
    @DisplayName("Identificação da Categoria")
    class CategoryTypeTests {

        @Test
        @DisplayName("Deve retornar a categoria HARDWARE")
        void shouldReturnHardwareCategoryType() {
            // [Técnica: Teste Estrutural / Contrato de Interface]
            CategoryType category = calculator.getCategoryType();
            assertThat(category).isEqualTo(CategoryType.HARDWARE);
        }
    }

    @Nested
    @DisplayName("Cálculo de Quantidades de Ferragens")
    class CalculateTests {

        @Test
        @DisplayName("[Técnica: Classes de Equivalência - Entrada Nula] Deve retornar ZERO quando requestedMaterialQty for nulo")
        void shouldReturnZeroWhenRequestedMaterialQtyIsNull() {
            // Given (Arrange)
            TemplateType templateType = TemplateType.SLIDING_2_LEAF;
            int widthMm = 1200;
            int heightMm = 1000;
            int quantity = 2;
            BigDecimal requestedQty = null;

            // When (Act)
            BigDecimal result = calculator.calculate(templateType, widthMm, heightMm, quantity, requestedQty);

            // Then (Assert)
            assertThat(result).isEqualByComparingTo(BigDecimal.ZERO);
        }

        @Test
        @DisplayName("[Técnica: Tabela de Decisão - Regra R1: Multiplicação Direta] Deve multiplicar a quantidade unitária pela quantidade de esquadrias")
        void shouldMultiplyRequestedQtyByEsquadriaQuantity() {
            // Given (Arrange) - Regra: 2 dobradiças por esquadria em lote de 4 portas -> 8 dobradiças
            TemplateType templateType = TemplateType.SWING_1_LEAF;
            int widthMm = 900;
            int heightMm = 2100;
            int quantity = 4;
            BigDecimal requestedQty = new BigDecimal("2.00");

            // When (Act)
            BigDecimal result = calculator.calculate(templateType, widthMm, heightMm, quantity, requestedQty);

            // Then (Assert)
            assertThat(result).isEqualByComparingTo(new BigDecimal("8.00"));
        }

        @Test
        @DisplayName("[Técnica: Análise do Valor Limite - Quantidade Zero] Deve retornar ZERO quando a quantidade de esquadrias for zero")
        void shouldReturnZeroWhenQuantityIsZero() {
            // Given (Arrange)
            TemplateType templateType = TemplateType.MAX_AR_WINDOW_1_LEAF;
            int widthMm = 600;
            int heightMm = 600;
            int quantity = 0;
            BigDecimal requestedQty = new BigDecimal("1.50");

            // When (Act)
            BigDecimal result = calculator.calculate(templateType, widthMm, heightMm, quantity, requestedQty);

            // Then (Assert)
            assertThat(result).isEqualByComparingTo(BigDecimal.ZERO);
        }

        @Test
        @DisplayName("[Técnica: Análise do Valor Limite - Quantidade Unitária 1] Deve retornar exatamente a quantidade requisitada quando quantity = 1")
        void shouldReturnExactRequestedQtyWhenQuantityIsOne() {
            // Given (Arrange)
            TemplateType templateType = TemplateType.SLIDING_4_LEAF;
            int widthMm = 2400;
            int heightMm = 2100;
            int quantity = 1;
            BigDecimal requestedQty = new BigDecimal("3.00");

            // When (Act)
            BigDecimal result = calculator.calculate(templateType, widthMm, heightMm, quantity, requestedQty);

            // Then (Assert)
            assertThat(result).isEqualByComparingTo(new BigDecimal("3.00"));
        }
    }
}
