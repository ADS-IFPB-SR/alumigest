package br.edu.ifpb.alumigest.orders.service.thermal;

import br.edu.ifpb.alumigest.orders.service.pdf.ThermalLabelData;
import org.springframework.stereotype.Component;

import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Renderizador de comandos nativos BPLB (Elgin L42 / L42 Pro / PPLB / EPL2)
 * para etiquetas térmicas adesivas de 100mm x 60mm (800 x 480 pontos a 203 DPI).
 *
 * Em conformidade com o Manual de Programação Elgin L42 (Ver. 3.0):
 * - Resolução: 8 pontos/mm (203 DPI)
 * - Largura: 100mm = 800 pontos (comando q800)
 * - Altura: 60mm = 480 pontos + GAP de 3mm = 24 pontos (comando Q480,24)
 * - Cada etiqueta física gera exatamente 1 emissão impressa (comando P1)
 *
 * US-17 / Correções #492 e #493 — Impressão direta na impressora térmica sem intermediários.
 */
@Component
public class ThermalLabelBplbRenderer {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final Charset BPLB_CHARSET = StandardCharsets.ISO_8859_1;

    /**
     * Renderiza o script completo de comandos BPLB para uma lista de etiquetas.
     *
     * @param etiquetas lista de dados consolidados das etiquetas
     * @return script em texto pronto para envio ao driver RAW/Spooler da impressora
     */
    public String renderBplb(List<ThermalLabelData> etiquetas) {
        if (etiquetas == null || etiquetas.isEmpty()) {
            return "";
        }

        StringBuilder sb = new StringBuilder();

        for (ThermalLabelData etiqueta : etiquetas) {
            renderSingleLabel(sb, etiqueta);
        }

        return sb.toString();
    }

    /**
     * Converte o script BPLB para array de bytes compatível com a impressora Elgin L42.
     *
     * @param etiquetas lista de dados consolidados das etiquetas
     * @return array de bytes para envio direto via javax.print (DocFlavor.BYTE_ARRAY.AUTOSENSE)
     */
    public byte[] renderBplbBytes(List<ThermalLabelData> etiquetas) {
        return renderBplb(etiquetas).getBytes(BPLB_CHARSET);
    }

    private void renderSingleLabel(StringBuilder sb, ThermalLabelData data) {
        // 1. Limpa o buffer de impressão da impressora
        sb.append("N\n");

        // 2. Parâmetros de calibração física da bobina 100x60mm
        // D9: Densidade/aquecimento da cabeça de impressão
        sb.append("D9\n");
        // S2: Velocidade de avanço (2 pol/seg para máxima nitidez térmica)
        sb.append("S2\n");
        // JF: Habilita backfeed para parar exatamente na serrilha
        sb.append("JF\n");
        // ZT: Orientação de impressão topo para baixo
        sb.append("ZT\n");
        // Q480,24: Altura de 480 pontos (60mm) e GAP de 24 pontos (3mm)
        sb.append("Q480,24\n");
        // q800: Largura total de impressão de 800 pontos (100mm)
        sb.append("q800\n");

        // 3. Cabeçalho Institucional
        String empresa = sanitize(data.companyName(), 24);
        String osCode = sanitize("#" + data.orderCode(), 16);
        sb.append(String.format("A30,20,0,4,1,1,N,\"%s\"\n", empresa));
        sb.append(String.format("A520,20,0,4,1,1,N,\"%s\"\n", osCode));

        String cliente = sanitize("CLIENTE: " + data.customerName(), 34);
        sb.append(String.format("A30,60,0,3,1,1,N,\"%s\"\n", cliente));

        // Badge de Rastreabilidade Física (Item / Folha / Peça)
        String badge = sanitize(data.labelBadge(), 35);
        sb.append(String.format("A440,60,0,2,1,1,N,\"%s\"\n", badge));

        // 4. Descrição Técnica da Esquadria
        String desc = sanitize(data.description(), 42);
        sb.append(String.format("A30,105,0,4,1,1,N,\"%s\"\n", desc));

        // 5. Caixa de Destaque das Medidas Nominais (Xp1,p2,p3,p4,p5: X1, Y1, Espessura, X2, Y2)
        // Caixa de 740x80 pontos centralizada
        sb.append("X30,150,3,770,230\n");
        sb.append("A260,160,0,2,1,1,N,\"MEDIDAS NOMINAIS (L X A)\"\n");
        String medidas = String.format("%d x %d mm", data.widthMm(), data.heightMm());
        sb.append(String.format("A220,185,0,4,2,2,N,\"%s\"\n", medidas));

        // 6. Especificações Técnicas de Fábrica
        String cor = sanitize("COR: " + (data.aluminumColor() != null ? data.aluminumColor() : "Padrao"), 30);
        String vidro = sanitize("VIDRO: " + (data.glassType() != null ? data.glassType() : "Nao aplicavel"), 30);
        sb.append(String.format("A30,245,0,3,1,1,N,\"%s\"\n", cor));
        sb.append(String.format("A420,245,0,3,1,1,N,\"%s\"\n", vidro));

        String localObs = sanitize("LOCAL / OBS: " + (data.environmentOrLocation() != null ? data.environmentOrLocation() : "-"), 50);
        sb.append(String.format("A30,290,0,3,1,1,N,\"%s\"\n", localObs));

        // 7. Rodapé com linha divisória
        // LO: Linha horizontal de comprimento 740 e espessura 2 pontos
        sb.append("LO30,340,740,2\n");

        String dataEmissao = "DATA: " + (data.issueDate() != null ? data.issueDate().format(DATE_FORMATTER) : "-");
        sb.append(String.format("A30,355,0,2,1,1,N,\"%s\"\n", dataEmissao));
        sb.append("A560,355,0,2,1,1,N,\"ALUMIGEST - 100X60MM\"\n");

        // 8. Comando de Impressão: exatamente 1 cópia por etiqueta física (evita repetições indevidas)
        sb.append("P1\n");
    }

    /**
     * Sanitiza o texto para remover acentuação e caracteres que possam conflitar
     * com os comandos de controle da impressora térmica Elgin L42.
     */
    private String sanitize(String input, int maxLength) {
        if (input == null || input.isBlank()) {
            return "";
        }

        // Remove acentuação para garantia de compatibilidade com todos os firmwares BPLB
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");

        // Remove aspas duplas e caracteres de controle
        normalized = normalized.replace("\"", "").replace("\n", " ").replace("\r", "");

        if (normalized.length() > maxLength) {
            return normalized.substring(0, maxLength);
        }
        return normalized;
    }
}
