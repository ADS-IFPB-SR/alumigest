package br.edu.ifpb.alumigest.auth.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.edu.ifpb.alumigest.auth.config.JwtProperties;
import br.edu.ifpb.alumigest.auth.domain.User;
import br.edu.ifpb.alumigest.auth.dto.LoginRequest;
import br.edu.ifpb.alumigest.auth.repository.UserRepository;
import br.edu.ifpb.alumigest.auth.service.JwtService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("Segurança e Endpoints /api/v1/auth [US-48.2] - Integração Spring Security 6")
class AuthSecurityIntegrationTest {

  private static final String LOGIN_URL = "/api/v1/auth/login";
  private static final String ME_URL = "/api/v1/auth/me";
  private static final String TEST_EMAIL = "operador.teste@alumigest.com";
  private static final String TEST_PASSWORD = "AlumiGest@Test2026";
  private static final String INACTIVE_EMAIL = "inativo.teste@alumigest.com";

  private final MockMvc mockMvc;
  private final ObjectMapper objectMapper;
  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtProperties jwtProperties;

  private User activeUser;

  @Autowired
  AuthSecurityIntegrationTest(
      MockMvc mockMvc,
      ObjectMapper objectMapper,
      UserRepository userRepository,
      PasswordEncoder passwordEncoder,
      JwtProperties jwtProperties) {
    this.mockMvc = mockMvc;
    this.objectMapper = objectMapper;
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtProperties = jwtProperties;
  }

  @BeforeEach
  void setUpUsers() {
    activeUser = userRepository.save(
        new User("Operador Teste", TEST_EMAIL, passwordEncoder.encode(TEST_PASSWORD)));

    User inactiveUser = new User(
        "Operador Inativo", INACTIVE_EMAIL, passwordEncoder.encode(TEST_PASSWORD));
    ReflectionTestUtils.setField(inactiveUser, "isActive", false);
    userRepository.save(inactiveUser);
  }

