package br.edu.ifpb.alumigest.catalog.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Table(name = "tb_materials")
public class Material {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private MaterialGroup materialGroup;

    @Column(name = "commercial_reference")
    private String commercialReference;

    @Column(name = "ncm_code")
    private String ncmCode;

    private String name;

    @Column(name = "cost_price", precision = 10, scale = 2)
    private BigDecimal costPrice;

    @Column(name = "sale_price", precision = 10, scale = 2)
    private BigDecimal salePrice;

    @Column(name = "unit_measure")
    private String unitMeasure;

    @Column(name = "thickness_mm", precision = 5, scale = 2)
    private BigDecimal thicknessMm;

    @Column(name = "color_finish")
    private String colorFinish;

    @Column(name = "standard_length_m", precision = 5, scale = 2)
    private BigDecimal standardLengthM;

    @Column(name = "attributes_json", columnDefinition = "jsonb")
    private String attributesJson;

    @Column(name = "is_active")
    private Boolean isActive;

}