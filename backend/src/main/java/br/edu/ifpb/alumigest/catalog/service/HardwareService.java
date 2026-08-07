package br.edu.ifpb.alumigest.catalog.service;

import br.edu.ifpb.alumigest.catalog.dto.CreateHardwareRequest;
import br.edu.ifpb.alumigest.catalog.dto.HardwareResponse;
import br.edu.ifpb.alumigest.catalog.dto.UpdateHardwarePriceRequest;
import br.edu.ifpb.alumigest.catalog.entity.Hardware;
import br.edu.ifpb.alumigest.catalog.entity.UnitType;
import br.edu.ifpb.alumigest.catalog.mapper.HardwareMapper;
import br.edu.ifpb.alumigest.catalog.repository.HardwareRepository;
import br.edu.ifpb.alumigest.common.exception.BusinessException;
import br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class HardwareService {

    private final HardwareRepository hardwareRepository;
    private final HardwareMapper hardwareMapper;

    @Transactional
    public HardwareResponse create(CreateHardwareRequest request) {
        if (hardwareRepository.existsByCode(request.code())) {
            throw new BusinessException("Já existe uma ferragem cadastrada com o código: " + request.code());
        }

        Hardware hardware = hardwareMapper.toEntity(request);
        Hardware saved = hardwareRepository.save(hardware);
        return hardwareMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<HardwareResponse> findAll(UnitType unit, String name, Pageable pageable) {
        return hardwareRepository.findAllActiveFiltered(unit, name, pageable)
                .map(hardwareMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public HardwareResponse findById(Long id) {
        Hardware hardware = hardwareRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ferragem não encontrada com ID: " + id));
        return hardwareMapper.toResponse(hardware);
    }

    @Transactional
    public HardwareResponse updatePrice(Long id, UpdateHardwarePriceRequest request) {
        Hardware hardware = hardwareRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ferragem não encontrada com ID: " + id));

        hardware.setUnitPrice(request.unitPrice());
        Hardware updated = hardwareRepository.save(hardware);
        return hardwareMapper.toResponse(updated);
    }

    @Transactional
    public void softDelete(Long id) {
        Hardware hardware = hardwareRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ferragem não encontrada com ID: " + id));

        hardware.setActive(false);
        hardwareRepository.save(hardware);
    }
}
