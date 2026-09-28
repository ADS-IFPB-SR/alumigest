package br.edu.ifpb.alumigest.budgets.service.pdf.technical.strategy;

import br.edu.ifpb.alumigest.budgets.service.pdf.technical.DrillingHolePoint;
import br.edu.ifpb.alumigest.budgets.service.pdf.technical.TechnicalHandle;
import com.lowagie.text.pdf.BaseFont;
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfTemplate;

import java.awt.Color;
import java.util.List;

/**
 * Utilitário gráfico de primitivas vetoriais para desenho técnico de usinagem e corte.
 * Todas as definições de código seguem nomenclatura em inglês.
 */
public final class TechnicalMachiningDrawingUtils {

    public static final Color COLOR_FRAME_OUTER       = new Color(51, 65, 85);
    public static final Color COLOR_FRAME_INNER       = new Color(148, 163, 184);
    public static final Color COLOR_HOLE_FILL         = new Color(220, 38, 38);
    public static final Color COLOR_HOLE_STROKE       = new Color(153, 27, 27);
    public static final Color COLOR_DIMENSION_GUIDE   = new Color(239, 68, 68, 180);
    public static final Color COLOR_DIMENSION_TEXT    = new Color(71, 85, 105);
    public static final Color COLOR_HANDLE            = new Color(30, 41, 59);

    public static final float INNER_OFFSET = 3.5f;

    private static final BaseFont BASE_FONT_HELVETICA;

    static {
        try {
            BASE_FONT_HELVETICA = BaseFont.createFont(
                    BaseFont.HELVETICA,
                    BaseFont.WINANSI,
                    BaseFont.NOT_EMBEDDED
            );
        } catch (Exception e) {
            throw new ExceptionInInitializerError("Falha na inicialização da fonte técnica: "
                    + e.getMessage());
        }
    }

    private TechnicalMachiningDrawingUtils() {
        throw new UnsupportedOperationException("Utility class cannot be instantiated.");
    }

    /**
     * Renderiza o marco perimetral externo contínuo.
     */
    public static void drawPerimeterFrame(
            PdfTemplate tpl, float x, float y, float w, float h
    ) {
        tpl.setColorStroke(COLOR_FRAME_OUTER);
        tpl.setLineWidth(1.4f);
        tpl.rectangle(x, y, w, h);
        tpl.stroke();
    }

    /**
     * Renderiza a linha pontilhada de folga perimetral de usinagem interna.
     */
    public static void drawInnerDashedClearance(
            PdfTemplate tpl, float x, float y, float w, float h
    ) {
        tpl.setColorStroke(COLOR_FRAME_INNER);
        tpl.setLineWidth(0.6f);
        tpl.setLineDash(2f, 2f, 0f);
        tpl.rectangle(
                x + INNER_OFFSET,
                y + INNER_OFFSET,
                w - (2 * INNER_OFFSET),
                h - (2 * INNER_OFFSET)
        );
        tpl.stroke();
        tpl.setLineDash(0f);
    }

    /**
     * Renderiza furações laterais técnicas com cotas milimétricas e linhas guias.
     */
    public static void drawLateralDrillings(
            PdfTemplate tpl,
            List<DrillingHolePoint> holes,
            float holeX,
            float startY,
            float drawH,
            boolean onLeftSide
    ) {
        if (holes == null || holes.isEmpty()) {
            return;
        }

        for (DrillingHolePoint hole : holes) {
            float holeY = startY + INNER_OFFSET + hole.yRatio() * (drawH - (2 * INNER_OFFSET));
            float rPt = Math.clamp(hole.diameterMm() * 0.22f, 1.8f, 3.2f);

            // Círculo preenchido do furo
            tpl.setColorFill(COLOR_HOLE_FILL);
            tpl.setColorStroke(COLOR_HOLE_STROKE);
            tpl.setLineWidth(0.7f);
            tpl.circle(holeX, holeY, rPt);
            tpl.fillStroke();

            // Linha guia pontilhada da cota
            tpl.setColorStroke(COLOR_DIMENSION_GUIDE);
            tpl.setLineWidth(0.45f);
            tpl.setLineDash(1.5f, 1.5f, 0f);
            float guideX = onLeftSide ? (holeX - 10f) : (holeX + 10f);
            tpl.moveTo(holeX + (onLeftSide ? -rPt : rPt), holeY);
            tpl.lineTo(guideX, holeY);
            tpl.stroke();
            tpl.setLineDash(0f);

            // Texto da cota
            String label = hole.label() != null ? hole.label() : "Ø 10mm";
            tpl.beginText();
            tpl.setFontAndSize(BASE_FONT_HELVETICA, 5.0f);
            tpl.setColorFill(COLOR_DIMENSION_TEXT);
            if (onLeftSide) {
                tpl.showTextAligned(PdfContentByte.ALIGN_RIGHT, label, guideX - 1.5f, holeY - 1.5f, 0);
            } else {
                tpl.showTextAligned(PdfContentByte.ALIGN_LEFT, label, guideX + 1.5f, holeY - 1.5f, 0);
            }
            tpl.endText();
        }
    }

