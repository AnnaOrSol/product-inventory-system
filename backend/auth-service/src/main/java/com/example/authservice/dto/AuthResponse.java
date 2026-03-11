package com.example.authservice.dto;

public record AuthResponse(
        String accessToken,
        String tokenType,
        long expiresIn,
        String userId,
        String name,
        String phone
) {}