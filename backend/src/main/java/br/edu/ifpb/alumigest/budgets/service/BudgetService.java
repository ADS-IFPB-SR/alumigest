package br.edu.ifpb.alumigest.budgets.service;

import br.edu.ifpb.alumigest.budgets.domain.Budget;
import br.edu.ifpb.alumigest.budgets.domain.BudgetItem;
import br.edu.ifpb.alumigest.budgets.domain.BudgetItemOption;
import br.edu.ifpb.alumigest.budgets.domain.BudgetStatus;
import br.edu.ifpb.alumigest.budgets.domain.DiscountType;
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
import org.hibernate.Hibernate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Objects;
import java.util.UUID;

@Service
public class BudgetService {

    private static final String RESOURCE_ORCAMENTO = "Orçamento";

    private final BudgetRepository budgetRepository;
    private final ClientRepository clientRepository;
    private final BudgetMapper budgetMapper;

    private final BudgetQuantityService budgetQuantityService;
    private final BudgetPricingService budgetPricingService;
    private final BudgetCodeGenerator budgetCodeGenerator;
    private final BudgetPdfService budgetPdfService;

    public BudgetService(BudgetRepository budgetRepository, ClientRepository clientRepository, BudgetMapper budgetMapper, BudgetQuantityService budgetQuantityService, BudgetPricingService budgetPricingService, BudgetCodeGenerator budgetCodeGenerator, BudgetPdfService budgetPdfService)
    {
        this.budgetRepository = budgetRepository;
        this.clientRepository = clientRepository;
        this.budgetMapper = budgetMapper;
        this.budgetQuantityService = budgetQuantityService;
        this.budgetPricingService = budgetPricingService;
        this.budgetCodeGenerator = budgetCodeGenerator;
        this.budgetPdfService = budgetPdfService;
    }

    @Transactional
public BudgetResponseDTO create(BudgetCreateRequest requestDTO) {
    Client client = clientRepository.findById(requestDTO.clientId())
            .orElseThrow(() -> new ResourceNotFoundException("Cliente", requestDTO.clientId().toString()));

    Budget budget = budgetMapper.toEntity(requestDTO);
    budget.setClient(client);

    budget.setCode(budgetCodeGenerator.generateNextCode());

    // Status inicial obrigatório: novos orçamentos sempre começam como rascunho
    budget.setStatus(BudgetStatus.DRAFT);

    // Validade padrão: 15 dias corridos a partir da criação, se não informada
    if (budget.getValidUntil() == null) {
        budget.setValidUntil(OffsetDateTime.now(ZoneOffset.UTC).plusDays(15));
    }

    // Vínculo bidirecional obrigatório para o JPA salvar os itens na criação
    if (budget.getItems() != null && !budget.getItems().isEmpty()) {
        java.util.List<BudgetItem> itemsCopy = new java.util.ArrayList<>(budget.getItems());
        budget.getItems().clear();

        for (BudgetItem item : itemsCopy) {
            budget.addItem(item);
            
            if (item.getOptions() != null && !item.getOptions().isEmpty()) {
                java.util.List<BudgetItemOption> optionsCopy = new java.util.ArrayList<>(item.getOptions());
                item.getOptions().clear();

                for (BudgetItemOption option : optionsCopy) {
                    item.addOption(option);
                }
            }
        }
        
        budgetQuantityService.calculateQuantities(budget);
        budgetPricingService.calculatePricing(budget);
    }

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
        return buscarOrcamentos(busca, status, pageable);
    }

    @Transactional(readOnly = true)
    public PageResponse<BudgetSummaryResponseDTO> listar(String busca, BudgetStatus status, Pageable pageable) {
        return buscarOrcamentos(busca, status, pageable);
    }

