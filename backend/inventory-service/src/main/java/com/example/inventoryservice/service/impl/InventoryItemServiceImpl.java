package com.example.inventoryservice.service.impl;

import com.example.inventoryservice.dto.CreateInventoryItemRequest;
import com.example.inventoryservice.dto.InventoryItemResponse;
import com.example.inventoryservice.dto.UpdateInventoryItemRequest;
import com.example.inventoryservice.model.InventoryItem;
import com.example.inventoryservice.repository.InventoryRepository;
import com.example.inventoryservice.service.InventoryItemService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryItemServiceImpl implements InventoryItemService {

    private final InventoryRepository inventoryRepository;

    @Override
    @Transactional(readOnly = true)
    public InventoryItemResponse getInventoryItemById(Long id) {
        return inventoryRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Item not found with id: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryItemResponse> getItemsForInstallation(UUID installationId) {
        return inventoryRepository.findAllByInstallationId(installationId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional
    public InventoryItemResponse addNewInventoryItem(CreateInventoryItemRequest request) {
        InventoryItem item = new InventoryItem();

        item.setInstallationId(request.getInstallationId());
        item.setGenericProductId(request.getGenericProductId());
        item.setGenericProductName(request.getGenericProductName());
        item.setQuantity(request.getQuantity());
        item.setLocation(request.getLocation());
        item.setNotes(request.getNotes());
        item.setBestBefore(request.getBestBefore());

        InventoryItem saved = inventoryRepository.save(item);
        log.info("New item added to inventory: id={}, genericProduct={}", saved.getId(), saved.getGenericProductName());
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public InventoryItemResponse updateItem(UUID installationId, Long id, UpdateInventoryItemRequest request) {
        InventoryItem item = inventoryRepository.findByInstallationIdAndId(installationId, id)
                .orElseThrow(() -> new RuntimeException("Item not found for installation and product"));

        if (request.getQuantity() != null) item.setQuantity(request.getQuantity());
        if (request.getLocation() != null) item.setLocation(request.getLocation());
        if (request.getNotes() != null) item.setNotes(request.getNotes());

        InventoryItem saved = inventoryRepository.save(item);
        log.info("Item updated: installation={}, product={}", installationId, id);

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public void deleteItem(UUID installationId, Long id) {
        InventoryItem item = inventoryRepository.findByInstallationIdAndId(installationId, id)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        inventoryRepository.delete(item);
        log.info("Item deleted: installation={}, product={}", installationId, id);
    }


    private InventoryItemResponse mapToResponse(InventoryItem item) {
        return new InventoryItemResponse(
                item.getId(),
                item.getInstallationId(),
                item.getGenericProductId(),
                item.getGenericProductName(),
                item.getQuantity(),
                item.getLocation(),
                item.getNotes(),
                item.getCreatedAt(),
                item.getUpdatedAt(),
                item.getBestBefore()
        );
    }
}