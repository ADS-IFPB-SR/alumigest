package br.edu.ifpb.alumigest.budgets.service.pdf;

import br.edu.ifpb.alumigest.budgets.calculator.TemplateType;
import br.edu.ifpb.alumigest.budgets.domain.BudgetItem;
import com.lowagie.text.Image;
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfTemplate;
import com.lowagie.text.pdf.PdfWriter;

import java.awt.Color;

/**
 * Classe utilitária gráfica e autônoma responsável por desenhar a geometria
 * vetorial da esquadria em escala reduzida utilizando primitivas do OpenPDF.
 *
 * <p>Não possui dependência de banco de dados, contexto Spring ou qualquer
 * recurso externo. Opera exclusivamente com as primitivas de desenho vetorial
 * {@link PdfTemplate} e {@link PdfContentByte}.</p>
 *
 * <p>Cada miniatura é desenhada em um {@link PdfTemplate} com dimensões
 * configuráveis (padrão 60×70 pt) e retornada como {@link Image} para
 * inclusão transparente em células de tabela PDF.</p>
 *
 * @see TemplateType
 */
public final class BudgetPdfDrawingHelper {

    /** Largura padrão da miniatura em pontos PDF. */
    public static final float DEFAULT_WIDTH = 60f;

    /** Altura padrão da miniatura em pontos PDF. */
    public static final float DEFAULT_HEIGHT = 70f;

    // ── Paleta de Cores ──────────────────────────────────────────────────

    /** Cor do marco/caixilho externo — cinza escuro. */
    private static final Color COR_MARCO = new Color(50, 55, 65);

    /** Cor das divisórias internas entre folhas. */
    private static final Color COR_DIVISORIA = new Color(140, 145, 155);

    /** Cor de preenchimento simulando vidro — azul suave. */
    private static final Color COR_VIDRO = new Color(195, 220, 240);

    /** Cor dos indicadores de movimento (setas e arcos). */
    private static final Color COR_INDICADOR = new Color(100, 110, 125);

    /** Cor de fundo da área de vidro para folhas fixas. */
    private static final Color COR_VIDRO_FIXO = new Color(210, 228, 245);

    // ── Espessuras de Linha ──────────────────────────────────────────────

    /** Espessura da linha do marco externo. */
    private static final float ESPESSURA_MARCO = 1.8f;

    /** Espessura da linha das divisórias internas. */
    private static final float ESPESSURA_DIVISORIA = 0.75f;

    /** Espessura das linhas de indicadores de movimento. */
    private static final float ESPESSURA_INDICADOR = 0.5f;

    /** Margem interna entre marco e área de desenho. */
    private static final float MARGEM_INTERNA = 3f;

    // Construtor privado — classe utilitária, não deve ser instanciada.
    private BudgetPdfDrawingHelper() {
        throw new UnsupportedOperationException("Classe utilitária não pode ser instanciada.");
    }

    /**
     * Desenha a miniatura vetorial da esquadria associada ao item do orçamento.
     *
     * @param writer instância do {@link PdfWriter} ativa para obtenção do DirectContent
     * @param item   item do orçamento contendo {@code templateType}, {@code widthMm} e {@code heightMm}
     * @param width  largura da miniatura em pontos PDF
     * @param height altura da miniatura em pontos PDF
     * @return {@link Image} vetorial pronta para inclusão em {@link com.lowagie.text.pdf.PdfPCell}
     */
    public static Image desenharMiniaturaEsquadria(PdfWriter writer, BudgetItem item, float width, float height) {
        if (writer == null) {
            throw new IllegalArgumentException("O PdfWriter não pode ser nulo.");
        }
        if (width <= 0 || height <= 0) {
            throw new IllegalArgumentException("Largura e altura devem ser positivas.");
        }

        PdfContentByte directContent = writer.getDirectContent();
        PdfTemplate template = directContent.createTemplate(width, height);

        TemplateType tipo = resolverTipologia(item);

        desenharMarcoExterno(template, width, height);
        renderizarTipologia(template, tipo, width, height);

        return Image.getInstance(template);
    }

    /**
     * Sobrecarga que utiliza as dimensões padrão (60×70 pt).
     */
    public static Image desenharMiniaturaEsquadria(PdfWriter writer, BudgetItem item) {
        return desenharMiniaturaEsquadria(writer, item, DEFAULT_WIDTH, DEFAULT_HEIGHT);
    }

