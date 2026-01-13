import React, { useRef, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';

const LABELS = [
    "DoveRefreshing body wash cucumber",
    "Eggs L",
    "Lenor Unstoppables Perfume Pearls Ariel Scent 495gr",
    "Milk 3 Tnuva",
    "Paper Towels Rami Levy",
    "Techina Yerushalayim 500gr",
    "Whipping Cream 38 Tnuva"
];

tf.env().set('DEBUG', false);

export const Scanner: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [model, setModel] = useState<tf.GraphModel | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeDetection, setActiveDetection] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        const loadModel = async () => {
            try {
                await tf.ready();
                const yolomodel = await tf.loadGraphModel('/model/model.json');
                setModel(yolomodel);
                setLoading(false);
            } catch (e) {
                console.error("Model error:", e);
            }
        };
        loadModel();
    }, []);

    useEffect(() => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({
                audio: false,
                video: { facingMode: 'environment' }
            }).then(stream => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => detectFrame();
                }
            });
        }
    }, [model]);

    const handleAddToInventory = async () => {
        if (!activeDetection || isAdding) return;

        setIsAdding(true);
        try {
            // כאן תבוא הקריאה ל-API שלך או לעדכון ה-State הגלובלי של הרשימה
            console.log(`Adding ${activeDetection} to inventory...`);

            // סימולציה של הצלחה
            alert(`${activeDetection} added to your list!`);

        } catch (error) {
            console.error("Failed to add item:", error);
        } finally {
            setIsAdding(false);
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

            const input = tf.tidy(() => {
                return tf.browser.fromPixels(video)
                    .resizeNearestNeighbor([640, 640])
                    .toFloat()
                    .div(255.0)
                    .expandDims(0);
            });

            const res = model.execute(input) as tf.Tensor;
            const predictions = await processOutput(res);

            // עדכון המוצר המזוהה ביותר (זה עם הציון הכי גבוה)
            if (predictions.length > 0) {
                setActiveDetection(LABELS[predictions[0].classId]);
            } else {
                setActiveDetection(null);
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            predictions.forEach(pred => {
                const [x, y, w, h] = pred.bbox;
                const scaleX = canvas.width / 640;
                const scaleY = canvas.height / 640;

                const rectX = x * scaleX;
                const rectY = y * scaleY;
                const rectW = w * scaleX;
                const rectH = h * scaleY;

                ctx.strokeStyle = '#00FF00';
                ctx.lineWidth = 4;
                ctx.strokeRect(rectX, rectY, rectW, rectH);
            });

            tf.dispose(res);
            tf.dispose(input);
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

        const nmsIndices = await tf.image.nonMaxSuppressionAsync(processedData.boxes, processedData.scores, 5, 0.5, 0.4);
        const selectedBoxes = await processedData.boxes.gather(nmsIndices).data();
        const selectedScores = await processedData.scores.gather(nmsIndices).data();
        const selectedClasses = await processedData.classes.gather(nmsIndices).data();

        processedData.boxes.dispose();
        processedData.scores.dispose();
        processedData.classes.dispose();
        nmsIndices.dispose();

        const results = [];
        for (let i = 0; i < selectedScores.length; i++) {
            const [y1, x1, y2, x2] = selectedBoxes.slice(i * 4, (i + 1) * 4);
            results.push({ bbox: [x1, y1, x2 - x1, y2 - y1], score: selectedScores[i], classId: selectedClasses[i] });
        }
        return results;
    };

    return (
        <div className="flex flex-col items-center p-4 bg-gray-900 min-h-screen font-sans text-white">
            <div className="bg-white/10 p-6 rounded-3xl shadow-xl border border-white/20 backdrop-blur-md w-full max-w-lg">
                <h2 className="text-center text-xl mb-6 font-light tracking-widest uppercase">Smart Inventory</h2>

                <div className="relative rounded-2xl overflow-hidden aspect-square bg-black shadow-inner border border-gray-700">
                    <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />
                    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-30" />

                    {/* כפתור הוספה צף שמופיע בזיהוי */}
                    {activeDetection && !loading && (
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center z-40 px-4 animate-bounce">
                            <button
                                onClick={handleAddToInventory}
                                disabled={isAdding}
                                className="bg-green-500 hover:bg-green-600 text-black font-bold py-3 px-6 rounded-full shadow-2xl flex items-center gap-2 transition-all active:scale-95"
                            >
                                {isAdding ? 'Adding...' : `Add ${activeDetection}`}
                            </button>
                        </div>
                    )}

                    {loading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-50">
                            <div className="w-12 h-12 border-4 border-t-green-500 border-gray-600 rounded-full animate-spin mb-4"></div>
                            <p className="text-sm">Warming up AI...</p>
                        </div>
                    )}
                </div>

                <div className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                    <p className="text-gray-400 text-xs uppercase mb-1">Current Detection</p>
                    <p className="text-lg font-medium text-green-400">
                        {activeDetection ? activeDetection : 'Point at a product...'}
                    </p>
                </div>
            </div>
        </div>
    );
};