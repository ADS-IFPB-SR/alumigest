package br.edu.ifpb.alumigest.orders.service.pdf;

import java.time.LocalDate;
import java.util.Locale;

/**
 * Snapshot imutável contendo os dados técnicos e comerciais consolidados para
 * a impressão de uma etiqueta adesiva térmica individual (100mm x 60mm).
 * US-17.1 — Modelagem orientada a domínio e separação de dados da renderização (#448).
 * Correção #492 / #493 — Suporte à identificação fracionada por folha e esquadria.
 *
 * @param companyName           Razão social da empresa emissora
 * @param customerName          Nome do cliente titular da ordem de serviço
 * @param orderCode             Código identificador da ordem de serviço (ex: OS-2026-0002)
 * @param itemIndex             Número sequencial do item na ordem (1-based)
 * @param pieceNumber           Número sequencial global da peça na ordem (1-based)
 * @param totalPieces           Quantidade total de peças físicas na ordem de serviço
 * @param description           Descrição técnica da esquadria
 * @param lineOrGroup           Linha de alumínio ou grupo funcional da esquadria
 * @param widthMm               Largura nominal em milímetros
 * @param heightMm              Altura nominal em milímetros
 * @param aluminumColor         Acabamento e cor do perfil de alumínio
 * @param glassType             Especificação técnica do vidro
 * @param environmentOrLocation Local de instalação, ambiente ou observações da entrega
 * @param itemCode              Código identificador do produto ou do item
 * @param issueDate             Data de emissão ou aprovação da ordem de serviço
 * @param labelBadge            Texto formatado do badge de rastreabilidade física
 */
public record ThermalLabelData(
        String companyName,
        String customerName,
        String orderCode,
        int itemIndex,
        int pieceNumber,
        int totalPieces,
        String description,
        String lineOrGroup,
        int widthMm,
        int heightMm,
        String aluminumColor,
        String glassType,
        String environmentOrLocation,
        String itemCode,
        LocalDate issueDate,
        String labelBadge
) {
    public ThermalLabelData(
            String companyName,
            String customerName,
            String orderCode,
            int itemIndex,
            int pieceNumber,
            int totalPieces,
            String description,
            String lineOrGroup,
            int widthMm,
            int heightMm,
            String aluminumColor,
            String glassType,
            String environmentOrLocation,
            String itemCode,
            LocalDate issueDate
    ) {
        this(companyName, customerName, orderCode, itemIndex, pieceNumber, totalPieces,
                description, lineOrGroup, widthMm, heightMm, aluminumColor, glassType,
                environmentOrLocation, itemCode, issueDate,
                String.format(Locale.ROOT, "Item %02d | Peça %02d/%02d", itemIndex, pieceNumber, totalPieces));
    }
}
