package br.edu.ifpb.alumigest.budgets.controller;

import br.edu.ifpb.alumigest.budgets.domain.BudgetStatus;
import br.edu.ifpb.alumigest.budgets.domain.PaymentCondition; // NOVO IMPORT
import br.edu.ifpb.alumigest.budgets.domain.DiscountType;
import br.edu.ifpb.alumigest.budgets.dto.BudgetItemResponseDTO;
import br.edu.ifpb.alumigest.budgets.dto.DiscountRequest;
import br.edu.ifpb.alumigest.budgets.dto.BudgetItemCalculationRequestDTO;
import br.edu.ifpb.alumigest.budgets.dto.BudgetItemCalculationResponseDTO;
import br.edu.ifpb.alumigest.budgets.dto.BudgetItemRequestDTO;
import br.edu.ifpb.alumigest.budgets.dto.BudgetPdfDTO;
import br.edu.ifpb.alumigest.budgets.dto.BudgetRequestDTO;
import br.edu.ifpb.alumigest.budgets.dto.BudgetResponseDTO;
import br.edu.ifpb.alumigest.budgets.dto.BudgetSummaryResponseDTO;
import br.edu.ifpb.alumigest.budgets.dto.StatusChangeRequest;
import br.edu.ifpb.alumigest.budgets.service.BudgetQuantityService;
import br.edu.ifpb.alumigest.budgets.service.BudgetService;
import br.edu.ifpb.alumigest.common.dto.PageResponse;
import br.edu.ifpb.alumigest.common.exception.BudgetImmutableException;
import br.edu.ifpb.alumigest.common.exception.BusinessException;
import br.edu.ifpb.alumigest.common.exception.GlobalExceptionHandler;
import br.edu.ifpb.alumigest.common.exception.InvalidBudgetStatusTransitionException;
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

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class BudgetControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private BudgetService budgetService;

    @Mock
    private BudgetQuantityService budgetQuantityService;

    @InjectMocks
    private BudgetController budgetController;

    @BeforeEach
    void setUp() {
        objectMapper.findAndRegisterModules();
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
        
        BudgetResponseDTO response = new BudgetResponseDTO(
                id, "ORC-2026-001", UUID.randomUUID(), "João da Silva", 
                BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, 
                PaymentCondition.A_VISTA_PIX, "À Vista (PIX / Dinheiro)", null, 
                BudgetStatus.DRAFT, "Rascunho", "Notes", 
                null, null, null, false, Collections.emptyList()
        );

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
        BudgetSummaryResponseDTO summary = new BudgetSummaryResponseDTO(
                id, "ORC-2026-001", "João da Silva", 2, BigDecimal.valueOf(1500.00), BudgetStatus.DRAFT, null, null, false);
        PageResponse<BudgetSummaryResponseDTO> pageResponse = new PageResponse<>(List.of(summary), 0, 20, 1, 1, true, true);

        when(budgetService.listar(eq("busca"), eq(BudgetStatus.DRAFT), any(Pageable.class))).thenReturn(pageResponse);

        mockMvc.perform(get("/api/orcamentos")
                .param("busca", "busca")
                .param("status", "DRAFT")
                .param("page", "0")
                .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(id.toString()))
                .andExpect(jsonPath("$.content[0].totalItems").value(2))
                .andExpect(jsonPath("$.content[0].itemCount").value(2))
                .andExpect(jsonPath("$.content[0].expired").value(false))
                .andExpect(jsonPath("$.content[0].isExpired").value(false));
    }

    @Test
    @DisplayName("Deve retornar 200 ao buscar por ID existente")
    void findById_ShouldReturn200() throws Exception {
        UUID id = UUID.randomUUID();
        BudgetResponseDTO response = new BudgetResponseDTO(
                id, "ORC-2026-001", UUID.randomUUID(), "João da Silva", 
                BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, 
                PaymentCondition.A_VISTA_PIX, "À Vista (PIX / Dinheiro)", null, 
                BudgetStatus.DRAFT, "Rascunho", "Notes", 
                null, null, null, false, Collections.emptyList()
        );

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
        
        BudgetResponseDTO response = new BudgetResponseDTO(
                id, "ORC-2026-001", UUID.randomUUID(), "João da Silva", 
                BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, 
                PaymentCondition.A_VISTA_PIX, "À Vista (PIX / Dinheiro)", null, 
                BudgetStatus.DRAFT, "Rascunho", "Notes", 
                null, null, null, false, Collections.emptyList()
        );

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
    @DisplayName("Deve retornar 200 ao atualizar status válido com StatusChangeRequest")
    void updateStatus_ShouldReturn200() throws Exception {
        UUID id = UUID.randomUUID();
        StatusChangeRequest request = new StatusChangeRequest(BudgetStatus.SENT);

        mockMvc.perform(patch("/api/orcamentos/{id}/status", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Deve retornar 200 ao atualizar status via rota /api/budgets/{id}/status")
    void updateStatus_ViaBudgetsRoute_ShouldReturn200() throws Exception {
        UUID id = UUID.randomUUID();
        StatusChangeRequest request = new StatusChangeRequest(BudgetStatus.SENT);

        mockMvc.perform(patch("/api/budgets/{id}/status", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Deve retornar 200 ao atualizar status via payload com alias legado 'status'")
    void updateStatus_WithLegacyAlias_ShouldReturn200() throws Exception {
        UUID id = UUID.randomUUID();

        mockMvc.perform(patch("/api/orcamentos/{id}/status", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"status\":\"SENT\"}"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Deve retornar 400 ao enviar status nulo")
    void updateStatus_ShouldReturn400_WhenStatusIsNull() throws Exception {
        UUID id = UUID.randomUUID();

        mockMvc.perform(patch("/api/orcamentos/{id}/status", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"novoStatus\":null}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Deve retornar 422 ao atualizar status inválido")
    void updateStatus_ShouldReturn422() throws Exception {
        UUID id = UUID.randomUUID();
        StatusChangeRequest request = new StatusChangeRequest(BudgetStatus.APPROVED);

        doThrow(new InvalidBudgetStatusTransitionException(BudgetStatus.DRAFT, BudgetStatus.APPROVED))
                .when(budgetService).updateStatus(eq(id), any(StatusChangeRequest.class));

        mockMvc.perform(patch("/api/orcamentos/{id}/status", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.status").value(422));
    }

    @Test
    @DisplayName("Deve retornar 200 no preview de cálculo de insumos")
    void previewCalculation_ShouldReturn200() throws Exception {
        var request = new BudgetItemCalculationRequestDTO(
                "SLIDING_DOOR_2F",
                new BigDecimal("2000"),
                new BigDecimal("2100"),
                1,
                List.of(new BudgetItemCalculationRequestDTO.BudgetItemOptionCalculationDTO(
                        UUID.randomUUID(), "GLASS", new BigDecimal("4.20")
                ))
        );

        var response = new BudgetItemCalculationResponseDTO(
                new BigDecimal("4.20"),
                new BigDecimal("8.20"),
                List.of(new BudgetItemCalculationResponseDTO.BudgetItemOptionCalculationResultDTO(
                        UUID.randomUUID(), "GLASS", new BigDecimal("4.20"), new BigDecimal("4.20"), false, null
                ))
        );

        when(budgetQuantityService.previewCalculation(any())).thenReturn(response);

        mockMvc.perform(post("/api/v1/budgets/items/preview-calculation")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.physicalAreaM2").value(4.20));
    }
    // ============================================================
    // Testes de Aplicação de Desconto (PUT /{id}/discount e /{id}/desconto)
    // ============================================================

    @Test
    @DisplayName("Deve retornar 200 ao aplicar desconto com sucesso")
    void aplicarDesconto_ShouldReturn200() throws Exception {
        UUID id = UUID.randomUUID();
        DiscountRequest request = new DiscountRequest(
                DiscountType.PERCENTUAL,
                new BigDecimal("10.00"),
                PaymentCondition.A_VISTA_PIX,
                "Desconto especial cliente VIP",
                LocalDate.now().plusDays(10)
        );

        BudgetResponseDTO response = new BudgetResponseDTO(
                id, "ORC-2026-001", UUID.randomUUID(), "João da Silva",
                new BigDecimal("1000.00"), new BigDecimal("10.00"), new BigDecimal("100.00"), new BigDecimal("900.00"),
                PaymentCondition.A_VISTA_PIX, "À Vista (PIX / Dinheiro)", "Desconto especial cliente VIP",
                BudgetStatus.DRAFT, "Rascunho", "Notes",
                null, null, null, false, Collections.emptyList()
        );

        when(budgetService.aplicarDesconto(eq(id), any(DiscountRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/budgets/{id}/discount", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.discountPercent").value(10.00))
                .andExpect(jsonPath("$.discountValue").value(100.00))
                .andExpect(jsonPath("$.total").value(900.00));
    }

    @Test
    @DisplayName("Deve retornar 200 ao aplicar desconto via rota legada /api/orcamentos/{id}/desconto")
    void aplicarDesconto_ViaLegacyAlias_ShouldReturn200() throws Exception {
        UUID id = UUID.randomUUID();
        DiscountRequest request = new DiscountRequest(
                DiscountType.VALOR_FIXO,
                new BigDecimal("50.00"),
                PaymentCondition.A_VISTA_PIX,
                null,
                null
        );

        BudgetResponseDTO response = new BudgetResponseDTO(
                id, "ORC-2026-001", UUID.randomUUID(), "João da Silva",
                new BigDecimal("500.00"), new BigDecimal("10.00"), new BigDecimal("50.00"), new BigDecimal("450.00"),
                PaymentCondition.A_VISTA_PIX, "À Vista (PIX / Dinheiro)", null,
                BudgetStatus.DRAFT, "Rascunho", null,
                null, null, null, false, Collections.emptyList()
        );

        when(budgetService.aplicarDesconto(eq(id), any(DiscountRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/orcamentos/{id}/desconto", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.total").value(450.00));
    }

    @Test
    @DisplayName("Deve retornar 400 ao aplicar desconto com payload inválido")
    void aplicarDesconto_ShouldReturn400_WhenPayloadInvalid() throws Exception {
        UUID id = UUID.randomUUID();

        // Envia payload com campos obrigatórios nulos (tipoDesconto nulo, valor negativo)
        mockMvc.perform(put("/api/budgets/{id}/discount", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"tipoDesconto\":null, \"valor\":-10, \"condicaoPagamento\":null}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Deve retornar 404 ao aplicar desconto quando orçamento não existir")
    void aplicarDesconto_ShouldReturn404_WhenBudgetNotFound() throws Exception {
        UUID id = UUID.randomUUID();
        DiscountRequest request = new DiscountRequest(
                DiscountType.PERCENTUAL,
                BigDecimal.TEN,
                PaymentCondition.A_VISTA_PIX,
                null,
                null
        );

        when(budgetService.aplicarDesconto(eq(id), any(DiscountRequest.class)))
                .thenThrow(new ResourceNotFoundException("Budget", id.toString()));

        mockMvc.perform(put("/api/budgets/{id}/discount", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    @DisplayName("Deve retornar 422 ao aplicar desconto quando orçamento for imutável")
    void aplicarDesconto_ShouldReturn422_WhenBudgetImmutable() throws Exception {
        UUID id = UUID.randomUUID();
        DiscountRequest request = new DiscountRequest(
                DiscountType.PERCENTUAL,
                BigDecimal.TEN,
                PaymentCondition.A_VISTA_PIX,
                null,
                null
        );

        when(budgetService.aplicarDesconto(eq(id), any(DiscountRequest.class)))
                .thenThrow(new BudgetImmutableException("Orçamento imutável"));

        mockMvc.perform(put("/api/budgets/{id}/discount", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.status").value(422));
    }

    // ============================================================
    // Testes de Adição de Item (POST /{id}/items e /{id}/itens)
    // ============================================================

    @Test
    @DisplayName("Deve retornar 201 ao adicionar item com sucesso")
    void adicionarItem_ShouldReturn201() throws Exception {
        UUID budgetId = UUID.randomUUID();
        UUID itemId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();

        BudgetItemRequestDTO request = new BudgetItemRequestDTO(
                productId,
                new BigDecimal("1200.00"),
                new BigDecimal("2100.00"),
                2,
                new BigDecimal("150.00"),
                "SLIDING_DOOR_2F",
                null, null, null,
                "Observação do item",
                null
        );

        BudgetItemResponseDTO response = new BudgetItemResponseDTO(
                itemId,
                productId,
                "Janela de Correr 2 Folhas",
                "SLIDING_DOOR_2F",
                null, null, null,
                new BigDecimal("1200.00"),
                new BigDecimal("2100.00"),
                2,
                new BigDecimal("150.00"),
                new BigDecimal("600.00"),
                "Observação do item",
                Collections.emptyList()
        );

        when(budgetService.adicionarItem(eq(budgetId), any(BudgetItemRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/api/budgets/{id}/items", budgetId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"))
                .andExpect(jsonPath("$.id").value(itemId.toString()))
                .andExpect(jsonPath("$.productName").value("Janela de Correr 2 Folhas"))
                .andExpect(jsonPath("$.quantity").value(2));
    }

    @Test
    @DisplayName("Deve retornar 201 ao adicionar item via rota legada /api/orcamentos/{id}/itens")
    void adicionarItem_ViaLegacyAlias_ShouldReturn201() throws Exception {
        UUID budgetId = UUID.randomUUID();
        UUID itemId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();

        BudgetItemRequestDTO request = new BudgetItemRequestDTO(
                productId,
                new BigDecimal("1000.00"),
                new BigDecimal("1500.00"),
                1,
                BigDecimal.ZERO,
                null, null, null, null, null, null
        );

        BudgetItemResponseDTO response = new BudgetItemResponseDTO(
                itemId,
                productId,
                "Item Teste",
                null, null, null, null,
                new BigDecimal("1000.00"),
                new BigDecimal("1500.00"),
                1,
                BigDecimal.ZERO,
                new BigDecimal("300.00"),
                null,
                Collections.emptyList()
        );

        when(budgetService.adicionarItem(eq(budgetId), any(BudgetItemRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/api/orcamentos/{id}/itens", budgetId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"))
                .andExpect(jsonPath("$.id").value(itemId.toString()));
    }

    @Test
    @DisplayName("Deve retornar 201 ao adicionar item usando aliases em português (BudgetItemCreateRequest)")
    void adicionarItem_WithPortugueseAliases_ShouldReturn201() throws Exception {
        UUID budgetId = UUID.randomUUID();
        UUID itemId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();

        String payloadJson = String.format("""
                {
                    "productId": "%s",
                    "descricao": "Porta Pivotante",
                    "larguraMm": 1000.00,
                    "alturaMm": 2200.00,
                    "quantidade": 1,
                    "valorUnitario": 200.00,
                    "ferragens": "Puxador Inox"
                }
                """, productId);

        BudgetItemResponseDTO response = new BudgetItemResponseDTO(
                itemId,
                productId,
                "Porta Pivotante",
                null, null, "Puxador Inox", null,
                new BigDecimal("1000.00"),
                new BigDecimal("2200.00"),
                1,
                new BigDecimal("200.00"),
                new BigDecimal("800.00"),
                "Porta Pivotante",
                Collections.emptyList()
        );

        when(budgetService.adicionarItem(eq(budgetId), any(BudgetItemRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/api/budgets/{id}/items", budgetId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payloadJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(itemId.toString()))
                .andExpect(jsonPath("$.productName").value("Porta Pivotante"));
    }

    @Test
    @DisplayName("Deve retornar 400 ao adicionar item com dados inválidos")
    void adicionarItem_ShouldReturn400_WhenPayloadInvalid() throws Exception {
        UUID budgetId = UUID.randomUUID();

        // Envia payload sem productId e com dimensões negativas e quantidade zero
        String invalidJson = """
                {
                    "productId": null,
                    "widthMm": -10,
                    "heightMm": 0,
                    "quantity": 0
                }
                """;

        mockMvc.perform(post("/api/budgets/{id}/items", budgetId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Deve retornar 404 ao adicionar item em orçamento inexistente")
    void adicionarItem_ShouldReturn404_WhenBudgetNotFound() throws Exception {
        UUID budgetId = UUID.randomUUID();
        BudgetItemRequestDTO request = new BudgetItemRequestDTO(
                UUID.randomUUID(),
                new BigDecimal("1000.00"),
                new BigDecimal("1000.00"),
                1,
                BigDecimal.ZERO,
                null, null, null, null, null, null
        );

        when(budgetService.adicionarItem(eq(budgetId), any(BudgetItemRequestDTO.class)))
                .thenThrow(new ResourceNotFoundException("Budget", budgetId.toString()));

        mockMvc.perform(post("/api/budgets/{id}/items", budgetId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    @DisplayName("Deve retornar 422 ao adicionar item em orçamento não DRAFT")
    void adicionarItem_ShouldReturn422_WhenBudgetImmutable() throws Exception {
        UUID budgetId = UUID.randomUUID();
        BudgetItemRequestDTO request = new BudgetItemRequestDTO(
                UUID.randomUUID(),
                new BigDecimal("1000.00"),
                new BigDecimal("1000.00"),
                1,
                BigDecimal.ZERO,
                null, null, null, null, null, null
        );

        when(budgetService.adicionarItem(eq(budgetId), any(BudgetItemRequestDTO.class)))
                .thenThrow(new BudgetImmutableException("Orçamento não pode ser alterado pois não está em DRAFT"));

        mockMvc.perform(post("/api/budgets/{id}/items", budgetId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.status").value(422));
    }

    @Test
    @DisplayName("Deve retornar 200 e bytes do PDF comercial com headers corretos")
    void gerarPdfComercial_DeveRetornar200EHeadersCorretos_QuandoOrcamentoExiste() throws Exception {
        UUID id = UUID.randomUUID();
        byte[] pdfBytesMock = "%PDF-1.4 mock content".getBytes();
        BudgetPdfDTO pdfDtoMock = new BudgetPdfDTO(pdfBytesMock, "ORC-2026-001-comercial.pdf");

        when(budgetService.gerarPdfComercial(id)).thenReturn(pdfDtoMock);

        mockMvc.perform(get("/api/budgets/{id}/pdf/comercial", id))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "application/pdf"))
                .andExpect(header().string("Content-Disposition", org.hamcrest.Matchers.containsString("ORC-2026-001-comercial.pdf")))
                .andExpect(header().longValue("Content-Length", pdfBytesMock.length))
                .andExpect(content().bytes(pdfBytesMock));

        verify(budgetService).gerarPdfComercial(id);
    }

    @Test
    @DisplayName("Deve retornar 200 ao gerar PDF comercial via rota legada /api/orcamentos/{id}/pdf/comercial")
    void gerarPdfComercial_ViaRotaLegada_DeveRetornar200() throws Exception {
        UUID id = UUID.randomUUID();
        byte[] pdfBytesMock = "%PDF-1.4 mock".getBytes();
        BudgetPdfDTO pdfDtoMock = new BudgetPdfDTO(pdfBytesMock, "ORC-1024-comercial.pdf");

        when(budgetService.gerarPdfComercial(id)).thenReturn(pdfDtoMock);

        mockMvc.perform(get("/api/orcamentos/{id}/pdf/comercial", id))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "application/pdf"))
                .andExpect(header().string("Content-Disposition", org.hamcrest.Matchers.containsString("ORC-1024-comercial.pdf")))
                .andExpect(content().bytes(pdfBytesMock));
    }

    @Test
    @DisplayName("Deve retornar 404 quando o orçamento não existir ao tentar emitir PDF comercial")
    void gerarPdfComercial_DeveRetornar404_QuandoOrcamentoNaoExiste() throws Exception {
        UUID id = UUID.randomUUID();

        when(budgetService.gerarPdfComercial(id))
                .thenThrow(new ResourceNotFoundException("Orçamento", id.toString()));

        mockMvc.perform(get("/api/budgets/{id}/pdf/comercial", id))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("não encontrado")));
    }

    @Test
    @DisplayName("Deve retornar 422 quando tentar emitir PDF comercial de orçamento cancelado")
    void gerarPdfComercial_DeveRetornar422_QuandoOrcamentoCancelado() throws Exception {
        UUID id = UUID.randomUUID();

        when(budgetService.gerarPdfComercial(id))
                .thenThrow(new BusinessException("Não é possível gerar o PDF de um orçamento cancelado."));

        mockMvc.perform(get("/api/budgets/{id}/pdf/comercial", id))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.status").value(422))
                .andExpect(jsonPath("$.message").value("Não é possível gerar o PDF de um orçamento cancelado."));
    }

    @Test
    @DisplayName("Deve usar fallback de nome de arquivo quando retornado pelo serviço")
    void gerarPdfComercial_DeveUsarFallbackFilename_QuandoCodigoNulo() throws Exception {
        UUID id = UUID.randomUUID();
        byte[] pdfBytesMock = "%PDF-1.4 mock".getBytes();
        BudgetPdfDTO pdfDtoMock = new BudgetPdfDTO(pdfBytesMock, "orcamento-comercial.pdf");

        when(budgetService.gerarPdfComercial(id)).thenReturn(pdfDtoMock);

        mockMvc.perform(get("/api/budgets/{id}/pdf/comercial", id))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", org.hamcrest.Matchers.containsString("orcamento-comercial.pdf")));
    }
}