package com.example.productservice.dto;

import jakarta.persistence.Column;

import java.time.Instant;

public class ProductResponse {
    private Long id;
    private String name;
    private String brand;
    private String category;
    private Instant createdAt;

    public ProductResponse(Long id, String name, String brand, String category, Instant createdAt){
        this.id= id;
        this.name=name;
        this.brand=brand;
        this.category=category;
        this.createdAt=createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getBrand() {
        return brand;
    }

    public String getCategory() {
        return category;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
