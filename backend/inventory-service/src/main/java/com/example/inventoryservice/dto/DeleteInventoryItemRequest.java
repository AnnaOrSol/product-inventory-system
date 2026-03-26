package com.example.inventoryservice.dto;

import com.example.inventoryservice.event.InventoryEventReason;
import jakarta.validation.constraints.NotNull;

public record DeleteInventoryItemRequest(
        @NotNull InventoryEventReason reason,
        String details
) {}