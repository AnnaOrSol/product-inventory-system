package com.example.inventoryservice.controller;

import com.example.inventoryservice.dto.MyInstallationResponse;
import com.example.inventoryservice.service.InstallationMemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/installation-members")
@RequiredArgsConstructor
public class InstallationMemberController {

    private final InstallationMemberService installationMemberService;

    @GetMapping("/me")
    public List<MyInstallationResponse> getMyInstallations() {
        return installationMemberService.getMyInstallations();
    }
}