package br.edu.ifpb.alumigest.catalog.domain;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * Objeto completo de configuração do template paramétrico, incluindo valores padrão
 * e o esquema de opções disponíveis para o orçamento.
 */
public class TemplateConfig implements Serializable {

    private BigDecimal profileMm;
    private String aluminumColor;
    private String glassColor;
    private OpeningDirection openingDirection;
    private SlidingMode slidingMode;
    private HandleConfig handleConfig;
    private DrillingConfig drillingConfig;
    private TemplateOptionSchema optionSchema;

    public TemplateConfig() {}

    public BigDecimal getProfileMm() {
        return profileMm;
    }

    public void setProfileMm(BigDecimal profileMm) {
        this.profileMm = profileMm;
    }

    public String getAluminumColor() {
        return aluminumColor;
    }

    public void setAluminumColor(String aluminumColor) {
        this.aluminumColor = aluminumColor;
    }

    public String getGlassColor() {
        return glassColor;
    }

    public void setGlassColor(String glassColor) {
        this.glassColor = glassColor;
    }

    public OpeningDirection getOpeningDirection() {
        return openingDirection;
    }

    public void setOpeningDirection(OpeningDirection openingDirection) {
        this.openingDirection = openingDirection;
    }

    public SlidingMode getSlidingMode() {
        return slidingMode;
    }

    public void setSlidingMode(SlidingMode slidingMode) {
        this.slidingMode = slidingMode;
    }

    public HandleConfig getHandleConfig() {
        return handleConfig;
    }

    public void setHandleConfig(HandleConfig handleConfig) {
        this.handleConfig = handleConfig;
    }

    public DrillingConfig getDrillingConfig() {
        return drillingConfig;
    }

    public void setDrillingConfig(DrillingConfig drillingConfig) {
        this.drillingConfig = drillingConfig;
    }

    public TemplateOptionSchema getOptionSchema() {
        return optionSchema;
    }

    public void setOptionSchema(TemplateOptionSchema optionSchema) {
        this.optionSchema = optionSchema;
    }
}
