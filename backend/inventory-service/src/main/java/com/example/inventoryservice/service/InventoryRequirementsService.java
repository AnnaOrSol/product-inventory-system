package com.example.inventoryservice.service;

import com.example.inventoryservice.dto.CreateInventoryRequiredItemRequest;
import com.example.inventoryservice.dto.InventoryRequirementsResponse;
import com.example.inventoryservice.dto.UpdateMandatoryInventoryItemRequest;
import com.example.inventoryservice.model.InventoryRequirements;
import com.example.inventoryservice.repository.InventoryRequirementsRepository;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class InventoryRequirementsService {

    private final InventoryRequirementsRepository inventoryRequirementsRepository;
    private static final Logger log = LoggerFactory.getLogger(InventoryRequirementsService.class);

    public InventoryRequirementsService(InventoryRequirementsRepository inventoryRequirementsRepository) {
        this.inventoryRequirementsRepository = inventoryRequirementsRepository;
    }

    @Transactional(readOnly = true)
    public List<InventoryRequirementsResponse> getItemsForInstallation(UUID installationId) {
        log.info("Fetching inventory requirements for installationId: {}", installationId);
        List<InventoryRequirements> inventoryRequirementsList = inventoryRequirementsRepository.findAllByInstallationId(installationId);
        log.debug("Found {} requirements for installationId: {}", inventoryRequirementsList.size(), installationId);
        return inventoryRequirementsList.stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public InventoryRequirementsResponse addInventoryRequiredItem(UUID installationId, CreateInventoryRequiredItemRequest request) {
        log.info("Adding inventory requirement for installationId: {}, productId: {}", installationId, request.getProductId());
        InventoryRequirements inventoryRequirementsItem = mapToEntity(installationId, request);

        InventoryRequirements saved = inventoryRequirementsRepository.save(inventoryRequirementsItem);
        log.info("Item {} added successfully to inventory_requirements", saved.getId());
        return mapToResponse(saved);
    }

    @Transactional
    public List<InventoryRequirementsResponse> addInventoryRequiredItems(UUID installationId, @Valid List<CreateInventoryRequiredItemRequest> request) {
        log.info("Adding {} inventory requirements", request.size());
        List<InventoryRequirements> inventoryReqList = request.stream()
                .map(req -> mapToEntity(installationId, req))
                .collect(Collectors.toList());

        List<InventoryRequirements> savedList = inventoryRequirementsRepository.saveAll(inventoryReqList);
        log.info("{} items added successfully to inventory_requirements", savedList.size());

        return savedList.stream()
                .map(this::mapToResponse)
                .toList();
    }

    private InventoryRequirements mapToEntity(UUID installationId, CreateInventoryRequiredItemRequest request) {
        InventoryRequirements item = new InventoryRequirements();
        item.setInstallationId(installationId);
        item.setProductId(request.getProductId());
        item.setProductName(request.getProductName());
        item.setMinimumQuantity(request.getMinimumQuantity());
        return item;
    }

    private InventoryRequirementsResponse mapToResponse(InventoryRequirements saved) {
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

    @Transactional
    public InventoryRequirementsResponse updateItem(UUID installationId, Long productId, UpdateMandatoryInventoryItemRequest request) {
        log.info("Updating item for installationId: {}, productId: {}", installationId, productId);
        InventoryRequirements item = inventoryRequirementsRepository.findByInstallationIdAndProductId(installationId, productId)
                .orElseThrow(() -> {
                    log.error("Item not found for update. installationId: {}, productId: {}", installationId, productId);
                    return new RuntimeException("Inventory requirement not found for installationId: " + installationId + " and productId: " + productId);
                });
        
        if (request.getMinimumQuantity() != null) {
            item.setMinimumQuantity(request.getMinimumQuantity());
        }
        
        InventoryRequirements saved = inventoryRequirementsRepository.save(item);
        log.info("Item updated successfully. ID: {}", saved.getId());
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteItem(UUID installationId, Long productId) {
        log.info("Deleting item for installationId: {}, productId: {}", installationId, productId);
        inventoryRequirementsRepository.deleteByInstallationIdAndProductId(installationId, productId);
        log.info("Item deleted successfully");
    }
}
