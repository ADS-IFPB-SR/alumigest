package br.edu.ifpb.alumigest.settings.controller;

import static org.hamcrest.Matchers.empty;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.not;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.edu.ifpb.alumigest.common.exception.GlobalExceptionHandler;
import br.edu.ifpb.alumigest.settings.domain.CompanySettings;
import br.edu.ifpb.alumigest.settings.dto.CompanySettingsRequestDTO;
import br.edu.ifpb.alumigest.settings.dto.CompanySettingsResponseDTO;
import br.edu.ifpb.alumigest.settings.service.CompanySettingsService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.stream.Stream;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

@ExtendWith(MockitoExtension.class)
@DisplayName("CompanySettingsController — Testes de Contrato REST e Validação (US-50.1)")
class CompanySettingsControllerTest {

  private static final String ENDPOINT = "/api/v1/settings/company";
  private static final String VALID_COMPANY_NAME = "Alumiportas LTDA";
  private static final String VALID_TRADE_NAME = "Alumiportas Esquadrias e Vidros";
  private static final String VALID_CNPJ_MASKED = "11.222.333/0001-81";
  private static final String VALID_CNPJ_UNMASKED = "11222333000181";
  private static final String VALID_IE = "Isento";
  private static final String VALID_PHONE = "(83) 99999-9999";
  private static final String VALID_EMAIL = "contato@alumiportas.com.br";
  private static final String VALID_ZIP_CODE = "58800-000";
  private static final String VALID_ADDRESS = "Rua Principal, 100 - Centro";
  private static final String VALID_CITY_STATE = "Sousa - PB";
  private static final String JSON_STATUS = "$.status";

  private MockMvc mockMvc;
  private ObjectMapper objectMapper;
  private LocalValidatorFactoryBean validator;

  @Mock private CompanySettingsService companySettingsService;

  @InjectMocks private CompanySettingsController companySettingsController;

  @BeforeEach
  void setUp() {
    validator = new LocalValidatorFactoryBean();
    validator.afterPropertiesSet();

    mockMvc =
        MockMvcBuilders.standaloneSetup(companySettingsController)
            .setControllerAdvice(new GlobalExceptionHandler())
            .setValidator(validator)
            .build();

    objectMapper = new ObjectMapper();
    objectMapper.registerModule(new JavaTimeModule());
  }

  @AfterEach
  void tearDown() {
    validator.close();
  }

  @Nested
  @DisplayName("GET /api/v1/settings/company")
  class GetCompanySettingsTests {

    @Test
    @DisplayName("Deve retornar 200 OK com os dados institucionais vigentes")
    void shouldReturn200WithCompanySettings() throws Exception {
      CompanySettingsResponseDTO response = buildSampleResponse();
      when(companySettingsService.getSettings()).thenReturn(response);

      mockMvc
          .perform(get(ENDPOINT).accept(MediaType.APPLICATION_JSON))
          .andExpect(status().isOk())
          .andExpect(jsonPath("$.id", is(CompanySettings.SINGLETON_ID.toString())))
          .andExpect(jsonPath("$.companyName", is(VALID_COMPANY_NAME)))
          .andExpect(jsonPath("$.tradeName", is(VALID_TRADE_NAME)))
          .andExpect(jsonPath("$.cnpj", is(VALID_CNPJ_MASKED)))
          .andExpect(jsonPath("$.stateRegistration", is(VALID_IE)))
          .andExpect(jsonPath("$.phone", is(VALID_PHONE)))
          .andExpect(jsonPath("$.email", is(VALID_EMAIL)))
          .andExpect(jsonPath("$.zipCode", is(VALID_ZIP_CODE)))
          .andExpect(jsonPath("$.address", is(VALID_ADDRESS)))
          .andExpect(jsonPath("$.cityState", is(VALID_CITY_STATE)));
    }
  }

  @Nested
  @DisplayName("PUT /api/v1/settings/company")
  class UpdateCompanySettingsTests {

