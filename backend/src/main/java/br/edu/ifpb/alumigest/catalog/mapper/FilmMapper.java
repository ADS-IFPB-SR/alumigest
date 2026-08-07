package br.edu.ifpb.alumigest.catalog.mapper;

import br.edu.ifpb.alumigest.catalog.dto.FilmRequestDTO;
import br.edu.ifpb.alumigest.catalog.dto.FilmResponseDTO;
import br.edu.ifpb.alumigest.catalog.domain.Material;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface FilmMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "group", ignore = true)
    @Mapping(target = "unitMeasure", ignore = true)
    @Mapping(target = "active", ignore = true)
    @Mapping(target = "attributesJson", ignore = true)
    Material toEntity(FilmRequestDTO dto);

    FilmResponseDTO toResponse(Material material);

}