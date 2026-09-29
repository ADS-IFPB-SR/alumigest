package br.edu.ifpb.alumigest.catalog.mapper;

import br.edu.ifpb.alumigest.catalog.domain.Material;
import br.edu.ifpb.alumigest.catalog.domain.UnitMeasure;
import br.edu.ifpb.alumigest.catalog.dto.FilmRequestDTO;
import br.edu.ifpb.alumigest.catalog.dto.FilmResponseDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("FilmMapper — Testes Unitários de Mapeamento MapStruct")
class FilmMapperTest {

    private FilmMapper mapper;

    @BeforeEach
    void setUp() {
        mapper = new FilmMapperImpl();
    }

    @Nested
    @DisplayName("Conversão toEntity (FilmRequestDTO ➔ Material)")
    class ToEntityTests {

        @Test
        @DisplayName("[Técnica: Classes de Equivalência - Entrada Nula] Deve retornar null quando DTO for nulo")
        void shouldReturnNullWhenDtoIsNull() {
            Material material = mapper.toEntity(null);
            assertThat(material).isNull();
        }

        @Test
        @DisplayName("[Técnica: Classes de Equivalência - DTO Válido] Deve mapear propriedades de FilmRequestDTO para Material")
        void shouldMapDtoToEntity() {
            // Given (Arrange) - Ordem correta: name, colorFinish, salePrice, commercialRef, ncm, costPrice, thickness, length, maxWidth, familyCode
            FilmRequestDTO dto = new FilmRequestDTO(
                    "Película Jateada 2m",
                    "Jateada",
                    new BigDecimal("80.00"),
                    "PEL-JAT-01",
                    "39199090",
                    new BigDecimal("35.00"),
                    new BigDecimal("0.10"),
                    new BigDecimal("30.00"),
                    new BigDecimal("1500"),
                    "FAM-PELICULA"
            );

            // When (Act)
            Material entity = mapper.toEntity(dto);

            // Then (Assert)
            assertThat(entity).isNotNull();
            assertThat(entity.getName()).isEqualTo("Película Jateada 2m");
            assertThat(entity.getCommercialReference()).isEqualTo("PEL-JAT-01");
            assertThat(entity.getColorFinish()).isEqualTo("Jateada");
            assertThat(entity.getCostPrice()).isEqualByComparingTo(new BigDecimal("35.00"));
            assertThat(entity.getSalePrice()).isEqualByComparingTo(new BigDecimal("80.00"));
            assertThat(entity.getNcmCode()).isEqualTo("39199090");
            assertThat(entity.getThicknessMm()).isEqualByComparingTo(new BigDecimal("0.10"));
            assertThat(entity.getStandardLengthM()).isEqualByComparingTo(new BigDecimal("30.00"));
            assertThat(entity.getMaxWidthMm()).isEqualByComparingTo(new BigDecimal("1500"));
            assertThat(entity.getFamilyCode()).isEqualTo("FAM-PELICULA");
        }
    }

    @Nested
    @DisplayName("Conversão toResponse (Material ➔ FilmResponseDTO)")
    class ToResponseTests {

        @Test
        @DisplayName("[Técnica: Classes de Equivalência - Entrada Nula] Deve retornar null quando Material for nulo")
        void shouldReturnNullWhenMaterialIsNull() {
            FilmResponseDTO response = mapper.toResponse(null);
            assertThat(response).isNull();
        }

        @Test
        @DisplayName("[Técnica: Classes de Equivalência - Entidade Completa] Deve projetar todos os campos na resposta")
        void shouldMapMaterialToResponseDto() {
            // Given (Arrange)
            UUID id = UUID.randomUUID();
            Material material = new Material();
            material.setId(id);
            material.setName("Película Fumê 100%");
            material.setCommercialReference("PEL-FUME-01");
            material.setColorFinish("Fumê");
            material.setCostPrice(new BigDecimal("25.00"));
            material.setSalePrice(new BigDecimal("60.00"));
            material.setNcmCode("39199090");
            material.setThicknessMm(new BigDecimal("0.05"));
            material.setStandardLengthM(new BigDecimal("50.00"));
            material.setMaxWidthMm(new BigDecimal("1200"));
            material.setFamilyCode("FAM-PELICULA");
            material.setUnitMeasure(UnitMeasure.M2);
            material.setActive(true);
            material.setCreatedAt(OffsetDateTime.now());
            material.setUpdatedAt(OffsetDateTime.now());

            // When (Act)
            FilmResponseDTO response = mapper.toResponse(material);

            // Then (Assert)
            assertThat(response).isNotNull();
            assertThat(response.id()).isEqualTo(id);
            assertThat(response.name()).isEqualTo("Película Fumê 100%");
            assertThat(response.commercialReference()).isEqualTo("PEL-FUME-01");
            assertThat(response.colorFinish()).isEqualTo("Fumê");
            assertThat(response.costPrice()).isEqualByComparingTo(new BigDecimal("25.00"));
            assertThat(response.salePrice()).isEqualByComparingTo(new BigDecimal("60.00"));
            assertThat(response.unitMeasure()).isEqualTo("M2");
            assertThat(response.active()).isTrue();
        }

        @Test
        @DisplayName("[Técnica: Teste de Caminhos - UnitMeasure Nula] Deve tolerar UnitMeasure nula sem disparar NullPointerException")
        void shouldHandleNullUnitMeasureGracefully() {
            // Given (Arrange)
            Material material = new Material();
            material.setId(UUID.randomUUID());
            material.setName("Película sem Unidade");
            material.setUnitMeasure(null);

            // When (Act)
            FilmResponseDTO response = mapper.toResponse(material);

            // Then (Assert)
            assertThat(response).isNotNull();
            assertThat(response.unitMeasure()).isNull();
        }
    }
}
