package br.edu.ifpb.alumigest.budgets.service.pdf;


import br.edu.ifpb.alumigest.budgets.domain.BudgetItem;
import com.lowagie.text.Image;
import com.lowagie.text.pdf.PdfTemplate;
import com.lowagie.text.pdf.PdfWriter;

import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics2D;

public class BudgetPdfDrawingHelper {


    public static Image desenharEsquemaUsinagem(PdfWriter writer, BudgetItem item, float width, float height) {
        PdfTemplate template = writer.getDirectContent().createTemplate(width, height);
        Graphics2D g2d = template.createGraphics(width, height);

        try {
            g2d.setColor(Color.WHITE);
            g2d.fillRect(0, 0, (int) width, (int) height);
            g2d.setColor(new Color(50, 50, 50));
            g2d.setStroke(new BasicStroke(2.0f));
            float margin = 30.0f;
            float drawWidth = width - (margin * 2);
            float drawHeight = height - (margin * 2);
            g2d.drawRect((int) margin, (int) margin, (int) drawWidth, (int) drawHeight);
            g2d.setColor(new Color(150, 150, 150));
            g2d.setStroke(new BasicStroke(1.0f, BasicStroke.CAP_BUTT, BasicStroke.JOIN_MITER, 10.0f, new float[]{4.0f, 4.0f}, 0.0f));
            float innerOffset = 15.0f;
            g2d.drawRect((int) (margin + innerOffset), (int) (margin + innerOffset),
                    (int) (drawWidth - (innerOffset * 2)), (int) (drawHeight - (innerOffset * 2)));
            g2d.setColor(Color.RED);
            g2d.setStroke(new BasicStroke(1.5f));

            int[] furosY = {(int)(margin + 40), (int)(height / 2), (int)(height - margin - 40)};
            int raioFuro = 5;

            for (int y : furosY) {
                int xFuro = (int) (margin + innerOffset);
                g2d.fillOval(xFuro - raioFuro, y - raioFuro, raioFuro * 2, raioFuro * 2);
                g2d.drawOval(xFuro - raioFuro, y - raioFuro, raioFuro * 2, raioFuro * 2);
                g2d.setColor(new Color(200, 0, 0, 150));
                g2d.setStroke(new BasicStroke(1.0f, BasicStroke.CAP_BUTT, BasicStroke.JOIN_MITER, 5.0f, new float[]{2.0f, 2.0f}, 0.0f));
                g2d.drawLine(xFuro, y, (int)(margin - 10), y);
                g2d.setColor(Color.RED);
            }

            g2d.setFont(new Font("SansSerif", Font.PLAIN, 9));
            g2d.setColor(Color.DARK_GRAY);
            g2d.drawString("Furos Técnicos / Dist. Iguais", (int) margin, (int) (margin - 8));

            float puxadorX = margin + drawWidth - 25;
            float puxadorY1 = margin + (drawHeight / 2) - 40;
            float puxadorY2 = margin + (drawHeight / 2) + 40;
            g2d.setColor(new Color(30, 30, 120));
            g2d.setStroke(new BasicStroke(3.0f));
            g2d.drawLine((int) puxadorX, (int) puxadorY1, (int) puxadorX, (int) puxadorY2);
            g2d.setStroke(new BasicStroke(1.0f));
            g2d.drawLine((int) (puxadorX - 4), (int) puxadorY1, (int) (puxadorX + 4), (int) puxadorY1);
            g2d.drawLine((int) (puxadorX - 4), (int) puxadorY2, (int) (puxadorX + 4), (int) puxadorY2);
            g2d.setFont(new Font("SansSerif", Font.BOLD, 9));
            g2d.drawString("Puxador (25cm)", (int) (puxadorX - 55), (int) (puxadorY1 + 45));

        } finally {
            g2d.dispose();
        }

        return Image.getInstance(template);
    }
}
