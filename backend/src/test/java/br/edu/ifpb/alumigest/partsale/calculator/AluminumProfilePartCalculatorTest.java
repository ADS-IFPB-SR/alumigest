package br.edu.ifpb.alumigest.partsale.calculator;

import br.edu.ifpb.alumigest.catalog.domain.MaterialCategoryType;
import br.edu.ifpb.alumigest.partsale.dto.CalculatePartItemRequest;
import br.edu.ifpb.alumigest.partsale.dto.CalculatePartItemResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class AluminumProfilePartCalculatorTest {

    private AluminumProfilePartCalculator calculator;

    @BeforeEach
    void setUp() {
        calculator = new AluminumProfilePartCalculator();
    }

    @Test
    @DisplayName("Deve registrar a categoria de material como PROFILE")
    void deveRegistrarCategoriaProfile() {
        assertThat(calculator.getCategory()).isEqualTo(MaterialCategoryType.PROFILE);
    }

    @Test
    @DisplayName("Deve calcular metragem linear simples sem perda com precisão")
    void deveCalcularMetragemLinearSimplesSemPerda() {
        // 2500 mm (2.5m) * 4 peças = 10.0000 m * R$ 45,00/m = R$ 450,00
        CalculatePartItemRequest request = new CalculatePartItemRequest(
            MaterialCategoryType.PROFILE,
            null,
            2500,
            4,
            new BigDecimal("45.00"),
            BigDecimal.ZERO
        );

        CalculatePartItemResponse response = calculator.calculate(request);

        assertThat(response.calculatedUnitMeasure()).isEqualByComparingTo("10.0000");
        assertThat(response.unitPrice()).isEqualByComparingTo("45.00");
        assertThat(response.totalPrice()).isEqualByComparingTo("450.00");
    }

    @Test
    @DisplayName("Deve aplicar fator de perda de corte (5%) sobre a metragem faturada")
    void deveCalcularMetragemLinearComFatorDePerda() {
        // 2500 mm (2.5m) * 4 peças = 10m líq * 1.05 = 10.5000 m fat * R$ 45,00 = R$ 472,50
        CalculatePartItemRequest request = new CalculatePartItemRequest(
            MaterialCategoryType.PROFILE,
            null,
            2500,
            4,
            new BigDecimal("45.00"),
            new BigDecimal("0.05")
        );

        CalculatePartItemResponse response = calculator.calculate(request);

        assertThat(response.calculatedUnitMeasure()).isEqualByComparingTo("10.5000");
        assertThat(response.unitPrice()).isEqualByComparingTo("45.00");
        assertThat(response.totalPrice()).isEqualByComparingTo("472.50");
    }

    @Test
    @DisplayName("Deve tratar fator de perda nulo como zero sem disparar NullPointerException")
    void deveTratarFatorDePerdaNuloComoZero() {
        CalculatePartItemRequest request = new CalculatePartItemRequest(
            MaterialCategoryType.PROFILE,
            null,
            1200,
            2,
            new BigDecimal("30.00"),
            null
        );

        CalculatePartItemResponse response = calculator.calculate(request);

        // 1200 mm (1.2m) * 2 = 2.4000 m * 30.00 = 72.00
        assertThat(response.calculatedUnitMeasure()).isEqualByComparingTo("2.4000");
        assertThat(response.totalPrice()).isEqualByComparingTo("72.00");
    }

    @ParameterizedTest
    @ValueSource(ints = {0, -1, -500})
    @DisplayName("Deve rejeitar comprimento zerado ou negativo")
    void deveLancarExcecaoQuandoComprimentoForZeroOuNegativo(int invalidHeight) {
        CalculatePartItemRequest request = new CalculatePartItemRequest(
            MaterialCategoryType.PROFILE,
            null,
            invalidHeight,
            1,
            new BigDecimal("50.00"),
            BigDecimal.ZERO
        );

        assertThatThrownBy(() -> calculator.calculate(request))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("O comprimento do perfil de alumínio deve ser maior que zero");
    }

    @Test
    @DisplayName("Deve rejeitar comprimento que exceda o tamanho padrão da barra industrial (6000 mm)")
    void deveLancarExcecaoQuandoComprimentoExcederLimite6000mm() {
        CalculatePartItemRequest request = new CalculatePartItemRequest(
            MaterialCategoryType.PROFILE,
            null,
            6001,
            1,
            new BigDecimal("50.00"),
            BigDecimal.ZERO
        );

        assertThatThrownBy(() -> calculator.calculate(request))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("não pode exceder o tamanho padrão da barra industrial (6000 mm)");
    }

    @Test
    @DisplayName("Deve aceitar comprimento de barra inteira de exatamente 6000 mm")
    void deveAceitarBarraInteiraDe6000mm() {
        CalculatePartItemRequest request = new CalculatePartItemRequest(
            MaterialCategoryType.PROFILE,
            null,
            6000,
            1,
            new BigDecimal("50.00"),
            BigDecimal.ZERO
        );

        CalculatePartItemResponse response = calculator.calculate(request);

        assertThat(response.calculatedUnitMeasure()).isEqualByComparingTo("6.0000");
        assertThat(response.totalPrice()).isEqualByComparingTo("300.00");
    }

    @ParameterizedTest
    @ValueSource(ints = {0, -1, -10})
    @DisplayName("Deve rejeitar quantidade zerada ou negativa")
    void deveLancarExcecaoQuandoQuantidadeForInvalida(int invalidQuantity) {
        CalculatePartItemRequest request = new CalculatePartItemRequest(
            MaterialCategoryType.PROFILE,
            null,
            2000,
            invalidQuantity,
            new BigDecimal("50.00"),
            BigDecimal.ZERO
        );

        assertThatThrownBy(() -> calculator.calculate(request))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("A quantidade de barras ou peças deve ser maior que zero");
    }

    @Test
    @DisplayName("Deve rejeitar preço unitário zerado ou negativo")
    void deveLancarExcecaoQuandoPrecoUnitarioForInvalido() {
        CalculatePartItemRequest request = new CalculatePartItemRequest(
            MaterialCategoryType.PROFILE,
            null,
            2000,
            1,
            BigDecimal.ZERO,
            BigDecimal.ZERO
        );

        assertThatThrownBy(() -> calculator.calculate(request))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("O preço unitário por metro deve ser maior que zero");
    }

    @Test
    @DisplayName("Deve rejeitar requisição nula")
    void deveLancarExcecaoQuandoRequisicaoNula() {
        assertThatThrownBy(() -> calculator.calculate(null))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("A requisição de cálculo não pode ser nula");
    }
}
