package com.example.inventoryservice.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

public class CreateInventoryItemRequest {
    @NotNull
    private UUID installationId;
    @NotNull
    private Long productId;
    @NotNull
    private String productName;
    @NotNull
    @Min(1)
    private Integer quantity;
    private String location;
    private String notes;
    private LocalDate bestBefore;

    public UUID getInstallationId() {
        return installationId;
    }

    public Long getProductId() {
        return productId;
    }

    public String getProductName() {
        return productName;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public String getLocation() {
        return location;
    }

    public String getNotes() {
        return notes;
    }

    public LocalDate getBestBefore() {
        return bestBefore;
    }
}
