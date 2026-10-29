package br.edu.ifpb.alumigest.partsale.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

import br.edu.ifpb.alumigest.partsale.repository.PartSaleRepository;
import java.time.Year;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("PartSaleCodeGenerator [US-46.1] - Sequential Code Format")
class PartSaleCodeGeneratorTest {

  @Mock
  private PartSaleRepository partSaleRepository;

  @Test
  @DisplayName("Deve gerar primeiro código VP do ano quando banco estiver vazio")
  void shouldGenerateFirstCodeOfYearWhenDbEmpty() {
    when(partSaleRepository.findLatestCodeForPrefix(anyString())).thenReturn(Optional.empty());

    PartSaleCodeGenerator generator = new PartSaleCodeGenerator(partSaleRepository);
    String code = generator.generateNextCode();

    int year = Year.now().getValue();
    assertThat(code).isEqualTo(String.format("VP-%d-0001", year));
  }

  @Test
  @DisplayName("Deve incrementar sequencialmente no mesmo ano sem consultar banco novamente")
  void shouldIncrementSequentiallyInSameYear() {
    int year = Year.now().getValue();
    when(partSaleRepository.findLatestCodeForPrefix(anyString()))
        .thenReturn(Optional.of(String.format("VP-%d-0010", year)));

    PartSaleCodeGenerator generator = new PartSaleCodeGenerator(partSaleRepository);
    String code1 = generator.generateNextCode();
    String code2 = generator.generateNextCode();
    String code3 = generator.generateNextCode();

    assertThat(code1).isEqualTo(String.format("VP-%d-0011", year));
    assertThat(code2).isEqualTo(String.format("VP-%d-0012", year));
    assertThat(code3).isEqualTo(String.format("VP-%d-0013", year));
  }

  @Test
  @DisplayName("Deve retornar fallback 0 e gerar 0001 quando código no banco for malformado")
  void shouldFallbackToZeroWhenLatestCodeInDbIsMalformed() {
    int year = Year.now().getValue();
    when(partSaleRepository.findLatestCodeForPrefix(anyString()))
        .thenReturn(Optional.of("VP-2026-MALFORMED"));

    PartSaleCodeGenerator generator = new PartSaleCodeGenerator(partSaleRepository);
    String code = generator.generateNextCode();

    assertThat(code).isEqualTo(String.format("VP-%d-0001", year));
  }
}

