package com.example.inventoryservice.service;

import com.example.inventoryservice.model.Installation;
import com.example.inventoryservice.model.PairingCode;
import com.example.inventoryservice.repository.InstallationRepository;
import com.example.inventoryservice.repository.PairingCodeRepository;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class InstallationService {

    private final InstallationRepository installationRepository;
    private final PairingCodeRepository pairingCodeRepository;

    private static final Duration PAIRING_CODE_TTL = Duration.ofMinutes(15);

    public InstallationService(
            InstallationRepository installationRepository,
            PairingCodeRepository pairingCodeRepository
    ) {
        this.installationRepository = installationRepository;
        this.pairingCodeRepository = pairingCodeRepository;
    }


    public CreateInstallationResult createInstallation() {
        Installation installation = new Installation(UUID.randomUUID());
        installationRepository.save(installation);

        pairingCodeRepository.deleteByInstallationId(installation.getId());

        PairingCode pairingCode = generatePairingCode(installation.getId());
        pairingCodeRepository.save(pairingCode);

        return new CreateInstallationResult(
                installation.getId(),
                pairingCode.getCode(),
                pairingCode.getExpiresAt()
        );
    }


    public UUID joinByPairingCode(String code) {
        Optional<PairingCode> pairingCodeOpt = pairingCodeRepository.findById(code);

        if (pairingCodeOpt.isEmpty()) {
            throw new IllegalArgumentException("Invalid pairing code");
        }

        PairingCode pairingCode = pairingCodeOpt.get();

        if (pairingCode.isExpired()) {
            throw new IllegalStateException("Pairing code expired");
        }

        return pairingCode.getInstallationId();
    }

    private PairingCode generatePairingCode(UUID installationId) {
        String code = generateReadableCode();
        Instant expiresAt = Instant.now().plus(PAIRING_CODE_TTL);

        return new PairingCode(code, installationId, expiresAt);
    }


    private String generateReadableCode() {
        return UUID.randomUUID()
                .toString()
                .substring(0, 6)
                .toUpperCase();
    }


    public record CreateInstallationResult(
            UUID installationId,
            String pairingCode,
            Instant expiresAt
    ) {}
}
