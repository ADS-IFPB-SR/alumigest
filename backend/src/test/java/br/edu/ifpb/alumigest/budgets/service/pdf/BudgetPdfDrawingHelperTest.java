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
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.EnumSource;
import org.junit.jupiter.params.provider.ValueSource;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.lang.reflect.InvocationTargetException;
import java.math.BigDecimal;
import br.edu.ifpb.alumigest.budgets.domain.BudgetItemOption;
import br.edu.ifpb.alumigest.catalog.domain.MaterialCategoryType;
import br.edu.ifpb.alumigest.catalog.domain.Product;
import br.edu.ifpb.alumigest.catalog.domain.TemplateConfig;
import br.edu.ifpb.alumigest.budgets.service.pdf.strategy.TemplateThumbnailRegistry;
import br.edu.ifpb.alumigest.budgets.service.pdf.strategy.TemplateVisualContext;
import br.edu.ifpb.alumigest.budgets.service.pdf.strategy.TemplateVisualContextResolver;

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
        TemplateThumbnailRegistry.getInstance().unregister("CUSTOM_PIVOT_FACADE_360");
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

    @ParameterizedTest(name = "Deve desenhar miniatura {0} sem erro")
    @ValueSource(strings = {
        "SLIDING_2_LEAF",
        "SLIDING_4_LEAF",
        "SWING_1_LEAF",
        "SWING_2_LEAF",
        "MAX_AR_WINDOW_1_LEAF",
        "MAX_AR_WINDOW_INVERSE_1_LEAF",
        "FIXED_PANEL",
        "DRAWER_FRONT"
    })
    @DisplayName("Deve desenhar miniatura das tipologias principais sem erro")
    void deveDesenharMiniaturaPrincipaisTipologiasSemErro(String templateType) {
        BudgetItem item = criarItemComTipologia(templateType);

        Image imagem = BudgetPdfDrawingHelper.desenharMiniaturaEsquadria(writer, item,
                BudgetPdfDrawingHelper.DEFAULT_WIDTH, BudgetPdfDrawingHelper.DEFAULT_HEIGHT);

        assertNotNull(imagem, "A imagem retornada não deve ser nula para " + templateType);
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

    @Test
    @DisplayName("Deve retornar instância ativa do TemplateThumbnailRegistry via helper")
    void deveRetornarInstanciaAtivaDoRegistryViaHelper() {
        assertNotNull(BudgetPdfDrawingHelper.getRegistry(), "O registry retornado não deve ser nulo");
    }

    // ── Teste de resolução por Alias ─────────────────────────────────────

    @ParameterizedTest(name = "Deve resolver alias {0} sem erro")
    @ValueSource(strings = {"SLIDING", "SWING", "FIXED"})
    @DisplayName("Deve resolver aliases de tipologias sem erro")
    void deveResolverAliasesDeTipologias(String alias) {
        BudgetItem item = criarItemComTipologia(alias);

        Image imagem = BudgetPdfDrawingHelper.desenharMiniaturaEsquadria(writer, item,
                BudgetPdfDrawingHelper.DEFAULT_WIDTH, BudgetPdfDrawingHelper.DEFAULT_HEIGHT);

        assertNotNull(imagem, "Deve gerar miniatura usando alias '" + alias + "'");
    }

    // ── Testes de SOLID: Extensibilidade, Exclusão e Edição de Templates ──

    @Test
    @DisplayName("SOLID - OCP: Deve permitir adicionar novo template dinamicamente sem alterar código existente")
    void devePermitirAdicionarNovoTemplateSemQuebrarCodigo() {
        String novoModeloKey = "CUSTOM_PIVOT_FACADE_360";

        // Registra uma nova estratégia personalizada no Registry
        TemplateThumbnailRegistry.getInstance().register(novoModeloKey, (tpl, itm, ctx, w, h) -> {
            tpl.setColorFill(ctx.glassFill());
            tpl.rectangle(5f, 5f, w - 10f, h - 10f);
            tpl.fill();
        });

        assertTrue(TemplateThumbnailRegistry.getInstance().hasStrategy(novoModeloKey));

        BudgetItem item = criarItemComTipologia(novoModeloKey);
        Image imagem = BudgetPdfDrawingHelper.desenharMiniaturaEsquadria(writer, item);

        assertNotNull(imagem, "A imagem do novo template registrado não deve ser nula");
        assertEquals(BudgetPdfDrawingHelper.DEFAULT_WIDTH, imagem.getScaledWidth(), 0.1f);
        assertEquals(BudgetPdfDrawingHelper.DEFAULT_HEIGHT, imagem.getScaledHeight(), 0.1f);
    }

    @Test
    @DisplayName("SOLID - Resiliência: Deve permitir excluir um template sem quebrar o código (usando fallback seguro)")
    void devePermitirExcluirTemplateSemQuebrarCodigo() {
        String templateExcluidoKey = "TEMPLATE_DESCONTINUADO_V1";

        // Garante que o template não existe ou foi removido do catálogo
        TemplateThumbnailRegistry.getInstance().unregister(templateExcluidoKey);
        assertFalse(TemplateThumbnailRegistry.getInstance().hasStrategy(templateExcluidoKey));

        BudgetItem item = criarItemComTipologia(templateExcluidoKey);

        // Deve renderizar sem lançar qualquer exceção
        Image imagem = assertDoesNotThrow(() ->
                BudgetPdfDrawingHelper.desenharMiniaturaEsquadria(writer, item));

        assertNotNull(imagem, "Deve gerar imagem de fallback para template excluído/inexistente");
        assertEquals(BudgetPdfDrawingHelper.DEFAULT_WIDTH, imagem.getScaledWidth(), 0.1f);
        assertEquals(BudgetPdfDrawingHelper.DEFAULT_HEIGHT, imagem.getScaledHeight(), 0.1f);
    }

    @Test
    @DisplayName("TEA: As imagens do motor gráfico dependem dinamicamente dos templates e opções do orçamento (Preto e Fumê)")
    void deveRefletirEdicaoDeCoresEMateriaisDoTemplateDoOrcamentoPretoEFume() {
        BudgetItem item = criarItemComTipologia("SLIDING_DOOR_2F");

        BudgetItemOption optPerfil = new BudgetItemOption();
        optPerfil.setCategoryType(MaterialCategoryType.PROFILE);
        optPerfil.setSelectedColor("Preto Fosco");
        optPerfil.setMaterialName("Perfil Alumínio Linha Suprema");
        item.addOption(optPerfil);

        BudgetItemOption optVidro = new BudgetItemOption();
        optVidro.setCategoryType(MaterialCategoryType.GLASS);
        optVidro.setSelectedColor("Fumê");
        optVidro.setMaterialName("Vidro Temperado 8mm");
        item.addOption(optVidro);

        TemplateVisualContext ctx = TemplateVisualContextResolver.resolve(item);

        assertEquals(new Color(33, 33, 33), ctx.frameFill(), "Cor do perfil deve ser Preto #212121");
        assertEquals(new Color(100, 116, 139), ctx.glassFill(), "Cor do vidro deve ser Fumê #64748b");

        Image imagem = assertDoesNotThrow(() ->
                BudgetPdfDrawingHelper.desenharMiniaturaEsquadria(writer, item));
        assertNotNull(imagem);
    }

    @Test
    @DisplayName("TEA: As imagens do motor gráfico dependem dinamicamente dos templates e opções do orçamento (Bronze e Verde)")
    void deveRefletirEdicaoDeCoresEMateriaisDoTemplateDoOrcamentoBronzeEVerde() {
        BudgetItem item = criarItemComTipologia("SWING_DOOR_1F");

        BudgetItemOption optPerfil = new BudgetItemOption();
        optPerfil.setCategoryType(MaterialCategoryType.PROFILE);
        optPerfil.setSelectedColor("Bronze 1002");
        item.addOption(optPerfil);

        BudgetItemOption optVidro = new BudgetItemOption();
        optVidro.setCategoryType(MaterialCategoryType.GLASS);
        optVidro.setSelectedColor("Verde Laminado");
        item.addOption(optVidro);

        TemplateVisualContext ctx = TemplateVisualContextResolver.resolve(item);

        assertEquals(new Color(120, 53, 15), ctx.frameFill(), "Cor do perfil deve ser Bronze #78350f");
        assertEquals(new Color(167, 243, 208), ctx.glassFill(), "Cor do vidro deve ser Verde #a7f3d0");

        Image imagem = assertDoesNotThrow(() ->
                BudgetPdfDrawingHelper.desenharMiniaturaEsquadria(writer, item));
        assertNotNull(imagem);
    }

    @Test
    @DisplayName("TEA: Deve resolver cores dinamicamente a partir do JSON de templateConfig do produto")
    void deveResolverCoresDiretamenteDeTemplateConfigJson() {
        BudgetItem item = criarItemComTipologia("AWNING_WINDOW_1F");
        item.setTemplateConfig("{\"aluminumColor\":\"#D4AF37\",\"glassFinish\":\"reflecta\"}");

        TemplateVisualContext ctx = TemplateVisualContextResolver.resolve(item);

        assertEquals(new Color(180, 83, 9), ctx.frameFill(), "Cor do perfil deve ser Dourado #b45309");
        assertEquals(new Color(254, 215, 170), ctx.glassFill(), "Cor do vidro deve ser Reflecta #fed7aa");

        Image imagem = assertDoesNotThrow(() ->
                BudgetPdfDrawingHelper.desenharMiniaturaEsquadria(writer, item));
        assertNotNull(imagem);
    }

    @Test
    @DisplayName("Resiliência: Deve rodar livremente sem falhas mesmo com dados corrompidos ou totalmente nulos")
    void deveRodarLivrementeComDadosNulosOuCorrompidos() {
        BudgetItem itemComTudoNulo = new BudgetItem();
        itemComTudoNulo.setTemplateType(null);
        itemComTudoNulo.setTemplateConfig(null);
        itemComTudoNulo.setWidthMm(null);
        itemComTudoNulo.setHeightMm(null);

        Image imagem = assertDoesNotThrow(() ->
                BudgetPdfDrawingHelper.desenharMiniaturaEsquadria(writer, itemComTudoNulo));

        assertNotNull(imagem, "Deve gerar imagem padrão limpa sem exceção");
    }

    @ParameterizedTest(name = "Deve resolver paleta de perfil {0} corretamente")
    @CsvSource({
        "Preto Fosco, 33, 33, 33, 9, 9, 11",
        "Black Piano, 33, 33, 33, 9, 9, 11",
        "#212121, 33, 33, 33, 9, 9, 11",
        "Branco Neve, 248, 250, 252, 148, 163, 184",
        "White, 248, 250, 252, 148, 163, 184",
        "#ffffff, 248, 250, 252, 148, 163, 184",
        "Bronze 1002, 120, 53, 15, 69, 26, 3",
        "Champagne, 120, 53, 15, 69, 26, 3",
        "#8c6239, 120, 53, 15, 69, 26, 3",
        "Dourado Real, 180, 83, 9, 120, 53, 15",
        "Gold, 180, 83, 9, 120, 53, 15",
        "#d4af37, 180, 83, 9, 120, 53, 15",
        "Inox Escovado, 148, 163, 184, 71, 85, 105",
        "Cromado Polido, 148, 163, 184, 71, 85, 105",
        "#9e9e9e, 148, 163, 184, 71, 85, 105",
        "Fosco Anodizado, 71, 85, 105, 30, 41, 59",
        "Anodizado Natural, 71, 85, 105, 30, 41, 59",
        "#b0bec5, 71, 85, 105, 30, 41, 59"
    })
    @DisplayName("Deve resolver todas as paletas de perfis de alumínio")
    void deveResolverTodasPaletasDePerfis(String cor, int rFill, int gFill, int bFill, int rStroke, int gStroke, int bStroke) {
        BudgetItem item = criarItemComTipologia("SLIDING_2_LEAF");
        BudgetItemOption opt = new BudgetItemOption();
        opt.setCategoryType(MaterialCategoryType.PROFILE);
        opt.setSelectedColor(cor);
        item.addOption(opt);

        TemplateVisualContext ctx = TemplateVisualContextResolver.resolve(item);
        assertEquals(new Color(rFill, gFill, bFill), ctx.frameFill());
        assertEquals(new Color(rStroke, gStroke, bStroke), ctx.frameStroke());
    }

    @ParameterizedTest(name = "Deve resolver paleta de vidro {0} corretamente")
    @CsvSource({
        "Fumê Temperado, 100, 116, 139, 71, 85, 105",
        "Cinza Escuro, 100, 116, 139, 71, 85, 105",
        "#595959, 100, 116, 139, 71, 85, 105",
        "Verde Laminado, 167, 243, 208, 110, 231, 183",
        "Green, 167, 243, 208, 110, 231, 183",
        "#e0f2f1, 167, 243, 208, 110, 231, 183",
        "Reflecta Bronze, 254, 215, 170, 253, 186, 116",
        "Bronze Champ, 254, 215, 170, 253, 186, 116",
        "#b87333, 254, 215, 170, 253, 186, 116",
        "Canelado 4mm, 241, 245, 249, 226, 232, 240",
        "Texturizado Mini-Boreal, 241, 245, 249, 226, 232, 240",
        "#e0e0e0, 241, 245, 249, 226, 232, 240"
    })
    @DisplayName("Deve resolver todas as paletas de acabamentos de vidros")
    void deveResolverTodasPaletasDeVidros(String cor, int rFill, int gFill, int bFill, int rFixed, int gFixed, int bFixed) {
        BudgetItem item = criarItemComTipologia("SLIDING_2_LEAF");
        BudgetItemOption opt = new BudgetItemOption();
        opt.setCategoryType(MaterialCategoryType.GLASS);
        opt.setSelectedColor(cor);
        item.addOption(opt);

        TemplateVisualContext ctx = TemplateVisualContextResolver.resolve(item);
        assertEquals(new Color(rFill, gFill, bFill), ctx.glassFill());
        assertEquals(new Color(rFixed, gFixed, bFixed), ctx.fixedGlassFill());
    }

    @Test
    @DisplayName("Deve resolver acabamento de vidro a partir da opção estética de película textual")
    void deveResolverAcabamentoVidroViaOpcaoDePeliculaTextual() {
        BudgetItem item = criarItemComTipologia("SLIDING_2_LEAF");
        BudgetItemOption opt = new BudgetItemOption();
        opt.setCategoryType(MaterialCategoryType.GLASS);
        opt.setSelectedColor("Fumê");
        opt.setMaterialName("Película Fumê Térmica");
        item.addOption(opt);

        TemplateVisualContext ctx = TemplateVisualContextResolver.resolve(item);
        assertEquals(new Color(100, 116, 139), ctx.glassFill());
    }

    @ParameterizedTest(name = "Deve resolver película com termo {0}")
    @ValueSource(strings = {"Pelicula Fume", "Film Fume", "película fume"})
    @DisplayName("Deve resolver película com variações textuais de grafia")
    void deveResolverPeliculaComVariacoesTextuais(String nomeMaterial) {
        BudgetItem item = criarItemComTipologia("SLIDING_2_LEAF");
        BudgetItemOption opt = new BudgetItemOption();
        opt.setMaterialName(nomeMaterial);
        opt.setSelectedColor("Fumê");
        item.addOption(opt);

        TemplateVisualContext ctx = TemplateVisualContextResolver.resolve(item);
        assertEquals(new Color(100, 116, 139), ctx.glassFill());
    }

    @Test
    @DisplayName("Deve ignorar opções nulas ou categorias não relacionadas ao vidro")
    void deveIgnorarOpcoesNulasOuNaoRelacionadasAoVidro() {
        BudgetItem item = criarItemComTipologia("SLIDING_2_LEAF");
        BudgetItemOption optInvalida = new BudgetItemOption();
        optInvalida.setCategoryType(MaterialCategoryType.HARDWARE);
        optInvalida.setMaterialName("Dobradiça Inox");
        item.addOption(optInvalida);

        BudgetItemOption optVazia = new BudgetItemOption();
        item.addOption(optVazia);

        TemplateVisualContext ctx = TemplateVisualContextResolver.resolve(item);
        assertEquals(TemplateVisualContext.DEFAULT_GLASS_FILL, ctx.glassFill());
    }

    @Test
    @DisplayName("Deve resolver cor a partir do materialName se selectedColor for nula ou em branco")
    void deveResolverCorViaMaterialNameQuandoSelectedColorAusente() {
        BudgetItem item = criarItemComTipologia("SWING_1_LEAF");
        BudgetItemOption optPerfil = new BudgetItemOption();
        optPerfil.setCategoryType(MaterialCategoryType.PROFILE);
        optPerfil.setSelectedColor("   ");
        optPerfil.setMaterialName("Alumínio Branco");
        item.addOption(optPerfil);

        BudgetItemOption optVidro = new BudgetItemOption();
        optVidro.setCategoryType(MaterialCategoryType.GLASS);
        optVidro.setSelectedColor(null);
        optVidro.setMaterialName("Vidro Verde");
        item.addOption(optVidro);

        TemplateVisualContext ctx = TemplateVisualContextResolver.resolve(item);
        assertEquals(new Color(248, 250, 252), ctx.frameFill());
        assertEquals(new Color(167, 243, 208), ctx.glassFill());
    }

    @Test
    @DisplayName("Deve resolver cor a partir do TemplateConfig do Produto vinculado")
    void deveResolverCorViaProdutoVinculado() {
        BudgetItem item = criarItemComTipologia("SLIDING_2_LEAF");
        Product produto = new Product();
        TemplateConfig config = new TemplateConfig();
        config.setAluminumColor("Branco");
        config.setGlassColor("Verde");
        produto.setTemplateConfig(config);
        item.setProduct(produto);

        TemplateVisualContext ctx = TemplateVisualContextResolver.resolve(item);
        assertEquals(new Color(248, 250, 252), ctx.frameFill());
        assertEquals(new Color(167, 243, 208), ctx.glassFill());
    }

    @Test
    @DisplayName("Deve ignorar TemplateConfig com valores vazios ou Produto nulo")
    void deveIgnorarTemplateConfigVazio() {
        BudgetItem item = criarItemComTipologia("SLIDING_2_LEAF");
        Product produto = new Product();
        TemplateConfig config = new TemplateConfig();
        config.setAluminumColor("  ");
        config.setGlassColor(null);
        produto.setTemplateConfig(config);
        item.setProduct(produto);

        TemplateVisualContext ctx = TemplateVisualContextResolver.resolve(item);
        assertEquals(TemplateVisualContext.DEFAULT_FRAME_FILL, ctx.frameFill());
        assertEquals(TemplateVisualContext.DEFAULT_GLASS_FILL, ctx.glassFill());
    }

    @Test
    @DisplayName("Deve resolver JSON com valores nulos, numéricos e fallback seguro de parsing")
    void deveResolverJsonComValoresNulosENumericos() {
        BudgetItem item = criarItemComTipologia("SLIDING_2_LEAF");
        item.setTemplateConfig("{\"aluminumColor\": null, \"glassColor\": \"verde\", \"numericProp\": 123}");

        TemplateVisualContext ctx = TemplateVisualContextResolver.resolve(item);
        assertEquals(TemplateVisualContext.DEFAULT_FRAME_FILL, ctx.frameFill());
        assertEquals(new Color(167, 243, 208), ctx.glassFill());
    }

    @Test
    @DisplayName("Deve tratar JSON malformado ou corrompido sem lançar exceções")
    void deveTratarJsonMalformadoDefensivamente() {
        BudgetItem item = criarItemComTipologia("SLIDING_2_LEAF");
        item.setTemplateConfig("{malformed_json: true");

        TemplateVisualContext ctx = TemplateVisualContextResolver.resolve(item);
        assertEquals(TemplateVisualContext.DEFAULT_FRAME_FILL, ctx.frameFill());
        assertEquals(TemplateVisualContext.DEFAULT_GLASS_FILL, ctx.glassFill());
    }

    @Test
    @DisplayName("Deve utilizar cores padrão para opções de cores desconhecidas ou não mapeadas")
    void deveUsarCoresPadraoParaCoresDesconhecidas() {
        BudgetItem item = criarItemComTipologia("SLIDING_2_LEAF");
        BudgetItemOption optPerfil = new BudgetItemOption();
        optPerfil.setCategoryType(MaterialCategoryType.PROFILE);
        optPerfil.setSelectedColor("AzulTurquesaInexistente");
        item.addOption(optPerfil);

        BudgetItemOption optVidro = new BudgetItemOption();
        optVidro.setCategoryType(MaterialCategoryType.GLASS);
        optVidro.setSelectedColor("VermelhoFogoInexistente");
        item.addOption(optVidro);

        TemplateVisualContext ctx = TemplateVisualContextResolver.resolve(item);
        assertEquals(TemplateVisualContext.DEFAULT_FRAME_FILL, ctx.frameFill());
        assertEquals(TemplateVisualContext.DEFAULT_FRAME_STROKE, ctx.frameStroke());
        assertEquals(TemplateVisualContext.DEFAULT_GLASS_FILL, ctx.glassFill());
        assertEquals(TemplateVisualContext.DEFAULT_FIXED_GLASS, ctx.fixedGlassFill());
    }

    // ── Geração de PDF de Demonstração para Visualização ─────────────────

    @Test
    @DisplayName("Gera arquivo PDF de demonstração visual com todas as 10 tipologias")
    void gerarPdfDemonstracaoParaVisualizacao() throws Exception {
        ByteArrayOutputStream demoOutput = new ByteArrayOutputStream();
        try (demoOutput) {
            Document demoDoc = new Document(PageSize.A4, 36, 36, 36, 36);
            PdfWriter demoWriter = PdfWriter.getInstance(demoDoc, demoOutput);
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
        assertTrue(demoOutput.size() > 0, "O PDF de demonstração não deve estar vazio");
    }
}
