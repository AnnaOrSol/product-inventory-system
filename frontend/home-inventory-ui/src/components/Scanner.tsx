import React, { useRef, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import { fetchProducts } from "@/api/productApi";
import { addInventoryItem } from "@/api/inventoryApi";
import { installationService } from "@/services/installationService";
import { toast } from "sonner";
import type { Product } from "@/types/product";

const LABELS = [
    "Dove Body Wash", "Eggs L", "Lenor Unstoppables",
    "Milk 3% Tnuva", "Paper Towels", "Techina", "Whipping Cream"
];

tf.env().set('DEBUG', false);

interface ScannerProps {
    onItemAdded?: () => void;
}

export const Scanner: React.FC<ScannerProps> = ({ onItemAdded }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [model, setModel] = useState<tf.GraphModel | null>(null);
    const [dbProducts, setDbProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [currentDetections, setCurrentDetections] = useState<any[]>([]);
    const [inventory, setInventory] = useState<{ name: string, count: number }[]>([]);
    const [showSuccess, setShowSuccess] = useState(false);

    // Initial Load: Model + DB Products
    useEffect(() => {
        const initialize = async () => {
            try {
                await tf.ready();
                const [yolomodel, productsData] = await Promise.all([
                    tf.loadGraphModel('/model/model.json'),
                    fetchProducts()
                ]);
                setModel(yolomodel);
                setDbProducts(productsData);
                setLoading(false);
            } catch (e) {
                console.error("Initialization error:", e);
                toast.error("Failed to load scanner or products");
            }
        };
        initialize();
    }, []);

    // Camera Setup
    useEffect(() => {
        if (navigator.mediaDevices?.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
                .then(stream => {
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        videoRef.current.onloadedmetadata = () => detectFrame();
                    }
                });
        }
    }, [model]);

    // Matches what the AI sees with your actual Database Products
    const getMatchedItems = () => {
        const matches: { product: Product; count: number }[] = [];

        currentDetections.forEach(det => {
            const aiLabel = LABELS[det.classId];
            const found = dbProducts.find(p =>
                p.name.toLowerCase().includes(aiLabel.toLowerCase()) ||
                aiLabel.toLowerCase().includes(p.name.toLowerCase())
            );

            if (found) {
                const existing = matches.find(m => m.product.id === found.id);
                if (existing) {
                    existing.count += 1;
                } else {
                    matches.push({ product: found, count: 1 });
                }
            }
        });
        return matches;
    };

    const addAllToInventory = async () => {
        const matches = getMatchedItems();
        if (matches.length === 0 || isSaving) return;

        setIsSaving(true);
        try {
            for (const item of matches) {
                const payload = {
                    installationId: installationService.getId() || "",
                    productId: item.product.id,
                    productName: item.product.name,
                    quantity: item.count,
                    notes: "Added via Multi-Scanner",
                };
                await addInventoryItem(payload);
            }

            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);

            // Sync Session Inventory View
            setInventory(prev => {
                const updated = [...prev];
                matches.forEach(m => {
                    const idx = updated.findIndex(u => u.name === m.product.name);
                    if (idx > -1) updated[idx].count += m.count;
                    else updated.push({ name: m.product.name, count: m.count });
                });
                return updated;
            });

            if (onItemAdded) onItemAdded();
            toast.success(`Successfully saved ${matches.length} types of items`);
        } catch (error) {
            console.error("Save error:", error);
            toast.error("Failed to save items to database");
        } finally {
            setIsSaving(false);
        }
    };

    const detectFrame = async () => {
        if (!model || !videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (ctx && video.videoWidth > 0) {
            canvas.width = video.offsetWidth;
            canvas.height = video.offsetHeight;

            const input = tf.tidy(() => tf.browser.fromPixels(video).resizeNearestNeighbor([640, 640]).toFloat().div(255.0).expandDims(0));
            const res = model.execute(input) as tf.Tensor;
            const predictions = await processOutput(res);

            setCurrentDetections(predictions);

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            predictions.forEach(pred => {
                const [x, y, w, h] = pred.bbox;
                const scaleX = canvas.width / 640;
                const scaleY = canvas.height / 640;
                const rectX = x * scaleX; const rectY = y * scaleY;
                const rectW = w * scaleX; const rectH = h * scaleY;

                ctx.strokeStyle = '#22c55e';
                ctx.lineWidth = 3;
                ctx.strokeRect(rectX, rectY, rectW, rectH);
                ctx.fillStyle = '#22c55e';
                ctx.font = 'bold 12px sans-serif';
                ctx.fillText(LABELS[pred.classId], rectX, rectY > 20 ? rectY - 5 : 20);
            });

            tf.dispose([res, input]);
        }
        requestAnimationFrame(detectFrame);
    };

    const processOutput = async (res: tf.Tensor) => {
        const processedData = tf.tidy(() => {
            const transRes = res.transpose([0, 2, 1]);
            const boxes = tf.slice(transRes, [0, 0, 0], [-1, -1, 4]);
            const scores = tf.max(tf.slice(transRes, [0, 0, 4], [-1, -1, -1]), 2);
            const classes = tf.argMax(tf.slice(transRes, [0, 0, 4], [-1, -1, -1]), 2);
            return {
                boxes: boxes.reshape([-1, 4]) as tf.Tensor2D,
                scores: scores.reshape([-1]) as tf.Tensor1D,
                classes: classes.reshape([-1]) as tf.Tensor1D
            };
        });

        const nmsIndices = await tf.image.nonMaxSuppressionAsync(processedData.boxes, processedData.scores, 20, 0.5, 0.4);
        const selectedBoxes = await processedData.boxes.gather(nmsIndices).data();
        const selectedScores = await processedData.scores.gather(nmsIndices).data();
        const selectedClasses = await processedData.classes.gather(nmsIndices).data();

        processedData.boxes.dispose(); processedData.scores.dispose();
        processedData.classes.dispose(); nmsIndices.dispose();

        const results = [];
        for (let i = 0; i < selectedScores.length; i++) {
            const [y1, x1, y2, x2] = selectedBoxes.slice(i * 4, (i + 1) * 4);
            results.push({ bbox: [x1, y1, x2 - x1, y2 - y1], score: selectedScores[i], classId: selectedClasses[i] });
        }
        return results;
    };

    const matchedPreview = getMatchedItems();

    return (
        <div className="flex flex-col items-center p-4 bg-slate-900 min-h-screen text-white font-sans">
            <div className="w-full max-w-lg bg-slate-800 rounded-3xl p-6 shadow-2xl border border-slate-700">
                <h2 className="text-center text-xl font-light tracking-widest mb-6 uppercase">Multi-Scanner Pro</h2>

                <div className="relative rounded-2xl overflow-hidden aspect-square bg-black mb-6 border border-slate-600">
                    <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />
                    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-10" />

                    {loading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 z-20">
                            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-xs uppercase tracking-widest">Syncing Data...</p>
                        </div>
                    )}

                    {showSuccess && (
                        <div className="absolute top-4 inset-x-0 flex justify-center z-20">
                            <div className="bg-green-500 text-black px-6 py-2 rounded-full font-bold shadow-lg animate-bounce">
                                Items Added!
                            </div>
                        </div>
                    )}
                </div>

                {/* PREVIEW LIST - Real-time matching confirmation */}
                {matchedPreview.length > 0 && (
                    <div className="mb-4 space-y-2 animate-in fade-in slide-in-from-bottom-2">
                        <p className="text-[10px] uppercase text-slate-400 font-bold ml-1">Detected Ready to Add:</p>
                        <div className="flex flex-wrap gap-2">
                            {matchedPreview.map((m, idx) => (
                                <div key={idx} className="bg-green-500/10 border border-green-500/30 text-green-400 text-[11px] px-3 py-1 rounded-full flex items-center gap-2">
                                    <span className="font-bold">{m.count}x</span>
                                    <span className="truncate max-w-[100px]">{m.product.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <button
                    onClick={addAllToInventory}
                    disabled={matchedPreview.length === 0 || isSaving || loading}
                    className={`w-full py-4 rounded-2xl font-bold transition-all active:scale-95 mb-6 ${matchedPreview.length > 0 && !isSaving ? 'bg-green-600 hover:bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]' : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        }`}
                >
                    {isSaving ? "Saving..." :
                        matchedPreview.length > 0 ? `Confirm & Add ${matchedPreview.reduce((a, b) => a + b.count, 0)} Items` :
                            "Searching for Products..."}
                </button>

                <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-700/50">
                    <div className="flex justify-between mb-3 border-b border-white/5 pb-2">
                        <span className="text-[10px] uppercase text-slate-400 tracking-widest">Session Log</span>
                        <span className="text-xs text-green-400 font-bold">{inventory.reduce((a, b) => a + b.count, 0)} Total</span>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                        {inventory.length === 0 ? (
                            <p className="text-slate-500 text-xs italic py-2">No items added this session.</p>
                        ) : (
                            inventory.map((item, i) => (
                                <div key={i} className="flex justify-between items-center bg-slate-800/40 p-2 rounded-lg border border-white/5">
                                    <span className="text-xs font-medium text-slate-200">{item.name}</span>
                                    <span className="text-green-500 text-[10px] font-bold bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">+{item.count}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};