package com.example.inventoryeventsservice.dto;

public record EventSummaryResponse(
        long itemsAdded,
        long itemsDeleted,
        long itemsDepleted,
        long itemsExpiredDiscarded
) {}