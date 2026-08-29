package br.edu.ifpb.alumigest.catalog.domain;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * Configuração paramétrica do puxador da esquadria.
 */
public class HandleConfig implements Serializable {

    private HandleType handleType;
    private HandlePosition position;
    private BigDecimal lengthMm;
    private BigDecimal offsetMm;

    public HandleConfig() {}

    public HandleConfig(HandleType handleType, HandlePosition position, BigDecimal lengthMm, BigDecimal offsetMm) {
        this.handleType = handleType;
        this.position = position;
        this.lengthMm = lengthMm;
        this.offsetMm = offsetMm;
    }

    public HandleType getHandleType() {
        return handleType;
    }

    public void setHandleType(HandleType handleType) {
        this.handleType = handleType;
    }

    public HandlePosition getPosition() {
        return position;
    }

    public void setPosition(HandlePosition position) {
        this.position = position;
    }

    public BigDecimal getLengthMm() {
        return lengthMm;
    }

    public void setLengthMm(BigDecimal lengthMm) {
        this.lengthMm = lengthMm;
    }

    public BigDecimal getOffsetMm() {
        return offsetMm;
    }

    public void setOffsetMm(BigDecimal offsetMm) {
        this.offsetMm = offsetMm;
    }
}
