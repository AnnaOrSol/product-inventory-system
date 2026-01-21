import { Mic, MicOff, Volume2 } from "lucide-react";
import { useVoiceInventory } from "@/voice/useVoiceInventory";
import type { Product } from "@/types/product";

interface Props {
    products: Product[];
}

export const VoiceInventoryButton: React.FC<Props> = ({ products }) => {
    const {
        isListening,
        lastTranscript,
        startListening,
        stopListening
    } = useVoiceInventory(products);

    return (
        <div className="relative">
            <button
                onClick={isListening ? stopListening : startListening}
                className={`p-4 rounded-full shadow-xl transition-all ${isListening
                        ? "bg-red-500 animate-pulse"
                        : "bg-indigo-600 hover:bg-indigo-500"
                    }`}
            >
                {isListening ? <Mic size={22} /> : <MicOff size={22} />}
            </button>

            {isListening && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/70 px-3 py-1 rounded-full text-xs flex items-center gap-2">
                    <Volume2 size={12} className="animate-bounce" />
                    מאזין…
                </div>
            )}

            {lastTranscript && (
                <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-slate-900 text-[10px] px-3 py-1 rounded-lg">
                    "{lastTranscript}"
                </div>
            )}
        </div>
    );
};
