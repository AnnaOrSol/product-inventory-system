package com.example.inventoryservice.service;

import com.example.inventoryservice.dto.CreateInventoryRequiredItemRequest;
import com.example.inventoryservice.dto.InventoryRequirementsResponse;
import com.example.inventoryservice.model.InventoryRequirements;
import com.example.inventoryservice.repository.InventoryRequirementsRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class InventoryRequirementsService {

    private final InventoryRequirementsRepository inventoryRequirementsRepository;
    private static final Logger log =
            LoggerFactory.getLogger(InventoryRequirementsService.class);

    public InventoryRequirementsService( InventoryRequirementsRepository inventoryRequirementsRepository){
        this.inventoryRequirementsRepository = inventoryRequirementsRepository;
    }

    public List<InventoryRequirementsResponse> getItemsForInstallation(UUID installationId) {
        List<InventoryRequirements> inventoryRequirementsList = inventoryRequirementsRepository.findAllByInstallationId(installationId);
        return inventoryRequirementsList.stream()
                .map(inventoryItem -> new InventoryRequirementsResponse(inventoryItem.getId(),
                        inventoryItem.getInstallationId(),
                        inventoryItem.getProductId(),
                        inventoryItem.getProductName(),
                        inventoryItem.getMinimumQuantity(),
                        inventoryItem.getCreatedAt(),
                        inventoryItem.getUpdatedAt()))
                .toList();
    }

    public InventoryRequirementsResponse addInventoryRequiredItem(CreateInventoryRequiredItemRequest request){
        InventoryRequirements inventoryRequirementsItem = new InventoryRequirements();
        inventoryRequirementsItem.setInstallationId(request.getInstallationId());
        inventoryRequirementsItem.setProductId(request.getProductId());
        inventoryRequirementsItem.setProductName(request.getProductName());
        inventoryRequirementsItem.setMinimumQuantity(request.getMinimumQuantity());

        InventoryRequirements saved = inventoryRequirementsRepository.save(inventoryRequirementsItem);
            log.info("Item {} added successfully ti inventory_requirements", saved.getId());
            return new InventoryRequirementsResponse(
                    saved.getId(),
                    saved.getInstallationId(),
                    saved.getProductId(),
                    saved.getProductName(),
                    saved.getMinimumQuantity(),
                    saved.getCreatedAt(),
                    saved.getUpdatedAt()
            );
    }
}
