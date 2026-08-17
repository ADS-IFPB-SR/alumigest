package br.edu.ifpb.alumigest.catalog.service;

import br.edu.ifpb.alumigest.catalog.dto.GlassCreateDTO;
import br.edu.ifpb.alumigest.catalog.dto.GlassResponseDTO;
import br.edu.ifpb.alumigest.catalog.dto.GlassUpdateDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.UUID;

public interface IGlassService {
    GlassResponseDTO create(GlassCreateDTO dto);
    Page<GlassResponseDTO> findAllGlasses(BigDecimal thickness, String colorFinish, Pageable pageable);
    GlassResponseDTO update(UUID id, GlassUpdateDTO dto);
    void delete(UUID id);
}
