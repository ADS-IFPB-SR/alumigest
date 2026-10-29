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

@DisplayName("PartSaleItem Domain Entity [US-46.1] - Unit & Invariant Tests")
class PartSaleItemTest {

  private Material createMockMaterial(UUID id, String name) {
    Material mat = mock(Material.class);
    when(mat.getId()).thenReturn(id);
    when(mat.getName()).thenReturn(name);
    return mat;
  }

  @Nested
  @DisplayName("Regras de Inicialização e Validações de Borda (BVA)")
  class ConstructorValidation {

    @Test
    @DisplayName("Deve instanciar item válido com sucesso")
    void shouldCreateValidItem() {
      UUID matId = UUID.randomUUID();
      Material mat = createMockMaterial(matId, "Roldana Suprema 112");

      PartSaleItem item = new PartSaleItem(
          mat,
          MaterialCategoryType.HARDWARE,
          null,
          null,
          3,
          new BigDecimal("3.0000"),
          new BigDecimal("25.00"),
          new BigDecimal("75.00")
      );

      assertThat(item.getMaterial()).isSameAs(mat);
      assertThat(item.getMaterialId()).isEqualTo(matId);
      assertThat(item.getDescription()).isEqualTo("Roldana Suprema 112");
      assertThat(item.getMaterialType()).isEqualTo(MaterialCategoryType.HARDWARE);
      assertThat(item.getQuantity()).isEqualTo(3);
      assertThat(item.getCalculatedUnitMeasure()).isEqualByComparingTo("3.0000");
      assertThat(item.getUnitPrice()).isEqualByComparingTo("25.00");
      assertThat(item.getTotalPrice()).isEqualByComparingTo("75.00");
      assertThat(item.getWidthMm()).isNull();
      assertThat(item.getHeightMm()).isNull();
    }

