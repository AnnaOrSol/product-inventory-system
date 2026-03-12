package com.example.inventoryservice.service;

import com.example.inventoryservice.dto.InstallationMemberResponse;
import com.example.inventoryservice.dto.MyInstallationResponse;

import java.util.List;
import java.util.UUID;

public interface InstallationMemberService {

    void addOwnerToInstallation(UUID installationId, UUID userId);

    void addMemberToInstallation(UUID installationId, UUID userId);

    boolean isMember(UUID installationId, UUID userId);

    List<InstallationMemberResponse> getInstallationsForUser();

    List<MyInstallationResponse> getMyInstallations();
}