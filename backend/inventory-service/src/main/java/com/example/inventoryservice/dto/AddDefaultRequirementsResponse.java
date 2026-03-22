package com.example.inventoryservice.dto;

public record AddDefaultRequirementsResponse(
        int addedCount,
        int skippedCount
) {
}