    // ── Resolução da Tipologia ───────────────────────────────────────────

    /**
     * Resolve o {@link TemplateType} a partir do campo {@code templateType}
     * do item do orçamento. Retorna {@code null} se não for possível resolver.
     */
    private static TemplateType resolverTipologia(BudgetItem item) {
        if (item == null) {
            return null;
        }
        String rawType = item.getTemplateType();
        if (rawType == null || rawType.isBlank()) {
            return null;
        }
        return TemplateType.parse(rawType);
    }

    // ── Marco Externo ────────────────────────────────────────────────────

    /**
     * Desenha o retângulo externo representando o marco/caixilho da esquadria.
     */
    private static void desenharMarcoExterno(PdfTemplate tpl, float w, float h) {
        tpl.setColorStroke(COR_MARCO);
        tpl.setLineWidth(ESPESSURA_MARCO);
        float offset = ESPESSURA_MARCO / 2;
        tpl.rectangle(offset, offset, w - ESPESSURA_MARCO, h - ESPESSURA_MARCO);
        tpl.stroke();
    }

    // ── Despacho por Tipologia ───────────────────────────────────────────

    /**
     * Renderiza o interior da miniatura conforme a tipologia da esquadria.
     */
    private static void renderizarTipologia(PdfTemplate tpl, TemplateType tipo, float w, float h) {
        if (tipo == null) {
            desenharFallbackGenerico(tpl, w, h);
            return;
        }

        switch (tipo) {
            case SLIDING_1_LEAF -> desenharJanelaCorrer(tpl, 1, w, h);
            case SLIDING_2_LEAF -> desenharJanelaCorrer(tpl, 2, w, h);
            case SLIDING_3_LEAF -> desenharJanelaCorrer(tpl, 3, w, h);
            case SLIDING_4_LEAF -> desenharJanelaCorrer(tpl, 4, w, h);
            case SWING_1_LEAF -> desenharPortaGiro(tpl, 1, w, h);
            case SWING_2_LEAF -> desenharPortaGiro(tpl, 2, w, h);
            case MAX_AR_WINDOW_1_LEAF -> desenharMaximAr(tpl, false, w, h);
            case MAX_AR_WINDOW_INVERSE_1_LEAF -> desenharMaximAr(tpl, true, w, h);
            case DRAWER_FRONT -> desenharGaveta(tpl, w, h);
            case FIXED_PANEL -> desenharPainelFixo(tpl, w, h);
            default -> desenharFallbackGenerico(tpl, w, h);
        }

    }

    // ── Renderização: Janela de Correr (Sliding) ─────────────────────────

    /**
     * Renderiza janelas de correr com 1 a 4 folhas.
     * Cada folha é desenhada como um retângulo com preenchimento de vidro,
     * e setas horizontais indicam a direção de deslizamento.
     */
    private static void desenharJanelaCorrer(PdfTemplate tpl, int folhas, float w, float h) {
        float areaX = MARGEM_INTERNA + ESPESSURA_MARCO;
        float areaY = MARGEM_INTERNA + ESPESSURA_MARCO;
        float areaW = w - 2 * (MARGEM_INTERNA + ESPESSURA_MARCO);
        float areaH = h - 2 * (MARGEM_INTERNA + ESPESSURA_MARCO);

        if (areaW <= 0 || areaH <= 0) return;

        float larguraFolha = areaW / folhas;

        for (int i = 0; i < folhas; i++) {
            float fx = areaX + (i * larguraFolha);

            // Preenchimento de vidro
            tpl.setColorFill(i % 2 == 0 ? COR_VIDRO : COR_VIDRO_FIXO);
            tpl.rectangle(fx + 1, areaY + 1, larguraFolha - 2, areaH - 2);
            tpl.fill();

            // Borda da folha
            tpl.setColorStroke(COR_DIVISORIA);
            tpl.setLineWidth(ESPESSURA_DIVISORIA);
            tpl.rectangle(fx, areaY, larguraFolha, areaH);
            tpl.stroke();

            // Seta de deslizamento (alternando direção)
            desenharSetaHorizontal(tpl, fx, areaY, larguraFolha, areaH, i % 2 == 0);
        }
    }

