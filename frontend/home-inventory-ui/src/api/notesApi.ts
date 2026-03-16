import { apiFetch } from "@/api/apiClient";
import { installationService } from "@/services/installationService";
import type { Note } from "@/types/note";
import { API_PATHS } from "@/lib/config";

const NOTES_API = API_PATHS.NOTES_API;
const API_BASE = "/notes";


function installationHeaders(): HeadersInit {
    return {
        "X-Installation-Id": installationService.getId() || "",
    };
}

export async function fetchNotes(): Promise<Note[]> {
    return apiFetch(`${NOTES_API}`, {
        headers: installationHeaders(),
    });
}

export async function createNote(data: {
    text: string;
    pinned?: boolean;
}): Promise<Note> {
    return apiFetch(`${NOTES_API}`, {
        method: "POST",
        headers: installationHeaders(),
        body: JSON.stringify({
            text: data.text,
            pinned: data.pinned ?? false,
        }),
    });
}

export async function updateNote(
    noteId: number,
    data: {
        text?: string;
        pinned?: boolean;
    }
): Promise<Note> {
    return apiFetch(`${NOTES_API}/${noteId}`, {
        method: "PATCH",
        headers: installationHeaders(),
        body: JSON.stringify(data),
    });
}

export async function deleteNote(noteId: number): Promise<void> {
    return apiFetch(`${NOTES_API}/${noteId}`, {
        method: "DELETE",
        headers: installationHeaders(),
    });
}

export async function pinNote(noteId: number): Promise<void> {
    return apiFetch(`${NOTES_API}/pin/${noteId}`, {
        method: "PATCH",
        headers: installationHeaders(),
    });
}

export async function unpinNote(): Promise<void> {
    return apiFetch(`${NOTES_API}/unpin`, {
        method: "PATCH",
        headers: installationHeaders(),
    });
}

export async function deleteAllNotes(): Promise<void> {
    return apiFetch(`${NOTES_API}`, {
        method: "DELETE",
        headers: installationHeaders(),
    });
}