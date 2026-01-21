import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as tf from '@tensorflow/tfjs';
import { fetchProducts } from "@/api/productApi";
import { addInventoryItem } from "@/api/inventoryApi";
import { installationService } from "@/services/installationService";
import { toast } from "sonner";
import type { Product } from "@/types/product";

/**
 * CONFIGURATION & CONSTANTS
 */
const LABELS = [
    "Dove Body Wash",
    "Eggs L",
    "Lenor Unstoppables",
    "Milk 3% Tnuva",
    "Paper Towels",
    "Techina",
    "Whipping Cream"
];

const MODEL_PATH = '/model/model.json';
const INPUT_RESOLUTION = 640;

tf.env().set('DEBUG', false);

/**
 * INTERFACES
 */
interface ScannerProps {
    onItemAdded?: () => void;
}

interface Detection {
    bbox: [number, number, number, number];
    score: number;
    classId: number;
    label: string;
}

interface MatchedItem {
    product: Product;
    count: number;
}

/**
 * CUSTOM HOOK: useYoloInference
 */
const useYoloInference = () => {
    const [model, setModel] = useState<tf.GraphModel | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initializeEngine = async () => {
            try {
                await tf.ready();
                const absoluteModelUrl = `${window.location.origin}${MODEL_PATH}`;
                const yolomodel = await tf.loadGraphModel(absoluteModelUrl);
                setModel(yolomodel);
                setIsLoading(false);
            } catch (e) {
                console.error("AI Engine Error:", e);
                toast.error("Failed to initialize AI model");
            }
        };
        initializeEngine();
    }, []);

    const processOutput = useCallback((res: tf.Tensor) => {
        return tf.tidy(() => {
            const transRes = res.transpose([0, 2, 1]);
            const boxes = tf
                .slice(transRes, [0, 0, 0], [-1, -1, 4])
                .reshape([-1, 4]) as tf.Tensor2D;

            const scores = tf
                .max(tf.slice(transRes, [0, 0, 4], [-1, -1, -1]), 2)
                .reshape([-1]) as tf.Tensor1D;

            const classes = tf
                .argMax(tf.slice(transRes, [0, 0, 4], [-1, -1, -1]), 2)
                .reshape([-1]) as tf.Tensor1D;

            return { boxes, scores, classes };
        });
    }, []);

    return { model, isLoading, processOutput };
};

/**
 * MAIN COMPONENT: Scanner
 */
