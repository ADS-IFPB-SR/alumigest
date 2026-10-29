package br.edu.ifpb.alumigest.partsale.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import br.edu.ifpb.alumigest.catalog.domain.Material;
import br.edu.ifpb.alumigest.catalog.domain.MaterialCategoryType;
import java.math.BigDecimal;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

@DisplayName("PartSale Domain Entity [US-46.1] - Unit & Invariant Tests")
class PartSaleTest {

  @Nested
  @DisplayName("Regras de Inicialização e Invariantes")
  class InitializationRules {

    @Test
    @DisplayName("Deve inicializar com valores default quando status e desconto forem nulos")
    void shouldInitializeWithDefaults() {
      UUID clientId = UUID.randomUUID();
      PartSale sale = new PartSale("VP-2026-0001", clientId, null, null);

      assertThat(sale.getId()).isNull();
      assertThat(sale.getCode()).isEqualTo("VP-2026-0001");
      assertThat(sale.getClientId()).isEqualTo(clientId);
      assertThat(sale.getStatus()).isEqualTo(PartSaleStatus.DRAFT);
      assertThat(sale.getDiscountAmount()).isEqualByComparingTo(BigDecimal.ZERO);
      assertThat(sale.getSubtotalAmount()).isEqualByComparingTo(BigDecimal.ZERO);
      assertThat(sale.getTotalAmount()).isEqualByComparingTo(BigDecimal.ZERO);
      assertThat(sale.getItems()).isEmpty();
    }

    @Test
    @DisplayName("Deve rejeitar código e cliente nulos")
    void shouldRejectNullMandatoryFields() {
      UUID clientId = UUID.randomUUID();

      assertThatThrownBy(() -> new PartSale(null, clientId, PartSaleStatus.DRAFT, BigDecimal.ZERO))
          .isInstanceOf(NullPointerException.class)
          .hasMessageContaining("Código");

      assertThatThrownBy(() -> new PartSale("VP-2026-0001", null, PartSaleStatus.DRAFT, BigDecimal.ZERO))
          .isInstanceOf(NullPointerException.class)
          .hasMessageContaining("Cliente");
    }
  }

  @Nested
  @DisplayName("Gestão de Itens e Recálculo Automático")
  class ItemManagementAndTotals {

    @Test
    @DisplayName("Deve adicionar e remover itens recalculando subtotal e total com desconto")
    void shouldAddAndRemoveItemsRecalculatingTotals() {
      PartSale sale = new PartSale("VP-2026-0001", UUID.randomUUID(), PartSaleStatus.DRAFT, new BigDecimal("10.00"));

      PartSaleItem item1 = mock(PartSaleItem.class);
      when(item1.getTotalPrice()).thenReturn(new BigDecimal("50.00"));

      PartSaleItem item2 = mock(PartSaleItem.class);
      when(item2.getTotalPrice()).thenReturn(new BigDecimal("30.00"));

      sale.addItem(item1);
      assertThat(sale.getItems()).hasSize(1);
      assertThat(sale.getSubtotalAmount()).isEqualByComparingTo("50.00");
      assertThat(sale.getTotalAmount()).isEqualByComparingTo("40.00"); // 50 - 10 = 40

      sale.addItem(item2);
      assertThat(sale.getItems()).hasSize(2);
      assertThat(sale.getSubtotalAmount()).isEqualByComparingTo("80.00");
      assertThat(sale.getTotalAmount()).isEqualByComparingTo("70.00"); // 80 - 10 = 70

      sale.removeItem(item1);
      assertThat(sale.getItems()).hasSize(1);
      assertThat(sale.getSubtotalAmount()).isEqualByComparingTo("30.00");
      assertThat(sale.getTotalAmount()).isEqualByComparingTo("20.00"); // 30 - 10 = 20

      // Remover item que não existe não deve alterar
      PartSaleItem nonexistent = mock(PartSaleItem.class);
      sale.removeItem(nonexistent);
      assertThat(sale.getItems()).hasSize(1);
    }

    @Test
    @DisplayName("Deve rejeitar adição de item nulo")
    void shouldRejectNullItem() {
      PartSale sale = new PartSale("VP-2026-0001", UUID.randomUUID(), PartSaleStatus.DRAFT, BigDecimal.ZERO);

      assertThatThrownBy(() -> sale.addItem(null))
          .isInstanceOf(NullPointerException.class);
    }

