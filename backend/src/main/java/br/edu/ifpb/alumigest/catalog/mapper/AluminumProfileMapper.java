package br.edu.ifpb.alumigest.catalog.mapper;

import br.edu.ifpb.alumigest.catalog.domain.Material;
import br.edu.ifpb.alumigest.catalog.domain.UnitMeasure;
import br.edu.ifpb.alumigest.catalog.dto.AluminumProfileRequestDTO;
import br.edu.ifpb.alumigest.catalog.dto.AluminumProfileResponseDTO;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Component
public class AluminumProfileMapper {

    private static final String ATTR_WEIGHT = "weight";
    private static final String ATTR_COMMERCIAL_LINE = "commercialLine";

    private final ObjectMapper objectMapper;

    public AluminumProfileMapper(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public Material toEntity(AluminumProfileRequestDTO request) {
        if (request == null) {
            return null;
        }
        Material material = new Material();
        material.setName(request.name());
        material.setCommercialReference(request.commercialReference());
        material.setNcmCode(request.ncmCode());
        material.setColorFinish(request.colorFinish());
        material.setFamilyCode(request.familyCode());
        material.setStandardLengthM(request.standardLengthM());
        material.setUnitMeasure(UnitMeasure.METRO);
        material.setCostPrice(request.costPrice());
        material.setSalePrice(request.salePrice());
        if (request.isHandle() != null) {
            material.setHandle(request.isHandle());
        }
        
        if (request.weight() != null || request.commercialLine() != null) {
            material.setAttributesJson(buildAttributesJson(request.weight(), request.commercialLine()));
        }
        
        return material;
    }

    public String buildAttributesJson(BigDecimal weight, String commercialLine) {
        if (weight == null && commercialLine == null) {
            return null;
        }
        try {
            Map<String, Object> attrs = new HashMap<>();
            if (weight != null) attrs.put(ATTR_WEIGHT, weight);
            if (commercialLine != null) attrs.put(ATTR_COMMERCIAL_LINE, commercialLine);
            return objectMapper.writeValueAsString(attrs);
        } catch (JsonProcessingException e) {
            return null;
        }
    }

    public AluminumProfileResponseDTO toResponse(Material material) {
        if (material == null) {
            return null;
        }
        
        BigDecimal weight = null;
        String commercialLine = null;
        if (material.getAttributesJson() != null && !material.getAttributesJson().isEmpty()) {
            try {
                Map<String, Object> attrs = objectMapper.readValue(material.getAttributesJson(), new TypeReference<Map<String, Object>>(){});
                if (attrs.containsKey(ATTR_WEIGHT)) {
                    weight = new BigDecimal(attrs.get(ATTR_WEIGHT).toString());
                }
                if (attrs.containsKey(ATTR_COMMERCIAL_LINE)) {
                    commercialLine = attrs.get(ATTR_COMMERCIAL_LINE).toString();
                }
            } catch (JsonProcessingException e) {
                // Ignore parsing errors
            }
        }
        
        return new AluminumProfileResponseDTO(
                material.getId(),
                material.getName(),
                material.getCommercialReference(),
                commercialLine,
                material.getNcmCode(),
                material.getColorFinish(),
                material.getStandardLengthM(),
                material.getUnitMeasure(),
                material.getCostPrice(),
                material.getSalePrice(),
                weight,
                material.isActive(),
                material.getCreatedAt(),
                material.getUpdatedAt(),
                material.getFamilyCode(),
                material.isHandle()
        );
    }
}
