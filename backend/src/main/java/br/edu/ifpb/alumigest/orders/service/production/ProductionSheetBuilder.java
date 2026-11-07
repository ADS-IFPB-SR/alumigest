package br.edu.ifpb.alumigest.orders.service.production;

import br.edu.ifpb.alumigest.orders.domain.Order;
import br.edu.ifpb.alumigest.orders.dto.production.AccessoryDto;
import br.edu.ifpb.alumigest.orders.dto.production.AluminumCutDto;
import br.edu.ifpb.alumigest.orders.dto.production.GlassCutDto;
import br.edu.ifpb.alumigest.orders.dto.production.ProductionSheetResponse;

import java.util.ArrayList;
import java.util.List;

/**
 * Padrão Builder para acumular a lista de cortes durante a execução das regras de negócio (Strategy).
 */
public class ProductionSheetBuilder {

    private final Order order;
    private final List<AluminumCutDto> aluminumCuts = new ArrayList<>();
    private final List<GlassCutDto> glassCuts = new ArrayList<>();
    private final List<AccessoryDto> accessories = new ArrayList<>();

    public ProductionSheetBuilder(Order order) {
        this.order = order;
    }

    public void addAluminumCut(String profileCode, String description, Integer lengthMm, String cutAngle, Integer quantity) {
        this.aluminumCuts.add(new AluminumCutDto(profileCode, description, lengthMm, cutAngle, quantity));
    }

    public void addGlassCut(String glassType, Integer widthMm, Integer heightMm, Integer quantity) {
        this.glassCuts.add(new GlassCutDto(glassType, widthMm, heightMm, quantity));
    }

    public void addAccessory(String code, String description, Integer quantity, String unit) {
        this.accessories.add(new AccessoryDto(code, description, quantity, unit));
    }

    public ProductionSheetResponse build() {
        return new ProductionSheetResponse(
                order.getCodigo(),
                order.getClienteNome(),
                aluminumCuts,
                glassCuts,
                accessories
        );
    }
}