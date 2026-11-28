package br.edu.ifpb.alumigest.common.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuração do contrato OpenAPI 3 / Swagger UI com esquema Bearer JWT.
 */
@Configuration
public class OpenApiConfig {

  public static final String BEARER_AUTH_SCHEME = "bearerAuth";

  /**
   * Constrói a especificação OpenAPI 3 com esquema de segurança HTTP Bearer JWT.
   *
   * @return configuração global do OpenAPI
   */
  @Bean
  public OpenAPI alumigestOpenAPI() {
    SecurityScheme bearerScheme = new SecurityScheme()
        .name(BEARER_AUTH_SCHEME)
        .type(SecurityScheme.Type.HTTP)
        .scheme("bearer")
        .bearerFormat("JWT")
        .description("Token JWT obtido em POST /api/v1/auth/login");

    return new OpenAPI()
        .components(new Components().addSecuritySchemes(BEARER_AUTH_SCHEME, bearerScheme))
        .addSecurityItem(new SecurityRequirement().addList(BEARER_AUTH_SCHEME))
        .info(new Info()
            .title("AlumiGest API — Gestão e Precificação")
            .description("""
                API REST do sistema AlumiGest para gestão de catálogo de insumos, orçamentos e \
                produção de esquadrias e vidraçaria.

                **Parceiro Social:** Alumiportas

                **Instituição:** Instituto Federal da Paraíba (IFPB Campus Santa Rita)""")
            .version("v0.1.0")
            .contact(new Contact()
                .name("Equipe de Engenharia AlumiGest (IFPB)")
                .url("https://github.com/ADS-IFPB-SR/alumigest"))
            .license(new License()
                .name("MIT License")
                .url("https://opensource.org/licenses/MIT")));
  }
}
