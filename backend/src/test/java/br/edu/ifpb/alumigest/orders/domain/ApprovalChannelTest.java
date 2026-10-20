package br.edu.ifpb.alumigest.orders.domain;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Testes de Domínio: ApprovalChannel")
class ApprovalChannelTest {

    @Test
    @DisplayName("[Partição de Equivalência] Deve conter todos os 5 canais de aprovação válidos com seus respectivos labels")
    void shouldContainAllValidChannelsWithLabels() {
        assertThat(ApprovalChannel.values()).containsExactly(
                ApprovalChannel.WHATSAPP,
                ApprovalChannel.PRESENCIAL,
                ApprovalChannel.TELEFONE,
                ApprovalChannel.EMAIL,
                ApprovalChannel.OUTRO
        );

        assertThat(ApprovalChannel.WHATSAPP.getDescricao()).isEqualTo("WhatsApp");
        assertThat(ApprovalChannel.WHATSAPP.getLabel()).isEqualTo("WhatsApp");

        assertThat(ApprovalChannel.PRESENCIAL.getDescricao()).isEqualTo("Presencial");
        assertThat(ApprovalChannel.PRESENCIAL.getLabel()).isEqualTo("Presencial");

        assertThat(ApprovalChannel.TELEFONE.getDescricao()).isEqualTo("Telefone");
        assertThat(ApprovalChannel.TELEFONE.getLabel()).isEqualTo("Telefone");

        assertThat(ApprovalChannel.EMAIL.getDescricao()).isEqualTo("E-mail");
        assertThat(ApprovalChannel.EMAIL.getLabel()).isEqualTo("E-mail");

        assertThat(ApprovalChannel.OUTRO.getDescricao()).isEqualTo("Outro");
        assertThat(ApprovalChannel.OUTRO.getLabel()).isEqualTo("Outro");
    }
}
