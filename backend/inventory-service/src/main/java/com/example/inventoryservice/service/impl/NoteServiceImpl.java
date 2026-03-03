package com.example.inventoryservice.service.impl;

import com.example.inventoryservice.dto.CreateNoteRequest;
import com.example.inventoryservice.dto.NoteResponse;
import com.example.inventoryservice.dto.UpdateNoteRequest;
import com.example.inventoryservice.model.Note;
import com.example.inventoryservice.repository.NoteRepository;
import com.example.inventoryservice.service.NoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class NoteServiceImpl implements NoteService {

    private final NoteRepository noteRepository;

    @Override
    public List<NoteResponse> getNotesForInstallation(UUID installationId) {
        List<Note> notesList = noteRepository.findByInstallationIdOrderByPinnedDescCreatedAtDesc(installationId);
        return notesList.stream().map(this::mapToResponse).toList();
    }

    @Override
    public NoteResponse addNewNote(UUID installationId, CreateNoteRequest noteRequest) {
        Note newNote = new Note();
        newNote.setInstallationId(installationId);
        newNote.setText(noteRequest.getText());
        newNote.setPinned(noteRequest.isPinned());
        if(noteRequest.isPinned()){
            noteRepository.unpinNote(installationId, Instant.now());
        }
        Note saved = noteRepository.save(newNote);
        return mapToResponse(saved);
    }

    @Override
    public void deleteNote(Long id, UUID installationId) {
        Optional<Note> noteToDelete = noteRepository.findByInstallationIdAndId(installationId, id);
        if(!noteToDelete.isEmpty()){
            noteRepository.delete(noteToDelete.get());
        }
    }

    @Override
    public NoteResponse updateNote(Long id, UUID installationId, UpdateNoteRequest updateNoteRequest) {
        Note noteToUpdate = noteRepository.findByInstallationIdAndId(installationId, id)
                .orElseThrow(() -> new RuntimeException("Note not found for provided installation and Id"));
        if(updateNoteRequest.getText() != null) noteToUpdate.setText(updateNoteRequest.getText());
        if (updateNoteRequest.isPinned() != null) {
            boolean newPinned = updateNoteRequest.isPinned();
            if (newPinned && !noteToUpdate.isPinned()) {
                noteRepository.unpinNote(installationId, Instant.now());
            }
            noteToUpdate.setPinned(newPinned);
        }
        Note saved = noteRepository.save(noteToUpdate);
        return mapToResponse(saved);
    }


    @Override
    public void pinNote(UUID installationId, Long id) {
        noteRepository.unpinNote(installationId, Instant.now());
        noteRepository.pinNote(id, installationId, Instant.now());
    }

    @Override
    public void unpinNote(UUID installationId) {
        noteRepository.unpinNote(installationId, Instant.now());
    }

    @Override
    public void deleteAllNotesForInstallation(UUID installationId) {
        noteRepository.deleteByInstallationId(installationId);
    }

    private NoteResponse mapToResponse(Note note){
        return new NoteResponse(
                note.getId(), note.getText(), note.isPinned()
        );
    }
}
