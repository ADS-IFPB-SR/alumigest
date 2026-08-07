package br.edu.ifpb.alumigest.catalog.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "tb_material_groups")
@Getter @Setter
public class MaterialGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String code;

    private String name;

    @Column(name = "calculation_type")
    private String calculationType;

    @Column(name = "is_system_default")
    private Boolean isSystemDefault;

    @Column(name = "is_active")
    private Boolean isActive;

}