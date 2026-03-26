package com.example.inventoryeventsservice.controller;

import com.example.inventoryeventsservice.enums.InventoryEventType;
import com.example.inventoryeventsservice.repository.InventoryEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/event-stats")
@RequiredArgsConstructor
public class InventoryEventStatsController {

    private final InventoryEventRepository repository;

    @GetMapping("/{installationId}/summary")
    public EventSummaryResponse getSummary(@PathVariable UUID installationId) {
        long added = repository.countByInstallationIdAndEventType(installationId, InventoryEventType.ITEM_ADDED);
        long deleted = repository.countByInstallationIdAndEventType(installationId, InventoryEventType.ITEM_DELETED);
        long depleted = repository.countByInstallationIdAndEventType(installationId, InventoryEventType.ITEM_DEPLETED);
        long expired = repository.countByInstallationIdAndEventType(installationId, InventoryEventType.ITEM_EXPIRED_DISCARDED);

        return new EventSummaryResponse(added, deleted, depleted, expired);
    }

    public record EventSummaryResponse(
            long itemsAdded,
            long itemsDeleted,
            long itemsDepleted,
            long itemsExpiredDiscarded
    ) {}
}