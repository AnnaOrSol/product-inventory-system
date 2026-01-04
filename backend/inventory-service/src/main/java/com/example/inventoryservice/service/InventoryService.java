package com.example.inventoryservice.service;

import com.example.inventoryservice.dto.CreateInventoryItemRequest;
import com.example.inventoryservice.dto.InventoryResponse;
import com.example.inventoryservice.dto.UpdateInventoryItemRequest;
import com.example.inventoryservice.model.InventoryItem;
import com.example.inventoryservice.repository.InventoryRepository;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private static final Logger log =
            LoggerFactory.getLogger(InventoryService.class);

    public InventoryService (InventoryRepository inventoryRepository){
        this.inventoryRepository=inventoryRepository;
    }

    public InventoryResponse getInventoryItemById(Long id){
        InventoryItem inventoryItem = inventoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException());

        return new InventoryResponse(
                inventoryItem.getId(),
                inventoryItem.getInstallationId(),
                inventoryItem.getProductId(),
                inventoryItem.getProductName(),
                inventoryItem.getQuantity(),
                inventoryItem.getLocation(),
                inventoryItem.getNotes(),
                inventoryItem.getCreatedAt(),
                inventoryItem.getUpdatedAt(),
                inventoryItem.getBestBefore()
        );
    }

    public List<InventoryResponse> getItemsForInstallation (UUID installationId){
        List<InventoryItem> inventoryItemList = inventoryRepository.findAllByInstallationId(installationId);
        return inventoryItemList.stream()
                .map(inventoryItem -> new InventoryResponse(inventoryItem.getId(),
                        inventoryItem.getInstallationId(),
                        inventoryItem.getProductId(),
                        inventoryItem.getProductName(),
                        inventoryItem.getQuantity(),
                        inventoryItem.getLocation(),
                        inventoryItem.getNotes(),
                        inventoryItem.getCreatedAt(),
                        inventoryItem.getUpdatedAt(),
                        inventoryItem.getBestBefore()))
                .toList();
    }


    public InventoryResponse addNewInventoryItem(@Valid CreateInventoryItemRequest request) {
        InventoryItem inventoryItem = new InventoryItem();
        inventoryItem.setInstallationId(request.getInstallationId());
        inventoryItem.setProductId(request.getProductId());
        inventoryItem.setProductName(request.getProductName());
        inventoryItem.setQuantity(request.getQuantity());
        if (request.getLocation() != null && !request.getLocation().isEmpty())
            inventoryItem.setLocation(request.getLocation());
        if(request.getNotes() != null && !request.getNotes().isEmpty())
            inventoryItem.setNotes(request.getNotes());
        if(null != request.getBestBefore())
            inventoryItem.setBestBefore(request.getBestBefore());

        InventoryItem saved = inventoryRepository.save(inventoryItem);
        log.info("Item {} added successfully", saved.getId());
        return new InventoryResponse(
                saved.getId(),
                saved.getInstallationId(),
                saved.getProductId(),
                saved.getProductName(),
                saved.getQuantity(),
                saved.getLocation(),
                saved.getNotes(),
                saved.getCreatedAt(),
                saved.getUpdatedAt(),
                saved.getBestBefore()
        );
    }


    public InventoryResponse updateItem(UUID installationId, Long productId, UpdateInventoryItemRequest request) {
        InventoryItem inventoryItem = inventoryRepository.findByInstallationIdAndProductId(installationId,productId)
                .orElseThrow(() -> new RuntimeException());
        if (request.getQuantity() != null )
        inventoryItem.setQuantity(request.getQuantity());
        if (request.getLocation() != null )
            inventoryItem.setLocation(request.getLocation());
        if(request.getNotes() != null )
            inventoryItem.setNotes(request.getNotes());
        InventoryItem saved = inventoryRepository.save(inventoryItem);
        return new InventoryResponse(
                saved.getId(),
                saved.getInstallationId(),
                saved.getProductId(),
                saved.getProductName(),
                saved.getQuantity(),
                saved.getLocation(),
                saved.getNotes(),
                saved.getCreatedAt(),
                saved.getUpdatedAt(),
                saved.getBestBefore()
        );
    }

    public void deleteItem(UUID installationId, Long productId) {
        InventoryItem inventoryItem = inventoryRepository.findByInstallationIdAndProductId(installationId,productId)
                .orElseThrow(() -> new RuntimeException());
        inventoryRepository.delete(inventoryItem);
    }
}
