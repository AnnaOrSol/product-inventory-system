package com.example.productservice.dto;

import jakarta.persistence.Column;

import java.time.Instant;

public class ProductResponse {
    private Long id;
    private String name;
    private String brand;
    private String barcode;
    private Instant createdAt;
    private String imageUrl;
    private Long genericProductId;
    private String genericProductName;

    public ProductResponse(Long id, String name, String brand, String barcode, Instant createdAt, String imageUrl,
                           Long genericProductId, String genericProductName){
        this.id= id;
        this.name=name;
        this.brand=brand;
        this.barcode = barcode;
        this.createdAt=createdAt;
        this.imageUrl = imageUrl;
        this.genericProductId = genericProductId;
        this.genericProductName = genericProductName;
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


    public Instant getCreatedAt() {
        return createdAt;
    }

    public String getBarcode() {
        return barcode;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public Long getGenericProductId() {
        return genericProductId;
    }

    public String getGenericProductName() {
        return genericProductName;
    }

}
