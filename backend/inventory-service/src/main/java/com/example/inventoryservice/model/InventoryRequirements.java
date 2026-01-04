package com.example.inventoryservice.model;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "inventory_requirements", uniqueConstraints = {
@UniqueConstraint(columnNames = {"installation_id", "product_id"})
    })
public class InventoryRequirements {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "installation_id", nullable = false)
    private UUID installationId;
    @Column(name = "product_id", nullable = false)
    private Long productId;
    @Column(name = "product_name", nullable = false)
    private String productName;
    @Column(name = "minimum_quantity", nullable = false)
    private int minimumQuantity;
    @Column(nullable = false, name = "created_at", updatable = false)
    private Instant createdAt;
    @Column(name = "updated_at")
    private Instant updatedAt;
    @PrePersist
    public void onCreate() {
        this.createdAt = Instant.now();
    }
    @PreUpdate
    public void onUpdate() {
        this.updatedAt = Instant.now();
    }
    public Long getId() { return id; }

    public int getMinimumQuantity() {
        return minimumQuantity;
    }
    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public UUID getInstallationId() {
        return installationId;
    }

    public void setInstallationId(UUID installationId) {
        this.installationId = installationId;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }


    public void setMinimumQuantity(int minimumQuantity) {
        this.minimumQuantity = minimumQuantity;
    }
}
