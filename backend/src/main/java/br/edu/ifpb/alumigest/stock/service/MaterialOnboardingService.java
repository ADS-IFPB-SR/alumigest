package br.edu.ifpb.alumigest.stock.service;

import br.edu.ifpb.alumigest.catalog.dto.AluminumProfileRequestDTO;
import br.edu.ifpb.alumigest.catalog.dto.HardwareRequestDTO;
import br.edu.ifpb.alumigest.catalog.service.AluminumProfileService;
import br.edu.ifpb.alumigest.catalog.service.FilmService;
import br.edu.ifpb.alumigest.catalog.service.HardwareService;
import br.edu.ifpb.alumigest.catalog.service.IGlassService;
import br.edu.ifpb.alumigest.common.exception.BusinessException;
import br.edu.ifpb.alumigest.stock.domain.StockMovementType;
import br.edu.ifpb.alumigest.stock.dto.InitialStockEntryDTO;
import br.edu.ifpb.alumigest.stock.dto.MaterialWithStockCreateRequestDTO;
import br.edu.ifpb.alumigest.stock.dto.MaterialWithStockResponseDTO;
import br.edu.ifpb.alumigest.stock.dto.StockItemResponseDTO;
import br.edu.ifpb.alumigest.stock.dto.StockMovementRequestDTO;
import br.edu.ifpb.alumigest.stock.dto.StockMovementResponseDTO;
import java.math.BigDecimal;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Orquestrador transacional do fluxo "2 em 1":
 * cadastra o material via service especialista, provisiona tb_stock_items
 * e registra a movimentação PURCHASE_ENTRY inicial quando solicitada.
 */
@Service
public class MaterialOnboardingService {

    private final AluminumProfileService aluminumProfileService;
    private final IGlassService glassService;
    private final HardwareService hardwareService;
    private final FilmService filmService;
    private final StockService stockService;

    public MaterialOnboardingService(
            AluminumProfileService aluminumProfileService,
            IGlassService glassService,
            HardwareService hardwareService,
            FilmService filmService,
            StockService stockService) {
        this.aluminumProfileService = aluminumProfileService;
        this.glassService = glassService;
        this.hardwareService = hardwareService;
        this.filmService = filmService;
        this.stockService = stockService;
    }

    @Transactional
    public MaterialWithStockResponseDTO createMaterialWithStock(
            MaterialWithStockCreateRequestDTO request) {
        validatePayloadConsistency(request);

        CreatedMaterial created = createMaterialByCategory(request);

        BigDecimal minStock = request.initialStock() != null
            && request.initialStock().minimumStock() != null
                ? request.initialStock().minimumStock()
                : BigDecimal.ZERO;

        StockItemResponseDTO stockItem = stockService.provisionStockItem(created.id(), minStock);

        StockMovementResponseDTO initialMovement = null;
        if (request.initialStock() != null) {
            initialMovement = registerInitialPurchaseEntry(created.id(), request.initialStock());
            stockItem = stockService.getStockBalance(created.id());
        }

        return new MaterialWithStockResponseDTO(
            created.id(),
            request.categoryType(),
            created.payload(),
            stockItem,
            initialMovement
        );
    }

    private void validatePayloadConsistency(MaterialWithStockCreateRequestDTO request) {
        int filledCount = countNonNull(
            request.aluminumProfile(),
            request.glass(),
            request.hardware(),
            request.film()
        );
        if (filledCount != 1) {
            throw new BusinessException(
                "Informe exatamente um bloco de dados técnicos correspondente à categoria selecionada."
            );
        }

        boolean matches = switch (request.categoryType()) {
            case PROFILE -> request.aluminumProfile() != null;
            case GLASS -> request.glass() != null;
            case HARDWARE -> request.hardware() != null;
            case FILM -> request.film() != null;
            default -> false;
        };

        if (!matches) {
            throw new BusinessException(
                "Os dados técnicos enviados não correspondem à categoria '" + request.categoryType() + "'."
            );
        }
    }

    private CreatedMaterial createMaterialByCategory(MaterialWithStockCreateRequestDTO request) {
        return switch (request.categoryType()) {
            case PROFILE -> {
                AluminumProfileRequestDTO normalized = normalizeProfileHandle(request.aluminumProfile());
                var response = aluminumProfileService.create(normalized);
                yield new CreatedMaterial(response.id(), response);
            }
            case GLASS -> {
                var response = glassService.create(request.glass());
                yield new CreatedMaterial(response.id(), response);
            }
            case HARDWARE -> {
                HardwareRequestDTO normalized = normalizeHardwareHandle(request.hardware());
                var response = hardwareService.create(normalized);
                yield new CreatedMaterial(response.id(), response);
            }
            case FILM -> {
                var response = filmService.createFilm(request.film());
                yield new CreatedMaterial(response.id(), response);
            }
            default -> throw new BusinessException(
                "Categoria de material não suportada para cadastro: " + request.categoryType()
            );
        };
    }

    private AluminumProfileRequestDTO normalizeProfileHandle(AluminumProfileRequestDTO dto) {
        if (dto.isHandle() != null) {
            return dto;
        }
        return new AluminumProfileRequestDTO(
            dto.name(),
            dto.commercialReference(),
            dto.commercialLine(),
            dto.ncmCode(),
            dto.colorFinish(),
            dto.standardLengthM(),
            dto.costPrice(),
            dto.salePrice(),
            dto.weight(),
            dto.familyCode(),
            Boolean.FALSE
        );
    }

    private HardwareRequestDTO normalizeHardwareHandle(HardwareRequestDTO dto) {
        if (dto.isHandle() != null) {
            return dto;
        }
        return new HardwareRequestDTO(
            dto.skuCode(),
            dto.name(),
            dto.unitMeasure(),
            dto.calculationType(),
            dto.costPrice(),
            dto.salePrice(),
            dto.ncmCode(),
            dto.familyCode(),
            Boolean.FALSE
        );
    }

    private StockMovementResponseDTO registerInitialPurchaseEntry(
            UUID materialId, InitialStockEntryDTO entry) {
        String reason = entry.reason() != null && !entry.reason().isBlank()
            ? entry.reason().trim()
            : "Entrada inicial no cadastro do material";

        StockMovementRequestDTO movementRequest = new StockMovementRequestDTO(
            materialId,
            StockMovementType.PURCHASE_ENTRY,
            entry.quantity(),
            entry.unitCost(),
            reason,
            entry.referenceDocument(),
            entry.registeredBy(),
            entry.supplier()
        );
        return stockService.registerMovement(movementRequest);
    }

    private int countNonNull(Object... values) {
        int count = 0;
        for (Object value : values) {
            if (value != null) {
                count++;
            }
        }
        return count;
    }

    private record CreatedMaterial(UUID id, Object payload) {}
}