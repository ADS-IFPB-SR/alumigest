package br.edu.ifpb.alumigest.budgets.service.pdf.technical.strategy;

import br.edu.ifpb.alumigest.budgets.service.pdf.technical.DrillingHolePoint;
import br.edu.ifpb.alumigest.budgets.service.pdf.technical.TechnicalHandle;
import br.edu.ifpb.alumigest.budgets.service.pdf.technical.TechnicalMachiningContext;
import com.lowagie.text.Document;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfTemplate;
import com.lowagie.text.pdf.PdfWriter;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.io.ByteArrayOutputStream;
import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;
import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Testes unitários para o {@link TechnicalMachiningRegistry} e suas estratégias (US-11.2 / #347).
 */
class TechnicalMachiningRegistryTest {

    private ByteArrayOutputStream outputStream;
    private Document document;
    private PdfWriter writer;
    private PdfTemplate template;

    @BeforeEach
    void setUp() throws Exception {
        outputStream = new ByteArrayOutputStream();
        document = new Document(PageSize.A4);
        writer = PdfWriter.getInstance(document, outputStream);
        document.open();
        document.add(new Paragraph(" "));
        template = writer.getDirectContent().createTemplate(120f, 120f);
    }

    @AfterEach
    void tearDown() {
        TechnicalMachiningRegistry.getInstance().unregister("CUSTOM_TEST_PIVOT");
        try {
            if (document != null && document.isOpen()) {
                document.close();
            }
        } catch (Exception ignored) {
            // Ignora falhas de fechamento no teardown de teste
        }
    }

    @Test
    @DisplayName("US-11.2 / #347: resolve estratégia de porta de giro dupla para SWING_2F e GIRO (2 FOLHAS)")
    void deveResolverEstrategiaParaGiroDuplo() {
        TechnicalMachiningRegistry registry = TechnicalMachiningRegistry.getInstance();

        TechnicalMachiningStrategy s1 = registry.getStrategy("SWING_DOOR_2F");
        assertInstanceOf(SwingDoubleLeafMachiningStrategy.class, s1);

        TechnicalMachiningStrategy s2 = registry.getStrategy("GIRO (2 FOLHAS)");
        assertInstanceOf(SwingDoubleLeafMachiningStrategy.class, s2);
    }

    @Test
    @DisplayName("US-11.2 / #347: resolve estratégia de esquadrias de correr para SLIDING_2F e SLIDING_4F")
    void deveResolverEstrategiaParaCorrer() {
        TechnicalMachiningRegistry registry = TechnicalMachiningRegistry.getInstance();

        TechnicalMachiningStrategy s1 = registry.getStrategy("SLIDING_DOOR_2F");
        assertInstanceOf(SlidingMachiningStrategy.class, s1);

        TechnicalMachiningStrategy s2 = registry.getStrategy("CORRER (4 FOLHAS)");
        assertInstanceOf(SlidingMachiningStrategy.class, s2);
    }

    @Test
    @DisplayName("US-11.2 / #347: resolve estratégia de basculante e gaveta")
    void deveResolverEstrategiaParaBasculanteEGaveta() {
        TechnicalMachiningRegistry registry = TechnicalMachiningRegistry.getInstance();

        TechnicalMachiningStrategy sAwning = registry.getStrategy("AWNING_WINDOW_1F");
        assertInstanceOf(AwningMachiningStrategy.class, sAwning);

        TechnicalMachiningStrategy sDrawer = registry.getStrategy("FRONT_DRAWER");
        assertInstanceOf(DrawerMachiningStrategy.class, sDrawer);

        TechnicalMachiningStrategy sFixed = registry.getStrategy("FIXED_PANEL");
        assertInstanceOf(FixedPanelMachiningStrategy.class, sFixed);
    }

    @ParameterizedTest
    @ValueSource(strings = {
        "SWING_DOOR_1F",
        "SWING_DOOR_2F",
        "GIRO (2 FOLHAS)",
        "SLIDING_DOOR_2F",
        "SLIDING_DOOR_4F",
        "AWNING_WINDOW_1F",
        "FRONT_DRAWER",
        "FIXED_PANEL"
    })
    @DisplayName("US-11.2 / #347: todas as estratégias devem desenhar no template sem exceções")
    void todasEstrategiasDevemDesenharSemErros(String templateType) {
        TechnicalMachiningStrategy strategy = TechnicalMachiningRegistry.getInstance()
                .getStrategy(templateType);
        assertNotNull(strategy);

        TechnicalHandle handle = new TechnicalHandle(true, 0.25f, 0.50f, "Puxador (25cm)");
        List<DrillingHolePoint> holes = List.of(
                new DrillingHolePoint(0.20f, 10f, "Dist. Iguais"),
                new DrillingHolePoint(0.80f, 10f, "Dist. Iguais")
        );

        TechnicalMachiningContext ctx = new TechnicalMachiningContext(
                templateType,
                new BigDecimal("1600"),
                new BigDecimal("2100"),
                null,
                holes,
                handle,
                2,
                templateType.contains("SLIDING")
        );

        assertDoesNotThrow(() ->
                strategy.draw(template, ctx, 10f, 10f, 100f, 100f, 120f));
    }

    @Test
    @DisplayName("SOLID - OCP: deve permitir registrar e desregistrar estratégia customizada")
    void devePermitirExtensibilidadeDinamica() {
        TechnicalMachiningRegistry registry = TechnicalMachiningRegistry.getInstance();
        String customKey = "CUSTOM_TEST_PIVOT";

        registry.register(customKey, (tpl, ctx, startX, startY, drawW, drawH, canvasWidth) -> {
            tpl.rectangle(startX, startY, drawW, drawH);
            tpl.stroke();
        });

        assertTrue(registry.hasStrategy(customKey));
        assertNotNull(registry.getStrategy(customKey));

        registry.unregister(customKey);
        assertFalse(registry.hasStrategy(customKey));
    }

    @Test
    @DisplayName("Fallback seguro para tipologia nula, em branco ou desconhecida")
    void deveRetornarFallbackSeguroParaValoresNulosOuDesconhecidos() {
        TechnicalMachiningRegistry registry = TechnicalMachiningRegistry.getInstance();

        assertInstanceOf(FallbackMachiningStrategy.class, registry.getStrategy(null));
        assertInstanceOf(FallbackMachiningStrategy.class, registry.getStrategy("   "));
        assertInstanceOf(FallbackMachiningStrategy.class, registry.getStrategy("TIPO_DESCONHECIDO_XYZ"));
    }

    @Test
    @DisplayName("Construtor privado do TechnicalMachiningDrawingUtils deve lançar exceção")
    void deveLancarExcecaoAoInstanciarDrawingUtils() throws Exception {
        Constructor<TechnicalMachiningDrawingUtils> constructor =
                TechnicalMachiningDrawingUtils.class.getDeclaredConstructor();
        constructor.setAccessible(true);
        InvocationTargetException thrown = assertThrows(
                InvocationTargetException.class,
                constructor::newInstance
        );
        assertTrue(thrown.getCause() instanceof UnsupportedOperationException);
    }
}
