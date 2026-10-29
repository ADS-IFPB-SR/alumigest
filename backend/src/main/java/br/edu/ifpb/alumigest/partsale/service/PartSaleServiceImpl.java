package br.edu.ifpb.alumigest.partsale.service;

import br.edu.ifpb.alumigest.catalog.domain.Material;
import br.edu.ifpb.alumigest.catalog.repository.MaterialRepository;
import br.edu.ifpb.alumigest.clients.domain.Client;
import br.edu.ifpb.alumigest.clients.repository.ClientRepository;
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
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;
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

  public PartSaleServiceImpl(
      PartSaleRepository partSaleRepository,
      ClientRepository clientRepository,
      MaterialRepository materialRepository,
      PartCalculatorFactory calculatorFactory,
      PartSaleCodeGenerator codeGenerator) {
    this.partSaleRepository = partSaleRepository;
    this.clientRepository = clientRepository;
    this.materialRepository = materialRepository;
    this.calculatorFactory = calculatorFactory;
    this.codeGenerator = codeGenerator;
  }

  @Override
  @Transactional(readOnly = true)
  public CalculatePartItemResponse calculateItem(CalculatePartItemRequest request) {
    PartItemCalculator calculator = calculatorFactory.getCalculator(request.category());
    return calculator.calculate(request);
  }

  @Override
  @Transactional
  public PartSaleResponse create(CreatePartSaleRequest request) {
    Client client = clientRepository.findById(request.clientId())
        .orElseThrow(() -> new ResourceNotFoundException(
            "Cliente não encontrado com ID: " + request.clientId()));

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
          null
      );
      CalculatePartItemResponse calcResp = calculateItem(calcReq);

      PartSaleItem item = new PartSaleItem(
          material,
          itemReq.materialType(),
          itemReq.widthMm(),
          itemReq.heightMm(),
          itemReq.quantity(),
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
}
