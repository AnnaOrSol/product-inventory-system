package com.example.inventoryeventsservice.dto;

import java.time.LocalDate;

public record EventTimelinePointResponse(
        LocalDate date,
        long itemsAdded,
        long itemsDeleted,
        long itemsDepleted,
        long itemsExpiredDiscarded
) {}