  private String performLoginAndExtractToken() throws Exception {
    MvcResult result = mockMvc.perform(post(LOGIN_URL)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(
                new LoginRequest(TEST_EMAIL, TEST_PASSWORD))))
        .andExpect(status().isOk())
        .andReturn();
    JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
    return json.get("token").asText();
  }

  @Nested
  @DisplayName("POST /api/v1/auth/login")
  class LoginEndpointTests {

    @Test
    @DisplayName(
        "[Partição de Equivalência] Deve autenticar com sucesso, retornar JWT + dados"
            + " públicos do operador e manter sessão stateless")
    void shouldLoginAndReturnJwtWithoutHttpSession() throws Exception {
      MvcResult result = mockMvc.perform(post(LOGIN_URL)
              .contentType(MediaType.APPLICATION_JSON)
              .content(objectMapper.writeValueAsString(
                  new LoginRequest("OPERADOR.TESTE@AlumiGest.com", TEST_PASSWORD))))
          .andExpect(status().isOk())
          .andExpect(jsonPath("$.token").isNotEmpty())
          .andExpect(jsonPath("$.tokenType").value("Bearer"))
          .andExpect(jsonPath("$.expiresIn").value(jwtProperties.getExpiration().toSeconds()))
          .andExpect(jsonPath("$.user.id").value(activeUser.getId().toString()))
          .andExpect(jsonPath("$.user.name").value("Operador Teste"))
          .andExpect(jsonPath("$.user.email").value(TEST_EMAIL))
          .andExpect(jsonPath("$.user.passwordHash").doesNotExist())
          .andReturn();

      assertThat(result.getRequest().getSession(false)).isNull();
    }

    @Test
    @DisplayName(
        "[Tabela de Decisão] Deve retornar 401 uniforme para senha incorreta, e-mail"
            + " desconhecido e conta inativa")
    void shouldReturnUniform401ForInvalidCredentials() throws Exception {
      LoginRequest wrongPassword = new LoginRequest(TEST_EMAIL, "SenhaIncorreta");
      LoginRequest unknownEmail = new LoginRequest("naoexiste@alumigest.com", TEST_PASSWORD);
      LoginRequest inactiveAccount = new LoginRequest(INACTIVE_EMAIL, TEST_PASSWORD);

      for (LoginRequest payload : new LoginRequest[] {
          wrongPassword, unknownEmail, inactiveAccount
      }) {
        mockMvc.perform(post(LOGIN_URL)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload)))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.status").value(401))
            .andExpect(jsonPath("$.error").value("Unauthorized"))
            .andExpect(jsonPath("$.message").value("E-mail ou senha inválidos"))
            .andExpect(jsonPath("$.path").value(LOGIN_URL));
      }
    }

    @Test
    @DisplayName(
        "[Análise de Valor Limite] Deve retornar 400 Bad Request para e-mail inválido ou"
            + " campos obrigatórios em branco")
    void shouldReturn400ForInvalidPayload() throws Exception {
      mockMvc.perform(post(LOGIN_URL)
              .contentType(MediaType.APPLICATION_JSON)
              .content(objectMapper.writeValueAsString(new LoginRequest("email-invalido", ""))))
          .andExpect(status().isBadRequest())
          .andExpect(jsonPath("$.status").value(400))
          .andExpect(jsonPath("$.validationErrors").isArray());
    }
  }

  @Nested
  @DisplayName("GET /api/v1/auth/me e proteção de rotas")
  class ProtectedRoutesTests {

    @Test
    @DisplayName(
        "[Partição de Equivalência] Deve retornar 200 com dados do operador em /api/v1/auth/me"
            + " quando token Bearer for válido")
    void shouldReturnCurrentUserWithValidBearerToken() throws Exception {
      String token = performLoginAndExtractToken();

      MvcResult result = mockMvc.perform(get(ME_URL)
              .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
          .andExpect(status().isOk())
          .andExpect(jsonPath("$.id").value(activeUser.getId().toString()))
          .andExpect(jsonPath("$.name").value("Operador Teste"))
          .andExpect(jsonPath("$.email").value(TEST_EMAIL))
          .andExpect(jsonPath("$.passwordHash").doesNotExist())
          .andReturn();

      assertThat(result.getRequest().getSession(false)).isNull();
    }

    @Test
    @DisplayName(
        "[Tabela de Decisão] Deve retornar 401 JSON em /api/v1/auth/me sem token, com token"
            + " malformado ou com token expirado")
    void shouldReturn401OnMeWithoutOrWithInvalidToken() throws Exception {
      mockMvc.perform(get(ME_URL))
          .andExpect(status().isUnauthorized())
          .andExpect(jsonPath("$.status").value(401))
          .andExpect(jsonPath("$.error").value("Unauthorized"))
          .andExpect(jsonPath("$.path").value(ME_URL));

      mockMvc.perform(get(ME_URL)
              .header(HttpHeaders.AUTHORIZATION, "Bearer token.malformado.invalido"))
          .andExpect(status().isUnauthorized())
          .andExpect(jsonPath("$.status").value(401))
          .andExpect(jsonPath("$.message").value("Token JWT inválido ou expirado."));

      JwtProperties pastProps = new JwtProperties();
      pastProps.setSecret(jwtProperties.getSecret());
      pastProps.setExpiration(Duration.ofSeconds(1));
      JwtService pastService = new JwtService(
          pastProps, Clock.fixed(Instant.now().minus(Duration.ofHours(2)), ZoneOffset.UTC));
      String expiredToken = pastService.generateToken(activeUser);

      mockMvc.perform(get(ME_URL)
              .header(HttpHeaders.AUTHORIZATION, "Bearer " + expiredToken))
          .andExpect(status().isUnauthorized())
          .andExpect(jsonPath("$.status").value(401))
          .andExpect(jsonPath("$.message").value("Token JWT inválido ou expirado."));
    }

    @Test
    @DisplayName(
        "[Partição de Equivalência] Deve bloquear rota de negócio sem JWT (401) e incluir"
            + " headers CORS para origem permitida")
    void shouldProtectBusinessRoutesAndPreserveCorsHeaders() throws Exception {
      mockMvc.perform(get("/api/v1/catalog/aluminum-profiles")
              .header(HttpHeaders.ORIGIN, "http://localhost:5173"))
          .andExpect(status().isUnauthorized())
          .andExpect(header().string(
              HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:5173"))
          .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    @DisplayName(
        "[Partição de Equivalência] Deve liberar rotas públicas (health, preflight OPTIONS e"
            + " OpenAPI com bearerAuth)")
    void shouldPermitPublicRoutesAndExposeOpenApiBearerAuth() throws Exception {
      mockMvc.perform(get("/api/v1/health"))
          .andExpect(status().isOk());

      mockMvc.perform(options(LOGIN_URL)
              .header(HttpHeaders.ORIGIN, "http://localhost:5173")
              .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "POST"))
          .andExpect(status().isOk())
          .andExpect(header().string(
              HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:5173"));

      mockMvc.perform(get("/v3/api-docs"))
          .andExpect(status().isOk())
          .andExpect(jsonPath("$.components.securitySchemes.bearerAuth.type").value("http"))
          .andExpect(jsonPath("$.components.securitySchemes.bearerAuth.scheme").value("bearer"))
          .andExpect(jsonPath("$.components.securitySchemes.bearerAuth.bearerFormat").value("JWT"));
    }
  }
}
