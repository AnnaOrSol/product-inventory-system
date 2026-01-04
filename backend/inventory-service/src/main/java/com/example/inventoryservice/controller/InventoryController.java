package com.example.inventoryservice.controller;

import com.example.inventoryservice.dto.CreateInventoryItemRequest;
import com.example.inventoryservice.dto.InventoryResponse;
import com.example.inventoryservice.dto.UpdateInventoryItemRequest;
import com.example.inventoryservice.service.InventoryService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/inventory")
public class InventoryController {
    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService){
        this.inventoryService = inventoryService;
    }

    @GetMapping("/{id}")
    public InventoryResponse getInventoryItemById(@PathVariable Long id) {
        return inventoryService.getInventoryItemById(id);
    }

    @GetMapping("/items")
    public List<InventoryResponse> getItems (@RequestHeader("X-Installation-Id") UUID installationId){
        return inventoryService.getItemsForInstallation(installationId);
    }

    @PostMapping
    public InventoryResponse addItem (@Valid @RequestBody CreateInventoryItemRequest request){
        return inventoryService.addNewInventoryItem(request);
    }

    @PutMapping("/{productId}")
    public InventoryResponse update(
            @RequestHeader("X-Installation-Id") UUID installationId,
            @PathVariable Long productId,
            @RequestBody UpdateInventoryItemRequest request
    ) {
        return inventoryService.updateItem(installationId, productId, request);
    }

    @DeleteMapping("/{productId}")
    public void delete(
            @RequestHeader("X-Installation-Id") UUID installationId,
            @PathVariable Long productId
    ) {
        inventoryService.deleteItem(installationId, productId);
    }
}
