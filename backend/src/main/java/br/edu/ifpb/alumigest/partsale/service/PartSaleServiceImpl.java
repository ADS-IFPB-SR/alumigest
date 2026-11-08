package br.edu.ifpb.alumigest.partsale.service;

import br.edu.ifpb.alumigest.catalog.domain.Material;
import br.edu.ifpb.alumigest.catalog.repository.MaterialRepository;
import br.edu.ifpb.alumigest.clients.domain.Client;
import br.edu.ifpb.alumigest.clients.domain.PersonType;
import br.edu.ifpb.alumigest.clients.repository.ClientRepository;
import br.edu.ifpb.alumigest.common.dto.PageResponse;
import br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException;
import br.edu.ifpb.alumigest.partsale.calculator.PartCalculatorFactory;
import br.edu.ifpb.alumigest.partsale.calculator.PartItemCalculator;
import br.edu.ifpb.alumigest.partsale.domain.PartSale;
import br.edu.ifpb.alumigest.partsale.domain.PartSaleItem;
import br.edu.ifpb.alumigest.partsale.domain.PartSaleStatus;
import br.edu.ifpb.alumigest.partsale.dto.CalculatePartItemRequest;
import br.edu.ifpb.alumigest.partsale.dto.CalculatePartItemResponse;
import br.edu.ifpb.alumigest.partsale.dto.CreatePartSaleItemRequest;
import br.edu.ifpb.alumigest.partsale.dto.CreatePartSaleRequest;
import br.edu.ifpb.alumigest.partsale.dto.PartSaleItemResponse;
import br.edu.ifpb.alumigest.partsale.dto.PartSaleResponse;
import br.edu.ifpb.alumigest.partsale.repository.PartSaleRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementação das regras de negócio e operações de Venda de Partes (US-46).
 */
@Service
public class PartSaleServiceImpl implements PartSaleService {

  private final PartSaleRepository partSaleRepository;
  private final ClientRepository clientRepository;
  private final MaterialRepository materialRepository;
  private final PartCalculatorFactory calculatorFactory;
  private final PartSaleCodeGenerator codeGenerator;
  private final PartSaleValidationService validationService;

  /**
   * Construtor com injeção de dependências.
   */
  public PartSaleServiceImpl(
      PartSaleRepository partSaleRepository,
      ClientRepository clientRepository,
      MaterialRepository materialRepository,
      PartCalculatorFactory calculatorFactory,
      PartSaleCodeGenerator codeGenerator,
      PartSaleValidationService validationService) {
    this.partSaleRepository = partSaleRepository;
    this.clientRepository = clientRepository;
    this.materialRepository = materialRepository;
    this.calculatorFactory = calculatorFactory;
    this.codeGenerator = codeGenerator;
    this.validationService = validationService;
  }

  @Override
  @Transactional(readOnly = true)
  public CalculatePartItemResponse calculateItem(CalculatePartItemRequest request) {
    if (request.materialId() != null) {
      Material material = materialRepository.findById(request.materialId())
          .orElseThrow(() -> new ResourceNotFoundException(
              "Material não encontrado com ID: " + request.materialId()));
      validationService.validatePhysicalLimits(request, material);
    }
    PartItemCalculator calculator = calculatorFactory.getCalculator(request.category());
    return calculator.calculate(request);
  }

  public static final UUID DEFAULT_WALK_IN_CLIENT_ID =
      UUID.fromString("00000000-0000-0000-0000-000000000001");

  @Override
  @Transactional
  public PartSaleResponse create(CreatePartSaleRequest request) {
    Client client = resolveClient(request.clientId());

    String code = codeGenerator.generateNextCode();
    BigDecimal discount = request.discountAmount() != null
        ? request.discountAmount()
        : BigDecimal.ZERO;

    PartSale partSale = new PartSale(
        code,
        client.getId(),
        request.status() != null ? request.status() : PartSaleStatus.DRAFT,
        discount
    );

    for (CreatePartSaleItemRequest itemReq : request.items()) {
      Material material = materialRepository.findById(itemReq.referenceId())
          .orElseThrow(() -> new ResourceNotFoundException(
              "Material não encontrado com ID: " + itemReq.referenceId()));

      CalculatePartItemRequest calcReq = new CalculatePartItemRequest(
          itemReq.materialType(),
          itemReq.widthMm(),
          itemReq.heightMm(),
          itemReq.quantity(),
          itemReq.unitPrice(),
          itemReq.lossFactor()
      );

      validationService.validatePhysicalLimits(calcReq, material);

      CalculatePartItemResponse calcResp = calculatorFactory
          .getCalculator(itemReq.materialType())
          .calculate(calcReq);

      PartSaleItem item = new PartSaleItem(
          material,
          itemReq.materialType(),
          itemReq.widthMm(),
          itemReq.heightMm(),
          itemReq.quantity(),
          itemReq.lossFactor(),
          calcResp.calculatedUnitMeasure(),
          calcResp.unitPrice(),
          calcResp.totalPrice()
      );
      partSale.addItem(item);
    }

    PartSale saved = partSaleRepository.save(partSale);
    return toResponse(saved, client.getFullName());
  }

