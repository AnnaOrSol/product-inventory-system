package com.example.inventoryservice.dto;

import java.time.Instant;
import java.util.UUID;

public record CreateInstallationResponse(UUID installationId,
                                         String pairingCode,
                                         Instant expiresAt
) {
}
