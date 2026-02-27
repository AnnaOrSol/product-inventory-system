package com.example.inventoryservice.controller;

import com.example.inventoryservice.dto.CreateInventoryItemRequest;
import com.example.inventoryservice.dto.InventoryItemResponse;
import com.example.inventoryservice.dto.UpdateInventoryItemRequest;
import com.example.inventoryservice.service.InventoryItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/inventory")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryItemService inventoryItemService;

    @GetMapping("/{id}")
    public ResponseEntity<InventoryItemResponse> getInventoryItemById(@PathVariable Long id) {
        log.info("Fetching item with id: {}", id);
        InventoryItemResponse response = inventoryItemService.getInventoryItemById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/items")
    public ResponseEntity<List<InventoryItemResponse>> getItems(@RequestHeader("X-Installation-Id") UUID installationId) {
        log.info("Fetching all items for installation: {}", installationId);
        List<InventoryItemResponse> response = inventoryItemService.getItemsForInstallation(installationId);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<InventoryItemResponse> addItem(@Valid @RequestBody CreateInventoryItemRequest request) {
        log.info("Adding new inventory item: {}", request.getProductName());
        InventoryItemResponse response = inventoryItemService.addNewInventoryItem(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{productId}")
    public ResponseEntity<InventoryItemResponse> update(
            @RequestHeader("X-Installation-Id") UUID installationId,
            @PathVariable Long productId,
            @RequestBody UpdateInventoryItemRequest request
    ) {
        log.info("Updating product {} for installation {}", productId, installationId);
        InventoryItemResponse response = inventoryItemService.updateItem(installationId, productId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> delete(
            @RequestHeader("X-Installation-Id") UUID installationId,
            @PathVariable Long productId
    ) {
        log.info("Deleting product {} from installation {}", productId, installationId);
        inventoryItemService.deleteItem(installationId, productId);
        return ResponseEntity.noContent().build();
    }
}