package br.edu.ifpb.alumigest.catalog.service;

import br.edu.ifpb.alumigest.catalog.domain.Material;
import br.edu.ifpb.alumigest.catalog.domain.MaterialGroup;
import br.edu.ifpb.alumigest.catalog.domain.UnitMeasure;
import br.edu.ifpb.alumigest.catalog.dto.GlassCreateDTO;
import br.edu.ifpb.alumigest.catalog.dto.GlassResponseDTO;
import br.edu.ifpb.alumigest.catalog.dto.GlassUpdateDTO;
import br.edu.ifpb.alumigest.catalog.repository.MaterialGroupRepository;
import br.edu.ifpb.alumigest.catalog.repository.MaterialRepository;
import br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class GlassService implements IGlassService {

    private final MaterialRepository materialRepository;
    private final MaterialGroupRepository groupRepository;

    private static final String GLASS_GROUP_CODE = "VIDRO";
    private static final List<BigDecimal> ALLOWED_THICKNESSES = List.of(
            new BigDecimal("2"), new BigDecimal("4"), new BigDecimal("6"),
            new BigDecimal("8"), new BigDecimal("10")
    );

    public GlassService(MaterialRepository materialRepository, MaterialGroupRepository groupRepository) {
        this.materialRepository = materialRepository;
        this.groupRepository = groupRepository;
    }

    @Transactional
    public GlassResponseDTO create(GlassCreateDTO dto) {
        validateThickness(dto.thicknessMm());

        MaterialGroup group = getGlassGroup();

        Material material = new Material();
        material.setGroup(group);
        material.setName(dto.name());
        material.setColorFinish(dto.colorFinish());
        material.setThicknessMm(dto.thicknessMm());
        material.setMaxWidthMm(dto.maxWidthMm());
        material.setMaxHeightMm(dto.maxHeightMm());
        material.setCostPrice(dto.costPrice());
        material.setSalePrice(dto.salePrice());
        material.setNcmCode(dto.ncmCode());
        material.setUnitMeasure(UnitMeasure.M2);
        material.setActive(true);

        Material savedMaterial = materialRepository.save(material);
        return toResponseDTO(savedMaterial);
    }

    @Transactional(readOnly = true)
    public Page<GlassResponseDTO> findAllGlasses(BigDecimal thickness, String colorFinish, Pageable pageable) {
        MaterialGroup group = getGlassGroup();

        Page<Material> materials = materialRepository.findAllByGroupWithFilters(
                group.getId(), thickness, colorFinish, pageable
        );

        return materials.map(this::toResponseDTO);
    }

    @Transactional
    public GlassResponseDTO update(UUID id, GlassUpdateDTO dto) {
        validateThickness(dto.thicknessMm());
        
        Material material = materialRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vidro não encontrado ou inativo."));

        if (!material.getGroup().getCode().equalsIgnoreCase(GLASS_GROUP_CODE)) {
            throw new IllegalArgumentException("O material especificado não pertence ao grupo de vidros.");
        }

        material.setName(dto.name());
        material.setColorFinish(dto.colorFinish());
        material.setThicknessMm(dto.thicknessMm());
        material.setMaxWidthMm(dto.maxWidthMm());
        material.setMaxHeightMm(dto.maxHeightMm());
        material.setCostPrice(dto.costPrice());
        material.setSalePrice(dto.salePrice());
        material.setNcmCode(dto.ncmCode());
        material.setActive(dto.active());

        Material updatedMaterial = materialRepository.save(material);
        return toResponseDTO(updatedMaterial);
    }

    @Transactional
    public void delete(UUID id) {
        Material material = materialRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vidro não encontrado ou já inativo."));

        if (!material.getGroup().getCode().equalsIgnoreCase(GLASS_GROUP_CODE)) {
            throw new IllegalArgumentException("O material especificado não pertence ao grupo de vidros.");
        }

        material.setActive(false);
        materialRepository.save(material);
    }

    private MaterialGroup getGlassGroup() {
        return groupRepository.findByCodeIgnoreCase(GLASS_GROUP_CODE)
                .orElseThrow(() -> new IllegalStateException(
                        "Grupo de materiais '" + GLASS_GROUP_CODE + "' não configurado no sistema."
                ));
    }

    private void validateThickness(BigDecimal thickness) {
        if (thickness == null) return; // Se a anotação @NotNull falhar, o Controller Advice já barra.
        boolean isValid = ALLOWED_THICKNESSES.stream()
                .anyMatch(allowed -> allowed.compareTo(thickness) == 0);

        if (!isValid) {
            throw new IllegalArgumentException(
                    "Espessura inválida. Permitido apenas: 2mm, 4mm, 6mm, 8mm, 10mm."
            );
        }
    }

    private GlassResponseDTO toResponseDTO(Material material) {
        return new GlassResponseDTO(
                material.getId(),
                material.getName(),
                material.getColorFinish(),
                material.getNcmCode(),
                material.getThicknessMm(),
                material.getCostPrice(),
                material.getSalePrice(),
                material.getUnitMeasure().name(),
                material.isActive(),
                material.getMaxWidthMm(),
                material.getMaxHeightMm()
        );
    }
}