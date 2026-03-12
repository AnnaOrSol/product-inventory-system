package com.example.inventoryservice.repository;

import com.example.inventoryservice.dto.MyInstallationResponse;
import com.example.inventoryservice.model.InstallationMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface InstallationMemberRepository extends JpaRepository<InstallationMember, Long> {

    boolean existsByInstallationIdAndUserId(UUID installationId, UUID userId);

    List<InstallationMember> findAllByUserId(UUID userId);

    @Query("""
    select new com.example.inventoryservice.dto.MyInstallationResponse(
        im.installationId,
        i.name,
        im.role
    )
    from InstallationMember im
    join Installation i on i.id = im.installationId
    where im.userId = :userId
""")
    List<MyInstallationResponse> findMyInstallationsByUserId(@Param("userId") UUID userId);
}