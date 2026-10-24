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
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Resolvedor responsável por extrair, normalizar e compilar os dados da Ordem de Serviço
 * em instâncias imutáveis de {@link ThermalLabelData} para impressão física.
 * US-17.1 — Separação de responsabilidades e regras de extração de dados (#448).
 * Correção #492 / #493 — Dedução automática de folhas por tipologia e paginação 1:1.
 */
@Component
public class ThermalLabelDataResolver {

    private static final Logger log = LoggerFactory.getLogger(ThermalLabelDataResolver.class);
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    // Regexes com quantificadores estritamente limitados para blindagem contra backtracking superlinear (SonarQube S8786)
    private static final Pattern PATTERN_FOLHAS =
            Pattern.compile("\\b(\\d{1,2})\\s*(?:folhas?|fls)\\b", Pattern.CASE_INSENSITIVE);
    private static final Pattern PATTERN_F_SUFFIX =
            Pattern.compile("\\b(\\d{1,2})\\s*f\\b", Pattern.CASE_INSENSITIVE);
    private static final Pattern PATTERN_PLANOS =
            Pattern.compile("\\b(\\d{1,2})\\s*planos?\\b", Pattern.CASE_INSENSITIVE);
    private static final Pattern PATTERN_TEMPLATE =
            Pattern.compile("(\\d{1,2})f\\b", Pattern.CASE_INSENSITIVE);

    private static final String NAO_INFORMADO = "Não informado";
    private static final String FALLBACK_EMPRESA = "Alumiportas";

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
        return resolveLabels(order, null, null);
    }

    /**
     * Resolve todos os dados necessários para impressão das etiquetas térmicas da ordem,
     * com suporte a filtro opcional por item específico.
     *
     * @param order  ordem de serviço de origem
     * @param itemId identificador opcional de um item específico para filtragem
     * @return lista de dados de etiquetas em sequência física
     */
    public List<ThermalLabelData> resolveLabels(Order order, UUID itemId) {
        return resolveLabels(order, itemId, null);
    }

    /**
     * Resolve os dados de etiquetas térmicas considerando o mapa opcional de folhas customizadas
     * conferidas e ajustadas pelo operador no frontend.
     *
     * @param order                ordem de serviço de origem
     * @param itemId               identificador opcional de item
     * @param customLeavesPerItem  mapa opcional de folhas por item (id do item -> folhas)
     * @return lista de dados consolidados para impressão
     */
    public List<ThermalLabelData> resolveLabels(Order order, UUID itemId, Map<UUID, Integer> customLeavesPerItem) {
        Objects.requireNonNull(order,
                "A ordem de serviço não pode ser nula para resolução de etiquetas térmicas.");

        List<OrderItem> itensOrdenados = filtrarEOrdenarItens(order.getItems(), itemId);

        int totalPecasOS = calcularTotalPecas(itensOrdenados, customLeavesPerItem);
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
            contadorGlobal = adicionarEtiquetasDoItem(listaEtiquetas, item, context, indexUtilizado, contadorGlobal, customLeavesPerItem);
            itemIndex++;
        }

        return listaEtiquetas;
    }

    /**
     * Filtra e ordena os itens da ordem pelo campo {@code ordem}, aplicando opcionalmente
     * um filtro por {@code itemId}. Centraliza a validação de nulidade e existência do item.
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

    /**
     * Deduz a quantidade de folhas físicas por esquadria através da descrição ou tipologia do modelo.
     * Refatorado para manter a complexidade cognitiva < 15 (SonarQube S3776).
     *
     * @param item item da ordem de serviço
     * @return quantidade de folhas deduzida (mínimo 1)
     */
    public int extrairQuantidadeFolhas(OrderItem item) {
        if (item == null) {
            return 1;
        }

        int folhasDescricao = extrairDeDescricao(item.getDescricao());
        if (folhasDescricao > 1) {
            return folhasDescricao;
        }

        return extrairDeTemplateConfig(item.getTemplateConfig());
    }

    private int extrairDeDescricao(String descricao) {
        if (descricao == null || descricao.isBlank()) {
            return 1;
        }

        for (Pattern pattern : List.of(PATTERN_FOLHAS, PATTERN_F_SUFFIX, PATTERN_PLANOS)) {
            Matcher m = pattern.matcher(descricao);
            if (m.find()) {
                return Integer.parseInt(m.group(1));
            }
        }
        return 1;
    }

    private int extrairDeTemplateConfig(String templateConfig) {
        if (templateConfig == null || templateConfig.isBlank()) {
            return 1;
        }

        try {
            JsonNode root = OBJECT_MAPPER.readTree(templateConfig);
            JsonNode tNode = root.get("templateType");
            if (tNode != null && !tNode.isNull()) {
                Matcher mTemplate = PATTERN_TEMPLATE.matcher(tNode.asText());
                if (mTemplate.find()) {
                    return Integer.parseInt(mTemplate.group(1));
                }
            }
        } catch (Exception e) {
            log.debug("Não foi possível extrair templateType do templateConfig: {}", e.getMessage());
        }

        return 1;
    }

    private int adicionarEtiquetasDoItem(List<ThermalLabelData> listaEtiquetas,
                                         OrderItem item,
                                         OrderLabelContext ctx,
                                         int itemIndex,
                                         int contadorGlobal,
                                         Map<UUID, Integer> customLeavesPerItem) {
        String descricao = resolverDescricao(item);
        String linha = extrairLinhaOuGrupo(item);
        int largura = item.getLarguraMm() != null ? item.getLarguraMm() : 0;
        int altura = item.getAlturaMm() != null ? item.getAlturaMm() : 0;
        String cor = resolverCor(item);
        String vidro = resolverVidro(item);
        String localAmbiente = extrairAmbienteOuLocal(item, ctx.order());
        String codItem = extrairCodigoItem(item, itemIndex);
        int qtdEsquadrias = item.getQuantidade();

        int folhas = (customLeavesPerItem != null && item.getId() != null && customLeavesPerItem.containsKey(item.getId()))
                ? Math.max(1, customLeavesPerItem.get(item.getId()))
                : extrairQuantidadeFolhas(item);

        int contador = contadorGlobal;
        for (int esq = 1; esq <= qtdEsquadrias; esq++) {
            for (int folha = 1; folha <= folhas; folha++) {
                String sufixoFolha = folhas > 1
                        ? String.format(Locale.ROOT, "Folha %02d/%02d", folha, folhas)
                        : String.format(Locale.ROOT, "Peça %02d/%02d", folha, folhas);

                String badge = String.format(Locale.ROOT,
                        "Item %02d • Esquadria %02d/%02d | %s",
                        itemIndex, esq, qtdEsquadrias, sufixoFolha);

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
                        ctx.issueDate(),
                        badge
                ));
                contador++;
            }
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

    private int calcularTotalPecas(List<OrderItem> items, Map<UUID, Integer> customLeavesPerItem) {
        int total = 0;
        for (OrderItem item : items) {
            if (item.getQuantidade() != null && item.getQuantidade() > 0) {
                int folhas = (customLeavesPerItem != null && item.getId() != null && customLeavesPerItem.containsKey(item.getId()))
                        ? Math.max(1, customLeavesPerItem.get(item.getId()))
                        : extrairQuantidadeFolhas(item);
                total += item.getQuantidade() * folhas;
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
            return truncarTexto(order.getClienteNome().trim().toUpperCase(Locale.ROOT), 48);
        }
        return NAO_INFORMADO;
    }

    private String resolverDescricao(OrderItem item) {
        if (item.getDescricao() != null && !item.getDescricao().isBlank()) {
            return truncarTexto(item.getDescricao(), 60);
        }
        return "Esquadria de Alumínio";
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

    public String extrairAmbienteOuLocal(OrderItem item, Order order) {
        if (item.getTemplateConfig() != null && !item.getTemplateConfig().isBlank()) {
            try {
                JsonNode root = OBJECT_MAPPER.readTree(item.getTemplateConfig());
                List<String> chavesAmbiente = List.of("ambiente", "room", "local", "environment", "location", "notes");
                for (String chave : chavesAmbiente) {
                    JsonNode node = root.get(chave);
                    if (node != null && !node.isNull() && !node.asText().isBlank()) {
                        return truncarTexto(node.asText().trim(), 52);
                    }
                }
            } catch (Exception e) {
                log.debug("TemplateConfig não é JSON válido para extração de ambiente: {}", e.getMessage());
            }
        }

        if (order.getObservacoes() != null && !order.getObservacoes().isBlank()) {
            return truncarTexto(order.getObservacoes().trim(), 52);
        }

        if (order.getClienteEndereco() != null && !order.getClienteEndereco().isBlank()) {
            return truncarTexto(order.getClienteEndereco().trim(), 52);
        }

        return NAO_INFORMADO;
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
