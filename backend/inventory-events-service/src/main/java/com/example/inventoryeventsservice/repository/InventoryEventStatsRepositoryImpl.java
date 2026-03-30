package com.example.inventoryeventsservice.repository;

import com.example.inventoryeventsservice.dto.TopWastedProductResponse;
import com.example.inventoryeventsservice.enums.InventoryEventType;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class InventoryEventStatsRepositoryImpl implements InventoryEventStatsRepository {

    @PersistenceContext
    private final EntityManager entityManager;

    @Override
    public List<TopWastedProductResponse> findTopWastedProducts(UUID installationId, int limit) {
        return entityManager.createQuery("""
                select new com.example.inventoryeventsservice.dto.TopWastedProductResponse(
                    coalesce(e.productName, 'Unknown Product'),
                    count(e)
                )
                from InventoryEventEntity e
                where e.installationId = :installationId
                  and e.eventType = :eventType
                group by e.productName
                order by count(e) desc
                """, TopWastedProductResponse.class)
                .setParameter("installationId", installationId)
                .setParameter("eventType", InventoryEventType.ITEM_EXPIRED_DISCARDED)
                .setMaxResults(limit)
                .getResultList();
    }
}