package br.edu.ifpb.alumigest.clients.controller;

import br.edu.ifpb.alumigest.clients.domain.PersonType;
import br.edu.ifpb.alumigest.clients.dto.ClientRequestDTO;
import br.edu.ifpb.alumigest.clients.dto.ClientResponseDTO;
import br.edu.ifpb.alumigest.clients.dto.ClientSummaryDTO;
import br.edu.ifpb.alumigest.clients.service.IClientService;
import br.edu.ifpb.alumigest.common.dto.PageResponse;
import br.edu.ifpb.alumigest.common.exception.ConflictException;
import br.edu.ifpb.alumigest.common.exception.GlobalExceptionHandler;
import br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class ClientControllerTest {

    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private IClientService clientService;

    @InjectMocks
    private ClientController clientController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(clientController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .setCustomArgumentResolvers(new PageableHandlerMethodArgumentResolver())
                .build();
    }

    @Test
    @DisplayName("Deve retornar 201 CREATED ao cadastrar cliente válido")
    void create_ShouldReturn201_WhenValid() throws Exception {
        // Arrange
        UUID id = UUID.randomUUID();
        ClientRequestDTO request = new ClientRequestDTO(
                "João da Silva",
                PersonType.FISICA,
                "123.456.789-00",
                "(83) 99999-0000",
                "joao@email.com",
                "58300-000",
                "Rua das Flores",
                "123",
                "Casa",
                "Centro",
                "Santa Rita",
                "PB",
                "Observação"
        );

        ClientResponseDTO response = new ClientResponseDTO(
                id,
                "João da Silva",
                PersonType.FISICA,
                "123.456.789-00",
                "(83) 99999-0000",
                "joao@email.com",
                "58300-000",
                "Rua das Flores",
                "123",
                "Casa",
                "Centro",
                "Santa Rita",
                "PB",
                "Observação",
                true,
                OffsetDateTime.now(),
                OffsetDateTime.now()
        );

        when(clientService.create(any(ClientRequestDTO.class))).thenReturn(response);

        // Act & Assert
        mockMvc.perform(post("/api/clientes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.nomeCompleto").value("João da Silva"))
                .andExpect(jsonPath("$.personType").value("FISICA"))
                .andExpect(jsonPath("$.documento").value("123.456.789-00"))
                .andExpect(jsonPath("$.ativo").value(true));
    }

    @Test
    @DisplayName("Deve retornar 400 BAD REQUEST ao tentar cadastrar cliente com nome vazio")
    void create_ShouldReturn400_WhenNameIsBlank() throws Exception {
        // Arrange
        ClientRequestDTO invalidRequest = new ClientRequestDTO(
                "",
                PersonType.FISICA,
                "123.456.789-00",
                null, null, null, null, null, null, null, null, null, null
        );

        // Act & Assert
        mockMvc.perform(post("/api/clientes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    @DisplayName("Deve retornar 409 CONFLICT quando documento já estiver cadastrado")
    void create_ShouldReturn409_WhenDocumentAlreadyExists() throws Exception {
        // Arrange
        ClientRequestDTO request = new ClientRequestDTO(
                "João da Silva",
                PersonType.FISICA,
                "123.456.789-00",
                null, null, null, null, null, null, null, null, null, null
        );

        when(clientService.create(any(ClientRequestDTO.class)))
                .thenThrow(new ConflictException("Já existe um cliente cadastrado com o documento: 123.456.789-00"));

        // Act & Assert
        mockMvc.perform(post("/api/clientes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message").value("Já existe um cliente cadastrado com o documento: 123.456.789-00"));
    }

    @Test
    @DisplayName("Deve retornar 200 OK ao listar clientes paginados com filtro de personType")
    void findAll_ShouldReturn200AndPageResponse() throws Exception {
        // Arrange
        UUID id = UUID.randomUUID();
        ClientSummaryDTO summary = new ClientSummaryDTO(
                id, "João da Silva", PersonType.FISICA, "123.456.789-00", "(83) 99999-0000", "joao@email.com",
                "Santa Rita", "PB", true
        );

        PageResponse<ClientSummaryDTO> pageResponse = new PageResponse<>(
                List.of(summary), 0, 20, 1, 1, true, true
        );

        when(clientService.findAll(eq("silva"), eq(PersonType.FISICA), eq(true), any(Pageable.class))).thenReturn(pageResponse);

        // Act & Assert
        mockMvc.perform(get("/api/clientes")
                        .param("busca", "silva")
                        .param("personType", "FISICA")
                        .param("ativo", "true")
                        .param("page", "0")
                        .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(id.toString()))
                .andExpect(jsonPath("$.content[0].nomeCompleto").value("João da Silva"))
                .andExpect(jsonPath("$.content[0].personType").value("FISICA"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @DisplayName("Deve retornar 200 OK ao buscar cliente por ID existente")
    void findById_ShouldReturn200_WhenExists() throws Exception {
        // Arrange
        UUID id = UUID.randomUUID();
        ClientResponseDTO response = new ClientResponseDTO(
                id, "Maria Souza", PersonType.FISICA, "987.654.321-99", null, null, null, null, null, null, null, null, null, null, true, null, null
        );

        when(clientService.findById(id)).thenReturn(response);

        // Act & Assert
        mockMvc.perform(get("/api/clientes/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.nomeCompleto").value("Maria Souza"))
                .andExpect(jsonPath("$.personType").value("FISICA"));
    }

    @Test
    @DisplayName("Deve retornar 404 NOT FOUND ao buscar cliente por ID inexistente")
    void findById_ShouldReturn404_WhenDoesNotExist() throws Exception {
        // Arrange
        UUID id = UUID.randomUUID();
        when(clientService.findById(id)).thenThrow(new ResourceNotFoundException("Cliente", id));

        // Act & Assert
        mockMvc.perform(get("/api/clientes/{id}", id))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    @DisplayName("Deve retornar 200 OK ao atualizar cliente")
    void update_ShouldReturn200_WhenValid() throws Exception {
        // Arrange
        UUID id = UUID.randomUUID();
        ClientRequestDTO request = new ClientRequestDTO(
                "Nome Atualizado",
                PersonType.FISICA,
                "123.456.789-00",
                null, null, null, null, null, null, null, null, null, null
        );

        ClientResponseDTO response = new ClientResponseDTO(
                id, "Nome Atualizado", PersonType.FISICA, "123.456.789-00", null, null, null, null, null, null, null, null, null, null, true, null, null
        );

        when(clientService.update(eq(id), any(ClientRequestDTO.class))).thenReturn(response);

        // Act & Assert
        mockMvc.perform(put("/api/clientes/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.nomeCompleto").value("Nome Atualizado"));
    }

    @Test
    @DisplayName("Deve retornar 200 OK ao alternar status do cliente")
    void toggleStatus_ShouldReturn200_WhenToggled() throws Exception {
        // Arrange
        UUID id = UUID.randomUUID();
        ClientResponseDTO response = new ClientResponseDTO(
                id, "Cliente", PersonType.FISICA, null, null, null, null, null, null, null, null, null, null, null, false, null, null
        );

        when(clientService.toggleStatus(id)).thenReturn(response);

        // Act & Assert
        mockMvc.perform(patch("/api/clientes/{id}/status", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ativo").value(false));
    }
}
