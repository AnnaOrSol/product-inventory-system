package com.example.inventoryservice.controller;

import com.example.inventoryservice.service.InstallationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/installations")
@CrossOrigin(origins = "*")
public class InstallationController {

    private final InstallationService installationService;

    public InstallationController(InstallationService installationService) {
        this.installationService = installationService;
    }

    @PostMapping
    public ResponseEntity<?> createInstallation() {
        var result = installationService.createInstallation();

        return ResponseEntity.status(HttpStatus.CREATED).body(
                Map.of(
                        "installationId", result.installationId(),
                        "pairingCode", result.pairingCode(),
                        "expiresAt", result.expiresAt()
                )
        );
    }

    @PostMapping("/join")
    public ResponseEntity<?> joinInstallation(@RequestBody JoinInstallationRequest request) {
        try {
            UUID installationId = installationService.joinByPairingCode(request.code());
            return ResponseEntity.ok(
                    Map.of("installationId", installationId)
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "INVALID_CODE"));
        } catch (IllegalStateException e) {
            return ResponseEntity
                    .status(HttpStatus.GONE)
                    .body(Map.of("error", "CODE_EXPIRED"));
        }
    }


    public record JoinInstallationRequest(String code) {}
}
