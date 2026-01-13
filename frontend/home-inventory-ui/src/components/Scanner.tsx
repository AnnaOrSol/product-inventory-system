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

export const Scanner: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [model, setModel] = useState<tf.GraphModel | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadModel = async () => {
            try {
                await tf.ready();
                const yolomodel = await tf.loadGraphModel('/model/model.json');
                setModel(yolomodel);
                setLoading(false);
                console.log("🚀 model loaded successfully!");
            } catch (e) {
                console.error("❌error loading model:", e);
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

    const detectFrame = async () => {
        if (!model || !videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (ctx && video.videoWidth > 0) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const input = tf.tidy(() => {
                return tf.browser.fromPixels(video)
                    .resizeNearestNeighbor([640, 640])
                    .toFloat()
                    .div(255.0)
                    .expandDims(0);
            });

            const res = model.execute(input) as tf.Tensor;
            const predictions = await processOutput(res);
            console.log("Predictions found:", predictions.length);
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            predictions.forEach(pred => {
                const [x, y, w, h] = pred.bbox;
                const label = LABELS[pred.classId];

                ctx.strokeStyle = '#00FF00';
                ctx.lineWidth = 3;
                ctx.strokeRect(x * canvas.width, y * canvas.height, w * canvas.width, h * canvas.height);

                ctx.fillStyle = '#00FF00';
                ctx.font = 'bold 18px Arial';
                const text = `${label} (${Math.round(pred.score * 100)}%)`;
                ctx.fillRect(x * canvas.width, y * canvas.height - 25, ctx.measureText(text).width + 10, 25);
                ctx.fillStyle = 'black';
                ctx.fillText(text, x * canvas.width + 5, y * canvas.height - 7);
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
            20,
            0.5,
            0.4
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
                <h2 className="text-white text-center text-2xl mb-6 font-light tracking-widest uppercase">Inventory Scanner</h2>

                <div className="relative rounded-2xl overflow-hidden aspect-video bg-black shadow-inner border border-gray-700">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />

                    {loading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
                            <div className="w-12 h-12 border-4 border-t-green-500 border-gray-600 rounded-full animate-spin mb-4"></div>
                            <p className="text-white text-sm animate-pulse">Initializing AI Neural Network...</p>
                        </div>
                    )}
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                        <p className="text-gray-400 text-xs uppercase">Target Products</p>
                        <p className="text-white text-lg font-bold">{LABELS.length}</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                        <p className="text-gray-400 text-xs uppercase">Status</p>
                        <p className="text-green-400 text-lg font-bold">{loading ? 'Loading' : 'Live'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};