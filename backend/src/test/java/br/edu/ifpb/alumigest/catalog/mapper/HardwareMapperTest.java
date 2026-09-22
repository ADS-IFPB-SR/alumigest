package br.edu.ifpb.alumigest.catalog.mapper;

import br.edu.ifpb.alumigest.catalog.domain.CalculationType;
import br.edu.ifpb.alumigest.catalog.domain.Material;
import br.edu.ifpb.alumigest.catalog.domain.UnitMeasure;
import br.edu.ifpb.alumigest.catalog.dto.HardwareRequestDTO;
import br.edu.ifpb.alumigest.catalog.dto.HardwareResponseDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("HardwareMapper — Testes Unitários de Mapeamento")
class HardwareMapperTest {

    private HardwareMapper mapper;

    @BeforeEach
    void setUp() {
        mapper = new HardwareMapper();
    }

    @Nested
    @DisplayName("Conversão toEntity (RequestDTO ➔ Material)")
    class ToEntityTests {

        @Test
        @DisplayName("[Técnica: Classes de Equivalência - Entrada Nula] Deve retornar null quando request for nulo")
        void shouldReturnNullWhenRequestIsNull() {
            Material result = mapper.toEntity(null);
            assertThat(result).isNull();
        }

        @Test
        @DisplayName("[Técnica: Classes de Equivalência - Entrada Completa] Deve mapear todos os campos e serializar CalculationType")
        void shouldMapFullRequestToEntity() {
            // Given (Arrange) - Ordem: sku, name, unit, calcType, costPrice, salePrice, ncm, family, isHandle
            HardwareRequestDTO request = new HardwareRequestDTO(
                    "FER-DOBR-01",
                    "Dobradiça Pivotante Inox",
                    UnitMeasure.PAR,
                    CalculationType.LINEAR_METER,
                    new BigDecimal("15.50"),
                    new BigDecimal("35.00"),
                    "83024100",
                    "FAM-FERRAGEM-PORTA",
                    true
            );

            // When (Act)
            Material material = mapper.toEntity(request);

            // Then (Assert)
            assertThat(material).isNotNull();
            assertThat(material.getSkuCode()).isEqualTo("FER-DOBR-01");
            assertThat(material.getName()).isEqualTo("Dobradiça Pivotante Inox");
            assertThat(material.getUnitMeasure()).isEqualTo(UnitMeasure.PAR);
            assertThat(material.getCostPrice()).isEqualByComparingTo(new BigDecimal("15.50"));
            assertThat(material.getSalePrice()).isEqualByComparingTo(new BigDecimal("35.00"));
            assertThat(material.getNcmCode()).isEqualTo("83024100");
            assertThat(material.getFamilyCode()).isEqualTo("FAM-FERRAGEM-PORTA");
            assertThat(material.isHandle()).isTrue();
            assertThat(material.getAttributesJson()).contains("\"calculationType\":\"LINEAR_METER\"");
        }

        @Test
        @DisplayName("[Técnica: Teste de Caminhos - isHandle Nulo] Deve manter valor padrão quando isHandle for nulo no request")
        void shouldHandleNullIsHandleInRequest() {
            // Given (Arrange)
            HardwareRequestDTO request = new HardwareRequestDTO(
                    "FER-FECH-02",
                    "Fechadura Simples",
                    UnitMeasure.UN,
                    CalculationType.UNIT,
                    new BigDecimal("20.00"),
                    new BigDecimal("50.00"),
                    "83014000",
                    null,
                    null // isHandle nulo
            );

            // When (Act)
            Material material = mapper.toEntity(request);

            // Then (Assert)
            assertThat(material).isNotNull();
            assertThat(material.isHandle()).isFalse(); // default boolean
            assertThat(material.getAttributesJson()).contains("\"calculationType\":\"UNIT\"");
        }
    }

    @Nested
    @DisplayName("Conversão toResponse (Material ➔ ResponseDTO)")
    class ToResponseTests {

