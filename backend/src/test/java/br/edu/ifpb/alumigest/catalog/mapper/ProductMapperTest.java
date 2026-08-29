package br.edu.ifpb.alumigest.catalog.mapper;

import br.edu.ifpb.alumigest.catalog.domain.*;
import br.edu.ifpb.alumigest.catalog.dto.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class ProductMapperTest {

    private final ProductMapper mapper = Mappers.getMapper(ProductMapper.class);

    @Test
    @DisplayName("Deve mapear Product para ProductResponseDTO incluindo templateConfig e categoryRequirements")
    void toResponse_ShouldMapAllFields() {
        ProductCategory category = new ProductCategory();
        category.setId(UUID.randomUUID());
        category.setName("Portas de Correr");

        TemplateConfig config = new TemplateConfig();
        config.setProfileMm(new BigDecimal("20.0"));
        config.setAluminumColor("#212121");
        config.setGlassColor("#e3f2fd");
        config.setOpeningDirection(OpeningDirection.LEFT_TO_RIGHT);
        config.setSlidingMode(SlidingMode.BOTH_SLIDING);
        config.setHandleConfig(new HandleConfig(HandleType.SHELL_LOCK, HandlePosition.RIGHT, new BigDecimal("150.0"), null));
        config.setDrillingConfig(new DrillingConfig(HoleDrillingMode.EQUAL, 2, List.of()));

        TemplateOptionSchema schema = new TemplateOptionSchema();
        schema.setAllowSlidingMode(true);
        schema.setAllowedSlidingModes(List.of(SlidingMode.BOTH_SLIDING, SlidingMode.LEFT_FIXED_RIGHT_SLIDING));
        config.setOptionSchema(schema);

        Product product = new Product();
        product.setId(UUID.randomUUID());
        product.setName("Porta Suprema 2F");
        product.setCategory(category);
        product.setLaborCost(new BigDecimal("250.00"));
        product.setTemplateType(DoorTemplateType.CORRER);
        product.setTemplateConfig(config);
        product.setCategoryRequirements(List.of(MaterialCategoryType.GLASS, MaterialCategoryType.PROFILE, MaterialCategoryType.ROLLERS));
        product.setActive(true);

        ProductResponseDTO response = mapper.toResponse(product);

        assertNotNull(response);
        assertEquals(product.getId(), response.id());
        assertEquals("Porta Suprema 2F", response.name());
        assertEquals(category.getId(), response.categoryId());
        assertEquals("Portas de Correr", response.categoryName());
        assertEquals(DoorTemplateType.CORRER, response.templateType());
        assertNotNull(response.templateConfig());
        assertEquals(new BigDecimal("20.0"), response.templateConfig().profileMm());
        assertEquals("#212121", response.templateConfig().aluminumColor());
        assertEquals(OpeningDirection.LEFT_TO_RIGHT, response.templateConfig().openingDirection());
        assertEquals(SlidingMode.BOTH_SLIDING, response.templateConfig().slidingMode());
        assertNotNull(response.templateConfig().handleConfig());
        assertEquals(HandleType.SHELL_LOCK, response.templateConfig().handleConfig().handleType());
        assertNotNull(response.templateConfig().optionSchema());
        assertTrue(response.templateConfig().optionSchema().allowSlidingMode());
        assertEquals(2, response.templateConfig().optionSchema().allowedSlidingModes().size());
        assertEquals(3, response.categoryRequirements().size());
    }

    @Test
    @DisplayName("Deve mapear TemplateConfigDTO para TemplateConfig e vice-versa")
    void toTemplateConfig_ShouldMapBidirectionally() {
        TemplateConfigDTO dto = new TemplateConfigDTO(
                new BigDecimal("45.0"),
                "#8C6239",
                "#595959",
                OpeningDirection.RIGHT_TO_LEFT,
                null,
                new HandleConfigDTO(HandleType.BAR_TUBULAR, HandlePosition.LEFT, new BigDecimal("300.0"), new BigDecimal("100.0")),
                new DrillingConfigDTO(HoleDrillingMode.CUSTOM, null, List.of(new BigDecimal("100.0"), new BigDecimal("500.0"))),
                new TemplateOptionSchemaDTO(false, List.of(), true, List.of(OpeningDirection.RIGHT_TO_LEFT),
                        true, List.of(HandleType.BAR_TUBULAR), List.of(HandlePosition.LEFT),
                        true, List.of(HoleDrillingMode.CUSTOM), List.of("#8C6239"), List.of("#595959"))
        );

        TemplateConfig entity = mapper.toTemplateConfig(dto);

        assertNotNull(entity);
        assertEquals(new BigDecimal("45.0"), entity.getProfileMm());
        assertEquals("#8C6239", entity.getAluminumColor());
        assertEquals(OpeningDirection.RIGHT_TO_LEFT, entity.getOpeningDirection());
        assertNotNull(entity.getHandleConfig());
        assertEquals(HandleType.BAR_TUBULAR, entity.getHandleConfig().getHandleType());
        assertNotNull(entity.getDrillingConfig());
        assertEquals(HoleDrillingMode.CUSTOM, entity.getDrillingConfig().getMode());
        assertEquals(2, entity.getDrillingConfig().getCustomDistancesMm().size());
        assertNotNull(entity.getOptionSchema());
        assertFalse(entity.getOptionSchema().isAllowSlidingMode());

        TemplateConfigDTO mappedBack = mapper.toTemplateConfigDTO(entity);
        assertNotNull(mappedBack);
        assertEquals(dto.profileMm(), mappedBack.profileMm());
        assertEquals(dto.aluminumColor(), mappedBack.aluminumColor());
    }
}
