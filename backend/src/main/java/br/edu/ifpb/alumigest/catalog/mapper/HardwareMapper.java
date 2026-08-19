package br.edu.ifpb.alumigest.catalog.mapper;

import br.edu.ifpb.alumigest.catalog.domain.CalculationType;
import br.edu.ifpb.alumigest.catalog.domain.Material;
import br.edu.ifpb.alumigest.catalog.dto.HardwareRequestDTO;
import br.edu.ifpb.alumigest.catalog.dto.HardwareResponseDTO;
import org.springframework.stereotype.Component;

/**
 * Mapper manual para conversão entre {@link HardwareRequestDTO} / {@link Material}
 * e {@link HardwareResponseDTO}.
 *
 * <p>O tipo de cálculo ({@link CalculationType}) não possui coluna própria em {@code tb_materials};
 * ele é armazenado no campo {@code attributes_json} como metadado da ferragem
 * e lido de volta na projeção de resposta.</p>
 */
@Component
public class HardwareMapper {

    private static final String ATTR_CALCULATION_TYPE_KEY = "calculationType";

    /**
     * Converte o request de criação em uma instância de {@link Material}.
     * O grupo e o estado ativo ({@code isActive}) devem ser definidos pelo serviço chamador.
     */
    public Material toEntity(HardwareRequestDTO request) {
        if (request == null) {
            return null;
        }
        Material material = new Material();
        material.setSkuCode(request.skuCode());
        material.setName(request.name());
        material.setUnitMeasure(request.unitMeasure());
        material.setCostPrice(request.costPrice());
        material.setSalePrice(request.salePrice());
        material.setNcmCode(request.ncmCode());
        material.setAttributesJson(buildAttributesJson(request.calculationType()));
        return material;
    }

    /**
     * Projeta um {@link Material} em um {@link HardwareResponseDTO}.
     */
    public HardwareResponseDTO toResponse(Material material) {
        if (material == null) {
            return null;
        }
        return new HardwareResponseDTO(
                material.getId(),
                material.getSkuCode(),
                material.getName(),
                material.getUnitMeasure(),
                extractCalculationType(material.getAttributesJson()),
                material.getNcmCode(),
                material.getCostPrice(),
                material.getSalePrice(),
                material.isActive(),
                material.getCreatedAt(),
                material.getUpdatedAt()
        );
    }

    // -------------------------------------------------------------------------
    // Helpers de serialização do attributesJson
    // -------------------------------------------------------------------------

    public String buildAttributesJson(CalculationType calculationType) {
        if (calculationType == null) {
            return null;
        }
        return "{\"" + ATTR_CALCULATION_TYPE_KEY + "\":\"" + calculationType.name() + "\"}";
    }

    private CalculationType extractCalculationType(String attributesJson) {
        if (attributesJson == null || attributesJson.isBlank()) {
            return CalculationType.UNIT;
        }
        for (CalculationType type : CalculationType.values()) {
            if (attributesJson.contains("\"" + type.name() + "\"")) {
                return type;
            }
        }
        return CalculationType.UNIT;
    }
}