    private PageResponse<BudgetSummaryResponseDTO> buscarOrcamentos(String busca, BudgetStatus status, Pageable pageable) {
        String query = (busca != null && !busca.isBlank()) ? busca.trim() : null;

        Pageable effectivePageable = pageable;
        if (effectivePageable == null) {
            effectivePageable = PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "createdAt"));
        } else if (effectivePageable.getSort().isUnsorted()) {
            effectivePageable = PageRequest.of(
                    effectivePageable.getPageNumber(),
                    effectivePageable.getPageSize(),
                    Sort.by(Sort.Direction.DESC, "createdAt")
            );
        }

        Page<BudgetSummaryResponseDTO> page = budgetRepository.searchBudgets(query, status, effectivePageable)
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

        existingBudget.setPaymentCondition(updatedData.getPaymentCondition());
        existingBudget.setPaymentNotes(updatedData.getPaymentNotes());
        
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
    public void updateStatus(UUID id, StatusChangeRequest request) {
        Objects.requireNonNull(request, "Request de alteração de status não pode ser nulo");
        Objects.requireNonNull(request.novoStatus(), "O novo status é obrigatório para alteração");

        Budget budget = getBudgetOrThrow(id);

        validateStatusTransition(budget.getStatus(), request.novoStatus());

        budget.setStatus(request.novoStatus());
        budgetRepository.save(budget);
    }


    @Transactional
    public BudgetResponseDTO alterarStatus(UUID id, StatusChangeRequest request) {
        Objects.requireNonNull(request, "Request de alteração de status não pode ser nulo");
        Objects.requireNonNull(request.novoStatus(), "O novo status é obrigatório para alteração");

        Budget budget = getBudgetOrThrow(id);

        validateStatusTransition(budget.getStatus(), request.novoStatus());

        budget.setStatus(request.novoStatus());
        budget = budgetRepository.save(budget);
        
        return budgetMapper.toResponseDTO(budget);
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

    @Transactional(readOnly = true)
    public BudgetPdfDTO gerarPdfComercial(UUID id) {
        Budget budget = budgetRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_ORCAMENTO, id.toString()));

        if (budget.getStatus() == BudgetStatus.CANCELLED) {
            throw new BusinessException("Não é possível gerar o PDF de um orçamento cancelado.");
        }

        // Força inicialização das opções das peças dentro da transação aberta para evitar LazyInitializationException
        if (budget.getItems() != null) {
            budget.getItems().forEach(item -> {
                if (item.getOptions() != null) {
                    Hibernate.initialize(item.getOptions());
                }
            });
        }

        byte[] bytes = budgetPdfService.gerarPdfComercial(budget);
        String code = (budget.getCode() != null && !budget.getCode().isBlank())
                ? budget.getCode()
                : "orcamento";
        String filename = code + "-comercial.pdf";

        return new BudgetPdfDTO(bytes, filename);
    }

    @Transactional(readOnly = true)
    public BudgetPdfDTO gerarPdfTecnico(UUID id) {
        Budget budget = budgetRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_ORCAMENTO, id.toString()));

        if (budget.getStatus() == BudgetStatus.CANCELLED) {
            throw new BusinessException("Não é possível gerar o PDF técnico de um orçamento cancelado.");
        }

        if (budget.getItems() != null) {
            budget.getItems().forEach(item -> {
                if (item.getOptions() != null) {
                    Hibernate.initialize(item.getOptions());
                }
            });
        }

        byte[] bytes = budgetPdfService.gerarPdfTecnico(budget);
        String code = (budget.getCode() != null && !budget.getCode().isBlank())
                ? budget.getCode()
                : "orcamento";
        String filename = code + "-tecnico.pdf";

        return new BudgetPdfDTO(bytes, filename);
    }

    private Budget getBudgetOrThrow(UUID id) {
        return budgetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_ORCAMENTO, id.toString()));
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

        // Restaurado o target CANCELLED para garantir o funcionamento do delete()
        boolean isValid = switch (current) {
            case DRAFT -> target == BudgetStatus.SENT || target == BudgetStatus.CANCELLED;
            case SENT -> target == BudgetStatus.APPROVED || target == BudgetStatus.REJECTED || target == BudgetStatus.EXPIRED || target == BudgetStatus.CANCELLED;
            case APPROVED, REJECTED, EXPIRED, CANCELLED -> false;
        };

        if (!isValid) {
            throw new InvalidBudgetStatusTransitionException(current, target);
        }
    }

    /**
     * Adiciona incrementalmente um item a um orçamento existente no status DRAFT,
     * acionando o recálculo automático de insumos, preços, subtotal e total.
     *
     * @param budgetId ID do orçamento
     * @param request Dados do item a ser adicionado
     * @return DTO com os dados do item persistido
     */
    @Transactional
    public BudgetItemResponseDTO adicionarItem(UUID budgetId, BudgetItemRequestDTO request) {
        return executarAdicaoItem(budgetId, request);
    }

    /**
     * Overload que adapta BudgetItemCreateRequest para BudgetItemRequestDTO e insere o item.
     *
     * @param budgetId ID do orçamento
     * @param request Dados do item a ser adicionado
     * @return DTO com os dados do item persistido
     */
    @Transactional
    public BudgetItemResponseDTO adicionarItem(UUID budgetId, BudgetItemCreateRequest request) {
        BudgetItemRequestDTO dto = new BudgetItemRequestDTO(
                request.productId(),
                request.larguraMm(),
                request.alturaMm(),
                request.quantidade(),
                request.valorUnitario(),
                null,
                null,
                request.ferragens(),
                null,
                request.descricao(),
                null
        );
        return executarAdicaoItem(budgetId, dto);
    }

    private BudgetItemResponseDTO executarAdicaoItem(UUID budgetId, BudgetItemRequestDTO request) {
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
        budgetRepository.save(budget);

        return budgetMapper.toResponseDTO(item);
    }

    @Transactional(readOnly = true)
    public String gerarResumoWhatsApp(UUID id) {
        Budget budget = budgetRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_ORCAMENTO, id.toString()));

        return budgetPdfService.gerarResumoWhatsApp(budget);
    }
}