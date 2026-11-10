package br.edu.ifpb.alumigest.orders.service;

import br.edu.ifpb.alumigest.common.exception.BusinessException;
import br.edu.ifpb.alumigest.orders.domain.Order;
import br.edu.ifpb.alumigest.orders.domain.OrderStatus;
import br.edu.ifpb.alumigest.orders.dto.OrderPdfDTO;
import br.edu.ifpb.alumigest.orders.service.pdf.ThermalLabelData;
import br.edu.ifpb.alumigest.orders.service.pdf.ThermalLabelDataResolver;
import br.edu.ifpb.alumigest.orders.service.thermal.ThermalLabelBplbRenderer;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

@ExtendWith(MockitoExtension.class)
@DisplayName("Testes Unitários: OrderLabelService")
class OrderLabelServiceTest {

  @Mock
  private LabelPdfService labelPdfService;

  @Mock
  private ThermalLabelDataResolver thermalLabelDataResolver;

  @Mock
  private ThermalLabelBplbRenderer thermalLabelBplbRenderer;

  @InjectMocks
  private OrderLabelService orderLabelService;

  private Order buildOrder(UUID id, String codigo, OrderStatus status) {
    return Order.builder()
        .id(id)
        .codigo(codigo)
        .status(status)
        .build();
  }

  @Nested
  @DisplayName("Geração de Etiquetas PDF (gerarEtiquetasPdf)")
  class PdfLabelsTests {

    @ParameterizedTest
    @NullAndEmptySource
    @DisplayName("Deve gerar PDF padrão quando mapa de folhas customizadas for nulo ou vazio")
    void shouldGenerateDefaultPdfWhenCustomLeavesNullOrEmpty(
        Map<UUID, Integer> customLeaves) {
      UUID orderId = UUID.randomUUID();
      UUID itemId = UUID.randomUUID();
      Order order = buildOrder(orderId, "OS/2026/0001", OrderStatus.WAITING_PRODUCTION);
      byte[] pdfBytes = "%PDF-1.4".getBytes(StandardCharsets.UTF_8);

      given(labelPdfService.gerarEtiquetas(order, itemId)).willReturn(pdfBytes);

      OrderPdfDTO result = orderLabelService.gerarEtiquetasPdf(order, itemId, customLeaves);

      assertThat(result.bytes()).isEqualTo(pdfBytes);
      assertThat(result.filename()).isEqualTo("etiquetas-OS-2026-0001.pdf");
      verify(labelPdfService).gerarEtiquetas(order, itemId);
      verify(labelPdfService, never()).gerarEtiquetas(order, itemId, customLeaves);
    }

    @Test
    @DisplayName("Deve gerar PDF considerando folhas customizadas e fallback de nome")
    void shouldGenerateCustomPdfAndFallbackFilenameWhenCodigoIsNull() {
      UUID orderId = UUID.randomUUID();
      UUID itemId = UUID.randomUUID();
      Order order = buildOrder(orderId, null, OrderStatus.CREATED);
      Map<UUID, Integer> customLeaves = Map.of(itemId, 3);
      byte[] pdfBytes = "%PDF-1.4 custom".getBytes(StandardCharsets.UTF_8);

      given(labelPdfService.gerarEtiquetas(order, null, customLeaves)).willReturn(pdfBytes);

      OrderPdfDTO result = orderLabelService.gerarEtiquetasPdf(order, null, customLeaves);

      assertThat(result.bytes()).isEqualTo(pdfBytes);
      assertThat(result.filename()).isEqualTo("etiquetas-" + orderId + ".pdf");
      verify(labelPdfService).gerarEtiquetas(order, null, customLeaves);
    }

    @Test
    @DisplayName("Deve usar fallback 'sem-codigo' quando código e ID da ordem forem nulos")
    void shouldUseDefaultFilenameFallbackWhenCodigoAndIdAreNull() {
      Order order = buildOrder(null, null, OrderStatus.WAITING_PRODUCTION);
      byte[] pdfBytes = "%PDF-1.4".getBytes(StandardCharsets.UTF_8);
      given(labelPdfService.gerarEtiquetas(order, null)).willReturn(pdfBytes);

      OrderPdfDTO result = orderLabelService.gerarEtiquetasPdf(order, null, null);

      assertThat(result.filename()).isEqualTo("etiquetas-sem-codigo.pdf");
    }

