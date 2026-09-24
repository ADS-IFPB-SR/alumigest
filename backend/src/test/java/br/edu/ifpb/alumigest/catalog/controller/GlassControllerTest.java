package br.edu.ifpb.alumigest.catalog.controller;

import br.edu.ifpb.alumigest.catalog.dto.GlassCreateDTO;
import br.edu.ifpb.alumigest.catalog.dto.GlassResponseDTO;
import br.edu.ifpb.alumigest.catalog.dto.GlassUpdateDTO;
import br.edu.ifpb.alumigest.catalog.service.IGlassService;
import br.edu.ifpb.alumigest.common.exception.GlobalExceptionHandler;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
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
class GlassControllerTest {

    private MockMvc mockMvc;

    private ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private IGlassService glassService;

    @InjectMocks
    private GlassController glassController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(glassController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .setCustomArgumentResolvers(new PageableHandlerMethodArgumentResolver())
                .build();
    }

    @Test
    @DisplayName("Deve retornar 201 CREATED ao cadastrar um vidro válido")
    void shouldReturn201WhenCreatingValidGlass() throws Exception {
        GlassCreateDTO requestDTO = new GlassCreateDTO(
                "Vidro Incolor 4mm",
                "Incolor",
                "70071900",
                new BigDecimal("4"),
                new BigDecimal("80.00"),
                new BigDecimal("150.00"),
                new BigDecimal("2000"),
                new BigDecimal("3000")
        );

        GlassResponseDTO responseDTO = new GlassResponseDTO(
                UUID.randomUUID(),
                "Vidro Incolor 4mm",
                "Incolor",
                "70071900",
                new BigDecimal("4"),
                new BigDecimal("80.00"),
                new BigDecimal("150.00"),
                "M2",
                true,
                new BigDecimal("2000"),
                new BigDecimal("3000")
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
                "70071900",
                new BigDecimal("4"),
                new BigDecimal("-10.00"),
                new BigDecimal("150.00"),
                new BigDecimal("2000"),
                new BigDecimal("3000")
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
        GlassResponseDTO responseDTO = new GlassResponseDTO(
                UUID.randomUUID(),
                "Vidro Incolor 4mm",
                "Incolor",
                "70071900",
                new BigDecimal("4"),
                new BigDecimal("80.00"),
                new BigDecimal("150.00"),
                "M2",
                true,
                new BigDecimal("2000"),
                new BigDecimal("3000")
        );

        when(glassService.findAllGlasses(any(), any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(responseDTO), PageRequest.of(0, 10), 1));

        mockMvc.perform(get("/api/v1/catalog/glasses")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].name").value("Vidro Incolor 4mm"))
                .andExpect(jsonPath("$.content[0].ncmCode").value("70071900"));

        verify(glassService, times(1)).findAllGlasses(any(), any(), any(Pageable.class));
    }

    @Test
    @DisplayName("Deve retornar 200 OK ao atualizar um vidro existente")
    void shouldReturn200WhenUpdatingGlass() throws Exception {
        UUID id = UUID.randomUUID();
        GlassUpdateDTO updateDto = new GlassUpdateDTO(
                "Vidro Atualizado",
                "Fume",
                new BigDecimal("6"),
                "70071900",
                new BigDecimal("90.00"),
                new BigDecimal("160.00"),
                true,
                new BigDecimal("2000"),
                new BigDecimal("3000")
        );

        GlassResponseDTO responseDTO = new GlassResponseDTO(
                id, "Vidro Atualizado", "Fume", "70071900", new BigDecimal("6"),
                new BigDecimal("90.00"), new BigDecimal("160.00"), "M2", true,
                new BigDecimal("2000"), new BigDecimal("3000")
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
