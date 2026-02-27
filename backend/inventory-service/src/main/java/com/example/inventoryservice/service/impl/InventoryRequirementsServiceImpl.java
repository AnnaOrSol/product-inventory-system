package com.example.inventoryservice.service.impl;

import com.example.inventoryservice.dto.*;
import com.example.inventoryservice.model.InventoryItem;
import com.example.inventoryservice.model.InventoryRequirements;
import com.example.inventoryservice.repository.InventoryRepository;
import com.example.inventoryservice.repository.InventoryRequirementsRepository;
import com.example.inventoryservice.service.InventoryRequirementsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryRequirementsServiceImpl implements InventoryRequirementsService {

    private final InventoryRequirementsRepository inventoryRequirementsRepository;
    private final InventoryRepository inventoryRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ShoppngListItemResponse> getShoppingList(UUID installationId) {
        log.info("Generating shopping list for installationId: {}", installationId);

        List<InventoryRequirements> requirements = inventoryRequirementsRepository.findAllByInstallationId(installationId);
        List<InventoryItem> currentInventory = inventoryRepository.findAllByInstallationId(installationId);

        Map<Long, Integer> inventoryMap = currentInventory.stream()
                .collect(Collectors.groupingBy(
                        InventoryItem::getProductId,
                        Collectors.summingInt(InventoryItem::getQuantity)
                ));

        return requirements.stream()
                .flatMap(req -> {
                    int currentQty = inventoryMap.getOrDefault(req.getProductId(), 0);
                    int missing = req.getMinimumQuantity() - currentQty;

                    if (missing > 0) {
                        return Stream.of(new ShoppngListItemResponse(
                                req.getProductId(),
                                req.getProductName(),
                                currentQty,
                                req.getMinimumQuantity(),
                                missing
                        ));
                    }
                    return Stream.empty();
                })
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryRequirementsResponse> getItemsForInstallation(UUID installationId) {
        return inventoryRequirementsRepository.findAllByInstallationId(installationId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional
    public InventoryRequirementsResponse addInventoryRequiredItem(UUID installationId, CreateInventoryRequiredItemRequest request) {
        InventoryRequirements entity = mapToEntity(installationId, request);
        InventoryRequirements saved = inventoryRequirementsRepository.save(entity);
        log.info("Added requirement for product: {}", request.getProductName());
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public List<InventoryRequirementsResponse> addInventoryRequiredItems(UUID installationId, List<CreateInventoryRequiredItemRequest> requests) {
        List<InventoryRequirements> entities = requests.stream()
                .map(req -> mapToEntity(installationId, req))
                .toList();

        return inventoryRequirementsRepository.saveAll(entities).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional
    public InventoryRequirementsResponse updateItem(UUID installationId, Long productId, UpdateInventoryRequirementsRequest request) {
        InventoryRequirements item = inventoryRequirementsRepository.findByInstallationIdAndProductId(installationId, productId)
                .orElseThrow(() -> new RuntimeException("Requirement not found"));

        if (request.getMinimumQuantity() != null) {
            item.setMinimumQuantity(request.getMinimumQuantity());
        }

        return mapToResponse(item);
    }

    @Override
    @Transactional
    public void deleteItem(UUID installationId, Long productId) {
        inventoryRequirementsRepository.deleteByInstallationIdAndProductId(installationId, productId);
        log.info("Deleted requirement for installation: {}, product: {}", installationId, productId);
    }

    // --- Mappers ---

    private InventoryRequirements mapToEntity(UUID installationId, CreateInventoryRequiredItemRequest request) {
        InventoryRequirements item = new InventoryRequirements();
        item.setInstallationId(installationId);
        item.setProductId(request.getProductId());
        item.setProductName(request.getProductName());
        item.setMinimumQuantity(request.getMinimumQuantity());
        return item;
    }

    private InventoryRequirementsResponse mapToResponse(InventoryRequirements entity) {
        return new InventoryRequirementsResponse(
                entity.getId(),
                entity.getInstallationId(),
                entity.getProductId(),
                entity.getProductName(),
                entity.getMinimumQuantity(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}