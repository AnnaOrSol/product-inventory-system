package com.example.inventoryservice.service;

import com.example.inventoryservice.event.InventoryEventReason;
import com.example.inventoryservice.event.InventoryEventType;

import java.util.UUID;

public interface InventoryEventPublisher {
    void publish(UUID installationId,
                 Long productId,
                 String productName,
                 Integer quantity,
                 InventoryEventType eventType,
                 InventoryEventReason reason,
                 String details);
}
