package br.edu.ifpb.alumigest.stock.domain;

import static org.assertj.core.api.Assertions.assertThat;

import br.edu.ifpb.alumigest.catalog.domain.CalculationType;
import br.edu.ifpb.alumigest.catalog.domain.Material;
import br.edu.ifpb.alumigest.catalog.domain.MaterialGroup;
import br.edu.ifpb.alumigest.catalog.domain.UnitMeasure;
import br.edu.ifpb.alumigest.catalog.repository.MaterialGroupRepository;
import br.edu.ifpb.alumigest.catalog.repository.MaterialRepository;
import br.edu.ifpb.alumigest.stock.controller.StockController;
import br.edu.ifpb.alumigest.stock.repository.StockItemRepository;
import br.edu.ifpb.alumigest.stock.repository.StockMovementRepository;
import br.edu.ifpb.alumigest.stock.service.StockService;
import jakarta.persistence.Column;
import jakarta.persistence.EntityManager;
import jakarta.persistence.JoinColumn;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import org.hibernate.annotations.Immutable;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PutMapping;

/**
 * Asserção de Imutabilidade (Append-Only) da trilha de auditoria Kardex (US-21.8).
 *
 * <p>Garante que a tabela {@code tb_stock_movements} e a entidade {@link StockMovement}
 * são estritamente imutáveis, impedindo exclusões, alterações retroativas ou updates.
 */
@SpringBootTest
@ActiveProfiles("test")
@DisplayName("StockMovementImmutabilityTest — Asserção de Imutabilidade e Append-Only do Kardex (US-21.8)")
class StockMovementImmutabilityTest {

    @Autowired
    private StockMovementRepository stockMovementRepository;

    @Autowired
    private StockItemRepository stockItemRepository;

    @Autowired
    private MaterialRepository materialRepository;

    @Autowired
    private MaterialGroupRepository materialGroupRepository;

    @Autowired
    private EntityManager entityManager;

    private final List<UUID> createdMaterialIds = new ArrayList<>();
    private final List<UUID> createdGroupIds = new ArrayList<>();

    @AfterEach
    void tearDown() {
        stockMovementRepository.deleteAll();
        stockItemRepository.deleteAll();
        createdMaterialIds.forEach(materialRepository::deleteById);
        createdGroupIds.forEach(materialGroupRepository::deleteById);
        createdMaterialIds.clear();
        createdGroupIds.clear();
    }

    private Material persistMaterial(String sku) {
        String code = "GRP-IMM-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        MaterialGroup group = new MaterialGroup(
            null,
            code,
            "Grupo Imutabilidade",
            CalculationType.SQUARE_METER,
            null,
            false,
            true
        );
        group = materialGroupRepository.saveAndFlush(group);
        createdGroupIds.add(group.getId());

        Material material = new Material();
        material.setGroup(group);
        material.setSkuCode(sku);
        material.setName("Perfil Imutável " + sku);
        material.setCostPrice(new BigDecimal("35.00"));
        material.setSalePrice(new BigDecimal("70.00"));
        material.setUnitMeasure(UnitMeasure.M2);
        material = materialRepository.saveAndFlush(material);
        createdMaterialIds.add(material.getId());

