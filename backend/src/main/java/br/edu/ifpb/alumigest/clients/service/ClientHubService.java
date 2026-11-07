package br.edu.ifpb.alumigest.clients.service;

import br.edu.ifpb.alumigest.budgets.domain.Budget;
import br.edu.ifpb.alumigest.budgets.repository.BudgetRepository;
import br.edu.ifpb.alumigest.clients.domain.Client;
import br.edu.ifpb.alumigest.clients.dto.ClientBudgetSummaryDto;
import br.edu.ifpb.alumigest.clients.dto.ClientDashboardDto;
import br.edu.ifpb.alumigest.clients.dto.ClientOrderItemDto;
import br.edu.ifpb.alumigest.clients.dto.ClientOrderSummaryDto;
import br.edu.ifpb.alumigest.clients.repository.ClientRepository;
import br.edu.ifpb.alumigest.common.dto.PageResponse;
import br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException;
import br.edu.ifpb.alumigest.orders.domain.Order;
import br.edu.ifpb.alumigest.orders.domain.OrderItem;
import br.edu.ifpb.alumigest.orders.repository.OrderRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class ClientHubService {

    private final ClientRepository clientRepository;
    private final OrderRepository orderRepository;
    private final BudgetRepository budgetRepository;

    public ClientHubService(
            ClientRepository clientRepository,
            OrderRepository orderRepository,
            BudgetRepository budgetRepository
    ) {
        this.clientRepository = clientRepository;
        this.orderRepository = orderRepository;
        this.budgetRepository = budgetRepository;
    }

    public ClientDashboardDto getClientDashboard(UUID clientId) {
        Client client = findClientOrThrow(clientId);

        BigDecimal totalContratado = orderRepository.sumTotalContractedByClienteId(clientId);
        long quantidadeOrdensServico = orderRepository.countByClienteIdAndAtivoTrue(clientId);
        long quantidadeOrcamentos = budgetRepository.countByClientId(clientId);

        return new ClientDashboardDto(
                client.getId(),
                client.getFullName(),
                client.getPersonType(),
                client.getDocumentNumber(),
                client.getPhone(),
                client.getEmail(),
                client.getNeighborhood(),
                client.getCity(),
                client.getState(),
                totalContratado != null ? totalContratado : BigDecimal.ZERO,
                quantidadeOrdensServico,
                quantidadeOrcamentos
        );
    }

    public PageResponse<ClientBudgetSummaryDto> getClientBudgets(UUID clientId, Pageable pageable) {
        findClientOrThrow(clientId);

        Page<Budget> budgetPage = budgetRepository.findByClientId(clientId, pageable);
        Page<ClientBudgetSummaryDto> dtoPage = budgetPage.map(this::toBudgetSummaryDto);

        return PageResponse.of(dtoPage);
    }

    public List<ClientOrderSummaryDto> getClientOrders(UUID clientId) {
        findClientOrThrow(clientId);

        List<Order> orders = orderRepository.findByClienteIdOrderByCreatedAtDesc(clientId);
        return orders.stream()
                .map(this::toOrderSummaryDto)
                .toList();
    }

    private ClientBudgetSummaryDto toBudgetSummaryDto(Budget budget) {
        return new ClientBudgetSummaryDto(
                budget.getId(),
                budget.getCode(),
                budget.getCreatedAt(),
                budget.getValidUntil(),
                budget.getTotal(),
                budget.getStatus(),
                budget.getStatus() != null ? budget.getStatus().getDescricao() : ""
        );
    }

    private ClientOrderSummaryDto toOrderSummaryDto(Order order) {
        List<ClientOrderItemDto> items = order.getItems() != null
                ? order.getItems().stream()
                        .map(this::toOrderItemDto)
                        .toList()
                : List.of();

        int totalEsquadrias = items.stream()
                .mapToInt(ClientOrderItemDto::quantidade)
                .sum();

        return new ClientOrderSummaryDto(
                order.getId(),
                order.getCodigo(),
                order.getDataAprovacao(),
                order.getStatus(),
                order.getStatus() != null ? order.getStatus().getDescription() : "",
                order.getValorLiquido(),
                totalEsquadrias,
                items
        );
    }

    private ClientOrderItemDto toOrderItemDto(OrderItem item) {
        return new ClientOrderItemDto(
                item.getId(),
                item.getDescricao(),
                item.getLarguraMm() != null ? item.getLarguraMm() : 0,
                item.getAlturaMm() != null ? item.getAlturaMm() : 0,
                item.getQuantidade() != null ? item.getQuantidade() : 1,
                item.getCorAluminio(),
                item.getTipoVidro(),
                item.getValorTotal()
        );
    }

    private Client findClientOrThrow(UUID clientId) {
        return clientRepository.findById(clientId)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado com ID: " + clientId));
    }
}
