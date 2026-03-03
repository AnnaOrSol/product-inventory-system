package com.example.inventoryservice.repository;

import com.example.inventoryservice.model.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NoteRepository extends JpaRepository<Note, Long> {

    Optional<Note> findByInstallationIdAndId(UUID installationId, Long id);
    List<Note> findByInstallationIdOrderByPinnedDescCreatedAtDesc (UUID installationId);
    Optional<Note> findByInstallationIdAndPinnedTrue(UUID installationId);
    @Modifying
    @Query("""
            update Note n
               set n.pinned = false, n.updatedAt = :now 
               where n.installationId = :installationId
               and n.pinned = true
       """)
    int unpinNote(@Param("installationId") UUID installationId,
                  @Param("now") Instant now);

    @Modifying
    @Query("""
       update Note n
               set n.pinned = true, n.updatedAt = :now 
               where n.installationId = :installationId
               and n.id = :noteId
       """)
    int pinNote(@Param("noteId") Long noteId, @Param("installationId") UUID installationId,
                @Param("now") Instant now);

    void deleteByInstallationId(UUID installationId);

}