    /**
     * Desenha uma seta horizontal no centro da folha indicando direção de deslizamento.
     */
    private static void desenharSetaHorizontal(PdfTemplate tpl, float fx, float fy,
                                                float fw, float fh, boolean paraDireita) {
        tpl.setColorStroke(COR_INDICADOR);
        tpl.setLineWidth(ESPESSURA_INDICADOR);

        float centroY = fy + fh / 2;
        float margemSeta = fw * 0.15f;
        float inicioX = fx + margemSeta;
        float fimX = fx + fw - margemSeta;
        float tamanhoSeta = Math.min(fw * 0.12f, 4f);

        tpl.moveTo(inicioX, centroY);
        tpl.lineTo(fimX, centroY);
        tpl.stroke();

        // Ponta da seta
        float pontaX = paraDireita ? fimX : inicioX;
        float direcao = paraDireita ? -1 : 1;

        tpl.moveTo(pontaX, centroY);
        tpl.lineTo(pontaX + direcao * tamanhoSeta, centroY + tamanhoSeta);
        tpl.stroke();

        tpl.moveTo(pontaX, centroY);
        tpl.lineTo(pontaX + direcao * tamanhoSeta, centroY - tamanhoSeta);
        tpl.stroke();
    }

    // ── Renderização: Porta de Giro (Swing) ──────────────────────────────

    /**
     * Renderiza portas de giro com 1 ou 2 folhas.
     * Arcos de ¼ de círculo indicam a abertura da folha.
     */
    private static void desenharPortaGiro(PdfTemplate tpl, int folhas, float w, float h) {
        float areaX = MARGEM_INTERNA + ESPESSURA_MARCO;
        float areaY = MARGEM_INTERNA + ESPESSURA_MARCO;
        float areaW = w - 2 * (MARGEM_INTERNA + ESPESSURA_MARCO);
        float areaH = h - 2 * (MARGEM_INTERNA + ESPESSURA_MARCO);

        if (areaW <= 0 || areaH <= 0) return;

        if (folhas == 1) {
            // Preenchimento de vidro
            tpl.setColorFill(COR_VIDRO);
            tpl.rectangle(areaX + 1, areaY + 1, areaW - 2, areaH - 2);
            tpl.fill();

            // Borda da folha
            tpl.setColorStroke(COR_DIVISORIA);
            tpl.setLineWidth(ESPESSURA_DIVISORIA);
            tpl.rectangle(areaX, areaY, areaW, areaH);
            tpl.stroke();

            // Linha diagonal (da dobradiça ao canto oposto)
            tpl.setColorStroke(COR_INDICADOR);
            tpl.setLineWidth(ESPESSURA_INDICADOR);
            tpl.moveTo(areaX, areaY);
            tpl.lineTo(areaX + areaW, areaY + areaH);
            tpl.stroke();

            // Arco de giro (¼ círculo no canto inferior-esquerdo)
            desenharArcoGiro(tpl, areaX, areaY, Math.min(areaW, areaH) * 0.35f, 0f, 90f);

        } else {
            float larguraFolha = areaW / 2;

            // Folha esquerda
            tpl.setColorFill(COR_VIDRO);
            tpl.rectangle(areaX + 1, areaY + 1, larguraFolha - 2, areaH - 2);
            tpl.fill();

            tpl.setColorStroke(COR_DIVISORIA);
            tpl.setLineWidth(ESPESSURA_DIVISORIA);
            tpl.rectangle(areaX, areaY, larguraFolha, areaH);
            tpl.stroke();

            // Diagonal esquerda (dobradiça esquerda-inferior → centro-superior)
            tpl.setColorStroke(COR_INDICADOR);
            tpl.setLineWidth(ESPESSURA_INDICADOR);
            tpl.moveTo(areaX, areaY);
            tpl.lineTo(areaX + larguraFolha, areaY + areaH);
            tpl.stroke();

            // Arco esquerdo
            desenharArcoGiro(tpl, areaX, areaY, Math.min(larguraFolha, areaH) * 0.35f, 0f, 90f);

            // Folha direita
            float direitaX = areaX + larguraFolha;

            tpl.setColorFill(COR_VIDRO);
            tpl.rectangle(direitaX + 1, areaY + 1, larguraFolha - 2, areaH - 2);
            tpl.fill();

            tpl.setColorStroke(COR_DIVISORIA);
            tpl.setLineWidth(ESPESSURA_DIVISORIA);
            tpl.rectangle(direitaX, areaY, larguraFolha, areaH);
            tpl.stroke();

            // Diagonal direita (dobradiça direita-inferior → centro-superior)
            tpl.setColorStroke(COR_INDICADOR);
            tpl.setLineWidth(ESPESSURA_INDICADOR);
            tpl.moveTo(direitaX + larguraFolha, areaY);
            tpl.lineTo(direitaX, areaY + areaH);
            tpl.stroke();

            // Arco direito (espelhado)
            desenharArcoGiro(tpl, direitaX + larguraFolha, areaY,
                    Math.min(larguraFolha, areaH) * 0.35f, 90f, 180f);
        }
    }

