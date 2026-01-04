package com.example.inventoryservice.controller;

import com.example.inventoryservice.dto.CreateInventoryItemRequest;
import com.example.inventoryservice.dto.CreateInventoryRequiredItemRequest;
import com.example.inventoryservice.dto.InventoryRequirementsResponse;
import com.example.inventoryservice.dto.InventoryResponse;
import com.example.inventoryservice.service.InventoryRequirementsService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/inventory/requirements")
public class InventoryRequirementsController {

    private final InventoryRequirementsService inventoryRequirementsService;

    public InventoryRequirementsController(InventoryRequirementsService inventoryRequirementsService){
        this.inventoryRequirementsService = inventoryRequirementsService;
    }

    @GetMapping("/items")
    public List<InventoryRequirementsResponse> getItems (@RequestHeader("X-Installation-Id") UUID installationId){
        return inventoryRequirementsService.getItemsForInstallation(installationId);
    }

    @PostMapping
    public InventoryRequirementsResponse addItem (@Valid @RequestBody CreateInventoryRequiredItemRequest request){
        return inventoryRequirementsService.addInventoryRequiredItem(request);
    }
    /*
    @PostMapping
    public InventoryRequirementsResponse addSeveralItems (@Valid @RequestBody List<CreateInventoryRequiredItemRequest> request){
        return inventoryRequirementsService.addInventoryRequiredItems(request);
    }

     */
}
