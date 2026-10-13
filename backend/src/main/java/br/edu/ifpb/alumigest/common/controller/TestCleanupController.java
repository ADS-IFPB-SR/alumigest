package br.edu.ifpb.alumigest.common.controller;

import io.swagger.v3.oas.annotations.Hidden;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/**
 * Controller de suporte para limpeza determinística de dados gerados em testes automatizados (E2E/Cypress).
 * <p>
 * <strong>Segurança Arquitetural:</strong>
 * Anotado com {@code @Profile({"dev", "test"})}, garantindo que este endpoint NUNCA seja registrado
 * ou carregado no contexto de produção.
 */
@Hidden
@Profile({"dev", "test"})
@RestController
@RequestMapping({"/api/v1/test-support", "/api/test-support"})
public class TestCleanupController {

    private static final Logger log = LoggerFactory.getLogger(TestCleanupController.class);

    private final JdbcTemplate jdbcTemplate;

    public TestCleanupController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
     * DTO de requisição de limpeza por identificadores.
     *
     * @param clientId    ID do cliente criado no teste
     * @param budgetId   ID do orçamento criado no teste
     * @param orderId    ID da ordem de serviço gerada no teste
     * @param clientName Nome ou prefixo do cliente para limpeza alternativa por texto
     */
    public record TestCleanupRequest(
            UUID clientId,
            UUID budgetId,
            UUID orderId,
            String clientName
    ) {}

    /**
     * Executa a exclusão física ordenada (Hard Delete) de entidades de teste para manter a base limpa.
     *
     * @param request dados das entidades a serem limpas
     * @return 204 No Content
     */
    @DeleteMapping("/cleanup")
    @Transactional
    public ResponseEntity<Void> cleanup(@RequestBody(required = false) TestCleanupRequest request) {
        if (request == null) {
            return ResponseEntity.noContent().build();
        }

        log.info("Executando Hard Delete de teste: clientId={}, budgetId={}, orderId={}, clientName={}",
                request.clientId(), request.budgetId(), request.orderId(), request.clientName());

        // 1. Exclui ordens de serviço (tabelas tb_order_item_options e tb_order_items são excluídas via CASCADE)
        if (request.orderId() != null) {
            jdbcTemplate.update("DELETE FROM tb_order_item_options WHERE order_item_id IN (SELECT id FROM tb_order_items WHERE order_id = ?)", request.orderId());
            jdbcTemplate.update("DELETE FROM tb_order_items WHERE order_id = ?", request.orderId());
            jdbcTemplate.update("DELETE FROM tb_orders WHERE id = ?", request.orderId());
        }

        if (request.budgetId() != null) {
            jdbcTemplate.update("DELETE FROM tb_orders WHERE orcamento_id = ?", request.budgetId());
            // 2. Exclui orçamento (tb_budget_items e tb_budget_item_options possuem CASCADE na foreign key)
            jdbcTemplate.update("DELETE FROM tb_budget_item_options WHERE budget_item_id IN (SELECT id FROM tb_budget_items WHERE budget_id = ?)", request.budgetId());
            jdbcTemplate.update("DELETE FROM tb_budget_items WHERE budget_id = ?", request.budgetId());
            jdbcTemplate.update("DELETE FROM tb_budgets WHERE id = ?", request.budgetId());
        }

        // 3. Exclui cliente por ID
        if (request.clientId() != null) {
            jdbcTemplate.update("DELETE FROM tb_orders WHERE cliente_id = ?", request.clientId());
            jdbcTemplate.update("DELETE FROM tb_budgets WHERE client_id = ?", request.clientId());
            jdbcTemplate.update("DELETE FROM tb_clients WHERE id = ?", request.clientId());
        }

        // 4. Limpeza de contingência por nome do cliente (ex: "Vidraçaria Esperança")
        if (request.clientName() != null && !request.clientName().isBlank()) {
            jdbcTemplate.update("""
                DELETE FROM tb_orders 
                WHERE cliente_id IN (SELECT id FROM tb_clients WHERE name LIKE ? OR cliente_nome LIKE ?)
            """, "%" + request.clientName() + "%", "%" + request.clientName() + "%");

            jdbcTemplate.update("""
                DELETE FROM tb_budgets 
                WHERE client_id IN (SELECT id FROM tb_clients WHERE name LIKE ?)
            """, "%" + request.clientName() + "%");

            jdbcTemplate.update("DELETE FROM tb_clients WHERE name LIKE ?", "%" + request.clientName() + "%");
        }

        return ResponseEntity.noContent().build();
    }
}
