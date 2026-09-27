package br.edu.ifpb.alumigest.budgets.service.pdf;

import br.edu.ifpb.alumigest.budgets.domain.BudgetItem;
import com.lowagie.text.Document;
import com.lowagie.text.Image;
import com.lowagie.text.pdf.PdfWriter;
import org.junit.jupiter.api.Test;
import java.io.ByteArrayOutputStream;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class BudgetPdfDrawingHelperTest {

    @Test
    void deveGerarEsquemaUsinagemComSucesso() throws Exception {
        Document document = new Document();
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = PdfWriter.getInstance(document, baos);
        document.open();
        BudgetItem item = new BudgetItem();
        float width = 400f;
        float height = 300f;

        Image imagemUsinagem = BudgetPdfDrawingHelper.desenharEsquemaUsinagem(writer, item, width, height);
        document.add(imagemUsinagem);

        assertNotNull(imagemUsinagem, "A imagem vetorial do esquema de usinagem não deve ser nula");
        document.close();
    }
}