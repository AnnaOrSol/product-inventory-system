package com.example.inventoryeventsservice.dto;

import com.example.inventoryeventsservice.enums.InventoryEventReason;
import com.example.inventoryeventsservice.enums.InventoryEventType;
import io.swagger.v3.oas.annotations.media.Schema;
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
@Schema(description = "Data Transfer Object for inventory event messages received from Kafka")
public class InventoryEventMessage {

    @Schema(description = "Unique identifier of the event for idempotency checks", example = "550e8400-e29b-41d4-a716-446655440000")
    private UUID eventId;

    @Schema(description = "The type of inventory action performed")
    private InventoryEventType eventType;

    @Schema(description = "The specific reason for the inventory change")
    private InventoryEventReason reason;

    @Schema(description = "Unique ID of the client installation", example = "7a1b2c3d-4e5f-6g7h-8i9j-0k1l2m3n4o5p")
    private UUID installationId;

    @Schema(description = "The internal database ID of the product", example = "101")
    private Long productId;

    @Schema(description = "The display name of the product", example = "Premium Coffee Beans")
    private String productName;

    @Schema(description = "The quantity involved in the transaction", example = "50")
    private Integer quantity;

    @Schema(description = "Timestamp when the event actually occurred in the source system")
    private Instant occurredAt;

    @Schema(description = "The name of the service that generated this event", example = "inventory-management-service")
    private String sourceService;

    @Schema(description = "Additional context or metadata about the event", example = "Restocked from supplier order #9982")
    private String details;
}