package com.example.inventoryeventsservice.dto;

public record TopWastedProductResponse(
        String productName,
        long count
) {}