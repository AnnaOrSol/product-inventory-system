import { useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

interface BarcodeScannerProps {
    onScanSuccess: (decodedText: string) => void;
}

export function BarcodeScanner({ onScanSuccess }: BarcodeScannerProps) {
    const scannerRef = useRef<Html5Qrcode | null>(null);

    useEffect(() => {
        const scannerId = "reader";
        scannerRef.current = new Html5Qrcode(scannerId);

        const startScanner = async () => {
            try {
                const formatsToSupport = [
                    Html5QrcodeSupportedFormats.EAN_13,
                    Html5QrcodeSupportedFormats.EAN_8,
                    Html5QrcodeSupportedFormats.UPC_A,
                    Html5QrcodeSupportedFormats.UPC_E,
                    Html5QrcodeSupportedFormats.UPC_EAN_EXTENSION,
                    Html5QrcodeSupportedFormats.CODE_128,
                    Html5QrcodeSupportedFormats.QR_CODE
                ];

                await scannerRef.current?.start(
                    { facingMode: "environment" },
                    {
                        fps: 20,
                        qrbox: { width: 280, height: 150 },
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
                scannerRef.current.stop()
                    .then(() => scannerRef.current?.clear())
                    .catch(err => console.error("Failed to stop scanner", err));
            }
        };
    }, [onScanSuccess]);

    return (
        <div className="relative w-full max-w-sm mx-auto overflow-hidden rounded-xl border-2 border-primary/20 bg-black">
            <div id="reader" className="w-full h-[250px]"></div>
            <div className="absolute inset-0 pointer-events-none border-[2px] border-blue-500/50 m-16 rounded-lg shadow-[0_0_0_999px_rgba(0,0,0,0.5)]"></div>
        </div>
    );
}