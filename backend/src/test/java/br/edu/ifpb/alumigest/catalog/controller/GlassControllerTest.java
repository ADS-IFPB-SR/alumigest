package br.edu.ifpb.alumigest.catalog.controller;

import br.edu.ifpb.alumigest.catalog.dto.GlassCreateDTO;
import br.edu.ifpb.alumigest.catalog.dto.GlassResponseDTO;
import br.edu.ifpb.alumigest.catalog.dto.GlassUpdateDTO;
import br.edu.ifpb.alumigest.catalog.service.GlassService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(GlassController.class)
@ActiveProfiles("test")
class GlassControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper; // Utilitário do Jackson para converter Objetos em JSON

    @MockBean
    private GlassService glassService; // Mockamos o serviço pois a lógica dele já foi testada

    @Test
    @DisplayName("Deve retornar 201 CREATED ao cadastrar um vidro válido")
    void shouldReturn201WhenCreatingValidGlass() throws Exception {
        GlassCreateDTO requestDTO = new GlassCreateDTO(
                "Vidro Incolor 4mm",
                "Incolor",
                new BigDecimal("4"),
                new BigDecimal("80.00"),
                new BigDecimal("150.00")
        );

        GlassResponseDTO responseDTO = new GlassResponseDTO(
                UUID.randomUUID(),
                "Vidro Incolor 4mm",
                "Incolor",
                new BigDecimal("4"),
                new BigDecimal("80.00"),
                new BigDecimal("150.00"),
                "M2",
                true
        );

        when(glassService.create(any(GlassCreateDTO.class))).thenReturn(responseDTO);

        mockMvc.perform(post("/api/v1/catalog/glasses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("Vidro Incolor 4mm"))
                .andExpect(jsonPath("$.unitMeasure").value("M2"));
    }

    @Test
    @DisplayName("Deve retornar 400 BAD REQUEST se validações falharem")
    void shouldReturn400WhenValidationFails() throws Exception {
        // Criamos um DTO inválido: nome em branco e preço negativo
        GlassCreateDTO invalidDto = new GlassCreateDTO(
                "",
                "Incolor",
                new BigDecimal("4"),
                new BigDecimal("-10.00"),
                new BigDecimal("150.00")
        );

        mockMvc.perform(post("/api/v1/catalog/glasses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidDto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors").isArray())
                .andExpect(jsonPath("$.validationErrors").isNotEmpty());

        // Verifica que o serviço nunca foi chamado pois barrou na Controller
        verify(glassService, never()).create(any());
    }

    @Test
    @DisplayName("Deve retornar 200 OK com página de vidros")
    void shouldReturn200WithPagedGlasses() throws Exception {
        GlassResponseDTO glass = new GlassResponseDTO(
                UUID.randomUUID(), "Vidro Temperado", "Incolor", new BigDecimal("8"),
                new BigDecimal("100"), new BigDecimal("200"), "M2", true
        );

        PageImpl<GlassResponseDTO> page = new PageImpl<>(List.of(glass));

        // Simulamos a resposta do serviço
        when(glassService.findAllGlasses(any(), any(), any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/api/v1/catalog/glasses?thickness=8&color=Incolor&page=0&size=10")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].name").value("Vidro Temperado"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @DisplayName("Deve retornar 200 OK ao atualizar um vidro existente")
    void shouldReturn200WhenUpdatingGlass() throws Exception {
        UUID id = UUID.randomUUID();

        // Corrigido para instanciar com os 6 parâmetros exigidos pelo novo record GlassUpdateDTO
        GlassUpdateDTO updateDto = new GlassUpdateDTO(
                "Vidro Atualizado",
                "Incolor",
                new BigDecimal("4"),
                new BigDecimal("80.00"),
                new BigDecimal("160.00"),
                true
        );

        GlassResponseDTO responseDTO = new GlassResponseDTO(
                id, "Vidro Atualizado", "Incolor", new BigDecimal("4"),
                new BigDecimal("80.00"), new BigDecimal("160.00"), "M2", true
        );

        when(glassService.update(eq(id), any(GlassUpdateDTO.class))).thenReturn(responseDTO);

        mockMvc.perform(put("/api/v1/catalog/glasses/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Vidro Atualizado"))
                .andExpect(jsonPath("$.salePrice").value(160.00));
    }

    @Test
    @DisplayName("Deve retornar 204 NO CONTENT ao deletar (inativar) um vidro")
    void shouldReturn204WhenDeletingGlass() throws Exception {
        UUID id = UUID.randomUUID();

        doNothing().when(glassService).delete(id);

        mockMvc.perform(delete("/api/v1/catalog/glasses/{id}", id))
                .andExpect(status().isNoContent());

        verify(glassService, times(1)).delete(id);
    }
}