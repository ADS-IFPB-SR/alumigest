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
    @DisplayName("[Tabela de Decisão / Equivalência] Deve priorizar insumo GLASS sobre FILM e não classificar película como tipoVidro (#424)")
    void shouldPrioritizeGlassOptionOverFilmAndNotClassifyFilmAsGlass() {
        BudgetItem item = new BudgetItem();

        BudgetItemOption filmOption = new BudgetItemOption();
        filmOption.setCategoryType(MaterialCategoryType.FILM);
        filmOption.setMaterialName("Película Térmica Fumê 5% G5");
        filmOption.setSelectedType("Película Fumê 5%");
        item.addOption(filmOption);

        BudgetItemOption glassOption = new BudgetItemOption();
        glassOption.setCategoryType(MaterialCategoryType.GLASS);
        glassOption.setMaterialName("Vidro Temperado Incolor 8mm");
        glassOption.setSelectedType("Temperado Incolor 8mm");
        item.addOption(glassOption);

        String vidro = OrderItemSnapshotResolver.extractGlassType(item);

        assertThat(vidro).isEqualTo("Temperado Incolor 8mm");
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
    @DisplayName("[Partição de Equivalência] Deve desduplicar ferragens idênticas preservando a ordem de inserção")
    void shouldDeduplicateHardwarePreservingInsertionOrder() {
        BudgetItem item = new BudgetItem();
        item.setHandleConfig("{\"model\": \"Tubular Inox 40cm\"}");

        BudgetItemOption fecho1 = new BudgetItemOption();
        fecho1.setCategoryType(MaterialCategoryType.HARDWARE);
        fecho1.setMaterialName("Fecho Concha Automático");
        fecho1.setQuantity(new BigDecimal("1.00"));
        fecho1.setUnitMeasure("UN");
        item.addOption(fecho1);

        BudgetItemOption fecho2 = new BudgetItemOption();
        fecho2.setCategoryType(MaterialCategoryType.HARDWARE);
        fecho2.setMaterialName("Fecho Concha Automático");
        fecho2.setQuantity(new BigDecimal("1.00"));
        fecho2.setUnitMeasure("UN");
        item.addOption(fecho2);

        String ferragens = OrderItemSnapshotResolver.extractHardware(item);

        assertThat(ferragens)
                .isEqualTo("Puxador Tubular Inox 40cm, Fecho Concha Automático (1 UN)");
    }

    @Test
    @DisplayName("[Análise de Valor Limite] Deve retornar null para ferragens quando item não possuir componentes")
    void shouldReturnNullForHardwareWhenEmpty() {
        BudgetItem item = new BudgetItem();
        assertThat(OrderItemSnapshotResolver.extractHardware(item)).isNull();
    }

    @Test
    @DisplayName("[Partição de Equivalência] Deve extrair puxador via handleType com dimensão handleLengthMm (#422)")
    void shouldExtractHardwareFromHandleTypeWithLength() {
        BudgetItem item = new BudgetItem();
        item.setHandleConfig("{\"handleType\": \"BAR_TUBULAR\", \"handleLengthMm\": 600}");

        String ferragens = OrderItemSnapshotResolver.extractHardware(item);

        assertThat(ferragens).isEqualTo("Puxador Barra Tubular 600mm");
    }

    @Test
    @DisplayName("[Partição de Equivalência] Deve extrair fecho concha via handleType sem dimensão (#422)")
    void shouldExtractHardwareFromShellLockWithoutLength() {
        BudgetItem item = new BudgetItem();
        item.setHandleConfig("{\"handleType\": \"SHELL_LOCK\"}");

        String ferragens = OrderItemSnapshotResolver.extractHardware(item);

        assertThat(ferragens).isEqualTo("Fecho Concha");
    }

    @Test
    @DisplayName("[Análise de Valor Limite] Deve ignorar puxador quando handleType for NONE (#422)")
    void shouldIgnoreHandleWhenTypeIsNone() {
        BudgetItem item = new BudgetItem();
        item.setHandleConfig("{\"handleType\": \"NONE\"}");

        String ferragens = OrderItemSnapshotResolver.extractHardware(item);

        assertThat(ferragens).isNull();
    }

    @Test
    @DisplayName("[Tabela de Decisão] Deve priorizar templateConfig do item sobre o templateConfig do produto para cor do alumínio (#433)")
    void shouldPrioritizeItemTemplateConfigOverProductTemplateConfigForAluminumColor() {
        BudgetItem item = new BudgetItem();
        item.setTemplateConfig("{\"aluminumColor\": \"Preto\"}");

        Product product = new Product();
        TemplateConfig productConfig = new TemplateConfig();
        productConfig.setAluminumColor("Branco");
        product.setTemplateConfig(productConfig);
        item.setProduct(product);

        String cor = OrderItemSnapshotResolver.extractAluminumColor(item);

        assertThat(cor).isEqualTo("Preto");
    }

    @Test
    @DisplayName("[Tabela de Decisão] Deve priorizar templateConfig do item sobre o templateConfig do produto para acabamento do vidro (#433)")
    void shouldPrioritizeItemTemplateConfigOverProductTemplateConfigForGlassType() {
        BudgetItem item = new BudgetItem();
        item.setTemplateConfig("{\"glassFinish\": \"Reflecta Champanhe 6mm\"}");

        Product product = new Product();
        TemplateConfig productConfig = new TemplateConfig();
        productConfig.setGlassColor("Incolor 4mm");
        product.setTemplateConfig(productConfig);
        item.setProduct(product);

        String vidro = OrderItemSnapshotResolver.extractGlassType(item);

        assertThat(vidro).isEqualTo("Reflecta Champanhe 6mm");
    }

    @Test
    @DisplayName("[Partição de Equivalência] Deve extrair slidingMode do item templateConfig em formato canônico (#433)")
    void shouldExtractSlidingModeFromItemTemplateConfig() {
        BudgetItem item = new BudgetItem();
        item.setTemplateConfig("{\"slidingMode\": \"BOTH_SLIDING\"}");

        String abertura = OrderItemSnapshotResolver.extractOpeningDirection(item);

        assertThat(abertura).isEqualTo("BOTH_SLIDING");
    }

    @Test
    @DisplayName("[Partição de Equivalência] Deve extrair slidingMode do produto quando item não especificar abertura (#433)")
    void shouldExtractSlidingModeFromProductTemplateConfigFallback() {
        BudgetItem item = new BudgetItem();

        Product product = new Product();
        TemplateConfig productConfig = new TemplateConfig();
        productConfig.setSlidingMode(br.edu.ifpb.alumigest.catalog.domain.SlidingMode.LEFT_FIXED_RIGHT_SLIDING);
        product.setTemplateConfig(productConfig);
        item.setProduct(product);

        String abertura = OrderItemSnapshotResolver.extractOpeningDirection(item);

        assertThat(abertura).isEqualTo("LEFT_FIXED_RIGHT_SLIDING");
    }

    @Test
    @DisplayName("[Análise de Valor Limite] Deve truncar orientação de abertura que exceda 30 caracteres do banco (#433)")
    void shouldTruncateOpeningDirectionIfExceeds30Chars() {
        BudgetItem item = new BudgetItem();
        item.setTemplateConfig("{\"openingDirection\": \"ABERTURA_EXTREMAMENTE_LONGA_SUPERIOR_A_30_CARACTERES\"}");

        String abertura = OrderItemSnapshotResolver.extractOpeningDirection(item);

        assertThat(abertura).hasSize(30)
                .isEqualTo("ABERTURA_EXTREMAMENTE_LONGA_SU");
    }
}
