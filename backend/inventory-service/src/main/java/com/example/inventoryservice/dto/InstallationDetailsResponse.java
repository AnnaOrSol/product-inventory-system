package com.example.inventoryservice.dto;

import java.util.UUID;

public record InstallationDetailsResponse(
        UUID id,
        String name
) {}