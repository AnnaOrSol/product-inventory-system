package com.example.productservice.dto;

public record DefaultRequirementItemResponse(
        Long genericProductId,
        String genericProductName,
        Integer defaultMinimumQuantity
) {
}