package com.example.inventoryeventsservice.service.impl;

import com.example.inventoryeventsservice.dto.EventSummaryResponse;
import com.example.inventoryeventsservice.dto.EventTimelinePointResponse;
import com.example.inventoryeventsservice.dto.TopWastedProductResponse;
import com.example.inventoryeventsservice.entity.InventoryEventEntity;
import com.example.inventoryeventsservice.enums.InventoryEventType;
import com.example.inventoryeventsservice.repository.InventoryEventRepository;
import com.example.inventoryeventsservice.service.InventoryEventStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryEventStatsServiceImpl implements InventoryEventStatsService {

    private final InventoryEventRepository repository;

    @Override
    @Transactional(readOnly = true)
    public EventSummaryResponse getSummary(UUID installationId) {
        long added = repository.countByInstallationIdAndEventType(installationId, InventoryEventType.ITEM_ADDED);
        long deleted = repository.countByInstallationIdAndEventType(installationId, InventoryEventType.ITEM_DELETED);
        long depleted = repository.countByInstallationIdAndEventType(installationId, InventoryEventType.ITEM_DEPLETED);
        long expired = repository.countByInstallationIdAndEventType(installationId, InventoryEventType.ITEM_EXPIRED_DISCARDED);

        return new EventSummaryResponse(added, deleted, depleted, expired);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventTimelinePointResponse> getTimeline(UUID installationId, int days) {
        int safeDays = Math.max(days, 1);

        Instant end = Instant.now();
        Instant start = end.minusSeconds((long) safeDays * 24 * 60 * 60);

        List<InventoryEventEntity> events =
                repository.findAllByInstallationIdAndOccurredAtBetweenOrderByOccurredAtAsc(installationId, start, end);

        Map<LocalDate, List<InventoryEventEntity>> grouped = events.stream()
                .collect(Collectors.groupingBy(
                        e -> e.getOccurredAt().atZone(ZoneOffset.UTC).toLocalDate(),
                        TreeMap::new,
                        Collectors.toList()
                ));

        List<EventTimelinePointResponse> response = new ArrayList<>();

        LocalDate startDate = start.atZone(ZoneOffset.UTC).toLocalDate();
        LocalDate endDate = end.atZone(ZoneOffset.UTC).toLocalDate();

        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            List<InventoryEventEntity> dayEvents = grouped.getOrDefault(date, Collections.emptyList());

            long added = dayEvents.stream().filter(e -> e.getEventType() == InventoryEventType.ITEM_ADDED).count();
            long deleted = dayEvents.stream().filter(e -> e.getEventType() == InventoryEventType.ITEM_DELETED).count();
            long depleted = dayEvents.stream().filter(e -> e.getEventType() == InventoryEventType.ITEM_DEPLETED).count();
            long expired = dayEvents.stream().filter(e -> e.getEventType() == InventoryEventType.ITEM_EXPIRED_DISCARDED).count();

            response.add(new EventTimelinePointResponse(date, added, deleted, depleted, expired));
        }

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<TopWastedProductResponse> getTopWastedProducts(UUID installationId, int limit) {
        int safeLimit = Math.max(limit, 1);
        return repository.findTopWastedProducts(installationId, safeLimit);
    }
}