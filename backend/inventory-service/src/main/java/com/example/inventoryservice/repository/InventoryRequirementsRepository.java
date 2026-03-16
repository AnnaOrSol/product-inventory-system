package com.example.inventoryservice.repository;

import com.example.inventoryservice.model.InventoryRequirements;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InventoryRequirementsRepository extends JpaRepository<InventoryRequirements, Long> {
    List<InventoryRequirements> findAllByInstallationId(UUID installationId);

    Optional<InventoryRequirements> findByInstallationIdAndGenericProductId(
            UUID installationId,
            Long genericProductId
    );

    List<InventoryRequirements> findByInstallationIdAndGenericProductIdIn(
            UUID installationId,
            List<Long> genericProductIds
    );

    void deleteByInstallationIdAndGenericProductId(UUID installationId, Long genericProductId);

    void deleteAllByInstallationIdAndGenericProductIdIn(UUID installationId, List<Long> genericProductIds);
}