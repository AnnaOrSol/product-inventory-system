package com.example.inventoryservice.dto;

import com.example.inventoryservice.model.InstallationRole;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@AllArgsConstructor
public class InstallationMemberResponse {
    private UUID installationId;
    private UUID userId;
    private InstallationRole role;
    private LocalDateTime joinedAt;
}