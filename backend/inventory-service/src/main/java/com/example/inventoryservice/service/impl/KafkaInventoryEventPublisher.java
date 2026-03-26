package com.example.inventoryservice.service.impl;

import com.example.inventoryservice.event.InventoryEventMessage;
import com.example.inventoryservice.event.InventoryEventReason;
import com.example.inventoryservice.event.InventoryEventType;
import com.example.inventoryservice.service.InventoryEventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@EnableKafka
public class KafkaInventoryEventPublisher implements InventoryEventPublisher {

    private final KafkaTemplate<String, InventoryEventMessage> kafkaTemplate;

    @Value("${app.kafka.topic.inventory-events}")
    private String inventoryEventsTopic;

    public void publish(
            UUID installationId,
            Long productId,
            String productName,
            Integer quantity,
            InventoryEventType eventType,
            InventoryEventReason reason,
            String details
    ) {
        InventoryEventMessage event = InventoryEventMessage.builder()
                .eventId(UUID.randomUUID())
                .eventType(eventType)
                .reason(reason)
                .installationId(installationId)
                .productId(productId)
                .productName(productName)
                .quantity(quantity)
                .occurredAt(Instant.now())
                .sourceService("inventory-service")
                .details(details)
                .build();

        kafkaTemplate.send(inventoryEventsTopic, installationId.toString(), event)
                .whenComplete((result, ex) -> {
                    if (ex != null) {
                        log.error("Failed to publish inventory event {}", event, ex);
                    } else {
                        log.info("Published inventory event type={} productId={}", eventType, productId);
                    }
                });
    }
}