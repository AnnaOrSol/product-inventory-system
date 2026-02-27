package com.example.inventoryservice.controller;

import com.example.inventoryservice.dto.CreateInstallationResponse;
import com.example.inventoryservice.dto.GeneratePairCodeRequest;
import com.example.inventoryservice.dto.JoinInstallationRequest;
import com.example.inventoryservice.service.InstallationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/installations")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class InstallationController {

    private final InstallationService installationService;

    @PostMapping
    public ResponseEntity<CreateInstallationResponse> createInstallation() {
        CreateInstallationResponse result = installationService.createInstallation();
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
}