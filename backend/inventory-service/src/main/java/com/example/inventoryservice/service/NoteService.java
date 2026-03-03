package com.example.inventoryservice.service;

import com.example.inventoryservice.dto.CreateNoteRequest;
import com.example.inventoryservice.dto.NoteResponse;
import com.example.inventoryservice.dto.UpdateNoteRequest;

import java.util.List;
import java.util.UUID;

public interface NoteService {

    public List<NoteResponse> getNotesForInstallation(UUID installationId);
    public NoteResponse addNewNote(UUID installationId, CreateNoteRequest noteRequest);
    public void deleteNote(Long id,UUID installationId);
    public NoteResponse updateNote(Long id,UUID installationId,UpdateNoteRequest updateNoteRequest);
    public void pinNote(UUID installationId, Long id);
    public void unpinNote(UUID installationId);
    public void deleteAllNotesForInstallation (UUID installationId);

}