        @Test
        @DisplayName("[Técnica: Classes de Equivalência - Entrada Nula] Deve retornar null quando material for nulo")
        void shouldReturnNullWhenMaterialIsNull() {
            HardwareResponseDTO response = mapper.toResponse(null);
            assertThat(response).isNull();
        }

        @Test
        @DisplayName("[Técnica: Classes de Equivalência - Projeção Completa] Deve projetar todos os campos do material na resposta")
        void shouldMapMaterialToResponseDTO() {
            // Given (Arrange)
            UUID id = UUID.randomUUID();
            Material material = new Material();
            material.setId(id);
            material.setSkuCode("FER-PUX-01");
            material.setName("Puxador Barra Tubular 40cm");
            material.setUnitMeasure(UnitMeasure.UN);
            material.setAttributesJson("{\"calculationType\":\"UNIT\"}");
            material.setNcmCode("83024200");
            material.setCostPrice(new BigDecimal("45.00"));
            material.setSalePrice(new BigDecimal("90.00"));
            material.setActive(true);
            material.setCreatedAt(OffsetDateTime.now());
            material.setUpdatedAt(OffsetDateTime.now());
            material.setFamilyCode("FAM-PUXADOR");
            material.setHandle(true);

            // When (Act)
            HardwareResponseDTO response = mapper.toResponse(material);

            // Then (Assert)
            assertThat(response).isNotNull();
            assertThat(response.id()).isEqualTo(id);
            assertThat(response.skuCode()).isEqualTo("FER-PUX-01");
            assertThat(response.name()).isEqualTo("Puxador Barra Tubular 40cm");
            assertThat(response.unitMeasure()).isEqualTo(UnitMeasure.UN);
            assertThat(response.calculationType()).isEqualTo(CalculationType.UNIT);
            assertThat(response.costPrice()).isEqualByComparingTo(new BigDecimal("45.00"));
            assertThat(response.salePrice()).isEqualByComparingTo(new BigDecimal("90.00"));
            assertThat(response.active()).isTrue();
            assertThat(response.familyCode()).isEqualTo("FAM-PUXADOR");
            assertThat(response.isHandle()).isTrue();
        }
    }

    @Nested
    @DisplayName("Serialização e Desserialização de AttributesJson (Caminhos e Ramos)")
    class AttributesJsonTests {

        @Test
        @DisplayName("[Técnica: Teste de Caminhos] buildAttributesJson deve retornar null quando CalculationType for nulo")
        void shouldReturnNullWhenCalculationTypeIsNull() {
            String json = mapper.buildAttributesJson(null);
            assertThat(json).isNull();
        }

        @Test
        @DisplayName("[Técnica: Teste de Caminhos] extractCalculationType deve retornar UNIT quando attributesJson for nulo ou vazio")
        void shouldReturnUnitWhenAttributesJsonIsNullOrEmpty() {
            assertThat(mapper.toResponse(createMaterialWithJson(null)).calculationType())
                    .isEqualTo(CalculationType.UNIT);

            assertThat(mapper.toResponse(createMaterialWithJson("   ")).calculationType())
                    .isEqualTo(CalculationType.UNIT);
        }

        @Test
        @DisplayName("[Técnica: Teste de Caminhos] extractCalculationType deve retornar UNIT quando attributesJson não casar nenhum tipo")
        void shouldReturnUnitWhenNoMatchingCalculationTypeFound() {
            Material material = createMaterialWithJson("{\"otherField\":\"someValue\"}");
            HardwareResponseDTO response = mapper.toResponse(material);

            assertThat(response.calculationType()).isEqualTo(CalculationType.UNIT);
        }

        private Material createMaterialWithJson(String json) {
            Material m = new Material();
            m.setId(UUID.randomUUID());
            m.setSkuCode("TEST-01");
            m.setName("Material Teste");
            m.setUnitMeasure(UnitMeasure.UN);
            m.setAttributesJson(json);
            return m;
        }
    }
}
