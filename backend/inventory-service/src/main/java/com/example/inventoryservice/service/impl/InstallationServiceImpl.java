package com.example.inventoryservice.service.impl;

import com.example.inventoryservice.dto.CreateInstallationResponse;
import com.example.inventoryservice.model.Installation;
import com.example.inventoryservice.model.PairingCode;
import com.example.inventoryservice.repository.InstallationRepository;
import com.example.inventoryservice.repository.PairingCodeRepository;
import com.example.inventoryservice.service.InstallationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class InstallationServiceImpl implements InstallationService {

    private final InstallationRepository installationRepository;
    private final PairingCodeRepository pairingCodeRepository;

    private static final Duration PAIRING_CODE_TTL = Duration.ofMinutes(15);

    @Override
    @Transactional
    public CreateInstallationResponse createInstallation() {
        log.info("Creating new installation");

        UUID installationId = UUID.randomUUID();
        Installation installation = new Installation(installationId);
        installationRepository.save(installation);

        return createAndSavePairingCode(installationId);
    }

    @Override
    @Transactional(readOnly = true)
    public UUID joinByPairingCode(String code) {
        log.info("Attempting to join with code: {}", code);

        PairingCode pairingCode = pairingCodeRepository.findByCode(code)
                .orElseThrow(() -> new IllegalArgumentException("Invalid pairing code"));

        if (pairingCode.isExpired()) {
            log.warn("Pairing code {} has expired", code);
            throw new IllegalStateException("Pairing code expired");
        }

        return pairingCode.getInstallationId();
    }

    @Override
    @Transactional
    public CreateInstallationResponse generateNewPairingCodeToJoin(UUID uuid) {
        log.info("Generating new pairing code for installation: {}", uuid);

        if (!installationRepository.existsById(uuid)) {
            throw new IllegalArgumentException("Installation not found");
        }

        return createAndSavePairingCode(uuid);
    }

    private CreateInstallationResponse createAndSavePairingCode(UUID installationId) {
        pairingCodeRepository.deleteById(installationId);

        PairingCode pairingCode = generatePairingCodeObject(installationId);
        pairingCodeRepository.save(pairingCode);

        log.info("New pairing code generated: {} for installation: {}", pairingCode.getCode(), installationId);

        return new CreateInstallationResponse(
                installationId,
                pairingCode.getCode(),
                pairingCode.getExpiresAt()
        );
    }

    private PairingCode generatePairingCodeObject(UUID installationId) {
        String code = UUID.randomUUID()
                .toString()
                .substring(0, 6)
                .toUpperCase();

        Instant expiresAt = Instant.now().plus(PAIRING_CODE_TTL);

        return new PairingCode(code, installationId, expiresAt);
    }


}