package com.example.inventoryservice.service.impl;

import com.example.inventoryservice.model.InstallationMember;
import com.example.inventoryservice.model.InstallationRole;
import com.example.inventoryservice.repository.InstallationMemberRepository;
import com.example.inventoryservice.service.InstallationMemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InstallationMemberServiceImpl implements InstallationMemberService {

    private final InstallationMemberRepository installationMemberRepository;

    @Override
    public void addOwnerToInstallation(UUID installationId, UUID userId) {
        LocalDateTime now = LocalDateTime.now();

        InstallationMember member = new InstallationMember();
        member.setInstallationId(installationId);
        member.setUserId(userId);
        member.setRole(InstallationRole.OWNER);
        member.setJoinedAt(now);
        member.setCreatedAt(now);
        member.setUpdatedAt(now);

        installationMemberRepository.save(member);
    }

    @Override
    public void addMemberToInstallation(UUID installationId, UUID userId) {
        LocalDateTime now = LocalDateTime.now();

        InstallationMember member = new InstallationMember();
        member.setInstallationId(installationId);
        member.setUserId(userId);
        member.setRole(InstallationRole.MEMBER);
        member.setJoinedAt(now);
        member.setCreatedAt(now);
        member.setUpdatedAt(now);

        installationMemberRepository.save(member);
    }

    @Override
    public boolean isMember(UUID installationId, UUID userId) {
        return installationMemberRepository.existsByInstallationIdAndUserId(installationId, userId);
    }
}