package br.edu.ifpb.alumigest.partsale.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.edu.ifpb.alumigest.catalog.domain.Material;
import br.edu.ifpb.alumigest.catalog.domain.MaterialCategoryType;
import br.edu.ifpb.alumigest.catalog.repository.MaterialRepository;
import br.edu.ifpb.alumigest.clients.domain.Client;
import br.edu.ifpb.alumigest.clients.domain.PersonType;
import br.edu.ifpb.alumigest.clients.repository.ClientRepository;
import br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException;
import br.edu.ifpb.alumigest.partsale.calculator.PartCalculatorFactory;
import br.edu.ifpb.alumigest.partsale.calculator.PartItemCalculator;
import br.edu.ifpb.alumigest.partsale.domain.PartSale;
import br.edu.ifpb.alumigest.partsale.domain.PartSaleStatus;
import br.edu.ifpb.alumigest.partsale.dto.CalculatePartItemRequest;
import br.edu.ifpb.alumigest.partsale.dto.CalculatePartItemResponse;
import br.edu.ifpb.alumigest.partsale.dto.CreatePartSaleItemRequest;
import br.edu.ifpb.alumigest.partsale.dto.CreatePartSaleRequest;
import br.edu.ifpb.alumigest.partsale.dto.PartSaleResponse;
import br.edu.ifpb.alumigest.partsale.repository.PartSaleRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("PartSaleServiceImpl [US-46.1] - Service Layer Tests")
class PartSaleServiceImplTest {

  @Mock
  private PartSaleRepository partSaleRepository;

  @Mock
  private ClientRepository clientRepository;

  @Mock
  private MaterialRepository materialRepository;

  @Mock
  private PartCalculatorFactory calculatorFactory;

  @Mock
  private PartSaleCodeGenerator codeGenerator;

  @InjectMocks
  private PartSaleServiceImpl partSaleService;

  private UUID clientId;
  private Client client;

  @BeforeEach
  void setUp() {
    clientId = UUID.randomUUID();
    client = Client.builder()
        .id(clientId)
        .fullName("Vidraçaria Esperança Ltda")
        .personType(PersonType.JURIDICA)
        .documentNumber("12345678000199")
        .phone("83988887777")
        .build();
  }

  @Test
  @DisplayName("Deve delegar o cálculo de item para o calculador obtido da factory")
  void shouldDelegateCalculateItemToFactoryCalculator() {
    CalculatePartItemRequest request = new CalculatePartItemRequest(
        MaterialCategoryType.HARDWARE,
        null,
        null,
        5,
        new BigDecimal("15.00"),
        null
    );
    CalculatePartItemResponse expectedResponse = new CalculatePartItemResponse(
        new BigDecimal("5.0000"),
        new BigDecimal("15.00"),
        new BigDecimal("75.00")
    );

    PartItemCalculator calculator = mock(PartItemCalculator.class);
    when(calculatorFactory.getCalculator(MaterialCategoryType.HARDWARE)).thenReturn(calculator);
    when(calculator.calculate(request)).thenReturn(expectedResponse);

    CalculatePartItemResponse response = partSaleService.calculateItem(request);

    assertThat(response).isEqualTo(expectedResponse);
    verify(calculatorFactory).getCalculator(MaterialCategoryType.HARDWARE);
    verify(calculator).calculate(request);
  }

  @Test
  @DisplayName("Deve criar com sucesso uma venda avulsa com status explicitamente APPROVED matando mutantes de condição")
  void shouldCreatePartSaleWithApprovedStatus() {
    when(clientRepository.findById(clientId)).thenReturn(Optional.of(client));
    when(codeGenerator.generateNextCode()).thenReturn("VP-2026-0003");
    when(partSaleRepository.save(any(PartSale.class))).thenAnswer(inv -> inv.getArgument(0));

    CreatePartSaleRequest request = new CreatePartSaleRequest(
        clientId,
        PartSaleStatus.APPROVED,
        BigDecimal.ZERO,
        List.of()
    );

    PartSaleResponse response = partSaleService.create(request);

    assertThat(response.status()).isEqualTo(PartSaleStatus.APPROVED);
    assertThat(response.code()).isEqualTo("VP-2026-0003");
  }