    @Test
    @DisplayName("Deve permitir preço unitário e total iguais a zero matando mutantes de borda (BVA)")
    void shouldAllowZeroPricesAtBoundary() {
      Material mat = createMockMaterial(UUID.randomUUID(), "Roldana");
      PartSaleItem item = new PartSaleItem(mat, MaterialCategoryType.HARDWARE, null, null, 1,
          BigDecimal.ONE, BigDecimal.ZERO, BigDecimal.ZERO);

      assertThat(item.getUnitPrice()).isEqualByComparingTo(BigDecimal.ZERO);
      assertThat(item.getTotalPrice()).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("Deve rejeitar quantidade nula, zero ou negativa (BVA)")
    void shouldRejectInvalidQuantity() {
      Material mat = createMockMaterial(UUID.randomUUID(), "Roldana");

      assertThatThrownBy(() -> new PartSaleItem(mat, MaterialCategoryType.HARDWARE, null, null, null,
          new BigDecimal("1.0"), new BigDecimal("10.0"), new BigDecimal("10.0")))
          .isInstanceOf(IllegalArgumentException.class);

      assertThatThrownBy(() -> new PartSaleItem(mat, MaterialCategoryType.HARDWARE, null, null, 0,
          new BigDecimal("1.0"), new BigDecimal("10.0"), new BigDecimal("10.0")))
          .isInstanceOf(IllegalArgumentException.class);

      assertThatThrownBy(() -> new PartSaleItem(mat, MaterialCategoryType.HARDWARE, null, null, -1,
          new BigDecimal("1.0"), new BigDecimal("10.0"), new BigDecimal("10.0")))
          .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("Deve rejeitar preço unitário ou total nulo/negativo (BVA)")
    void shouldRejectInvalidPrices() {
      Material mat = createMockMaterial(UUID.randomUUID(), "Roldana");

      assertThatThrownBy(() -> new PartSaleItem(mat, MaterialCategoryType.HARDWARE, null, null, 1,
          new BigDecimal("1.0"), null, new BigDecimal("10.0")))
          .isInstanceOf(IllegalArgumentException.class);

      assertThatThrownBy(() -> new PartSaleItem(mat, MaterialCategoryType.HARDWARE, null, null, 1,
          new BigDecimal("1.0"), new BigDecimal("-1.0"), new BigDecimal("10.0")))
          .isInstanceOf(IllegalArgumentException.class);

      assertThatThrownBy(() -> new PartSaleItem(mat, MaterialCategoryType.HARDWARE, null, null, 1,
          new BigDecimal("1.0"), new BigDecimal("10.0"), null))
          .isInstanceOf(IllegalArgumentException.class);

      assertThatThrownBy(() -> new PartSaleItem(mat, MaterialCategoryType.HARDWARE, null, null, 1,
          new BigDecimal("1.0"), new BigDecimal("10.0"), new BigDecimal("-5.0")))
          .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("Deve rejeitar dependências obrigatórias nulas")
    void shouldRejectNullMandatoryDependencies() {
      Material mat = createMockMaterial(UUID.randomUUID(), "Roldana");

      assertThatThrownBy(() -> new PartSaleItem(null, MaterialCategoryType.HARDWARE, null, null, 1,
          new BigDecimal("1.0"), new BigDecimal("10.0"), new BigDecimal("10.0")))
          .isInstanceOf(NullPointerException.class);

      assertThatThrownBy(() -> new PartSaleItem(mat, null, null, null, 1,
          new BigDecimal("1.0"), new BigDecimal("10.0"), new BigDecimal("10.0")))
          .isInstanceOf(NullPointerException.class);

      assertThatThrownBy(() -> new PartSaleItem(mat, MaterialCategoryType.HARDWARE, null, null, 1,
          null, new BigDecimal("10.0"), new BigDecimal("10.0")))
          .isInstanceOf(NullPointerException.class);
    }
  }

  @Nested
  @DisplayName("Relacionamento e Igualdade")
  class RelationshipAndEquality {

    @Test
    @DisplayName("Deve vincular partSale e acessar getter")
    void shouldLinkPartSale() {
      Material mat = createMockMaterial(UUID.randomUUID(), "Roldana");
      PartSaleItem item = new PartSaleItem(mat, MaterialCategoryType.HARDWARE, null, null, 1,
          new BigDecimal("1.0"), new BigDecimal("10.0"), new BigDecimal("10.0"));

      PartSale sale = mock(PartSale.class);
      item.setPartSale(sale);

      assertThat(item.getPartSale()).isSameAs(sale);
    }

    @Test
    @DisplayName("Deve testar contrato de equals e hashCode com IDs atribuídos")
    void shouldFollowEqualsWithIds() throws Exception {
      Material mat = createMockMaterial(UUID.randomUUID(), "Roldana");
      PartSaleItem item1 = new PartSaleItem(mat, MaterialCategoryType.HARDWARE, 100, 200, 1,
          new BigDecimal("1.0"), new BigDecimal("10.0"), new BigDecimal("10.0"));
      PartSaleItem item2 = new PartSaleItem(mat, MaterialCategoryType.HARDWARE, 100, 200, 1,
          new BigDecimal("1.0"), new BigDecimal("10.0"), new BigDecimal("10.0"));

      java.lang.reflect.Field idField = PartSaleItem.class.getDeclaredField("id");
      idField.setAccessible(true);
      UUID id1 = UUID.randomUUID();
      UUID id2 = UUID.randomUUID();

      idField.set(item1, id1);
      idField.set(item2, id1);

      // Verificação de getId() e hashCode() com valor positivo
      assertThat(item1.getId()).isEqualTo(id1);
      assertThat(item1.hashCode()).isNotZero();

      // Reflexividade
      assertThat(item1.equals(item1)).isTrue();
      // Comparação com objeto de outra classe
      assertThat(item1.equals("StringQualquer")).isFalse();
      assertThat(item1.equals(new Object())).isFalse();
      // Comparação com null
      assertThat(item1.equals(null)).isFalse();

      assertThat(item1).isEqualTo(item2);
      assertThat(item1.hashCode()).isEqualTo(item2.hashCode());

      idField.set(item2, id2);
      assertThat(item1).isNotEqualTo(item2);

      assertThat(item1.getWidthMm()).isEqualTo(100);
      assertThat(item1.getHeightMm()).isEqualTo(200);
    }

    @Test
    @DisplayName("Deve instanciar construtor padrão protegido do JPA")
    void shouldSupportNoArgConstructor() throws Exception {
      java.lang.reflect.Constructor<PartSaleItem> constructor = PartSaleItem.class.getDeclaredConstructor();
      constructor.setAccessible(true);
      PartSaleItem item = constructor.newInstance();
      assertThat(item).isNotNull();
      assertThat(item.getDescription()).isEmpty();
      assertThat(item.getMaterialId()).isNull();
    }
  }
}

