package com.example.inventoryservice.dto;

public class UpdateInventoryItemRequest {

    private Integer quantity;
    private String location;
    private String notes;

    public Integer getQuantity() {
        return quantity;
    }

    public String getLocation() {
        return location;
    }

    public String getNotes() {
        return notes;
    }
}