    @Test
    @DisplayName("Deve retornar 200 OK ao atualizar com CNPJ mascarado e todos os campos válidos")
    void shouldReturn200WhenUpdatingWithMaskedCnpj() throws Exception {
      CompanySettingsRequestDTO request =
          new CompanySettingsRequestDTO(
              VALID_COMPANY_NAME,
              VALID_TRADE_NAME,
              VALID_CNPJ_MASKED,
              VALID_IE,
              VALID_PHONE,
              VALID_EMAIL,
              VALID_ZIP_CODE,
              VALID_ADDRESS,
              VALID_CITY_STATE);

      when(companySettingsService.updateSettings(any(CompanySettingsRequestDTO.class)))
          .thenReturn(buildSampleResponse());

      mockMvc
          .perform(
              put(ENDPOINT)
                  .contentType(MediaType.APPLICATION_JSON)
                  .content(objectMapper.writeValueAsString(request)))
          .andExpect(status().isOk())
          .andExpect(jsonPath("$.companyName", is(VALID_COMPANY_NAME)))
          .andExpect(jsonPath("$.cnpj", is(VALID_CNPJ_MASKED)));
    }

    @Test
    @DisplayName("Deve retornar 200 OK ao atualizar com CNPJ e CEP sem máscara e opcionais vazios")
    void shouldReturn200WhenUpdatingWithUnmaskedCnpjAndZipCode() throws Exception {
      CompanySettingsRequestDTO request =
          new CompanySettingsRequestDTO(
              VALID_COMPANY_NAME,
              VALID_TRADE_NAME,
              VALID_CNPJ_UNMASKED,
              "",
              "83999999999",
              "",
              "58800000",
              VALID_ADDRESS,
              VALID_CITY_STATE);

      when(companySettingsService.updateSettings(any(CompanySettingsRequestDTO.class)))
          .thenReturn(buildSampleResponse());

      mockMvc
          .perform(
              put(ENDPOINT)
                  .contentType(MediaType.APPLICATION_JSON)
                  .content(objectMapper.writeValueAsString(request)))
          .andExpect(status().isOk())
          .andExpect(jsonPath("$.cnpj", is(VALID_CNPJ_MASKED)))
          .andExpect(jsonPath("$.zipCode", is(VALID_ZIP_CODE)));
    }

