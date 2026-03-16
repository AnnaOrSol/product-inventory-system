package com.example.inventoryservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateInstallationRequest(

        @NotBlank(message = "Installation name is required")
        @Size(max = 100, message = "Installation name must be at most 100 characters")
        String name

) {}