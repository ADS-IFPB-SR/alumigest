package br.edu.ifpb.alumigest.partsale.dto;

import java.util.Arrays;
import java.util.Objects;

/**
 * DTO que encapsula os bytes do documento PDF gerado e o nome sugerido do arquivo.
 */
public record PartSalePdfDTO(byte[] bytes, String filename) {

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    PartSalePdfDTO that = (PartSalePdfDTO) o;
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
    return "PartSalePdfDTO[filename="
        + filename
        + ", bytesLength="
        + (bytes != null ? bytes.length : 0)
        + "]";
  }
}

