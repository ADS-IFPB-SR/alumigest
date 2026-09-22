package br.edu.ifpb.alumigest.budgets.dto;

/**
 * DTO que encapsula os bytes do documento PDF comercial e o nome do arquivo gerado.
 */
public record BudgetPdfDTO(byte[] bytes, String filename) {
}
