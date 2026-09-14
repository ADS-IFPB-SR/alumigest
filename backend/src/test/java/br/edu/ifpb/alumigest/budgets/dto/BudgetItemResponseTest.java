package br.edu.ifpb.alumigest.budgets.dto;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Testes Unitários - BudgetItemResponse (US-09.18)")
class BudgetItemResponseTest {

    @Test
    @DisplayName("Deve instanciar BudgetItemResponse com o construtor canônico e preservar todos os atributos")
    void deveInstanciarComConstrutorCanonico() {
        UUID id = UUID.randomUUID();
        UUID productId = UUID.randomUUID();
        String productName = "Janela 4 Folhas Suprema";
        BigDecimal larguraMm = new BigDecimal("1200.00");
        BigDecimal alturaMm = new BigDecimal("1000.00");
        Integer quantidade = 2;
        BigDecimal valorUnitario = new BigDecimal("450.50");
        BigDecimal subtotal = new BigDecimal("901.00");
        String observacoes = "Vidro Fumê 6mm e perfil preto";

        BudgetItemResponse response = new BudgetItemResponse(
                id,
                productId,
                productName,
                larguraMm,
                alturaMm,
                quantidade,
                valorUnitario,
                subtotal,
                observacoes
        );

        assertThat(response.id()).isEqualTo(id);
        assertThat(response.productId()).isEqualTo(productId);
        assertThat(response.productName()).isEqualTo(productName);
        assertThat(response.larguraMm()).isEqualByComparingTo(larguraMm);
        assertThat(response.alturaMm()).isEqualByComparingTo(alturaMm);
        assertThat(response.quantidade()).isEqualTo(quantidade);
        assertThat(response.valorUnitario()).isEqualByComparingTo(valorUnitario);
        assertThat(response.subtotal()).isEqualByComparingTo(subtotal);
        assertThat(response.observacoes()).isEqualTo(observacoes);
    }

    @Test
    @DisplayName("Deve calcular subtotal automaticamente no construtor de conveniência")
    void deveCalcularSubtotalNoConstrutorDeConveniencia() {
        UUID id = UUID.randomUUID();
        UUID productId = UUID.randomUUID();
        String productName = "Porta Pivotante Linha Gold";
        BigDecimal larguraMm = new BigDecimal("900.00");
        BigDecimal alturaMm = new BigDecimal("2100.00");
        Integer quantidade = 3;
        BigDecimal valorUnitario = new BigDecimal("800.00");
        String observacoes = "Puxador tubular 60cm";

        BudgetItemResponse response = new BudgetItemResponse(
                id,
                productId,
                productName,
                larguraMm,
                alturaMm,
                quantidade,
                valorUnitario,
                observacoes
        );

        assertThat(response.subtotal()).isEqualByComparingTo(new BigDecimal("2400.00"));
    }

    @Test
    @DisplayName("Deve retornar subtotal zero quando valor unitário ou quantidade forem nulos no construtor de conveniência")
    void deveLidarComValoresNulosNoConstrutorDeConveniencia() {
        UUID id = UUID.randomUUID();
        UUID productId = UUID.randomUUID();

        BudgetItemResponse responseNullUnit = new BudgetItemResponse(
                id, productId, "Porta", new BigDecimal("800"), new BigDecimal("2100"), 1, null, "Obs"
        );
        assertThat(responseNullUnit.subtotal()).isEqualTo(BigDecimal.ZERO);

        BudgetItemResponse responseNullQtd = new BudgetItemResponse(
                id, productId, "Porta", new BigDecimal("800"), new BigDecimal("2100"), null, new BigDecimal("500.00"), "Obs"
        );
        assertThat(responseNullQtd.subtotal()).isEqualTo(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("Deve respeitar igualdade de valor e hashcode do Record")
    void deveRespeitarEqualsEHashCode() {
        UUID id = UUID.randomUUID();
        UUID productId = UUID.randomUUID();

        BudgetItemResponse item1 = new BudgetItemResponse(
                id, productId, "Esquadria", new BigDecimal("1000.00"), new BigDecimal("1000.00"), 1,
                new BigDecimal("300.00"), new BigDecimal("300.00"), "Nenhuma"
        );

        BudgetItemResponse item2 = new BudgetItemResponse(
                id, productId, "Esquadria", new BigDecimal("1000.00"), new BigDecimal("1000.00"), 1,
                new BigDecimal("300.00"), new BigDecimal("300.00"), "Nenhuma"
        );

        assertThat(item1).isEqualTo(item2);
        assertThat(item1.hashCode()).isEqualTo(item2.hashCode());
        assertThat(item1.toString()).contains("Esquadria");
    }
}
