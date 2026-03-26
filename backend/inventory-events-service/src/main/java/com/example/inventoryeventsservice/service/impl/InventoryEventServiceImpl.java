package com.example.inventoryeventsservice.service.impl;

import com.example.inventoryeventsservice.dto.InventoryEventMessage;
import com.example.inventoryeventsservice.entity.InventoryEventEntity;
import com.example.inventoryeventsservice.repository.InventoryEventRepository;
import com.example.inventoryeventsservice.service.InventoryEventService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryEventServiceImpl implements InventoryEventService {

    private final InventoryEventRepository repository;

    @Override
    @Transactional
    public void saveEvent(InventoryEventMessage message) {
        if (repository.existsByEventId(message.getEventId())) {
            log.info("Skipping duplicate event with eventId={}", message.getEventId());
            return;
        }

        InventoryEventEntity entity = InventoryEventEntity.builder()
                .eventId(message.getEventId())
                .eventType(message.getEventType())
                .reason(message.getReason())
                .installationId(message.getInstallationId())
                .productId(message.getProductId())
                .productName(message.getProductName())
                .quantity(message.getQuantity())
                .occurredAt(message.getOccurredAt())
                .sourceService(message.getSourceService())
                .details(message.getDetails())
                .build();

        try {
            repository.save(entity);
            log.info("Saved inventory event eventId={} type={}", message.getEventId(), message.getEventType());
        } catch (DataIntegrityViolationException e) {
            log.warn("Duplicate event detected by DB constraint. eventId={}", message.getEventId());
        }
    }
}