package br.edu.ifpb.alumigest.catalog.service;

import br.edu.ifpb.alumigest.catalog.domain.Material;
import br.edu.ifpb.alumigest.catalog.domain.MaterialGroup;
import br.edu.ifpb.alumigest.catalog.dto.AluminumProfileRequestDTO;
import br.edu.ifpb.alumigest.catalog.dto.AluminumProfileResponseDTO;
import br.edu.ifpb.alumigest.catalog.dto.AluminumProfileUpdateDTO;
import br.edu.ifpb.alumigest.catalog.mapper.AluminumProfileMapper;
import br.edu.ifpb.alumigest.catalog.repository.MaterialGroupRepository;
import br.edu.ifpb.alumigest.catalog.repository.MaterialRepository;
import br.edu.ifpb.alumigest.common.exception.BusinessException;
import br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class AluminumProfileService {

    private static final String ALUMINUM_GROUP_CODE = "ALUMINIO";

    private static final List<BigDecimal> ALLOWED_STANDARD_LENGTHS = List.of(
            new BigDecimal("3.00"),
            new BigDecimal("6.00")
    );

    private final MaterialRepository materialRepository;
    private final MaterialGroupRepository materialGroupRepository;
    private final AluminumProfileMapper aluminumProfileMapper;

    public AluminumProfileService(MaterialRepository materialRepository,
                                  MaterialGroupRepository materialGroupRepository,
                                  AluminumProfileMapper aluminumProfileMapper) {
        this.materialRepository = materialRepository;
        this.materialGroupRepository = materialGroupRepository;
        this.aluminumProfileMapper = aluminumProfileMapper;
    }

    @Transactional
    public AluminumProfileResponseDTO create(AluminumProfileRequestDTO request) {
        validateStandardLength(request.standardLengthM());

        MaterialGroup group = resolveAluminumGroup();

        if (materialRepository.findActiveByGroupAndCommercialReferenceAndColorFinish(
                group.getId(), request.commercialReference(), request.colorFinish()).isPresent()) {
            throw new BusinessException(
                    "Já existe um perfil de alumínio cadastrado com a referência '" +
                    request.commercialReference() + "' e acabamento '" +
                    request.colorFinish() + "'.");
        }

        Material material = aluminumProfileMapper.toEntity(request);
        material.setGroup(group);
        material.setActive(true);

        try {
            return aluminumProfileMapper.toResponse(materialRepository.save(material));
        } catch (DataIntegrityViolationException e) {
            throw new BusinessException("Conflito de cadastro: já existe um perfil de alumínio com a referência " + request.commercialReference());
        }
    }

    @Transactional(readOnly = true)
    public Page<AluminumProfileResponseDTO> findAll(String colorFinish, String name, Pageable pageable) {
        MaterialGroup group = resolveAluminumGroup();
        return materialRepository
                .findAllAluminumFiltered(group.getId(), colorFinish, name, pageable)
                .map(aluminumProfileMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public AluminumProfileResponseDTO findById(UUID id) {
        Material material = materialRepository.findByIdAndGroupCode(id, ALUMINUM_GROUP_CODE)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Perfil de alumínio não encontrado com ID: " + id));
        return aluminumProfileMapper.toResponse(material);
    }

    @Transactional
    public AluminumProfileResponseDTO updatePrices(UUID id, AluminumProfileUpdateDTO request) {
        Material material = materialRepository.findByIdAndGroupCode(id, ALUMINUM_GROUP_CODE)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Perfil de alumínio não encontrado com ID: " + id));

        material.setCommercialReference(request.commercialReference());
        material.setName(request.name());
        material.setColorFinish(request.colorFinish());
        material.setStandardLengthM(request.standardLengthM());
        material.setCostPrice(request.costPrice());
        material.setSalePrice(request.salePrice());
        
        if (request.weight() != null || request.commercialLine() != null) {
            material.setAttributesJson(aluminumProfileMapper.buildAttributesJson(request.weight(), request.commercialLine()));
        }
        
        if (request.active() != null) {
            material.setActive(request.active());
        }
        
        return aluminumProfileMapper.toResponse(materialRepository.save(material));
    }

    @Transactional
    public void softDelete(UUID id) {
        Material material = materialRepository.findByIdAndGroupCode(id, ALUMINUM_GROUP_CODE)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Perfil de alumínio não encontrado com ID: " + id));

        material.setActive(false);
        materialRepository.save(material);
    }

    private MaterialGroup resolveAluminumGroup() {
        return materialGroupRepository.findByCode(ALUMINUM_GROUP_CODE)
                .orElseThrow(() -> new BusinessException(
                        "Grupo de materiais 'ALUMINIO' não encontrado no sistema."));
    }

    private void validateStandardLength(BigDecimal standardLengthM) {
        if (standardLengthM == null) {
            return;
        }
        boolean valid = ALLOWED_STANDARD_LENGTHS.stream()
                .anyMatch(allowed -> allowed.compareTo(standardLengthM) == 0);
        if (!valid) {
            throw new BusinessException(
                    "Comprimento padrão inválido: " + standardLengthM +
                    "m. Valores aceitos: 3.00m e 6.00m.");
        }
    }
}
