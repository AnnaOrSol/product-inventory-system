import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface BarcodeScannerProps {
    onScanSuccess: (decodedText: string) => void;
}

export function BarcodeScanner({ onScanSuccess }: BarcodeScannerProps) {
    const scannerRef = useRef<Html5Qrcode | null>(null);

    useEffect(() => {
        scannerRef.current = new Html5Qrcode("reader");

        const startScanner = async () => {
            try {
                await scannerRef.current?.start(
                    { facingMode: "environment" },
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 150 },
                    },
                    (decodedText) => {
                        onScanSuccess(decodedText);
                    },
                    () => { }
                );
            } catch (err) {
                console.error("Failed to start scanner:", err);
            }
        };

        startScanner();

        return () => {
            if (scannerRef.current?.isScanning) {
                scannerRef.current.stop().then(() => {
                    scannerRef.current?.clear();
                }).catch(err => console.error("Failed to stop scanner", err));
            }
        };
    }, [onScanSuccess]);

    return (
        <div className="relative w-full max-w-sm mx-auto overflow-hidden rounded-xl border-2 border-primary/20 bg-black/5">
            <div id="reader" className="w-full h-[250px]"></div>
            <div className="absolute inset-0 pointer-events-none border-[2px] border-blue-500/50 m-12 rounded-lg shadow-[0_0_0_999px_rgba(0,0,0,0.4)]"></div>
            <p className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-white bg-black/50 py-1">
                Align barcode within the frame
            </p>
        </div>
    );
}