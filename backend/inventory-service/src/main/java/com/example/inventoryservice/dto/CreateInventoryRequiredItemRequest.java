package com.example.inventoryservice.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateInventoryRequiredItemRequest {

    @NotNull
    private Long genericProductId;

    @NotBlank
    private String genericProductName;

    @NotNull
    @Min(1)
    private Integer minimumQuantity;

    public Long getGenericProductId() {
        return genericProductId;
    }

    public String getGenericProductName() {
        return genericProductName;
    }

    public Integer getMinimumQuantity() {
        return minimumQuantity;
    }
}