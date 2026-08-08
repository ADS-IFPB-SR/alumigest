package br.edu.ifpb.alumigest.catalog.controller;

import br.edu.ifpb.alumigest.catalog.dto.FilmRequestDTO;
import br.edu.ifpb.alumigest.catalog.dto.FilmResponseDTO;
import br.edu.ifpb.alumigest.catalog.dto.FilmUpdatePriceDTO;
import br.edu.ifpb.alumigest.catalog.service.FilmService;
import br.edu.ifpb.alumigest.common.dto.ApiResponse;
import br.edu.ifpb.alumigest.common.dto.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/catalog/films")
@Tag(name = "Películas", description = "Gerenciamento de películas por m² (Fumê, Jateada, etc.)")
public class FilmController {

    private final FilmService filmService;

    public FilmController(FilmService filmService) {
        this.filmService = filmService;
    }

    @PostMapping
    @Operation(summary = "Cadastrar película", description = "Registra uma nova película vinculada ao grupo PELICULA com cálculo por metro quadrado.")

        public ResponseEntity<ApiResponse<FilmResponseDTO>> createFilm(@Valid @RequestBody FilmRequestDTO request) {

        FilmResponseDTO response = filmService.createFilm(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Película cadastrada com sucesso", response));
    }

    @GetMapping
    @Operation(summary = "Listar películas ativas", description = "Retorna lista paginada de todas as películas ativas no catálogo")

    public ResponseEntity<ApiResponse<PageResponse<FilmResponseDTO>>> listActiveFilms(Pageable pageable) {

        Page<FilmResponseDTO> page = filmService.findAllActiveFilms(pageable);

        return ResponseEntity.ok(ApiResponse.ok("Películas listadas com sucesso", PageResponse.of(page)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar preço da película", description = "Atualiza estritamente o preço por m² de uma película existente")

    public ResponseEntity<ApiResponse<FilmResponseDTO>> updateFilm( @PathVariable UUID id,  @Valid @RequestBody FilmUpdatePriceDTO request) {

        FilmResponseDTO response = filmService.updateFilmPrice(id, request);

        return ResponseEntity.ok(ApiResponse.ok("Preço da película atualizado com sucesso", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Inativar película", description = "Realiza a inativação lógica da película no catálogo")

    public ResponseEntity<Void> inactivateFilm(@PathVariable UUID id) {
        filmService.inactivateFilm(id);
        return ResponseEntity.noContent().build();
    }
}