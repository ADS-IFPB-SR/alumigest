package br.edu.ifpb.alumigest.orders.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;

import br.edu.ifpb.alumigest.orders.domain.Order;
import br.edu.ifpb.alumigest.orders.repository.OrderRepository;
import java.time.Year;
import java.time.ZoneOffset;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("Testes Unitários: OrderCodeGenerator (OS-YYYY-NNNN)")
class OrderCodeGeneratorTest {

    @Mock
    private OrderRepository orderRepository;

    @InjectMocks
    private OrderCodeGenerator orderCodeGenerator;

    private String currentYearPrefix;

    @BeforeEach
    void setUp() {
        int currentYear = Year.now(ZoneOffset.UTC).getValue();
        currentYearPrefix = String.format("OS-%d-", currentYear);
    }

    @Test
    @DisplayName("Deve gerar primeiro código do ano (OS-YYYY-0001) quando não existirem ordens cadastradas")
    void shouldGenerateFirstCodeOfYearWhenNoOrdersExist() {
        given(orderRepository.findTopByCodigoStartingWithOrderByCodigoDesc(currentYearPrefix))
                .willReturn(Optional.empty());
        given(orderRepository.existsByCodigo(currentYearPrefix + "0001"))
                .willReturn(false);

        String code = orderCodeGenerator.generateNextCode();

        assertThat(code).isEqualTo(currentYearPrefix + "0001");
    }

    @Test
    @DisplayName("Deve gerar próximo código sequencial incrementando o último encontrado")
    void shouldGenerateNextSequentialCode() {
        Order lastOrder = Order.builder()
                .codigo(currentYearPrefix + "0042")
                .build();

        given(orderRepository.findTopByCodigoStartingWithOrderByCodigoDesc(currentYearPrefix))
                .willReturn(Optional.of(lastOrder));
        given(orderRepository.existsByCodigo(currentYearPrefix + "0043"))
                .willReturn(false);

        String code = orderCodeGenerator.generateNextCode();

        assertThat(code).isEqualTo(currentYearPrefix + "0043");
    }

    @Test
    @DisplayName("Deve recuperar de erro de parsing caso o último código tenha formato inválido")
    void shouldHandleInvalidFormatGracefully() {
        Order lastOrder = Order.builder()
                .codigo(currentYearPrefix + "XYZ")
                .build();

        given(orderRepository.findTopByCodigoStartingWithOrderByCodigoDesc(currentYearPrefix))
                .willReturn(Optional.of(lastOrder));
        given(orderRepository.existsByCodigo(currentYearPrefix + "0001"))
                .willReturn(false);

        String code = orderCodeGenerator.generateNextCode();

        assertThat(code).isEqualTo(currentYearPrefix + "0001");
    }

    @Test
    @DisplayName("Deve pular códigos que já existam no banco até encontrar um livre")
    void shouldSkipCodesIfCandidateAlreadyExistsInDatabase() {
        Order lastOrder = Order.builder()
                .codigo(currentYearPrefix + "0005")
                .build();

        given(orderRepository.findTopByCodigoStartingWithOrderByCodigoDesc(currentYearPrefix))
                .willReturn(Optional.of(lastOrder));
        // 0006 já existe (gap/conflito legado), 0007 está livre
        given(orderRepository.existsByCodigo(currentYearPrefix + "0006"))
                .willReturn(true);
        given(orderRepository.existsByCodigo(currentYearPrefix + "0007"))
                .willReturn(false);

        String code = orderCodeGenerator.generateNextCode();

        assertThat(code).isEqualTo(currentYearPrefix + "0007");
    }
}
