package com.example.inventoryservice.controller;

<<<<<<< HEAD
=======
import com.example.inventoryservice.dto.InstallationMemberResponse;
>>>>>>> main
import com.example.inventoryservice.dto.MyInstallationResponse;
import com.example.inventoryservice.service.InstallationMemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
<<<<<<< HEAD
=======
import org.springframework.web.bind.annotation.RequestHeader;
>>>>>>> main
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
<<<<<<< HEAD
=======
import java.util.UUID;
>>>>>>> main

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