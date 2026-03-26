package com.example.inventoryeventsservice.service;

import com.example.inventoryeventsservice.dto.InventoryEventMessage;

public interface InventoryEventService {
    void saveEvent(InventoryEventMessage message);
}