package br.edu.ifpb.alumigest.budgets.controller;

import br.edu.ifpb.alumigest.budgets.domain.BudgetStatus;
import br.edu.ifpb.alumigest.budgets.dto.BudgetRequestDTO;
import br.edu.ifpb.alumigest.budgets.dto.BudgetResponseDTO;
import br.edu.ifpb.alumigest.budgets.dto.BudgetStatusUpdateDTO;
import br.edu.ifpb.alumigest.budgets.dto.BudgetSummaryResponseDTO;
import br.edu.ifpb.alumigest.budgets.service.BudgetService;
import br.edu.ifpb.alumigest.common.dto.PageResponse;
import br.edu.ifpb.alumigest.common.exception.BudgetImmutableException;
import br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException;
import br.edu.ifpb.alumigest.common.exception.GlobalExceptionHandler;
import br.edu.ifpb.alumigest.common.exception.InvalidBudgetStatusTransitionException;
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

import br.edu.ifpb.alumigest.budgets.dto.BudgetItemRequestDTO;
import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class BudgetControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private BudgetService budgetService;

    private BudgetController budgetController;

    @BeforeEach
    void setUp() {
        budgetService = mock(BudgetService.class);
        budgetController = new BudgetController(budgetService);

        mockMvc = MockMvcBuilders.standaloneSetup(budgetController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .setCustomArgumentResolvers(new PageableHandlerMethodArgumentResolver())
                .build();
    }

    @Test
    @DisplayName("Deve retornar 201 ao criar orçamento")
    void create_ShouldReturn201() throws Exception {
        UUID id = UUID.randomUUID();
        BudgetItemRequestDTO itemRequest = new BudgetItemRequestDTO(UUID.randomUUID(), BigDecimal.TEN, BigDecimal.TEN, 1, BigDecimal.ZERO, null, null, null, null, null, null);
        BudgetRequestDTO request = new BudgetRequestDTO(UUID.randomUUID(), BigDecimal.ZERO, "Notes", List.of(itemRequest));
        BudgetResponseDTO response = new BudgetResponseDTO(id, "ORC-2026-001", UUID.randomUUID(), "João da Silva", BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BudgetStatus.DRAFT, "Notes", null, null, null, null);

        when(budgetService.create(any())).thenReturn(response);

        mockMvc.perform(post("/api/orcamentos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"))
                .andExpect(jsonPath("$.id").value(id.toString()));
    }

    @Test
    @DisplayName("Deve listar orçamentos com paginação")
    void findAll_ShouldReturn200() throws Exception {
        UUID id = UUID.randomUUID();
        BudgetSummaryResponseDTO summary = new BudgetSummaryResponseDTO(id, "ORC-2026-001", "João da Silva", BigDecimal.ZERO, BudgetStatus.DRAFT, null, null);
        PageResponse<BudgetSummaryResponseDTO> pageResponse = new PageResponse<>(List.of(summary), 0, 20, 1, 1, true, true);

        when(budgetService.findAll(eq("busca"), eq(BudgetStatus.DRAFT), any(Pageable.class))).thenReturn(pageResponse);

        mockMvc.perform(get("/api/orcamentos")
                .param("busca", "busca")
                .param("status", "DRAFT")
                .param("page", "0")
                .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(id.toString()));
    }

    @Test
    @DisplayName("Deve retornar 200 ao buscar por ID existente")
    void findById_ShouldReturn200() throws Exception {
        UUID id = UUID.randomUUID();
        BudgetResponseDTO response = new BudgetResponseDTO(id, "ORC-2026-001", UUID.randomUUID(), "João da Silva", BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BudgetStatus.DRAFT, "Notes", null, null, null, Collections.emptyList());

        when(budgetService.findById(id)).thenReturn(response);

        mockMvc.perform(get("/api/orcamentos/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()));
    }

    @Test
    @DisplayName("Deve retornar 404 ao buscar por ID inexistente")
    void findById_ShouldReturn404() throws Exception {
        UUID id = UUID.randomUUID();
        when(budgetService.findById(id)).thenThrow(new ResourceNotFoundException("Budget", id.toString()));

        mockMvc.perform(get("/api/orcamentos/{id}", id))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    @DisplayName("Deve retornar 200 ao atualizar orçamento DRAFT")
    void update_ShouldReturn200() throws Exception {
        UUID id = UUID.randomUUID();
        BudgetItemRequestDTO itemRequest = new BudgetItemRequestDTO(UUID.randomUUID(), BigDecimal.TEN, BigDecimal.TEN, 1, BigDecimal.ZERO, null, null, null, null, null, null);
        BudgetRequestDTO request = new BudgetRequestDTO(UUID.randomUUID(), BigDecimal.ZERO, "Notes", List.of(itemRequest));
        BudgetResponseDTO response = new BudgetResponseDTO(id, "ORC-2026-001", UUID.randomUUID(), "João da Silva", BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BudgetStatus.DRAFT, "Notes", null, null, null, null);

        when(budgetService.update(eq(id), any())).thenReturn(response);

        mockMvc.perform(put("/api/orcamentos/{id}", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()));
    }

    @Test
    @DisplayName("Deve retornar 422 ao atualizar orçamento não DRAFT")
    void update_ShouldReturn422() throws Exception {
        UUID id = UUID.randomUUID();
        BudgetItemRequestDTO itemRequest = new BudgetItemRequestDTO(UUID.randomUUID(), BigDecimal.TEN, BigDecimal.TEN, 1, BigDecimal.ZERO, null, null, null, null, null, null);
        BudgetRequestDTO request = new BudgetRequestDTO(UUID.randomUUID(), BigDecimal.ZERO, "Notes", List.of(itemRequest));

        when(budgetService.update(eq(id), any())).thenThrow(new BudgetImmutableException("Immutable"));

        mockMvc.perform(put("/api/orcamentos/{id}", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.status").value(422));
    }

    @Test
    @DisplayName("Deve retornar 200 ao atualizar status válido")
    void updateStatus_ShouldReturn200() throws Exception {
        UUID id = UUID.randomUUID();
        BudgetStatusUpdateDTO request = new BudgetStatusUpdateDTO(BudgetStatus.SENT);

        mockMvc.perform(patch("/api/orcamentos/{id}/status", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Deve retornar 422 ao atualizar status inválido")
    void updateStatus_ShouldReturn422() throws Exception {
        UUID id = UUID.randomUUID();
        BudgetStatusUpdateDTO request = new BudgetStatusUpdateDTO(BudgetStatus.APPROVED);

        doThrow(new InvalidBudgetStatusTransitionException(BudgetStatus.DRAFT, BudgetStatus.APPROVED))
                .when(budgetService).updateStatus(eq(id), any());

        mockMvc.perform(patch("/api/orcamentos/{id}/status", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.status").value(422));
    }

    @Test
    @DisplayName("Deve retornar 204 ao deletar")
    void delete_ShouldReturn204() throws Exception {
        UUID id = UUID.randomUUID();

        mockMvc.perform(delete("/api/orcamentos/{id}", id))
                .andExpect(status().isNoContent());
    }
}
