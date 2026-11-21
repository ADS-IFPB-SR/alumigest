package br.edu.ifpb.alumigest.orders.service;

import br.edu.ifpb.alumigest.common.exception.BusinessException;
import br.edu.ifpb.alumigest.orders.domain.Order;
import br.edu.ifpb.alumigest.orders.domain.OrderStatus;
import br.edu.ifpb.alumigest.orders.dto.OrderPdfDTO;
import br.edu.ifpb.alumigest.orders.service.pdf.ThermalLabelData;
import br.edu.ifpb.alumigest.orders.service.pdf.ThermalLabelDataResolver;
import br.edu.ifpb.alumigest.orders.service.thermal.ThermalLabelBplbRenderer;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import org.springframework.stereotype.Service;

/**
 * Serviço de aplicação responsável pela orquestração da geração de etiquetas térmicas
 * de identificação física das ordens de serviço em formatos PDF e BPLB nativo.
 */
@Service
public class OrderLabelService {

  private static final String MSG_ORDEM_CANCELADA_ETIQUETAS =
      "Não é permitido emitir etiquetas de identificação para uma ordem de serviço cancelada.";

  private final LabelPdfService labelPdfService;
  private final ThermalLabelDataResolver thermalLabelDataResolver;
  private final ThermalLabelBplbRenderer thermalLabelBplbRenderer;

  /**
   * Inicializa o serviço orquestrador de etiquetas térmicas.
   *
   * @param labelPdfService          serviço gerador do PDF térmico 100x60mm
   * @param thermalLabelDataResolver resolvedor de dados de etiquetas por peça
   * @param thermalLabelBplbRenderer renderizador de comandos BPLB para Elgin L42
   */
  public OrderLabelService(
      LabelPdfService labelPdfService,
      ThermalLabelDataResolver thermalLabelDataResolver,
      ThermalLabelBplbRenderer thermalLabelBplbRenderer) {
    this.labelPdfService = labelPdfService;
    this.thermalLabelDataResolver = thermalLabelDataResolver;
    this.thermalLabelBplbRenderer = thermalLabelBplbRenderer;
  }

  /**
   * Gera o documento PDF contendo etiquetas térmicas para os itens da ordem informada.
   *
   * @param order               ordem de serviço carregada com itens
   * @param itemId              identificador opcional de item específico para filtro
   * @param customLeavesPerItem mapa opcional com contagem customizada de folhas por item
   * @return DTO com os bytes do PDF e o nome sugerido para download
   */
  public OrderPdfDTO gerarEtiquetasPdf(
      Order order, UUID itemId, Map<UUID, Integer> customLeavesPerItem) {
    validarOrdemNaoCancelada(order);

    byte[] bytes = hasCustomLeaves(customLeavesPerItem)
        ? labelPdfService.gerarEtiquetas(order, itemId, customLeavesPerItem)
        : labelPdfService.gerarEtiquetas(order, itemId);

    String codigo = order.getCodigo() != null
        ? order.getCodigo().replace("/", "-")
        : Objects.toString(order.getId(), "sem-codigo");
    String filename = "etiquetas-" + codigo + ".pdf";

    return new OrderPdfDTO(bytes, filename);
  }

  /**
   * Gera o script binário em comandos nativos BPLB para impressão térmica direta via USB.
   *
   * @param order               ordem de serviço carregada com itens
   * @param itemId              identificador opcional de item específico para filtro
   * @param customLeavesPerItem mapa opcional com contagem customizada de folhas por item
   * @return array de bytes com os comandos BPLB
   */
  public byte[] gerarEtiquetasBplb(
      Order order, UUID itemId, Map<UUID, Integer> customLeavesPerItem) {
    validarOrdemNaoCancelada(order);

    List<ThermalLabelData> etiquetas = hasCustomLeaves(customLeavesPerItem)
        ? thermalLabelDataResolver.resolveLabels(order, itemId, customLeavesPerItem)
        : thermalLabelDataResolver.resolveLabels(order, itemId);

    return thermalLabelBplbRenderer.renderBplbBytes(etiquetas);
  }

  private void validarOrdemNaoCancelada(Order order) {
    if (order.getStatus() == OrderStatus.CANCELLED) {
      throw new BusinessException(MSG_ORDEM_CANCELADA_ETIQUETAS);
    }
  }

  private boolean hasCustomLeaves(Map<UUID, Integer> customLeavesPerItem) {
    return customLeavesPerItem != null && !customLeavesPerItem.isEmpty();
  }
}

