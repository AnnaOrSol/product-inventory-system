package com.example.inventoryservice.service.impl;

import com.example.inventoryservice.client.ProductServiceClient;
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

import java.util.ArrayList;
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
    private final ProductServiceClient productServiceClient;

    @Override
    @Transactional(readOnly = true)
    public List<ShoppngListItemResponse> getShoppingList(UUID installationId) {
        log.info("Generating shopping list for installationId: {}", installationId);

        List<InventoryRequirements> requirements = inventoryRequirementsRepository.findAllByInstallationId(installationId);
        List<InventoryItem> currentInventory = inventoryRepository.findAllByInstallationId(installationId);

        Map<Long, Integer> inventoryMap = currentInventory.stream()
                .collect(Collectors.groupingBy(
                        InventoryItem::getGenericProductId,
                        Collectors.summingInt(InventoryItem::getQuantity)
                ));

        return requirements.stream()
                .flatMap(req -> {
                    int currentQty = inventoryMap.getOrDefault(req.getGenericProductId(), 0);
                    int missing = req.getMinimumQuantity() - currentQty;

                    if (missing > 0) {
                        return Stream.of(new ShoppngListItemResponse(
                                req.getGenericProductId(),
                                req.getGenericProductName(),
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
        log.info("Added requirement for generic product: {}", request.getGenericProductName());
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
    public InventoryRequirementsResponse updateItem(UUID installationId, Long genericProductId, UpdateInventoryRequirementsRequest request) {
        InventoryRequirements item = inventoryRequirementsRepository
                .findByInstallationIdAndGenericProductId(installationId, genericProductId)
                .orElseThrow(() -> new RuntimeException("Requirement not found"));

        if (request.getMinimumQuantity() != null) {
            item.setMinimumQuantity(request.getMinimumQuantity());
        }

        InventoryRequirements saved = inventoryRequirementsRepository.save(item);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public void deleteItem(UUID installationId, Long genericProductId) {
        inventoryRequirementsRepository.deleteByInstallationIdAndGenericProductId(installationId, genericProductId);
        log.info("Deleted requirement for installation: {}, genericProductId: {}", installationId, genericProductId);
    }

    @Override
    @Transactional
    public AddDefaultRequirementsResponse addDefaultRequirements(UUID installationId) {
        List<DefaultRequirementItemDto> defaultItems = productServiceClient.getDefaultRequirementItems();

        int addedCount = 0;
        int skippedCount = 0;

        List<InventoryRequirements> itemsToSave = new ArrayList<>();

        for (DefaultRequirementItemDto defaultItem : defaultItems) {
            boolean exists = inventoryRequirementsRepository.existsByInstallationIdAndGenericProductId(
                    installationId,
                    defaultItem.genericProductId()
            );

            if (exists) {
                skippedCount++;
                continue;
            }

            InventoryRequirements item = new InventoryRequirements();
            item.setInstallationId(installationId);
            item.setGenericProductId(defaultItem.genericProductId());
            item.setGenericProductName(defaultItem.genericProductName());
            item.setMinimumQuantity(
                    defaultItem.defaultMinimumQuantity() != null ? defaultItem.defaultMinimumQuantity() : 1
            );

            itemsToSave.add(item);
            addedCount++;
        }

        if (!itemsToSave.isEmpty()) {
            inventoryRequirementsRepository.saveAll(itemsToSave);
        }

        log.info("Added {} default requirements and skipped {} existing ones for installation {}",
                addedCount, skippedCount, installationId);

        return new AddDefaultRequirementsResponse(addedCount, skippedCount);
    }

    @Transactional
    public void deleteItems(UUID installationId, List<Long> genericProductIds) {
        inventoryRequirementsRepository.deleteAllByInstallationIdAndGenericProductIdIn(installationId, genericProductIds);
        log.info("Deleted {} requirement items for installation: {}", genericProductIds.size(), installationId);
    }

    private InventoryRequirements mapToEntity(UUID installationId, CreateInventoryRequiredItemRequest request) {
        InventoryRequirements item = new InventoryRequirements();
        item.setInstallationId(installationId);
        item.setGenericProductId(request.getGenericProductId());
        item.setGenericProductName(request.getGenericProductName());
        item.setMinimumQuantity(request.getMinimumQuantity());
        return item;
    }

    private InventoryRequirementsResponse mapToResponse(InventoryRequirements entity) {
        return new InventoryRequirementsResponse(
                entity.getId(),
                entity.getInstallationId(),
                entity.getGenericProductId(),
                entity.getGenericProductName(),
                entity.getMinimumQuantity(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}