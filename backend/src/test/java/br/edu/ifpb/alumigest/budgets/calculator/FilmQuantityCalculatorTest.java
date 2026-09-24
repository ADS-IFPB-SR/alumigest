package br.edu.ifpb.alumigest.budgets.calculator;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("FilmQuantityCalculator — Testes Unitários")
class FilmQuantityCalculatorTest {

    private FilmQuantityCalculator calculator;

    @BeforeEach
    void setUp() {
        calculator = new FilmQuantityCalculator();
    }

    @Nested
    @DisplayName("Identificação da Categoria")
    class CategoryTypeTests {

        @Test
        @DisplayName("Deve retornar a categoria FILM")
        void shouldReturnFilmCategoryType() {
            // [Técnica: Teste Estrutural / Contrato de Interface]
            CategoryType category = calculator.getCategoryType();
            assertThat(category).isEqualTo(CategoryType.FILM);
        }
    }

    @Nested
    @DisplayName("Cálculo de Área de Película com Análise do Valor Limite (BVA)")
    class CalculateTests {

        @Test
        @DisplayName("[Técnica: Análise do Valor Limite - Abaixo do Mínimo (< 0.25 m²)] Deve aplicar área mínima de 0.25m² para peças pequenas")
        void shouldEnforceMinimumAreaWhenCalculatedAreaIsBelowThreshold() {
            // Given (Arrange) - Vão pequeno: 400mm x 400mm = 0.16 m² (< 0.25 m²)
            TemplateType templateType = TemplateType.MAX_AR_WINDOW_1_LEAF;
            int widthMm = 400;
            int heightMm = 400;
            int quantity = 1;
            BigDecimal requestedQty = BigDecimal.ONE;

            // When (Act)
            BigDecimal totalArea = calculator.calculate(templateType, widthMm, heightMm, quantity, requestedQty);

            // Then (Assert) - Deve adotar o piso de 0.25 m²
            assertThat(totalArea).isEqualByComparingTo(new BigDecimal("0.25"));
        }

        @Test
        @DisplayName("[Técnica: Análise do Valor Limite - Exatamente no Limite (0.25 m²)] Deve manter 0.25m² quando a área for exatamente a mínima")
        void shouldKeepAreaWhenCalculatedAreaEqualsThreshold() {
            // Given (Arrange) - Vão exato: 500mm x 500mm = 0.25 m²
            TemplateType templateType = TemplateType.SLIDING_2_LEAF;
            int widthMm = 500;
            int heightMm = 500;
            int quantity = 1;
            BigDecimal requestedQty = BigDecimal.ONE;

            // When (Act)
            BigDecimal totalArea = calculator.calculate(templateType, widthMm, heightMm, quantity, requestedQty);

            // Then (Assert)
            assertThat(totalArea).isEqualByComparingTo(new BigDecimal("0.25"));
        }

        @Test
        @DisplayName("[Técnica: Análise do Valor Limite - Acima do Mínimo (> 0.25 m²)] Deve calcular área real proporcional quando superior a 0.25m²")
        void shouldCalculateExactAreaWhenAboveMinimumThreshold() {
            // Given (Arrange) - Vão padrão: 1000mm x 1500mm = 1.50 m²
            TemplateType templateType = TemplateType.SLIDING_2_LEAF;
            int widthMm = 1000;
            int heightMm = 1500;
            int quantity = 2; // 2 peças x 1.50 = 3.00 m²
            BigDecimal requestedQty = BigDecimal.ONE;

            // When (Act)
            BigDecimal totalArea = calculator.calculate(templateType, widthMm, heightMm, quantity, requestedQty);

            // Then (Assert)
            assertThat(totalArea).isEqualByComparingTo(new BigDecimal("3.00"));
        }

        @Test
        @DisplayName("[Técnica: Classes de Equivalência - Arredondamento CEILING] Deve arredondar para cima com 2 casas decimais")
        void shouldApplyCeilingRoundingScale() {
            // Given (Arrange) - 1001mm x 1001mm = 1.002001 m² -> arredondamento CEILING -> 1.01 m²
            TemplateType templateType = TemplateType.SLIDING_4_LEAF;
            int widthMm = 1001;
            int heightMm = 1001;
            int quantity = 1;
            BigDecimal requestedQty = BigDecimal.ONE;

            // When (Act)
            BigDecimal totalArea = calculator.calculate(templateType, widthMm, heightMm, quantity, requestedQty);

            // Then (Assert)
            assertThat(totalArea).isEqualByComparingTo(new BigDecimal("1.01"));
        }
    }
}
