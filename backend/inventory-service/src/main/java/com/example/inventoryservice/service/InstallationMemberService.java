package com.example.inventoryservice.service;

import java.util.UUID;

public interface InstallationMemberService {

    void addOwnerToInstallation(UUID installationId, UUID userId);

    void addMemberToInstallation(UUID installationId, UUID userId);

    boolean isMember(UUID installationId, UUID userId);
}