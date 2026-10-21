package br.edu.ifpb.alumigest.orders.service;

import br.edu.ifpb.alumigest.common.dto.PageResponse;
import br.edu.ifpb.alumigest.orders.domain.ApprovalChannel;
import br.edu.ifpb.alumigest.orders.domain.OrderStatus;
import br.edu.ifpb.alumigest.orders.dto.OrderCancelRequest;
import br.edu.ifpb.alumigest.orders.dto.OrderConvertRequest;
import br.edu.ifpb.alumigest.orders.dto.OrderPdfDTO;
import br.edu.ifpb.alumigest.orders.dto.OrderResponse;
import br.edu.ifpb.alumigest.orders.dto.OrderSummaryResponse;
import br.edu.ifpb.alumigest.orders.dto.PrinterInfoDTO;
import br.edu.ifpb.alumigest.orders.dto.PrintThermalResultDTO;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

/**
 * Contrato de serviço para operações de negócio e consultas de Pedidos de Venda.
 * Define as operações sem acoplamento à implementação (DIP / OCP).
 */
public interface OrderService {

    /**
     * Converte um orçamento elegível (DRAFT, SENT ou APPROVED) em pedido de venda de forma atômica.
     * O status do orçamento é promovido para APPROVED na mesma transação.
     *
     * @param budgetId ID do orçamento a ser convertido
     * @param request  dados da aprovação (canal, previsão de entrega, observações)
     * @return DTO completo do pedido criado
     * @throws br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException se o orçamento não for encontrado
     * @throws br.edu.ifpb.alumigest.common.exception.BusinessException         se o orçamento estiver em status inelegível ou sem itens
     * @throws br.edu.ifpb.alumigest.common.exception.ConflictException         se já existir pedido para o orçamento
     */
    OrderResponse convertBudgetToOrder(UUID budgetId, OrderConvertRequest request);

    /**
     * Cancela formalmente um pedido de venda / ordem de serviço mediante justificativa obrigatória.
     * Somente permitido para pedidos nos status CREATED ou WAITING_PRODUCTION.
     *
     * @param id      identificador único (UUID) do pedido
     * @param request payload contendo justificativa de cancelamento (mínimo 10 caracteres)
     * @return DTO com dados atualizados do pedido com status CANCELLED
     * @throws br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException se o pedido não for localizado
     * @throws br.edu.ifpb.alumigest.common.exception.BusinessException         se o pedido estiver em status inelegível (ex: em produção ou concluído)
     */
    OrderResponse cancelOrder(UUID id, OrderCancelRequest request);

    /**
     * Recupera a visualização detalhada de um pedido de venda pelo seu identificador.
     *
     * @param id Identificador único (UUID) do pedido
     * @return DTO com dados detalhados do pedido e seus itens congelados
     * @throws br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException se não encontrado
     */
    OrderResponse findDetailedById(UUID id);

    /**
     * Gera o comprovante oficial de Pedido de Venda em PDF A4.
     * Utiliza os valores congelados no pedido (lock de preços).
     *
     * @param id Identificador único (UUID) do pedido
     * @return DTO com os bytes do PDF e o nome do arquivo para download
     * @throws br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException se o pedido não for encontrado
     */
    OrderPdfDTO gerarComprovanteById(UUID id);

    /**
     * Gera o documento PDF contendo etiquetas térmicas (100x60mm) para identificação
     * das peças da Ordem de Serviço / Pedido de Venda, com suporte a filtro opcional por item.
     *
     * @param id     Identificador único (UUID) do pedido
     * @param itemId Identificador opcional (UUID) de um item específico para filtragem de etiquetas
     * @return DTO contendo os bytes do PDF e o nome do arquivo para download
     * @throws br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException se o pedido ou item não for encontrado
     * @throws br.edu.ifpb.alumigest.common.exception.BusinessException         se a ordem não contiver itens válidos
     */
    OrderPdfDTO gerarEtiquetasById(UUID id, UUID itemId);

    /**
     * Gera o documento PDF contendo etiquetas térmicas (100x60mm) para todas as
     * peças da Ordem de Serviço / Pedido de Venda.
     *
     * @param id Identificador único (UUID) do pedido
     * @return DTO contendo os bytes do PDF e o nome do arquivo para download
     * @throws br.edu.ifpb.alumigest.common.exception.ResourceNotFoundException se o pedido não for encontrado
     * @throws br.edu.ifpb.alumigest.common.exception.BusinessException         se a ordem não contiver itens válidos
     */
    default OrderPdfDTO gerarEtiquetasById(UUID id) {
        return gerarEtiquetasById(id, null);
    }

    /**
     * Lista pedidos de venda de forma paginada com suporte a filtros dinâmicos.
     *
     * @param status   filtro opcional por status do pedido
     * @param channel  filtro opcional por canal de aprovação
     * @param search   termo para busca textual (código do pedido, cliente ou código do orçamento)
     * @param pageable parâmetros de paginação e ordenação
     * @return página de pedidos sumarizados
     */
    PageResponse<OrderSummaryResponse> findAll(
            OrderStatus status,
            ApprovalChannel channel,
            String search,
            Pageable pageable
    );

    OrderResponse updateStatus(UUID id, OrderStatus status);

    /**
     * Lista as impressoras instaladas no sistema operacional do servidor.
     *
     * @return lista de impressoras detectadas
     */
    List<PrinterInfoDTO> listAvailablePrinters();

    /**
     * Envia as etiquetas térmicas da ordem de serviço diretamente para a impressora física via BPLB.
     *
     * @param id            identificador da ordem de serviço
     * @param itemId        identificador opcional de item para filtro
     * @param targetPrinter nome da impressora de destino (opcional)
     * @return DTO com o resultado da impressão
     */
    PrintThermalResultDTO printThermalLabels(UUID id, UUID itemId, String targetPrinter);

    /**
     * Gera os bytes brutos do script de comandos BPLB para download ou simulação externa.
     *
     * @param id     identificador da ordem de serviço
     * @param itemId identificador opcional de item para filtro
     * @return array de bytes do script BPLB
     */
    byte[] gerarBplbEtiquetasById(UUID id, UUID itemId);

}
