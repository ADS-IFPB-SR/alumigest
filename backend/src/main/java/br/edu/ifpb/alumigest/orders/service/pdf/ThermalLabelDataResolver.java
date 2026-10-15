package br.edu.ifpb.alumigest.orders.service.pdf;

import br.edu.ifpb.alumigest.budgets.config.CompanyProperties;
import br.edu.ifpb.alumigest.common.exception.BusinessException;
import br.edu.ifpb.alumigest.orders.domain.Order;
import br.edu.ifpb.alumigest.orders.domain.OrderItem;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Objects;

/**
 * Resolvedor responsável por extrair, normalizar e compilar os dados da Ordem de Serviço
 * em instâncias imutáveis de {@link ThermalLabelData} para impressão física.
 * US-17.1 — Separação de responsabilidades e regras de extração de dados (#448).
 */
@Component
public class ThermalLabelDataResolver {

    private static final Logger log = LoggerFactory.getLogger(ThermalLabelDataResolver.class);
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private static final String NAO_INFORMADO = "Não informado";
    private static final String FALLBACK_EMPRESA = "AlumiGest ERP";

    private final CompanyProperties companyProps;

    public ThermalLabelDataResolver(CompanyProperties companyProps) {
        this.companyProps = companyProps;
    }

    /**
     * Resolve todos os dados necessários para impressão das etiquetas térmicas da ordem.
     * Gera uma entrada individual em {@link ThermalLabelData} para cada peça física.
     *
     * @param order ordem de serviço de origem
     * @return lista de dados de etiquetas em sequência física
     * @throws BusinessException se a ordem não contiver itens
     */
    public List<ThermalLabelData> resolveLabels(Order order) {
        Objects.requireNonNull(order,
                "A ordem de serviço não pode ser nula para resolução de etiquetas térmicas.");

        List<OrderItem> items = order.getItems();
        if (items == null || items.isEmpty()) {
            throw new BusinessException(
                    "A ordem de serviço não possui itens para emissão de etiquetas.");
        }

        List<OrderItem> itensOrdenados = new ArrayList<>(items);
        itensOrdenados.sort(Comparator.comparingInt(i -> i.getOrdem() != null ? i.getOrdem() : 0));

        int totalPecasOS = calcularTotalPecas(itensOrdenados);
        if (totalPecasOS == 0) {
            throw new BusinessException(
                    "A ordem de serviço não possui itens com quantidade válida para emissão de etiquetas.");
        }

        String nomeEmpresa = resolverNomeEmpresa();
        String nomeCliente = resolverNomeCliente(order);
        String codigoOS = order.getCodigo() != null ? order.getCodigo() : "OS-S/COD";
        LocalDate dataEmissao = order.getDataAprovacao() != null
                ? order.getDataAprovacao()
                : LocalDate.now(ZoneOffset.UTC);

        List<ThermalLabelData> listaEtiquetas = new ArrayList<>(totalPecasOS);
        int contadorGlobal = 1;
        int itemIndex = 1;

        for (OrderItem item : itensOrdenados) {
            if (item.getQuantidade() == null || item.getQuantidade() <= 0) {
                log.debug("Ignorando item ID {} sem quantidade positiva para emissão de etiquetas.", item.getId());
                continue;
            }

            contadorGlobal = adicionarEtiquetasDoItem(listaEtiquetas, item, order,
                    nomeEmpresa, nomeCliente, codigoOS, dataEmissao, totalPecasOS, itemIndex, contadorGlobal);
            itemIndex++;
        }

        return listaEtiquetas;
    }

    private int adicionarEtiquetasDoItem(List<ThermalLabelData> listaEtiquetas, OrderItem item, Order order,
                                         String nomeEmpresa, String nomeCliente, String codigoOS,
                                         LocalDate dataEmissao, int totalPecasOS, int itemIndex, int contadorGlobal) {
        String descricao = resolverDescricao(item);
        String linha = extrairLinhaOuGrupo(item);
        int largura = item.getLarguraMm() != null ? item.getLarguraMm() : 0;
        int altura = item.getAlturaMm() != null ? item.getAlturaMm() : 0;
        String cor = resolverCor(item);
        String vidro = resolverVidro(item);
        String localAmbiente = extrairAmbienteOuLocal(item, order);
        String codItem = extrairCodigoItem(item, itemIndex);
        int qtdItem = item.getQuantidade();

        int contador = contadorGlobal;
        for (int p = 1; p <= qtdItem; p++) {
            listaEtiquetas.add(new ThermalLabelData(
                    nomeEmpresa,
                    nomeCliente,
                    codigoOS,
                    itemIndex,
                    contador,
                    totalPecasOS,
                    descricao,
                    linha,
                    largura,
                    altura,
                    cor,
                    vidro,
                    localAmbiente,
                    codItem,
                    dataEmissao
            ));
            contador++;
        }
        return contador;
    }

