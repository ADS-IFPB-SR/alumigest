package br.edu.ifpb.alumigest.partsale.service;

import br.edu.ifpb.alumigest.partsale.repository.PartSaleRepository;
import java.time.Year;
import java.time.ZoneOffset;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Gerador de código sequencial thread-safe para Venda de Partes no padrão VP-YYYY-NNNN.
 */
@Component
public class PartSaleCodeGenerator {

  private static final Logger log = LoggerFactory.getLogger(PartSaleCodeGenerator.class);
  private static final String PREFIX = "VP-";

  private final PartSaleRepository partSaleRepository;
  private int cachedYear = -1;
  private int lastAllocatedNumber = 0;

  public PartSaleCodeGenerator(PartSaleRepository partSaleRepository) {
    this.partSaleRepository = partSaleRepository;
  }

  /**
   * Gera o próximo código de venda avulsa de partes no formato VP-YYYY-NNNN.
   */
  public synchronized String generateNextCode() {
    int currentYear = Year.now(ZoneOffset.UTC).getValue();
    String yearPrefix = String.format("%s%d-", PREFIX, currentYear);

    if (currentYear != cachedYear) {
      cachedYear = currentYear;
      int maxDbNumber = fetchMaxNumberFromDb(yearPrefix);
      lastAllocatedNumber = maxDbNumber;
      log.info("Inicializando sequenciador VP para o ano {}: max DB={}, lastAllocated={}",
          currentYear, maxDbNumber, lastAllocatedNumber);
    }

    lastAllocatedNumber++;
    return String.format("%s%04d", yearPrefix, lastAllocatedNumber);
  }

  private int fetchMaxNumberFromDb(String prefix) {
    return partSaleRepository.findLatestCodeForPrefix(prefix)
        .map(code -> {
          try {
            String seqPart = code.substring(code.lastIndexOf('-') + 1);
            return Integer.parseInt(seqPart);
          } catch (Exception ex) {
            log.warn("Falha ao extrair sequência do código VP '{}': {}", code, ex.getMessage());
            return 0;
          }
        })
        .orElse(0);
  }
}

