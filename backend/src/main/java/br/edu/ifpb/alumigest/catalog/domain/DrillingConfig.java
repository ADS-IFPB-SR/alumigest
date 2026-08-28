package br.edu.ifpb.alumigest.catalog.domain;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Configuração paramétrica de furações para dobradiças ou fixações.
 */
public class DrillingConfig implements Serializable {

    private HoleDrillingMode mode;
    private Integer holesCount;
    private List<BigDecimal> customDistancesMm = new ArrayList<>();

    public DrillingConfig() {}

    public DrillingConfig(HoleDrillingMode mode, Integer holesCount, List<BigDecimal> customDistancesMm) {
        this.mode = mode;
        this.holesCount = holesCount;
        this.customDistancesMm = customDistancesMm != null ? customDistancesMm : new ArrayList<>();
    }

    public HoleDrillingMode getMode() {
        return mode;
    }

    public void setMode(HoleDrillingMode mode) {
        this.mode = mode;
    }

    public Integer getHolesCount() {
        return holesCount;
    }

    public void setHolesCount(Integer holesCount) {
        this.holesCount = holesCount;
    }

    public List<BigDecimal> getCustomDistancesMm() {
        return customDistancesMm;
    }

    public void setCustomDistancesMm(List<BigDecimal> customDistancesMm) {
        this.customDistancesMm = customDistancesMm != null ? customDistancesMm : new ArrayList<>();
    }
}
