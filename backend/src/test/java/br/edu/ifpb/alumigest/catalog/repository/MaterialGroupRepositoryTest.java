package br.edu.ifpb.alumigest.catalog.repository;

import br.edu.ifpb.alumigest.catalog.domain.CalculationType;
import br.edu.ifpb.alumigest.catalog.domain.MaterialGroup;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class MaterialGroupRepositoryTest {

    @Autowired
    private MaterialGroupRepository groupRepository;

    @Test
    @DisplayName("Deve persistir e buscar grupo de materiais por código ignorando case")
    void shouldPersistAndFindByCodeIgnoreCase() {
        MaterialGroup group = new MaterialGroup();
        group.setCode("VIDRO");
        group.setName("Vidros e Espelhos");
        group.setCalculationType(CalculationType.SQUARE_METER);
        group.setDescription("Vidros calculados por m²");
        group.setSystemDefault(true);
        group.setActive(true);

        groupRepository.save(group);

        Optional<MaterialGroup> found = groupRepository.findByCodeIgnoreCase("vidro");

        assertThat(found).isPresent();
        assertThat(found.get().getId()).isNotNull();
        assertThat(found.get().getName()).isEqualTo("Vidros e Espelhos");
        assertThat(found.get().getCalculationType()).isEqualTo(CalculationType.SQUARE_METER);
        assertThat(found.get().isSystemDefault()).isTrue();
        assertThat(found.get().getCreatedAt()).isNotNull();
    }

    @Test
    @DisplayName("Deve listar apenas grupos ativos ordenados alfabeticamente")
    void shouldListOnlyActiveGroupsOrderByName() {
        MaterialGroup g1 = new MaterialGroup(null, "ALUMINIO", "Perfis de Alumínio", CalculationType.LINEAR_METER, null, true, true);
        MaterialGroup g2 = new MaterialGroup(null, "VIDRO", "Vidros", CalculationType.SQUARE_METER, null, true, true);
        MaterialGroup g3 = new MaterialGroup(null, "INATIVO", "Grupo Inativo", CalculationType.UNIT, null, false, false);

        groupRepository.saveAll(List.of(g1, g2, g3));

        List<MaterialGroup> activeGroups = groupRepository.findByIsActiveTrueOrderByNameAsc();

        assertThat(activeGroups).hasSize(2);
        assertThat(activeGroups.get(0).getName()).isEqualTo("Perfis de Alumínio");
        assertThat(activeGroups.get(1).getName()).isEqualTo("Vidros");
    }

    @Test
    @DisplayName("Deve permitir criação de grupo para novo setor (ex: Marcenaria / MDF) sem violar regras")
    void shouldSupportExtensibilityForNewSectorsLikeCarpentry() {
        MaterialGroup mdfGroup = new MaterialGroup(null, "MDF", "Chapas de MDF e Marcenaria", CalculationType.SQUARE_METER, "Cálculo por área de chapa", false, true);

        MaterialGroup saved = groupRepository.save(mdfGroup);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.isSystemDefault()).isFalse();
        assertThat(groupRepository.existsByCodeIgnoreCase("MDF")).isTrue();
    }
}