    @ParameterizedTest(name = "CNPJ inválido [{index}]: {0}")
    @ValueSource(
        strings = {
          "00.000.000/0000-00",
          "00000000000000",
          "11.222.333/0001-99",
          "11111111111111",
          "12.345.678/0001-00",
          "cnpj-invalido"
        })
    @DisplayName("Deve retornar 400 Bad Request quando o CNPJ tiver dígitos verificadores inválidos")
    void shouldReturn400WhenCnpjIsInvalid(String invalidCnpj) throws Exception {
      CompanySettingsRequestDTO request =
          new CompanySettingsRequestDTO(
              VALID_COMPANY_NAME,
              VALID_TRADE_NAME,
              invalidCnpj,
              VALID_IE,
              VALID_PHONE,
              VALID_EMAIL,
              VALID_ZIP_CODE,
              VALID_ADDRESS,
              VALID_CITY_STATE);

      mockMvc
          .perform(
              put(ENDPOINT)
                  .contentType(MediaType.APPLICATION_JSON)
                  .content(objectMapper.writeValueAsString(request)))
          .andExpect(status().isBadRequest())
          .andExpect(jsonPath(JSON_STATUS, is(400)))
          .andExpect(jsonPath("$.validationErrors[*].field", hasItem("cnpj")));

      verify(companySettingsService, never()).updateSettings(any());
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("invalidFieldRequests")
    @DisplayName("Deve retornar 400 Bad Request para campos obrigatórios vazios ou formatos inválidos")
    void shouldReturn400ForInvalidFields(
        String scenario, CompanySettingsRequestDTO invalidRequest, String expectedField)
        throws Exception {
      mockMvc
          .perform(
              put(ENDPOINT)
                  .contentType(MediaType.APPLICATION_JSON)
                  .content(objectMapper.writeValueAsString(invalidRequest)))
          .andExpect(status().isBadRequest())
          .andExpect(jsonPath(JSON_STATUS, is(400)))
          .andExpect(jsonPath("$.validationErrors", is(not(empty()))))
          .andExpect(jsonPath("$.validationErrors[*].field", hasItem(expectedField)));

      verify(companySettingsService, never()).updateSettings(any());
    }

    @Test
    @DisplayName("Deve retornar 400 Bad Request quando o corpo JSON estiver malformado")
    void shouldReturn400WhenJsonBodyIsMalformed() throws Exception {
      mockMvc
          .perform(
              put(ENDPOINT)
                  .contentType(MediaType.APPLICATION_JSON)
                  .content("{\"companyName\": \"Alumiportas\", invalid"))
          .andExpect(status().isBadRequest())
          .andExpect(jsonPath(JSON_STATUS, is(400)));

      verify(companySettingsService, never()).updateSettings(any());
    }

    static Stream<Arguments> invalidFieldRequests() {
      return Stream.of(
          Arguments.of(
              "Razão social em branco",
              new CompanySettingsRequestDTO(
                  "   ",
                  VALID_TRADE_NAME,
                  VALID_CNPJ_MASKED,
                  VALID_IE,
                  VALID_PHONE,
                  VALID_EMAIL,
                  VALID_ZIP_CODE,
                  VALID_ADDRESS,
                  VALID_CITY_STATE),
              "companyName"),
          Arguments.of(
              "Nome fantasia em branco",
              new CompanySettingsRequestDTO(
                  VALID_COMPANY_NAME,
                  "",
                  VALID_CNPJ_MASKED,
                  VALID_IE,
                  VALID_PHONE,
                  VALID_EMAIL,
                  VALID_ZIP_CODE,
                  VALID_ADDRESS,
                  VALID_CITY_STATE),
              "tradeName"),
          Arguments.of(
              "CNPJ em branco",
              new CompanySettingsRequestDTO(
                  VALID_COMPANY_NAME,
                  VALID_TRADE_NAME,
                  " ",
                  VALID_IE,
                  VALID_PHONE,
                  VALID_EMAIL,
                  VALID_ZIP_CODE,
                  VALID_ADDRESS,
                  VALID_CITY_STATE),
              "cnpj"),
          Arguments.of(
              "Telefone inválido",
              new CompanySettingsRequestDTO(
                  VALID_COMPANY_NAME,
                  VALID_TRADE_NAME,
                  VALID_CNPJ_MASKED,
                  VALID_IE,
                  "tel-abc",
                  VALID_EMAIL,
                  VALID_ZIP_CODE,
                  VALID_ADDRESS,
                  VALID_CITY_STATE),
              "phone"),
          Arguments.of(
              "E-mail malformado",
              new CompanySettingsRequestDTO(
                  VALID_COMPANY_NAME,
                  VALID_TRADE_NAME,
                  VALID_CNPJ_MASKED,
                  VALID_IE,
                  VALID_PHONE,
                  "contato-sem-dominio",
                  VALID_ZIP_CODE,
                  VALID_ADDRESS,
                  VALID_CITY_STATE),
              "email"),
          Arguments.of(
              "CEP malformado",
              new CompanySettingsRequestDTO(
                  VALID_COMPANY_NAME,
                  VALID_TRADE_NAME,
                  VALID_CNPJ_MASKED,
                  VALID_IE,
                  VALID_PHONE,
                  VALID_EMAIL,
                  "5880-00",
                  VALID_ADDRESS,
                  VALID_CITY_STATE),
              "zipCode"),
          Arguments.of(
              "Endereço em branco",
              new CompanySettingsRequestDTO(
                  VALID_COMPANY_NAME,
                  VALID_TRADE_NAME,
                  VALID_CNPJ_MASKED,
                  VALID_IE,
                  VALID_PHONE,
                  VALID_EMAIL,
                  VALID_ZIP_CODE,
                  "  ",
                  VALID_CITY_STATE),
              "address"),
          Arguments.of(
              "Cidade/UF em branco",
              new CompanySettingsRequestDTO(
                  VALID_COMPANY_NAME,
                  VALID_TRADE_NAME,
                  VALID_CNPJ_MASKED,
                  VALID_IE,
                  VALID_PHONE,
                  VALID_EMAIL,
                  VALID_ZIP_CODE,
                  VALID_ADDRESS,
                  ""),
              "cityState"));
    }
  }

  private static CompanySettingsResponseDTO buildSampleResponse() {
    return new CompanySettingsResponseDTO(
        CompanySettings.SINGLETON_ID,
        VALID_COMPANY_NAME,
        VALID_TRADE_NAME,
        VALID_CNPJ_MASKED,
        VALID_IE,
        VALID_PHONE,
        VALID_EMAIL,
        VALID_ZIP_CODE,
        VALID_ADDRESS,
        VALID_CITY_STATE,
        OffsetDateTime.of(2026, 11, 26, 15, 30, 0, 0, ZoneOffset.UTC));
  }
}
