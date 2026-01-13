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

// Disable TFJS warnings in console
tf.env().set('DEBUG', false);

export const Scanner: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [model, setModel] = useState<tf.GraphModel | null>(null);
    const [loading, setLoading] = useState(true);
    const [predictionCount, setPredictionCount] = useState(0);

    useEffect(() => {
        const loadModel = async () => {
            try {
                await tf.ready();
                // Ensure the path matches your public folder structure
                const yolomodel = await tf.loadGraphModel('/model/model.json');
                setModel(yolomodel);
                setLoading(false);
                console.log("🚀 AI Model loaded successfully!");
            } catch (e) {
                console.error("❌ Error loading model:", e);
            }
        };
        loadModel();
    }, []);

    useEffect(() => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({
                audio: false,
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            }).then(stream => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                        detectFrame();
                    };
                }
            }).catch(err => console.error("Camera access error:", err));
        }
    }, [model]);

    const detectFrame = async () => {
        if (!model || !videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (ctx && video.videoWidth > 0) {
            // Match canvas size to video stream size
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const input = tf.tidy(() => {
                return tf.browser.fromPixels(video)
                    .resizeNearestNeighbor([640, 640])
                    .toFloat()
                    .div(255.0)
                    .expandDims(0);
            });

            // Using execute instead of executeAsync to avoid control flow warnings
            const res = model.execute(input) as tf.Tensor;
            const predictions = await processOutput(res);

            setPredictionCount(predictions.length);
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            predictions.forEach(pred => {
                const [x, y, w, h] = pred.bbox;

                // Scale coordinates from 640x640 to actual canvas size
                // YOLOv8 usually returns normalized coordinates [0, 1] 
                // but if yours are [0, 640], we divide by 640 first
                const scaleX = canvas.width / 640;
                const scaleY = canvas.height / 640;

                const rectX = x * scaleX;
                const rectY = y * scaleY;
                const rectW = w * scaleX;
                const rectH = h * scaleY;

                // Draw Bounding Box
                ctx.strokeStyle = '#00FF00';
                ctx.lineWidth = 4;
                ctx.strokeRect(rectX, rectY, rectW, rectH);

                // Draw Label Background
                const label = LABELS[pred.classId] || "Unknown";
                const score = Math.round(pred.score * 100);
                const text = `${label} (${score}%)`;

                ctx.font = 'bold 20px Arial';
                const textWidth = ctx.measureText(text).width;

                ctx.fillStyle = '#00FF00';
                ctx.fillRect(rectX, rectY - 30, textWidth + 10, 30);

                // Draw Text
                ctx.fillStyle = 'black';
                ctx.fillText(text, rectX + 5, rectY - 8);
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

        const nmsIndices = await tf.image.nonMaxSuppressionAsync(
            processedData.boxes,
            processedData.scores,
            15,    // Max objects
            0.45,  // IOU threshold
            0.35   // Score threshold
        );

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
            results.push({
                bbox: [x1, y1, x2 - x1, y2 - y1],
                score: selectedScores[i],
                classId: selectedClasses[i],
            });
        }

        return results;
    };

    return (
        <div className="flex flex-col items-center p-4 bg-gray-900 min-h-screen font-sans">
            <div className="bg-white/10 p-6 rounded-3xl shadow-xl border border-white/20 backdrop-blur-md w-full max-w-lg">
                <h2 className="text-white text-center text-2xl mb-6 font-light tracking-widest uppercase">AI Inventory Scanner</h2>

                <div className="relative rounded-2xl overflow-hidden aspect-video bg-black shadow-inner border border-gray-700">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="absolute inset-0 w-full h-full object-cover z-10"
                    />
                    <canvas
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full pointer-events-none z-20"
                    />

                    {loading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-30">
                            <div className="w-12 h-12 border-4 border-t-green-500 border-gray-600 rounded-full animate-spin mb-4"></div>
                            <p className="text-white text-sm animate-pulse">Initializing AI Neural Network...</p>
                        </div>
                    )}
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                        <p className="text-gray-400 text-xs uppercase">Detected Items</p>
                        <p className="text-white text-lg font-bold">{predictionCount}</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                        <p className="text-gray-400 text-xs uppercase">Engine Status</p>
                        <p className="text-green-400 text-lg font-bold">{loading ? 'Warming Up' : 'Active'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};