export const Scanner: React.FC<ScannerProps> = ({ onItemAdded }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [dbProducts, setDbProducts] = useState<Product[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [currentDetections, setCurrentDetections] = useState<Detection[]>([]);
    const [sessionHistory, setSessionHistory] = useState<{ name: string; count: number }[]>([]);
    const [showSuccessUI, setShowSuccessUI] = useState(false);

    const { model, isLoading: isModelLoading, processOutput } = useYoloInference();

    /**
     * LOAD PRODUCT CATALOG
     */
    useEffect(() => {
        fetchProducts()
            .then(setDbProducts)
            .catch(() => toast.error("Catalog sync failed"));
    }, []);

    /**
     * INFERENCE LOOP
     */
    const detectFrame = useCallback(async () => {
        if (!model || !videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (!ctx || video.videoWidth === 0) {
            requestAnimationFrame(detectFrame);
            return;
        }

        canvas.width = video.offsetWidth;
        canvas.height = video.offsetHeight;

        const input = tf.tidy(() =>
            tf.browser
                .fromPixels(video)
                .resizeNearestNeighbor([INPUT_RESOLUTION, INPUT_RESOLUTION])
                .toFloat()
                .div(255)
                .expandDims(0)
        );

        try {
            const res = model.execute(input) as tf.Tensor;
            const { boxes, scores, classes } = processOutput(res);

            const nms = await tf.image.nonMaxSuppressionAsync(
                boxes,
                scores,
                20,
                0.5,
                0.4
            );

            const b = await boxes.gather(nms).data();
            const s = await scores.gather(nms).data();
            const c = await classes.gather(nms).data();

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const scaleX = canvas.width / INPUT_RESOLUTION;
            const scaleY = canvas.height / INPUT_RESOLUTION;

            const detections: Detection[] = [];

            for (let i = 0; i < s.length; i++) {
                const [y1, x1, y2, x2] = b.slice(i * 4, (i + 1) * 4);

                const det: Detection = {
                    bbox: [
                        x1 * scaleX,
                        y1 * scaleY,
                        (x2 - x1) * scaleX,
                        (y2 - y1) * scaleY
                    ],
                    score: s[i],
                    classId: c[i] as number,
                    label: LABELS[c[i] as number]
                };

                detections.push(det);

                ctx.strokeStyle = '#22c55e';
                ctx.lineWidth = 3;
                ctx.strokeRect(...det.bbox);
                ctx.fillStyle = '#22c55e';
                ctx.font = 'bold 12px sans-serif';
                ctx.fillText(det.label, det.bbox[0], Math.max(det.bbox[1] - 5, 14));
            }

            setCurrentDetections(detections);
            tf.dispose([res, boxes, scores, classes, nms]);
        } catch (err) {
            console.error("Inference error:", err);
        } finally {
            tf.dispose(input);
            requestAnimationFrame(detectFrame);
        }
    }, [model, processOutput]);

    /**
     * CAMERA LIFECYCLE
     */
    useEffect(() => {
        if (!model) return;

        let stream: MediaStream | null = null;

        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' }
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => detectFrame();
                }
            } catch {
                toast.error("Camera access denied");
            }
        };

        startCamera();
        return () => stream?.getTracks().forEach(t => t.stop());
    }, [model, detectFrame]);

    /**
     * MATCH DETECTIONS TO PRODUCTS
     */
    const matchedItems = useMemo(() => {
        const matches: MatchedItem[] = [];

        currentDetections.forEach(det => {
            const product = dbProducts.find(p =>
                p.name.toLowerCase().includes(det.label.toLowerCase()) ||
                det.label.toLowerCase().includes(p.name.toLowerCase())
            );

            if (!product) return;

            const existing = matches.find(m => m.product.id === product.id);
            if (existing) existing.count++;
            else matches.push({ product, count: 1 });
        });

        return matches;
    }, [currentDetections, dbProducts]);

    /**
     * SYNC TO INVENTORY
     */
    const handleSync = async () => {
        if (matchedItems.length === 0 || isSaving) return;

        setIsSaving(true);
        try {
            const installationId = installationService.getId() || "";

            await Promise.all(
                matchedItems.map(item =>
                    addInventoryItem({
                        installationId,
                        productId: item.product.id,
                        productName: item.product.name,
                        quantity: item.count,
                        notes: "AI Scan"
                    })
                )
            );

            setShowSuccessUI(true);
            setTimeout(() => setShowSuccessUI(false), 2000);

            setSessionHistory(prev => {
                const next = [...prev];
                matchedItems.forEach(m => {
                    const idx = next.findIndex(i => i.name === m.product.name);
                    if (idx > -1) next[idx].count += m.count;
                    else next.push({ name: m.product.name, count: m.count });
                });
                return next;
            });

            onItemAdded?.();
            toast.success("Inventory updated");
        } catch {
            toast.error("Sync failed");
        } finally {
            setIsSaving(false);
        }
    };

    /**
     * UI
     */
    return (
        <div className="flex flex-col items-center p-4 bg-slate-900 min-h-screen text-white">
            <div className="w-full max-w-lg bg-slate-800 rounded-3xl p-6 shadow-2xl border border-slate-700">
                <h2 className="text-lg font-light tracking-widest uppercase mb-6">
                    Vision Scanner
                </h2>

                <div className="relative rounded-2xl overflow-hidden aspect-square bg-black mb-6">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <canvas
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full pointer-events-none"
                    />

                    {(isModelLoading || isSaving) && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
                            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mb-3" />
                            <p className="text-xs uppercase tracking-widest text-green-500">
                                {isSaving ? "Syncing…" : "Loading Model…"}
                            </p>
                        </div>
                    )}

                    {showSuccessUI && (
                        <div className="absolute top-4 inset-x-0 flex justify-center">
                            <div className="bg-green-500 text-black px-6 py-2 rounded-full font-bold">
                                Added to Inventory
                            </div>
                        </div>
                    )}
                </div>

                {matchedItems.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                        {matchedItems.map((m, i) => (
                            <span
                                key={i}
                                className="bg-green-500/10 border border-green-500/30 text-green-400 text-[10px] px-3 py-1 rounded-full font-bold"
                            >
                                {m.count}× {m.product.name}
                            </span>
                        ))}
                    </div>
                )}

                <button
                    onClick={handleSync}
                    disabled={matchedItems.length === 0 || isSaving || isModelLoading}
                    className={`w-full py-4 rounded-2xl font-bold uppercase tracking-widest ${matchedItems.length > 0 && !isSaving
                            ? "bg-green-600 hover:bg-green-500"
                            : "bg-slate-700 text-slate-500 cursor-not-allowed"
                        }`}
                >
                    {isSaving ? "Updating…" : matchedItems.length ? "Confirm Scan" : "Scanning…"}
                </button>

                <div className="mt-8 pt-6 border-t border-slate-700">
                    <div className="flex justify-between mb-3">
                        <span className="text-xs text-slate-500 uppercase tracking-widest">
                            Session Summary
                        </span>
                        <span className="text-xs text-green-500">
                            {sessionHistory.reduce((a, b) => a + b.count, 0)} items
                        </span>
                    </div>

                    <div className="space-y-2 max-h-40 overflow-y-auto">
                        {sessionHistory.length === 0 ? (
                            <p className="text-slate-500 text-xs italic">No items synced yet.</p>
                        ) : (
                            sessionHistory.map((item, i) => (
                                <div
                                    key={i}
                                    className="flex justify-between bg-slate-900/40 p-2 rounded-lg"
                                >
                                    <span className="text-xs">{item.name}</span>
                                    <span
                                        className={`text-xs font-bold ${item.count > 0 ? "text-green-500" : "text-red-400"
                                            }`}
                                    >
                                        {item.count > 0 ? `+${item.count}` : item.count}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
