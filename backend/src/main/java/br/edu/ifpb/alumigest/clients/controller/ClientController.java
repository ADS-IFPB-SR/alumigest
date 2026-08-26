package br.edu.ifpb.alumigest.clients.controller;

import br.edu.ifpb.alumigest.clients.domain.PersonType;
import br.edu.ifpb.alumigest.clients.dto.ClientRequestDTO;
import br.edu.ifpb.alumigest.clients.dto.ClientResponseDTO;
import br.edu.ifpb.alumigest.clients.dto.ClientSummaryDTO;
import br.edu.ifpb.alumigest.clients.service.IClientService;
import br.edu.ifpb.alumigest.common.dto.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping({"/api/clientes", "/api/v1/clients"})
@Tag(name = "Clientes", description = "Endpoints para gerenciamento do cadastro de clientes")
public class ClientController {

    private final IClientService clientService;

    public ClientController(IClientService clientService) {
        this.clientService = clientService;
    }

    @PostMapping
    @Operation(summary = "Cadastrar novo cliente", description = "Registra um cliente com tipo de pessoa (FISICA ou JURIDICA) e documento único.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Cliente cadastrado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos fornecidos no corpo da requisição"),
            @ApiResponse(responseCode = "409", description = "Conflito: Documento (CPF/CNPJ) já cadastrado para outro cliente")
    })
    public ResponseEntity<ClientResponseDTO> create(@RequestBody @Valid ClientRequestDTO request) {
        ClientResponseDTO response = clientService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "Listar clientes", description = "Lista clientes de forma paginada com suporte a busca textual, tipo de pessoa (FISICA/JURIDICA) e status.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista paginada de clientes recuperada com sucesso")
    })
    public ResponseEntity<PageResponse<ClientSummaryDTO>> findAll(
            @Parameter(description = "Termo para busca textual (nome, documento, telefone ou cidade)")
            @RequestParam(required = false) String busca,
            @Parameter(description = "Filtro por tipo de pessoa (FISICA ou JURIDICA)")
            @RequestParam(required = false) PersonType personType,
            @Parameter(description = "Filtro de status ativo (true/false)")
            @RequestParam(required = false) Boolean ativo,
            @ParameterObject @PageableDefault(size = 20, sort = "fullName") Pageable pageable) {

        PageResponse<ClientSummaryDTO> response = clientService.findAll(busca, personType, ativo, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar cliente por ID", description = "Retorna os detalhes completos do cliente e seu endereço cadastrado.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Cliente encontrado"),
            @ApiResponse(responseCode = "404", description = "Cliente não encontrado")
    })
    public ResponseEntity<ClientResponseDTO> findById(@PathVariable UUID id) {
        ClientResponseDTO response = clientService.findById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar cliente", description = "Atualiza todas as informações do cliente especificado pelo ID.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Cliente atualizado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos fornecidos"),
            @ApiResponse(responseCode = "404", description = "Cliente não encontrado"),
            @ApiResponse(responseCode = "409", description = "Conflito: Documento já pertence a outro cliente")
    })
    public ResponseEntity<ClientResponseDTO> update(
            @PathVariable UUID id,
            @RequestBody @Valid ClientRequestDTO request) {

        ClientResponseDTO response = clientService.update(id, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Alternar status do cliente", description = "Ativa ou inativa o cliente (soft delete) mantendo seu histórico.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Status do cliente alterado com sucesso"),
            @ApiResponse(responseCode = "404", description = "Cliente não encontrado")
    })
    public ResponseEntity<ClientResponseDTO> toggleStatus(@PathVariable UUID id) {
        ClientResponseDTO response = clientService.toggleStatus(id);
        return ResponseEntity.ok(response);
    }
}
