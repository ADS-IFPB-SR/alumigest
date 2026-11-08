package br.edu.ifpb.alumigest.partsale.service;

import br.edu.ifpb.alumigest.common.dto.PageResponse;
import br.edu.ifpb.alumigest.partsale.domain.PartSaleStatus;
import br.edu.ifpb.alumigest.partsale.dto.CalculatePartItemRequest;
import br.edu.ifpb.alumigest.partsale.dto.CalculatePartItemResponse;
import br.edu.ifpb.alumigest.partsale.dto.CreatePartSaleRequest;
import br.edu.ifpb.alumigest.partsale.dto.PartSaleResponse;
import java.util.UUID;
import org.springframework.data.domain.Pageable;

/**
 * Contrato de serviço para a gestão de Venda de Partes (US-46 / US-46.1).
 */
public interface PartSaleService {

  /**
   * Realiza o pré-cálculo de preço e dimensões de um item de forma reativa sem persistir.
   */
  CalculatePartItemResponse calculateItem(CalculatePartItemRequest request);

  /**
   * Persiste uma nova proposta ou venda de partes com os itens informados.
   */
  PartSaleResponse create(CreatePartSaleRequest request);

  /**
   * Localiza uma venda de partes por ID com todos os seus itens calculados.
   */
  PartSaleResponse findById(UUID id);

  /**
   * Lista vendas e propostas de partes de forma paginada com suporte a filtros dinâmicos.
   */
  PageResponse<PartSaleResponse> findAll(String search, PartSaleStatus status, Pageable pageable);

  /**
   * Atualiza o status da venda de partes conforme a máquina de estados.
   */
  PartSaleResponse updateStatus(UUID id, PartSaleStatus newStatus);
}
