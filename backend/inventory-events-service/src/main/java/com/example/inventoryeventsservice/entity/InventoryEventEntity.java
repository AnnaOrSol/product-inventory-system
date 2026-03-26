package com.example.inventoryeventsservice.entity;

import com.example.inventoryeventsservice.enums.InventoryEventReason;
import com.example.inventoryeventsservice.enums.InventoryEventType;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
        name = "inventory_event",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_inventory_event_event_id", columnNames = "event_id")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryEventEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_id", nullable = false, updatable = false)
    private UUID eventId;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false)
    private InventoryEventType eventType;

    @Enumerated(EnumType.STRING)
    @Column(name = "reason")
    private InventoryEventReason reason;

    @Column(name = "installation_id", nullable = false)
    private UUID installationId;

    @Column(name = "product_id")
    private Long productId;

    @Column(name = "product_name")
    private String productName;

    @Column(name = "quantity")
    private Integer quantity;

    @Column(name = "occurred_at", nullable = false)
    private Instant occurredAt;

    @Column(name = "source_service", nullable = false)
    private String sourceService;

    @Column(name = "details")
    private String details;
}