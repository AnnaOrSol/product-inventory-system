package com.example.inventoryservice.repository;

import com.example.inventoryservice.model.InventoryItem;
import com.example.inventoryservice.model.InventoryRequirements;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface InventoryRequirementsRepository extends JpaRepository<InventoryRequirements, Long> {
    List<InventoryRequirements> findAllByInstallationId(UUID installationId);
}
