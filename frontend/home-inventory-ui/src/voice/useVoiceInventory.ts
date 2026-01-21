import { useEffect, useRef, useState } from "react";
import { addInventoryItem } from "@/api/inventoryApi";
import { installationService } from "@/services/installationService";
import { parseVoiceCommand } from "./voiceCommandParser";
import type { Product } from "@/types/product";
import { toast } from "sonner";

export const useVoiceInventory = (products: Product[]) => {
    const recognitionRef = useRef<any>(null);
    const [isListening, setIsListening] = useState(false);
    const [lastTranscript, setLastTranscript] = useState<string>("");

    useEffect(() => {
        const SpeechRecognition =
            (window as any).SpeechRecognition ||
            (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            toast.error("Voice recognition not supported");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = "he-IL";
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);

        recognition.onresult = async (event: any) => {
            const text = event.results[0][0].transcript;
            setLastTranscript(text);

            const parsed = parseVoiceCommand(text, products);

            if (!parsed.product) {
                toast.error("לא זיהיתי מוצר מוכר");
                return;
            }

            try {
                await addInventoryItem({
                    installationId: installationService.getId() || "",
                    productId: parsed.product.id,
                    productName: parsed.product.name,
                    quantity: parsed.quantity,
                    notes: `Voice: "${parsed.rawText}"`
                });

                toast.success(
                    `${parsed.quantity > 0 ? "נוסף" : "הוסר"} ${Math.abs(parsed.quantity)} ${parsed.product.name}`
                );
            } catch {
                toast.error("שגיאה בעדכון מלאי קולי");
            }
        };

        recognitionRef.current = recognition;
    }, [products]);

    const startListening = () => {
        setLastTranscript("");
        recognitionRef.current?.start();
    };

    const stopListening = () => {
        recognitionRef.current?.stop();
    };

    return {
        isListening,
        lastTranscript,
        startListening,
        stopListening
    };
};
