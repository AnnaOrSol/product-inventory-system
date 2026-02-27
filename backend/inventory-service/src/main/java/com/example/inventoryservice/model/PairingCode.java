package com.example.inventoryservice.model;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "pairing_codes",
        indexes = @Index(name = "idx_pairing_codes_expires_at", columnList = "expires_at"))
public class PairingCode {


    @Id
    @Column(name = "installation_id", nullable = false)
    private UUID installationId;

    @Column(name ="code", length = 10, nullable = false, unique = true)
    private String code;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;


    protected PairingCode() {
    }


    public PairingCode(String code, UUID installationId, Instant expiresAt) {
        this.code = code;
        this.installationId = installationId;
        this.expiresAt = expiresAt;
    }


    public boolean isExpired() {
        return Instant.now().isAfter(expiresAt);
    }

    public String getCode() {
        return code;
    }

    public UUID getInstallationId() {
        return installationId;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }
}
