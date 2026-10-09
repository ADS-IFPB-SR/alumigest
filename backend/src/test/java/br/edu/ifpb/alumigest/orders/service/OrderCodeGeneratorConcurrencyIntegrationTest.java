package br.edu.ifpb.alumigest.orders.service;

import br.edu.ifpb.alumigest.orders.repository.OrderRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

import java.time.Year;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Testes concorrentes com threads reais para validar o gerador sequencial de códigos anuais (OS-YYYY-NNNN).
 * Requisitos: US-13.2 / Issue #408 (Critério de Aceite CA-3: ausência de colisão com threads concorrentes).
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
@Import(OrderCodeGenerator.class)
@DisplayName("Testes de Concorrência: OrderCodeGenerator (Issue #408 / CA-3)")
class OrderCodeGeneratorConcurrencyIntegrationTest {

    @Autowired
    private OrderCodeGenerator orderCodeGenerator;

    @Autowired
    private OrderRepository orderRepository;

    @Test
    @DisplayName("[CA-1 e CA-3] Múltiplas threads concorrentes geram códigos sequenciais únicos sem colisão")
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
                    startLatch.await();
                    String code = orderCodeGenerator.generateNextCode();
                    generatedCodes.add(code);
                } catch (Throwable t) {
                    errors.add(t);
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        readyLatch.await(5, TimeUnit.SECONDS);
        startLatch.countDown();

        boolean completed = doneLatch.await(10, TimeUnit.SECONDS);
        executor.shutdown();

        assertThat(completed).as("Todas as threads devem concluir no tempo limite").isTrue();
        assertThat(errors).as("Nenhuma exceção deve ocorrer nas threads concorrentes").isEmpty();
        assertThat(generatedCodes)
                .as("Todos os códigos gerados devem ser únicos e totalizar %d", threadCount)
                .hasSize(threadCount)
                .allMatch(code -> code.startsWith(expectedPrefix));
    }
}
