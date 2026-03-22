package com.example.productservice.model;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "generic_product")
public class GenericProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private ProductCategory category;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "is_default_requirement", nullable = false)
    private boolean defaultRequirement = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public GenericProduct() {
        this.createdAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public ProductCategory getCategory() {
        return category;
    }

    public void setCategory(ProductCategory category) {
        this.category = category;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public boolean isDefaultRequirement() {
        return defaultRequirement;
    }

    public void setDefaultRequirement(boolean defaultRequirement) {
        this.defaultRequirement = defaultRequirement;
    }
}