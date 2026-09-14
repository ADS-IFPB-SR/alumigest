package br.edu.ifpb.alumigest.budgets.service;

import br.edu.ifpb.alumigest.budgets.domain.Budget;
import br.edu.ifpb.alumigest.budgets.domain.BudgetItem;
import br.edu.ifpb.alumigest.budgets.domain.BudgetItemOption;
import br.edu.ifpb.alumigest.budgets.domain.BudgetStatus;
import br.edu.ifpb.alumigest.budgets.domain.DiscountType;
import br.edu.ifpb.alumigest.budgets.domain.PaymentCondition;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.Year;
import java.time.ZoneOffset;
import java.util.UUID;

@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final ClientRepository clientRepository;
    private final BudgetMapper budgetMapper;

    private final BudgetQuantityService budgetQuantityService;
    private final BudgetPricingService budgetPricingService;
    private final BudgetCodeGenerator budgetCodeGenerator;

    public BudgetService(BudgetRepository budgetRepository, ClientRepository clientRepository, BudgetMapper budgetMapper, BudgetQuantityService budgetQuantityService, BudgetPricingService budgetPricingService, BudgetCodeGenerator budgetCodeGenerator)
    {
        this.budgetRepository = budgetRepository;
        this.clientRepository = clientRepository;
        this.budgetMapper = budgetMapper;
        this.budgetQuantityService = budgetQuantityService;
        this.budgetPricingService = budgetPricingService;
        this.budgetCodeGenerator = budgetCodeGenerator;
    }

    @Transactional
    public BudgetResponseDTO create(BudgetCreateRequest requestDTO) {
        Client client = clientRepository.findById(requestDTO.clientId())
                .orElseThrow(() -> new ResourceNotFoundException("Cliente", requestDTO.clientId().toString()));

        Budget budget = budgetMapper.toEntity(requestDTO);
        budget.setClient(client);

        budget.setCode(budgetCodeGenerator.generateNextCode());

        budget.setStatus(BudgetStatus.DRAFT);

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
        validateValidUntil(requestDTO.validUntil());

        Client client = clientRepository.findById(requestDTO.clientId())
                .orElseThrow(() -> new ResourceNotFoundException("Cliente", requestDTO.clientId().toString()));

        existingBudget.getItems().clear();
        Budget updatedData = budgetMapper.toEntity(requestDTO);

        if (updatedData.getItems() != null) {
            for (BudgetItem item : updatedData.getItems()) {
                existingBudget.addItem(item);
                if (item.getOptions() != null) {
                    for (BudgetItemOption option : item.getOptions()) {
                        option.setBudgetItem(item);
                    }
                }
            }
        }

        existingBudget.setClient(client);
        existingBudget.setDiscountPercent(updatedData.getDiscountPercent());
        existingBudget.setNotes(updatedData.getNotes());
        if (updatedData.getValidUntil() != null) {
            existingBudget.setValidUntil(updatedData.getValidUntil());
        }

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

    /**
     * Aplica desconto comercial (% ou R$) e condicoes comerciais ao orcamento.
     * Realiza calculo bidirecional de equivalencia e validacoes rigorosas de limites.
     *
     * @param budgetId ID do orcamento a ter o desconto aplicado
     * @param request Dados do desconto e condicoes comerciais
     * @return DTO com orcamento e valores atualizados
     */
    @Transactional
    public BudgetResponseDTO aplicarDesconto(UUID budgetId, DiscountRequest request) {
        Budget budget = getBudgetOrThrow(budgetId);
        validateBudgetIsDraft(budget);

        BigDecimal subtotal = budget.getSubtotal();
        if (budget.getItems() == null || budget.getItems().isEmpty()
                || subtotal == null || subtotal.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException(
                    "O orçamento deve possuir itens e subtotal maior que zero para aplicar descontos e condições comerciais."
            );
        }

        BigDecimal valor = request.valor();
        BigDecimal discountPercent;
        BigDecimal discountValue;

        if (request.tipoDesconto() == DiscountType.PERCENTUAL) {
            if (valor.compareTo(BigDecimal.valueOf(100)) > 0) {
                throw new BusinessException("O desconto percentual não pode ser superior a 100%.");
            }
            discountPercent = valor.setScale(2, RoundingMode.HALF_EVEN);
            discountValue = subtotal.multiply(valor)
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_EVEN);
        } else {
            if (valor.compareTo(subtotal) > 0) {
                throw new BusinessException(
                        "O valor do desconto fixo (R$ " + valor + ") não pode ser superior ao subtotal do orçamento (R$ " + subtotal + ")."
                );
            }
            discountValue = valor.setScale(2, RoundingMode.HALF_EVEN);
            discountPercent = valor.multiply(BigDecimal.valueOf(100))
                    .divide(subtotal, 2, RoundingMode.HALF_EVEN);
        }

        BigDecimal total = subtotal.subtract(discountValue);

        budget.setDiscountPercent(discountPercent);
        budget.setDiscountValue(discountValue);
        budget.setTotal(total);
        budget.setPaymentCondition(request.condicaoPagamento());
        budget.setPaymentNotes(request.observacoesPagamento());

        if (request.dataValidade() != null) {
            OffsetDateTime validUntil = request.dataValidade().atTime(23, 59, 59).atOffset(ZoneOffset.UTC);
            validateValidUntil(validUntil);
            budget.setValidUntil(validUntil);
        }

        budget = budgetRepository.save(budget);
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

    /**
     * Valida se a data de validade da proposta comercial não é retroativa.
     * 
     * @param validUntil Data e hora de validade informada (OffsetDateTime)
     * @throws BusinessException caso a data seja anterior à data atual (hoje)
     */
    private void validateValidUntil(OffsetDateTime validUntil) {
        if (validUntil != null) {
            LocalDate validDate = validUntil.atZoneSameInstant(ZoneOffset.UTC).toLocalDate();
            LocalDate today = LocalDate.now(ZoneOffset.UTC);
            if (validDate.isBefore(today)) {
                throw new BusinessException("A data de validade da proposta não pode ser anterior à data de hoje.");
            }
        }
    }

    private void validateStatusTransition(BudgetStatus current, BudgetStatus target) {
        if (current == target) return;

        boolean isValid = switch (current) {
            case DRAFT -> target == BudgetStatus.SENT || target == BudgetStatus.CANCELLED;
            case SENT -> target == BudgetStatus.APPROVED || target == BudgetStatus.REJECTED || target == BudgetStatus.CANCELLED || target == BudgetStatus.EXPIRED;
            case APPROVED, REJECTED, CANCELLED, EXPIRED -> false;
        };

        if (!isValid) {
            throw new InvalidBudgetStatusTransitionException(current, target);
        }
    }



    @Transactional
    public BudgetItemResponseDTO adicionarItem(UUID budgetId, BudgetItemRequestDTO request) {
        Budget budget = getBudgetOrThrow(budgetId);
        validateBudgetIsDraft(budget);
        BudgetItem item = budgetMapper.toEntity(request);
        if (item.getOptions() != null) {
            for (BudgetItemOption option : item.getOptions()) {
                option.setBudgetItem(item);
            }
        }
        budget.addItem(item);
        budgetQuantityService.calculateQuantities(budget);
        budgetPricingService.calculatePricing(budget);
        budget = budgetRepository.save(budget);
        BudgetItem savedItem = budget.getItems().get(budget.getItems().size() - 1);

        return budgetMapper.toResponseDTO(savedItem);
    }



}