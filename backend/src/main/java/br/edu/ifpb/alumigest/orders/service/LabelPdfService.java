package br.edu.ifpb.alumigest.orders.service;

import br.edu.ifpb.alumigest.budgets.config.CompanyProperties;
import br.edu.ifpb.alumigest.common.exception.BusinessException;
import br.edu.ifpb.alumigest.orders.domain.Order;
import br.edu.ifpb.alumigest.orders.service.pdf.ThermalLabelData;
import br.edu.ifpb.alumigest.orders.service.pdf.ThermalLabelDataResolver;
import br.edu.ifpb.alumigest.orders.service.pdf.ThermalLabelPdfRenderer;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

/**
 * Serviço orquestrador responsável pela geração de etiquetas adesivas térmicas em PDF (100mm x 60mm).
 * Coordena a resolução de dados da O.S. e a renderização do layout térmico OpenPDF.
 * Gera uma página dedicada para cada exemplar físico de esquadria de uma Ordem de Serviço.
 * US-17.1 — Serviço LabelPdfService com layout térmico industrial (#448).
 */
@Service
public class LabelPdfService {

    private static final Logger log = LoggerFactory.getLogger(LabelPdfService.class);

    /** Largura da etiqueta térmica em pontos (100 mm = 283.46 pt). */
    public static final float LARGURA_ETIQUETA_PT = 283.46f;
    /** Altura da etiqueta térmica em pontos (60 mm = 170.08 pt). */
    public static final float ALTURA_ETIQUETA_PT = 170.08f;

    private static final float MARGEM_HORIZONTAL = 8.0f;
    private static final float MARGEM_VERTICAL = 4.0f;

    private final ThermalLabelDataResolver dataResolver;
    private final ThermalLabelPdfRenderer pdfRenderer;

    @Autowired
    public LabelPdfService(ThermalLabelDataResolver dataResolver, ThermalLabelPdfRenderer pdfRenderer) {
        this.dataResolver = dataResolver;
        this.pdfRenderer = pdfRenderer;
    }

    public LabelPdfService(CompanyProperties companyProps) {
        this(new ThermalLabelDataResolver(companyProps), new ThermalLabelPdfRenderer());
    }

    /**
     * Gera o documento PDF com etiquetas adesivas térmicas (100mm x 60mm) para todos os
     * exemplares físicos dos itens de uma ordem de serviço.
     *
     * @param order ordem de serviço de origem
     * @return array de bytes contendo o PDF gerado
     * @throws NullPointerException se order for nulo
     * @throws BusinessException se order não tiver itens ou ocorrer erro de geração
     */
    public byte[] gerarEtiquetas(Order order) {
        List<ThermalLabelData> etiquetas = dataResolver.resolveLabels(order);

        Rectangle pageSize = new Rectangle(LARGURA_ETIQUETA_PT, ALTURA_ETIQUETA_PT);
        Document document = new Document(pageSize, MARGEM_HORIZONTAL, MARGEM_HORIZONTAL,
                MARGEM_VERTICAL, MARGEM_VERTICAL);

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PdfWriter.getInstance(document, out);
            document.open();

            float larguraUtil = LARGURA_ETIQUETA_PT - (MARGEM_HORIZONTAL * 2);

            for (int i = 0; i < etiquetas.size(); i++) {
                if (i > 0) {
                    document.newPage();
                }
                PdfPTable card = pdfRenderer.renderLabelCard(etiquetas.get(i), larguraUtil);
                document.add(card);
            }

            document.close();
            log.info("PDF de etiquetas térmicas gerado com sucesso: {} páginas para a ordem ID {}",
                    etiquetas.size(), order.getId());
            return out.toByteArray();
        } catch (DocumentException e) {
            log.error("Erro ao estruturar documento PDF de etiquetas térmicas: {}", e.getMessage(), e);
            throw new BusinessException("Falha na geração do documento PDF de etiquetas térmicas.", e);
        } catch (IOException e) {
            log.error("Erro de I/O na geração do PDF de etiquetas térmicas: {}", e.getMessage(), e);
            throw new BusinessException("Falha de I/O ao gerar PDF de etiquetas.", e);
        } finally {
            if (document.isOpen()) {
                try {
                    document.close();
                } catch (Exception e) {
                    log.debug("Exceção ignorada ao fechar Document defensivamente: {}", e.getMessage());
                }
            }
        }
    }
}
