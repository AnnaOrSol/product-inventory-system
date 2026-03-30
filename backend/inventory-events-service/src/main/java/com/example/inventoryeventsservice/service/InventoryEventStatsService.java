package com.example.inventoryeventsservice.service;

import com.example.inventoryeventsservice.dto.EventSummaryResponse;
import com.example.inventoryeventsservice.dto.EventTimelinePointResponse;
import com.example.inventoryeventsservice.dto.TopWastedProductResponse;

import java.util.List;
import java.util.UUID;

public interface InventoryEventStatsService {

    EventSummaryResponse getSummary(UUID installationId);

    List<EventTimelinePointResponse> getTimeline(UUID installationId, int days);

    List<TopWastedProductResponse> getTopWastedProducts(UUID installationId, int limit);
}