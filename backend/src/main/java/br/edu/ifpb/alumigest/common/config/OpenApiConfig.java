package br.edu.ifpb.alumigest.common.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI alumigestOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("AlumiGest API — Gestão e Precificação")
                        .description("API REST do sistema AlumiGest para gestão de catálogo de insumos, orçamentos e produção de esquadrias e vidraçaria.\n\n" +
                                "**Parceiro Social:** Alumiportas\n\n" +
                                "**Instituição:** Instituto Federal da Paraíba (IFPB Campus Sousa)")
                        .version("v0.1.0")
                        .contact(new Contact()
                                .name("Equipe de Engenharia AlumiGest (IFPB)")
                                .url("https://github.com/ADS-IFPB-SR/alumigest"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")));
    }
}
