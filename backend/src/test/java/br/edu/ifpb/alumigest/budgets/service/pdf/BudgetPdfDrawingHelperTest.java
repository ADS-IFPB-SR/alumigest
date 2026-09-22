package br.edu.ifpb.alumigest.budgets.service.pdf;

import br.edu.ifpb.alumigest.budgets.calculator.TemplateType;
import br.edu.ifpb.alumigest.budgets.domain.BudgetItem;
import com.lowagie.text.Chunk;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Image;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfWriter;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Testes unitários puros (JUnit 5, sem Spring) para o
 * {@link BudgetPdfDrawingHelper}.
 *
 * <p>Cada teste cria um {@link Document}/{@link PdfWriter} temporário em
 * memória, invoca o helper e verifica que a imagem retornada é válida.</p>
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
        // OpenPDF exige pelo menos uma página para fechar o documento sem erro
        document.add(new Paragraph(" "));
    }

    @AfterEach
    void tearDown() {
        try {
            if (document != null && document.isOpen()) {
                document.close();
            }
        } catch (Exception ignored) {
            // Ignora erros de fechamento do documento de teste
        }
    }

    // ── Helpers de Criação de BudgetItem ──────────────────────────────────

    private BudgetItem criarItemComTipologia(String templateType) {
        BudgetItem item = new BudgetItem();
        item.setTemplateType(templateType);
        item.setWidthMm(new BigDecimal("1200"));
        item.setHeightMm(new BigDecimal("1500"));
        item.setQuantity(1);
        item.setProductName("Esquadria de Teste");
        return item;
    }

    // ── Testes por Tipologia ─────────────────────────────────────────────

    @Test
    @DisplayName("Deve desenhar miniatura SLIDING_2_LEAF (Janela Correr 2 Folhas) sem erro")
    void deveDesenharMiniaturaSlidingDuasFolhasSemErro() {
        BudgetItem item = criarItemComTipologia("SLIDING_2_LEAF");

        Image imagem = BudgetPdfDrawingHelper.desenharMiniaturaEsquadria(writer, item,
                BudgetPdfDrawingHelper.DEFAULT_WIDTH, BudgetPdfDrawingHelper.DEFAULT_HEIGHT);

        assertNotNull(imagem, "A imagem retornada não deve ser nula");
    }

    @Test
    @DisplayName("Deve desenhar miniatura SLIDING_4_LEAF (Janela Correr 4 Folhas) sem erro")
    void deveDesenharMiniaturaSlidingQuatroFolhasSemErro() {
        BudgetItem item = criarItemComTipologia("SLIDING_4_LEAF");

        Image imagem = BudgetPdfDrawingHelper.desenharMiniaturaEsquadria(writer, item,
                BudgetPdfDrawingHelper.DEFAULT_WIDTH, BudgetPdfDrawingHelper.DEFAULT_HEIGHT);

        assertNotNull(imagem, "A imagem retornada não deve ser nula");
    }

    @Test
    @DisplayName("Deve desenhar miniatura SWING_1_LEAF (Porta Giro 1 Folha) sem erro")
    void deveDesenharMiniaturaSwingUmaFolhaSemErro() {
        BudgetItem item = criarItemComTipologia("SWING_1_LEAF");

        Image imagem = BudgetPdfDrawingHelper.desenharMiniaturaEsquadria(writer, item,
                BudgetPdfDrawingHelper.DEFAULT_WIDTH, BudgetPdfDrawingHelper.DEFAULT_HEIGHT);

        assertNotNull(imagem, "A imagem retornada não deve ser nula");
    }

    @Test
    @DisplayName("Deve desenhar miniatura SWING_2_LEAF (Porta Giro 2 Folhas) sem erro")
    void deveDesenharMiniaturaSwingDuasFolhasSemErro() {
        BudgetItem item = criarItemComTipologia("SWING_2_LEAF");

        Image imagem = BudgetPdfDrawingHelper.desenharMiniaturaEsquadria(writer, item,
                BudgetPdfDrawingHelper.DEFAULT_WIDTH, BudgetPdfDrawingHelper.DEFAULT_HEIGHT);

        assertNotNull(imagem, "A imagem retornada não deve ser nula");
    }

    @Test
    @DisplayName("Deve desenhar miniatura MAX_AR_WINDOW_1_LEAF (Maxim-Ar) sem erro")
    void deveDesenharMiniaturaMaximArSemErro() {
        BudgetItem item = criarItemComTipologia("MAX_AR_WINDOW_1_LEAF");

        Image imagem = BudgetPdfDrawingHelper.desenharMiniaturaEsquadria(writer, item,
                BudgetPdfDrawingHelper.DEFAULT_WIDTH, BudgetPdfDrawingHelper.DEFAULT_HEIGHT);

        assertNotNull(imagem, "A imagem retornada não deve ser nula");
    }

    @Test
    @DisplayName("Deve desenhar miniatura MAX_AR_WINDOW_INVERSE_1_LEAF (Maxim-Ar Invertido) sem erro")
    void deveDesenharMiniaturaMaximArInvertidoSemErro() {
        BudgetItem item = criarItemComTipologia("MAX_AR_WINDOW_INVERSE_1_LEAF");

        Image imagem = BudgetPdfDrawingHelper.desenharMiniaturaEsquadria(writer, item,
                BudgetPdfDrawingHelper.DEFAULT_WIDTH, BudgetPdfDrawingHelper.DEFAULT_HEIGHT);

        assertNotNull(imagem, "A imagem retornada não deve ser nula");
    }

    @Test
    @DisplayName("Deve desenhar miniatura FIXED_PANEL (Painel Fixo) sem erro")
    void deveDesenharMiniaturaPainelFixoSemErro() {
        BudgetItem item = criarItemComTipologia("FIXED_PANEL");

        Image imagem = BudgetPdfDrawingHelper.desenharMiniaturaEsquadria(writer, item,
                BudgetPdfDrawingHelper.DEFAULT_WIDTH, BudgetPdfDrawingHelper.DEFAULT_HEIGHT);

        assertNotNull(imagem, "A imagem retornada não deve ser nula");
    }

    @Test
    @DisplayName("Deve desenhar miniatura DRAWER_FRONT (Gaveta) sem erro")
    void deveDesenharMiniaturaGavetaSemErro() {
        BudgetItem item = criarItemComTipologia("DRAWER_FRONT");

        Image imagem = BudgetPdfDrawingHelper.desenharMiniaturaEsquadria(writer, item,
                BudgetPdfDrawingHelper.DEFAULT_WIDTH, BudgetPdfDrawingHelper.DEFAULT_HEIGHT);

        assertNotNull(imagem, "A imagem retornada não deve ser nula");
    }

    // ── Teste de Dimensões ───────────────────────────────────────────────

    @Test
    @DisplayName("Deve retornar imagem com dimensões corretas (60x70 pt)")
    void deveRetornarImagemComDimensoesCorretas() {
        BudgetItem item = criarItemComTipologia("SLIDING_2_LEAF");

        Image imagem = BudgetPdfDrawingHelper.desenharMiniaturaEsquadria(writer, item,
                BudgetPdfDrawingHelper.DEFAULT_WIDTH, BudgetPdfDrawingHelper.DEFAULT_HEIGHT);

        assertNotNull(imagem);
        assertEquals(BudgetPdfDrawingHelper.DEFAULT_WIDTH, imagem.getScaledWidth(), 0.1f,
                "A largura da imagem deve ser 60 pt");
        assertEquals(BudgetPdfDrawingHelper.DEFAULT_HEIGHT, imagem.getScaledHeight(), 0.1f,
                "A altura da imagem deve ser 70 pt");
    }

    @Test
    @DisplayName("Deve retornar imagem com dimensões customizadas")
    void deveRetornarImagemComDimensoesCustomizadas() {
        BudgetItem item = criarItemComTipologia("FIXED_PANEL");
        float customWidth = 80f;
        float customHeight = 100f;

        Image imagem = BudgetPdfDrawingHelper.desenharMiniaturaEsquadria(writer, item, customWidth, customHeight);

        assertNotNull(imagem);
        assertEquals(customWidth, imagem.getScaledWidth(), 0.1f);
        assertEquals(customHeight, imagem.getScaledHeight(), 0.1f);
    }

    // ── Testes de Fallback e Casos Limítrofes ────────────────────────────

    @Test
    @DisplayName("Deve desenhar miniatura genérica quando templateType é nulo")
    void deveDesenharMiniaturaComTemplateTypeNulo() {
        BudgetItem item = criarItemComTipologia(null);

        Image imagem = BudgetPdfDrawingHelper.desenharMiniaturaEsquadria(writer, item,
                BudgetPdfDrawingHelper.DEFAULT_WIDTH, BudgetPdfDrawingHelper.DEFAULT_HEIGHT);

        assertNotNull(imagem, "Deve gerar imagem fallback mesmo sem templateType");
    }

    @Test
    @DisplayName("Deve desenhar miniatura genérica quando templateType é vazio")
    void deveDesenharMiniaturaComTemplateTypeVazio() {
        BudgetItem item = criarItemComTipologia("   ");

        Image imagem = BudgetPdfDrawingHelper.desenharMiniaturaEsquadria(writer, item,
                BudgetPdfDrawingHelper.DEFAULT_WIDTH, BudgetPdfDrawingHelper.DEFAULT_HEIGHT);

        assertNotNull(imagem, "Deve gerar imagem fallback com templateType vazio");
    }

    @Test
    @DisplayName("Deve desenhar miniatura genérica quando item é nulo")
    void deveDesenharMiniaturaComItemNulo() {
        Image imagem = BudgetPdfDrawingHelper.desenharMiniaturaEsquadria(writer, null,
                BudgetPdfDrawingHelper.DEFAULT_WIDTH, BudgetPdfDrawingHelper.DEFAULT_HEIGHT);

        assertNotNull(imagem, "Deve gerar imagem fallback com item nulo");
    }

    @Test
    @DisplayName("Deve funcionar com a sobrecarga de dimensões padrão")
    void deveFuncionarComSobrecargaDeDimensoesPadrao() {
        BudgetItem item = criarItemComTipologia("SLIDING_2_LEAF");

        Image imagem = BudgetPdfDrawingHelper.desenharMiniaturaEsquadria(writer, item);

        assertNotNull(imagem);
        assertEquals(BudgetPdfDrawingHelper.DEFAULT_WIDTH, imagem.getScaledWidth(), 0.1f);
        assertEquals(BudgetPdfDrawingHelper.DEFAULT_HEIGHT, imagem.getScaledHeight(), 0.1f);
    }

    // ── Teste Parametrizado: Todas as Tipologias ─────────────────────────

    @ParameterizedTest(name = "Tipologia {0} deve gerar miniatura sem exceção")
    @EnumSource(TemplateType.class)
    @DisplayName("Não deve lançar exceção para nenhuma tipologia")
    void naoDeveLancarExcecaoParaTodasTipologias(TemplateType tipo) {
        BudgetItem item = criarItemComTipologia(tipo.name());

        assertDoesNotThrow(() -> {
            Image imagem = BudgetPdfDrawingHelper.desenharMiniaturaEsquadria(writer, item,
                    BudgetPdfDrawingHelper.DEFAULT_WIDTH, BudgetPdfDrawingHelper.DEFAULT_HEIGHT);
            assertNotNull(imagem, "Imagem não deve ser nula para tipologia " + tipo.name());
        });
    }

    // ── Testes de Validação de Entrada ───────────────────────────────────

    @Test
    @DisplayName("Deve lançar exceção quando PdfWriter é nulo")
    void deveLancarExcecaoQuandoWriterNulo() {
        BudgetItem item = criarItemComTipologia("SLIDING_2_LEAF");

        assertThrows(IllegalArgumentException.class, () ->
                BudgetPdfDrawingHelper.desenharMiniaturaEsquadria(null, item,
                        BudgetPdfDrawingHelper.DEFAULT_WIDTH, BudgetPdfDrawingHelper.DEFAULT_HEIGHT));
    }

    @Test
    @DisplayName("Deve lançar exceção quando largura é zero ou negativa")
    void deveLancarExcecaoQuandoLarguraInvalida() {
        BudgetItem item = criarItemComTipologia("SLIDING_2_LEAF");

        assertThrows(IllegalArgumentException.class, () ->
                BudgetPdfDrawingHelper.desenharMiniaturaEsquadria(writer, item, 0f, 70f));

        assertThrows(IllegalArgumentException.class, () ->
                BudgetPdfDrawingHelper.desenharMiniaturaEsquadria(writer, item, -10f, 70f));
    }

    @Test
    @DisplayName("Deve lançar exceção quando altura é zero ou negativa")
    void deveLancarExcecaoQuandoAlturaInvalida() {
        BudgetItem item = criarItemComTipologia("SLIDING_2_LEAF");

        assertThrows(IllegalArgumentException.class, () ->
                BudgetPdfDrawingHelper.desenharMiniaturaEsquadria(writer, item, 60f, 0f));

        assertThrows(IllegalArgumentException.class, () ->
                BudgetPdfDrawingHelper.desenharMiniaturaEsquadria(writer, item, 60f, -5f));
    }

    // ── Teste de resolução por Alias ─────────────────────────────────────

    @Test
    @DisplayName("Deve resolver alias SLIDING para SLIDING_2_LEAF")
    void deveResolverAliasSlidingParaSlidingDuasFolhas() {
        BudgetItem item = criarItemComTipologia("SLIDING");

        Image imagem = BudgetPdfDrawingHelper.desenharMiniaturaEsquadria(writer, item,
                BudgetPdfDrawingHelper.DEFAULT_WIDTH, BudgetPdfDrawingHelper.DEFAULT_HEIGHT);

        assertNotNull(imagem, "Deve gerar miniatura usando alias 'SLIDING'");
    }

    @Test
    @DisplayName("Deve resolver alias SWING para SWING_1_LEAF")
    void deveResolverAliasSwingParaSwingUmaFolha() {
        BudgetItem item = criarItemComTipologia("SWING");

        Image imagem = BudgetPdfDrawingHelper.desenharMiniaturaEsquadria(writer, item,
                BudgetPdfDrawingHelper.DEFAULT_WIDTH, BudgetPdfDrawingHelper.DEFAULT_HEIGHT);

        assertNotNull(imagem, "Deve gerar miniatura usando alias 'SWING'");
    }

    @Test
    @DisplayName("Deve resolver alias FIXED para FIXED_PANEL")
    void deveResolverAliasFixedParaPainelFixo() {
        BudgetItem item = criarItemComTipologia("FIXED");

        Image imagem = BudgetPdfDrawingHelper.desenharMiniaturaEsquadria(writer, item,
                BudgetPdfDrawingHelper.DEFAULT_WIDTH, BudgetPdfDrawingHelper.DEFAULT_HEIGHT);

        assertNotNull(imagem, "Deve gerar miniatura usando alias 'FIXED'");
    }

    // ── Geração de PDF de Demonstração para Visualização ─────────────────

    @Test
    @DisplayName("Gera arquivo PDF de demonstração visual com todas as 10 tipologias")
    void gerarPdfDemonstracaoParaVisualizacao() throws Exception {
        java.io.File pdfFile = java.io.File.createTempFile("miniaturas-esquadrias-demo-", ".pdf");
        pdfFile.deleteOnExit();
        try (java.io.FileOutputStream fos = new java.io.FileOutputStream(pdfFile)) {
            Document demoDoc = new Document(PageSize.A4, 36, 36, 36, 36);
            PdfWriter demoWriter = PdfWriter.getInstance(demoDoc, fos);
            demoDoc.open();

            com.lowagie.text.Font titleFont = com.lowagie.text.FontFactory.getFont(com.lowagie.text.FontFactory.HELVETICA_BOLD, 16, new java.awt.Color(20, 30, 50));
            com.lowagie.text.Font subFont = com.lowagie.text.FontFactory.getFont(com.lowagie.text.FontFactory.HELVETICA, 10, new java.awt.Color(100, 110, 120));
            com.lowagie.text.Font headerFont = com.lowagie.text.FontFactory.getFont(com.lowagie.text.FontFactory.HELVETICA_BOLD, 10, java.awt.Color.WHITE);
            com.lowagie.text.Font cellFont = com.lowagie.text.FontFactory.getFont(com.lowagie.text.FontFactory.HELVETICA_BOLD, 10, new java.awt.Color(30, 40, 50));
            com.lowagie.text.Font descFont = com.lowagie.text.FontFactory.getFont(com.lowagie.text.FontFactory.HELVETICA, 9, new java.awt.Color(80, 90, 100));

            Paragraph titulo = new Paragraph("AlumiGest — Demonstração das Miniaturas de Esquadrias (US-10.3)", titleFont);
            titulo.setSpacingAfter(4f);
            demoDoc.add(titulo);

            Paragraph subtitulo = new Paragraph("Catálogo visual vetorial renderizado pelo BudgetPdfDrawingHelper (OpenPDF puro)", subFont);
            subtitulo.setSpacingAfter(16f);
            demoDoc.add(subtitulo);

            com.lowagie.text.pdf.PdfPTable table = new com.lowagie.text.pdf.PdfPTable(3);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{1.5f, 3.5f, 5f});

            String[] headers = {"MINIATURA (60x70)", "TIPOLOGIA", "DETALHAMENTO GRÁFICO / COMPORTAMENTO"};
            for (String h : headers) {
                com.lowagie.text.pdf.PdfPCell cell = new com.lowagie.text.pdf.PdfPCell(new Phrase(h, headerFont));
                cell.setBackgroundColor(new java.awt.Color(20, 30, 50));
                cell.setPadding(8f);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(cell);
            }

            record ExemploTipologia(String codigo, String nome, String descricao) {}
            ExemploTipologia[] exemplos = {
                new ExemploTipologia("SLIDING_DOOR_1F", "Porta/Janela de Correr 1 Folha", "1 folha de vidro com seta indicativa de deslizamento lateral."),
                new ExemploTipologia("SLIDING_DOOR_2F", "Porta/Janela de Correr 2 Folhas", "2 folhas intercaladas com setas de deslizamento bidirecional."),
                new ExemploTipologia("SLIDING_DOOR_3F", "Porta de Correr 3 Folhas", "3 folhas sobrepostas com alternância de sentidos de abertura."),
                new ExemploTipologia("SLIDING_DOOR_4F", "Porta/Janela de Correr 4 Folhas", "4 folhas com abertura central recolhendo para as laterais."),
                new ExemploTipologia("SWING_DOOR_1F", "Porta de Giro 1 Folha", "Folha de giro com arco tracejado e indicação de raio de abertura."),
                new ExemploTipologia("SWING_DOOR_2F", "Porta de Giro 2 Folhas (Dupla)", "2 folhas de abrir com arcos de projeção opostos e puxadores verticais."),
                new ExemploTipologia("AWNING_WINDOW_1F", "Janela Maxim-Ar / Basculante", "Folha basculante com arco vertical indicando projeção externa."),
                new ExemploTipologia("AWNING_WINDOW_1F_INV", "Maxim-Ar Invertido", "Folha basculante projetante invertida com arco para cima."),
                new ExemploTipologia("FRONT_DRAWER", "Frente de Gaveta", "Painel de alumínio/vidro opaco com puxador perfil horizontal central."),
                new ExemploTipologia("FIXED_PANEL", "Painel Fixo / Fachada", "Folha de vidro fixa com traçado técnico em 'X' indicando ausência de partes móveis."),
                new ExemploTipologia("OUTRO_MODELO", "Fallback Genérico (Desconhecido)", "Acionado automaticamente se a tipologia for nula ou não catalogada.")
            };

            for (ExemploTipologia ex : exemplos) {
                BudgetItem item = new BudgetItem();
                item.setTemplateType(ex.codigo);

                Image img = BudgetPdfDrawingHelper.desenharMiniaturaEsquadria(demoWriter, item, 60f, 70f);

                com.lowagie.text.pdf.PdfPCell cellImg = new com.lowagie.text.pdf.PdfPCell(img, true);
                cellImg.setPadding(6f);
                cellImg.setHorizontalAlignment(Element.ALIGN_CENTER);
                cellImg.setVerticalAlignment(Element.ALIGN_MIDDLE);
                cellImg.setBorderColor(new java.awt.Color(220, 225, 230));

                Phrase phraseNome = new Phrase();
                phraseNome.add(new Chunk(ex.nome + "\n", cellFont));
                phraseNome.add(new Chunk("Código: " + ex.codigo, descFont));
                com.lowagie.text.pdf.PdfPCell cellNome = new com.lowagie.text.pdf.PdfPCell(phraseNome);
                cellNome.setPadding(8f);
                cellNome.setVerticalAlignment(Element.ALIGN_MIDDLE);
                cellNome.setBorderColor(new java.awt.Color(220, 225, 230));

                com.lowagie.text.pdf.PdfPCell cellDesc = new com.lowagie.text.pdf.PdfPCell(new Phrase(ex.descricao, descFont));
                cellDesc.setPadding(8f);
                cellDesc.setVerticalAlignment(Element.ALIGN_MIDDLE);
                cellDesc.setBorderColor(new java.awt.Color(220, 225, 230));

                table.addCell(cellImg);
                table.addCell(cellNome);
                table.addCell(cellDesc);
            }

            demoDoc.add(table);
            demoDoc.close();
        }
        assertTrue(pdfFile.exists(), "O arquivo PDF de demonstração deve ter sido gerado");
        assertTrue(pdfFile.length() > 0, "O PDF de demonstração não deve estar vazio");
    }
}
