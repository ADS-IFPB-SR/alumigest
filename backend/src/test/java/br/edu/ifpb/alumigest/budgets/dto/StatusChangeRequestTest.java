package br.edu.ifpb.alumigest.budgets.dto;

import br.edu.ifpb.alumigest.budgets.domain.BudgetStatus;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class StatusChangeRequestTest {

    private static Validator validator;
    private static ObjectMapper objectMapper;

    @BeforeAll
    static void setUp() {
        try (ValidatorFactory factory = Validation.buildDefaultValidatorFactory()) {
            validator = factory.getValidator();
        }
        objectMapper = new ObjectMapper();
    }

    @Test
    @DisplayName("Deve ser um record imutável")
    void deveSerRecordImutavel() {
        assertThat(StatusChangeRequest.class.isRecord()).isTrue();
    }

    @Test
    @DisplayName("Deve validar com sucesso quando novoStatus for fornecido")
    void deveValidarComSucessoQuandoNovoStatusInformado() {
        var request = new StatusChangeRequest(BudgetStatus.SENT);

        var violations = validator.validate(request);
        assertThat(violations).isEmpty();
        assertThat(request.novoStatus()).isEqualTo(BudgetStatus.SENT);
        assertThat(request.status()).isEqualTo(BudgetStatus.SENT);
    }

    @Test
    @DisplayName("Deve rejeitar quando novoStatus for nulo com mensagem correta")
    void deveRejeitarQuandoNovoStatusNulo() {
        var request = new StatusChangeRequest(null);

        var violations = validator.validate(request);
        assertThat(violations)
                .hasSize(1)
                .extracting("message")
                .containsExactly("Novo status é obrigatório");
    }

    @Test
    @DisplayName("Deve desserializar JSON com campo novoStatus")
    void deveDesserializarJsonComCampoNovoStatus() throws Exception {
        String json = "{\"novoStatus\":\"APPROVED\"}";
        StatusChangeRequest request = objectMapper.readValue(json, StatusChangeRequest.class);

        assertThat(request.novoStatus()).isEqualTo(BudgetStatus.APPROVED);
        assertThat(request.status()).isEqualTo(BudgetStatus.APPROVED);
    }

    @Test
    @DisplayName("Deve desserializar JSON com alias 'status' legado")
    void deveDesserializarJsonComAliasStatus() throws Exception {
        String json = "{\"status\":\"REJECTED\"}";
        StatusChangeRequest request = objectMapper.readValue(json, StatusChangeRequest.class);

        assertThat(request.novoStatus()).isEqualTo(BudgetStatus.REJECTED);
        assertThat(request.status()).isEqualTo(BudgetStatus.REJECTED);
    }

    @Test
    @DisplayName("Deve desserializar JSON com alias 'newStatus'")
    void deveDesserializarJsonComAliasNewStatus() throws Exception {
        String json = "{\"newStatus\":\"CANCELLED\"}";
        StatusChangeRequest request = objectMapper.readValue(json, StatusChangeRequest.class);

        assertThat(request.novoStatus()).isEqualTo(BudgetStatus.CANCELLED);
        assertThat(request.status()).isEqualTo(BudgetStatus.CANCELLED);
    }

    @Test
    @DisplayName("Deve interoperar corretamente com BudgetStatusUpdateDTO")
    void deveInteroperarComBudgetStatusUpdateDTO() {
        BudgetStatusUpdateDTO dto = new BudgetStatusUpdateDTO(BudgetStatus.SENT);
        assertThat(dto.novoStatus()).isEqualTo(BudgetStatus.SENT);
        assertThat(dto.status()).isEqualTo(BudgetStatus.SENT);

        StatusChangeRequest requestFromDto = StatusChangeRequest.from(dto);
        assertThat(requestFromDto).isNotNull();
        assertThat(requestFromDto.novoStatus()).isEqualTo(BudgetStatus.SENT);

        StatusChangeRequest converted = dto.toStatusChangeRequest();
        assertThat(converted.novoStatus()).isEqualTo(BudgetStatus.SENT);
    }

    @Test
    @DisplayName("Deve validar @NotNull em BudgetStatusUpdateDTO com mensagem alinhada")
    void deveValidarBudgetStatusUpdateDTOComMensagemAlinhada() {
        BudgetStatusUpdateDTO dto = new BudgetStatusUpdateDTO(null);
        var violations = validator.validate(dto);
        assertThat(violations)
                .hasSize(1)
                .extracting("message")
                .containsExactly("Novo status é obrigatório");
    }
}
