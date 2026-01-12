package com.example.productservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;

public class CreateNewProductRequest {
    @NotNull
    private String name;
    @NotNull
    private String barcode;
    @NotNull
    private String brand;
    @NotNull
    private String category;
    private String imageUrl;
    @JsonProperty("isOfficial")
    private boolean isOfficial;


    public CreateNewProductRequest() {}

    public void setName(String name) { this.name = name; }
    public void setBarcode(String barcode) { this.barcode = barcode; }
    public void setBrand(String brand) { this.brand = brand; }
    public void setCategory(String category) { this.category = category; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public void setOfficial(boolean official) { isOfficial = official; }

    public String getName() {
        return name;
    }

    public String getBarcode() {
        return barcode;
    }

    public String getBrand() {
        return brand;
    }

    public String getCategory() {
        return category;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public boolean isOfficial() {
        return isOfficial;
    }
}
