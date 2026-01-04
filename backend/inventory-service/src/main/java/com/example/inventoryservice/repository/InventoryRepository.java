package com.example.inventoryservice.repository;

import com.example.inventoryservice.model.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InventoryRepository extends JpaRepository<InventoryItem, Long> {
    Optional<InventoryItem> findByInstallationIdAndProductId(
            UUID installationId,
            Long productId
    );

    Optional<InventoryItem> findByInstallationIdAndProductIdAndBestBeforeEquals(
            UUID installationId,
            Long productId,
            LocalDate bestBefore
    );

    List<InventoryItem> findAllByInstallationId(UUID installationId);

    List<InventoryItem> findAllByInstallationIdAndBestBeforeIsNotNullOrderByBestBeforeAsc(
            UUID installationId
    );
}
