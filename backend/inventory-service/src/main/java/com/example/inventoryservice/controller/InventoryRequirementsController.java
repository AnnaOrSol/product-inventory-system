package com.example.inventoryservice.controller;

import com.example.inventoryservice.dto.*;
import com.example.inventoryservice.service.InventoryRequirementsService;
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
@RequestMapping("/inventory/requirements")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class InventoryRequirementsController {

    private final InventoryRequirementsService inventoryRequirementsService;

    @GetMapping("/items")
    public ResponseEntity<List<InventoryRequirementsResponse>> getItems(
            @RequestHeader("X-Installation-Id") UUID installationId) {
        log.info("Fetching requirements for installation: {}", installationId);
        List<InventoryRequirementsResponse> items = inventoryRequirementsService.getItemsForInstallation(installationId);
        return ResponseEntity.ok(items);
    }

    @PostMapping
    public ResponseEntity<InventoryRequirementsResponse> addItem(
            @RequestHeader("X-Installation-Id") UUID installationId,
            @Valid @RequestBody CreateInventoryRequiredItemRequest request) {
        log.info("Adding requirement for installation: {}", installationId);
        InventoryRequirementsResponse response = inventoryRequirementsService.addInventoryRequiredItem(installationId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/batch")
    public ResponseEntity<List<InventoryRequirementsResponse>> addSeveralItems(
            @RequestHeader("X-Installation-Id") UUID installationId,
            @Valid @RequestBody List<CreateInventoryRequiredItemRequest> request) {
        log.info("Batch adding {} requirements", request.size());
        List<InventoryRequirementsResponse> response = inventoryRequirementsService.addInventoryRequiredItems(installationId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{productId}")
    public ResponseEntity<InventoryRequirementsResponse> update(
            @RequestHeader("X-Installation-Id") UUID installationId,
            @PathVariable Long productId,
            @RequestBody UpdateInventoryRequirementsRequest request) {
        log.info("Updating requirement for product: {} in installation: {}", productId, installationId);
        InventoryRequirementsResponse response = inventoryRequirementsService.updateItem(installationId, productId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> delete(
            @RequestHeader("X-Installation-Id") UUID installationId,
            @PathVariable Long productId) {
        log.info("Deleting requirement for product: {}", productId);
        inventoryRequirementsService.deleteItem(installationId, productId);
        return ResponseEntity.noContent().build(); // מחזיר 204 No Content
    }

    @GetMapping("/shopping-list")
    public ResponseEntity<List<ShoppngListItemResponse>> getShoppingList(
            @RequestHeader("X-Installation-Id") UUID installationId) {
        log.info("Generating shopping list for installation: {}", installationId);
        return ResponseEntity.ok(inventoryRequirementsService.getShoppingList(installationId));
    }
}