    private int calcularTotalPecas(List<OrderItem> items) {
        int total = 0;
        for (OrderItem item : items) {
            if (item.getQuantidade() != null && item.getQuantidade() > 0) {
                total += item.getQuantidade();
            }
        }
        return total;
    }

    private String resolverNomeEmpresa() {
        if (companyProps != null && companyProps.getRazaoSocial() != null
                && !companyProps.getRazaoSocial().isBlank()) {
            return companyProps.getRazaoSocial().toUpperCase(Locale.ROOT);
        }
        return FALLBACK_EMPRESA;
    }

    private String resolverNomeCliente(Order order) {
        if (order.getClienteNome() != null && !order.getClienteNome().isBlank()) {
            return truncarTexto(order.getClienteNome().toUpperCase(Locale.ROOT), 24);
        }
        return NAO_INFORMADO;
    }

    private String resolverDescricao(OrderItem item) {
        if (item.getDescricao() != null && !item.getDescricao().isBlank()) {
            return truncarTexto(item.getDescricao(), 32);
        }
        return "Esquadria Padrão";
    }

    private String resolverCor(OrderItem item) {
        if (item.getCorAluminio() != null && !item.getCorAluminio().isBlank()) {
            return truncarTexto(item.getCorAluminio(), 25);
        }
        return NAO_INFORMADO;
    }

    private String resolverVidro(OrderItem item) {
        if (item.getTipoVidro() != null && !item.getTipoVidro().isBlank()) {
            return truncarTexto(item.getTipoVidro(), 28);
        }
        return NAO_INFORMADO;
    }

    public String extrairLinhaOuGrupo(OrderItem item) {
        if (item.getProduct() != null && item.getProduct().getTemplateType() != null) {
            String grupo = item.getProduct().getTemplateType().getGroupName();
            if (grupo != null && !grupo.isBlank()) {
                return grupo;
            }
        }
        if (item.getDescricao() != null) {
            String descLower = item.getDescricao().toLowerCase(Locale.ROOT);
            if (descLower.contains("gold")) {
                return "Linha Gold";
            }
            if (descLower.contains("suprema")) {
                return "Linha Suprema";
            }
            if (descLower.contains("inova")) {
                return "Linha Inova";
            }
        }
        return "Esquadria";
    }

    public String extrairAmbienteOuLocal(OrderItem item, Order order) {
        String valorJson = extrairAmbienteDoTemplateConfig(item.getTemplateConfig());
        if (valorJson != null) {
            return truncarTexto(valorJson, 38);
        }
        if (order.getClienteEndereco() != null && !order.getClienteEndereco().isBlank()) {
            return truncarTexto(order.getClienteEndereco().trim(), 38);
        }
        if (order.getObservacoes() != null && !order.getObservacoes().isBlank()) {
            return truncarTexto(order.getObservacoes().trim(), 38);
        }
        return NAO_INFORMADO;
    }

    private String extrairAmbienteDoTemplateConfig(String templateConfig) {
        if (templateConfig == null || templateConfig.isBlank()) {
            return null;
        }
        try {
            JsonNode root = OBJECT_MAPPER.readTree(templateConfig);
            if (root == null) {
                return null;
            }
            for (String key : List.of("ambiente", "room", "local",
                    "environment", "location", "notes")) {
                JsonNode node = root.get(key);
                if (node != null && !node.isNull() && !node.asText().isBlank()) {
                    return node.asText().trim();
                }
            }
        } catch (Exception e) {
            log.debug("Falha ao extrair ambiente do templateConfig: {}", e.getMessage());
        }
        return null;
    }

    public String extrairCodigoItem(OrderItem item, int itemIndex) {
        if (item.getProduct() != null && item.getProduct().getId() != null) {
            String idStr = item.getProduct().getId().toString();
            String prefix = idStr.substring(0, Math.min(8, idStr.length()));
            return "PRD-" + prefix.toUpperCase(Locale.ROOT);
        }
        return String.format(Locale.ROOT, "ITM-%02d", itemIndex);
    }

    private String truncarTexto(String texto, int maxLen) {
        if (texto == null) {
            return "";
        }
        String trimmed = texto.trim();
        if (trimmed.length() <= maxLen) {
            return trimmed;
        }
        return trimmed.substring(0, maxLen - 3) + "...";
    }
}
