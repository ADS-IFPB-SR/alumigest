package br.edu.ifpb.alumigest.common.controller;

import br.edu.ifpb.alumigest.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/health")
@Tag(name = "Health Check", description = "Monitoramento e status de integridade da API")
public class HealthController {

    @GetMapping
    @Operation(summary = "Verificar integridade da API", description = "Retorna o status atual, versão e horário do servidor.")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkHealth() {
        Map<String, Object> healthInfo = Map.of(
                "status", "UP",
                "application", "AlumiGest Backend",
                "version", "0.1.0-SNAPSHOT",
                "timestamp", LocalDateTime.now(),
                "partner", "Alumiportas",
                "institution", "IFPB Campus Sousa"
        );
        return ResponseEntity.ok(ApiResponse.ok("API operacional e pronta para conexões", healthInfo));
    }
}
