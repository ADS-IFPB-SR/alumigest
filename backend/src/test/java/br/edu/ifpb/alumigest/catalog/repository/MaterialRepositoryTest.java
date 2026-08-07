package br.edu.ifpb.alumigest.catalog.repository;

import br.edu.ifpb.alumigest.catalog.domain.CalculationType;
import br.edu.ifpb.alumigest.catalog.domain.Material;
import br.edu.ifpb.alumigest.catalog.domain.MaterialGroup;
import br.edu.ifpb.alumigest.catalog.domain.UnitMeasure;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class MaterialRepositoryTest {

    @Autowired
    private MaterialRepository materialRepository;

    @Autowired
    private MaterialGroupRepository groupRepository;

    private MaterialGroup glassGroup;
    private MaterialGroup aluminumGroup;

    @BeforeEach
    void setUp() {
        glassGroup = groupRepository.save(new MaterialGroup(null, "VIDRO", "Vidros e Espelhos", CalculationType.SQUARE_METER, "Cálculo m²", true, true));
        aluminumGroup = groupRepository.save(new MaterialGroup(null, "ALUMINIO", "Perfis de Alumínio", CalculationType.LINEAR_METER, "Cálculo linear", true, true));
    }

    @Test
    @DisplayName("Deve persistir vidro 4mm com espessura e preço corretamente")
    void shouldPersistGlassWithThicknessAndPrices() {
        Material glass = new Material();
        glass.setGroup(glassGroup);
        glass.setName("Vidro Canelado 4mm");
        glass.setSkuCode("VID-CAN-4MM");
        glass.setCostPrice(new BigDecimal("45.00"));
        glass.setSalePrice(new BigDecimal("85.00"));
        glass.setUnitMeasure(UnitMeasure.M2);
        glass.setThicknessMm(new BigDecimal("4.00"));
        glass.setColorFinish("Incolor");
        glass.setActive(true);

        Material saved = materialRepository.save(glass);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getCreatedAt()).isNotNull();
        assertThat(saved.getUpdatedAt()).isNotNull();
        assertThat(saved.getGroup().getCode()).isEqualTo("VIDRO");
        assertThat(saved.getThicknessMm()).isEqualByComparingTo("4.00");
        assertThat(saved.getSalePrice()).isEqualByComparingTo("85.00");
    }

    @Test
    @DisplayName("Deve persistir perfil de alumínio com referência comercial SU-001 e barra de 6m")
    void shouldPersistAluminumProfileWithCommercialReference() {
        Material profile = new Material();
        profile.setGroup(aluminumGroup);
        profile.setName("Perfil Puxador Facetado");
        profile.setCommercialReference("SU-001");
        profile.setSkuCode("ALU-SU001-6M");
        profile.setNcmCode("7604.21.00");
        profile.setCostPrice(new BigDecimal("90.00"));
        profile.setSalePrice(new BigDecimal("160.00"));
        profile.setUnitMeasure(UnitMeasure.BARRA_6M);
        profile.setStandardLengthM(new BigDecimal("6.00"));
        profile.setColorFinish("Preto Fosco");
        profile.setActive(true);

        Material saved = materialRepository.save(profile);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getCommercialReference()).isEqualTo("SU-001");
        assertThat(saved.getStandardLengthM()).isEqualByComparingTo("6.00");
        assertThat(saved.getNcmCode()).isEqualTo("7604.21.00");
    }

    @Test
    @DisplayName("Deve buscar materiais por texto genérico (nome, referência comercial ou SKU)")
    void shouldSearchMaterialsByQuery() {
        Material m1 = new Material();
        m1.setGroup(aluminumGroup);
        m1.setName("Perfil Montante S83");
        m1.setCommercialReference("S83");
        m1.setCostPrice(new BigDecimal("50.00"));
        m1.setSalePrice(new BigDecimal("95.00"));
        m1.setUnitMeasure(UnitMeasure.BARRA_6M);
        m1.setActive(true);

        Material m2 = new Material();
        m2.setGroup(glassGroup);
        m2.setName("Vidro Temperado Fumê 8mm");
        m2.setCostPrice(new BigDecimal("80.00"));
        m2.setSalePrice(new BigDecimal("150.00"));
        m2.setUnitMeasure(UnitMeasure.M2);
        m2.setThicknessMm(new BigDecimal("8.00"));
        m2.setActive(true);

        materialRepository.saveAll(List.of(m1, m2));

        Page<Material> resultRef = materialRepository.searchActive("s83", PageRequest.of(0, 10));
        Page<Material> resultName = materialRepository.searchActive("fumê", PageRequest.of(0, 10));

        assertThat(resultRef.getContent()).hasSize(1);
        assertThat(resultRef.getContent().get(0).getCommercialReference()).isEqualTo("S83");

        assertThat(resultName.getContent()).hasSize(1);
        assertThat(resultName.getContent().get(0).getName()).contains("Fumê");
    }

    @Test
    @DisplayName("Deve filtrar materiais ativos por grupo")
    void shouldFilterActiveMaterialsByGroup() {
        Material m1 = new Material();
        m1.setGroup(glassGroup);
        m1.setName("Vidro Incolor 2mm Móvel");
        m1.setCostPrice(new BigDecimal("20.00"));
        m1.setSalePrice(new BigDecimal("40.00"));
        m1.setUnitMeasure(UnitMeasure.M2);
        m1.setThicknessMm(new BigDecimal("2.00"));
        m1.setActive(true);

        Material m2 = new Material();
        m2.setGroup(glassGroup);
        m2.setName("Vidro Inativo Antigo");
        m2.setCostPrice(new BigDecimal("10.00"));
        m2.setSalePrice(new BigDecimal("20.00"));
        m2.setUnitMeasure(UnitMeasure.M2);
        m2.setActive(false); // Inativo

        materialRepository.saveAll(List.of(m1, m2));

        List<Material> activeInGroup = materialRepository.findByGroupIdAndIsActiveTrue(glassGroup.getId());

        assertThat(activeInGroup).hasSize(1);
        assertThat(activeInGroup.get(0).getName()).isEqualTo("Vidro Incolor 2mm Móvel");
    }
}
