package com.example.inventoryeventsservice.listener;

import com.example.inventoryeventsservice.dto.InventoryEventMessage;
import com.example.inventoryeventsservice.service.InventoryEventService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.DltHandler;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class InventoryEventKafkaListener {

    private final InventoryEventService inventoryEventService;

    @KafkaListener(topics = "${app.kafka.topic.inventory-events}", groupId = "${spring.kafka.consumer.group-id}")
    public void consume(InventoryEventMessage message) {
        log.info("Received inventory event: {}", message);
        inventoryEventService.saveEvent(message);
    }


    @DltHandler
    public void handleDlt(InventoryEventMessage message, @Header(KafkaHeaders.RECEIVED_TOPIC) String topic) {
        log.error("Event sent to DLT! Topic: {}, EventId: {}. Need manual intervention!",
                topic, message.getEventId());
    }
}