  @Test
  @DisplayName("Deve criar com sucesso uma venda avulsa de partes com ferragens e calcular totais")
  void shouldCreatePartSaleSuccessfully() {
    UUID materialId = UUID.randomUUID();
    Material material = mock(Material.class);
    when(material.getId()).thenReturn(materialId);
    when(material.getName()).thenReturn("Puxador Tubular 40cm");

    PartItemCalculator calculator = mock(PartItemCalculator.class);
    when(calculator.calculate(any())).thenReturn(new CalculatePartItemResponse(
        new BigDecimal("2.0000"),
        new BigDecimal("60.00"),
        new BigDecimal("120.00")
    ));

    when(clientRepository.findById(clientId)).thenReturn(Optional.of(client));
    when(materialRepository.findById(materialId)).thenReturn(Optional.of(material));
    when(calculatorFactory.getCalculator(MaterialCategoryType.HARDWARE)).thenReturn(calculator);
    when(codeGenerator.generateNextCode()).thenReturn("VP-2026-0001");
    when(partSaleRepository.save(any(PartSale.class))).thenAnswer(inv -> inv.getArgument(0));

    CreatePartSaleItemRequest item = new CreatePartSaleItemRequest(
        MaterialCategoryType.HARDWARE,
        materialId,
        2,
        null,
        null,
        new BigDecimal("60.00")
    );

    CreatePartSaleRequest request = new CreatePartSaleRequest(
        clientId,
        PartSaleStatus.DRAFT,
        new BigDecimal("20.00"),
        List.of(item)
    );

    PartSaleResponse response = partSaleService.create(request);

    assertThat(response).isNotNull();
    assertThat(response.code()).isEqualTo("VP-2026-0001");
    assertThat(response.clientName()).isEqualTo("Vidraçaria Esperança Ltda");
    assertThat(response.status()).isEqualTo(PartSaleStatus.DRAFT);
    assertThat(response.subtotalAmount()).isEqualByComparingTo("120.00");
    assertThat(response.discountAmount()).isEqualByComparingTo("20.00");
    assertThat(response.totalAmount()).isEqualByComparingTo("100.00");
    assertThat(response.items()).hasSize(1);
    assertThat(response.items().get(0).description()).isEqualTo("Puxador Tubular 40cm");
  }

  @Test
  @DisplayName("Deve lançar ResourceNotFoundException ao tentar criar venda para cliente inexistente")
  void shouldThrowExceptionWhenClientNotFoundOnCreate() {
    when(clientRepository.findById(clientId)).thenReturn(Optional.empty());

    CreatePartSaleRequest request = new CreatePartSaleRequest(
        clientId,
        PartSaleStatus.DRAFT,
        BigDecimal.ZERO,
        List.of()
    );

    assertThatThrownBy(() -> partSaleService.create(request))
        .isInstanceOf(ResourceNotFoundException.class)
        .hasMessageContaining("Cliente não encontrado com ID: " + clientId);
  }

  @Test
  @DisplayName("Deve lançar ResourceNotFoundException ao tentar criar venda com material inexistente")
  void shouldThrowExceptionWhenMaterialNotFoundOnCreate() {
    UUID materialId = UUID.randomUUID();
    when(clientRepository.findById(clientId)).thenReturn(Optional.of(client));
    when(codeGenerator.generateNextCode()).thenReturn("VP-2026-0001");
    when(materialRepository.findById(materialId)).thenReturn(Optional.empty());

    CreatePartSaleItemRequest item = new CreatePartSaleItemRequest(
        MaterialCategoryType.HARDWARE,
        materialId,
        1,
        null,
        null,
        new BigDecimal("10.00")
    );
    CreatePartSaleRequest request = new CreatePartSaleRequest(
        clientId,
        PartSaleStatus.DRAFT,
        null,
        List.of(item)
    );

    assertThatThrownBy(() -> partSaleService.create(request))
        .isInstanceOf(ResourceNotFoundException.class)
        .hasMessageContaining("Material não encontrado com ID: " + materialId);
  }

  @Test
  @DisplayName("Deve criar venda com desconto nulo e status nulo aplicando os padrões ZERO e DRAFT (BVA)")
  void shouldApplyDefaultStatusAndDiscountWhenNullOnCreate() {
    when(clientRepository.findById(clientId)).thenReturn(Optional.of(client));
    when(codeGenerator.generateNextCode()).thenReturn("VP-2026-0005");
    when(partSaleRepository.save(any(PartSale.class))).thenAnswer(inv -> inv.getArgument(0));

    CreatePartSaleRequest request = new CreatePartSaleRequest(
        clientId,
        null,
        null,
        List.of()
    );

    PartSaleResponse response = partSaleService.create(request);

    assertThat(response.status()).isEqualTo(PartSaleStatus.DRAFT);
    assertThat(response.discountAmount()).isEqualByComparingTo(BigDecimal.ZERO);
    assertThat(response.subtotalAmount()).isEqualByComparingTo(BigDecimal.ZERO);
    assertThat(response.totalAmount()).isEqualByComparingTo(BigDecimal.ZERO);
  }

