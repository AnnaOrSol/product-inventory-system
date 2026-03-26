package com.example.inventoryeventsservice.repository;

import com.example.inventoryeventsservice.entity.InventoryEventEntity;
import com.example.inventoryeventsservice.enums.InventoryEventType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface InventoryEventRepository extends JpaRepository<InventoryEventEntity, Long> {

    boolean existsByEventId(UUID eventId);

    List<InventoryEventEntity> findAllByInstallationIdOrderByOccurredAtDesc(UUID installationId);

    long countByInstallationIdAndEventType(UUID installationId, InventoryEventType eventType);
}