    @Test
    @DisplayName("Deve lançar BusinessException ao emitir etiquetas PDF para ordem cancelada")
    void shouldRejectPdfLabelsWhenOrderIsCancelled() {
      Order cancelled = buildOrder(UUID.randomUUID(), "OS-2026-0001", OrderStatus.CANCELLED);

      assertThatThrownBy(() -> orderLabelService.gerarEtiquetasPdf(cancelled, null, null))
          .isInstanceOf(BusinessException.class)
          .hasMessageContaining("ordem de serviço cancelada");

      verifyNoInteractions(labelPdfService);
    }
  }

  @Nested
  @DisplayName("Geração de Etiquetas BPLB (gerarEtiquetasBplb)")
  class BplbLabelsTests {

    @ParameterizedTest
    @NullAndEmptySource
    @DisplayName("Deve gerar script BPLB padrão quando folhas customizadas forem nulas ou vazias")
    void shouldGenerateDefaultBplbWhenCustomLeavesNullOrEmpty(
        Map<UUID, Integer> customLeaves) {
      Order order = buildOrder(UUID.randomUUID(), "OS-2026-0002", OrderStatus.WAITING_PRODUCTION);
      UUID itemId = UUID.randomUUID();
      ThermalLabelData labelData = new ThermalLabelData(
          "Alumiportas", "Cliente", "OS-2026-0002", 1, 1, 1,
          "Janela 2F", "Suprema", 1200, 1000, "Branco", "Incolor",
          "Sala", "PRD-01", LocalDate.of(2026, 11, 9));
      List<ThermalLabelData> resolved = List.of(labelData);
      byte[] bplbBytes = "N\nP1\n".getBytes(StandardCharsets.ISO_8859_1);

      given(thermalLabelDataResolver.resolveLabels(order, itemId)).willReturn(resolved);
      given(thermalLabelBplbRenderer.renderBplbBytes(resolved)).willReturn(bplbBytes);

      byte[] result = orderLabelService.gerarEtiquetasBplb(order, itemId, customLeaves);

      assertThat(result).isEqualTo(bplbBytes);
      verify(thermalLabelDataResolver).resolveLabels(order, itemId);
      verify(thermalLabelBplbRenderer).renderBplbBytes(resolved);
    }

    @Test
    @DisplayName("Deve repassar folhas customizadas para resolvedor BPLB")
    void shouldPassCustomLeavesToResolverWhenProvided() {
      Order order = buildOrder(UUID.randomUUID(), "OS-2026-0003", OrderStatus.IN_PRODUCTION);
      UUID itemId = UUID.randomUUID();
      Map<UUID, Integer> customLeaves = Map.of(itemId, 4);
      List<ThermalLabelData> resolved = Collections.emptyList();
      byte[] bplbBytes = new byte[0];

      given(thermalLabelDataResolver.resolveLabels(order, itemId, customLeaves))
          .willReturn(resolved);
      given(thermalLabelBplbRenderer.renderBplbBytes(resolved)).willReturn(bplbBytes);

      byte[] result = orderLabelService.gerarEtiquetasBplb(order, itemId, customLeaves);

      assertThat(result).isEqualTo(bplbBytes);
      verify(thermalLabelDataResolver).resolveLabels(order, itemId, customLeaves);
      verify(thermalLabelBplbRenderer).renderBplbBytes(resolved);
    }

    @Test
    @DisplayName("Deve lançar BusinessException ao gerar BPLB para ordem cancelada")
    void shouldRejectBplbLabelsWhenOrderIsCancelled() {
      Order cancelled = buildOrder(UUID.randomUUID(), "OS-2026-0004", OrderStatus.CANCELLED);

      assertThatThrownBy(() -> orderLabelService.gerarEtiquetasBplb(cancelled, null, null))
          .isInstanceOf(BusinessException.class)
          .hasMessageContaining("ordem de serviço cancelada");

      verifyNoInteractions(thermalLabelDataResolver, thermalLabelBplbRenderer);
    }
  }
}

