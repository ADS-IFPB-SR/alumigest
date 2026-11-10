package br.edu.ifpb.alumigest.catalog.controller;

import br.edu.ifpb.alumigest.catalog.domain.Material;
import br.edu.ifpb.alumigest.catalog.domain.UnitMeasure;
import br.edu.ifpb.alumigest.catalog.repository.MaterialRepository;
import br.edu.ifpb.alumigest.common.exception.GlobalExceptionHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
@DisplayName("MaterialController — Testes de Integração Web (MockMvc)")
class MaterialControllerTest {

    private MockMvc mockMvc;

    @Mock
    private MaterialRepository repository;

    @InjectMocks
    private MaterialController controller;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Nested
    @DisplayName("Listagem Unificada de Materiais Ativos (GET /api/v1/catalog/materials)")
    class FindAllActiveTests {

        @Test
        @DisplayName("[Técnica: Classes de Equivalência - Filtro Ativos/Inativos] Deve retornar apenas materiais ativos e projetar DTO")
        void shouldReturnOnlyActiveMaterials() throws Exception {
            // Given (Arrange)
            Material activeMaterial = new Material();
            activeMaterial.setId(UUID.randomUUID());
            activeMaterial.setName("Perfil Alumínio Linha Suprema");
            activeMaterial.setSkuCode("ALU-SUP-01");
            activeMaterial.setCommercialReference("SUP-01");
            activeMaterial.setSalePrice(new BigDecimal("120.00"));
            activeMaterial.setCostPrice(new BigDecimal("60.00"));
            activeMaterial.setUnitMeasure(UnitMeasure.BARRA_6M);
            activeMaterial.setActive(true);
            activeMaterial.setHandle(false);

            Material inactiveMaterial = new Material();
            inactiveMaterial.setId(UUID.randomUUID());
            inactiveMaterial.setName("Vidro Inativo");
            inactiveMaterial.setActive(false);

            Material activeWithoutUnit = new Material();
            activeWithoutUnit.setId(UUID.randomUUID());
            activeWithoutUnit.setName("Acessório Especial");
            activeWithoutUnit.setActive(true);
            activeWithoutUnit.setUnitMeasure(null); // Testa branch unitMeasure == null -> ""
            activeWithoutUnit.setHandle(true);

            when(repository.findAll()).thenReturn(List.of(activeMaterial, inactiveMaterial, activeWithoutUnit));

            // When (Act) & Then (Assert)
            mockMvc.perform(get("/api/v1/catalog/materials"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.length()").value(2))
                    .andExpect(jsonPath("$.data[0].name").value("Perfil Alumínio Linha Suprema"))
                    .andExpect(jsonPath("$.data[0].unitMeasure").value("BARRA_6M"))
                    .andExpect(jsonPath("$.data[1].name").value("Acessório Especial"))
                    .andExpect(jsonPath("$.data[1].unitMeasure").value(""));

            verify(repository).findAll();
        }
    }

    @Nested
    @DisplayName("Listagem de Famílias (GET /api/v1/catalog/materials/families)")
    class GetDistinctFamiliesTests {

        @Test
        @DisplayName("[Técnica: Teste de Caminhos - Com GroupCode] Deve filtrar por código do grupo informado")
        void getDistinctFamilies_ShouldReturnListWithGroupCode() throws Exception {
            // Given (Arrange)
            when(repository.findDistinctFamilyCodesByGroupCode("VIDRO"))
                    .thenReturn(List.of("FAM-VIDRO-TEMP-8MM", "FAM-VIDRO-LAMINADO"));

            // When (Act) & Then (Assert)
            mockMvc.perform(get("/api/v1/catalog/materials/families")
                            .param("groupCode", "VIDRO"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data[0]").value("FAM-VIDRO-TEMP-8MM"))
                    .andExpect(jsonPath("$.data[1]").value("FAM-VIDRO-LAMINADO"));

            verify(repository).findDistinctFamilyCodesByGroupCode("VIDRO");
        }

        @Test
        @DisplayName("[Técnica: Teste de Caminhos - Sem GroupCode] Deve permitir consulta sem parâmetro de grupo (null)")
        void getDistinctFamilies_ShouldAllowNullGroupCode() throws Exception {
            // Given (Arrange)
            when(repository.findDistinctFamilyCodesByGroupCode(null))
                    .thenReturn(List.of("FAM-GERAL-01"));

            // When (Act) & Then (Assert)
            mockMvc.perform(get("/api/v1/catalog/materials/families"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data[0]").value("FAM-GERAL-01"));

            verify(repository).findDistinctFamilyCodesByGroupCode(null);
        }
    }

    @Nested
    @DisplayName("Listagem Filtrada por Categoria (GET /api/v1/materials?category=...)")
    class FindActiveByCategoryTests {

        @Test
        @DisplayName("[Partição de Equivalência] Deve retornar materiais filtrados por categoria válida (GLASS) via /api/v1/materials")
        void shouldReturnMaterialsFilteredByGlassCategory() throws Exception {
            // Given (Arrange)
            br.edu.ifpb.alumigest.catalog.domain.MaterialGroup glassGroup =
                    new br.edu.ifpb.alumigest.catalog.domain.MaterialGroup();
            glassGroup.setCode("VIDRO");
            glassGroup.setName("Vidros");

            Material glass = new Material();
            glass.setId(UUID.randomUUID());
            glass.setName("Vidro Temperado 8mm Incolor");
            glass.setGroup(glassGroup);
            glass.setSalePrice(new BigDecimal("180.00"));
            glass.setCostPrice(new BigDecimal("90.00"));
            glass.setUnitMeasure(UnitMeasure.M2);
            glass.setColorFinish("Incolor");
            glass.setThicknessMm(new BigDecimal("8.00"));
            glass.setFamilyCode("FAM-VIDRO-8MM");
            glass.setActive(true);

            when(repository.findActiveByGroupCodeOrderByNameAsc("VIDRO"))
                    .thenReturn(List.of(glass));

            // When (Act) & Then (Assert)
            mockMvc.perform(get("/api/v1/materials").param("category", "GLASS"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.length()").value(1))
                    .andExpect(jsonPath("$.data[0].id").value(glass.getId().toString()))
                    .andExpect(jsonPath("$.data[0].name").value("Vidro Temperado 8mm Incolor"))
                    .andExpect(jsonPath("$.data[0].category").value("GLASS"))
                    .andExpect(jsonPath("$.data[0].unitPrice").value(180.00))
                    .andExpect(jsonPath("$.data[0].unitOfMeasure").value("M2"))
                    .andExpect(jsonPath("$.data[0].color").value("Incolor"))
                    .andExpect(jsonPath("$.data[0].thicknessMm").value(8.00))
                    .andExpect(jsonPath("$.data[0].familyCode").value("FAM-VIDRO-8MM"));

            verify(repository).findActiveByGroupCodeOrderByNameAsc("VIDRO");
        }

        @Test
        @DisplayName("[Partição de Equivalência - Alias] Deve resolver alias ALUMINUM para o grupo ALUMINIO e retornar perfil")
        void shouldResolveAluminumAliasToProfileGroup() throws Exception {
            // Given (Arrange)
            br.edu.ifpb.alumigest.catalog.domain.MaterialGroup aluGroup =
                    new br.edu.ifpb.alumigest.catalog.domain.MaterialGroup();
            aluGroup.setCode("ALUMINIO");
            aluGroup.setName("Perfis de Alumínio");

            Material profile = new Material();
            profile.setId(UUID.randomUUID());
            profile.setName("Perfil U Linha Suprema");
            profile.setGroup(aluGroup);
            profile.setSalePrice(new BigDecimal("45.00"));
            profile.setUnitMeasure(UnitMeasure.METRO);
            profile.setColorFinish("Branco");
            profile.setActive(true);

            when(repository.findActiveByGroupCodeOrderByNameAsc("ALUMINIO"))
                    .thenReturn(List.of(profile));

            // When (Act) & Then (Assert)
            mockMvc.perform(get("/api/v1/materials").param("category", "ALUMINUM"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data[0].category").value("PROFILE"))
                    .andExpect(jsonPath("$.data[0].name").value("Perfil U Linha Suprema"));

            verify(repository).findActiveByGroupCodeOrderByNameAsc("ALUMINIO");
        }

        @Test
        @DisplayName("[Partição de Equivalência - Categoria Inválida] Deve retornar 400 Bad Request quando categoria for desconhecida")
        void shouldReturnBadRequestWhenCategoryIsInvalid() throws Exception {
            // When (Act) & Then (Assert)
            mockMvc.perform(get("/api/v1/materials").param("category", "CATEGORIA_INEXISTENTE"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Categoria de material inválida")));
        }
    }
}
