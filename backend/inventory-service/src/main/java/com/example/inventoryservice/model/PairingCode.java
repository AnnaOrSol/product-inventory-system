package com.example.inventoryservice.model;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "pairing_codes")
public class PairingCode {


    @Id
    @Column(length = 10)
    private String code;


    @Column(name = "installation_id", nullable = false)
    private UUID installationId;


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
