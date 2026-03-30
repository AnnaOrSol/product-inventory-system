import { useEffect, useMemo, useRef, useState } from "react";
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

type DisplayNote = Note & {
    _virtualKey: string;
    _sourceIndex: number;
};

const CARD_WIDTH = 208;
const CARD_GAP = 12;
const CARD_FULL_WIDTH = CARD_WIDTH + CARD_GAP;
const AUTO_RETURN_DELAY = 3500;

export function HomeNotes() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [newNoteText, setNewNoteText] = useState("");
    const [showComposer, setShowComposer] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [busyNoteId, setBusyNoteId] = useState<number | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const carouselRef = useRef<HTMLDivElement | null>(null);
    const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isAdjustingRef = useRef(false);

    const sortedNotes = useMemo(() => {
        const pinned = notes.filter((note) => note.pinned);
        const unpinned = notes.filter((note) => !note.pinned);
        return [...pinned, ...unpinned];
    }, [notes]);

    const displayNotes = useMemo<DisplayNote[]>(() => {
        if (sortedNotes.length === 0) return [];
        if (sortedNotes.length === 1) {
            return [
                {
                    ...sortedNotes[0],
                    _virtualKey: `only-${sortedNotes[0].id}`,
                    _sourceIndex: 0,
                },
            ];
        }

        const first = sortedNotes[0];
        const last = sortedNotes[sortedNotes.length - 1];

        return [
            {
                ...last,
                _virtualKey: `clone-start-${last.id}`,
                _sourceIndex: sortedNotes.length - 1,
            },
            ...sortedNotes.map((note, index) => ({
                ...note,
                _virtualKey: `real-${note.id}`,
                _sourceIndex: index,
            })),
            {
                ...first,
                _virtualKey: `clone-end-${first.id}`,
                _sourceIndex: 0,
            },
        ];
    }, [sortedNotes]);

    const clearResetTimer = () => {
        if (resetTimerRef.current) {
            clearTimeout(resetTimerRef.current);
            resetTimerRef.current = null;
        }
    };

    const scheduleReturnToStart = () => {
        clearResetTimer();

        resetTimerRef.current = setTimeout(() => {
            if (!carouselRef.current || sortedNotes.length === 0) return;

            const targetIndex = sortedNotes.length > 1 ? 1 : 0;
            carouselRef.current.scrollTo({
                left: targetIndex * CARD_FULL_WIDTH,
                behavior: "smooth",
            });
        }, AUTO_RETURN_DELAY);
    };

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

    useEffect(() => {
        if (!carouselRef.current || displayNotes.length === 0) return;

        requestAnimationFrame(() => {
            if (!carouselRef.current) return;

            const initialIndex = sortedNotes.length > 1 ? 1 : 0;
            carouselRef.current.scrollTo({
                left: initialIndex * CARD_FULL_WIDTH,
                behavior: "auto",
            });
            setActiveIndex(0);
            scheduleReturnToStart();
        });
    }, [displayNotes.length, sortedNotes.length]);

    useEffect(() => {
        return () => {
            clearResetTimer();
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
        };
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

    const updateActiveIndexFromScroll = () => {
        if (!carouselRef.current || sortedNotes.length === 0) return;

        const scrollLeft = carouselRef.current.scrollLeft;
        const rawIndex = Math.round(scrollLeft / CARD_FULL_WIDTH);

        if (sortedNotes.length === 1) {
            setActiveIndex(0);
            return;
        }

        if (rawIndex <= 0) {
            setActiveIndex(sortedNotes.length - 1);
        } else if (rawIndex >= displayNotes.length - 1) {
            setActiveIndex(0);
        } else {
            setActiveIndex(rawIndex - 1);
        }
    };

    const adjustInfiniteLoopIfNeeded = () => {
        if (!carouselRef.current || sortedNotes.length <= 1) return;
        if (isAdjustingRef.current) return;

        const el = carouselRef.current;
        const rawIndex = Math.round(el.scrollLeft / CARD_FULL_WIDTH);

        if (rawIndex === 0) {
            isAdjustingRef.current = true;
            el.scrollTo({
                left: sortedNotes.length * CARD_FULL_WIDTH,
                behavior: "auto",
            });
            requestAnimationFrame(() => {
                isAdjustingRef.current = false;
                updateActiveIndexFromScroll();
            });
        } else if (rawIndex === displayNotes.length - 1) {
            isAdjustingRef.current = true;
            el.scrollTo({
                left: CARD_FULL_WIDTH,
                behavior: "auto",
            });
            requestAnimationFrame(() => {
                isAdjustingRef.current = false;
                updateActiveIndexFromScroll();
            });
        }
    };

    const handleCarouselInteraction = () => {
        scheduleReturnToStart();

        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }

        scrollTimeoutRef.current = setTimeout(() => {
            adjustInfiniteLoopIfNeeded();
        }, 120);
    };

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl">
                        <StickyNote className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            Notes
                        </h2>
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
                <div className="animate-in slide-in-from-top-2 rounded-2xl border border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50 p-3 shadow-sm">
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
                            className="border-yellow-200 bg-white"
                            maxLength={140}
                        />
                        <Button
                            onClick={handleAddNote}
                            disabled={submitting || !newNoteText.trim()}
                            className="bg-yellow-500 text-white shadow-md hover:bg-yellow-600"
                        >
                            {submitting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <Plus className="mr-1 h-4 w-4" />
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
                <div className="overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <div className="flex gap-3">
                        {[1, 2, 3].map((skeleton) => (
                            <div
                                key={skeleton}
                                className="h-[136px] w-[208px] shrink-0 rounded-[28px] border border-yellow-100 bg-yellow-50/60 animate-pulse"
                            />
                        ))}
                    </div>
                </div>
            ) : sortedNotes.length === 0 ? (
                <div className="rounded-3xl border-2 border-dashed border-yellow-200 bg-yellow-50/40 px-6 py-12 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-100">
                        <Sparkles className="h-5 w-5 text-yellow-600" />
                    </div>
                    <p className="text-sm font-medium text-slate-700">
                        No notes yet
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Add a quick reminder for everyone at home
                    </p>
                </div>
            ) : (
                <div className="space-y-3">


                    <div
                        ref={carouselRef}
                        className="overflow-x-auto px-2 pb-4 pt-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                        style={{
                            scrollSnapType: "x mandatory",
                            WebkitOverflowScrolling: "touch",
                        }}
                        onScroll={() => {
                            updateActiveIndexFromScroll();
                            handleCarouselInteraction();
                        }}
                        onTouchStart={handleCarouselInteraction}
                        onMouseDown={handleCarouselInteraction}
                    >
                        <div className="flex gap-3">
                            {displayNotes.map((note, visualIndex) => {
                                const isActive =
                                    sortedNotes.length === 1
                                        ? true
                                        : note._sourceIndex === activeIndex;

                                return (
                                    <div
                                        key={note._virtualKey}
                                        className="shrink-0"
                                        style={{
                                            width: `${CARD_WIDTH}px`,
                                            scrollSnapAlign: "center",
                                        }}
                                    >
                                        <div
                                            className={cn(
                                                "flex min-h-[136px] flex-col rounded-[28px] border p-4 shadow-sm transition-all duration-300 ease-out",
                                                isActive
                                                    ? "scale-100 opacity-100 shadow-md"
                                                    : "scale-[0.9] opacity-70",
                                                note.pinned
                                                    ? "border-pink-200 bg-gradient-to-br from-pink-50 to-rose-100 shadow-pink-100/70"
                                                    : "border-yellow-200 bg-yellow-50"
                                            )}
                                        >
                                            <div className="mb-2 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    {note.pinned && (
                                                        <span className="rounded-full bg-pink-100 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-pink-700">
                                                            Pinned
                                                        </span>
                                                    )}
                                                </div>

                                                {note.pinned ? (
                                                    <Pin className="h-4 w-4 text-pink-600" />
                                                ) : (
                                                    <StickyNote className="h-4 w-4 text-yellow-600" />
                                                )}
                                            </div>

                                            <p className="flex-1 text-sm font-medium leading-relaxed text-slate-800 whitespace-pre-wrap break-words line-clamp-4">
                                                {note.text}
                                            </p>

                                            <div className="mt-4 flex items-center justify-between">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleTogglePin(note)}
                                                    disabled={busyNoteId === note.id}
                                                    className={cn(
                                                        "h-8 rounded-full px-3",
                                                        note.pinned
                                                            ? "text-pink-700 hover:bg-pink-100 hover:text-pink-800"
                                                            : "text-amber-700 hover:bg-amber-100 hover:text-amber-800"
                                                    )}
                                                >
                                                    {busyNoteId === note.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : note.pinned ? (
                                                        <>
                                                            <PinOff className="mr-1 h-4 w-4" />
                                                            Unpin
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Pin className="mr-1 h-4 w-4" />
                                                            Pin
                                                        </>
                                                    )}
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteNote(note.id)}
                                                    disabled={busyNoteId === note.id}
                                                    className="h-8 w-8 rounded-full text-slate-500 hover:bg-red-50 hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {sortedNotes.length > 1 && (
                        <div className="flex items-center justify-center gap-1.5">
                            {sortedNotes.map((note, index) => (
                                <div
                                    key={note.id}
                                    className={cn(
                                        "h-1.5 rounded-full transition-all duration-300",
                                        index === activeIndex
                                            ? note.pinned
                                                ? "w-5 bg-pink-400"
                                                : "w-5 bg-yellow-400"
                                            : "w-1.5 bg-slate-300"
                                    )}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}