package br.edu.ifpb.alumigest.auth.config;

import br.edu.ifpb.alumigest.auth.repository.UserRepository;
import br.edu.ifpb.alumigest.auth.security.JwtAuthenticationFilter;
import br.edu.ifpb.alumigest.auth.security.RestAccessDeniedHandler;
import br.edu.ifpb.alumigest.auth.security.RestAuthenticationEntryPoint;
import br.edu.ifpb.alumigest.auth.service.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Configuração central do Spring Security 6 em modo stateless com autenticação JWT Bearer
 * (US-48.2).
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

  /**
   * Codificador de senhas baseado em BCrypt (custo padrão 10).
   *
   * @return instância de {@link BCryptPasswordEncoder}
   */
  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  /**
   * Cadeia de filtros de segurança stateless com CORS integrado, rotas públicas explícitas e
   * proteção por JWT nas demais rotas da API.
   *
   * @param http construtor de segurança HTTP
   * @param jwtService serviço de validação de tokens JWT
   * @param userRepository repositório de contas de acesso
   * @param objectMapper serializador JSON para respostas de erro padronizadas
   * @return cadeia de filtros configurada
   * @throws Exception em caso de erro de configuração do Spring Security
   */
  @Bean
  @SuppressWarnings("java:S4502") // API 100% stateless via JWT Bearer (sem cookies de sessão)
  public SecurityFilterChain securityFilterChain(
      HttpSecurity http,
      JwtService jwtService,
      UserRepository userRepository,
      ObjectMapper objectMapper)
      throws Exception {
    JwtAuthenticationFilter jwtFilter = new JwtAuthenticationFilter(jwtService, userRepository);
    RestAuthenticationEntryPoint entryPoint = new RestAuthenticationEntryPoint(objectMapper);
    RestAccessDeniedHandler accessDeniedHandler = new RestAccessDeniedHandler(objectMapper);

    return http
        .cors(Customizer.withDefaults())
        .csrf(AbstractHttpConfigurer::disable) // NOSONAR: stateless JWT Bearer sem cookies
        .formLogin(AbstractHttpConfigurer::disable)
        .httpBasic(AbstractHttpConfigurer::disable)
        .sessionManagement(
            session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .exceptionHandling(
            exceptions -> exceptions
                .authenticationEntryPoint(entryPoint)
                .accessDeniedHandler(accessDeniedHandler))
        .authorizeHttpRequests(
            auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/v1/auth/login").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/health").permitAll()
                .requestMatchers(
                    "/v3/api-docs/**",
                    "/swagger-ui/**",
                    "/swagger-ui.html")
                .permitAll()
                .anyRequest().authenticated())
        .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
        .build();
  }
}
