package com.example.inventoryservice.dto;

import jakarta.persistence.Column;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.UUID;

public class CreateNoteRequest {
    @NotNull
    private String text;
    private boolean pinned;

    public String getText() {
        return text;
    }

    public boolean isPinned() {
        return pinned;
    }
}
