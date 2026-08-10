package br.edu.ifpb.alumigest.catalog.mapper;

import br.edu.ifpb.alumigest.catalog.domain.Material;
import br.edu.ifpb.alumigest.catalog.dto.FilmRequestDTO;
import br.edu.ifpb.alumigest.catalog.dto.FilmResponseDTO;
import java.math.BigDecimal;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-08-10T15:31:36-0300",
    comments = "version: 1.6.3, compiler: javac, environment: Java 21.0.12 (Arch Linux)"
)
@Component
public class FilmMapperImpl implements FilmMapper {

    @Override
    public Material toEntity(FilmRequestDTO dto) {
        if ( dto == null ) {
            return null;
        }

        Material material = new Material();

        material.setCommercialReference( dto.commercialReference() );
        material.setNcmCode( dto.ncmCode() );
        material.setName( dto.name() );
        material.setCostPrice( dto.costPrice() );
        material.setSalePrice( dto.salePrice() );
        material.setThicknessMm( dto.thicknessMm() );
        material.setColorFinish( dto.colorFinish() );
        material.setStandardLengthM( dto.standardLengthM() );

        return material;
    }

    @Override
    public FilmResponseDTO toResponse(Material material) {
        if ( material == null ) {
            return null;
        }

        UUID id = null;
        String name = null;
        String colorFinish = null;
        BigDecimal salePrice = null;
        String unitMeasure = null;

        id = material.getId();
        name = material.getName();
        colorFinish = material.getColorFinish();
        salePrice = material.getSalePrice();
        if ( material.getUnitMeasure() != null ) {
            unitMeasure = material.getUnitMeasure().name();
        }

        FilmResponseDTO filmResponseDTO = new FilmResponseDTO( id, name, colorFinish, salePrice, unitMeasure );

        return filmResponseDTO;
    }
}
