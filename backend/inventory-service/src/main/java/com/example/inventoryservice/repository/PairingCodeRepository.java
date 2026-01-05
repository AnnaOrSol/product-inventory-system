package com.example.inventoryservice.repository;

import com.example.inventoryservice.model.PairingCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PairingCodeRepository extends JpaRepository<PairingCode, String> {

    void deleteByInstallationId(UUID installationId);
}
