package br.edu.ifpb.alumigest.budgets.domain;

import br.edu.ifpb.alumigest.catalog.domain.Material;
import br.edu.ifpb.alumigest.catalog.domain.MaterialCategoryType;
import br.edu.ifpb.alumigest.catalog.domain.Product;
import br.edu.ifpb.alumigest.clients.domain.Client;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class BudgetTest {

    @Test
    @DisplayName("Deve inicializar createdAt, updatedAt e validUntil (15 dias) no onCreate quando validUntil for nulo")
    void onCreate_ShouldInitializeDatesCorrectly() {
        Budget budget = new Budget();
        budget.onCreate();

        assertNotNull(budget.getCreatedAt());
        assertNotNull(budget.getUpdatedAt());
        assertNotNull(budget.getValidUntil());
        assertTrue(budget.getValidUntil().isAfter(budget.getCreatedAt()));
        assertEquals(budget.getCreatedAt().plusDays(15).getDayOfYear(), budget.getValidUntil().getDayOfYear());
    }

    @Test
    @DisplayName("Deve manter validUntil customizado no onCreate")
    void onCreate_WithCustomValidUntil_ShouldPreserveCustomDate() {
        Budget budget = new Budget();
        OffsetDateTime customValidUntil = OffsetDateTime.now().plusDays(30);
        budget.setValidUntil(customValidUntil);

        budget.onCreate();

        assertEquals(customValidUntil, budget.getValidUntil());
    }

    @Test
    @DisplayName("Deve atualizar updatedAt no onUpdate")
    void onUpdate_ShouldRefreshUpdatedAt() throws InterruptedException {
        Budget budget = new Budget();
        budget.onCreate();
        OffsetDateTime initialUpdatedAt = budget.getUpdatedAt();

        Thread.sleep(10);
        budget.onUpdate();

        assertTrue(budget.getUpdatedAt().isAfter(initialUpdatedAt) || budget.getUpdatedAt().isEqual(initialUpdatedAt));
    }

    @Test
    @DisplayName("Deve adicionar e remover itens no Budget mantendo o relacionamento bidirecional")
    void addItemAndRemoveItem_ShouldManageBidirectionalRelationship() {
        Budget budget = new Budget();
        budget.setCode("ORC-2026-0001");

        BudgetItem item = new BudgetItem();
        item.setProductName("Porta de Correr Suprema");
        item.setWidthMm(new BigDecimal("1200.00"));
        item.setHeightMm(new BigDecimal("2100.00"));

        budget.addItem(item);

        assertEquals(1, budget.getItems().size());
        assertEquals(budget, item.getBudget());

        budget.removeItem(item);

        assertEquals(0, budget.getItems().size());
        assertNull(item.getBudget());
    }

    @Test
    @DisplayName("Deve adicionar opções no BudgetItem mantendo o relacionamento bidirecional")
    void addOption_ShouldManageBidirectionalRelationship() {
        BudgetItem item = new BudgetItem();

        BudgetItemOption option = new BudgetItemOption();
        option.setMaterialName("Vidro Temperado 8mm Incolor");
        option.setCategoryType(MaterialCategoryType.GLASS);
        option.setUnitMeasure("M2");
        option.setQuantity(new BigDecimal("2.52"));
        option.setUnitPrice(new BigDecimal("180.00"));
        option.setTotalPrice(new BigDecimal("453.60"));

        item.addOption(option);

        assertEquals(1, item.getOptions().size());
        assertEquals(item, option.getBudgetItem());
        assertEquals(MaterialCategoryType.GLASS, option.getCategoryType());
    }

    @Test
    @DisplayName("Deve instanciar Budget completo com valores monetários e cliente")
    void fullBudget_GettersAndSetters() {
        Client client = new Client();
        client.setId(UUID.randomUUID());
        client.setFullName("João da Silva");

        Budget budget = new Budget();
        UUID id = UUID.randomUUID();
        budget.setId(id);
        budget.setCode("ORC-100");
        budget.setClient(client);
        budget.setSubtotal(new BigDecimal("1000.00"));
        budget.setDiscountPercent(new BigDecimal("10.00"));
        budget.setDiscountValue(new BigDecimal("100.00"));
        budget.setTotal(new BigDecimal("900.00"));
        budget.setStatus(BudgetStatus.SENT);
        budget.setNotes("Entrega em 15 dias úteis");

        assertEquals(id, budget.getId());
        assertEquals("ORC-100", budget.getCode());
        assertEquals(client, budget.getClient());
        assertEquals(new BigDecimal("1000.00"), budget.getSubtotal());
        assertEquals(new BigDecimal("10.00"), budget.getDiscountPercent());
        assertEquals(new BigDecimal("100.00"), budget.getDiscountValue());
        assertEquals(new BigDecimal("900.00"), budget.getTotal());
        assertEquals(BudgetStatus.SENT, budget.getStatus());
        assertEquals("Entrega em 15 dias úteis", budget.getNotes());
    }
}
