package br.edu.ifpb.alumigest.orders.service.thermal;

import br.edu.ifpb.alumigest.orders.service.pdf.ThermalLabelData;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Bateria de testes unitários para {@link ThermalLabelBplbRenderer}.
 * Valida a emissão dos comandos nativos BPLB (Elgin L42) conforme o Manual de Programação rev. 3.0.
 * US-17 / Correções #492 e #493.
 */
@DisplayName("ThermalLabelBplbRenderer - Testes Unitários de Comandos BPLB [US-17]")
class ThermalLabelBplbRendererTest {

    private ThermalLabelBplbRenderer renderer;

    @BeforeEach
    void setUp() {
        renderer = new ThermalLabelBplbRenderer();
    }

    private ThermalLabelData criarEtiquetaPadrao(int itemIdx, int esqIdx, int folhaIdx, int totalFolhas) {
        String badge = String.format("ITEM %02d • ESQUADRIA %02d/%02d | FOLHA %02d/%02d",
                itemIdx, esqIdx, 1, folhaIdx, totalFolhas);
        return new ThermalLabelData(
                "ALUMIPORTAS",
                "Construtora Alvorada",
                "OS-2026-0001",
                itemIdx,
                folhaIdx,
                totalFolhas,
                "Porta de Correr 2 Folhas Linha Suprema",
                "Linha Suprema",
                1600,
                2100,
                "Preto Anodizado",
                "Incolor 6mm Temperado",
                "Bloco A - Apto 101",
                "PRD-001",
                LocalDate.of(2026, 10, 21),
                badge
        );
    }

    @Nested
    @DisplayName("1. Estrutura e Comandos Físicos BPLB")
    class ComandosFisicosTestes {

        @Test
        @DisplayName("Deve retornar string vazia para lista nula ou vazia")
        void deveRetornarVazioParaListaNulaOuVazia() {
            assertThat(renderer.renderBplb(null)).isEmpty();
            assertThat(renderer.renderBplb(Collections.emptyList())).isEmpty();
            assertThat(renderer.renderBplbBytes(null)).isEmpty();
            assertThat(renderer.renderBplbBytes(Collections.emptyList())).isEmpty();
        }

        @Test
        @DisplayName("Deve conter parâmetros de calibração física da bobina 100x60mm (800x480)")
        void deveConterParametrosCalibracaoFisica() {
            ThermalLabelData data = criarEtiquetaPadrao(1, 1, 1, 1);
            String bplb = renderer.renderBplb(List.of(data));

            // N: Limpa buffer
            assertThat(bplb).startsWith("N\n");
            // D9: Densidade 9
            assertThat(bplb).contains("D9\n");
            // S2: Velocidade 2 pol/seg
            assertThat(bplb).contains("S2\n");
            // JF: Habilita backfeed
            assertThat(bplb).contains("JF\n");
            // ZT: Orientação normal
            assertThat(bplb).contains("ZT\n");
            // Q480,24: Altura de 480 pontos e gap de 24 pontos (3mm)
            assertThat(bplb).contains("Q480,24\n");
            // q800: Largura de 800 pontos (100mm a 203 DPI)
            assertThat(bplb).contains("q800\n");
            // P1: Exatamente 1 cópia emitida por etiqueta
            assertThat(bplb).endsWith("P1\n");
        }

        @Test
        @DisplayName("Deve renderizar comandos para múltiplas etiquetas físicas em sequência")
        void deveRenderizarMultiplasEtiquetas() {
            ThermalLabelData e1 = criarEtiquetaPadrao(1, 1, 1, 2);
            ThermalLabelData e2 = criarEtiquetaPadrao(1, 1, 2, 2);

            String bplb = renderer.renderBplb(List.of(e1, e2));

            // Deve conter 2 comandos de limpeza (N) e 2 comandos de impressão (P1)
            int countN = bplb.split("N\n", -1).length - 1;
            int countP1 = bplb.split("P1\n", -1).length - 1;

            assertThat(countN).isEqualTo(2);
            assertThat(countP1).isEqualTo(2);
        }
    }

    @Nested
    @DisplayName("2. Formatação dos Dados e Medidas Nominais")
    class FormatacaoDadosTestes {

        @Test
        @DisplayName("Deve formatar caixa de medidas nominais e dados técnicos")
        void deveFormatarMedidasNominaisETecnicos() {
            ThermalLabelData data = criarEtiquetaPadrao(1, 1, 1, 2);
            String bplb = renderer.renderBplb(List.of(data));

            assertThat(bplb).contains("MEDIDAS NOMINAIS (L X A)");
            assertThat(bplb).contains("1600 x 2100 mm");
            assertThat(bplb).contains("COR: Preto Anodizado");
            assertThat(bplb).contains("VIDRO: Incolor 6mm Temperado");
            assertThat(bplb).contains("LOCAL / OBS: Bloco A - Apto 101");
            assertThat(bplb).contains("DATA: 21/10/2026");
            assertThat(bplb).contains("ALUMIGEST - 100X60MM");
        }

        @Test
        @DisplayName("Deve sanitizar acentos e aspas para conformidade BPLB sem travar a impressora")
        void deveSanitizarAcentosEAspas() {
            ThermalLabelData dataComAcentos = new ThermalLabelData(
                    "Alumínio & Cia \"Top\"",
                    "João Antônio da Conceição",
                    "OS-2026-0002",
                    1,
                    1,
                    1,
                    "Portão Eletrônico Linha Padrão",
                    "Linha Padrão",
                    2000,
                    2200,
                    "Branco Brilhante",
                    "Fumê 8mm Temperado",
                    "Portão Principal com \"Trava\"",
                    "PRD-002",
                    LocalDate.of(2026, 10, 21),
                    "ITEM 01 | PECA 01/01"
            );

            String bplb = renderer.renderBplb(List.of(dataComAcentos));

            // Não deve conter acentos gráficos NFD/Unicode nos textos sanitizados
            assertThat(bplb).doesNotContain("Alumínio");
            assertThat(bplb).contains("Aluminio");
            assertThat(bplb).contains("Joao Antonio da Conceicao");
            assertThat(bplb).contains("Portao Eletronico Linha Padrao");
            assertThat(bplb).contains("Fume 8mm Temperado");
            // Não deve conter aspas duplas internas que quebrem os comandos BPLB
            assertThat(bplb).doesNotContain("\"Top\"");
            assertThat(bplb).doesNotContain("\"Trava\"");
        }
    }
}
