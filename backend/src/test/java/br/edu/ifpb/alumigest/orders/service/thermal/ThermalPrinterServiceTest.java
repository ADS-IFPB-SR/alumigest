package br.edu.ifpb.alumigest.orders.service.thermal;

import br.edu.ifpb.alumigest.common.exception.BusinessException;
import br.edu.ifpb.alumigest.orders.domain.Order;
import br.edu.ifpb.alumigest.orders.dto.PrintThermalResultDTO;
import br.edu.ifpb.alumigest.orders.dto.PrinterInfoDTO;
import br.edu.ifpb.alumigest.orders.service.pdf.ThermalLabelData;
import br.edu.ifpb.alumigest.orders.service.pdf.ThermalLabelDataResolver;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

/**
 * Bateria de testes unitários para {@link ThermalPrinterService}.
 * US-17 / Correções #492 e #493.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("ThermalPrinterService - Testes Unitários de Spooler e Impressão Térmica [US-17]")
class ThermalPrinterServiceTest {

    @Mock
    private ThermalLabelDataResolver dataResolver;

    @Mock
    private ThermalLabelBplbRenderer bplbRenderer;

    private ThermalPrinterService service;

    @BeforeEach
    void setUp() {
        service = new ThermalPrinterService(dataResolver, bplbRenderer);
    }

    private Order criarOrdemExemplo() {
        return Order.builder()
                .id(UUID.randomUUID())
                .codigo("OS-2026-0001")
                .clienteNome("Construtora Alvorada")
                .dataAprovacao(LocalDate.of(2026, 10, 21))
                .build();
    }

    @Nested
    @DisplayName("1. Validações e Tratamento de Erros")
    class ValidacoesTestes {

        @Test
        @DisplayName("Deve lançar IllegalArgumentException quando ordem de serviço for nula")
        void deveLancarExcecaoParaOrdemNula() {
            assertThatThrownBy(() -> service.printLabelsDirectly(null, null, null))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("não pode ser nula");
        }

        @Test
        @DisplayName("Deve lançar BusinessException quando ordem não possuir etiquetas válidas")
        void deveLancarExcecaoParaEtiquetasVazias() {
            Order order = criarOrdemExemplo();
            when(dataResolver.resolveLabels(order, null)).thenReturn(Collections.emptyList());

            assertThatThrownBy(() -> service.printLabelsDirectly(order, null, null))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("não possui etiquetas válidas");
        }
    }

    @Nested
    @DisplayName("2. Listagem de Impressoras e Detecção de Térmica")
    class ListagemImpressorasTestes {

        @Test
        @DisplayName("Deve enumerar impressoras do sistema operacional sem lançar exceções")
        void deveEnumerarImpressorasComSeguranca() {
            List<PrinterInfoDTO> printers = service.listAvailablePrinters();
            assertThat(printers).isNotNull();
        }
    }

    @Nested
    @DisplayName("3. Envio de Etiquetas e Retorno de DTO")
    class EnvioEtiquetasTestes {

        @Test
        @DisplayName("Deve gerar payload e resultado estruturado de impressão com sucesso")
        void deveGerarResultadoEstruturadoComSucesso() {
            Order order = criarOrdemExemplo();
            ThermalLabelData data = new ThermalLabelData(
                    "ALUMIPORTAS",
                    "Construtora Alvorada",
                    "OS-2026-0001",
                    1,
                    1,
                    1,
                    "Janela 2 Folhas",
                    "Linha Suprema",
                    1200,
                    1200,
                    "Branco",
                    "Incolor 6mm",
                    "Sala",
                    "PRD-001",
                    LocalDate.of(2026, 10, 21),
                    "ITEM 01 • ESQUADRIA 01/01 | FOLHA 01/01"
            );

            when(dataResolver.resolveLabels(order, null)).thenReturn(List.of(data));
            when(bplbRenderer.renderBplb(List.of(data))).thenReturn("N\nq800\nQ480,24\nP1\n");
            when(bplbRenderer.renderBplbBytes(List.of(data))).thenReturn(new byte[]{78, 10});

            PrintThermalResultDTO resultado = service.printLabelsDirectly(order, null, "ImpressoraInexistente999");

            assertThat(resultado).isNotNull();
            assertThat(resultado.success()).isTrue();
            assertThat(resultado.labelCount()).isEqualTo(1);
            assertThat(resultado.bplbPayload()).contains("P1");
        }
    }
}
