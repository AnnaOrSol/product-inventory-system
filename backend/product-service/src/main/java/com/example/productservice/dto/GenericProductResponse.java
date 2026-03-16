package com.example.productservice.dto;

public record GenericProductResponse(
        Long id,
        String name,
        String categoryCode,
        String categoryDisplayName,
        String imageUrl
) {
}