package br.edu.ifpb.alumigest.clients.service;

import br.edu.ifpb.alumigest.clients.domain.Client;
import br.edu.ifpb.alumigest.clients.domain.PersonType;
import br.edu.ifpb.alumigest.clients.dto.ClientRequestDTO;
import br.edu.ifpb.alumigest.clients.dto.ClientResponseDTO;
import br.edu.ifpb.alumigest.clients.dto.ClientSummaryDTO;
import br.edu.ifpb.alumigest.clients.mapper.ClientMapper;
import br.edu.ifpb.alumigest.clients.repository.ClientRepository;
import br.edu.ifpb.alumigest.common.dto.PageResponse;
import br.edu.ifpb.alumigest.common.exception.ConflictException;
import br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Implementação do serviço de gestão de clientes com suporte a {@link PersonType},
 * validações de unicidade de documento e controle de status (soft delete).
 */
@Service
@Transactional(readOnly = true)
public class ClientService implements IClientService {

    private final ClientRepository clientRepository;
    private final ClientMapper clientMapper;

    public ClientService(ClientRepository clientRepository, ClientMapper clientMapper) {
        this.clientRepository = clientRepository;
        this.clientMapper = clientMapper;
    }

    @Override
    @Transactional
    public ClientResponseDTO create(ClientRequestDTO request) {
        validateDocumentUniquenessOnCreate(request.documento());

        Client client = clientMapper.toEntity(request);
        Client savedClient = clientRepository.save(client);

        return clientMapper.toResponse(savedClient);
    }

    @Override
    public PageResponse<ClientSummaryDTO> findAll(String busca, PersonType personType, Boolean ativo, Pageable pageable) {
        String query = (busca != null && !busca.isBlank()) ? busca.trim() : null;
        Page<Client> page = clientRepository.searchClients(query, personType, ativo, pageable);
        Page<ClientSummaryDTO> summaryPage = page.map(clientMapper::toSummary);

        return PageResponse.of(summaryPage);
    }

    @Override
    public ClientResponseDTO findById(UUID id) {
        Client client = findClientById(id);
        return clientMapper.toResponse(client);
    }

    @Override
    @Transactional
    public ClientResponseDTO update(UUID id, ClientRequestDTO request) {
        Client client = findClientById(id);

        validateDocumentUniquenessOnUpdate(request.documento(), id);

        clientMapper.updateEntityFromDto(client, request);
        Client updatedClient = clientRepository.save(client);

        return clientMapper.toResponse(updatedClient);
    }

    @Override
    @Transactional
    public ClientResponseDTO toggleStatus(UUID id) {
        Client client = findClientById(id);
        client.toggleStatus();
        Client updatedClient = clientRepository.save(client);

        return clientMapper.toResponse(updatedClient);
    }

    // -------------------------------------------------------------------------
    // Métodos Auxiliares
    // -------------------------------------------------------------------------

    private Client findClientById(UUID id) {
        return clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente", id));
    }

    private void validateDocumentUniquenessOnCreate(String documento) {
        if (documento != null && !documento.isBlank()) {
            String trimmed = documento.trim();
            if (clientRepository.existsByDocumentNumber(trimmed)) {
                throw new ConflictException("Já existe um cliente cadastrado com o documento: " + trimmed);
            }
        }
    }

    private void validateDocumentUniquenessOnUpdate(String documento, UUID clientId) {
        if (documento != null && !documento.isBlank()) {
            String trimmed = documento.trim();
            if (clientRepository.existsByDocumentNumberAndIdNot(trimmed, clientId)) {
                throw new ConflictException("Já existe outro cliente cadastrado com o documento: " + trimmed);
            }
        }
    }
}
