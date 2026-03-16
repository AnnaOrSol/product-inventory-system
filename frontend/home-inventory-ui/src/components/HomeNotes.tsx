import { useEffect, useMemo, useState } from "react";
import {
    StickyNote,
    Pin,
    PinOff,
    Trash2,
    Plus,
    Loader2,
    Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    fetchNotes,
    createNote,
    deleteNote as deleteNoteApi,
    pinNote as pinNoteApi,
    unpinNote as unpinNoteApi,
} from "@/api/notesApi";
import type { Note } from "@/types/note";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function HomeNotes() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [newNoteText, setNewNoteText] = useState("");
    const [showComposer, setShowComposer] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [busyNoteId, setBusyNoteId] = useState<number | null>(null);

    const pinnedNote = useMemo(
        () => notes.find((note) => note.pinned),
        [notes]
    );

    const otherNotes = useMemo(
        () => notes.filter((note) => !note.pinned),
        [notes]
    );

    const loadNotes = async () => {
        try {
            setLoading(true);
            const data = await fetchNotes();
            setNotes(data);
        } catch (error) {
            console.error("Failed to load notes:", error);
            toast.error("Failed to load notes");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotes();
    }, []);

    const handleAddNote = async () => {
        const trimmed = newNoteText.trim();
        if (!trimmed) return;

        try {
            setSubmitting(true);
            const created = await createNote({ text: trimmed, pinned: false });
            setNotes((prev) => [created, ...prev]);
            setNewNoteText("");
            setShowComposer(false);
            toast.success("Note added");
        } catch (error) {
            console.error("Failed to create note:", error);
            toast.error("Failed to add note");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteNote = async (noteId: number) => {
        try {
            setBusyNoteId(noteId);
            await deleteNoteApi(noteId);
            setNotes((prev) => prev.filter((note) => note.id !== noteId));
            toast.success("Note deleted");
        } catch (error) {
            console.error("Failed to delete note:", error);
            toast.error("Failed to delete note");
        } finally {
            setBusyNoteId(null);
        }
    };

    const handleTogglePin = async (note: Note) => {
        try {
            setBusyNoteId(note.id);

            if (note.pinned) {
                await unpinNoteApi();
                setNotes((prev) =>
                    prev.map((n) => ({
                        ...n,
                        pinned: false,
                    }))
                );
                toast.success("Note unpinned");
            } else {
                await pinNoteApi(note.id);
                setNotes((prev) =>
                    prev.map((n) => ({
                        ...n,
                        pinned: n.id === note.id,
                    }))
                );
                toast.success("Note pinned");
            }
        } catch (error) {
            console.error("Failed to update pin state:", error);
            toast.error("Failed to update pin");
        } finally {
            setBusyNoteId(null);
        }
    };

    return (
        <section className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-yellow-100 flex items-center justify-center border border-yellow-200">
                        <StickyNote className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            Notes
                        </h2>
                        <p className="text-xs text-muted-foreground">
                            Quick reminders for the home
                        </p>
                    </div>
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowComposer((prev) => !prev)}
                    className="text-xs text-primary"
                >
                    {showComposer ? "Cancel" : "+ Add Note"}
                </Button>
            </div>

            {showComposer && (
                <div className="rounded-2xl border border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50 p-3 shadow-sm animate-in slide-in-from-top-2">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Milk, eggs, call mom, buy detergent..."
                            value={newNoteText}
                            onChange={(e) => setNewNoteText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleAddNote();
                                }
                            }}
                            className="bg-white border-yellow-200"
                            maxLength={140}
                        />
                        <Button
                            onClick={handleAddNote}
                            disabled={submitting || !newNoteText.trim()}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white shadow-md"
                        >
                            {submitting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add
                                </>
                            )}
                        </Button>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>Press Enter to add quickly</span>
                        <span>{newNoteText.length}/140</span>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[1, 2, 3].map((skeleton) => (
                        <div
                            key={skeleton}
                            className="h-28 rounded-2xl border border-yellow-100 bg-yellow-50/60 animate-pulse"
                        />
                    ))}
                </div>
            ) : notes.length === 0 ? (
                <div className="rounded-3xl border-2 border-dashed border-yellow-200 bg-yellow-50/40 py-12 px-6 text-center">
                    <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-yellow-100 flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-yellow-600" />
                    </div>
                    <p className="text-sm font-medium text-slate-700">No notes yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                        Add a quick reminder for everyone at home
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {pinnedNote && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-amber-700 font-bold">
                                <Pin className="h-3.5 w-3.5" />
                                Pinned note
                            </div>

                            <div className="relative rounded-2xl border border-amber-300 bg-gradient-to-br from-yellow-100 to-amber-100 p-4 shadow-sm">
                                <div className="absolute right-3 top-3">
                                    <Pin className="h-4 w-4 text-amber-700 fill-amber-700/20" />
                                </div>

                                <p className="pr-8 text-sm text-slate-800 font-medium leading-relaxed whitespace-pre-wrap break-words">
                                    {pinnedNote.text}
                                </p>

                                <div className="mt-4 flex items-center gap-2">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => handleTogglePin(pinnedNote)}
                                        disabled={busyNoteId === pinnedNote.id}
                                        className="rounded-full"
                                    >
                                        {busyNoteId === pinnedNote.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <>
                                                <PinOff className="h-4 w-4 mr-1" />
                                                Unpin
                                            </>
                                        )}
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteNote(pinnedNote.id)}
                                        disabled={busyNoteId === pinnedNote.id}
                                        className="rounded-full text-destructive hover:text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {otherNotes.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {otherNotes.map((note, index) => (
                                <div
                                    key={note.id}
                                    className={cn(
                                        "relative rounded-2xl border p-4 shadow-sm transition-all",
                                        "bg-yellow-50 border-yellow-200 hover:shadow-md hover:-translate-y-0.5"
                                    )}
                                    style={{
                                        transform:
                                            index % 2 === 0 ? "rotate(-0.6deg)" : "rotate(0.6deg)",
                                    }}
                                >
                                    <p className="text-sm text-slate-800 font-medium leading-relaxed whitespace-pre-wrap break-words min-h-[72px]">
                                        {note.text}
                                    </p>

                                    <div className="mt-4 flex items-center justify-between">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleTogglePin(note)}
                                            disabled={busyNoteId === note.id}
                                            className="h-8 px-3 rounded-full text-amber-700 hover:text-amber-800 hover:bg-amber-100"
                                        >
                                            {busyNoteId === note.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <Pin className="h-4 w-4 mr-1" />
                                                    Pin
                                                </>
                                            )}
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDeleteNote(note.id)}
                                            disabled={busyNoteId === note.id}
                                            className="h-8 w-8 rounded-full text-slate-500 hover:text-destructive hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}