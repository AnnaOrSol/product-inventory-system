package com.example.productservice.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateNewProductRequest {

    @NotBlank(message = "Product name is required")
    private String name;

    private String barcode;

    private String brand;

    private String imageUrl;

    private Long genericProductId;

    public CreateNewProductRequest() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getBarcode() {
        return barcode;
    }

    public void setBarcode(String barcode) {
        this.barcode = barcode;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Long getGenericProductId() {
        return genericProductId;
    }

    public void setGenericProductId(Long genericProductId) {
        this.genericProductId = genericProductId;
    }
}