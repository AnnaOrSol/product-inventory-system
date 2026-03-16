package com.example.inventoryservice.dto;

import java.time.Instant;
import java.util.UUID;

public class InventoryRequirementsResponse {
    private Long id;
    private UUID installationId;
    private Long genericProductId;
    private String genericProductName;
    private Integer minimumQuantity;
    private Instant createdAt;
    private Instant updatedAt;

    public InventoryRequirementsResponse(
            Long id,
            UUID installationId,
            Long genericProductId,
            String genericProductName,
            Integer minimumQuantity,
            Instant createdAt,
            Instant updatedAt
    ) {
        this.id = id;
        this.installationId = installationId;
        this.genericProductId = genericProductId;
        this.genericProductName = genericProductName;
        this.minimumQuantity = minimumQuantity;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public UUID getInstallationId() {
        return installationId;
    }

    public Long getGenericProductId() {
        return genericProductId;
    }

    public String getGenericProductName() {
        return genericProductName;
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