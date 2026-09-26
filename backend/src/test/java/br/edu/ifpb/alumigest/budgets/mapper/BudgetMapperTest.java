package br.edu.ifpb.alumigest.budgets.mapper;

import br.edu.ifpb.alumigest.budgets.domain.Budget;
import br.edu.ifpb.alumigest.budgets.domain.BudgetItem;
import br.edu.ifpb.alumigest.budgets.domain.BudgetItemOption;
import br.edu.ifpb.alumigest.budgets.domain.BudgetStatus;
import br.edu.ifpb.alumigest.budgets.domain.PaymentCondition;
import br.edu.ifpb.alumigest.budgets.dto.*;
import br.edu.ifpb.alumigest.catalog.domain.Material;
import br.edu.ifpb.alumigest.catalog.domain.Product;
import br.edu.ifpb.alumigest.clients.domain.Client;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("BudgetMapper - Testes de Mapeamento MapStruct [Joseph Nichollas]")
class BudgetMapperTest {

    private BudgetMapper mapper;

    @BeforeEach
    void setUp() {
        mapper = new BudgetMapperImpl();
    }

    @Test
    @DisplayName("toResponseDTO: Retorna null quando budget for null")
    void toResponseDTO_DeveRetornarNull_QuandoBudgetNulo() {
        assertThat(mapper.toResponseDTO((Budget) null)).isNull();
    }

    @Test
    @DisplayName("toResponseDTO: Mapeia corretamente quando lista de itens for nula ou vazia")
    void toResponseDTO_DeveMapearComItensNulosOuVazios() {
        Budget budget = new Budget();
        budget.setId(UUID.randomUUID());
        budget.setCode("ORC-2026-0001");
        budget.setStatus(BudgetStatus.DRAFT);
        budget.setItems(null);

        BudgetResponseDTO dto = mapper.toResponseDTO(budget);

        assertThat(dto).isNotNull();
        assertThat(dto.items()).isNull();
        assertThat(dto.id()).isEqualTo(budget.getId());
        assertThat(dto.code()).isEqualTo("ORC-2026-0001");
        assertThat(dto.status()).isEqualTo(BudgetStatus.DRAFT);
    }

    @Test
    @DisplayName("toResponseDTO: Mapeia corretamente cliente e campos comerciais")
    void toResponseDTO_DeveMapearClienteECamposComerciais() {
        Client client = Client.builder()
                .id(UUID.randomUUID())
                .fullName("Maria Silva")
                .phone("83999998888")
                .email("maria@teste.com")
                .street("Rua das Flores, 123")
                .build();

        Budget budget = new Budget();
        budget.setId(UUID.randomUUID());
        budget.setCode("ORC-2026-0002");
        budget.setClient(client);
        budget.setStatus(BudgetStatus.SENT);
        budget.setPaymentCondition(PaymentCondition.A_VISTA_PIX);
        budget.setPaymentNotes("5% à vista");
        budget.setNotes("Entrega em 20 dias");
        budget.setSubtotal(new BigDecimal("1000.00"));
        budget.setTotal(new BigDecimal("950.00"));
        budget.setValidUntil(OffsetDateTime.now(ZoneOffset.UTC).plusDays(10));

        BudgetResponseDTO dto = mapper.toResponseDTO(budget);

        assertThat(dto).isNotNull();
        assertThat(dto.clientId()).isEqualTo(client.getId());
        assertThat(dto.clientName()).isEqualTo("Maria Silva");
        assertThat(dto.clientPhone()).isEqualTo("83999998888");
        assertThat(dto.clientEmail()).isEqualTo("maria@teste.com");
        assertThat(dto.clientAddress()).isEqualTo("Rua das Flores, 123");
        assertThat(dto.paymentCondition()).isEqualTo(PaymentCondition.A_VISTA_PIX);
        assertThat(dto.paymentConditionLabel()).isEqualTo(PaymentCondition.A_VISTA_PIX.getDescricao());
        assertThat(dto.paymentNotes()).isEqualTo("5% à vista");
        assertThat(dto.notes()).isEqualTo("Entrega em 20 dias");
        assertThat(dto.expired()).isFalse();
    }

