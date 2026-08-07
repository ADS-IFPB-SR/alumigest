package br.edu.ifpb.alumigest.catalog.service;

import br.edu.ifpb.alumigest.catalog.dto.FilmRequestDTO;
import br.edu.ifpb.alumigest.catalog.dto.FilmResponseDTO;
import br.edu.ifpb.alumigest.catalog.dto.FilmUpdatePriceDTO;
import br.edu.ifpb.alumigest.catalog.entity.Material;
import br.edu.ifpb.alumigest.catalog.entity.MaterialGroup;
import br.edu.ifpb.alumigest.catalog.repository.MaterialGroupRepository;
import br.edu.ifpb.alumigest.catalog.repository.MaterialRepository;
import br.edu.ifpb.alumigest.catalog.mapper.FilmMapper;
import br.edu.ifpb.alumigest.common.exception.BusinessException;
import br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.UUID;

@Service
public class FilmService {

    private final MaterialRepository materialRepository;
    private final MaterialGroupRepository materialGroupRepository;
    private final FilmMapper filmMapper;

    private static final String FILM_GROUP_CODE = "PELICULA";
    private static final String UNIT_MEASURE = "m2";

    public FilmService(MaterialRepository materialRepository, MaterialGroupRepository materialGroupRepository,  FilmMapper filmMapper) {
        this.materialRepository = materialRepository;
        this.materialGroupRepository = materialGroupRepository;
        this.filmMapper = filmMapper;
    }

    @Transactional
    public FilmResponseDTO createFilm(FilmRequestDTO request) {

        MaterialGroup group = materialGroupRepository.findByCode(FILM_GROUP_CODE)
                .orElseThrow(() -> new BusinessException("Grupo de materiais 'PELICULA' não encontrado no sistema."));

        Material material = filmMapper.toEntity(request);

        material.setMaterialGroup(group);
        material.setUnitMeasure(UNIT_MEASURE);
        material.setIsActive(true);

        Material savedMaterial = materialRepository.save(material);

        return filmMapper.toResponse(savedMaterial);
    }

    @Transactional(readOnly = true)
    public Page<FilmResponseDTO> findAllActiveFilms(Pageable pageable) {

        Page<Material> materials = materialRepository.findAllActiveByGroupCode(FILM_GROUP_CODE, pageable);

        return materials.map(filmMapper::toResponse);
    }

    @Transactional
    public FilmResponseDTO updateFilmPrice(UUID id, FilmUpdatePriceDTO request) {

        Material material = materialRepository.findByIdAndMaterialGroupCode(id, FILM_GROUP_CODE)
                .orElseThrow(() -> new ResourceNotFoundException("Película não encontrada com o ID informado."));

        material.setSalePrice(request.salePrice());

        return filmMapper.toResponse(materialRepository.save(material));
    }

    @Transactional
    public void inactivateFilm(UUID id) {
        Material material = materialRepository.findByIdAndMaterialGroupCode(id, FILM_GROUP_CODE)
                .orElseThrow(() -> new ResourceNotFoundException("Película não encontrada com o ID informado."));

        material.setIsActive(false);
        materialRepository.save(material);
    }
}