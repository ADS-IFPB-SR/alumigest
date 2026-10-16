package br.edu.ifpb.alumigest.orders.service.pdf;

import br.edu.ifpb.alumigest.budgets.config.CompanyProperties;
import br.edu.ifpb.alumigest.common.exception.BusinessException;
import br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException;
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
import java.util.UUID;

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
        return resolveLabels(order, null);
    }

    /**
     * Resolve todos os dados necessários para impressão das etiquetas térmicas da ordem,
     * com suporte a filtro opcional por item específico.
     * Gera uma entrada individual em {@link ThermalLabelData} para cada peça física.
     *
     * @param order  ordem de serviço de origem
     * @param itemId identificador opcional de um item específico para filtragem
     * @return lista de dados de etiquetas em sequência física
     * @throws BusinessException         se a ordem não contiver itens ou peças válidas
     * @throws ResourceNotFoundException se o itemId for informado mas não pertencer à ordem
     */
    public List<ThermalLabelData> resolveLabels(Order order, UUID itemId) {
        Objects.requireNonNull(order,
                "A ordem de serviço não pode ser nula para resolução de etiquetas térmicas.");

        List<OrderItem> itensOrdenados = filtrarEOrdenarItens(order.getItems(), itemId);

        int totalPecasOS = calcularTotalPecas(itensOrdenados);
        if (totalPecasOS == 0) {
            throw new BusinessException(
                    "A ordem de serviço não possui itens com quantidade válida para emissão de etiquetas.");
        }

        OrderLabelContext context = new OrderLabelContext(
                order,
                resolverNomeEmpresa(),
                resolverNomeCliente(order),
                order.getCodigo() != null ? order.getCodigo() : "OS-S/COD",
                order.getDataAprovacao() != null ? order.getDataAprovacao() : LocalDate.now(ZoneOffset.UTC),
                totalPecasOS
        );

        List<ThermalLabelData> listaEtiquetas = new ArrayList<>(totalPecasOS);
        int contadorGlobal = 1;
        int itemIndex = 1;

        for (OrderItem item : itensOrdenados) {
            if (item.getQuantidade() == null || item.getQuantidade() <= 0) {
                log.debug("Ignorando item ID {} sem quantidade positiva para emissão de etiquetas.", item.getId());
                continue;
            }

            int indexUtilizado = (item.getOrdem() != null && item.getOrdem() > 0) ? item.getOrdem() : itemIndex;
            contadorGlobal = adicionarEtiquetasDoItem(listaEtiquetas, item, context, indexUtilizado, contadorGlobal);
            itemIndex++;
        }

        return listaEtiquetas;
    }

    /**
     * Filtra e ordena os itens da ordem pelo campo {@code ordem}, aplicando opcionalmente
     * um filtro por {@code itemId}. Centraliza a validação de nulidade e existência do item.
     *
     * @param items  lista bruta de itens da ordem
     * @param itemId identificador opcional para filtrar um item específico
     * @return lista ordenada (e possivelmente filtrada) de itens
     * @throws BusinessException         se a lista for nula ou vazia
     * @throws ResourceNotFoundException se {@code itemId} for informado mas não encontrado
     */
    private List<OrderItem> filtrarEOrdenarItens(List<OrderItem> items, UUID itemId) {
        if (items == null || items.isEmpty()) {
            throw new BusinessException(
                    "A ordem de serviço não possui itens para emissão de etiquetas.");
        }

        List<OrderItem> ordenados = new ArrayList<>(items);
        ordenados.sort(Comparator.comparingInt(i -> i.getOrdem() != null ? i.getOrdem() : 0));

        if (itemId != null) {
            ordenados = ordenados.stream()
                    .filter(i -> Objects.equals(i.getId(), itemId))
                    .toList();
            if (ordenados.isEmpty()) {
                throw new ResourceNotFoundException("Item do Pedido", itemId.toString());
            }
        }

        return ordenados;
    }

    private int adicionarEtiquetasDoItem(List<ThermalLabelData> listaEtiquetas,
                                         OrderItem item,
                                         OrderLabelContext ctx,
                                         int itemIndex,
                                         int contadorGlobal) {
        String descricao = resolverDescricao(item);
        String linha = extrairLinhaOuGrupo(item);
        int largura = item.getLarguraMm() != null ? item.getLarguraMm() : 0;
        int altura = item.getAlturaMm() != null ? item.getAlturaMm() : 0;
        String cor = resolverCor(item);
        String vidro = resolverVidro(item);
        String localAmbiente = extrairAmbienteOuLocal(item, ctx.order());
        String codItem = extrairCodigoItem(item, itemIndex);
        int qtdItem = item.getQuantidade();

        int contador = contadorGlobal;
        for (int p = 1; p <= qtdItem; p++) {
            listaEtiquetas.add(new ThermalLabelData(
                    ctx.companyName(),
                    ctx.customerName(),
                    ctx.orderCode(),
                    itemIndex,
                    contador,
                    ctx.totalPieces(),
                    descricao,
                    linha,
                    largura,
                    altura,
                    cor,
                    vidro,
                    localAmbiente,
                    codItem,
                    ctx.issueDate()
            ));
            contador++;
        }
        return contador;
    }

    private record OrderLabelContext(
            Order order,
            String companyName,
            String customerName,
            String orderCode,
            LocalDate issueDate,
            int totalPieces
    ) {
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
