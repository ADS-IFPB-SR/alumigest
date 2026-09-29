package br.edu.ifpb.alumigest.clients.service;

import br.edu.ifpb.alumigest.clients.domain.PersonType;
import br.edu.ifpb.alumigest.clients.dto.ClientRequestDTO;
import br.edu.ifpb.alumigest.clients.dto.ClientResponseDTO;
import br.edu.ifpb.alumigest.clients.dto.ClientSummaryDTO;
import br.edu.ifpb.alumigest.common.dto.PageResponse;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

/**
 * Interface que define o contrato de operações para o gerenciamento de clientes.
 */
public interface IClientService {

    /**
     * Cadastra um novo cliente com validação de unicidade de documento e tipo de pessoa.
     *
     * @param request dados do cliente
     * @return cliente criado com ID gerado
     */
    ClientResponseDTO create(ClientRequestDTO request);

    /**
     * Lista clientes de forma paginada com suporte a filtros de busca textual, tipo de pessoa e status.
     *
     * @param busca      termo para busca por nome, documento, telefone ou cidade (opcional)
     * @param personType filtro por tipo de pessoa FISICA ou JURIDICA (opcional)
     * @param ativo      filtro por status ativo (opcional)
     * @param pageable   dados de paginação e ordenação
     * @return página contendo resumo dos clientes
     */
    PageResponse<ClientSummaryDTO> findAll(String busca, PersonType personType, Boolean ativo, Pageable pageable);

    /**
     * Recupera os detalhes completos de um cliente por seu identificador único.
     *
     * @param id identificador único do cliente
     * @return detalhes completos do cliente
     */
    ClientResponseDTO findById(UUID id);

    /**
     * Atualiza os dados de um cliente existente.
     *
     * @param id      identificador único do cliente
     * @param request dados atualizados
     * @return cliente atualizado
     */
    ClientResponseDTO update(UUID id, ClientRequestDTO request);

    /**
     * Alterna o status do cliente entre ativo e inativo (soft delete).
     *
     * @param id identificador único do cliente
     * @return cliente com o status atualizado
     */
    ClientResponseDTO toggleStatus(UUID id);
}
