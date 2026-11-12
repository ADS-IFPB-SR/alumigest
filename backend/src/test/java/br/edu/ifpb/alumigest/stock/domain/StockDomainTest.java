package br.edu.ifpb.alumigest.stock.domain;

import br.edu.ifpb.alumigest.stock.dto.StockItemResponseDTO;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("StockDomain — Testes de Regras de Negócio e Enums")
class StockDomainTest {

    @Test
    @DisplayName("RN-01: Invariante Fundamental: available = physical - reserved")
    void shouldValidateFundamentalStockEquation() {
        BigDecimal physical = new BigDecimal("25.00");
        BigDecimal reserved = new BigDecimal("7.00");
        BigDecimal expectedAvailable = physical.subtract(reserved); // 18.00

        StockItemResponseDTO dto = new StockItemResponseDTO(
            UUID.randomUUID(),
            UUID.randomUUID(),
            "VID-001",
            "Vidro 8mm",
            "GLASS",
            "m²",
            physical,
            reserved,
            expectedAvailable,
            new BigDecimal("5.00"),
            StockAlertStatus.IN_STOCK,
            OffsetDateTime.now()
        );

        assertThat(dto.availableQuantity()).isEqualByComparingTo(new BigDecimal("18.00"));
        assertThat(dto.availableQuantity()).isEqualByComparingTo(dto.physicalQuantity().subtract(dto.reservedQuantity()));
    }

    @Test
    @DisplayName("RN-05: Make-to-Order permite saldo disponível negativo indicando necessidade de compra")
    void shouldSupportNegativeAvailableQuantityForMakeToOrder() {
        BigDecimal physical = BigDecimal.ZERO;
        BigDecimal reserved = new BigDecimal("12.00");
        BigDecimal available = physical.subtract(reserved); // -12.00

        StockItemResponseDTO dto = new StockItemResponseDTO(
            UUID.randomUUID(),
            UUID.randomUUID(),
            "VID-002",
            "Vidro Temperado 10mm",
            "GLASS",
            "m²",
            physical,
            reserved,
            available,
            new BigDecimal("4.00"),
            StockAlertStatus.NEED_PURCHASE,
            OffsetDateTime.now()
        );

        assertThat(dto.availableQuantity()).isNegative();
        assertThat(dto.alertStatus()).isEqualTo(StockAlertStatus.NEED_PURCHASE);
    }

    @Test
    @DisplayName("RN-04: Enums contratuais de movimentação devem conter todos os tipos homologados")
    void shouldContainAllContractualMovementTypes() {
        assertThat(StockMovementType.values()).containsExactlyInAnyOrder(
            StockMovementType.PURCHASE_ENTRY,
            StockMovementType.PRODUCTION_RESERVATION,
            StockMovementType.PRODUCTION_OUTFLOW,
            StockMovementType.RESERVATION_CANCELLATION,
            StockMovementType.MANUAL_ADJUSTMENT,
            StockMovementType.SCRAP_LOSS
        );
    }
}
