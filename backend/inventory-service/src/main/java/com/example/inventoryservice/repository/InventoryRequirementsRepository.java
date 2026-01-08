package com.example.inventoryservice.repository;

import com.example.inventoryservice.model.InventoryRequirements;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InventoryRequirementsRepository extends JpaRepository<InventoryRequirements, Long> {
    List<InventoryRequirements> findAllByInstallationId(UUID installationId);
    
    Optional<InventoryRequirements> findByInstallationIdAndProductId(
            UUID installationId,
            Long productId
    );
    
    List<InventoryRequirements> findByInstallationIdAndProductIdIn(
            UUID installationId,
            List<Long> productIds
    );

    void deleteByInstallationIdAndProductId(UUID installationId, Long productId);
}
