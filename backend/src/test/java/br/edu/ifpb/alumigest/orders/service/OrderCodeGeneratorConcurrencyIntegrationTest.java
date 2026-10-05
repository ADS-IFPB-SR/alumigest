package br.edu.ifpb.alumigest.orders.service;

import br.edu.ifpb.alumigest.clients.domain.Client;
import br.edu.ifpb.alumigest.clients.domain.PersonType;
import br.edu.ifpb.alumigest.clients.repository.ClientRepository;
import br.edu.ifpb.alumigest.orders.domain.ApprovalChannel;
import br.edu.ifpb.alumigest.orders.domain.Order;
import br.edu.ifpb.alumigest.orders.domain.OrderStatus;
import br.edu.ifpb.alumigest.orders.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Year;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Testes de integração concorrente para validar o gerador sequencial de códigos anuais (OS-YYYY-NNNN).
 * Requisitos: US-13.2 / Issue #408 (Critério de Aceite CA-3: Teste de integração concorrente comprova ausência de colisão).
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
@Import(OrderCodeGenerator.class)
@Transactional(propagation = Propagation.NOT_SUPPORTED)
@DisplayName("Testes de Integração Concorrente: OrderCodeGenerator (Issue #408 / CA-3)")
class OrderCodeGeneratorConcurrencyIntegrationTest {

    @Autowired
    private OrderCodeGenerator orderCodeGenerator;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ClientRepository clientRepository;

    private Client client;

    @BeforeEach
    void setUp() {
        orderRepository.deleteAll();
        clientRepository.deleteAll();

        client = new Client();
        client.setFullName("Cliente Concorrência Teste");
        client.setPersonType(PersonType.FISICA);
        client.setDocumentNumber("11122233344");
        client.setPhone("83999990000");
        client.setEmail("concorrencia@example.com");
        client = clientRepository.save(client);
    }

    @Test
    @DisplayName("[CA-1 e CA-3] Múltiplas conversões concorrentes geram códigos distintos sem colisão")
    void shouldGenerateUniqueSequentialCodesConcurrentlyWithoutCollision() throws InterruptedException {
        int threadCount = 10;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch readyLatch = new CountDownLatch(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(threadCount);

        Set<String> generatedCodes = Collections.synchronizedSet(new HashSet<>());
        List<Throwable> errors = Collections.synchronizedList(new ArrayList<>());

        int currentYear = Year.now(ZoneOffset.UTC).getValue();
        String expectedPrefix = String.format("OS-%d-", currentYear);

        for (int i = 0; i < threadCount; i++) {
            executor.submit(() -> {
                readyLatch.countDown();
                try {
                    // Aguarda todas as threads estarem prontas para disparo simultâneo
                    startLatch.await();

                    String code = orderCodeGenerator.generateNextCode();
                    generatedCodes.add(code);

                    // Persiste a ordem no banco imediatamente para simular o ciclo real
                    Order order = Order.builder()
                            .codigo(code)
                            .orcamentoId(UUID.randomUUID())
                            .cliente(client)
                            .clienteNome(client.getFullName())
                            .clienteTelefone(client.getPhone())
                            .canalAprovacao(ApprovalChannel.WHATSAPP)
                            .status(OrderStatus.WAITING_PRODUCTION)
                            .dataPrevisaoEntrega(LocalDate.now(ZoneOffset.UTC).plusDays(15))
                            .valorBruto(new BigDecimal("1000.00"))
                            .valorLiquido(new BigDecimal("1000.00"))
                            .build();

                    orderRepository.saveAndFlush(order);
                } catch (Throwable t) {
                    errors.add(t);
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        // Aguarda todas as threads chegarem na barreira e inicia a execução simultânea
        readyLatch.await(5, TimeUnit.SECONDS);
        startLatch.countDown();

        boolean completed = doneLatch.await(10, TimeUnit.SECONDS);
        executor.shutdown();

        // Asserts
        assertThat(completed).as("Todas as threads devem concluir no tempo limite").isTrue();
        assertThat(errors).as("Nenhuma exceção deve ocorrer nas threads concorrentes").isEmpty();
        assertThat(generatedCodes).as("Todos os códigos gerados devem ser únicos e totalizar %d", threadCount)
                .hasSize(threadCount);

        // Todos os códigos devem iniciar com o prefixo anual correto
        assertThat(generatedCodes).allMatch(code -> code.startsWith(expectedPrefix));

        // Assegura que o banco persistiu exatamente threadCount ordens distintas
        long persistedCount = orderRepository.count();
        assertThat(persistedCount).isEqualTo(threadCount);
    }
}
