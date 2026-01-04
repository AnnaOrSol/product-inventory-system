package com.example.inventoryservice.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public class InventoryResponse {
    private final Long id;
    private final UUID installationId;
    private final Long productId;
    private final String productName;
    private final Integer quantity;
    private final String location;
    private final String notes;
    private final Instant createdAt;
    private final Instant updatedAt;
    private final LocalDate bestBefore;

    public InventoryResponse(Long id, UUID installationId, Long productId, String productName, Integer quantity, String location, String notes, Instant createdAt, Instant updatedAt, LocalDate bestBefore) {
        this.id = id;
        this.installationId = installationId;
        this.productId = productId;
        this.productName = productName;
        this.quantity = quantity;
        this.location = location;
        this.notes = notes;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.bestBefore = bestBefore;
    }

    public Long getId() {
        return id;
    }

    public String getProductName() {
        return productName;
    }

    public UUID getInstallationId() {
        return installationId;
    }

    public Long getProductId() {
        return productId;
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

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public LocalDate getBestBefore() {
        return bestBefore;
    }
}
