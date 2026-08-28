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
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ClientServiceTest {

    @Mock
    private ClientRepository clientRepository;

    private ClientMapper clientMapper = new ClientMapper();

    private ClientService clientService;

    @org.junit.jupiter.api.BeforeEach
    void setUp() {
        clientService = new ClientService(clientRepository, clientMapper);
    }

    @Test
    @DisplayName("Deve cadastrar cliente Pessoa Física com sucesso quando dados forem válidos")
    void create_ShouldSaveAndReturnFisicaClient_WhenDataIsValid() {
        // Arrange
        ClientRequestDTO request = new ClientRequestDTO(
                "João da Silva",
                PersonType.FISICA,
                "123.456.789-00",
                "(83) 99999-0000",
                "joao@email.com",
                "58300-000",
                "Rua das Flores",
                "123",
                "Casa",
                "Centro",
                "Santa Rita",
                "PB",
                "Sem observações"
        );

        when(clientRepository.existsByDocumentNumber("123.456.789-00")).thenReturn(false);
        when(clientRepository.save(any(Client.class))).thenAnswer(invocation -> {
            Client c = invocation.getArgument(0);
            c.setId(UUID.randomUUID());
            return c;
        });

        // Act
        ClientResponseDTO response = clientService.create(request);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.id()).isNotNull();
        assertThat(response.nomeCompleto()).isEqualTo("João da Silva");
        assertThat(response.personType()).isEqualTo(PersonType.FISICA);
        assertThat(response.documento()).isEqualTo("123.456.789-00");
        assertThat(response.telefone()).isEqualTo("(83) 99999-0000");
        assertThat(response.email()).isEqualTo("joao@email.com");
        assertThat(response.cidade()).isEqualTo("Santa Rita");
        assertThat(response.uf()).isEqualTo("PB");
        assertThat(response.ativo()).isTrue();

        verify(clientRepository, times(1)).save(any(Client.class));
    }

    @Test
    @DisplayName("Deve cadastrar cliente Pessoa Jurídica com sucesso")
    void create_ShouldSaveAndReturnJuridicaClient_WhenDataIsValid() {
        // Arrange
        ClientRequestDTO request = new ClientRequestDTO(
                "Construtora Alumiportas LTDA",
                PersonType.JURIDICA,
                "12.345.678/0001-90",
                "(83) 3218-0000",
                "contato@construtora.com",
                "58000-000",
                "Av Epitácio Pessoa",
                "500",
                "Sala 302",
                "Estados",
                "João Pessoa",
                "PB",
                "Entrega direto na obra"
        );

        when(clientRepository.existsByDocumentNumber("12.345.678/0001-90")).thenReturn(false);
        when(clientRepository.save(any(Client.class))).thenAnswer(invocation -> {
            Client c = invocation.getArgument(0);
            c.setId(UUID.randomUUID());
            return c;
        });

        // Act
        ClientResponseDTO response = clientService.create(request);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.nomeCompleto()).isEqualTo("Construtora Alumiportas LTDA");
        assertThat(response.personType()).isEqualTo(PersonType.JURIDICA);
        assertThat(response.documento()).isEqualTo("12.345.678/0001-90");

        verify(clientRepository, times(1)).save(any(Client.class));
    }

    @Test
    @DisplayName("Deve lançar ConflictException ao tentar cadastrar documento duplicado")
    void create_ShouldThrowConflictException_WhenDocumentAlreadyExists() {
        // Arrange
        ClientRequestDTO request = new ClientRequestDTO(
                "João da Silva",
                PersonType.FISICA,
                "123.456.789-00",
                null, null, null, null, null, null, null, null, null, null
        );

        when(clientRepository.existsByDocumentNumber("123.456.789-00")).thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> clientService.create(request))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("Já existe um cliente cadastrado com o documento");

        verify(clientRepository, never()).save(any(Client.class));
    }

    @Test
    @DisplayName("Deve listar clientes de forma paginada com filtro de busca e personType")
    void findAll_ShouldReturnPaginatedClients() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        Client client = new Client("João da Silva", PersonType.FISICA, "123.456.789-00", "(83) 99999-0000", "joao@email.com",
                "58300-000", "Rua das Flores", "123", "Casa", "Centro", "Santa Rita", "PB", null);
        client.setId(UUID.randomUUID());

        Page<Client> page = new PageImpl<>(List.of(client), pageable, 1);
        when(clientRepository.searchClients(eq("silva"), eq(PersonType.FISICA), eq(true), eq(pageable))).thenReturn(page);

        // Act
        PageResponse<ClientSummaryDTO> result = clientService.findAll("silva", PersonType.FISICA, true, pageable);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.totalElements()).isEqualTo(1);
        assertThat(result.content()).hasSize(1);
        assertThat(result.content().get(0).nomeCompleto()).isEqualTo("João da Silva");
        assertThat(result.content().get(0).personType()).isEqualTo(PersonType.FISICA);
    }

    @Test
    @DisplayName("Deve buscar cliente por ID existente com sucesso")
    void findById_ShouldReturnClient_WhenIdExists() {
        // Arrange
        UUID id = UUID.randomUUID();
        Client client = new Client("Maria Souza", PersonType.FISICA, "987.654.321-99", "(83) 98888-7777", "maria@email.com",
                "58000-000", "Av Principal", "456", "Apto 2", "Manaíra", "João Pessoa", "PB", "Obs");
        client.setId(id);

        when(clientRepository.findById(id)).thenReturn(Optional.of(client));

        // Act
        ClientResponseDTO response = clientService.findById(id);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(id);
        assertThat(response.nomeCompleto()).isEqualTo("Maria Souza");
        assertThat(response.logradouro()).isEqualTo("Av Principal");
    }

    @Test
    @DisplayName("Deve lançar ResourceNotFoundException ao buscar cliente por ID inexistente")
    void findById_ShouldThrowNotFound_WhenIdDoesNotExist() {
        // Arrange
        UUID id = UUID.randomUUID();
        when(clientRepository.findById(id)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> clientService.findById(id))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("Deve atualizar cliente com sucesso quando dados forem válidos")
    void update_ShouldUpdateAndReturnClient_WhenValid() {
        // Arrange
        UUID id = UUID.randomUUID();
        Client client = new Client("Nome Antigo", PersonType.FISICA, "111.222.333-44", null, null, null, null, null, null, null, null, null, null);
        client.setId(id);

        ClientRequestDTO updateRequest = new ClientRequestDTO(
                "Nome Atualizado",
                PersonType.FISICA,
                "111.222.333-44",
                "(83) 91111-2222",
                "novo@email.com",
                "58300-000",
                "Nova Rua",
                "99",
                null,
                "Bairro Novo",
                "Santa Rita",
                "PB",
                "Atualizado"
        );

        when(clientRepository.findById(id)).thenReturn(Optional.of(client));
        when(clientRepository.existsByDocumentNumberAndIdNot("111.222.333-44", id)).thenReturn(false);
        when(clientRepository.save(any(Client.class))).thenReturn(client);

        // Act
        ClientResponseDTO response = clientService.update(id, updateRequest);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.nomeCompleto()).isEqualTo("Nome Atualizado");
        assertThat(response.telefone()).isEqualTo("(83) 91111-2222");
        assertThat(response.email()).isEqualTo("novo@email.com");
    }

    @Test
    @DisplayName("Deve lançar ConflictException ao tentar atualizar cliente com documento de outro cliente")
    void update_ShouldThrowConflict_WhenDocumentBelongsToAnotherClient() {
        // Arrange
        UUID id = UUID.randomUUID();
        Client client = new Client("Nome", PersonType.FISICA, "111.222.333-44", null, null, null, null, null, null, null, null, null, null);
        client.setId(id);

        ClientRequestDTO updateRequest = new ClientRequestDTO(
                "Nome",
                PersonType.FISICA,
                "999.888.777-66",
                null, null, null, null, null, null, null, null, null, null
        );

        when(clientRepository.findById(id)).thenReturn(Optional.of(client));
        when(clientRepository.existsByDocumentNumberAndIdNot("999.888.777-66", id)).thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> clientService.update(id, updateRequest))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("Já existe outro cliente cadastrado com o documento");
    }

    @Test
    @DisplayName("Deve alternar status (soft delete) do cliente com sucesso")
    void toggleStatus_ShouldInvertIsActiveStatus() {
        // Arrange
        UUID id = UUID.randomUUID();
        Client client = new Client("Cliente Teste", PersonType.FISICA, null, null, null, null, null, null, null, null, null, null, null);
        client.setId(id);
        client.setActive(true);

        when(clientRepository.findById(id)).thenReturn(Optional.of(client));
        when(clientRepository.save(any(Client.class))).thenReturn(client);

        // Act
        ClientResponseDTO response = clientService.toggleStatus(id);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.ativo()).isFalse();
        assertThat(client.isActive()).isFalse();
    }
}
