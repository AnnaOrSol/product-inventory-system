package com.example.inventoryservice.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryEventMessage {
    private UUID eventId;
    private InventoryEventType eventType;
    private InventoryEventReason reason;

    private UUID installationId;
    private Long productId;
    private String productName;
    private Integer quantity;

    private Instant occurredAt;
    private String sourceService;
    private String details;
}