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
     * @param clientId     ID do cliente criado no teste
     * @param budgetId     ID do orçamento criado no teste
     * @param orderId      ID da ordem de serviço gerada no teste
     * @param clientName   Nome ou prefixo do cliente para limpeza alternativa por texto
     * @param partSaleId   ID da venda avulsa criada no teste
     * @param partSaleCode Código da venda avulsa criada no teste
     */
    public record TestCleanupRequest(
            String clientId,
            String budgetId,
            String orderId,
            String clientName,
            String partSaleId,
            String partSaleCode
    ) {}

    private UUID parseUuidOrNull(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        try {
            return UUID.fromString(raw.trim());
        } catch (IllegalArgumentException e) {
            log.debug("Ignorando identificador de limpeza não-UUID: {}", raw);
            return null;
        }
    }

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

        UUID clientUuid = parseUuidOrNull(request.clientId());
        UUID budgetUuid = parseUuidOrNull(request.budgetId());
        UUID orderUuid = parseUuidOrNull(request.orderId());
        UUID partSaleUuid = parseUuidOrNull(request.partSaleId());

        log.info("Executando Hard Delete de teste: clientId={}, budgetId={}, orderId={}, clientName={}, partSaleId={}, partSaleCode={}",
                clientUuid, budgetUuid, orderUuid, request.clientName(), partSaleUuid, request.partSaleCode());

        // 1. Exclui ordens de serviço por ID (de baixo para cima para respeitar todas as FKs)
        if (orderUuid != null) {
            jdbcTemplate.update(
                    "DELETE FROM tb_order_item_options WHERE order_item_id IN (SELECT id FROM tb_order_items WHERE order_id = ?)",
                    orderUuid);
            jdbcTemplate.update("DELETE FROM tb_order_items WHERE order_id = ?", orderUuid);
            jdbcTemplate.update("DELETE FROM tb_orders WHERE id = ?", orderUuid);
        }

        // 2. Exclui ordens derivadas e o próprio orçamento por ID
        if (budgetUuid != null) {
            jdbcTemplate.update(
                    """
                    DELETE FROM tb_order_item_options
                    WHERE order_item_id IN (
                        SELECT oi.id FROM tb_order_items oi
                        JOIN tb_orders o ON oi.order_id = o.id
                        WHERE o.orcamento_id = ?
                    )
                    """,
                    budgetUuid);
            jdbcTemplate.update(
                    "DELETE FROM tb_order_items WHERE order_id IN (SELECT id FROM tb_orders WHERE orcamento_id = ?)",
                    budgetUuid);
            jdbcTemplate.update("DELETE FROM tb_orders WHERE orcamento_id = ?", budgetUuid);
            jdbcTemplate.update(
                    "DELETE FROM tb_budget_item_options WHERE budget_item_id IN (SELECT id FROM tb_budget_items WHERE budget_id = ?)",
                    budgetUuid);
            jdbcTemplate.update("DELETE FROM tb_budget_items WHERE budget_id = ?", budgetUuid);
            jdbcTemplate.update("DELETE FROM tb_budgets WHERE id = ?", budgetUuid);
        }

        // 3. Exclui cliente por ID e todos os vínculos dependentes (O.S., Orçamentos e Vendas Avulsas)
        if (clientUuid != null) {
            jdbcTemplate.update(
                    """
                    DELETE FROM tb_order_item_options
                    WHERE order_item_id IN (
                        SELECT oi.id FROM tb_order_items oi
                        JOIN tb_orders o ON oi.order_id = o.id
                        WHERE o.cliente_id = ?
                           OR o.orcamento_id IN (SELECT id FROM tb_budgets WHERE client_id = ?)
                    )
                    """,
                    clientUuid,
                    clientUuid);
            jdbcTemplate.update(
                    """
                    DELETE FROM tb_order_items
                    WHERE order_id IN (
                        SELECT id FROM tb_orders
                        WHERE cliente_id = ?
                           OR orcamento_id IN (SELECT id FROM tb_budgets WHERE client_id = ?)
                    )
                    """,
                    clientUuid,
                    clientUuid);
            jdbcTemplate.update(
                    """
                    DELETE FROM tb_orders
                    WHERE cliente_id = ?
                       OR orcamento_id IN (SELECT id FROM tb_budgets WHERE client_id = ?)
                    """,
                    clientUuid,
                    clientUuid);
            jdbcTemplate.update(
                    """
                    DELETE FROM tb_budget_item_options
                    WHERE budget_item_id IN (
                        SELECT bi.id FROM tb_budget_items bi
                        JOIN tb_budgets b ON bi.budget_id = b.id
                        WHERE b.client_id = ?
                    )
                    """,
                    clientUuid);
            jdbcTemplate.update(
                    "DELETE FROM tb_budget_items WHERE budget_id IN (SELECT id FROM tb_budgets WHERE client_id = ?)",
                    clientUuid);
            jdbcTemplate.update("DELETE FROM tb_budgets WHERE client_id = ?", clientUuid);
            jdbcTemplate.update(
                    "DELETE FROM tb_part_sale_items WHERE part_sale_id IN (SELECT id FROM tb_part_sales WHERE client_id = ?)",
                    clientUuid);
            jdbcTemplate.update("DELETE FROM tb_part_sales WHERE client_id = ?", clientUuid);
            jdbcTemplate.update("DELETE FROM tb_clients WHERE id = ?", clientUuid);
        }

        // 4. Limpeza de contingência por nome do cliente (tb_clients.full_name / tb_orders.cliente_nome)
        if (request.clientName() != null && !request.clientName().isBlank()) {
            String pattern = "%" + request.clientName() + "%";
            jdbcTemplate.update(
                    """
                    DELETE FROM tb_order_item_options
                    WHERE order_item_id IN (
                        SELECT oi.id FROM tb_order_items oi
                        JOIN tb_orders o ON oi.order_id = o.id
                        WHERE o.cliente_nome LIKE ?
                           OR o.cliente_id IN (SELECT id FROM tb_clients WHERE full_name LIKE ?)
                           OR o.orcamento_id IN (
                               SELECT b.id FROM tb_budgets b
                               JOIN tb_clients c ON b.client_id = c.id
                               WHERE c.full_name LIKE ?
                           )
                    )
                    """,
                    pattern,
                    pattern,
                    pattern);
            jdbcTemplate.update(
                    """
                    DELETE FROM tb_order_items
                    WHERE order_id IN (
                        SELECT o.id FROM tb_orders o
                        WHERE o.cliente_nome LIKE ?
                           OR o.cliente_id IN (SELECT id FROM tb_clients WHERE full_name LIKE ?)
                           OR o.orcamento_id IN (
                               SELECT b.id FROM tb_budgets b
                               JOIN tb_clients c ON b.client_id = c.id
                               WHERE c.full_name LIKE ?
                           )
                    )
                    """,
                    pattern,
                    pattern,
                    pattern);
            jdbcTemplate.update(
                    """
                    DELETE FROM tb_orders
                    WHERE cliente_nome LIKE ?
                       OR cliente_id IN (SELECT id FROM tb_clients WHERE full_name LIKE ?)
                       OR orcamento_id IN (
                           SELECT b.id FROM tb_budgets b
                           JOIN tb_clients c ON b.client_id = c.id
                           WHERE c.full_name LIKE ?
                       )
                    """,
                    pattern,
                    pattern,
                    pattern);

            jdbcTemplate.update(
                    """
                    DELETE FROM tb_budget_item_options
                    WHERE budget_item_id IN (
                        SELECT bi.id FROM tb_budget_items bi
                        JOIN tb_budgets b ON bi.budget_id = b.id
                        JOIN tb_clients c ON b.client_id = c.id
                        WHERE c.full_name LIKE ?
                    )
                    """,
                    pattern);
            jdbcTemplate.update(
                    """
                    DELETE FROM tb_budget_items
                    WHERE budget_id IN (
                        SELECT b.id FROM tb_budgets b
                        JOIN tb_clients c ON b.client_id = c.id
                        WHERE c.full_name LIKE ?
                    )
                    """,
                    pattern);
            jdbcTemplate.update(
                    "DELETE FROM tb_budgets WHERE client_id IN (SELECT id FROM tb_clients WHERE full_name LIKE ?)",
                    pattern);
            jdbcTemplate.update(
                    """
                    DELETE FROM tb_part_sale_items
                    WHERE part_sale_id IN (
                        SELECT ps.id FROM tb_part_sales ps
                        JOIN tb_clients c ON ps.client_id = c.id
                        WHERE c.full_name LIKE ?
                    )
                    """,
                    pattern);
            jdbcTemplate.update(
                    "DELETE FROM tb_part_sales WHERE client_id IN (SELECT id FROM tb_clients WHERE full_name LIKE ?)",
                    pattern);
            jdbcTemplate.update("DELETE FROM tb_clients WHERE full_name LIKE ?", pattern);
        }

        // 5. Exclui venda avulsa e itens associados (tb_part_sales e tb_part_sale_items)
        if (partSaleUuid != null) {
            jdbcTemplate.update("DELETE FROM tb_part_sale_items WHERE part_sale_id = ?", partSaleUuid);
            jdbcTemplate.update("DELETE FROM tb_part_sales WHERE id = ?", partSaleUuid);
        }

        if (request.partSaleCode() != null && !request.partSaleCode().isBlank()) {
            jdbcTemplate.update(
                    "DELETE FROM tb_part_sale_items WHERE part_sale_id IN (SELECT id FROM tb_part_sales WHERE code = ?)",
                    request.partSaleCode());
            jdbcTemplate.update("DELETE FROM tb_part_sales WHERE code = ?", request.partSaleCode());
        }

        return ResponseEntity.noContent().build();
    }
}
