package com.example.inventoryservice.dto;

import com.example.inventoryservice.model.InstallationRole;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.UUID;

@Getter
@AllArgsConstructor
public class MyInstallationResponse {
    private UUID installationId;
    private String installationName;
    private InstallationRole role;
}