package com.example.productservice.dto;

import jakarta.persistence.Column;

import java.time.Instant;

public class ProductResponse {
    private Long id;
    private String name;
    private String brand;

    private String barcode;
    private String category;
    private Instant createdAt;
    private String imageUrl;

    public ProductResponse(Long id, String name, String brand, String barcode, String category, Instant createdAt, String imageUrl){
        this.id= id;
        this.name=name;
        this.brand=brand;
        this.barcode = barcode;
        this.category=category;
        this.createdAt=createdAt;
        this.imageUrl = imageUrl;
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

    public String getBarcode() {
        return barcode;
    }

    public String getImageUrl() {
        return imageUrl;
    }

}
