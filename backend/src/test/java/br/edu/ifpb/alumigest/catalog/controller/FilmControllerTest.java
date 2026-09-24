package br.edu.ifpb.alumigest.catalog.controller;

import br.edu.ifpb.alumigest.catalog.dto.FilmRequestDTO;
import br.edu.ifpb.alumigest.catalog.dto.FilmResponseDTO;
import br.edu.ifpb.alumigest.catalog.dto.FilmUpdatePriceDTO;
import br.edu.ifpb.alumigest.catalog.service.FilmService;
import br.edu.ifpb.alumigest.common.exception.GlobalExceptionHandler;
import br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("FilmController — Testes de Integração Web (MockMvc)")
class FilmControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private FilmService filmService;

    @InjectMocks
    private FilmController filmController;

    private static final UUID FILM_ID = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(filmController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .setCustomArgumentResolvers(new PageableHandlerMethodArgumentResolver())
                .build();
    }

    private FilmResponseDTO createSampleResponse(UUID id, String name) {
        return new FilmResponseDTO(
                id,
                name,
                "Fumê",
                new BigDecimal("30.00"),
                new BigDecimal("75.00"),
                "M2",
                new BigDecimal("0.10"),
                new BigDecimal("25.00"),
                new BigDecimal("1500"),
                true,
                "PEL-01",
                "SKU-PEL-01",
                "39199090",
                "FAM-PELICULA"
        );
    }

    @Nested
    @DisplayName("Cadastro de Película (POST)")
    class CreateTests {

        @Test
        @DisplayName("[Técnica: Classes de Equivalência - Payload Válido] Deve retornar 201 CREATED")
        void shouldReturn201WhenCreatingValidFilm() throws Exception {
            // Given (Arrange)
            FilmRequestDTO request = new FilmRequestDTO(
                    "Película Jateada 2m",
                    "Jateada",
                    new BigDecimal("70.00"),
                    "PEL-JAT",
                    "39199090",
                    new BigDecimal("30.00"),
                    new BigDecimal("0.10"),
                    new BigDecimal("25.00"),
                    new BigDecimal("1500"),
                    "FAM-PELICULA"
            );

            FilmResponseDTO response = createSampleResponse(FILM_ID, "Película Jateada 2m");
            when(filmService.createFilm(any(FilmRequestDTO.class))).thenReturn(response);

            // When (Act) & Then (Assert)
            mockMvc.perform(post("/api/v1/catalog/films")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.id").value(FILM_ID.toString()))
                    .andExpect(jsonPath("$.data.name").value("Película Jateada 2m"));

            verify(filmService).createFilm(any(FilmRequestDTO.class));
        }

        @Test
        @DisplayName("[Técnica: Classes de Equivalência - Payload Inválido] Deve retornar 400 Bad Request")
        void shouldReturn400WhenPayloadIsInvalid() throws Exception {
            String invalidJson = "{\"name\": null}";

            mockMvc.perform(post("/api/v1/catalog/films")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(invalidJson))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.status").value(400));

            verifyNoInteractions(filmService);
        }
    }

    @Nested
    @DisplayName("Listagem de Películas Ativas (GET)")
    class ListActiveTests {

        @Test
        @DisplayName("[Técnica: Classes de Equivalência - Lista Paginada] Deve retornar 200 OK com itens")
        void shouldReturn200WithPagedFilms() throws Exception {
            FilmResponseDTO item = createSampleResponse(FILM_ID, "Película Fumê 100%");
            when(filmService.findAllActiveFilms(any(Pageable.class)))
                    .thenReturn(new PageImpl<>(List.of(item), PageRequest.of(0, 10), 1));

            mockMvc.perform(get("/api/v1/catalog/films"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.content[0].name").value("Película Fumê 100%"));
        }
    }

    @Nested
    @DisplayName("Atualização de Preço (PUT /{id})")
    class UpdatePriceTests {

        @Test
        @DisplayName("[Técnica: Classes de Equivalência - Atualização Válida] Deve retornar 200 OK")
        void shouldReturn200WhenUpdatingFilmPrice() throws Exception {
            FilmUpdatePriceDTO request = new FilmUpdatePriceDTO(
                    "Película Fumê Atualizada",
                    "PEL-FUME-V2",
                    "Fumê Escuro",
                    new BigDecimal("35.00"),
                    new BigDecimal("85.00"),
                    "39199090",
                    new BigDecimal("0.10"),
                    new BigDecimal("30.00"),
                    new BigDecimal("1500"),
                    true
            );

            FilmResponseDTO response = createSampleResponse(FILM_ID, "Película Fumê Atualizada");
            when(filmService.updateFilmPrice(eq(FILM_ID), any(FilmUpdatePriceDTO.class))).thenReturn(response);

            mockMvc.perform(put("/api/v1/catalog/films/{id}", FILM_ID)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true));
        }

        @Test
        @DisplayName("[Técnica: Classes de Equivalência - ID Inexistente] Deve retornar 404 Not Found")
        void shouldReturn404WhenFilmDoesNotExist() throws Exception {
            UUID unknownId = UUID.randomUUID();
            FilmUpdatePriceDTO request = new FilmUpdatePriceDTO(
                    "Película Inexistente",
                    "PEL-X",
                    "Fumê",
                    new BigDecimal("35.00"),
                    new BigDecimal("85.00"),
                    "39199090",
                    new BigDecimal("0.10"),
                    new BigDecimal("30.00"),
                    new BigDecimal("1500"),
                    true
            );

            when(filmService.updateFilmPrice(eq(unknownId), any(FilmUpdatePriceDTO.class)))
                    .thenThrow(new ResourceNotFoundException("Película não encontrada."));

            mockMvc.perform(put("/api/v1/catalog/films/{id}", unknownId)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.status").value(404));
        }
    }

    @Nested
    @DisplayName("Inativação Lógica (DELETE /{id})")
    class InactivateTests {

        @Test
        @DisplayName("[Técnica: Transição de Estados - Inativação] Deve retornar 204 No Content")
        void shouldReturn204WhenInactivatingFilm() throws Exception {
            doNothing().when(filmService).inactivateFilm(FILM_ID);

            mockMvc.perform(delete("/api/v1/catalog/films/{id}", FILM_ID))
                    .andExpect(status().isNoContent());

            verify(filmService).inactivateFilm(FILM_ID);
        }
    }
}