        StockItem stockItem = new StockItem(material);
        stockItem.addPhysical(new BigDecimal("50.0000"));
        stockItemRepository.saveAndFlush(stockItem);
        return material;
    }

    @Nested
    @DisplayName("1. Design Estrutural e Arquitetural (Reflection)")
    class StructuralDesignTests {

        @Test
        @DisplayName("A entidade StockMovement deve estar anotada com @Immutable do Hibernate")
        void entityMustBeAnnotatedWithHibernateImmutable() {
            assertThat(StockMovement.class.isAnnotationPresent(Immutable.class))
                .as("StockMovement deve possuir anotação @Immutable para instruir o Hibernate a nunca gerar SQL UPDATE")
                .isTrue();
        }

        @Test
        @DisplayName("A entidade StockMovement não deve possuir nenhum método setter (0 mutadores)")
        void entityMustNotDeclareAnySetterMethods() {
            List<Method> setters = Arrays.stream(StockMovement.class.getMethods())
                .filter(m -> m.getName().startsWith("set") && m.getParameterCount() == 1)
                .toList();

            assertThat(setters)
                .as("StockMovement deve ser append-only e não conter nenhum método setter público")
                .isEmpty();
        }

        @Test
        @DisplayName("Todos os campos mapeados com @Column devem ter updatable = false")
        void allColumnMappingsMustBeNonUpdatable() {
            Field[] fields = StockMovement.class.getDeclaredFields();
            for (Field field : fields) {
                Column column = field.getAnnotation(Column.class);
                if (column != null) {
                    assertThat(column.updatable())
                        .as("Campo '%s' em StockMovement deve ter updatable = false", field.getName())
                        .isFalse();
                }
            }
        }

        @Test
        @DisplayName("Todos os relacionamentos com @JoinColumn devem ter updatable = false")
        void allJoinColumnMappingsMustBeNonUpdatable() {
            Field[] fields = StockMovement.class.getDeclaredFields();
            for (Field field : fields) {
                JoinColumn joinColumn = field.getAnnotation(JoinColumn.class);
                if (joinColumn != null) {
                    assertThat(joinColumn.updatable())
                        .as("Relacionamento '%s' em StockMovement deve ter updatable = false", field.getName())
                        .isFalse();
                }
            }
        }

        @Test
        @DisplayName("O StockController não deve expor endpoints DELETE, PUT ou PATCH de movimentações")
        void controllerMustNotExposeDeleteOrUpdateEndpointsForMovements() {
            Method[] methods = StockController.class.getDeclaredMethods();
            for (Method method : methods) {
                assertThat(method.isAnnotationPresent(DeleteMapping.class))
                    .as("StockController não pode possuir operações HTTP DELETE (natureza append-only)")
                    .isFalse();
                assertThat(method.isAnnotationPresent(PutMapping.class))
                    .as("StockController não pode possuir operações HTTP PUT para alteração retroativa")
                    .isFalse();
                assertThat(method.isAnnotationPresent(PatchMapping.class))
                    .as("StockController não pode possuir operações HTTP PATCH para alteração retroativa")
                    .isFalse();
            }
        }

        @Test
        @DisplayName("O StockService não deve declarar métodos públicos de exclusão ou edição de movimentações")
        void serviceMustNotDeclareDeleteOrUpdateMethodsForMovements() {
            List<Method> mutatingMethods = Arrays.stream(StockService.class.getDeclaredMethods())
                .filter(m -> Modifier.isPublic(m.getModifiers()))
                .filter(m -> {
                    String name = m.getName().toLowerCase();
                    return name.contains("deletemovement")
                        || name.contains("removemovement")
                        || name.contains("updatemovement")
                        || name.contains("editmovement");
                })
                .toList();

            assertThat(mutatingMethods)
                .as("StockService não pode expor métodos de remoção ou edição retroativa de movimentações Kardex")
                .isEmpty();
        }
    }

    @Nested
    @DisplayName("2. Integridade de Persistência no Banco de Dados (JPA)")
    class DatabasePersistenceTests {

        @Test
        @DisplayName("Tentativa de alteração retroativa via flush não deve atualizar colunas imutáveis no banco de dados")
        void retroactiveModificationAttemptMustNotAlterDatabaseRecord() throws Exception {
            Material material = persistMaterial("IMM-01");
            StockItem stockItem = stockItemRepository.findByMaterialId(material.getId()).orElseThrow();

            StockMovement original = StockMovement.builder()
                .stockItem(stockItem)
                .material(material)
                .type(StockMovementType.PURCHASE_ENTRY)
                .quantity(new BigDecimal("20.0000"))
                .unitCost(new BigDecimal("35.00"))
                .previousPhysicalQuantity(new BigDecimal("30.0000"))
                .newPhysicalQuantity(new BigDecimal("50.0000"))
                .previousReservedQuantity(BigDecimal.ZERO)
                .newReservedQuantity(BigDecimal.ZERO)
                .referenceDocument("NF-ORIGINAL-123")
                .reason("Entrada de estoque inicial")
                .registeredBy("operador.auditoria")
                .build();

            StockMovement persisted = stockMovementRepository.saveAndFlush(original);
            UUID movementId = persisted.getId();

            entityManager.clear();

            // Simula tentativa de fraude ou alteração retroativa via Reflection na entidade
            StockMovement loaded = stockMovementRepository.findById(movementId).orElseThrow();
            Field quantityField = StockMovement.class.getDeclaredField("quantity");
            quantityField.setAccessible(true);
            quantityField.set(loaded, new BigDecimal("9999.0000"));

            Field reasonField = StockMovement.class.getDeclaredField("reason");
            reasonField.setAccessible(true);
            reasonField.set(loaded, "ALTERACAO_RETROATIVA_NAO_AUTORIZADA");

            // Tenta salvar e dar flush da entidade manipulada
            stockMovementRepository.saveAndFlush(loaded);
            entityManager.clear();

            // Recarrega o registro diretamente do banco de dados
            StockMovement reloaded = stockMovementRepository.findById(movementId).orElseThrow();

            // Assegura que o registro no banco permaneceu idêntico ao original (append-only mantido)
            assertThat(reloaded.getQuantity())
                .as("A quantidade no Kardex não pode ter sido modificada retroativamente")
                .isEqualByComparingTo("20.0000");

            assertThat(reloaded.getReason())
                .as("A justificativa no Kardex não pode ter sido modificada retroativamente")
                .isEqualTo("Entrada de estoque inicial");

            assertThat(reloaded.getReferenceDocument())
                .isEqualTo("NF-ORIGINAL-123");

            assertThat(reloaded.getNewPhysicalQuantity())
                .isEqualByComparingTo("50.0000");
        }

        @Test
        @DisplayName("Trilha Kardex deve ser append-only com contagem de registros monotonicamente crescente")
        void kardexAuditTrailMustGrowMonotonically() {
            Material material = persistMaterial("IMM-02");
            StockItem stockItem = stockItemRepository.findByMaterialId(material.getId()).orElseThrow();

            long initialCount = stockMovementRepository.count();

            StockMovement movement1 = StockMovement.builder()
                .stockItem(stockItem)
                .material(material)
                .type(StockMovementType.PURCHASE_ENTRY)
                .quantity(new BigDecimal("10.0000"))
                .previousPhysicalQuantity(new BigDecimal("50.0000"))
                .newPhysicalQuantity(new BigDecimal("60.0000"))
                .previousReservedQuantity(BigDecimal.ZERO)
                .newReservedQuantity(BigDecimal.ZERO)
                .referenceDocument("DOC-1")
                .reason("Entrada 1")
                .registeredBy("operador.kardex")
                .build();
            stockMovementRepository.saveAndFlush(movement1);

            assertThat(stockMovementRepository.count()).isEqualTo(initialCount + 1);

            StockMovement movement2 = StockMovement.builder()
                .stockItem(stockItem)
                .material(material)
                .type(StockMovementType.PRODUCTION_RESERVATION)
                .quantity(new BigDecimal("5.0000"))
                .previousPhysicalQuantity(new BigDecimal("60.0000"))
                .newPhysicalQuantity(new BigDecimal("60.0000"))
                .previousReservedQuantity(BigDecimal.ZERO)
                .newReservedQuantity(new BigDecimal("5.0000"))
                .referenceDocument("OS-001")
                .reason("Reserva 1")
                .registeredBy("operador.kardex")
                .build();
            stockMovementRepository.saveAndFlush(movement2);

            assertThat(stockMovementRepository.count()).isEqualTo(initialCount + 2);
        }
    }
}

