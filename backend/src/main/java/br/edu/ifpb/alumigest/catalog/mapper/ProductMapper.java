package br.edu.ifpb.alumigest.catalog.mapper;

import br.edu.ifpb.alumigest.catalog.domain.*;
import br.edu.ifpb.alumigest.catalog.dto.*;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "categoryName", source = "category.name")
    @Mapping(target = "isActive", source = "active")
    ProductResponseDTO toResponse(Product product);

    @Mapping(target = "materialId", source = "material.id")
    @Mapping(target = "materialName", source = "material.name")
    ProductItemResponseDTO toItemResponse(ProductItem item);

    TemplateConfigDTO toTemplateConfigDTO(TemplateConfig config);

    TemplateConfig toTemplateConfig(TemplateConfigDTO dto);

    HandleConfigDTO toHandleConfigDTO(HandleConfig config);

    HandleConfig toHandleConfig(HandleConfigDTO dto);

    DrillingConfigDTO toDrillingConfigDTO(DrillingConfig config);

    DrillingConfig toDrillingConfig(DrillingConfigDTO dto);

    TemplateOptionSchemaDTO toOptionSchemaDTO(TemplateOptionSchema schema);

    TemplateOptionSchema toOptionSchema(TemplateOptionSchemaDTO dto);
}