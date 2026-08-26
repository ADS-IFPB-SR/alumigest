package br.edu.ifpb.alumigest.catalog.domain;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

/**
 * Esquema que define quais campos e opções estarão visíveis e permitidos
 * para customização durante a elaboração de um orçamento baseado neste template.
 */
public class TemplateOptionSchema implements Serializable {

    private boolean allowSlidingMode;
    private List<SlidingMode> allowedSlidingModes = new ArrayList<>();

    private boolean allowOpeningDirection;
    private List<OpeningDirection> allowedOpeningDirections = new ArrayList<>();

    private boolean allowHandle;
    private List<HandleType> allowedHandleTypes = new ArrayList<>();
    private List<HandlePosition> allowedHandlePositions = new ArrayList<>();

    private boolean allowDrilling;
    private List<HoleDrillingMode> allowedDrillingModes = new ArrayList<>();

    private List<String> allowAluminumColors = new ArrayList<>();
    private List<String> allowGlassColors = new ArrayList<>();

    public TemplateOptionSchema() {}

    public boolean isAllowSlidingMode() {
        return allowSlidingMode;
    }

    public void setAllowSlidingMode(boolean allowSlidingMode) {
        this.allowSlidingMode = allowSlidingMode;
    }

    public List<SlidingMode> getAllowedSlidingModes() {
        return allowedSlidingModes;
    }

    public void setAllowedSlidingModes(List<SlidingMode> allowedSlidingModes) {
        this.allowedSlidingModes = allowedSlidingModes != null ? allowedSlidingModes : new ArrayList<>();
    }

    public boolean isAllowOpeningDirection() {
        return allowOpeningDirection;
    }

    public void setAllowOpeningDirection(boolean allowOpeningDirection) {
        this.allowOpeningDirection = allowOpeningDirection;
    }

    public List<OpeningDirection> getAllowedOpeningDirections() {
        return allowedOpeningDirections;
    }

    public void setAllowedOpeningDirections(List<OpeningDirection> allowedOpeningDirections) {
        this.allowedOpeningDirections = allowedOpeningDirections != null ? allowedOpeningDirections : new ArrayList<>();
    }

    public boolean isAllowHandle() {
        return allowHandle;
    }

    public void setAllowHandle(boolean allowHandle) {
        this.allowHandle = allowHandle;
    }

    public List<HandleType> getAllowedHandleTypes() {
        return allowedHandleTypes;
    }

    public void setAllowedHandleTypes(List<HandleType> allowedHandleTypes) {
        this.allowedHandleTypes = allowedHandleTypes != null ? allowedHandleTypes : new ArrayList<>();
    }

    public List<HandlePosition> getAllowedHandlePositions() {
        return allowedHandlePositions;
    }

    public void setAllowedHandlePositions(List<HandlePosition> allowedHandlePositions) {
        this.allowedHandlePositions = allowedHandlePositions != null ? allowedHandlePositions : new ArrayList<>();
    }

    public boolean isAllowDrilling() {
        return allowDrilling;
    }

    public void setAllowDrilling(boolean allowDrilling) {
        this.allowDrilling = allowDrilling;
    }

    public List<HoleDrillingMode> getAllowedDrillingModes() {
        return allowedDrillingModes;
    }

    public void setAllowedDrillingModes(List<HoleDrillingMode> allowedDrillingModes) {
        this.allowedDrillingModes = allowedDrillingModes != null ? allowedDrillingModes : new ArrayList<>();
    }

    public List<String> getAllowAluminumColors() {
        return allowAluminumColors;
    }

    public void setAllowAluminumColors(List<String> allowAluminumColors) {
        this.allowAluminumColors = allowAluminumColors != null ? allowAluminumColors : new ArrayList<>();
    }

    public List<String> getAllowGlassColors() {
        return allowGlassColors;
    }

    public void setAllowGlassColors(List<String> allowGlassColors) {
        this.allowGlassColors = allowGlassColors != null ? allowGlassColors : new ArrayList<>();
    }
}