    /**
     * Renderiza puxador vertical lateral com cota descritiva formatada.
     */
    public static void drawVerticalHandle(
            PdfTemplate tpl,
            TechnicalHandle handle,
            float startX, float startY,
            float drawW, float drawH,
            float canvasWidth
    ) {
        if (handle == null) {
            return;
        }

        boolean onRight = handle.onRightSide();
        float px = onRight
                ? (startX + drawW - INNER_OFFSET - 2.5f)
                : (startX + INNER_OFFSET + 2.5f);

        float availH = drawH - (2 * INNER_OFFSET);
        float handleH = Math.max(12f, availH * handle.lengthRatio());
        float centerY = startY + INNER_OFFSET + (availH * handle.centerYRatio());
        float botY = Math.clamp(centerY - (handleH / 2f), startY + INNER_OFFSET, startY + drawH);
        float topY = Math.clamp(botY + handleH, startY, startY + drawH - INNER_OFFSET);

        // Barra e suportes do puxador
        tpl.setColorStroke(COLOR_HANDLE);
        tpl.setLineWidth(2.2f);
        tpl.moveTo(px, botY);
        tpl.lineTo(px, topY);
        tpl.stroke();

        tpl.setLineWidth(1.0f);
        float baseDir = onRight ? -1 : 1;
        tpl.moveTo(px, topY);
        tpl.lineTo(px + (baseDir * 2.5f), topY);
        tpl.moveTo(px, botY);
        tpl.lineTo(px + (baseDir * 2.5f), botY);
        tpl.stroke();

        drawHandleDimensionLabel(tpl, handle, px, centerY, onRight, canvasWidth);
    }

    /**
     * Renderiza puxadores centrais duplos no encontro de portas de giro duplo.
     */
    public static void drawDoubleCentralHandles(
            PdfTemplate tpl,
            TechnicalHandle handle,
            float centerX,
            float startY,
            float drawH
    ) {
        float availH = drawH - (2 * INNER_OFFSET);
        float handleH = handle != null
                ? Math.max(12f, availH * handle.lengthRatio())
                : 16f;
        float centerY = handle != null
                ? (startY + INNER_OFFSET + (availH * handle.centerYRatio()))
                : (startY + (drawH / 2f));
        float botY = centerY - (handleH / 2f);
        float topY = botY + handleH;

        tpl.setColorStroke(COLOR_HANDLE);
        tpl.setLineWidth(1.8f);

        tpl.moveTo(centerX - 2.5f, botY);
        tpl.lineTo(centerX - 2.5f, topY);
        tpl.moveTo(centerX + 2.5f, botY);
        tpl.lineTo(centerX + 2.5f, topY);
        tpl.stroke();

        if (handle != null && handle.label() != null) {
            tpl.beginText();
            tpl.setFontAndSize(BASE_FONT_HELVETICA, 4.5f);
            tpl.setColorFill(COLOR_DIMENSION_TEXT);
            tpl.showTextAligned(
                    PdfContentByte.ALIGN_CENTER,
                    handle.label(),
                    centerX,
                    topY + 3.0f,
                    0
            );
            tpl.endText();
        }
    }

    /**
     * Renderiza puxador horizontal centralizado para frentes de gaveta.
     */
    public static void drawCentralHorizontalHandle(
            PdfTemplate tpl,
            TechnicalHandle handle,
            float startX, float startY,
            float drawW, float drawH
    ) {
        float centerX = startX + (drawW / 2f);
        float centerY = startY + (drawH / 2f);
        float handleW = Math.min(drawW * 0.65f, 40f);
        float x1 = centerX - (handleW / 2f);
        float x2 = centerX + (handleW / 2f);

        tpl.setColorStroke(COLOR_HANDLE);
        tpl.setLineWidth(2.4f);
        tpl.moveTo(x1, centerY);
        tpl.lineTo(x2, centerY);
        tpl.stroke();

        String label = (handle != null && handle.label() != null)
                ? handle.label()
                : "Puxador Perfil";
        tpl.beginText();
        tpl.setFontAndSize(BASE_FONT_HELVETICA, 4.8f);
        tpl.setColorFill(COLOR_DIMENSION_TEXT);
        tpl.showTextAligned(PdfContentByte.ALIGN_CENTER, label, centerX, centerY + 3.5f, 0);
        tpl.endText();
    }

