package br.edu.ifpb.alumigest.orders.service;

import br.edu.ifpb.alumigest.budgets.domain.BudgetItem;
import br.edu.ifpb.alumigest.budgets.domain.BudgetItemOption;
import br.edu.ifpb.alumigest.catalog.domain.MaterialCategoryType;
import br.edu.ifpb.alumigest.catalog.domain.Product;
import br.edu.ifpb.alumigest.catalog.domain.TemplateConfig;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Testes unitários para {@link OrderItemSnapshotResolver}.
 * Técnicas Formais de QA: Partição de Equivalência (EP) e Análise de Valor Limite (BVA).
 */
@DisplayName("Testes Formais de QA: OrderItemSnapshotResolver")
class OrderItemSnapshotResolverTest {

    @Test
    @DisplayName("[Partição de Equivalência] Deve extrair cor do alumínio da opção PROFILE do item")
    void shouldExtractAluminumColorFromProfileOption() {
        BudgetItem item = new BudgetItem();
        BudgetItemOption option = new BudgetItemOption();
        option.setCategoryType(MaterialCategoryType.PROFILE);
        option.setSelectedColor("Preto Fosco");
        item.addOption(option);

        String cor = OrderItemSnapshotResolver.extractAluminumColor(item);

        assertThat(cor).isEqualTo("Preto Fosco");
    }

    @Test
    @DisplayName("[Partição de Equivalência] Deve extrair cor do produto quando não houver opção PROFILE")
    void shouldExtractAluminumColorFromProductWhenNoOption() {
        BudgetItem item = new BudgetItem();
        Product product = new Product();
        TemplateConfig config = new TemplateConfig();
        config.setAluminumColor("Branco");
        product.setTemplateConfig(config);
        item.setProduct(product);

        String cor = OrderItemSnapshotResolver.extractAluminumColor(item);

        assertThat(cor).isEqualTo("Branco");
    }

    @Test
    @DisplayName("[Partição de Equivalência] Deve extrair cor do JSON templateConfig como fallback")
    void shouldExtractAluminumColorFromJsonConfigFallback() {
        BudgetItem item = new BudgetItem();
        item.setTemplateConfig("{\"aluminumColor\": \"Bronze 1003\"}");

        String cor = OrderItemSnapshotResolver.extractAluminumColor(item);

        assertThat(cor).isEqualTo("Bronze 1003");
    }

    @Test
    @DisplayName("[Análise de Valor Limite] Deve retornar null para cor do alumínio quando item for nulo ou vazio")
    void shouldReturnNullForAluminumColorWhenItemEmptyOrNull() {
        assertThat(OrderItemSnapshotResolver.extractAluminumColor(null)).isNull();

        BudgetItem item = new BudgetItem();
        assertThat(OrderItemSnapshotResolver.extractAluminumColor(item)).isNull();
    }

    @Test
    @DisplayName("[Partição de Equivalência] Deve extrair tipo de vidro da opção GLASS do item")
    void shouldExtractGlassTypeFromGlassOption() {
        BudgetItem item = new BudgetItem();
        BudgetItemOption option = new BudgetItemOption();
        option.setCategoryType(MaterialCategoryType.GLASS);
        option.setSelectedType("Incolor 8mm Temperado");
        item.addOption(option);

        String vidro = OrderItemSnapshotResolver.extractGlassType(item);

        assertThat(vidro).isEqualTo("Incolor 8mm Temperado");
    }

    @Test
    @DisplayName("[Partição de Equivalência] Deve extrair tipo de vidro do JSON templateConfig como fallback")
    void shouldExtractGlassTypeFromJsonConfigFallback() {
        BudgetItem item = new BudgetItem();
        item.setTemplateConfig("{\"glassFinish\": \"Fumê 6mm Temperado\"}");

        String vidro = OrderItemSnapshotResolver.extractGlassType(item);

        assertThat(vidro).isEqualTo("Fumê 6mm Temperado");
    }

    @Test
    @DisplayName("[Partição de Equivalência] Deve extrair orientação de abertura do JSON templateConfig")
    void shouldExtractOpeningDirectionFromJsonConfig() {
        BudgetItem item = new BudgetItem();
        item.setTemplateConfig("{\"openingDirection\": \"Correr 2 Folhas (Direita)\"}");

        String abertura = OrderItemSnapshotResolver.extractOpeningDirection(item);

        assertThat(abertura).isEqualTo("Correr 2 Folhas (Direita)");
    }

    @Test
    @DisplayName("[Partição de Equivalência] Deve extrair e concatenar ferragens de handleConfig e opções HARDWARE")
    void shouldExtractHardwareFromHandleConfigAndOptions() {
        BudgetItem item = new BudgetItem();
        item.setHandleConfig("{\"model\": \"Tubular Inox 40cm\"}");

        BudgetItemOption roldana = new BudgetItemOption();
        roldana.setCategoryType(MaterialCategoryType.ROLLERS);
        roldana.setMaterialName("Roldana Dupla com Rolamento");
        roldana.setQuantity(new BigDecimal("2.00"));
        roldana.setUnitMeasure("UN");
        item.addOption(roldana);

        BudgetItemOption fecho = new BudgetItemOption();
        fecho.setCategoryType(MaterialCategoryType.HARDWARE);
        fecho.setMaterialName("Fecho Concha Automático");
        fecho.setQuantity(new BigDecimal("1.00"));
        fecho.setUnitMeasure("UN");
        item.addOption(fecho);

        String ferragens = OrderItemSnapshotResolver.extractHardware(item);

        assertThat(ferragens).contains("Puxador Tubular Inox 40cm")
                .contains("Roldana Dupla com Rolamento (2 UN)")
                .contains("Fecho Concha Automático (1 UN)");
    }

    @Test
    @DisplayName("[Análise de Valor Limite] Deve retornar null para ferragens quando item não possuir componentes")
    void shouldReturnNullForHardwareWhenEmpty() {
        BudgetItem item = new BudgetItem();
        assertThat(OrderItemSnapshotResolver.extractHardware(item)).isNull();
    }
}