  @Test
  @DisplayName("Deve buscar venda por ID com sucesso e mapear nome do cliente")
  void shouldFindByIdSuccessfullyWithClientName() {
    UUID saleId = UUID.randomUUID();
    PartSale sale = new PartSale("VP-2026-0007", clientId, PartSaleStatus.DRAFT, BigDecimal.ZERO);

    when(partSaleRepository.findById(saleId)).thenReturn(Optional.of(sale));
    when(clientRepository.findById(clientId)).thenReturn(Optional.of(client));

    PartSaleResponse response = partSaleService.findById(saleId);

    assertThat(response.code()).isEqualTo("VP-2026-0007");
    assertThat(response.clientName()).isEqualTo("Vidraçaria Esperança Ltda");
  }

  @Test
  @DisplayName("Deve buscar venda por ID e retornar clientName nulo caso cliente não exista mais no repositório")
  void shouldFindByIdWithNullClientNameWhenClientNotFound() {
    UUID saleId = UUID.randomUUID();
    PartSale sale = new PartSale("VP-2026-0008", clientId, PartSaleStatus.DRAFT, BigDecimal.ZERO);

    when(partSaleRepository.findById(saleId)).thenReturn(Optional.of(sale));
    when(clientRepository.findById(clientId)).thenReturn(Optional.empty());

    PartSaleResponse response = partSaleService.findById(saleId);

    assertThat(response.code()).isEqualTo("VP-2026-0008");
    assertThat(response.clientName()).isNull();
  }

  @Test
  @DisplayName("Deve lançar ResourceNotFoundException ao buscar por ID inexistente")
  void shouldThrowExceptionWhenPartSaleNotFoundById() {
    UUID saleId = UUID.randomUUID();
    when(partSaleRepository.findById(saleId)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> partSaleService.findById(saleId))
        .isInstanceOf(ResourceNotFoundException.class)
        .hasMessageContaining("Venda de partes não encontrada com ID: " + saleId);
  }

  @Test
  @DisplayName("Deve atualizar status da venda de partes de DRAFT para APPROVED")
  void shouldUpdateStatusToApproved() {
    UUID saleId = UUID.randomUUID();
    PartSale sale = new PartSale("VP-2026-0002", clientId, PartSaleStatus.DRAFT, BigDecimal.ZERO);

    when(partSaleRepository.findById(saleId)).thenReturn(Optional.of(sale));
    when(partSaleRepository.save(any(PartSale.class))).thenAnswer(inv -> inv.getArgument(0));
    when(clientRepository.findById(clientId)).thenReturn(Optional.of(client));

    PartSaleResponse response = partSaleService.updateStatus(saleId, PartSaleStatus.APPROVED);

    assertThat(response.status()).isEqualTo(PartSaleStatus.APPROVED);
    assertThat(response.clientName()).isEqualTo("Vidraçaria Esperança Ltda");
  }

  @Test
  @DisplayName("Deve lançar ResourceNotFoundException ao atualizar status de venda inexistente")
  void shouldThrowExceptionWhenUpdatingStatusOfNonexistentSale() {
    UUID saleId = UUID.randomUUID();
    when(partSaleRepository.findById(saleId)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> partSaleService.updateStatus(saleId, PartSaleStatus.CANCELLED))
        .isInstanceOf(ResourceNotFoundException.class)
        .hasMessageContaining("Venda de partes não encontrada com ID: " + saleId);
  }

  @Test
  @DisplayName("Deve atualizar status e retornar clientName nulo caso cliente não exista mais")
  void shouldUpdateStatusWithNullClientNameWhenClientNotFound() {
    UUID saleId = UUID.randomUUID();
    PartSale sale = new PartSale("VP-2026-0009", clientId, PartSaleStatus.DRAFT, BigDecimal.ZERO);

    when(partSaleRepository.findById(saleId)).thenReturn(Optional.of(sale));
    when(partSaleRepository.save(any(PartSale.class))).thenAnswer(inv -> inv.getArgument(0));
    when(clientRepository.findById(clientId)).thenReturn(Optional.empty());

    PartSaleResponse response = partSaleService.updateStatus(saleId, PartSaleStatus.CANCELLED);

    assertThat(response.status()).isEqualTo(PartSaleStatus.CANCELLED);
    assertThat(response.clientName()).isNull();
  }
}
