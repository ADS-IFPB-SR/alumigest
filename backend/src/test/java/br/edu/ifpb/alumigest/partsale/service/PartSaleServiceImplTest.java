package br.edu.ifpb.alumigest.partsale.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.edu.ifpb.alumigest.catalog.domain.Material;
import br.edu.ifpb.alumigest.catalog.domain.MaterialCategoryType;
import br.edu.ifpb.alumigest.catalog.repository.MaterialRepository;
import br.edu.ifpb.alumigest.clients.domain.Client;
import br.edu.ifpb.alumigest.clients.domain.PersonType;
import br.edu.ifpb.alumigest.clients.repository.ClientRepository;
import br.edu.ifpb.alumigest.common.dto.PageResponse;
import br.edu.ifpb.alumigest.common.exception.BusinessException;
import br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException;
import br.edu.ifpb.alumigest.partsale.calculator.PartCalculatorFactory;
import br.edu.ifpb.alumigest.partsale.calculator.PartItemCalculator;
import br.edu.ifpb.alumigest.partsale.domain.PartSale;
import br.edu.ifpb.alumigest.partsale.domain.PartSaleStatus;
import br.edu.ifpb.alumigest.partsale.dto.CalculatePartItemRequest;
import br.edu.ifpb.alumigest.partsale.dto.CalculatePartItemResponse;
import br.edu.ifpb.alumigest.partsale.dto.CreatePartSaleItemRequest;
import br.edu.ifpb.alumigest.partsale.dto.CreatePartSaleRequest;
import br.edu.ifpb.alumigest.partsale.dto.PartSalePdfDTO;
import br.edu.ifpb.alumigest.partsale.dto.PartSaleResponse;
import br.edu.ifpb.alumigest.partsale.repository.PartSaleRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
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

  @Mock
  private PartSaleValidationService validationService;

  @Mock
  private PartSalePdfService partSalePdfService;

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
        new BigDecimal("75.00"),
        false
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
  @DisplayName("Deve criar com sucesso uma venda avulsa com status explicitamente APPROVED")
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
        new BigDecimal("120.00"),
        false
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
        new BigDecimal("60.00"),
        null
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
        new BigDecimal("10.00"),
        null
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
  @DisplayName("Deve criar venda com desconto nulo e status nulo aplicando ZERO e DRAFT")
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
  @DisplayName("Deve buscar venda por ID e retornar clientName nulo caso cliente não exista mais")
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

  @Test
  @DisplayName("Deve listar vendas avulsas de forma paginada e resolver nomes em lote")
  void shouldFindAllWithPaginationAndBatchResolvedClientNames() {
    PartSale sale1 =
        new PartSale("VP-2026-0001", clientId, PartSaleStatus.APPROVED, new BigDecimal("100.00"));
    PartSale sale2 =
        new PartSale("VP-2026-0002", clientId, PartSaleStatus.DRAFT, new BigDecimal("200.00"));

    Pageable pageable = PageRequest.of(0, 10);
    Page<PartSale> page = new PageImpl<>(List.of(sale1, sale2), pageable, 2);

    when(partSaleRepository.findAllWithFilters("Esperança", PartSaleStatus.APPROVED, pageable))
        .thenReturn(page);
    when(clientRepository.findAllById(Set.of(clientId))).thenReturn(List.of(client));

    PageResponse<PartSaleResponse> result =
        partSaleService.findAll("Esperança", PartSaleStatus.APPROVED, pageable);

    assertThat(result.content()).hasSize(2);
    assertThat(result.totalElements()).isEqualTo(2);
    assertThat(result.content().get(0).code()).isEqualTo("VP-2026-0001");
    assertThat(result.content().get(0).clientName()).isEqualTo("Vidraçaria Esperança Ltda");
    assertThat(result.content().get(1).code()).isEqualTo("VP-2026-0002");
    assertThat(result.content().get(1).clientName()).isEqualTo("Vidraçaria Esperança Ltda");
  }

  @Test
  @DisplayName("Deve converter termo de busca em branco para null ao consultar repository")
  void shouldConvertBlankSearchTermToNullInRepository() {
    Pageable pageable = PageRequest.of(0, 10);
    Page<PartSale> page = new PageImpl<>(List.of(), pageable, 0);

    when(partSaleRepository.findAllWithFilters(null, null, pageable)).thenReturn(page);

    PageResponse<PartSaleResponse> result = partSaleService.findAll("   ", null, pageable);

    assertThat(result.content()).isEmpty();
    assertThat(result.totalElements()).isZero();
    verify(partSaleRepository).findAllWithFilters(null, null, pageable);
  }

  @Test
  @DisplayName("Deve gerar PDF de venda persistida em consulta única retornando bytes e nome")
  void shouldGeneratePdfForPersistedSale() {
    UUID saleId = UUID.randomUUID();
    PartSale sale = new PartSale("VP-2026-0001", clientId, PartSaleStatus.APPROVED, BigDecimal.ZERO);
    byte[] expectedPdf = new byte[]{1, 2, 3};

    when(partSaleRepository.findWithDetailsById(saleId)).thenReturn(Optional.of(sale));
    when(clientRepository.findById(clientId)).thenReturn(Optional.of(client));
    when(partSalePdfService.generatePdf(sale, client)).thenReturn(expectedPdf);

    PartSalePdfDTO pdfDto = partSaleService.generatePdf(saleId);

    assertThat(pdfDto.bytes()).isEqualTo(expectedPdf);
    assertThat(pdfDto.filename()).isEqualTo("orcamento-partes-VP-2026-0001.pdf");
    verify(partSaleRepository).findWithDetailsById(saleId);
    verify(partSalePdfService).generatePdf(sale, client);
  }

  @Test
  @DisplayName("Deve sanitizar barras no nome do arquivo PDF e aceitar cliente nulo na base")
  void shouldSanitizeSlashInPdfFilenameAndAllowMissingClient() {
    UUID saleId = UUID.randomUUID();
    PartSale sale = new PartSale("VP/2026/0010", clientId, PartSaleStatus.DRAFT, BigDecimal.ZERO);
    byte[] expectedPdf = new byte[]{9, 8, 7};

    when(partSaleRepository.findWithDetailsById(saleId)).thenReturn(Optional.of(sale));
    when(clientRepository.findById(clientId)).thenReturn(Optional.empty());
    when(partSalePdfService.generatePdf(sale, null)).thenReturn(expectedPdf);

    PartSalePdfDTO pdfDto = partSaleService.generatePdf(saleId);

    assertThat(pdfDto.bytes()).isEqualTo(expectedPdf);
    assertThat(pdfDto.filename()).isEqualTo("orcamento-partes-VP-2026-0010.pdf");
    verify(partSalePdfService).generatePdf(sale, null);
  }

  @Test
  @DisplayName("Deve lançar ResourceNotFoundException ao gerar PDF de venda inexistente")
  void shouldThrowResourceNotFoundWhenGeneratingPdfForMissingSale() {
    UUID saleId = UUID.randomUUID();
    when(partSaleRepository.findWithDetailsById(saleId)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> partSaleService.generatePdf(saleId))
        .isInstanceOf(ResourceNotFoundException.class)
        .hasMessageContaining("Venda de partes não encontrada com ID: " + saleId);
  }

  @Test
  @DisplayName("Deve gerar PDF prévio validando limites físicos sem persistir no banco")
  void shouldGeneratePdfPreviewFromRequest() {
    UUID matId = UUID.randomUUID();
    Material mat = new Material();
    mat.setId(matId);
    mat.setName("Vidro Incolor 8mm");
    CreatePartSaleItemRequest itemReq = new CreatePartSaleItemRequest(
        MaterialCategoryType.GLASS, matId, 2, 1000, 1000, new BigDecimal("100.00"), null
    );
    CreatePartSaleRequest request = new CreatePartSaleRequest(
        clientId, PartSaleStatus.DRAFT, BigDecimal.ZERO, List.of(itemReq)
    );

    CalculatePartItemResponse calcResp = new CalculatePartItemResponse(
        new BigDecimal("2.0000"), new BigDecimal("100.00"), new BigDecimal("200.00"), false
    );
    PartItemCalculator calculator = mock(PartItemCalculator.class);
    when(calculator.calculate(any())).thenReturn(calcResp);

    when(clientRepository.findById(clientId)).thenReturn(Optional.of(client));
    when(materialRepository.findById(matId)).thenReturn(Optional.of(mat));
    when(calculatorFactory.getCalculator(MaterialCategoryType.GLASS)).thenReturn(calculator);

    byte[] expectedPdf = new byte[]{4, 5, 6};
    when(partSalePdfService.generatePdf(any(PartSale.class), any(Client.class)))
        .thenReturn(expectedPdf);

    byte[] actualPdf = partSaleService.generatePdfPreview(request);

    assertThat(actualPdf).isEqualTo(expectedPdf);
    verify(validationService).validatePhysicalLimits(any(), any(Material.class));
    verify(partSalePdfService).generatePdf(any(PartSale.class), any(Client.class));
  }

  @Test
  @DisplayName("Deve gerar PDF prévio para Cliente Balcão padrão sem gravar nem consultar findAll")
  void shouldGeneratePdfPreviewForWalkInClientWithoutWritingToDatabase() {
    UUID matId = UUID.randomUUID();
    Material mat = new Material();
    mat.setId(matId);
    mat.setName("Perfil U");
    CreatePartSaleItemRequest itemReq = new CreatePartSaleItemRequest(
        MaterialCategoryType.PROFILE, matId, 1, null, 1500, new BigDecimal("40.00"), null
    );
    CreatePartSaleRequest request = new CreatePartSaleRequest(
        PartSaleServiceImpl.DEFAULT_WALK_IN_CLIENT_ID,
        PartSaleStatus.DRAFT,
        BigDecimal.ZERO,
        List.of(itemReq)
    );

    PartItemCalculator calculator = mock(PartItemCalculator.class);
    when(calculator.calculate(any())).thenReturn(new CalculatePartItemResponse(
        new BigDecimal("1.5000"), new BigDecimal("40.00"), new BigDecimal("60.00"), false
    ));
    when(clientRepository.findById(PartSaleServiceImpl.DEFAULT_WALK_IN_CLIENT_ID))
        .thenReturn(Optional.empty());
    when(materialRepository.findById(matId)).thenReturn(Optional.of(mat));
    when(calculatorFactory.getCalculator(MaterialCategoryType.PROFILE)).thenReturn(calculator);
    byte[] expectedPdf = new byte[]{7, 8};
    when(partSalePdfService.generatePdf(any(PartSale.class), any(Client.class)))
        .thenReturn(expectedPdf);

    byte[] actualPdf = partSaleService.generatePdfPreview(request);

    assertThat(actualPdf).isEqualTo(expectedPdf);
    verify(clientRepository, never()).findAll();
    verify(clientRepository, never()).save(any());
    verify(partSalePdfService).generatePdf(
        any(PartSale.class),
        argThat(c -> PartSaleServiceImpl.DEFAULT_WALK_IN_CLIENT_ID.equals(c.getId())
            && c.getFullName().contains("Cliente Balcão"))
    );
  }

  @Test
  @DisplayName("Deve lançar BusinessException ao gerar PDF prévio sem itens")
  void shouldThrowBusinessExceptionWhenPreviewItemsEmpty() {
    CreatePartSaleRequest request = new CreatePartSaleRequest(
        clientId, PartSaleStatus.DRAFT, BigDecimal.ZERO, List.of());

    assertThatThrownBy(() -> partSaleService.generatePdfPreview(request))
        .isInstanceOf(BusinessException.class)
        .hasMessageContaining("pelo menos um item");
  }

  @Test
  @DisplayName("Deve lançar ResourceNotFoundException no PDF prévio se cliente customizado não existir")
  void shouldThrowResourceNotFoundWhenPreviewClientMissing() {
    CreatePartSaleItemRequest itemReq = new CreatePartSaleItemRequest(
        MaterialCategoryType.HARDWARE, UUID.randomUUID(), 1, null, null, BigDecimal.TEN, null);
    CreatePartSaleRequest request = new CreatePartSaleRequest(
        clientId, PartSaleStatus.DRAFT, BigDecimal.ZERO, List.of(itemReq));

    when(clientRepository.findById(clientId)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> partSaleService.generatePdfPreview(request))
        .isInstanceOf(ResourceNotFoundException.class)
        .hasMessageContaining("Cliente não encontrado com ID: " + clientId);
  }

  @Test
  @DisplayName("Deve validar limites físicos dos materiais no PDF prévio")
  void shouldValidatePhysicalLimitsOnPreview() {
    UUID matId = UUID.randomUUID();
    Material mat = new Material();
    mat.setId(matId);
    CreatePartSaleItemRequest itemReq = new CreatePartSaleItemRequest(
        MaterialCategoryType.FILM, matId, 1, 2000, 1000, BigDecimal.TEN, null);
    CreatePartSaleRequest request = new CreatePartSaleRequest(
        clientId, PartSaleStatus.DRAFT, BigDecimal.ZERO, List.of(itemReq));

    when(clientRepository.findById(clientId)).thenReturn(Optional.of(client));
    when(materialRepository.findById(matId)).thenReturn(Optional.of(mat));
    doThrow(new BusinessException("Largura excede o limite"))
        .when(validationService).validatePhysicalLimits(any(), any(Material.class));

    assertThatThrownBy(() -> partSaleService.generatePdfPreview(request))
        .isInstanceOf(BusinessException.class)
        .hasMessageContaining("Largura excede o limite");
  }
}
