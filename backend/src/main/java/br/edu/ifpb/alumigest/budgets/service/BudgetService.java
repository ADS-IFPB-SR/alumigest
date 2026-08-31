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
import br.edu.ifpb.alumigest.common.exception.BudgetImmutableException;
import br.edu.ifpb.alumigest.common.exception.InvalidBudgetStatusTransitionException;
import br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException;
import br.edu.ifpb.alumigest.common.dto.PageResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;
import java.util.UUID;

@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final ClientRepository clientRepository;
    private final BudgetMapper budgetMapper;

    private final BudgetQuantityService budgetQuantityService;
    private final BudgetPricingService budgetPricingService;

    public BudgetService(BudgetRepository budgetRepository, ClientRepository clientRepository, BudgetMapper budgetMapper, BudgetQuantityService budgetQuantityService, BudgetPricingService budgetPricingService) {
        this.budgetRepository = budgetRepository;
        this.clientRepository = clientRepository;
        this.budgetMapper = budgetMapper;
        this.budgetQuantityService = budgetQuantityService;
        this.budgetPricingService = budgetPricingService;
    }

    @Transactional
    public BudgetResponseDTO create(BudgetRequestDTO requestDTO) {
        Client client = clientRepository.findById(requestDTO.clientId())
                .orElseThrow(() -> new ResourceNotFoundException("Cliente", requestDTO.clientId().toString()));

        Budget budget = budgetMapper.toEntity(requestDTO);
        budget.setClient(client);

        budget.setCode(generateBudgetCode());

        budgetQuantityService.calculateQuantities(budget);
        budgetPricingService.calculatePricing(budget);

        budget = budgetRepository.save(budget);
        return budgetMapper.toResponseDTO(budget);
    }

    @Transactional(readOnly = true)
    public BudgetResponseDTO findById(UUID id) {
        Budget budget = getBudgetOrThrow(id);
        return budgetMapper.toResponseDTO(budget);
    }

    @Transactional(readOnly = true)
    public PageResponse<BudgetSummaryResponseDTO> findAll(String busca, BudgetStatus status, Pageable pageable) {
        String query = (busca != null && !busca.isBlank()) ? busca.trim() : null;
        Page<BudgetSummaryResponseDTO> page = budgetRepository.searchBudgets(query, status, pageable)
                .map(budgetMapper::toSummaryResponseDTO);
        return PageResponse.of(page);
    }

    @Transactional
    public BudgetResponseDTO update(UUID id, BudgetRequestDTO requestDTO) {
        Budget existingBudget = getBudgetOrThrow(id);

        validateBudgetIsDraft(existingBudget);

        Client client = clientRepository.findById(requestDTO.clientId())
                .orElseThrow(() -> new ResourceNotFoundException("Cliente", requestDTO.clientId().toString()));

        existingBudget.getItems().clear();
        Budget updatedData = budgetMapper.toEntity(requestDTO);

        updatedData.getItems().forEach(existingBudget::addItem);
        existingBudget.setClient(client);
        existingBudget.setDiscountPercent(updatedData.getDiscountPercent());
        existingBudget.setNotes(updatedData.getNotes());

        // Recalcular totais após a atualização
        budgetQuantityService.calculateQuantities(existingBudget);
        budgetPricingService.calculatePricing(existingBudget);

        budgetRepository.save(existingBudget);
        return budgetMapper.toResponseDTO(existingBudget);
    }

    @Transactional
    public void updateStatus(UUID id, BudgetStatusUpdateDTO statusDto) {
        Budget budget = getBudgetOrThrow(id);

        validateStatusTransition(budget.getStatus(), statusDto.status());

        budget.setStatus(statusDto.status());
        budgetRepository.save(budget);
    }

    @Transactional
    public BudgetResponseDTO recalculate(UUID id) {
        Budget budget = getBudgetOrThrow(id);
        validateBudgetIsDraft(budget);

        budgetQuantityService.calculateQuantities(budget);
        budgetPricingService.calculatePricing(budget);
        
        budgetRepository.save(budget);
        return budgetMapper.toResponseDTO(budget);
    }

    @Transactional
    public void delete(UUID id) {
        Budget budget = getBudgetOrThrow(id);
        validateStatusTransition(budget.getStatus(), BudgetStatus.CANCELLED);
        budget.setStatus(BudgetStatus.CANCELLED);

        budgetRepository.save(budget);
    }

    private Budget getBudgetOrThrow(UUID id) {
        return budgetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Orçamento", id.toString()));
    }

    private void validateBudgetIsDraft(Budget budget) {
        if (budget.getStatus() != BudgetStatus.DRAFT) {
            throw new BudgetImmutableException("Orçamento não pode ser alterado pois já se encontra no status: " + budget.getStatus());
        }
    }

    private void validateStatusTransition(BudgetStatus current, BudgetStatus target) {
        if (current == target) return;

        boolean isValid = switch (current) {
            case DRAFT -> target == BudgetStatus.SENT || target == BudgetStatus.CANCELLED;
            case SENT -> target == BudgetStatus.APPROVED || target == BudgetStatus.REJECTED || target == BudgetStatus.CANCELLED;
            case APPROVED, REJECTED, CANCELLED -> false;
        };

        if (!isValid) {
            throw new InvalidBudgetStatusTransitionException(current, target);
        }
    }

    private String generateBudgetCode() {
        int currentYear = Year.now().getValue();
        String prefix = String.format("ORC-%d-", currentYear);

        return budgetRepository.findTopByCodeStartingWithOrderByCodeDesc(prefix)
                .map(lastBudget -> {
                    String lastCode = lastBudget.getCode();

                    int lastNumber = Integer.parseInt(lastCode.substring(prefix.length()));
                    return String.format("%s%03d", prefix, lastNumber + 1);
                })
                .orElse(prefix + "001");
    }
}