    /**
     * Desenha um arco de giro (¼ de círculo) no ponto de dobradiça.
     */
    private static void desenharArcoGiro(PdfTemplate tpl, float cx, float cy,
                                          float raio, float anguloInicio, float anguloFim) {
        tpl.setColorStroke(COR_INDICADOR);
        tpl.setLineWidth(ESPESSURA_INDICADOR);
        tpl.setLineDash(2f, 2f, 0f);
        tpl.arc(cx - raio, cy - raio, cx + raio, cy + raio, anguloInicio, anguloFim - anguloInicio);
        tpl.stroke();
        tpl.setLineDash(0f);
    }

    // ── Renderização: Maxim-Ar ───────────────────────────────────────────

    /**
     * Renderiza janela basculante/maxim-ar.
     * Uma linha diagonal indica a direção de abertura (superior ou inferior).
     *
     * @param invertido se {@code true}, a abertura é pela parte inferior
     */
    private static void desenharMaximAr(PdfTemplate tpl, boolean invertido, float w, float h) {
        float areaX = MARGEM_INTERNA + ESPESSURA_MARCO;
        float areaY = MARGEM_INTERNA + ESPESSURA_MARCO;
        float areaW = w - 2 * (MARGEM_INTERNA + ESPESSURA_MARCO);
        float areaH = h - 2 * (MARGEM_INTERNA + ESPESSURA_MARCO);

        if (areaW <= 0 || areaH <= 0) return;

        // Preenchimento de vidro
        tpl.setColorFill(COR_VIDRO);
        tpl.rectangle(areaX + 1, areaY + 1, areaW - 2, areaH - 2);
        tpl.fill();

        // Borda da folha
        tpl.setColorStroke(COR_DIVISORIA);
        tpl.setLineWidth(ESPESSURA_DIVISORIA);
        tpl.rectangle(areaX, areaY, areaW, areaH);
        tpl.stroke();

        // Linhas diagonais formando "V" ou "^" indicando abertura
        tpl.setColorStroke(COR_INDICADOR);
        tpl.setLineWidth(ESPESSURA_INDICADOR);

        float centroX = areaX + areaW / 2;

        if (invertido) {
            // Abertura inferior: linhas convergem para baixo
            tpl.moveTo(areaX, areaY + areaH);
            tpl.lineTo(centroX, areaY);
            tpl.stroke();

            tpl.moveTo(areaX + areaW, areaY + areaH);
            tpl.lineTo(centroX, areaY);
            tpl.stroke();
        } else {
            // Abertura superior: linhas convergem para cima
            tpl.moveTo(areaX, areaY);
            tpl.lineTo(centroX, areaY + areaH);
            tpl.stroke();

            tpl.moveTo(areaX + areaW, areaY);
            tpl.lineTo(centroX, areaY + areaH);
            tpl.stroke();
        }
    }

    // ── Renderização: Gaveta ─────────────────────────────────────────────

