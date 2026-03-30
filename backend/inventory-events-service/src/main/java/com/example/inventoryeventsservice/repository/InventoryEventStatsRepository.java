package com.example.inventoryeventsservice.repository;

import com.example.inventoryeventsservice.dto.TopWastedProductResponse;

import java.util.List;
import java.util.UUID;

public interface InventoryEventStatsRepository {

    List<TopWastedProductResponse> findTopWastedProducts(UUID installationId, int limit);
}