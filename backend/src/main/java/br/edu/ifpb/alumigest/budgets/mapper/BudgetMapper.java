package br.edu.ifpb.alumigest.budgets.mapper;

import br.edu.ifpb.alumigest.budgets.domain.Budget;
import br.edu.ifpb.alumigest.budgets.domain.BudgetItem;
import br.edu.ifpb.alumigest.budgets.domain.BudgetItemOption;
import br.edu.ifpb.alumigest.budgets.dto.*;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, imports = {java.time.OffsetDateTime.class})
public interface BudgetMapper {

    // --- Request para Entidade ---

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "code", ignore = true)
    @Mapping(target = "subtotal", ignore = true)
    @Mapping(target = "discountValue", ignore = true)
    @Mapping(target = "total", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "client.id", source = "clientId")
    @Mapping(target = "notes", source = "notes")
    @Mapping(target = "paymentCondition", source = "paymentCondition")
    @Mapping(target = "paymentNotes", source = "commercialConditions")
    Budget toEntity(BudgetCreateRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "code", ignore = true)
    @Mapping(target = "subtotal", ignore = true)
    @Mapping(target = "discountValue", ignore = true)
    @Mapping(target = "total", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "client.id", source = "clientId")
    @Mapping(target = "paymentCondition", source = "paymentCondition")
    @Mapping(target = "paymentNotes", source = "commercialConditions")
    Budget toEntity(BudgetRequestDTO requestDTO);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "budget", ignore = true)
    @Mapping(target = "productName", ignore = true)
    @Mapping(target = "subtotal", ignore = true)
    @Mapping(target = "product.id", source = "productId")
    BudgetItem toEntity(BudgetItemRequestDTO requestDTO);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "budgetItem", ignore = true)
    @Mapping(target = "materialName", ignore = true)
    @Mapping(target = "unitMeasure", ignore = true)
    @Mapping(target = "unitPrice", ignore = true)
    @Mapping(target = "totalPrice", ignore = true)
    @Mapping(target = "material.id", source = "materialId")
    BudgetItemOption toEntity(BudgetItemOptionRequestDTO requestDTO);


    // --- Entidade para Response ---

    @Mapping(target = "clientId", source = "client.id")
    @Mapping(target = "clientName", source = "client.fullName")
    @Mapping(target = "clientPhone", source = "client.phone")
    @Mapping(target = "clientEmail", source = "client.email")
    @Mapping(target = "clientAddress", expression = "java(budget.getClient() != null ? budget.getClient().getStreet() : null)")
    // Mapeamentos explícitos para os campos comerciais na ordem atual do ResponseDTO:
    @Mapping(target = "paymentCondition", source = "paymentCondition")
    @Mapping(target = "paymentConditionLabel", expression = "java(budget.getPaymentCondition() != null ? budget.getPaymentCondition().getDescricao() : null)")
    @Mapping(target = "paymentNotes", source = "paymentNotes")
    @Mapping(target = "notes", source = "notes")
    
    @Mapping(target = "statusLabel", expression = "java(budget.getStatus() != null ? budget.getStatus().getDescricao() : null)")
    @Mapping(target = "expired", expression = "java(budget.isExpired())")
    BudgetResponseDTO toResponseDTO(Budget budget);

    @Mapping(target = "clientName", source = "client.fullName")
    @Mapping(target = "totalItems", expression = "java(budget.getItems() != null ? budget.getItems().size() : 0)")
    @Mapping(target = "expired", expression = "java(budget.isExpired())")
    BudgetSummaryResponseDTO toSummaryResponseDTO(Budget budget);

    @Mapping(target = "productId", source = "product.id")
    BudgetItemResponseDTO toResponseDTO(BudgetItem budgetItem);

    @Mapping(target = "materialId", source = "material.id")
    BudgetItemOptionResponseDTO toResponseDTO(BudgetItemOption option);
}