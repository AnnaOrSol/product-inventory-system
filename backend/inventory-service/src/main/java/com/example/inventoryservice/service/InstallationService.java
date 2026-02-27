package com.example.inventoryservice.service;

import com.example.inventoryservice.dto.CreateInstallationResponse;

import java.util.UUID;

public interface InstallationService {

    public CreateInstallationResponse createInstallation();
    public UUID joinByPairingCode(String code);
    public CreateInstallationResponse generateNewPairingCodeToJoin(UUID uuid);
}
