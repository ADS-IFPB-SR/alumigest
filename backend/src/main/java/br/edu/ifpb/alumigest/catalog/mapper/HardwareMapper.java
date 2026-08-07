package br.edu.ifpb.alumigest.catalog.mapper;

import br.edu.ifpb.alumigest.catalog.dto.CreateHardwareRequest;
import br.edu.ifpb.alumigest.catalog.dto.HardwareResponse;
import br.edu.ifpb.alumigest.catalog.entity.Hardware;
import org.springframework.stereotype.Component;

@Component
public class HardwareMapper {

    public Hardware toEntity(CreateHardwareRequest request) {
        if (request == null) {
            return null;
        }
        return Hardware.builder()
                .code(request.code())
                .name(request.name())
                .unit(request.unit())
                .calculationType(request.calculationType())
                .unitPrice(request.unitPrice())
                .active(true)
                .build();
    }

    public HardwareResponse toResponse(Hardware hardware) {
        if (hardware == null) {
            return null;
        }
        return new HardwareResponse(
                hardware.getId(),
                hardware.getCode(),
                hardware.getName(),
                hardware.getUnit(),
                hardware.getCalculationType(),
                hardware.getUnitPrice(),
                hardware.getActive(),
                hardware.getCreatedAt(),
                hardware.getUpdatedAt()
        );
    }
}
