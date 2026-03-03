package com.example.inventoryservice.controller;

import com.example.inventoryservice.dto.CreateNoteRequest;
import com.example.inventoryservice.dto.NoteResponse;
import com.example.inventoryservice.dto.UpdateNoteRequest;
import com.example.inventoryservice.service.NoteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/notes")
@RequiredArgsConstructor
public class NoteController {

    private final NoteService noteService;

    @GetMapping
    public ResponseEntity<List<NoteResponse>> getAllNotesForInstallation(@RequestHeader("X-Installation-Id") UUID installationId){
        List<NoteResponse> response = noteService.getNotesForInstallation(installationId);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<NoteResponse> createNewNote(@RequestHeader("X-Installation-Id") UUID installationId
                                                        , @Valid @RequestBody CreateNoteRequest noteRequest){
        NoteResponse response = noteService.addNewNote(installationId, noteRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/{noteId}")
    public ResponseEntity<Void> deleteNote(
                           @RequestHeader("X-Installation-Id") UUID installationId,
                           @PathVariable Long noteId
    ){
        noteService.deleteNote(noteId, installationId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{noteId}")
    public ResponseEntity<NoteResponse> updateNote(@RequestHeader("X-Installation-Id") UUID installationId,
                                                   @PathVariable Long noteId,
                                                   @RequestBody UpdateNoteRequest request){
        NoteResponse response = noteService.updateNote(noteId, installationId, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/pin/{noteId}")
    public ResponseEntity<Void> pinNote(@RequestHeader("X-Installation-Id") UUID installationId,
                                                   @PathVariable Long noteId){
        noteService.pinNote(installationId, noteId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/unpin")
    public ResponseEntity<Void> unpinNote(@RequestHeader("X-Installation-Id") UUID installationId){
        noteService.unpinNote(installationId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteAllNotesForInstallation(
            @RequestHeader("X-Installation-Id") UUID installationId
    ){
        noteService.deleteAllNotesForInstallation(installationId);
        return ResponseEntity.noContent().build();
    }

}
