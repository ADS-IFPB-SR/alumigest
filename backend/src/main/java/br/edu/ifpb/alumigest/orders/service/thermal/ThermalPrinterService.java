package br.edu.ifpb.alumigest.orders.service.thermal;

import br.edu.ifpb.alumigest.common.exception.BusinessException;
import br.edu.ifpb.alumigest.orders.domain.Order;
import br.edu.ifpb.alumigest.orders.dto.PrintThermalResultDTO;
import br.edu.ifpb.alumigest.orders.dto.PrinterInfoDTO;
import br.edu.ifpb.alumigest.orders.service.pdf.ThermalLabelData;
import br.edu.ifpb.alumigest.orders.service.pdf.ThermalLabelDataResolver;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.print.Doc;
import javax.print.DocFlavor;
import javax.print.DocPrintJob;
import javax.print.PrintException;
import javax.print.PrintService;
import javax.print.PrintServiceLookup;
import javax.print.SimpleDoc;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

/**
 * Serviço responsável pela comunicação direta com impressoras térmicas físicas ou emuladas
 * no sistema operacional, utilizando envio direto de comandos nativos BPLB (Elgin L42) via Spooler.
 *
 * Elimina completamente a abertura de janelas ou caixas de diálogo no navegador web,
 * operando de forma 100% silenciosa e instantânea no chão de fábrica.
 *
 * US-17 / Correções #492 e #493.
 */
@Service
public class ThermalPrinterService {

    private static final Logger log = LoggerFactory.getLogger(ThermalPrinterService.class);

    private static final List<String> THERMAL_KEYWORDS = List.of(
            "l42", "elgin", "thermal", "termica", "zebra", "argox", "etiqueta", "label", "pos"
    );

    private final ThermalLabelDataResolver dataResolver;
    private final ThermalLabelBplbRenderer bplbRenderer;

    @Autowired
    public ThermalPrinterService(ThermalLabelDataResolver dataResolver, ThermalLabelBplbRenderer bplbRenderer) {
        this.dataResolver = dataResolver;
        this.bplbRenderer = bplbRenderer;
    }

    /**
     * Lista todas as impressoras disponíveis no sistema operacional local.
     *
     * @return lista de DTOs com o nome, se é padrão e se é categorizada como térmica
     */
    public List<PrinterInfoDTO> listAvailablePrinters() {
        List<PrinterInfoDTO> result = new ArrayList<>();

        try {
            PrintService defaultService = PrintServiceLookup.lookupDefaultPrintService();
            String defaultName = defaultService != null ? defaultService.getName() : null;

            PrintService[] services = PrintServiceLookup.lookupPrintServices(null, null);

            for (PrintService service : services) {
                String name = service.getName();
                boolean isDefault = name.equalsIgnoreCase(defaultName);
                boolean isThermal = isThermalPrinterName(name);
                result.add(new PrinterInfoDTO(name, isDefault, isThermal));
            }
        } catch (Exception e) {
            log.warn("Não foi possível enumerar as impressoras do sistema operacional: {}", e.getMessage());
        }

        return result;
    }

    /**
     * Envia as etiquetas térmicas da ordem de serviço diretamente para a impressora térmica física.
     *
     * @param order        ordem de serviço
     * @param itemId       identificador opcional de item para filtro
     * @param targetPrinter nome da impressora desejada (opcional, se nulo auto-detecta)
     * @return DTO com o resultado da impressão direta
     */
    public PrintThermalResultDTO printLabelsDirectly(Order order, UUID itemId, String targetPrinter) {
        if (order == null) {
            throw new IllegalArgumentException("Ordem de serviço não pode ser nula");
        }

        List<ThermalLabelData> etiquetas = dataResolver.resolveLabels(order, itemId);
        if (etiquetas.isEmpty()) {
            throw new BusinessException("A ordem de serviço não possui etiquetas válidas para impressão");
        }

        String bplbScript = bplbRenderer.renderBplb(etiquetas);
        byte[] bplbBytes = bplbRenderer.renderBplbBytes(etiquetas);

        PrintService printService = resolvePrintService(targetPrinter);

        if (printService == null) {
            log.warn("Nenhuma impressora física/spooler disponível no SO. Retornando payload BPLB para inspeção/simulação.");
            return new PrintThermalResultDTO(
                    true,
                    String.format(Locale.ROOT, "%d etiquetas geradas em BPLB (nenhuma impressora física conectada)", etiquetas.size()),
                    "Simulador / Nenhum Spooler",
                    etiquetas.size(),
                    bplbScript
            );
        }

        try {
            DocPrintJob job = printService.createPrintJob();
            DocFlavor flavor = DocFlavor.BYTE_ARRAY.AUTOSENSE;
            Doc doc = new SimpleDoc(bplbBytes, flavor, null);

            job.print(doc, null);

            log.info("Sucesso no envio de {} etiquetas BPLB para a impressora '{}' da O.S. {}",
                    etiquetas.size(), printService.getName(), order.getCodigo());

            return new PrintThermalResultDTO(
                    true,
                    String.format(Locale.ROOT, "%d etiquetas enviadas com sucesso para a impressora '%s'", etiquetas.size(), printService.getName()),
                    printService.getName(),
                    etiquetas.size(),
                    bplbScript
            );
        } catch (PrintException e) {
            log.error("Falha ao imprimir na impressora '{}': {}", printService.getName(), e.getMessage(), e);
            throw new BusinessException(String.format("Erro ao enviar etiquetas para a impressora '%s': %s",
                    printService.getName(), e.getMessage()));
        }
    }

    /**
     * Resolve qual PrintService deve ser utilizado com base nas regras:
     * 1. Nome explicitamente solicitado pelo usuário;
     * 2. Primeira impressora que contenha termos de impressora térmica;
     * 3. Impressora padrão do sistema operacional;
     * 4. Primeira impressora disponível na lista.
     */
    private PrintService resolvePrintService(String targetPrinterName) {
        PrintService[] services = PrintServiceLookup.lookupPrintServices(null, null);
        if (services == null || services.length == 0) {
            return null;
        }

        // 1. Nome explícito
        if (targetPrinterName != null && !targetPrinterName.isBlank()) {
            String targetNormalized = targetPrinterName.trim().toLowerCase(Locale.ROOT);
            for (PrintService service : services) {
                if (service.getName().toLowerCase(Locale.ROOT).contains(targetNormalized)) {
                    return service;
                }
            }
        }

        // 2. Impressora térmica detectada pelo nome
        Optional<PrintService> thermalService = Arrays.stream(services)
                .filter(s -> isThermalPrinterName(s.getName()))
                .findFirst();

        if (thermalService.isPresent()) {
            return thermalService.get();
        }

        // 3. Impressora padrão do SO
        PrintService defaultService = PrintServiceLookup.lookupDefaultPrintService();
        if (defaultService != null) {
            return defaultService;
        }

        // 4. Primeira disponível
        return services[0];
    }

    private boolean isThermalPrinterName(String printerName) {
        if (printerName == null) {
            return false;
        }
        String lower = printerName.toLowerCase(Locale.ROOT);
        return THERMAL_KEYWORDS.stream().anyMatch(lower::contains);
    }
}
