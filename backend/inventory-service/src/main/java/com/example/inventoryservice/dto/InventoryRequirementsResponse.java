package com.example.inventoryservice.dto;

import java.time.Instant;
import java.util.UUID;

public class InventoryRequirementsResponse {
    private Long id;
    private UUID installationId;
    private Long productId;
    private String productName;
    private Integer minimumQuantity;
    private Instant createdAt;
    private Instant updatedAt;

    public InventoryRequirementsResponse(Long id, UUID installationId, Long productId, String productName, Integer minimumQuantity, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.installationId = installationId;
        this.productId = productId;
        this.productName = productName;
        this.minimumQuantity = minimumQuantity;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
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

    public Integer getMinimumQuantity() {
        return minimumQuantity;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