    @Test
    @DisplayName("Desconto maior que subtotal deve limitar total a zero (BVA)")
    void shouldNotAllowNegativeTotalAmountWhenDiscountExceedsSubtotal() {
      PartSale sale = new PartSale("VP-2026-0001", UUID.randomUUID(), PartSaleStatus.DRAFT, BigDecimal.ZERO);

      PartSaleItem item = mock(PartSaleItem.class);
      when(item.getTotalPrice()).thenReturn(new BigDecimal("20.00"));
      sale.addItem(item);

      sale.setDiscountAmount(new BigDecimal("50.00"));

      assertThat(sale.getSubtotalAmount()).isEqualByComparingTo("20.00");
      assertThat(sale.getTotalAmount()).isEqualByComparingTo("0.00");

      sale.setDiscountAmount(null);
      assertThat(sale.getDiscountAmount()).isEqualByComparingTo("0.00");
      assertThat(sale.getTotalAmount()).isEqualByComparingTo("20.00");
    }

    @Test
    @DisplayName("Deve vincular bidirecionalmente e desvincular item ao adicionar e remover matando mutantes void")
    void shouldLinkAndUnlinkPartSaleOnAddAndRemove() {
      PartSale sale = new PartSale("VP-2026-0001", UUID.randomUUID(), PartSaleStatus.DRAFT, BigDecimal.ZERO);
      Material mat = mock(Material.class);
      when(mat.getId()).thenReturn(UUID.randomUUID());
      when(mat.getName()).thenReturn("Dobradiça");

      PartSaleItem item = new PartSaleItem(mat, MaterialCategoryType.HARDWARE, null, null, 1,
          BigDecimal.ONE, BigDecimal.TEN, BigDecimal.TEN);

      assertThat(item.getPartSale()).isNull();
      sale.addItem(item);
      assertThat(item.getPartSale()).isSameAs(sale);

      sale.removeItem(item);
      assertThat(item.getPartSale()).isNull();
    }

    @Test
    @DisplayName("A lista getItems() deve ser imutável")
    void itemsListShouldBeUnmodifiable() {
      PartSale sale = new PartSale("VP-2026-0001", UUID.randomUUID(), PartSaleStatus.DRAFT, BigDecimal.ZERO);
      PartSaleItem item = mock(PartSaleItem.class);
      when(item.getTotalPrice()).thenReturn(BigDecimal.TEN);
      sale.addItem(item);

      assertThatThrownBy(() -> sale.getItems().add(mock(PartSaleItem.class)))
          .isInstanceOf(UnsupportedOperationException.class);
    }
  }

  @Nested
  @DisplayName("Transição de Status e Ciclo de Vida JPA")
  class StatusAndLifecycle {

    @Test
    @DisplayName("Deve atualizar status com sucesso e rejeitar status nulo")
    void shouldUpdateStatusAndRejectNull() {
      PartSale sale = new PartSale("VP-2026-0001", UUID.randomUUID(), PartSaleStatus.DRAFT, BigDecimal.ZERO);

      sale.updateStatus(PartSaleStatus.APPROVED);
      assertThat(sale.getStatus()).isEqualTo(PartSaleStatus.APPROVED);

      assertThatThrownBy(() -> sale.updateStatus(null))
          .isInstanceOf(NullPointerException.class);
    }

    @Test
    @DisplayName("Deve executar callbacks @PrePersist e @PreUpdate")
    void shouldExecuteLifecycleHooks() {
      PartSale sale = new PartSale("VP-2026-0001", UUID.randomUUID(), PartSaleStatus.DRAFT, BigDecimal.ZERO);

      assertThat(sale.getCreatedAt()).isNull();
      assertThat(sale.getUpdatedAt()).isNull();

      sale.prePersist();
      assertThat(sale.getCreatedAt()).isNotNull();
      assertThat(sale.getUpdatedAt()).isNotNull();

      sale.preUpdate();
      assertThat(sale.getUpdatedAt()).isNotNull();
    }

    @Test
    @DisplayName("Deve retornar ID persistido via getId()")
    void shouldReturnAssignedId() throws Exception {
      PartSale sale = new PartSale("VP-2026-0001", UUID.randomUUID(), PartSaleStatus.DRAFT, BigDecimal.ZERO);
      UUID expectedId = UUID.randomUUID();
      java.lang.reflect.Field idField = PartSale.class.getDeclaredField("id");
      idField.setAccessible(true);
      idField.set(sale, expectedId);

      assertThat(sale.getId()).isEqualTo(expectedId);
    }

    @Test
    @DisplayName("Deve instanciar construtor padrão protegido do JPA")
    void shouldSupportNoArgConstructor() throws Exception {
      java.lang.reflect.Constructor<PartSale> constructor = PartSale.class.getDeclaredConstructor();
      constructor.setAccessible(true);
      PartSale sale = constructor.newInstance();
      assertThat(sale).isNotNull();
      assertThat(sale.getId()).isNull();
    }
  }
}

