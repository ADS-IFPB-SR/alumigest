package br.edu.ifpb.alumigest.clients.repository;

import br.edu.ifpb.alumigest.clients.domain.Client;
import br.edu.ifpb.alumigest.clients.domain.PersonType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ClientRepository extends JpaRepository<Client, UUID> {

    /**
     * Verifica se já existe um cliente com o documento informado.
     */
    boolean existsByDocumentNumber(String documentNumber);

    /**
     * Verifica se já existe outro cliente (com ID diferente) com o documento informado.
     */
    boolean existsByDocumentNumberAndIdNot(String documentNumber, UUID id);

    /**
     * Busca um cliente pelo número do documento.
     */
    Optional<Client> findByDocumentNumber(String documentNumber);

    /**
     * Busca paginada de clientes com suporte a filtro textual (nome, documento, telefone ou cidade),
     * filtro de tipo de pessoa (FISICA ou JURIDICA) e filtro de status ativo/inativo.
     */
    @Query("""
        SELECT c FROM Client c
        WHERE (:ativo IS NULL OR c.isActive = :ativo)
          AND (:personType IS NULL OR c.personType = :personType)
          AND (CAST(:busca AS string) IS NULL OR :busca = ''
               OR LOWER(c.fullName) LIKE LOWER(CONCAT('%', CAST(:busca AS string), '%'))
               OR LOWER(c.documentNumber) LIKE LOWER(CONCAT('%', CAST(:busca AS string), '%'))
               OR LOWER(c.phone) LIKE LOWER(CONCAT('%', CAST(:busca AS string), '%'))
               OR LOWER(c.city) LIKE LOWER(CONCAT('%', CAST(:busca AS string), '%')))
    """)
    Page<Client> searchClients(
            @Param("busca") String busca,
            @Param("personType") PersonType personType,
            @Param("ativo") Boolean ativo,
            Pageable pageable
    );
}
