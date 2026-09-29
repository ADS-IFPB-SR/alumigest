package br.edu.ifpb.alumigest.clients.mapper;

import br.edu.ifpb.alumigest.clients.domain.Client;
import br.edu.ifpb.alumigest.clients.domain.PersonType;
import br.edu.ifpb.alumigest.clients.dto.ClientRequestDTO;
import br.edu.ifpb.alumigest.clients.dto.ClientResponseDTO;
import br.edu.ifpb.alumigest.clients.dto.ClientSummaryDTO;
import org.springframework.stereotype.Component;

/**
 * Mapper responsável pela conversão desacoplada entre a entidade {@link Client}
 * e os DTOs de transporte da camada de apresentação.
 */
@Component
public class ClientMapper {

    /**
     * Converte o DTO de requisição em uma nova entidade {@link Client}.
     */
    public Client toEntity(ClientRequestDTO request) {
        if (request == null) {
            return null;
        }

        Client client = new Client();
        client.setFullName(request.nomeCompleto() != null ? request.nomeCompleto().trim() : null);
        client.setPersonType(resolvePersonType(request.personType(), request.documento()));
        client.setDocumentNumber(cleanDocument(request.documento()));
        client.setPhone(request.telefone());
        client.setEmail(request.email() != null ? request.email().trim().toLowerCase() : null);
        client.setZipCode(request.cep());
        client.setStreet(request.logradouro());
        client.setNumber(request.numero());
        client.setComplement(request.complemento());
        client.setNeighborhood(request.bairro());
        client.setCity(request.cidade());
        client.setState(request.uf() != null ? request.uf().toUpperCase() : null);
        client.setNotes(request.observacoes());
        client.setActive(true);

        return client;
    }

    /**
     * Atualiza os campos de uma entidade {@link Client} existente com base nos dados do DTO.
     */
    public void updateEntityFromDto(Client client, ClientRequestDTO request) {
        if (client == null || request == null) {
            return;
        }

        client.setFullName(request.nomeCompleto() != null ? request.nomeCompleto().trim() : null);
        if (request.personType() != null) {
            client.setPersonType(request.personType());
        } else if (request.documento() != null) {
            client.setPersonType(resolvePersonType(client.getPersonType(), request.documento()));
        }
        client.setDocumentNumber(cleanDocument(request.documento()));
        client.setPhone(request.telefone());
        client.setEmail(request.email() != null ? request.email().trim().toLowerCase() : null);
        client.setZipCode(request.cep());
        client.setStreet(request.logradouro());
        client.setNumber(request.numero());
        client.setComplement(request.complemento());
        client.setNeighborhood(request.bairro());
        client.setCity(request.cidade());
        client.setState(request.uf() != null ? request.uf().toUpperCase() : null);
        client.setNotes(request.observacoes());
    }

    /**
     * Mapeia a entidade {@link Client} para o DTO de resposta detalhado.
     */
    public ClientResponseDTO toResponse(Client client) {
        if (client == null) {
            return null;
        }

        return new ClientResponseDTO(
                client.getId(),
                client.getFullName(),
                client.getPersonType(),
                client.getDocumentNumber(),
                client.getPhone(),
                client.getEmail(),
                client.getZipCode(),
                client.getStreet(),
                client.getNumber(),
                client.getComplement(),
                client.getNeighborhood(),
                client.getCity(),
                client.getState(),
                client.getNotes(),
                client.isActive(),
                client.getCreatedAt(),
                client.getUpdatedAt()
        );
    }

    /**
     * Mapeia a entidade {@link Client} para o DTO resumido (listagens paginadas).
     */
    public ClientSummaryDTO toSummary(Client client) {
        if (client == null) {
            return null;
        }

        return new ClientSummaryDTO(
                client.getId(),
                client.getFullName(),
                client.getPersonType(),
                client.getDocumentNumber(),
                client.getPhone(),
                client.getEmail(),
                client.getCity(),
                client.getState(),
                client.isActive()
        );
    }

    /**
     * Resolve o PersonType a partir do enum explícito ou do padrão do documento informado.
     */
    private PersonType resolvePersonType(PersonType explicitType, String document) {
        if (explicitType != null) {
            return explicitType;
        }
        if (document != null && !document.isBlank()) {
            String digitsOnly = document.replaceAll("\\D", "");
            if (digitsOnly.length() > 11 || document.contains("/")) {
                return PersonType.JURIDICA;
            }
        }
        return PersonType.FISICA;
    }

    /**
     * Normaliza a string de documento.
     */
    private String cleanDocument(String document) {
        if (document == null || document.isBlank()) {
            return null;
        }
        return document.trim();
    }
}
