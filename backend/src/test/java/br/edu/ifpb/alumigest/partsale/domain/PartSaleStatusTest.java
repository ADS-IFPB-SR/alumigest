package br.edu.ifpb.alumigest.partsale.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("PartSaleStatus [US-46.1] - State Transition Machine")
class PartSaleStatusTest {

  @Test
  @DisplayName("DRAFT deve permitir transição para APPROVED ou CANCELLED")
  void draftCanTransitionToApprovedOrCancelled() {
    assertThat(PartSaleStatus.DRAFT.canTransitionTo(PartSaleStatus.APPROVED)).isTrue();
    assertThat(PartSaleStatus.DRAFT.canTransitionTo(PartSaleStatus.CANCELLED)).isTrue();
    assertThat(PartSaleStatus.DRAFT.canTransitionTo(PartSaleStatus.DRAFT)).isTrue();
  }

  @Test
  @DisplayName("APPROVED deve permitir transição para CANCELLED")
  void approvedCanTransitionToCancelled() {
    assertThat(PartSaleStatus.APPROVED.canTransitionTo(PartSaleStatus.CANCELLED)).isTrue();
    assertThat(PartSaleStatus.APPROVED.canTransitionTo(PartSaleStatus.APPROVED)).isTrue();
    assertThat(PartSaleStatus.APPROVED.canTransitionTo(PartSaleStatus.DRAFT)).isFalse();
  }

  @Test
  @DisplayName("CANCELLED não deve permitir transição para nenhum outro estado")
  void cancelledIsTerminalState() {
    assertThat(PartSaleStatus.CANCELLED.canTransitionTo(PartSaleStatus.DRAFT)).isFalse();
    assertThat(PartSaleStatus.CANCELLED.canTransitionTo(PartSaleStatus.APPROVED)).isFalse();
    assertThat(PartSaleStatus.CANCELLED.canTransitionTo(PartSaleStatus.CANCELLED)).isTrue();
    assertThat(PartSaleStatus.CANCELLED.canTransitionTo(null)).isFalse();
    assertThat(PartSaleStatus.DRAFT.canTransitionTo(null)).isFalse();
    assertThat(PartSaleStatus.APPROVED.canTransitionTo(null)).isFalse();
  }
}

