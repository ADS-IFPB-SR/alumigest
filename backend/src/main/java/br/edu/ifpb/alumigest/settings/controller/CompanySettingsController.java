package br.edu.ifpb.alumigest.settings.controller;

import br.edu.ifpb.alumigest.settings.dto.CompanySettingsRequestDTO;
import br.edu.ifpb.alumigest.settings.dto.CompanySettingsResponseDTO;
import br.edu.ifpb.alumigest.settings.service.CompanySettingsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controlador REST para consulta e atualização dos dados institucionais da empresa (US-50.1).
 */
@RestController
@RequestMapping("/api/v1/settings/company")
@Tag(
    name = "Configurações da Empresa",
    description = "Gestão dos dados institucionais e cabeçalho documental da empresa")
@SecurityRequirement(name = "bearerAuth")
public class CompanySettingsController {

  private final CompanySettingsService companySettingsService;

  /**
   * Constrói o controlador de configurações institucionais da empresa.
   *
   * @param companySettingsService serviço de aplicação de configurações institucionais
   */
  public CompanySettingsController(CompanySettingsService companySettingsService) {
    this.companySettingsService = companySettingsService;
  }

  /**
   * Recupera os dados institucionais vigentes da empresa.
   *
   * @return resposta HTTP 200 com as configurações atuais da empresa
   */
  @GetMapping
  @Operation(
      summary = "Consultar configurações institucionais da empresa",
      description =
          "Retorna os dados institucionais do registro singleton da oficina, aplicando "
              + "fallback resiliente quando necessário.")
  @ApiResponse(
      responseCode = "200",
      description = "Configurações institucionais recuperadas com sucesso",
      content = @Content(schema = @Schema(implementation = CompanySettingsResponseDTO.class)))
  @ApiResponse(responseCode = "401", description = "Operador não autenticado")
  public ResponseEntity<CompanySettingsResponseDTO> getCompanySettings() {
    return ResponseEntity.ok(companySettingsService.getSettings());
  }

  /**
   * Atualiza os dados institucionais do registro singleton da empresa.
   *
   * @param request payload validado com os novos dados institucionais
   * @return resposta HTTP 200 com as configurações persistidas e normalizadas
   */
  @PutMapping
  @Operation(
      summary = "Atualizar configurações institucionais da empresa",
      description =
          "Valida, normaliza e persiste os dados institucionais do registro singleton da "
              + "empresa para uso nas telas e em novos PDFs gerados.")
  @ApiResponse(
      responseCode = "200",
      description = "Configurações institucionais atualizadas com sucesso",
      content = @Content(schema = @Schema(implementation = CompanySettingsResponseDTO.class)))
  @ApiResponse(
      responseCode = "400",
      description = "Dados inválidos (ex: CNPJ inválido, e-mail malformado ou campo em branco)")
  @ApiResponse(responseCode = "401", description = "Operador não autenticado")
  public ResponseEntity<CompanySettingsResponseDTO> updateCompanySettings(
      @io.swagger.v3.oas.annotations.parameters.RequestBody(
              description = "Payload com os dados institucionais atualizados da empresa",
              required = true)
          @RequestBody
          @Valid
          CompanySettingsRequestDTO request) {
    return ResponseEntity.ok(companySettingsService.updateSettings(request));
  }
}
