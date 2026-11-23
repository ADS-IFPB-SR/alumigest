package br.edu.ifpb.alumigest.stock.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

/**
 * Dados da Seção 2 do modal (Entrada Física de Chegada no Almoxarifado).
 */
public record InitialStockEntryDTO(
    @NotNull(message = "A quantidade recebida é obrigatória")
    @Positive(message = "A quantidade recebida deve ser maior que zero")
    BigDecimal quantity,

    @NotNull(message = "O preço de compra unitário é obrigatório (RN-06)")
    @Positive(message = "O preço de compra unitário deve ser maior que zero")
    BigDecimal unitCost,

    @DecimalMin(value = "0.0", message = "O ponto de pedido mínimo não pode ser negativo")
    BigDecimal minimumStock,

    @Size(max = 150, message = "O fornecedor deve ter no máximo 150 caracteres")
    String supplier,

    // RN-05: Documento livre (pedido, recibo ou NF sem chave SEFAZ de 44 dígitos)
    @JsonAlias("documentNumber")
    @Size(max = 100, message = "O número do documento deve ter no máximo 100 caracteres")
    String referenceDocument,

    @Size(max = 500, message = "As observações devem ter no máximo 500 caracteres")
    String reason,

    @Size(max = 150, message = "O responsável deve ter no máximo 150 caracteres")
    String registeredBy
) {}