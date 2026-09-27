package br.edu.ifpb.alumigest.budgets.service.pdf;

import br.edu.ifpb.alumigest.budgets.domain.BudgetItem;
import com.lowagie.text.Document;
import com.lowagie.text.Image;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayOutputStream;
import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Testes unitários puros (JUnit 5, sem Spring) para o {@link BudgetPdfDrawingHelper} no contexto da US-11.2.
 */
class BudgetPdfDrawingHelperTest {

    private ByteArrayOutputStream outputStream;
    private Document document;
    private PdfWriter writer;

    @BeforeEach
    void setUp() throws Exception {
        outputStream = new ByteArrayOutputStream();
        document = new Document(PageSize.A4);
        writer = PdfWriter.getInstance(document, outputStream);
        document.open();
        // OpenPDF exige pelo menos um elemento na página para fechar o documento sem erro
        document.add(new Paragraph(" "));
    }

    @AfterEach
    void tearDown() {
        if (document != null && document.isOpen()) {
            document.close();
        }
    }

    @Test
    @DisplayName("US-11.2: desenharEsquemaUsinagem com dimensões default (105x105) gera imagem válida")
    void deveDesenharEsquemaUsinagemComDimensoesDefault() {
        BudgetItem item = new BudgetItem();
        item.setTemplateType("SWING_DOOR_1F");
        item.setTemplateConfig("{\"width\": 900, \"height\": 2100, \"openingDirection\": \"RIGHT\"}");
        item.setDrillingConfig("{\"mode\": \"EQUIDISTANT\", \"quantity\": 3}");
        item.setHandleConfig("{\"type\": \"TUBULAR\", \"lengthMm\": 400.0, \"distanceFromFloorMm\": 1000.0}");

        Image img = BudgetPdfDrawingHelper.desenharEsquemaUsinagem(writer, item);

        assertNotNull(img, "A imagem do esquema técnico não pode ser nula");
        assertTrue(img.getWidth() > 0, "Largura da imagem deve ser positiva");
        assertTrue(img.getHeight() > 0, "Altura da imagem deve ser positiva");
    }

    @Test
    @DisplayName("US-11.2: desenharEsquemaUsinagem com furações equidistantes e puxador tubular cotado")
    void deveDesenharEsquemaUsinagemComFuracoesEquidistantesEPuxador() {
        BudgetItem item = new BudgetItem();
        item.setTemplateType("SWING_DOOR_1F");
        item.setTemplateConfig("{\"openingDirection\": \"LEFT\"}");
        item.setDrillingConfig("{\"mode\": \"EQUIDISTANT\", \"quantity\": 4}");
        item.setHandleConfig("{\"type\": \"TUBULAR\", \"lengthMm\": 600.0, \"distanceFromFloorMm\": 1050.0}");

        Image img = BudgetPdfDrawingHelper.desenharEsquemaUsinagem(writer, item, 120f, 120f);

        assertNotNull(img);
        assertTrue(img.getWidth() > 0);
    }

    @Test
    @DisplayName("US-11.2: desenharEsquemaUsinagem com distâncias customizadas de furação")
    void deveDesenharEsquemaUsinagemComDistanciasCustomizadas() {
        BudgetItem item = new BudgetItem();
        item.setTemplateType("PORTA_GIRO");
        item.setTemplateConfig("{\"width\": 800, \"height\": 2000}");
        item.setDrillingConfig("{\"mode\": \"CUSTOM_DISTANCES\", \"customDistancesMm\": [250.0, 1000.0, 1750.0]}");

        Image img = BudgetPdfDrawingHelper.desenharEsquemaUsinagem(writer, item, 100f, 100f);

        assertNotNull(img);
    }

    @Test
    @DisplayName("US-11.2: desenharEsquemaUsinagem omite puxador quando handleConfig é nulo ou vazio")
    void deveOmitirPuxadorQuandoNaoConfigurado() {
        BudgetItem item = new BudgetItem();
        item.setTemplateType("SWING_DOOR_1F");
        item.setTemplateConfig("{\"width\": 900, \"height\": 2100}");
        item.setHandleConfig(null);
        item.setDrillingConfig("{}");

        Image img = BudgetPdfDrawingHelper.desenharEsquemaUsinagem(writer, item);

        assertNotNull(img);
    }

    @Test
    @DisplayName("US-11.2: desenharEsquemaUsinagem deve ser resiliente com BudgetItem nulo")
    void deveDesenharEsquemaUsinagemComItemNulo() {
        Image img = BudgetPdfDrawingHelper.desenharEsquemaUsinagem(writer, null);

        assertNotNull(img);
    }

    @Test
    @DisplayName("US-11.2: desenharEsquemaUsinagem lança IllegalArgumentException com parâmetros inválidos")
    void deveLancarExcecaoQuandoWriterOuDimensoesInvalidas() {
        BudgetItem item = new BudgetItem();

        assertThrows(IllegalArgumentException.class, () ->
                BudgetPdfDrawingHelper.desenharEsquemaUsinagem(null, item, 100f, 100f));
        assertThrows(IllegalArgumentException.class, () ->
                BudgetPdfDrawingHelper.desenharEsquemaUsinagem(writer, item, 0f, 100f));
        assertThrows(IllegalArgumentException.class, () ->
                BudgetPdfDrawingHelper.desenharEsquemaUsinagem(writer, item, 100f, -5f));
    }

    @Test
    @DisplayName("Construtor privado deve lançar UnsupportedOperationException")
    void deveLancarExcecaoAoInstanciarClasseUtilitaria() throws Exception {
        Constructor<BudgetPdfDrawingHelper> constructor =
                BudgetPdfDrawingHelper.class.getDeclaredConstructor();
        constructor.setAccessible(true);
        InvocationTargetException thrown = assertThrows(
                InvocationTargetException.class,
                constructor::newInstance
        );
        assertTrue(thrown.getCause() instanceof UnsupportedOperationException);
    }
}
