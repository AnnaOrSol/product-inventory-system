package com.example.inventoryservice.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public class CreateInventoryRequiredItemRequest {

    @NotNull
    private Long productId;
    @NotNull
    private String productName;
    @NotNull
    @Min(1)
    private Integer minimumQuantity;


    public Long getProductId() {
        return productId;
    }

    public String getProductName() {
        return productName;
    }

    public Integer getMinimumQuantity() {
        return minimumQuantity;
    }
}
