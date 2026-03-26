package com.example.inventoryservice.event;

public enum InventoryEventReason {
    PURCHASE,
    CONSUMED,
    EXPIRED,
    USER_ERROR,
    DAMAGED,
    MANUAL_UPDATE,
    OTHER
}