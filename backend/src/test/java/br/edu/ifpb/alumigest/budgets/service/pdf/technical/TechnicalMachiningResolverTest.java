package br.edu.ifpb.alumigest.budgets.service.pdf.technical;

import br.edu.ifpb.alumigest.budgets.domain.BudgetItem;
import br.edu.ifpb.alumigest.catalog.domain.OpeningDirection;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;
import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Testes unitários para o {@link TechnicalMachiningResolver} e records técnicos associados (US-11.2).
 */
class TechnicalMachiningResolverTest {

    @Test
    @DisplayName("US-11.2: resolve retorna contexto padrão vazio com item nulo")
    void deveResolverCorretamenteComItemNulo() {
        TechnicalMachiningContext ctx = TechnicalMachiningResolver.resolve(null);

        assertNotNull(ctx);
        assertNull(ctx.templateType());
        assertFalse(ctx.hasDrilling());
        assertFalse(ctx.hasHandle());
        assertEquals(0.75f, ctx.getAspectRatio(), 0.001f);
    }

    @Test
    @DisplayName("US-11.2: resolve calcula aspect ratio proporcional às dimensões reais")
    void deveCalcularAspectRatioCorretamente() {
        BudgetItem item = new BudgetItem();
        item.setWidthMm(new BigDecimal("1200"));
        item.setHeightMm(new BigDecimal("2400"));

        TechnicalMachiningContext ctx = TechnicalMachiningResolver.resolve(item);

        assertEquals(0.5f, ctx.getAspectRatio(), 0.001f);
    }

    @Test
    @DisplayName("US-11.2: resolve extrai furação EQUIDISTANT com quantidade configurada")
    void deveResolverFuracoesEquidistantes() {
        BudgetItem item = new BudgetItem();
        item.setHeightMm(new BigDecimal("2000"));
        item.setDrillingConfig("{\"mode\": \"EQUIDISTANT\", \"holesCount\": 3}");

        TechnicalMachiningContext ctx = TechnicalMachiningResolver.resolve(item);

        assertTrue(ctx.hasDrilling());
        assertEquals(3, ctx.drillingHoles().size());
        assertEquals("Dist. Iguais", ctx.drillingHoles().get(0).label());
        assertEquals("Dist. Iguais", ctx.drillingHoles().get(1).label());
        assertEquals("Dist. Iguais", ctx.drillingHoles().get(2).label());
    }

    @Test
    @DisplayName("US-11.2: resolve extrai furação suportando chaves do front-end (holeCount e quantity)")
    void deveResolverFuracoesComChavesFrontEnd() {
        BudgetItem item1 = new BudgetItem();
        item1.setHeightMm(new BigDecimal("2100"));
        item1.setDrillingConfig("{\"drillingMode\": \"EQUIDISTANT\", \"holeCount\": 4}");

        TechnicalMachiningContext ctx1 = TechnicalMachiningResolver.resolve(item1);
        assertTrue(ctx1.hasDrilling());
        assertEquals(4, ctx1.drillingHoles().size());

        BudgetItem item2 = new BudgetItem();
        item2.setHeightMm(new BigDecimal("2100"));
        item2.setDrillingConfig("{\"mode\": \"EQUIDISTANT\", \"quantity\": 5}");

        TechnicalMachiningContext ctx2 = TechnicalMachiningResolver.resolve(item2);
        assertTrue(ctx2.hasDrilling());
        assertEquals(5, ctx2.drillingHoles().size());
    }

    @Test
    @DisplayName("US-11.2: resolve extrai furação CUSTOM_DISTANCES com lista em mm")
    void deveResolverFuracoesDistanciasCustomizadas() {
        BudgetItem item = new BudgetItem();
        item.setHeightMm(new BigDecimal("2100"));
        item.setDrillingConfig("{\"mode\": \"CUSTOM_DISTANCES\", \"customDistancesMm\": [250.0, 1050.0, 1850.0]}");

        TechnicalMachiningContext ctx = TechnicalMachiningResolver.resolve(item);

        assertTrue(ctx.hasDrilling());
        assertEquals(3, ctx.drillingHoles().size());
        assertEquals("250 mm", ctx.drillingHoles().get(0).label());
        assertEquals("1050 mm", ctx.drillingHoles().get(1).label());
        assertEquals("1850 mm", ctx.drillingHoles().get(2).label());
    }

    @Test
    @DisplayName("US-11.2: resolve suporta customPositionsMm e drillingMode do front-end")
    void deveResolverCustomPositionsMmFrontEnd() {
        BudgetItem item = new BudgetItem();
        item.setHeightMm(new BigDecimal("2000"));
        item.setDrillingConfig("{\"drillingMode\": \"CUSTOM\", \"customPositionsMm\": [300.0, 1700.0]}");

        TechnicalMachiningContext ctx = TechnicalMachiningResolver.resolve(item);

        assertTrue(ctx.hasDrilling());
        assertEquals(2, ctx.drillingHoles().size());
        assertEquals("300 mm", ctx.drillingHoles().get(0).label());
        assertEquals("1700 mm", ctx.drillingHoles().get(1).label());
    }

    @Test
    @DisplayName("US-11.2: resolve omite furações quando mode é NONE explicitamente")
    void deveOmitirFuracoesQuandoModeNone() {
        BudgetItem item = new BudgetItem();
        item.setTemplateType("SWING_DOOR_1F");
        item.setDrillingConfig("{\"mode\": \"NONE\"}");

        TechnicalMachiningContext ctx = TechnicalMachiningResolver.resolve(item);

        assertFalse(ctx.hasDrilling());
        assertTrue(ctx.drillingHoles().isEmpty());
    }