  @Override
  @Transactional(readOnly = true)
  public PartSaleResponse findById(UUID id) {
    PartSale partSale = partSaleRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException(
            "Venda de partes não encontrada com ID: " + id));

    String clientName = clientRepository.findById(partSale.getClientId())
        .map(Client::getFullName)
        .orElse(null);

    return toResponse(partSale, clientName);
  }

  @Override
  @Transactional(readOnly = true)
  public PageResponse<PartSaleResponse> findAll(String search, PartSaleStatus status, Pageable pageable) {
    String searchTerm = (search != null && !search.isBlank()) ? search.trim() : null;
    Page<PartSale> page = partSaleRepository.findAllWithFilters(searchTerm, status, pageable);

    // Resolução em lote dos nomes dos clientes para mitigar o problema N+1
    Set<UUID> clientIds = page.getContent().stream()
        .map(PartSale::getClientId)
        .filter(Objects::nonNull)
        .collect(Collectors.toSet());

    Map<UUID, String> clientNames = clientRepository.findAllById(clientIds).stream()
        .collect(Collectors.toMap(Client::getId, Client::getFullName, (existing, replacement) -> existing));

    List<PartSaleResponse> responses = page.getContent().stream()
        .map(partSale -> toResponse(partSale, clientNames.get(partSale.getClientId())))
        .toList();

    return new PageResponse<>(
        responses,
        page.getNumber(),
        page.getSize(),
        page.getTotalElements(),
        page.getTotalPages(),
        page.isFirst(),
        page.isLast()
    );
  }

  @Override
  @Transactional
  public PartSaleResponse updateStatus(UUID id, PartSaleStatus newStatus) {
    PartSale partSale = partSaleRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException(
            "Venda de partes não encontrada com ID: " + id));

    partSale.updateStatus(newStatus);
    PartSale updated = partSaleRepository.save(partSale);

    String clientName = clientRepository.findById(updated.getClientId())
        .map(Client::getFullName)
        .orElse(null);

    return toResponse(updated, clientName);
  }

  private PartSaleResponse toResponse(PartSale partSale, String clientName) {
    List<PartSaleItemResponse> items = partSale.getItems().stream()
        .map(item -> new PartSaleItemResponse(
            item.getId(),
            item.getMaterialType(),
            item.getMaterialId(),
            item.getDescription(),
            item.getQuantity(),
            item.getWidthMm(),
            item.getHeightMm(),
            item.getCalculatedUnitMeasure(),
            item.getUnitPrice(),
            item.getTotalPrice()
        ))
        .toList();

    return new PartSaleResponse(
        partSale.getId(),
        partSale.getCode(),
        partSale.getClientId(),
        clientName,
        partSale.getStatus(),
        partSale.getSubtotalAmount(),
        partSale.getDiscountAmount(),
        partSale.getTotalAmount(),
        items,
        partSale.getCreatedAt(),
        partSale.getUpdatedAt()
    );
  }

  private Client resolveClient(UUID requestedClientId) {
    if (requestedClientId == null) {
      return clientRepository.findById(DEFAULT_WALK_IN_CLIENT_ID)
          .orElseGet(this::findOrCreateDefaultWalkInClient);
    }
    return clientRepository.findById(requestedClientId)
        .orElseGet(() -> {
          if (DEFAULT_WALK_IN_CLIENT_ID.equals(requestedClientId)) {
            return findOrCreateDefaultWalkInClient();
          }
          throw new ResourceNotFoundException("Cliente não encontrado com ID: " + requestedClientId);
        });
  }

  private Client findOrCreateDefaultWalkInClient() {
    return clientRepository.findAll().stream()
        .filter(c -> c.getFullName() != null && c.getFullName().toLowerCase().contains("balcão"))
        .findFirst()
        .orElseGet(() -> {
          Client defaultClient = Client.builder()
              .id(DEFAULT_WALK_IN_CLIENT_ID)
              .fullName("Cliente Balcão (Consumidor Final)")
              .personType(PersonType.FISICA)
              .notes("Cliente padrão do sistema para vendas avulsas e balcão sem cadastro prévio.")
              .build();
          return clientRepository.save(defaultClient);
        });
  }
}
