package com.example.inventoryservice.controller;

import com.example.inventoryservice.dto.*;
import com.example.inventoryservice.service.InventoryRequirementsService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/inventory/requirements")
public class InventoryRequirementsController {

    private static final Logger log = LoggerFactory.getLogger(InventoryRequirementsController.class);
    private final InventoryRequirementsService inventoryRequirementsService;

    public InventoryRequirementsController(InventoryRequirementsService inventoryRequirementsService){
        this.inventoryRequirementsService = inventoryRequirementsService;
    }

    @GetMapping("/items")
    public List<InventoryRequirementsResponse> getItems (@RequestHeader("X-Installation-Id") UUID installationId){
        log.info("Received request to get items for installationId: {}", installationId);
        return inventoryRequirementsService.getItemsForInstallation(installationId);
    }

    @PutMapping("/{productId}")
    public InventoryRequirementsResponse update(
            @RequestHeader("X-Installation-Id") UUID installationId,
            @PathVariable Long productId,
            @RequestBody UpdateMandatoryInventoryItemRequest request
    ) {
        return inventoryRequirementsService.updateItem(installationId, productId, request);
    }


    @PostMapping
    public InventoryRequirementsResponse addItem (@RequestHeader("X-Installation-Id") UUID installationId, @Valid @RequestBody CreateInventoryRequiredItemRequest request){
        log.info("Received request to add item for installationId: {}", installationId);
        return inventoryRequirementsService.addInventoryRequiredItem(installationId, request);
    }

    @PostMapping("/batch")
    public List<InventoryRequirementsResponse> addSeveralItems (@RequestHeader("X-Installation-Id") UUID installationId, @Valid @RequestBody List<CreateInventoryRequiredItemRequest> request){
        log.info("Received request to add {} items for installationId: {}", request.size(), installationId);
        return inventoryRequirementsService.addInventoryRequiredItems(installationId, request);
    }

    @DeleteMapping("/{productId}")
    public void delete(
            @RequestHeader("X-Installation-Id") UUID installationId,
            @PathVariable Long productId
    ) {
        inventoryRequirementsService.deleteItem(installationId, productId);
    }

}
