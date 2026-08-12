package br.edu.ifpb.alumigest.catalog.mapper;

import br.edu.ifpb.alumigest.catalog.domain.Material;
import br.edu.ifpb.alumigest.catalog.domain.UnitMeasure;
import br.edu.ifpb.alumigest.catalog.dto.AluminumProfileRequestDTO;
import br.edu.ifpb.alumigest.catalog.dto.AluminumProfileResponseDTO;
import org.springframework.stereotype.Component;

@Component
public class AluminumProfileMapper {

    public Material toEntity(AluminumProfileRequestDTO request) {
        if (request == null) {
            return null;
        }
        Material material = new Material();
        material.setName(request.name());
        material.setCommercialReference(request.commercialReference());
        material.setNcmCode(request.ncmCode());
        material.setColorFinish(request.colorFinish());
        material.setStandardLengthM(request.standardLengthM());
        material.setUnitMeasure(UnitMeasure.METRO);
        material.setCostPrice(request.costPrice());
        material.setSalePrice(request.salePrice());
        return material;
    }

    public AluminumProfileResponseDTO toResponse(Material material) {
        if (material == null) {
            return null;
        }
        return new AluminumProfileResponseDTO(
                material.getId(),
                material.getName(),
                material.getCommercialReference(),
                material.getNcmCode(),
                material.getColorFinish(),
                material.getStandardLengthM(),
                material.getUnitMeasure(),
                material.getCostPrice(),
                material.getSalePrice(),
                material.isActive(),
                material.getCreatedAt(),
                material.getUpdatedAt()
        );
    }
}