    /**
     * Renderiza fecho concha ou trinco na base de esquadrias basculantes.
     */
    public static void drawBottomLatch(
            PdfTemplate tpl,
            TechnicalHandle handle,
            float startX, float startY,
            float drawW
    ) {
        float centerX = startX + (drawW / 2f);
        float latchY = startY + INNER_OFFSET + 3.0f;
        float latchW = 10f;
        float latchH = 3.5f;

        tpl.setColorFill(COLOR_HANDLE);
        tpl.setColorStroke(COLOR_FRAME_OUTER);
        tpl.setLineWidth(0.6f);
        tpl.roundRectangle(centerX - (latchW / 2f), latchY, latchW, latchH, 1.2f);
        tpl.fillStroke();

        String label = (handle != null && handle.label() != null)
                ? handle.label()
                : "Fecho Concha";
        tpl.beginText();
        tpl.setFontAndSize(BASE_FONT_HELVETICA, 4.6f);
        tpl.setColorFill(COLOR_DIMENSION_TEXT);
        tpl.showTextAligned(PdfContentByte.ALIGN_CENTER, label, centerX, latchY + latchH + 2.5f, 0);
        tpl.endText();
    }

    /**
     * Renderiza seta indicativa de deslizamento lateral técnico.
     */
    public static void drawSlidingArrow(
            PdfTemplate tpl,
            float fx, float fy,
            float fw, float fh,
            boolean toRight
    ) {
        tpl.setColorStroke(COLOR_FRAME_INNER);
        tpl.setLineWidth(0.55f);

        float centerY = fy + (fh / 2f);
        float arrowMargin = fw * 0.20f;
        float startX = fx + arrowMargin;
        float endX = fx + fw - arrowMargin;
        float arrowHead = Math.min(fw * 0.15f, 3.2f);

        if (endX > startX) {
            tpl.moveTo(startX, centerY);
            tpl.lineTo(endX, centerY);

            float tipX = toRight ? endX : startX;
            float dir = toRight ? -1 : 1;

            tpl.moveTo(tipX + dir * arrowHead, centerY + arrowHead);
            tpl.lineTo(tipX, centerY);
            tpl.lineTo(tipX + dir * arrowHead, centerY - arrowHead);
            tpl.stroke();
        }
    }

    /**
     * Renderiza arco tracejado indicativo de raio de abertura de giro.
     */
    public static void drawSwingOpeningArc(
            PdfTemplate tpl,
            float x, float y,
            float w, float h,
            boolean hingedOnLeft
    ) {
        tpl.setColorStroke(COLOR_FRAME_INNER);
        tpl.setLineWidth(0.5f);
        tpl.setLineDash(2f, 2f, 0f);

        float radius = Math.min(w * 0.75f, h * 0.40f);
        if (hingedOnLeft) {
            tpl.arc(x, y, x + (2 * radius), y + (2 * radius), 0f, 90f);
        } else {
            tpl.arc(x + w - (2 * radius), y, x + w, y + (2 * radius), 90f, 90f);
        }
        tpl.stroke();
        tpl.setLineDash(0f);
    }

    private static void drawHandleDimensionLabel(
            PdfTemplate tpl,
            TechnicalHandle handle,
            float px, float centerY,
            boolean onRight, float canvasWidth
    ) {
        String label = handle.label();
        if (label == null || label.isBlank()) {
            return;
        }

        float textX = onRight ? (px + 4.5f) : (px - 4.5f);
        int align = onRight ? PdfContentByte.ALIGN_LEFT : PdfContentByte.ALIGN_RIGHT;
        float maxWidthAvail = onRight ? Math.max(10f, canvasWidth - textX - 2f) : 38f;

        tpl.beginText();
        tpl.setFontAndSize(BASE_FONT_HELVETICA, 4.8f);
        tpl.setColorFill(COLOR_DIMENSION_TEXT);

        float labelW = BASE_FONT_HELVETICA.getWidthPoint(label, 4.8f);
        if (labelW > maxWidthAvail && label.contains(" (")) {
            int splitIdx = label.indexOf(" (");
            String line1 = label.substring(0, splitIdx);
            String line2 = label.substring(splitIdx + 1);
            tpl.showTextAligned(align, line1, textX, centerY + 2.2f, 0);
            tpl.showTextAligned(align, line2, textX, centerY - 3.2f, 0);
        } else {
            tpl.showTextAligned(align, label, textX, centerY - 1.5f, 0);
        }
        tpl.endText();
    }
}
