package br.edu.ifpb.alumigest.catalog.controller;

import br.edu.ifpb.alumigest.catalog.dto.GlassCreateDTO;
import br.edu.ifpb.alumigest.catalog.dto.GlassResponseDTO;
import br.edu.ifpb.alumigest.catalog.dto.GlassUpdateDTO;
import br.edu.ifpb.alumigest.catalog.service.GlassService;
import jakarta.validation.Valid;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/catalog/glasses")
public class GlassController {

    private final GlassService glassService;

    public GlassController(GlassService glassService) {
        this.glassService = glassService;
    }

    @PostMapping
    public ResponseEntity<GlassResponseDTO> create(@RequestBody @Valid GlassCreateDTO request) {
        GlassResponseDTO response = glassService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<Page<GlassResponseDTO>> listAll(
            @RequestParam(required = false) BigDecimal thickness,
            @RequestParam(required = false) String color,
            @ParameterObject @PageableDefault(size = 10, sort = "name") Pageable pageable) { // <-- @ParameterObject adicionado aqui

        Page<GlassResponseDTO> response = glassService.findAllGlasses(thickness, color, pageable);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<GlassResponseDTO> update(
            @PathVariable UUID id,
            @RequestBody @Valid GlassUpdateDTO request) {

        GlassResponseDTO response = glassService.update(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        glassService.delete(id);
        return ResponseEntity.noContent().build();
    }
}