    /**
     * Renderiza a frente de gaveta com puxador central.
     */
    private static void desenharGaveta(PdfTemplate tpl, float w, float h) {
        float areaX = MARGEM_INTERNA + ESPESSURA_MARCO;
        float areaY = MARGEM_INTERNA + ESPESSURA_MARCO;
        float areaW = w - 2 * (MARGEM_INTERNA + ESPESSURA_MARCO);
        float areaH = h - 2 * (MARGEM_INTERNA + ESPESSURA_MARCO);

        if (areaW <= 0 || areaH <= 0) return;

        // Preenchimento sólido (gaveta não tem vidro)
        tpl.setColorFill(COR_VIDRO_FIXO);
        tpl.rectangle(areaX + 1, areaY + 1, areaW - 2, areaH - 2);
        tpl.fill();

        // Borda interna
        tpl.setColorStroke(COR_DIVISORIA);
        tpl.setLineWidth(ESPESSURA_DIVISORIA);
        tpl.rectangle(areaX, areaY, areaW, areaH);
        tpl.stroke();

        // Puxador central horizontal
        float puxadorW = areaW * 0.35f;
        float puxadorH = 3f;
        float puxadorX = areaX + (areaW - puxadorW) / 2;
        float puxadorY = areaY + (areaH - puxadorH) / 2;

        tpl.setColorFill(COR_MARCO);
        tpl.rectangle(puxadorX, puxadorY, puxadorW, puxadorH);
        tpl.fill();

        tpl.setColorStroke(COR_MARCO);
        tpl.setLineWidth(0.5f);
        tpl.rectangle(puxadorX, puxadorY, puxadorW, puxadorH);
        tpl.stroke();
    }

    // ── Renderização: Painel Fixo ────────────────────────────────────────

    /**
     * Renderiza painel fixo — apenas vidro sem partes móveis.
     * Um "X" sutil indica que o painel é fixo (convenção técnica).
     */
    private static void desenharPainelFixo(PdfTemplate tpl, float w, float h) {
        float areaX = MARGEM_INTERNA + ESPESSURA_MARCO;
        float areaY = MARGEM_INTERNA + ESPESSURA_MARCO;
        float areaW = w - 2 * (MARGEM_INTERNA + ESPESSURA_MARCO);
        float areaH = h - 2 * (MARGEM_INTERNA + ESPESSURA_MARCO);

        if (areaW <= 0 || areaH <= 0) return;

        // Preenchimento de vidro
        tpl.setColorFill(COR_VIDRO);
        tpl.rectangle(areaX + 1, areaY + 1, areaW - 2, areaH - 2);
        tpl.fill();

        // Borda da folha
        tpl.setColorStroke(COR_DIVISORIA);
        tpl.setLineWidth(ESPESSURA_DIVISORIA);
        tpl.rectangle(areaX, areaY, areaW, areaH);
        tpl.stroke();

        // "X" indicando painel fixo
        tpl.setColorStroke(COR_INDICADOR);
        tpl.setLineWidth(ESPESSURA_INDICADOR);
        tpl.setLineDash(3f, 2f, 0f);

        tpl.moveTo(areaX, areaY);
        tpl.lineTo(areaX + areaW, areaY + areaH);
        tpl.stroke();

        tpl.moveTo(areaX + areaW, areaY);
        tpl.lineTo(areaX, areaY + areaH);
        tpl.stroke();

        tpl.setLineDash(0f);
    }

    // ── Fallback Genérico ────────────────────────────────────────────────

    /**
     * Renderização genérica quando o templateType é nulo ou desconhecido.
     * Desenha um retângulo com preenchimento de vidro simples.
     */
    private static void desenharFallbackGenerico(PdfTemplate tpl, float w, float h) {
        float areaX = MARGEM_INTERNA + ESPESSURA_MARCO;
        float areaY = MARGEM_INTERNA + ESPESSURA_MARCO;
        float areaW = w - 2 * (MARGEM_INTERNA + ESPESSURA_MARCO);
        float areaH = h - 2 * (MARGEM_INTERNA + ESPESSURA_MARCO);

        if (areaW <= 0 || areaH <= 0) return;

        // Preenchimento simples
        tpl.setColorFill(COR_VIDRO_FIXO);
        tpl.rectangle(areaX + 1, areaY + 1, areaW - 2, areaH - 2);
        tpl.fill();

        // Borda interna
        tpl.setColorStroke(COR_DIVISORIA);
        tpl.setLineWidth(ESPESSURA_DIVISORIA);
        tpl.rectangle(areaX, areaY, areaW, areaH);
        tpl.stroke();
    }
}
