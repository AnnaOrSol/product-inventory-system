package com.example.inventoryservice.repository;

import com.example.inventoryservice.model.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InventoryRepository extends JpaRepository<InventoryItem, Long> {
    Optional<InventoryItem> findByInstallationIdAndId(
            UUID installationId,
            Long genericProductId
    );


    List<InventoryItem> findAllByInstallationId(UUID installationId);

}
