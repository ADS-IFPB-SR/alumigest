package br.edu.ifpb.alumigest.orders.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;

import br.edu.ifpb.alumigest.orders.domain.Order;
import br.edu.ifpb.alumigest.orders.repository.OrderRepository;
import java.time.Year;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;

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

    @Test
    @DisplayName("[BUG-037 / #434] Deve ignorar código malformado e extrair o próximo a partir do código numérico válido")
    void deveIgnorarCodigoMalformadoEAlocarProximoValidoComMaisDe500Ordens() {
        // Simula consulta retornando código malformado primeiro e em seguida o válido 0501
        given(orderRepository.findRecentCodigosByPrefix(eq(currentYearPrefix), any(PageRequest.class)))
                .willReturn(List.of(currentYearPrefix + "XXYZ", currentYearPrefix + "0501"));

        // Simula que os primeiros 501 códigos (0001 a 0501) já estão ocupados
        given(orderRepository.existsByCodigo(org.mockito.ArgumentMatchers.anyString()))
                .willAnswer(invocation -> {
                    String candidate = invocation.getArgument(0);
                    int num = Integer.parseInt(candidate.substring(currentYearPrefix.length()));
                    return num <= 501;
                });

        String code = orderCodeGenerator.generateNextCode();

        // Deve ignorar XXYZ, ler 0501 e alocar 0502 com sucesso sem estourar limite
        assertThat(code).isEqualTo(currentYearPrefix + "0502");
    }

    @Test
    @DisplayName("[BUG-037 / #434] Deve ignorar múltiplos códigos malformados até encontrar um código numérico válido")
    void deveIgnorarMultiplosCodigosMalformadosAteEncontrarValido() {
        given(orderRepository.findRecentCodigosByPrefix(eq(currentYearPrefix), any(PageRequest.class)))
                .willReturn(List.of(
                        currentYearPrefix + "ZZZZ",
                        currentYearPrefix + "INVALIDO",
                        currentYearPrefix + "0010"
                ));
        given(orderRepository.existsByCodigo(currentYearPrefix + "0011"))
                .willReturn(false);

        String code = orderCodeGenerator.generateNextCode();

        assertThat(code).isEqualTo(currentYearPrefix + "0011");
    }

    @Test
    @DisplayName("[BUG-037 / #434] Deve iniciar em 1 caso todos os códigos recentes sejam malformados")
    void deveIniciarEm1SeTodosOsCodigosForemMalformados() {
        given(orderRepository.findRecentCodigosByPrefix(eq(currentYearPrefix), any(PageRequest.class)))
                .willReturn(List.of(currentYearPrefix + "ABC", currentYearPrefix + "XYZ"));
        given(orderRepository.existsByCodigo(currentYearPrefix + "0001"))
                .willReturn(false);

        String code = orderCodeGenerator.generateNextCode();

        assertThat(code).isEqualTo(currentYearPrefix + "0001");
    }
}
