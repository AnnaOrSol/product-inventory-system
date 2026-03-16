package com.example.inventoryservice.controller;

import com.example.inventoryservice.dto.*;
import com.example.inventoryservice.service.InstallationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/installations")
@RequiredArgsConstructor
public class InstallationController {

    private final InstallationService installationService;

    @PostMapping
    public ResponseEntity<CreateInstallationResponse> createInstallation(@RequestBody CreateInstallationRequest request) {
        CreateInstallationResponse result = installationService.createInstallation(request.name());
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @PostMapping("/join")
    public ResponseEntity<Map<String, UUID>> joinInstallation(@RequestBody JoinInstallationRequest request) {
        UUID installationId = installationService.joinByPairingCode(request.code());
        return ResponseEntity.ok(Map.of("installationId", installationId));
    }

    @PostMapping("/paircode")
    public ResponseEntity<CreateInstallationResponse> generateNewPairingCodeToJoin(@RequestBody GeneratePairCodeRequest request) {
        CreateInstallationResponse result = installationService.generateNewPairingCodeToJoin(request.installationId());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{installationId}")
    public ResponseEntity<InstallationDetailsResponse> getInstallation(
            @PathVariable UUID installationId
    ) {
        InstallationDetailsResponse result = installationService.getInstallation(installationId);
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{installationId}")
    public ResponseEntity<InstallationDetailsResponse> updateInstallation(
            @PathVariable UUID installationId,
            @Valid @RequestBody UpdateInstallationRequest request
    ) {
        InstallationDetailsResponse result =
                installationService.updateInstallationName(installationId, request.name());

        return ResponseEntity.ok(result);
    }
}