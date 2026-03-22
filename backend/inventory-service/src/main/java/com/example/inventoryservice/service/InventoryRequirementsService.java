package com.example.inventoryservice.service;

import com.example.inventoryservice.dto.*;

import java.util.List;
import java.util.UUID;

public interface InventoryRequirementsService {

    public List<ShoppngListItemResponse> getShoppingList(UUID installationId);
    public List<InventoryRequirementsResponse> getItemsForInstallation(UUID installationId);
    public InventoryRequirementsResponse addInventoryRequiredItem(UUID installationId, CreateInventoryRequiredItemRequest request);
    public List<InventoryRequirementsResponse> addInventoryRequiredItems(UUID installationId, List<CreateInventoryRequiredItemRequest> requests);
    public InventoryRequirementsResponse updateItem(UUID installationId, Long productId, UpdateInventoryRequirementsRequest request);
    public void deleteItem(UUID installationId, Long productId);
    void deleteItems(UUID installationId, List<Long> genericProductIds);
    AddDefaultRequirementsResponse addDefaultRequirements(UUID installationId);
}
