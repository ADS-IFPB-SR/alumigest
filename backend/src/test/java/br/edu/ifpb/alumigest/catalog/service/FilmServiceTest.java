package br.edu.ifpb.alumigest.catalog.service;

import br.edu.ifpb.alumigest.catalog.dto.FilmRequestDTO;
import br.edu.ifpb.alumigest.catalog.dto.FilmResponseDTO;
import br.edu.ifpb.alumigest.catalog.dto.FilmUpdatePriceDTO;
import br.edu.ifpb.alumigest.catalog.domain.Material;
import br.edu.ifpb.alumigest.catalog.domain.MaterialGroup;
import br.edu.ifpb.alumigest.catalog.mapper.FilmMapper;
import br.edu.ifpb.alumigest.catalog.repository.MaterialGroupRepository;
import br.edu.ifpb.alumigest.catalog.repository.MaterialRepository;
import br.edu.ifpb.alumigest.common.exception.BusinessException;
import br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FilmServiceTest {

    @Mock
    private MaterialRepository materialRepository;

    @Mock
    private MaterialGroupRepository materialGroupRepository;

    @Mock
    private FilmMapper filmMapper;

    @InjectMocks
    private FilmService filmService;

    private UUID filmId;
    private MaterialGroup mockGroup;
    private Material mockMaterial;
    private FilmRequestDTO mockRequest;

    @BeforeEach
    void setUp() {
        filmId = UUID.randomUUID();

        mockGroup = new MaterialGroup();
        mockGroup.setCode("PELICULA");

        mockMaterial = new Material();
        mockMaterial.setId(filmId);
        mockMaterial.setName("Fumê G20");
        mockMaterial.setSalePrice(new BigDecimal("50.00"));
        // CORREÇÃO 1: Mudou de setIsActive para setActive
        mockMaterial.setActive(true);

        mockRequest = new FilmRequestDTO(
                "Fumê G20", "Fumê", new BigDecimal("50.00"),
                "REF-1", "123", BigDecimal.ZERO,
                new BigDecimal("0.8"), new BigDecimal("100"), new BigDecimal("1520")
        );
    }

    @Test
    void createFilm_ShouldReturnSuccess_WhenGroupExists() {
        when(materialGroupRepository.findByCode("PELICULA")).thenReturn(Optional.of(mockGroup));
        when(filmMapper.toEntity(mockRequest)).thenReturn(mockMaterial);
        when(materialRepository.save(any(Material.class))).thenReturn(mockMaterial);
        when(filmMapper.toResponse(mockMaterial)).thenReturn(new FilmResponseDTO(filmId, "Fumê G20", "Fumê", BigDecimal.ZERO, new BigDecimal("50.00"), "m2", new BigDecimal("0.8"), new BigDecimal("100"), new BigDecimal("1520"), true, "REF-1", "123", "123"));

        FilmResponseDTO result = filmService.createFilm(mockRequest);

        assertNotNull(result);
        assertEquals("Fumê G20", result.name());
        verify(materialRepository, times(1)).save(any(Material.class));
    }

    @Test
    void createFilm_ShouldThrowException_WhenGroupNotFound() {
        when(materialGroupRepository.findByCode("PELICULA")).thenReturn(Optional.empty());

        BusinessException exception = assertThrows(BusinessException.class, () -> filmService.createFilm(mockRequest));
        assertEquals("Grupo de materiais 'PELICULA' não encontrado no sistema.", exception.getMessage());
        verify(materialRepository, never()).save(any());
    }

    @Test
    void findAllActiveFilms_ShouldReturnPageOfFilms() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Material> pagedResponse = new PageImpl<>(List.of(mockMaterial));

        when(materialRepository.findAllByGroupCode("PELICULA", pageable)).thenReturn(pagedResponse);
        when(filmMapper.toResponse(mockMaterial)).thenReturn(new FilmResponseDTO(filmId, "Fumê G20", "Fumê", BigDecimal.ZERO, new BigDecimal("50.00"), "m2", new BigDecimal("0.8"), new BigDecimal("100"), new BigDecimal("1520"), true, "REF-1", "123", "123"));

        Page<FilmResponseDTO> result = filmService.findAllActiveFilms(pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(materialRepository, times(1)).findAllByGroupCode("PELICULA", pageable);
    }

    @Test
    void updateFilmPrice_ShouldUpdateOnlyPrice_WhenFilmExists() {
        FilmUpdatePriceDTO updateRequest = new FilmUpdatePriceDTO("Fumê G20", "REF-1", "Fumê", BigDecimal.ZERO, new BigDecimal("85.50"), "123", new BigDecimal("0.8"), new BigDecimal("100"), new BigDecimal("1520"), null);

        when(materialRepository.findByIdAndGroupCode(filmId, "PELICULA")).thenReturn(Optional.of(mockMaterial));
        when(materialRepository.save(any(Material.class))).thenReturn(mockMaterial);
        when(filmMapper.toResponse(mockMaterial)).thenReturn(new FilmResponseDTO(filmId, "Fumê G20", "Fumê", BigDecimal.ZERO, new BigDecimal("85.50"), "m2", new BigDecimal("0.8"), new BigDecimal("100"), new BigDecimal("1520"), true, "REF-1", "123", "123"));

        FilmResponseDTO result = filmService.updateFilmPrice(filmId, updateRequest);

        assertEquals(new BigDecimal("85.50"), result.salePrice());
        verify(materialRepository, times(1)).save(mockMaterial);
    }

    @Test
    void updateFilmPrice_ShouldThrowException_WhenFilmNotFound() {
        FilmUpdatePriceDTO updateRequest = new FilmUpdatePriceDTO("Fumê G20", "REF-1", "Fumê", BigDecimal.ZERO, new BigDecimal("85.50"), "123", new BigDecimal("0.8"), new BigDecimal("100"), new BigDecimal("1520"), null);

        when(materialRepository.findByIdAndGroupCode(filmId, "PELICULA")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> filmService.updateFilmPrice(filmId, updateRequest));
        verify(materialRepository, never()).save(any());
    }

    @Test
    void inactivateFilm_ShouldSetIsActiveToFalse_WhenFilmExists() {
        when(materialRepository.findByIdAndGroupCode(filmId, "PELICULA")).thenReturn(Optional.of(mockMaterial));

        filmService.inactivateFilm(filmId);

        assertFalse(mockMaterial.isActive());
        verify(materialRepository, times(1)).save(mockMaterial);
    }

    @Test
    void inactivateFilm_ShouldThrowException_WhenFilmDoesNotExist() {

        when(materialRepository.findByIdAndGroupCode(filmId, "PELICULA")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> filmService.inactivateFilm(filmId));
        verify(materialRepository, never()).save(any());
    }
}
