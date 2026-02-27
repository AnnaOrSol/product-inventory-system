package com.example.inventoryservice.service;

import com.example.inventoryservice.dto.CreateInventoryItemRequest;
import com.example.inventoryservice.dto.InventoryItemResponse;
import com.example.inventoryservice.dto.UpdateInventoryItemRequest;

import java.util.List;
import java.util.UUID;

public interface InventoryItemService {

    public InventoryItemResponse getInventoryItemById(Long id);
    public List<InventoryItemResponse> getItemsForInstallation (UUID installationId);
    public InventoryItemResponse addNewInventoryItem(CreateInventoryItemRequest request);
    public InventoryItemResponse updateItem(UUID installationId, Long productId, UpdateInventoryItemRequest request);
    public void deleteItem(UUID installationId, Long productId);
}