    @Test
    @DisplayName("toSummaryResponseDTO: Mapeia totalItems 0 quando itens for nulo")
    void toSummaryResponseDTO_DeveMapearTotalItemsZero_QuandoItensNulo() {
        Budget budget = new Budget();
        budget.setId(UUID.randomUUID());
        budget.setCode("ORC-2026-0003");
        budget.setItems(null);

        BudgetSummaryResponseDTO dto = mapper.toSummaryResponseDTO(budget);

        assertThat(dto).isNotNull();
        assertThat(dto.totalItems()).isZero();
    }

    @Test
    @DisplayName("toResponseDTO(BudgetItem): Mapeia options nula e product nulo sem falhar")
    void toResponseDTO_BudgetItem_ComOptionsEProductNulos() {
        BudgetItem item = new BudgetItem();
        item.setId(UUID.randomUUID());
        item.setProduct(null);
        item.setOptions(null);

        BudgetItemResponseDTO dto = mapper.toResponseDTO(item);

        assertThat(dto).isNotNull();
        assertThat(dto.productId()).isNull();
        assertThat(dto.options()).isNull();
    }

    @Test
    @DisplayName("toResponseDTO(BudgetItemOption): Retorna null quando option for nula")
    void toResponseDTO_BudgetItemOption_Nulo() {
        assertThat(mapper.toResponseDTO((BudgetItemOption) null)).isNull();
    }

    @Test
    @DisplayName("toEntity(BudgetCreateRequest): Sincroniza notes e observacoes")
    void toEntity_BudgetCreateRequest_SincronizaNotas() {
        UUID clientId = UUID.randomUUID();
        BudgetCreateRequest reqComNotes = new BudgetCreateRequest(clientId, "Notas em ingles");
        Budget b1 = mapper.toEntity(reqComNotes);
        assertThat(b1.getNotes()).isEqualTo("Notas em ingles");

        BudgetCreateRequest reqComObs = new BudgetCreateRequest(
                clientId,
                "Observações em pt",
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null
        );
        Budget b2 = mapper.toEntity(reqComObs);
        assertThat(b2.getNotes()).isEqualTo("Observações em pt");
    }

    @Test
    @DisplayName("toEntity(BudgetItemOptionRequestDTO): Mapeia materialId")
    void toEntity_BudgetItemOptionRequestDTO_MapeiaMaterialId() {
        UUID matId = UUID.randomUUID();
        BudgetItemOptionRequestDTO req = new BudgetItemOptionRequestDTO(
                matId,
                br.edu.ifpb.alumigest.catalog.domain.MaterialCategoryType.GLASS,
                new BigDecimal("2.5"),
                "Vidro",
                "Fume"
        );

        BudgetItemOption entity = mapper.toEntity(req);

        assertThat(entity).isNotNull();
        assertThat(entity.getMaterial()).isNotNull();
        assertThat(entity.getMaterial().getId()).isEqualTo(matId);
    }

    @Test
    @DisplayName("Mapeamentos com entradas nulas devem retornar null de forma segura")
    void mapeamentosComEntradaNulaDevemRetornarNull() {
        assertThat(mapper.toEntity((BudgetCreateRequest) null)).isNull();
        assertThat(mapper.toEntity((BudgetRequestDTO) null)).isNull();
        assertThat(mapper.toEntity((BudgetItemRequestDTO) null)).isNull();
        assertThat(mapper.toEntity((BudgetItemOptionRequestDTO) null)).isNull();
        assertThat(mapper.toResponseDTO((BudgetItem) null)).isNull();
        assertThat(mapper.toSummaryResponseDTO((Budget) null)).isNull();
    }

