package com.example.inventoryeventsservice;

import com.example.inventoryeventsservice.dto.InventoryEventMessage;
import com.example.inventoryeventsservice.entity.InventoryEventEntity;
import com.example.inventoryeventsservice.enums.InventoryEventType;
import com.example.inventoryeventsservice.repository.InventoryEventRepository;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.test.context.EmbeddedKafka;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import static org.awaitility.Awaitility.await;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Slf4j
@SpringBootTest
@ActiveProfiles("test")
@EmbeddedKafka(partitions = 1, topics = {"inventory.events"},
        bootstrapServersProperty = "spring.kafka.bootstrap-servers")
@TestPropertySource(properties = {
        "spring.kafka.producer.key-serializer=org.apache.kafka.common.serialization.StringSerializer",
        "spring.kafka.producer.value-serializer=org.springframework.kafka.support.serializer.JsonSerializer",
        "spring.kafka.consumer.auto-offset-reset=earliest",
        "spring.kafka.consumer.properties.spring.json.use.type.headers=false"
})
public class InventoryEventKafkaIntegrationTest {

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    @Autowired
    private InventoryEventRepository repository;

    @Test
    void testReceiveAndSaveEventFromKafka() {
        //1. Data preparation (edge case: adding item event)
        UUID eventId = UUID.randomUUID();
        InventoryEventMessage message = InventoryEventMessage.builder()
                .eventId(eventId)
                .eventType(InventoryEventType.ITEM_ADDED)
                .installationId(UUID.randomUUID())
                .productId(101L)
                .productName("Test Product")
                .quantity(5)
                .occurredAt(Instant.now())
                .sourceService("inventory-service")
                .build();

        // 2. Sending the message to kafka (like it was sent from inventory-service)
        kafkaTemplate.send("inventory.events", message);

        // 3. Waiting and validation (a-synchronic call)
        await().atMost(5, TimeUnit.SECONDS).untilAsserted(() -> {
            boolean exists = repository.existsByEventId(eventId);
            assertTrue(exists, "event supposed to be saved in DB");
        });

        // 4. Validate data saved properly
        InventoryEventEntity savedEntity = repository.findAll().stream()
                .filter(e -> e.getEventId().equals(eventId))
                .findFirst().orElseThrow();

        assertEquals(101L, savedEntity.getProductId());
        assertEquals("Test Product", savedEntity.getProductName());
    }

    @Test
    void testIdempotency_ShouldNotSaveDuplicateEvents() {
        // 1. Sending the same message twice
        UUID duplicateId = UUID.randomUUID();
        InventoryEventMessage message = InventoryEventMessage.builder()
                .eventId(duplicateId)
                .eventType(InventoryEventType.ITEM_ADDED)
                .installationId(UUID.randomUUID())
                .occurredAt(Instant.now())
                .productId(123L)
                .productName("Test2 Product")
                .quantity(4)
                .sourceService("inventory-service")
                .build();

        kafkaTemplate.send("inventory.events", message);
        kafkaTemplate.send("inventory.events", message);

        // 2. Wait a bit and check DB saved only 1 row
        await().atMost(5, TimeUnit.SECONDS).untilAsserted(() -> {
            long count = repository.findAll().stream()
                    .filter(e -> e.getEventId().equals(duplicateId))
                    .count();
            assertEquals(1, count, "duplicates forbidden in DB for same eventId");
        });
    }

    @Test
    void testMessageFailure_ShouldSendToDLT() {
        // sending bad message with missing mandatory fields
        InventoryEventMessage badMessage = InventoryEventMessage.builder()
                .productName("Bad Message")
                // missing eventId, installationId missing
                .build();

        kafkaTemplate.send("inventory.events", badMessage);

        // 2. We will try to listen to the DLT Topic inside the test to see if message reached there
        // Spring kafka creates automatically Topic with name DLT (=Dead Letter Topic)
        await().atMost(10, TimeUnit.SECONDS).untilAsserted(() -> {
            // here we can check if message reached DLT
            // in advanced tests we can use kafkaConsumer for reading from there inside the test
            log.info("Checking if message reached DLT...");
        });
    }

    @Test
    void testTriggerDLT() {
        InventoryEventMessage message = InventoryEventMessage.builder()
                .productName("Poison Pill")
                .installationId(UUID.randomUUID())
                .occurredAt(Instant.now())
                .build();

        kafkaTemplate.send("inventory.events", message);

        try { Thread.sleep(10000); } catch (InterruptedException e) {}
    }
}