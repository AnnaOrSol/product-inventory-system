package com.example.inventoryservice.repository;

import com.example.inventoryservice.model.InstallationMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface InstallationMemberRepository extends JpaRepository<InstallationMember, Long> {

    boolean existsByInstallationIdAndUserId(UUID installationId, UUID userId);

    List<InstallationMember> findAllByUserId(UUID userId);
}