    @Test
    @DisplayName("toEntity(BudgetRequestDTO): Mapeia todos os campos e itens")
    void toEntity_BudgetRequestDTO_Completo() {
        UUID clientId = UUID.randomUUID();
        BudgetItemRequestDTO itemReq = new BudgetItemRequestDTO(
                UUID.randomUUID(),
                new BigDecimal("1200.00"),
                new BigDecimal("2100.00"),
                2,
                new BigDecimal("150.00"),
                "DOOR_SLIDING",
                "2F",
                "PUXADOR_BARRA",
                "FURO_PADRAO",
                "Porta de correr",
                List.of()
        );
        BudgetRequestDTO req = new BudgetRequestDTO(
                clientId,
                new BigDecimal("10.00"),
                "Observação geral",
                OffsetDateTime.now(ZoneOffset.UTC).plusDays(15),
                List.of(itemReq),
                PaymentCondition.CARTAO_12X,
                "Entrada + 3x sem juros"
        );

        Budget budget = mapper.toEntity(req);

        assertThat(budget).isNotNull();
        assertThat(budget.getClient()).isNotNull();
        assertThat(budget.getClient().getId()).isEqualTo(clientId);
        assertThat(budget.getDiscountPercent()).isEqualByComparingTo("10.00");
        assertThat(budget.getNotes()).isEqualTo("Observação geral");
        assertThat(budget.getPaymentCondition()).isEqualTo(PaymentCondition.CARTAO_12X);
        assertThat(budget.getPaymentNotes()).isEqualTo("Entrada + 3x sem juros");
    }

    @Test
    @DisplayName("toResponseDTO(BudgetItem): Mapeia com opções e produto preenchidos")
    void toResponseDTO_BudgetItem_Completo() {
        Product prod = new Product();
        prod.setId(UUID.randomUUID());
        prod.setName("Janela 4 Folhas");

        Material mat = new Material();
        mat.setId(UUID.randomUUID());

        BudgetItemOption option = new BudgetItemOption();
        option.setId(UUID.randomUUID());
        option.setMaterial(mat);
        option.setMaterialName("Alumínio Branco");

        BudgetItem item = new BudgetItem();
        item.setId(UUID.randomUUID());
        item.setProduct(prod);
        item.setProductName("Janela 4 Folhas");
        item.setWidthMm(new BigDecimal("1500"));
        item.setHeightMm(new BigDecimal("1200"));
        item.setQuantity(3);
        item.setLaborCost(new BigDecimal("200.00"));
        item.setSubtotal(new BigDecimal("1800.00"));
        item.setOptions(List.of(option));

        BudgetItemResponseDTO dto = mapper.toResponseDTO(item);

        assertThat(dto).isNotNull();
        assertThat(dto.productId()).isEqualTo(prod.getId());
        assertThat(dto.productName()).isEqualTo("Janela 4 Folhas");
        assertThat(dto.options()).hasSize(1);
        assertThat(dto.options().getFirst().materialId()).isEqualTo(mat.getId());
    }

    @Test
    @DisplayName("Jackson: Deserializa BudgetCreateRequest com paymentCondition e commercialConditions")
    void testJacksonDeserialize_BudgetCreateRequest() throws Exception {
        com.fasterxml.jackson.databind.ObjectMapper om = new com.fasterxml.jackson.databind.ObjectMapper().findAndRegisterModules();
        UUID clientId = UUID.randomUUID();
        String json = """
            {
                "clientId": "%s",
                "paymentCondition": "ENTRADA_50_SALDO_ENTREGA",
                "commercialConditions": "50%% Entrada + 50%% na Entrega",
                "notes": "Notas gerais",
                "discountPercent": 10.0
            }
            """.formatted(clientId);

        BudgetCreateRequest req = om.readValue(json, BudgetCreateRequest.class);
        assertThat(req.clientId()).isEqualTo(clientId);
        assertThat(req.paymentCondition()).isEqualTo(PaymentCondition.ENTRADA_50_SALDO_ENTREGA);
        assertThat(req.commercialConditions()).isEqualTo("50% Entrada + 50% na Entrega");
        assertThat(req.notes()).isEqualTo("Notas gerais");
        assertThat(req.discountPercent()).isEqualByComparingTo("10.0");

        Budget entity = mapper.toEntity(req);
        assertThat(entity.getPaymentCondition()).isEqualTo(PaymentCondition.ENTRADA_50_SALDO_ENTREGA);
        assertThat(entity.getPaymentNotes()).isEqualTo("50% Entrada + 50% na Entrega");
    }
}
