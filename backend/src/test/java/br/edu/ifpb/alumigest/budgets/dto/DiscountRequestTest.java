package br.edu.ifpb.alumigest.budgets.dto;

import br.edu.ifpb.alumigest.budgets.domain.DiscountType;
import br.edu.ifpb.alumigest.budgets.domain.PaymentCondition;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class DiscountRequestTest {

    private static Validator validator;

    @BeforeAll
    static void setUp() {
        try (ValidatorFactory factory = Validation.buildDefaultValidatorFactory()) {
            validator = factory.getValidator();
        }
    }

    @Test
    @DisplayName("Deve validar com sucesso quando todos os dados estiverem válidos")
    void deveValidarComSucesso() {
        var request = new DiscountRequest(
                DiscountType.PERCENTUAL,
                BigDecimal.valueOf(10),
                PaymentCondition.A_VISTA_PIX,
                "Observação válida",
                LocalDate.now().plusDays(5)
        );

        var violations = validator.validate(request);
        assertThat(violations).isEmpty();
    }

    @Test
    @DisplayName("Deve rejeitar quando campos obrigatórios forem nulos")
    void deveRejeitarCamposNulos() {
        var request = new DiscountRequest(null, null, null, null, null);

        var violations = validator.validate(request);
        assertThat(violations).hasSize(3);
    }

    @Test
    @DisplayName("Deve rejeitar valor de desconto negativo")
    void deveRejeitarValorNegativo() {
        var request = new DiscountRequest(
                DiscountType.VALOR_FIXO,
                BigDecimal.valueOf(-15),
                PaymentCondition.CARTAO_12X,
                null,
                null
        );

        var violations = validator.validate(request);
        assertThat(violations)
                .hasSize(1)
                .extracting("message")
                .containsExactly("Valor do desconto não pode ser negativo");
    }

    @Test
    @DisplayName("Deve validar com sucesso quando campos opcionais forem nulos")
    void deveValidarComCamposOpcionaisNulos() {
        var request = new DiscountRequest(
                DiscountType.PERCENTUAL,
                BigDecimal.valueOf(15),
                PaymentCondition.A_VISTA_PIX,
                null,
                null
        );

        var violations = validator.validate(request);
        assertThat(violations).isEmpty();
    }

    @Test
    @DisplayName("Deve permitir desconto em valor fixo maior que 100")
    void devePermitirDescontoFixoMaiorQue100() {
        var request = new DiscountRequest(
                DiscountType.VALOR_FIXO,
                BigDecimal.valueOf(250.0),
                PaymentCondition.A_VISTA_PIX,
                null,
                null
        );

        var violations = validator.validate(request);
        assertThat(violations).isEmpty();
    }

    @Test
    @DisplayName("Deve rejeitar data de validade no passado")
    void deveRejeitarDataRetroativa() {
        var request = new DiscountRequest(
                DiscountType.VALOR_FIXO,
                BigDecimal.valueOf(50),
                PaymentCondition.ENTRADA_50_SALDO_ENTREGA,
                null,
                LocalDate.now().minusDays(1)
        );

        var violations = validator.validate(request);
        assertThat(violations)
                .hasSize(1)
                .extracting("message")
                .containsExactly("A data de validade não pode ser anterior a hoje");
    }

    @Test
    @DisplayName("Deve rejeitar observações com mais de 500 caracteres")
    void deveRejeitarObservacoesLongas() {
        var request = new DiscountRequest(
                DiscountType.VALOR_FIXO,
                BigDecimal.valueOf(50),
                PaymentCondition.A_COMBINAR,
                "A".repeat(501),
                null
        );

        var violations = validator.validate(request);
        assertThat(violations)
                .hasSize(1)
                .extracting("message")
                .containsExactly("As observações de pagamento não podem exceder 500 caracteres");
    }
}
