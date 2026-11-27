package br.edu.ifpb.alumigest.common.config;

import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * Configuração global de CORS integrada à cadeia do Spring Security.
 */
@Configuration
public class CorsConfig {

  /**
   * Define as regras globais de CORS consumidas pela {@code SecurityFilterChain}.
   *
   * @return fonte de configuração CORS aplicada a todas as rotas
   */
  @Bean
  public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowCredentials(true);
    config.setAllowedOriginPatterns(List.of(
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "https://*.alumigest.com.br"
    ));
    config.setAllowedHeaders(List.of(
        "Origin",
        "Content-Type",
        "Accept",
        "Authorization",
        "X-Requested-With"
    ));
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
    config.setExposedHeaders(List.of("Content-Disposition"));
    config.setMaxAge(3600L);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return source;
  }
}
