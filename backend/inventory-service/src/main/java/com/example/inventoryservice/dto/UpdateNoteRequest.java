package com.example.inventoryservice.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public class UpdateNoteRequest {
    private String text;
    private Boolean pinned;

    public String getText() {
        return text;
    }

    public Boolean isPinned() {
        return pinned;
    }
}
