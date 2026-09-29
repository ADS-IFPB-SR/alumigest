package br.edu.ifpb.alumigest.budgets.repository;

import br.edu.ifpb.alumigest.budgets.domain.Budget;
import br.edu.ifpb.alumigest.budgets.domain.BudgetItem;
import br.edu.ifpb.alumigest.budgets.domain.BudgetStatus;
import br.edu.ifpb.alumigest.catalog.domain.DoorTemplateType;
import br.edu.ifpb.alumigest.catalog.domain.Product;
import br.edu.ifpb.alumigest.catalog.repository.ProductRepository;
import br.edu.ifpb.alumigest.clients.domain.Client;
import br.edu.ifpb.alumigest.clients.domain.PersonType;
import br.edu.ifpb.alumigest.clients.repository.ClientRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
class BudgetItemRepositoryTest {

    @Autowired
    private BudgetItemRepository budgetItemRepository;

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private ProductRepository productRepository;

    private Budget budget1;
    private Budget budget2;
    private Product product;

    @BeforeEach
    void setUp() {
        Client client = new Client();
        client.setFullName("Cliente Teste BudgetItem");
        client.setPersonType(PersonType.FISICA);
        client.setDocumentNumber("99988877766");
        client.setPhone("83988887777");
        client.setEmail("cliente@teste.com");
        client = clientRepository.save(client);

        budget1 = new Budget();
        budget1.setCode("ORC-2026-ITEM-01");
        budget1.setClient(client);
        budget1.setStatus(BudgetStatus.DRAFT);
        budget1.setSubtotal(new BigDecimal("1000.00"));
        budget1.setTotal(new BigDecimal("1000.00"));
        budget1.setValidUntil(OffsetDateTime.now(ZoneOffset.UTC).plusDays(15));
        budget1 = budgetRepository.save(budget1);

        budget2 = new Budget();
        budget2.setCode("ORC-2026-ITEM-02");
        budget2.setClient(client);
        budget2.setStatus(BudgetStatus.DRAFT);
        budget2.setSubtotal(new BigDecimal("500.00"));
        budget2.setTotal(new BigDecimal("500.00"));
        budget2.setValidUntil(OffsetDateTime.now(ZoneOffset.UTC).plusDays(15));
        budget2 = budgetRepository.save(budget2);

        product = new Product();
        product.setName("Janela de Correr");
        product.setTemplateType(DoorTemplateType.SLIDING_DOOR_2F);
        product = productRepository.save(product);
    }

    private BudgetItem createBudgetItem(Budget budget, Product prod, String name, BigDecimal subtotal) {
        BudgetItem item = new BudgetItem();
        item.setBudget(budget);
        item.setProduct(prod);
        item.setProductName(name);
        item.setWidthMm(new BigDecimal("1200.00"));
        item.setHeightMm(new BigDecimal("1000.00"));
        item.setQuantity(1);
        item.setLaborCost(new BigDecimal("100.00"));
        item.setSubtotal(subtotal);
        return budgetItemRepository.save(item);
    }

    @Test
    @DisplayName("[US-09.10] Deve buscar itens de orçamento pelo budgetId (findByBudgetId)")
    void shouldFindBudgetItemsByBudgetId() {
        BudgetItem item1 = createBudgetItem(budget1, product, "Janela Correr Sala", new BigDecimal("600.00"));
        BudgetItem item2 = createBudgetItem(budget1, product, "Janela Correr Quarto", new BigDecimal("400.00"));
        BudgetItem itemOtherBudget = createBudgetItem(budget2, product, "Janela Cozinha", new BigDecimal("500.00"));

        List<BudgetItem> itemsBudget1 = budgetItemRepository.findByBudgetId(budget1.getId());
        List<BudgetItem> itemsBudget2 = budgetItemRepository.findByBudgetId(budget2.getId());

        assertThat(itemsBudget1).hasSize(2);
        assertThat(itemsBudget1)
                .extracting(BudgetItem::getId)
                .containsExactlyInAnyOrder(item1.getId(), item2.getId());

        assertThat(itemsBudget2).hasSize(1);
        assertThat(itemsBudget2.get(0).getId()).isEqualTo(itemOtherBudget.getId());
    }

    @Test
    @DisplayName("[US-09.10] Deve retornar lista vazia quando orçamento não possuir itens ou não existir")
    void shouldReturnEmptyListWhenNoItemsForBudgetId() {
        List<BudgetItem> items = budgetItemRepository.findByBudgetId(UUID.randomUUID());

        assertThat(items).isNotNull().isEmpty();
    }
}
