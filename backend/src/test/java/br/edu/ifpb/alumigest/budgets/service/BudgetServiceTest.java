package br.edu.ifpb.alumigest.budgets.service;

import br.edu.ifpb.alumigest.budgets.domain.Budget;
import br.edu.ifpb.alumigest.budgets.domain.BudgetStatus;
import br.edu.ifpb.alumigest.budgets.dto.BudgetRequestDTO;
import br.edu.ifpb.alumigest.budgets.dto.BudgetResponseDTO;
import br.edu.ifpb.alumigest.budgets.dto.BudgetStatusUpdateDTO;
import br.edu.ifpb.alumigest.budgets.dto.BudgetSummaryResponseDTO;
import br.edu.ifpb.alumigest.budgets.mapper.BudgetMapper;
import br.edu.ifpb.alumigest.budgets.repository.BudgetRepository;
import br.edu.ifpb.alumigest.clients.domain.Client;
import br.edu.ifpb.alumigest.clients.repository.ClientRepository;
import br.edu.ifpb.alumigest.common.dto.PageResponse;
import br.edu.ifpb.alumigest.common.exception.BudgetImmutableException;
import br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException;
import br.edu.ifpb.alumigest.common.exception.InvalidBudgetStatusTransitionException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import br.edu.ifpb.alumigest.budgets.dto.BudgetItemRequestDTO;
import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class BudgetServiceTest {

    @Mock
    private BudgetRepository budgetRepository;

    @Mock
    private ClientRepository clientRepository;

    @Mock
    private BudgetMapper budgetMapper;

    @Mock
    private br.edu.ifpb.alumigest.budgets.calculator.MaterialCalculatorFactory calculatorFactory;

    @Mock
    private br.edu.ifpb.alumigest.catalog.repository.MaterialRepository materialRepository;

    @Mock
    private br.edu.ifpb.alumigest.catalog.repository.ProductRepository productRepository;

    private BudgetQuantityService budgetQuantityService;

    @Mock
    private BudgetPricingService budgetPricingService;

    private BudgetService budgetService;

    private Client client;
    private Budget budget;
    private BudgetRequestDTO requestDTO;

    @BeforeEach
    void setUp() {
        org.mockito.MockitoAnnotations.openMocks(this);
        
        budgetQuantityService = new BudgetQuantityService(calculatorFactory, materialRepository, productRepository);
        budgetService = new BudgetService(budgetRepository, clientRepository, budgetMapper, budgetQuantityService, budgetPricingService);

        client = new Client();
        client.setId(UUID.randomUUID());

        budget = new Budget();
        budget.setId(UUID.randomUUID());
        budget.setClient(client);
        budget.setStatus(BudgetStatus.DRAFT);
        budget.setCode("ORC-2026-001");

        BudgetItemRequestDTO itemRequest = new BudgetItemRequestDTO(UUID.randomUUID(), BigDecimal.TEN, BigDecimal.TEN, 1, BigDecimal.ZERO, null, null, null, null, null, null);
        requestDTO = new BudgetRequestDTO(client.getId(), BigDecimal.ZERO, "Notes", List.of(itemRequest));
    }

    @Test
    @DisplayName("Criação válida")
    void create_ShouldReturnBudget_WhenValid() {
        when(clientRepository.findById(client.getId())).thenReturn(Optional.of(client));
        when(budgetMapper.toEntity(requestDTO)).thenReturn(new Budget());
        when(budgetRepository.save(any(Budget.class))).thenReturn(budget);
        
        BudgetResponseDTO responseDTO = new BudgetResponseDTO(budget.getId(), "ORC-2026-001", client.getId(), "João da Silva", BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BudgetStatus.DRAFT, "Notes", null, null, null, Collections.emptyList());
        when(budgetMapper.toResponseDTO(budget)).thenReturn(responseDTO);

        BudgetResponseDTO result = budgetService.create(requestDTO);

        assertThat(result).isNotNull();
        assertThat(result.code()).isEqualTo("ORC-2026-001");
        verify(budgetRepository, times(1)).save(any(Budget.class));
    }

    @Test
    @DisplayName("Criação: Cliente inexistente")
    void create_ShouldThrowException_WhenClientNotFound() {
        when(clientRepository.findById(client.getId())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> budgetService.create(requestDTO))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("Consulta: Orçamento encontrado")
    void findById_ShouldReturnBudget_WhenExists() {
        when(budgetRepository.findById(budget.getId())).thenReturn(Optional.of(budget));
        
        BudgetResponseDTO responseDTO = new BudgetResponseDTO(budget.getId(), "ORC-2026-001", client.getId(), "João da Silva", BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BudgetStatus.DRAFT, "Notes", null, null, null, Collections.emptyList());
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
    @DisplayName("Listagem com filtros")
    void findAll_ShouldReturnPageResponse() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Budget> page = new PageImpl<>(List.of(budget));
        when(budgetRepository.searchBudgets("busca", BudgetStatus.DRAFT, pageable)).thenReturn(page);
        
        BudgetSummaryResponseDTO summaryDTO = new BudgetSummaryResponseDTO(budget.getId(), "ORC-2026-001", "João da Silva", BigDecimal.ZERO, BudgetStatus.DRAFT, null, null);
        when(budgetMapper.toSummaryResponseDTO(budget)).thenReturn(summaryDTO);

        PageResponse<BudgetSummaryResponseDTO> result = budgetService.findAll("busca", BudgetStatus.DRAFT, pageable);

        assertThat(result).isNotNull();
        assertThat(result.content()).hasSize(1);
        assertThat(result.content().get(0).code()).isEqualTo("ORC-2026-001");
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
        
        BudgetResponseDTO responseDTO = new BudgetResponseDTO(budget.getId(), "ORC-2026-001", client.getId(), "João da Silva", BigDecimal.ZERO, BigDecimal.TEN, BigDecimal.ZERO, BigDecimal.ZERO, BudgetStatus.DRAFT, "Notes", null, null, null, Collections.emptyList());
        when(budgetMapper.toResponseDTO(budget)).thenReturn(responseDTO);

        BudgetResponseDTO result = budgetService.update(budget.getId(), requestDTO);

        assertThat(result).isNotNull();
        verify(budgetRepository, times(1)).save(budget);
    }

    @Test
    @DisplayName("Atualização: Tentativa de alterar orçamento imutável")
    void update_ShouldThrowException_WhenNotDraft() {
        budget.setStatus(BudgetStatus.SENT);
        when(budgetRepository.findById(budget.getId())).thenReturn(Optional.of(budget));

        assertThatThrownBy(() -> budgetService.update(budget.getId(), requestDTO))
                .isInstanceOf(BudgetImmutableException.class);
    }

    @Test
    @DisplayName("Alteração de status: Transição válida")
    void updateStatus_ShouldUpdateStatus_WhenTransitionIsValid() {
        when(budgetRepository.findById(budget.getId())).thenReturn(Optional.of(budget));
        
        BudgetStatusUpdateDTO statusDto = new BudgetStatusUpdateDTO(BudgetStatus.SENT);
        
        budgetService.updateStatus(budget.getId(), statusDto);
        
        assertThat(budget.getStatus()).isEqualTo(BudgetStatus.SENT);
        verify(budgetRepository, times(1)).save(budget);
    }

    @Test
    @DisplayName("Alteração de status: Transição inválida")
    void updateStatus_ShouldThrowException_WhenTransitionIsInvalid() {
        budget.setStatus(BudgetStatus.APPROVED);
        when(budgetRepository.findById(budget.getId())).thenReturn(Optional.of(budget));
        
        BudgetStatusUpdateDTO statusDto = new BudgetStatusUpdateDTO(BudgetStatus.DRAFT);
        
        assertThatThrownBy(() -> budgetService.updateStatus(budget.getId(), statusDto))
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
}
