package br.edu.ifpb.alumigest.budgets.domain;

import br.edu.ifpb.alumigest.catalog.domain.Material;
import br.edu.ifpb.alumigest.catalog.domain.MaterialCategoryType;
import br.edu.ifpb.alumigest.catalog.domain.Product;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class BudgetItemTest {

    @Test
    @DisplayName("[US-09.8] Deve inicializar BudgetItem com valores padrão corretos")
    void shouldInitializeWithDefaultValues() {
        BudgetItem item = new BudgetItem();

        assertThat(item.getId()).isNull();
        assertThat(item.getQuantity()).isEqualTo(1);
        assertThat(item.getLaborCost()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(item.getSubtotal()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(item.getOptions()).isNotNull().isEmpty();
    }

    @Test
    @DisplayName("[US-09.8] Deve gerenciar todos os atributos, dimensões e valores monetários com precisão BigDecimal")
    void shouldManageAllAttributesAndMonetaryValues() {
        BudgetItem item = new BudgetItem();
        UUID itemId = UUID.randomUUID();
        Product product = new Product();
        product.setId(UUID.randomUUID());
        product.setName("Janela Integrada 2 Folhas");

        Budget budget = new Budget();
        budget.setId(UUID.randomUUID());

        item.setId(itemId);
        item.setBudget(budget);
        item.setProduct(product);
        item.setProductName("Janela Integrada 2 Folhas");
        item.setTemplateType("SLIDING_DOOR_2F");
        item.setTemplateConfig("{\"profileColor\":\"BRANCO\"}");
        item.setHandleConfig("{\"type\":\"PROFILE_HANDLE\"}");
        item.setDrillingConfig("{\"drillingHoles\":[]}");
        item.setWidthMm(new BigDecimal("1500.50"));
        item.setHeightMm(new BigDecimal("1200.75"));
        item.setQuantity(3);
        item.setLaborCost(new BigDecimal("350.00"));
        item.setSubtotal(new BigDecimal("2150.80"));
        item.setNotes("Instalação no 2º andar");

        assertThat(item.getId()).isEqualTo(itemId);
        assertThat(item.getBudget()).isEqualTo(budget);
        assertThat(item.getProduct()).isEqualTo(product);
        assertThat(item.getProductName()).isEqualTo("Janela Integrada 2 Folhas");
        assertThat(item.getTemplateType()).isEqualTo("SLIDING_DOOR_2F");
        assertThat(item.getTemplateConfig()).isEqualTo("{\"profileColor\":\"BRANCO\"}");
        assertThat(item.getHandleConfig()).isEqualTo("{\"type\":\"PROFILE_HANDLE\"}");
        assertThat(item.getDrillingConfig()).isEqualTo("{\"drillingHoles\":[]}");
        assertThat(item.getWidthMm()).isEqualByComparingTo(new BigDecimal("1500.50"));
        assertThat(item.getHeightMm()).isEqualByComparingTo(new BigDecimal("1200.75"));
        assertThat(item.getQuantity()).isEqualTo(3);
        assertThat(item.getLaborCost()).isEqualByComparingTo(new BigDecimal("350.00"));
        assertThat(item.getSubtotal()).isEqualByComparingTo(new BigDecimal("2150.80"));
        assertThat(item.getNotes()).isEqualTo("Instalação no 2º andar");
    }

    @Test
    @DisplayName("[US-09.8] Deve adicionar e remover opções mantendo integridade bidirecional (addOption e removeOption)")
    void shouldManageBidirectionalOptionsRelationship() {
        BudgetItem item = new BudgetItem();
        item.setProductName("Porta de Giro");

        Material material = new Material();
        material.setName("Perfil Linha Suprema");

        BudgetItemOption option = new BudgetItemOption();
        option.setMaterial(material);
        option.setMaterialName("Perfil Linha Suprema");
        option.setCategoryType(MaterialCategoryType.PROFILE);
        option.setUnitMeasure("M");
        option.setQuantity(new BigDecimal("5.50"));
        option.setUnitPrice(new BigDecimal("60.00"));
        option.setTotalPrice(new BigDecimal("330.00"));

        item.addOption(option);

        assertThat(item.getOptions()).hasSize(1).contains(option);
        assertThat(option.getBudgetItem()).isEqualTo(item);

        item.removeOption(option);

        assertThat(item.getOptions()).isEmpty();
        assertThat(option.getBudgetItem()).isNull();
    }

    @Test
    @DisplayName("[US-09.8] Deve permitir definir lista de opções diretamente através do setter")
    void shouldAllowSettingOptionsListDirectly() {
        BudgetItem item = new BudgetItem();
        List<BudgetItemOption> newOptions = new ArrayList<>();
        BudgetItemOption option = new BudgetItemOption();
        option.setMaterialName("Vidro Laminado");
        newOptions.add(option);

        item.setOptions(newOptions);

        assertThat(item.getOptions()).hasSize(1).contains(option);
    }
}
