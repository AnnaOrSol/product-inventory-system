package com.example.inventoryservice.dto;

public record DefaultRequirementItemDto(
        Long genericProductId,
        String genericProductName,
        Integer defaultMinimumQuantity
) {
}