package br.edu.ifpb.alumigest.stock.dto;

import br.edu.ifpb.alumigest.stock.domain.StockMovementType;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import java.math.BigDecimal;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("StockMovementRequestDTO — Testes de Validação de Dados")
class StockMovementRequestDTOTest {

    private Validator validator;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    @DisplayName("Deve passar na validação quando todos os campos obrigatórios forem válidos")
    void shouldPassValidationWhenValid() {
        StockMovementRequestDTO dto = new StockMovementRequestDTO(
            UUID.randomUUID(),
            StockMovementType.PURCHASE_ENTRY,
            new BigDecimal("10.5"),
            new BigDecimal("150.00"),
            "Entrada NF 1234",
            "NF-1234",
            "almoxarife"
        );

        Set<ConstraintViolation<StockMovementRequestDTO>> violations = validator.validate(dto);

        assertThat(violations).isEmpty();
    }

    @Test
    @DisplayName("Deve falhar na validação quando materialId for nulo")
    void shouldFailWhenMaterialIdIsNull() {
        StockMovementRequestDTO dto = new StockMovementRequestDTO(
            null,
            StockMovementType.PURCHASE_ENTRY,
            new BigDecimal("10"),
            null,
            null,
            null,
            null
        );

        Set<ConstraintViolation<StockMovementRequestDTO>> violations = validator.validate(dto);

        assertThat(violations)
            .isNotEmpty()
            .anyMatch(v -> v.getPropertyPath().toString().equals("materialId"));
    }

    @Test
    @DisplayName("Deve falhar na validação quando tipo de movimentação for nulo")
    void shouldFailWhenTypeIsNull() {
        StockMovementRequestDTO dto = new StockMovementRequestDTO(
            UUID.randomUUID(),
            null,
            new BigDecimal("10"),
            null,
            null,
            null,
            null
        );

        Set<ConstraintViolation<StockMovementRequestDTO>> violations = validator.validate(dto);

        assertThat(violations)
            .isNotEmpty()
            .anyMatch(v -> v.getPropertyPath().toString().equals("type"));
    }

    @Test
    @DisplayName("Deve falhar na validação quando quantidade for zero ou negativa")
    void shouldFailWhenQuantityIsZeroOrNegative() {
        StockMovementRequestDTO dtoZero = new StockMovementRequestDTO(
            UUID.randomUUID(),
            StockMovementType.PURCHASE_ENTRY,
            BigDecimal.ZERO,
            null,
            null,
            null,
            null
        );

        StockMovementRequestDTO dtoNegative = new StockMovementRequestDTO(
            UUID.randomUUID(),
            StockMovementType.PURCHASE_ENTRY,
            new BigDecimal("-5.0"),
            null,
            null,
            null,
            null
        );

        Set<ConstraintViolation<StockMovementRequestDTO>> violationsZero = validator.validate(dtoZero);
        Set<ConstraintViolation<StockMovementRequestDTO>> violationsNegative = validator.validate(dtoNegative);

        assertThat(violationsZero)
            .isNotEmpty()
            .anyMatch(v -> v.getPropertyPath().toString().equals("quantity"));

        assertThat(violationsNegative)
            .isNotEmpty()
            .anyMatch(v -> v.getPropertyPath().toString().equals("quantity"));
    }
}
