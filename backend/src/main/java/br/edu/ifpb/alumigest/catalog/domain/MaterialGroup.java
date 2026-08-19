package br.edu.ifpb.alumigest.catalog.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.OffsetDateTime;
import java.util.Objects;
import java.util.UUID;

/**
 * Entidade que categoriza famílias de materiais e define a estratégia de cálculo de consumo.
 * Utiliza o padrão Type-Object Pattern para extensibilidade setorial.
 */
@Entity
@Table(name = "tb_material_groups")
public class MaterialGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @NotBlank(message = "Código identificador do grupo é obrigatório")
    @Size(max = 50, message = "Código deve ter no máximo 50 caracteres")
    @Column(name = "code", nullable = false, unique = true, length = 50)
    private String code;

    @NotBlank(message = "Nome do grupo é obrigatório")
    @Size(max = 100, message = "Nome deve ter no máximo 100 caracteres")
    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @NotNull(message = "Tipo de cálculo é obrigatório")
    @Enumerated(EnumType.STRING)
    @Column(name = "calculation_type", nullable = false, length = 30)
    private CalculationType calculationType;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_system_default", nullable = false)
    private boolean isSystemDefault = false;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    public MaterialGroup() {
    }

    public MaterialGroup(UUID id, String code, String name, CalculationType calculationType, String description, boolean isSystemDefault, boolean isActive) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.calculationType = calculationType;
        this.description = description;
        this.isSystemDefault = isSystemDefault;
        this.isActive = isActive;
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = OffsetDateTime.now();
        }
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public CalculationType getCalculationType() {
        return calculationType;
    }

    public void setCalculationType(CalculationType calculationType) {
        this.calculationType = calculationType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isSystemDefault() {
        return isSystemDefault;
    }

    public void setSystemDefault(boolean systemDefault) {
        isSystemDefault = systemDefault;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        MaterialGroup that = (MaterialGroup) o;
        return Objects.equals(id, that.id) || (code != null && Objects.equals(code, that.code));
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, code);
    }
}
