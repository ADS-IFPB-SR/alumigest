package br.edu.ifpb.alumigest.orders.dto;

import java.util.Arrays;
import java.util.Objects;

/**
 * DTO que encapsula os bytes do comprovante PDF gerado e o nome do arquivo para download.
 * US-16.1 — Comprovante de Pedido de Venda em PDF.
 */
public record OrderPdfDTO(byte[] bytes, String filename) {

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        OrderPdfDTO that = (OrderPdfDTO) o;
        return Arrays.equals(bytes, that.bytes) && Objects.equals(filename, that.filename);
    }

    @Override
    public int hashCode() {
        int result = Objects.hashCode(filename);
        result = 31 * result + Arrays.hashCode(bytes);
        return result;
    }

    @Override
    public String toString() {
        return "OrderPdfDTO[filename=" + filename + ", bytesLength=" + (bytes != null ? bytes.length : 0) + "]";
    }
}
