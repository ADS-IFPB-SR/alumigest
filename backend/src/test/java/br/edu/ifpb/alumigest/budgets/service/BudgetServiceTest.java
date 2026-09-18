package br.edu.ifpb.alumigest.budgets.service;

import br.edu.ifpb.alumigest.budgets.domain.*;
import br.edu.ifpb.alumigest.budgets.dto.*;
import br.edu.ifpb.alumigest.budgets.mapper.BudgetMapper;
import br.edu.ifpb.alumigest.budgets.repository.BudgetRepository;
import br.edu.ifpb.alumigest.clients.domain.Client;
import br.edu.ifpb.alumigest.clients.repository.ClientRepository;
import br.edu.ifpb.alumigest.common.dto.PageResponse;
import br.edu.ifpb.alumigest.common.exception.BudgetImmutableException;
import br.edu.ifpb.alumigest.common.exception.BusinessException;
import br.edu.ifpb.alumigest.common.exception.InvalidBudgetStatusTransitionException;
import br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.mockito.ArgumentCaptor;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class BudgetServiceTest {

    @Mock
    private BudgetRepository budgetRepository;

    @Mock
    private ClientRepository clientRepository;

    @Mock
    private BudgetMapper budgetMapper;

    private BudgetQuantityService budgetQuantityService;

    @Mock
    private BudgetPricingService budgetPricingService;

    @Mock
    private BudgetCodeGenerator budgetCodeGenerator;

    private BudgetService budgetService;

    private Client client;
    private Budget budget;
    private BudgetCreateRequest createRequest;
    private BudgetRequestDTO requestDTO;

    @BeforeEach
    void setUp() {
        org.mockito.MockitoAnnotations.openMocks(this);
        budgetQuantityService = new BudgetQuantityService(null, null, null) {
            @Override
            public void calculateQuantities(Budget b) {
                // No-op for BudgetServiceTest
            }
        };
        budgetService = new BudgetService(
                budgetRepository,
                clientRepository,
                budgetMapper,
                budgetQuantityService,
                budgetPricingService,
                budgetCodeGenerator
        );

        client = new Client();
        client.setId(UUID.randomUUID());

        budget = new Budget();
        budget.setId(UUID.randomUUID());
        budget.setClient(client);
        budget.setStatus(BudgetStatus.DRAFT);
        budget.setCode("ORC-2026-001");

        createRequest = new BudgetCreateRequest(client.getId(), "Notes");

        BudgetItemRequestDTO itemRequest = new BudgetItemRequestDTO(UUID.randomUUID(), BigDecimal.TEN, BigDecimal.TEN, 1, BigDecimal.ZERO, null, null, null, null, null, null);
        requestDTO = new BudgetRequestDTO(client.getId(), BigDecimal.ZERO, "Notes", List.of(itemRequest));
    }

    @Test
    @DisplayName("Criação válida")
    void create_ShouldReturnBudget_WhenValid() {
        when(clientRepository.findById(client.getId())).thenReturn(Optional.of(client));
        when(budgetMapper.toEntity(createRequest)).thenReturn(new Budget());
        when(budgetRepository.save(any(Budget.class))).thenReturn(budget);

        BudgetResponseDTO responseDTO = new BudgetResponseDTO(
                budget.getId(), "ORC-2026-001", client.getId(), "João da Silva",
                BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO,
                PaymentCondition.A_VISTA_PIX, "À Vista (PIX / Dinheiro)", null,
                BudgetStatus.DRAFT, "Rascunho", "Notes",
                null, null, null, false, Collections.emptyList()
        );
        when(budgetMapper.toResponseDTO(budget)).thenReturn(responseDTO);

        BudgetResponseDTO result = budgetService.create(createRequest);

        assertThat(result).isNotNull();
        assertThat(result.code()).isEqualTo("ORC-2026-001");
        verify(budgetRepository, times(1)).save(any(Budget.class));
    }

    @Test
    @DisplayName("Criação: Status inicial deve ser DRAFT")
    void create_ShouldSetStatusDraft_OnNewBudget() {
        when(clientRepository.findById(client.getId())).thenReturn(Optional.of(client));
        Budget mappedBudget = new Budget();
        mappedBudget.setStatus(BudgetStatus.SENT);
        when(budgetMapper.toEntity(createRequest)).thenReturn(mappedBudget);
        when(budgetRepository.save(any(Budget.class))).thenReturn(budget);
        when(budgetMapper.toResponseDTO(budget)).thenReturn(null);

        org.mockito.ArgumentCaptor<Budget> captor = org.mockito.ArgumentCaptor.forClass(Budget.class);

        budgetService.create(createRequest);

        verify(budgetRepository).save(captor.capture());
        assertThat(captor.getValue().getStatus()).isEqualTo(BudgetStatus.DRAFT);
    }

    @Test
    @DisplayName("Criação: Deve atribuir validade padrão de 15 dias quando não informada")
    void create_ShouldSetDefaultValidUntil_WhenNotProvided() {
        when(clientRepository.findById(client.getId())).thenReturn(Optional.of(client));
        when(budgetMapper.toEntity(createRequest)).thenReturn(new Budget()); // validUntil = null
        when(budgetRepository.save(any(Budget.class))).thenReturn(budget);
        when(budgetMapper.toResponseDTO(budget)).thenReturn(null);

        org.mockito.ArgumentCaptor<Budget> captor = org.mockito.ArgumentCaptor.forClass(Budget.class);
        java.time.OffsetDateTime before = java.time.OffsetDateTime.now(java.time.ZoneOffset.UTC).plusDays(15).minusSeconds(5);

        budgetService.create(createRequest);

        verify(budgetRepository).save(captor.capture());
        java.time.OffsetDateTime validUntil = captor.getValue().getValidUntil();
        assertThat(validUntil)
                .isNotNull()
                .isAfterOrEqualTo(before)
                .isBeforeOrEqualTo(before.plusSeconds(10));
    }

    @Test
    @DisplayName("Criação: Cliente inexistente")
    void create_ShouldThrowException_WhenClientNotFound() {
        when(clientRepository.findById(client.getId())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> budgetService.create(createRequest))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("Consulta: Orçamento encontrado")
    void findById_ShouldReturnBudget_WhenExists() {
        when(budgetRepository.findById(budget.getId())).thenReturn(Optional.of(budget));

        BudgetResponseDTO responseDTO = new BudgetResponseDTO(
                budget.getId(), "ORC-2026-001", client.getId(), "João da Silva",
                BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO,
                PaymentCondition.A_VISTA_PIX, "À Vista (PIX / Dinheiro)", null,
                BudgetStatus.DRAFT, "Rascunho", "Notes",
                null, null, null, false, Collections.emptyList()
        );
        when(budgetMapper.toResponseDTO(budget)).thenReturn(responseDTO);

        BudgetResponseDTO result = budgetService.findById(budget.getId());

        assertThat(result).isNotNull();
        assertThat(result.code()).isEqualTo("ORC-2026-001");
    }

    @Test
    @DisplayName("Consulta: Orçamento inexistente")
    void findById_ShouldThrowException_WhenNotFound() {
        UUID id = UUID.randomUUID();
        when(budgetRepository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> budgetService.findById(id))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("Listagem com filtros: deve aplicar ordenação padrão createdAt DESC quando unsorted")
    void findAll_ShouldApplyDefaultSort_WhenPageableIsUnsorted() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Budget> page = new PageImpl<>(List.of(budget));
        when(budgetRepository.searchBudgets(eq("busca"), eq(BudgetStatus.DRAFT), any(Pageable.class))).thenReturn(page);

        BudgetSummaryResponseDTO summaryDTO = new BudgetSummaryResponseDTO(
                budget.getId(), "ORC-2026-001", "João da Silva", 0, BigDecimal.ZERO, BudgetStatus.DRAFT, null, null, false);
        when(budgetMapper.toSummaryResponseDTO(budget)).thenReturn(summaryDTO);

        PageResponse<BudgetSummaryResponseDTO> result = budgetService.findAll("busca", BudgetStatus.DRAFT, pageable);

        assertThat(result).isNotNull();
        assertThat(result.content()).hasSize(1);
        assertThat(result.content().get(0).code()).isEqualTo("ORC-2026-001");

        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
        verify(budgetRepository).searchBudgets(eq("busca"), eq(BudgetStatus.DRAFT), pageableCaptor.capture());
        Pageable capturedPageable = pageableCaptor.getValue();
        assertThat(capturedPageable.getPageNumber()).isZero();
        assertThat(capturedPageable.getPageSize()).isEqualTo(10);
        assertThat(capturedPageable.getSort().getOrderFor("createdAt")).isNotNull();
        assertThat(capturedPageable.getSort().getOrderFor("createdAt").getDirection()).isEqualTo(Sort.Direction.DESC);
    }

    @Test
    @DisplayName("Listagem com filtros: deve aplicar paginação e ordenação padrão quando pageable for nulo")
    void findAll_ShouldUseDefaultPaginationAndSort_WhenPageableIsNull() {
        Page<Budget> page = new PageImpl<>(List.of(budget));
        when(budgetRepository.searchBudgets(eq(null), eq(BudgetStatus.APPROVED), any(Pageable.class))).thenReturn(page);

        BudgetSummaryResponseDTO summaryDTO = new BudgetSummaryResponseDTO(
                budget.getId(), "ORC-2026-001", "João da Silva", 0, BigDecimal.ZERO, BudgetStatus.APPROVED, null, null, false);
        when(budgetMapper.toSummaryResponseDTO(budget)).thenReturn(summaryDTO);

        PageResponse<BudgetSummaryResponseDTO> result = budgetService.findAll(null, BudgetStatus.APPROVED, null);

        assertThat(result).isNotNull();
        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
        verify(budgetRepository).searchBudgets(isNull(), eq(BudgetStatus.APPROVED), pageableCaptor.capture());
        Pageable captured = pageableCaptor.getValue();
        assertThat(captured.getPageNumber()).isZero();
        assertThat(captured.getPageSize()).isEqualTo(20);
        assertThat(captured.getSort().getOrderFor("createdAt")).isNotNull();
        assertThat(captured.getSort().getOrderFor("createdAt").getDirection()).isEqualTo(Sort.Direction.DESC);
    }

    @Test
    @DisplayName("Listagem com filtros: deve preservar ordenação personalizada quando fornecida")
    void findAll_ShouldPreserveCustomSort_WhenPageableIsSorted() {
        Pageable pageable = PageRequest.of(1, 15, Sort.by("code").ascending());
        Page<Budget> page = new PageImpl<>(List.of(budget));
        when(budgetRepository.searchBudgets(eq("ORC"), isNull(), any(Pageable.class))).thenReturn(page);

        BudgetSummaryResponseDTO summaryDTO = new BudgetSummaryResponseDTO(
                budget.getId(), "ORC-2026-001", "João da Silva", 0, BigDecimal.ZERO, BudgetStatus.DRAFT, null, null, false);
        when(budgetMapper.toSummaryResponseDTO(budget)).thenReturn(summaryDTO);

        PageResponse<BudgetSummaryResponseDTO> result = budgetService.findAll("ORC", null, pageable);

        assertThat(result).isNotNull();
        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
        verify(budgetRepository).searchBudgets(eq("ORC"), isNull(), pageableCaptor.capture());
        Pageable captured = pageableCaptor.getValue();
        assertThat(captured.getPageNumber()).isEqualTo(1);
        assertThat(captured.getPageSize()).isEqualTo(15);
        assertThat(captured.getSort().getOrderFor("code")).isNotNull();
        assertThat(captured.getSort().getOrderFor("code").getDirection()).isEqualTo(Sort.Direction.ASC);
    }

    @Test
    @DisplayName("Listagem com filtros: busca em branco ou vazia deve ser convertida para nulo")
    void findAll_ShouldTreatBlankSearchAsNull() {
        Page<Budget> page = new PageImpl<>(List.of(budget));
        when(budgetRepository.searchBudgets(isNull(), isNull(), any(Pageable.class))).thenReturn(page);

        BudgetSummaryResponseDTO summaryDTO = new BudgetSummaryResponseDTO(
                budget.getId(), "ORC-2026-001", "João da Silva", 0, BigDecimal.ZERO, BudgetStatus.DRAFT, null, null, false);
        when(budgetMapper.toSummaryResponseDTO(budget)).thenReturn(summaryDTO);

        budgetService.findAll("   ", null, PageRequest.of(0, 10));

        verify(budgetRepository).searchBudgets(isNull(), isNull(), any(Pageable.class));
    }

    @Test
    @DisplayName("Listagem com filtros: termo de busca deve ser trimado")
    void findAll_ShouldTrimSearchTerm() {
        Page<Budget> page = new PageImpl<>(List.of(budget));
        when(budgetRepository.searchBudgets(eq("termo"), isNull(), any(Pageable.class))).thenReturn(page);

        BudgetSummaryResponseDTO summaryDTO = new BudgetSummaryResponseDTO(
                budget.getId(), "ORC-2026-001", "João da Silva", 0, BigDecimal.ZERO, BudgetStatus.DRAFT, null, null, false);
        when(budgetMapper.toSummaryResponseDTO(budget)).thenReturn(summaryDTO);

        budgetService.findAll("  termo  ", null, PageRequest.of(0, 10));

        verify(budgetRepository).searchBudgets(eq("termo"), isNull(), any(Pageable.class));
    }

    @Test
    @DisplayName("Listagem: listar() deve delegar para findAll()")
    void listar_ShouldDelegateToFindAll() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Budget> page = new PageImpl<>(List.of(budget));
        when(budgetRepository.searchBudgets(eq("busca"), eq(BudgetStatus.DRAFT), any(Pageable.class))).thenReturn(page);

        BudgetSummaryResponseDTO summaryDTO = new BudgetSummaryResponseDTO(
                budget.getId(), "ORC-2026-001", "João da Silva", 0, BigDecimal.ZERO, BudgetStatus.DRAFT, null, null, false);
        when(budgetMapper.toSummaryResponseDTO(budget)).thenReturn(summaryDTO);

        PageResponse<BudgetSummaryResponseDTO> result = budgetService.listar("busca", BudgetStatus.DRAFT, pageable);

        assertThat(result).isNotNull();
        assertThat(result.content()).hasSize(1);
        verify(budgetRepository).searchBudgets(eq("busca"), eq(BudgetStatus.DRAFT), any(Pageable.class));
    }

    @Test
    @DisplayName("Atualização: Atualização válida quando DRAFT")
    void update_ShouldUpdate_WhenDraft() {
        when(budgetRepository.findById(budget.getId())).thenReturn(Optional.of(budget));
        when(clientRepository.findById(client.getId())).thenReturn(Optional.of(client));

        Budget updatedData = new Budget();
        updatedData.setDiscountPercent(BigDecimal.TEN);
        when(budgetMapper.toEntity(requestDTO)).thenReturn(updatedData);
        when(budgetRepository.save(budget)).thenReturn(budget);

        BudgetResponseDTO responseDTO = new BudgetResponseDTO(
                budget.getId(), "ORC-2026-001", client.getId(), "João da Silva",
                BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO,
                PaymentCondition.A_VISTA_PIX, "À Vista (PIX / Dinheiro)", null,
                BudgetStatus.DRAFT, "Rascunho", "Notes",
                null, null, null, false, Collections.emptyList()
        );
        when(budgetMapper.toResponseDTO(budget)).thenReturn(responseDTO);

        BudgetResponseDTO result = budgetService.update(budget.getId(), requestDTO);

        assertThat(result).isNotNull();
        verify(budgetRepository, times(1)).save(budget);
    }

    @Test
    @DisplayName("Atualização: Tentativa de alterar orçamento imutável")
    void update_ShouldThrowException_WhenNotDraft() {
        budget.setStatus(BudgetStatus.SENT);
        UUID budgetId = budget.getId();
        when(budgetRepository.findById(budgetId)).thenReturn(Optional.of(budget));

        assertThatThrownBy(() -> budgetService.update(budgetId, requestDTO))
                .isInstanceOf(BudgetImmutableException.class);
    }

    @Test
    @DisplayName("Alteração de status: Transição válida com StatusChangeRequest")
    void updateStatus_ShouldUpdateStatus_WhenTransitionIsValid() {
        when(budgetRepository.findById(budget.getId())).thenReturn(Optional.of(budget));
        
        StatusChangeRequest request = new StatusChangeRequest(BudgetStatus.SENT);
        
        budgetService.updateStatus(budget.getId(), request);
        
        assertThat(budget.getStatus()).isEqualTo(BudgetStatus.SENT);
        verify(budgetRepository, times(1)).save(budget);
    }

    @Test
    @DisplayName("Alteração de status: Transição inválida com StatusChangeRequest")
    void updateStatus_ShouldThrowException_WhenTransitionIsInvalid() {
        budget.setStatus(BudgetStatus.APPROVED);
        UUID budgetId = budget.getId();
        when(budgetRepository.findById(budgetId)).thenReturn(Optional.of(budget));
        
        StatusChangeRequest request = new StatusChangeRequest(BudgetStatus.DRAFT);
        
        assertThatThrownBy(() -> budgetService.updateStatus(budgetId, request))
                .isInstanceOf(InvalidBudgetStatusTransitionException.class);
    }

    @Test
    @DisplayName("Cancelamento: Operação válida")
    void delete_ShouldCancelBudget_WhenValid() {
        when(budgetRepository.findById(budget.getId())).thenReturn(Optional.of(budget));

        budgetService.delete(budget.getId());

        assertThat(budget.getStatus()).isEqualTo(BudgetStatus.CANCELLED);
        verify(budgetRepository, times(1)).save(budget);
    }

    @Test
    @DisplayName("Recalcular: Deve invocar serviços de cálculo e salvar orçamento")
    void recalculate_ShouldInvokeServices_WhenDraft() {
        when(budgetRepository.findById(budget.getId())).thenReturn(Optional.of(budget));
        when(budgetRepository.save(budget)).thenReturn(budget);

        BudgetResponseDTO responseDTO = new BudgetResponseDTO(
                budget.getId(), "ORC-2026-001", client.getId(), "João da Silva",
                BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO,
                PaymentCondition.A_VISTA_PIX, "À Vista", null,
                BudgetStatus.DRAFT, "Rascunho", "Notes",
                null, null, null, false, Collections.emptyList()
        );
        when(budgetMapper.toResponseDTO(budget)).thenReturn(responseDTO);

        budgetService.recalculate(budget.getId());

        verify(budgetPricingService, times(1)).calculatePricing(budget);
        verify(budgetRepository, times(1)).save(budget);
    }

    @Test
    @DisplayName("Aplicar Desconto: Percentual válido deve calcular valor corretamente")
    void aplicarDesconto_ShouldApplyPercentual_WhenValid() {
        budget.setSubtotal(new BigDecimal("1000.00"));
        budget.addItem(new BudgetItem()); // Garante que a lista não está vazia

        when(budgetRepository.findById(budget.getId())).thenReturn(Optional.of(budget));
        when(budgetRepository.save(budget)).thenReturn(budget);

        DiscountRequest request = new DiscountRequest(
                DiscountType.PERCENTUAL,
                new BigDecimal("15.00"),
                PaymentCondition.A_VISTA_PIX,
                "Pagamento à vista",
                null
        );

        budgetService.aplicarDesconto(budget.getId(), request);

        assertThat(budget.getDiscountPercent()).isEqualTo(new BigDecimal("15.00"));
        assertThat(budget.getDiscountValue()).isEqualTo(new BigDecimal("150.00"));
        assertThat(budget.getTotal()).isEqualTo(new BigDecimal("850.00"));
        assertThat(budget.getPaymentCondition()).isEqualTo(PaymentCondition.A_VISTA_PIX);
        assertThat(budget.getPaymentNotes()).isEqualTo("Pagamento à vista");
        verify(budgetRepository, times(1)).save(budget);
    }

    @Test
    @DisplayName("Aplicar Desconto: Valor fixo válido deve calcular percentual corretamente")
    void aplicarDesconto_ShouldApplyFixedValue_WhenValid() {
        budget.setSubtotal(new BigDecimal("2000.00"));
        budget.addItem(new BudgetItem());

        when(budgetRepository.findById(budget.getId())).thenReturn(Optional.of(budget));
        when(budgetRepository.save(budget)).thenReturn(budget);

        DiscountRequest request = new DiscountRequest(
                DiscountType.VALOR_FIXO,
                new BigDecimal("500.00"),
                PaymentCondition.A_VISTA_PIX,
                "Parcelado",
                null
        );

        budgetService.aplicarDesconto(budget.getId(), request);

        assertThat(budget.getDiscountValue()).isEqualTo(new BigDecimal("500.00"));
        assertThat(budget.getDiscountPercent()).isEqualTo(new BigDecimal("25.00"));
        assertThat(budget.getTotal()).isEqualTo(new BigDecimal("1500.00"));
        assertThat(budget.getPaymentCondition()).isEqualTo(PaymentCondition.A_VISTA_PIX);
        assertThat(budget.getPaymentNotes()).isEqualTo("Parcelado");
        verify(budgetRepository, times(1)).save(budget);
    }

    @Test
    @DisplayName("Aplicar Desconto: Rejeitar desconto percentual acima de 100%")
    void aplicarDesconto_ShouldThrowException_WhenPercentExceeds100() {
        budget.setSubtotal(new BigDecimal("1000.00"));
        budget.addItem(new BudgetItem());

        when(budgetRepository.findById(budget.getId())).thenReturn(Optional.of(budget));

        DiscountRequest request = new DiscountRequest(
                DiscountType.PERCENTUAL,
                new BigDecimal("105.00"),
                PaymentCondition.A_VISTA_PIX,
                "",
                null
        );

        UUID budgetId1 = budget.getId();
        assertThatThrownBy(() -> budgetService.aplicarDesconto(budgetId1, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("não pode ser superior a 100%");
    }

    @Test
    @DisplayName("Aplicar Desconto: Rejeitar valor fixo superior ao subtotal")
    void aplicarDesconto_ShouldThrowException_WhenFixedValueExceedsSubtotal() {
        budget.setSubtotal(new BigDecimal("1000.00"));
        budget.addItem(new BudgetItem());

        when(budgetRepository.findById(budget.getId())).thenReturn(Optional.of(budget));

        DiscountRequest request = new DiscountRequest(
                DiscountType.VALOR_FIXO,
                new BigDecimal("1200.00"),
                PaymentCondition.A_VISTA_PIX,
                "",
                null
        );

        UUID budgetId = budget.getId();
        assertThatThrownBy(() -> budgetService.aplicarDesconto(budgetId, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("não pode ser superior ao subtotal");
    }

    @Test
    @DisplayName("Aplicar Desconto: Rejeitar orçamento sem itens ou subtotal zerado")
    void aplicarDesconto_ShouldThrowException_WhenBudgetIsEmpty() {
        budget.setSubtotal(BigDecimal.ZERO);
        // Não adicionamos itens na lista

        when(budgetRepository.findById(budget.getId())).thenReturn(Optional.of(budget));

        DiscountRequest request = new DiscountRequest(
                DiscountType.PERCENTUAL,
                new BigDecimal("10.00"),
                PaymentCondition.A_VISTA_PIX,
                "",
                null
        );

        UUID budgetId = budget.getId();
        assertThatThrownBy(() -> budgetService.aplicarDesconto(budgetId, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("O orçamento deve possuir itens e subtotal maior que zero");
    }

    @Test
    @DisplayName("Alteração de status: Transição SENT para EXPIRED deve ser válida")
    void updateStatus_ShouldAllowTransition_WhenSentToExpired() {
        budget.setStatus(BudgetStatus.SENT);
        UUID budgetId = budget.getId();
        when(budgetRepository.findById(budgetId)).thenReturn(Optional.of(budget));

        StatusChangeRequest statusRequest = new StatusChangeRequest(BudgetStatus.EXPIRED);
        budgetService.updateStatus(budgetId, statusRequest);

        assertThat(budget.getStatus()).isEqualTo(BudgetStatus.EXPIRED);
        verify(budgetRepository, times(1)).save(budget);
    }

    @Test
    @DisplayName("Alteração de status: EXPIRED é estado final e não permite transição")
    void updateStatus_ShouldThrowException_WhenCurrentStateIsExpired() {
        budget.setStatus(BudgetStatus.EXPIRED);
        UUID budgetId = budget.getId();
        when(budgetRepository.findById(budgetId)).thenReturn(Optional.of(budget));

        // Tentando voltar um orçamento expirado para rascunho (Ilegal)
        StatusChangeRequest statusRequest = new StatusChangeRequest(BudgetStatus.DRAFT);

        assertThatThrownBy(() -> budgetService.updateStatus(budgetId, statusRequest))
                .isInstanceOf(InvalidBudgetStatusTransitionException.class);
    }

    @Test
    @DisplayName("Adicionar Item: Sucesso com orçamento DRAFT, recálculo e persistência")
    void adicionarItem_ShouldAddItemAndRecalculate_WhenBudgetIsDraft() {
        UUID budgetId = budget.getId();
        budget.setStatus(BudgetStatus.DRAFT);
        when(budgetRepository.findById(budgetId)).thenReturn(Optional.of(budget));

        BudgetItem item = new BudgetItem();
        item.setWidthMm(new BigDecimal("1200.00"));
        item.setHeightMm(new BigDecimal("2100.00"));
        item.setQuantity(1);
        item.setLaborCost(new BigDecimal("150.00"));

        BudgetItemOption option = new BudgetItemOption();
        item.setOptions(new java.util.ArrayList<>(List.of(option)));

        BudgetItemRequestDTO itemRequest = new BudgetItemRequestDTO(
                UUID.randomUUID(),
                new BigDecimal("1200.00"),
                new BigDecimal("2100.00"),
                1,
                new BigDecimal("150.00"),
                "SLIDING_DOOR_2F",
                "{}",
                "{}",
                "{}",
                "Nota item",
                null
        );

        when(budgetMapper.toEntity(itemRequest)).thenReturn(item);

        BudgetItemResponseDTO expectedResponse = new BudgetItemResponseDTO(
                UUID.randomUUID(),
                itemRequest.productId(),
                "Janela de Correr",
                "SLIDING_DOOR_2F",
                "{}",
                "{}",
                "{}",
                new BigDecimal("1200.00"),
                new BigDecimal("2100.00"),
                1,
                new BigDecimal("150.00"),
                new BigDecimal("600.00"),
                "Nota item",
                Collections.emptyList()
        );
        when(budgetMapper.toResponseDTO(item)).thenReturn(expectedResponse);

        BudgetItemResponseDTO response = budgetService.adicionarItem(budgetId, itemRequest);

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(expectedResponse.id());
        assertThat(budget.getItems()).contains(item);
        assertThat(option.getBudgetItem()).isEqualTo(item);
        assertThat(item.getBudget()).isEqualTo(budget);

        verify(budgetPricingService, times(1)).calculatePricing(budget);
        verify(budgetRepository, times(1)).save(budget);
    }

    @Test
    @DisplayName("Adicionar Item: Bloquear quando orçamento não estiver em status DRAFT")
    void adicionarItem_ShouldThrowException_WhenBudgetIsNotDraft() {
        UUID budgetId = budget.getId();
        budget.setStatus(BudgetStatus.SENT);
        when(budgetRepository.findById(budgetId)).thenReturn(Optional.of(budget));

        BudgetItemRequestDTO itemRequest = new BudgetItemRequestDTO(
                UUID.randomUUID(),
                new BigDecimal("1200.00"),
                new BigDecimal("2100.00"),
                1,
                new BigDecimal("150.00"),
                null, null, null, null, null, null
        );

        assertThatThrownBy(() -> budgetService.adicionarItem(budgetId, itemRequest))
                .isInstanceOf(BudgetImmutableException.class)
                .hasMessageContaining("Orçamento não pode ser alterado pois já se encontra no status: SENT");

        verify(budgetRepository, never()).save(any());
        verify(budgetMapper, never()).toEntity(any(BudgetItemRequestDTO.class));
    }

    @Test
    @DisplayName("Adicionar Item: Falha quando orçamento não for encontrado")
    void adicionarItem_ShouldThrowException_WhenBudgetNotFound() {
        UUID nonExistentId = UUID.randomUUID();
        when(budgetRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        BudgetItemRequestDTO itemRequest = new BudgetItemRequestDTO(
                UUID.randomUUID(),
                new BigDecimal("1200.00"),
                new BigDecimal("2100.00"),
                1,
                new BigDecimal("150.00"),
                null, null, null, null, null, null
        );

        assertThatThrownBy(() -> budgetService.adicionarItem(nonExistentId, itemRequest))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(budgetRepository, never()).save(any());
        verify(budgetMapper, never()).toEntity(any(BudgetItemRequestDTO.class));
    }
}