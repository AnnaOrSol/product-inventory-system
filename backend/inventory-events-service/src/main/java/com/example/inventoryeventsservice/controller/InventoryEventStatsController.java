package com.example.inventoryeventsservice.controller;

import com.example.inventoryeventsservice.dto.EventSummaryResponse;
import com.example.inventoryeventsservice.dto.EventTimelinePointResponse;
import com.example.inventoryeventsservice.dto.TopWastedProductResponse;
import com.example.inventoryeventsservice.service.InventoryEventStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/event-stats")
@RequiredArgsConstructor
public class InventoryEventStatsController {

    private final InventoryEventStatsService statsService;

    @GetMapping("/summary")
    public EventSummaryResponse getSummary(
            @RequestHeader("X-Installation-Id") UUID installationId
    ) {
        return statsService.getSummary(installationId);
    }

    @GetMapping("/timeline")
    public List<EventTimelinePointResponse> getTimeline(
            @RequestHeader("X-Installation-Id") UUID installationId,
            @RequestParam(defaultValue = "30") int days
    ) {
        return statsService.getTimeline(installationId, days);
    }

    @GetMapping("/top-wasted-products")
    public List<TopWastedProductResponse> getTopWastedProducts(
            @RequestHeader("X-Installation-Id") UUID installationId,
            @RequestParam(defaultValue = "5") int limit
    ) {
        return statsService.getTopWastedProducts(installationId, limit);
    }
}