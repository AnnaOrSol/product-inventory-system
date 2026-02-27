package com.example.inventoryservice.service;

import com.example.inventoryservice.dto.CreateInventoryRequiredItemRequest;
import com.example.inventoryservice.dto.InventoryRequirementsResponse;
import com.example.inventoryservice.dto.ShoppngListItemResponse;
import com.example.inventoryservice.dto.UpdateInventoryRequirementsRequest;

import java.util.List;
import java.util.UUID;

public interface InventoryRequirementsService {

    public List<ShoppngListItemResponse> getShoppingList(UUID installationId);
    public List<InventoryRequirementsResponse> getItemsForInstallation(UUID installationId);
    public InventoryRequirementsResponse addInventoryRequiredItem(UUID installationId, CreateInventoryRequiredItemRequest request);
    public List<InventoryRequirementsResponse> addInventoryRequiredItems(UUID installationId, List<CreateInventoryRequiredItemRequest> requests);
    public InventoryRequirementsResponse updateItem(UUID installationId, Long productId, UpdateInventoryRequirementsRequest request);
    public void deleteItem(UUID installationId, Long productId);
}
