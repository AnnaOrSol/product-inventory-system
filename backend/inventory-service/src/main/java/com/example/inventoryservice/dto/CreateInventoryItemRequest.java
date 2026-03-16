package com.example.inventoryservice.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

public class CreateInventoryItemRequest {

    @NotNull
    private UUID installationId;

    @NotNull
    private Long genericProductId;

    @NotBlank
    private String genericProductName;

    @NotNull
    @Min(1)
    private Integer quantity;

    private String location;
    private String notes;
    private LocalDate bestBefore;

    public UUID getInstallationId() {
        return installationId;
    }

    public Long getGenericProductId() {
        return genericProductId;
    }

    public String getGenericProductName() {
        return genericProductName;
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