    @Test
    @DisplayName("US-11.2: resolve furação fallback quando templateType é SWING_DOOR_1F e config ausente")
    void deveResolverFuracaoFallbackParaSwingDoor() {
        BudgetItem item = new BudgetItem();
        item.setTemplateType("SWING_DOOR_1F");
        item.setDrillingConfig("");

        TechnicalMachiningContext ctx = TechnicalMachiningResolver.resolve(item);

        assertTrue(ctx.hasDrilling());
        assertEquals(3, ctx.drillingHoles().size());
        assertEquals("Dist. Iguais", ctx.drillingHoles().get(0).label());
    }

    @Test
    @DisplayName("US-11.2: resolve puxador completo com tipo, cota, posição RIGHT e altura do piso dinâmica")
    void deveResolverPuxadorCompleto() {
        BudgetItem item = new BudgetItem();
        item.setHeightMm(new BigDecimal("2000"));
        item.setHandleConfig("{\"type\": \"TUBULAR\", \"position\": \"RIGHT\", \"lengthMm\": 400.0, \"distanceFromFloorMm\": 1000.0, \"holesCount\": 2}");

        TechnicalMachiningContext ctx = TechnicalMachiningResolver.resolve(item);

        assertTrue(ctx.hasHandle());
        TechnicalHandle handle = ctx.handle();
        assertNotNull(handle);
        assertTrue(handle.onRightSide());
        assertEquals("Puxador (40cm)", handle.label());
        assertEquals(0.50f, handle.centerYRatio(), 0.001f);
    }

    @Test
    @DisplayName("US-11.2: resolve sentido de abertura LEFT mapeia para RIGHT_TO_LEFT")
    void deveResolverSentidoAbertura() {
        BudgetItem item = new BudgetItem();
        item.setTemplateConfig("{\"openingDirection\": \"LEFT\"}");

        TechnicalMachiningContext ctx = TechnicalMachiningResolver.resolve(item);

        assertEquals(OpeningDirection.RIGHT_TO_LEFT, ctx.openingDirection());
        assertTrue(ctx.isOpeningLeft());
    }

    @Test
    @DisplayName("US-11.2: resolve sentido de abertura RIGHT mapeia para LEFT_TO_RIGHT")
    void deveResolverSentidoAberturaDireita() {
        BudgetItem item = new BudgetItem();
        item.setTemplateConfig("{\"openingDirection\": \"RIGHT\"}");

        TechnicalMachiningContext ctx = TechnicalMachiningResolver.resolve(item);

        assertEquals(OpeningDirection.LEFT_TO_RIGHT, ctx.openingDirection());
        assertFalse(ctx.isOpeningLeft());
    }

    @Test
    @DisplayName("US-11.2: DrillingHolePoint sanitiza label nulo ou vazio com fallback seguro")
    void deveSanitizarLabelNuloEmDrillingHolePoint() {
        DrillingHolePoint pointWithNull = new DrillingHolePoint(0.5f, 12.0f, null);
        assertEquals("Ø 12mm", pointWithNull.label());

        DrillingHolePoint pointWithBlank = new DrillingHolePoint(0.5f, 10.0f, "   ");
        assertEquals("Ø 10mm", pointWithBlank.label());
    }

    @Test
    @DisplayName("US-11.2 / Task #342: resolve detecta esquadrias de correr e quantidade de folhas")
    void deveResolverEsquadriasDeCorrerEQtdFolhas() {
        BudgetItem item2F = new BudgetItem();
        item2F.setTemplateType("SLIDING_DOOR_2F");
        TechnicalMachiningContext ctx2f = TechnicalMachiningResolver.resolve(item2F);
        assertTrue(ctx2f.isSliding());
        assertEquals(2, ctx2f.getLeafCount());

        BudgetItem item4F = new BudgetItem();
        item4F.setTemplateType("SLIDING_WINDOW_4F");
        TechnicalMachiningContext ctx4f = TechnicalMachiningResolver.resolve(item4F);
        assertTrue(ctx4f.isSliding());
        assertEquals(4, ctx4f.getLeafCount());

        BudgetItem item3F = new BudgetItem();
        item3F.setTemplateType("SLIDING_3_LEAF");
        TechnicalMachiningContext ctx3f = TechnicalMachiningResolver.resolve(item3F);
        assertTrue(ctx3f.isSliding());
        assertEquals(3, ctx3f.getLeafCount());

        BudgetItem itemGiro = new BudgetItem();
        itemGiro.setTemplateType("SWING_DOOR_1F");
        TechnicalMachiningContext ctxGiro = TechnicalMachiningResolver.resolve(itemGiro);
        assertFalse(ctxGiro.isSliding());
        assertEquals(1, ctxGiro.getLeafCount());
    }

    @Test
    @DisplayName("Construtor privado do TechnicalMachiningResolver deve lançar exceção")
    void deveLancarExcecaoAoInstanciarClasseUtilitaria() throws Exception {
        Constructor<TechnicalMachiningResolver> constructor =
                TechnicalMachiningResolver.class.getDeclaredConstructor();
        constructor.setAccessible(true);
        InvocationTargetException thrown = assertThrows(
                InvocationTargetException.class,
                constructor::newInstance
        );
        assertTrue(thrown.getCause() instanceof UnsupportedOperationException);
    }
}
